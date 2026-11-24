namespace Vialiq.Caching.Extensions;

using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Vialiq.Caching.Abstractions;
using Vialiq.Caching.InMemory;
using Vialiq.Caching.Services;

/// <summary>
/// Dependency injection extension methods for registering the Vialiq caching and lock coordination services.
/// </summary>
public static class CachingServiceExtensions
{
    /// <summary>
    /// Registers the production-grade High-Availability Redis caching and lock coordination tier.
    /// Conforms to ADR 007-A, ENG 007-B, and FDA 21 CFR Part 11 requirements.
    /// </summary>
    /// <param name="services">The service collection to populate.</param>
    /// <param name="configuration">The application configuration providing Redis connection strings.</param>
    /// <returns>The modified service collection for method chaining.</returns>
    public static IServiceCollection AddVialiqCaching(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        // 1. Redis Connection Factory with resilient failover & retry
        services.AddSingleton<IRedisConnectionFactory, RedisConnectionFactory>();

        // 2. Multi-Tenant Scoped Cache Service (Direct Redis)
        services.AddScoped<IScopedCacheService, ScopedCacheService>();

        // 3. Dual-Write Form Concurrency Lock Service
        services.AddScoped<IStudyLockService, StudyLockService>();

        // 4. Pre-Warmed Protocol Upversioning Service (ADR 008)
        services.AddScoped<IProtocolWarmupService, ProtocolWarmupService>();

        return services;
    }

    /// <summary>
    /// Registers lightweight in-memory overrides for unit tests and offline environments.
    /// Eliminates Redis and MongoDB connection requirements for fast isolated test execution.
    /// </summary>
    /// <param name="services">The service collection to populate.</param>
    /// <returns>The modified service collection for method chaining.</returns>
    public static IServiceCollection AddVialiqCachingInMemory(this IServiceCollection services)
    {
        services.AddScoped<IScopedCacheService, InMemoryScopedCacheService>();
        services.AddSingleton<IStudyLockService, InMemoryStudyLockService>();
        services.AddScoped<IProtocolWarmupService, InMemoryProtocolWarmupService>();
        return services;
    }
}
