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
using Vialiq.Core.Interfaces;

public sealed class ScopedCacheService : IScopedCacheService
{
    private readonly ITenantStudyContextAccessor _contextAccessor;
    private readonly IRedisConnectionFactory _redisFactory;
    private readonly ILogger<ScopedCacheService> _logger;
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromHours(1);

    public ScopedCacheService(
        ITenantStudyContextAccessor contextAccessor,
        IRedisConnectionFactory redisFactory,
        ILogger<ScopedCacheService> logger)
    {
        _contextAccessor = contextAccessor;
        _redisFactory = redisFactory;
        _logger = logger;
    }

    public async ValueTask<T> GetOrCreateStudyAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var context = _contextAccessor.CurrentContext;
        
        // FAIL-CLOSED: Absolute barrier against unauthenticated or missing tenant calls
        if (string.IsNullOrWhiteSpace(context?.TenantId) || string.IsNullOrWhiteSpace(context?.StudyId))
        {
            throw new SecurityException("Security Violation: Attempted to access Study cache without authenticated Tenant and Study context.");
        }

        var fullyQualifiedKey = $"vialiq:study:{context.TenantId}:{context.StudyId}:{context.Environment}:{resource}:{key}";
        return await GetOrCreateInternalAsync(fullyQualifiedKey, factory, DefaultTtl, ct);
    }

    public async ValueTask<T> GetOrCreateClientLibraryAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var context = _contextAccessor.CurrentContext;
        
        if (string.IsNullOrWhiteSpace(context?.TenantId))
        {
            throw new SecurityException("Security Violation: Attempted to access Client Library cache without authenticated Tenant context.");
        }

        var fullyQualifiedKey = $"vialiq:tenant:{context.TenantId}:lib:{resource}:{key}";
        return await GetOrCreateInternalAsync(fullyQualifiedKey, factory, DefaultTtl, ct);
    }

    public async ValueTask<T> GetOrCreateGlobalAsync<T>(
        string dictionary, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var fullyQualifiedKey = $"vialiq:global:standards:{dictionary}:{key}";
        return await GetOrCreateInternalAsync(fullyQualifiedKey, factory, TimeSpan.FromDays(7), ct);
    }

    public async Task InvalidateStudyKeyAsync(string resource, string key, CancellationToken ct = default)
    {
        var context = _contextAccessor.CurrentContext;
        if (context == null) return;

        var fullyQualifiedKey = $"vialiq:study:{context.TenantId}:{context.StudyId}:{context.Environment}:{resource}:{key}";
        
        try
        {
            var redis = _redisFactory.GetDatabase();
            await redis.KeyDeleteAsync(fullyQualifiedKey);
            
            // Broadcast across multi-instance backplane
            await _redisFactory.GetSubscriber().PublishAsync(
                RedisChannel.Literal("vialiq:cache:invalidations"), 
                fullyQualifiedKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, CachingLogMessages.FailedToInvalidateRedisKey, fullyQualifiedKey);
            throw;
        }
    }

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
            _logger.LogWarning(ex, "Redis read failed for {Key}. Falling back to database.", key);
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
                _logger.LogWarning(ex, "Redis write failed for {Key}.", key);
            }
        }

        return freshValue;
    }
}
