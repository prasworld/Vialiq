namespace Vialiq.Caching.Services;

using System;
using System.Security;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Vialiq.Caching.Abstractions;
using Vialiq.Caching.Constants;
using Vialiq.Core.Constants;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;

/// <summary>
/// Multi-tenant scoped cache implementation targeting Redis.
/// <para>
/// <b>CRITICAL ARCHITECTURAL BOUNDARY (ADR 007-A Decision 1.1):</b><br/>
/// Strictly restricted to invariant structural metadata (approved form schemas, rules ASTs, codelists, visit matrices, and reference dictionaries).
/// Live patient CRF responses, subject records, and clinical data entry are strictly banned from cache and are always fetched directly from MongoDB with per-request CSFLE.
/// </para>
/// </summary>
public sealed class ScopedCacheService : IScopedCacheService
{
    private readonly ITenantStudyContextAccessor _contextAccessor;
    private readonly IRedisConnectionFactory _redisFactory;
    private readonly ILogger<ScopedCacheService> _logger;
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromHours(1);

    /// <summary>
    /// Initializes a new instance of <see cref="ScopedCacheService"/>.
    /// </summary>
    /// <param name="contextAccessor">The ambient request context accessor providing tenant, study, and blinding context.</param>
    /// <param name="redisFactory">The Redis connection factory managing cache connections and pub/sub channels.</param>
    /// <param name="logger">The structured logger instance.</param>
    /// <exception cref="ArgumentNullException">Thrown when any required parameter is null.</exception>
    public ScopedCacheService(
        ITenantStudyContextAccessor contextAccessor,
        IRedisConnectionFactory redisFactory,
        ILogger<ScopedCacheService> logger)
    {
        _contextAccessor = contextAccessor ?? throw new ArgumentNullException(nameof(contextAccessor));
        _redisFactory = redisFactory ?? throw new ArgumentNullException(nameof(redisFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    public ValueTask<T> GetOrCreateStudyAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var scope = _contextAccessor.CurrentContext?.BlindingScope ?? BlindingScope.Blinded;
        return GetOrCreateStudyAsync(resource, key, scope, factory, ct);
    }

    /// <inheritdoc />
    public async ValueTask<T> GetOrCreateStudyAsync<T>(
        string resource, 
        string key, 
        BlindingScope scope,
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var context = _contextAccessor.CurrentContext;
        
        // FAIL-CLOSED: Absolute barrier against unauthenticated or missing tenant calls
        if (string.IsNullOrWhiteSpace(context?.TenantId) || string.IsNullOrWhiteSpace(context?.StudyId))
        {
            throw new SecurityException(InfrastructureErrorMessages.StudyCacheAccessDenied);
        }

        var scopeSegment = scope == BlindingScope.Unblinded 
            ? MongoClusterConstants.CacheSegments.Unblinded 
            : MongoClusterConstants.CacheSegments.Blinded;

        var versionSegment = !string.IsNullOrWhiteSpace(context.ProtocolVersion) 
            ? context.ProtocolVersion 
            : MongoClusterConstants.CacheSegments.Current;

        var fullyQualifiedKey = $"{MongoClusterConstants.CacheSegments.Vialiq}:{MongoClusterConstants.CacheSegments.Study}:{context.TenantId}:{context.StudyId}:{context.Environment}:{versionSegment}:{MongoClusterConstants.CacheSegments.Scope}:{scopeSegment}:{resource}:{key}";
        return await GetOrCreateInternalAsync(fullyQualifiedKey, factory, DefaultTtl, ct);
    }

    /// <inheritdoc />
    public async ValueTask<T> GetOrCreateClientLibraryAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var context = _contextAccessor.CurrentContext;
        
        if (string.IsNullOrWhiteSpace(context?.TenantId))
        {
            throw new SecurityException(InfrastructureErrorMessages.ClientLibraryCacheAccessDenied);
        }

        var fullyQualifiedKey = $"{MongoClusterConstants.CacheSegments.Vialiq}:{MongoClusterConstants.CacheSegments.Tenant}:{context.TenantId}:{MongoClusterConstants.CacheSegments.Lib}:{resource}:{key}";
        return await GetOrCreateInternalAsync(fullyQualifiedKey, factory, DefaultTtl, ct);
    }

    /// <inheritdoc />
    public async ValueTask<T> GetOrCreateGlobalAsync<T>(
        string dictionary, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var fullyQualifiedKey = $"{MongoClusterConstants.CacheSegments.Vialiq}:{MongoClusterConstants.CacheSegments.Global}:{MongoClusterConstants.CacheSegments.Standards}:{dictionary}:{key}";
        return await GetOrCreateInternalAsync(fullyQualifiedKey, factory, TimeSpan.FromDays(7), ct);
    }

    /// <inheritdoc />
    public async Task InvalidateStudyKeyAsync(string resource, string key, CancellationToken ct = default)
    {
        var context = _contextAccessor.CurrentContext;
        if (context == null) return;

        var versionSegment = !string.IsNullOrWhiteSpace(context.ProtocolVersion) 
            ? context.ProtocolVersion 
            : MongoClusterConstants.CacheSegments.Current;

        var blindedKey = $"{MongoClusterConstants.CacheSegments.Vialiq}:{MongoClusterConstants.CacheSegments.Study}:{context.TenantId}:{context.StudyId}:{context.Environment}:{versionSegment}:{MongoClusterConstants.CacheSegments.Scope}:{MongoClusterConstants.CacheSegments.Blinded}:{resource}:{key}";
        var unblindedKey = $"{MongoClusterConstants.CacheSegments.Vialiq}:{MongoClusterConstants.CacheSegments.Study}:{context.TenantId}:{context.StudyId}:{context.Environment}:{versionSegment}:{MongoClusterConstants.CacheSegments.Scope}:{MongoClusterConstants.CacheSegments.Unblinded}:{resource}:{key}";

        try
        {
            var redis = _redisFactory.GetDatabase();
            await redis.KeyDeleteAsync(blindedKey);
            await redis.KeyDeleteAsync(unblindedKey);
            
            // Broadcast across multi-instance backplane for both blinding scopes
            var sub = _redisFactory.GetSubscriber();
            var channel = RedisChannel.Literal(MongoClusterConstants.CacheSegments.InvalidationsChannel);
            await sub.PublishAsync(channel, blindedKey);
            await sub.PublishAsync(channel, unblindedKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, CachingLogMessages.FailedToInvalidateRedisKey, $"{blindedKey},{unblindedKey}");
            throw;
        }
    }

    /// <summary>
    /// Internal resilient cache execution pipeline implementing read-through and safe write-through.
    /// Gracefully degrades on Redis transient outages by invoking the underlying system-of-record factory.
    /// </summary>
    /// <typeparam name="T">The type of the cached metadata object.</typeparam>
    /// <param name="key">The fully-qualified Redis key.</param>
    /// <param name="factory">The asynchronous factory function invoked on cache miss.</param>
    /// <param name="ttl">The time-to-live for the cached entry.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe.</param>
    /// <returns>The cached or freshly computed metadata value.</returns>
    private async ValueTask<T> GetOrCreateInternalAsync<T>(
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        TimeSpan ttl, 
        CancellationToken ct)
    {
        IDatabase? redis = null;
        try
        {
            redis = _redisFactory.GetDatabase();
            var cached = await redis.StringGetAsync(key);
            if (cached.HasValue)
            {
                var deserialized = JsonSerializer.Deserialize<T>((string)cached!);
                if (deserialized != null)
                {
                    return deserialized;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, CachingLogMessages.RedisReadFailed, key);
        }

        // Cache miss or Redis failure: query the underlying system of record
        var freshValue = await factory(ct);

        if (freshValue != null && redis != null)
        {
            try
            {
                var serialized = JsonSerializer.Serialize(freshValue);
                await redis.StringSetAsync(key, serialized, ttl);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, CachingLogMessages.RedisWriteFailed, key);
            }
        }

        return freshValue;
    }
}
