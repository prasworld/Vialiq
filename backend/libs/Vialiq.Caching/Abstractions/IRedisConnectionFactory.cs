namespace Vialiq.Caching.Abstractions;

using StackExchange.Redis;

/// <summary>
/// Provides access to the resilient Redis connection multiplexer, database, and pub/sub subscriber.
/// </summary>
public interface IRedisConnectionFactory
{
    IConnectionMultiplexer Connection { get; }
    IDatabase GetDatabase();
    ISubscriber GetSubscriber();
}
