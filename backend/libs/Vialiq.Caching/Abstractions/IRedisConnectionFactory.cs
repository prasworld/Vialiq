namespace Vialiq.Caching.Abstractions;

using StackExchange.Redis;

/// <summary>
/// Provides access to the resilient Redis connection multiplexer, database, and pub/sub subscriber.
/// </summary>
public interface IRedisConnectionFactory
{
    /// <summary>
    /// Gets the shared singleton <see cref="IConnectionMultiplexer"/> connected to the Redis cluster or Sentinel setup.
    /// </summary>
    IConnectionMultiplexer Connection { get; }

    /// <summary>
    /// Obtains an interactive <see cref="IDatabase"/> instance targeting the default Redis database.
    /// </summary>
    /// <returns>The active <see cref="IDatabase"/> instance.</returns>
    IDatabase GetDatabase();

    /// <summary>
    /// Obtains an <see cref="ISubscriber"/> instance for pub/sub messaging and cache invalidation broadcasting.
    /// </summary>
    /// <returns>The active <see cref="ISubscriber"/> instance.</returns>
    ISubscriber GetSubscriber();
}
