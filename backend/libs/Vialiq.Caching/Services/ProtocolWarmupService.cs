namespace Vialiq.Caching.Services;

using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Vialiq.Caching.Abstractions;
using Vialiq.Core.Models;

public sealed class ProtocolWarmupService : IProtocolWarmupService
{
    private readonly IRedisConnectionFactory _redisFactory;
    private readonly ILogger<ProtocolWarmupService> _logger;
    private static readonly TimeSpan DefaultSchemaTtl = TimeSpan.FromHours(24);

    public ProtocolWarmupService(
        IRedisConnectionFactory redisFactory, 
        ILogger<ProtocolWarmupService> logger)
    {
        _redisFactory = redisFactory;
        _logger = logger;
    }

    public async Task PreWarmAmendmentCacheAsync(
        ProtocolAmendmentManifest manifest, 
        Func<string, Task<string>> formSchemaCompiler,
        CancellationToken ct = default)
    {
        var db = _redisFactory.GetDatabase();

        _logger.LogInformation(
            "Beginning pre-opening cache warmup for Study {StudyId} Version {Version}. Forms to compile: {Count}",
            manifest.StudyId, manifest.TargetVersion, manifest.ModifiedFormIds.Count);

        foreach (var formId in manifest.ModifiedFormIds)
        {
            ct.ThrowIfCancellationRequested();

            var compiledJsonSchema = await formSchemaCompiler(formId);
            var cacheKey = $"vialiq:study:{manifest.TenantId}:{manifest.StudyId}:{manifest.TargetVersion}:schema:{formId}";

            // Eager write-through: Key is populated BEFORE users have access
            await db.StringSetAsync(cacheKey, compiledJsonSchema, DefaultSchemaTtl);

            _logger.LogInformation("Successfully pre-warmed cache key {CacheKey}", cacheKey);
        }

        // Broadcast warming completion across API cluster backplane
        var channel = RedisChannel.Literal("vialiq:protocol:warmup:completed");
        var notification = JsonSerializer.Serialize(new 
        { 
            manifest.TenantId, 
            manifest.StudyId, 
            manifest.TargetVersion 
        });

        await _redisFactory.GetSubscriber().PublishAsync(channel, notification);
    }

    public async Task EvictAbortedAmendmentCacheAsync(
        ProtocolAmendmentManifest manifest, 
        CancellationToken ct = default)
    {
        var db = _redisFactory.GetDatabase();

        _logger.LogWarning(
            "Evicting pre-warmed keys for aborted amendment {AmendmentId} on Study {StudyId} Version {Version}.",
            manifest.AmendmentId, manifest.StudyId, manifest.TargetVersion);

        foreach (var formId in manifest.ModifiedFormIds)
        {
            var cacheKey = $"vialiq:study:{manifest.TenantId}:{manifest.StudyId}:{manifest.TargetVersion}:schema:{formId}";
            await db.KeyDeleteAsync(cacheKey);
        }
    }
}
