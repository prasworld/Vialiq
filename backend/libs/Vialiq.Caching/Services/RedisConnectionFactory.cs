namespace Vialiq.Caching.Services;

using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Vialiq.Caching.Abstractions;
using Vialiq.Caching.Constants;
using Vialiq.Core.Constants;

/// <summary>
/// Thread-safe singleton factory managing the lifecycle of the StackExchange.Redis connection multiplexer.
/// Supports both direct Redis standalone/cluster configurations and High-Availability Redis Sentinel topologies.
/// </summary>
public sealed class RedisConnectionFactory : IRedisConnectionFactory, IDisposable
{
    private readonly Lazy<ConnectionMultiplexer> _connection;
    private readonly ILogger<RedisConnectionFactory> _logger;

    /// <summary>
    /// Initializes a new instance of <see cref="RedisConnectionFactory"/>.
    /// </summary>
    /// <param name="config">The application configuration containing Redis or Sentinel connection strings.</param>
    /// <param name="logger">The structured logger instance.</param>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="logger"/> is null.</exception>
    public RedisConnectionFactory(IConfiguration config, ILogger<RedisConnectionFactory> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _connection = new Lazy<ConnectionMultiplexer>(() => CreateConnection(config));
    }

    /// <inheritdoc />
    public IConnectionMultiplexer Connection => _connection.Value;

    /// <inheritdoc />
    public IDatabase GetDatabase() => Connection.GetDatabase();

    /// <inheritdoc />
    public ISubscriber GetSubscriber() => Connection.GetSubscriber();

    /// <summary>
    /// Resolves connection strings from configuration and initializes the Redis connection multiplexer with exponential retry policy.
    /// </summary>
    /// <param name="config">The application configuration.</param>
    /// <returns>An initialized and connected <see cref="ConnectionMultiplexer"/>.</returns>
    /// <exception cref="InvalidOperationException">Thrown when neither Redis nor RedisSentinel connection strings are configured.</exception>
    private ConnectionMultiplexer CreateConnection(IConfiguration config)
    {
        var sentinelConnectionString = config.GetConnectionString(ConfigurationConstants.Keys.RedisSentinelConnectionString);
        var redisConnectionString = config.GetConnectionString(ConfigurationConstants.Keys.RedisConnectionString);

        var connectionString = !string.IsNullOrWhiteSpace(sentinelConnectionString)
            ? sentinelConnectionString
            : redisConnectionString;

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(InfrastructureErrorMessages.RedisConnectionStringNotConfigured);
        }

        var options = ConfigurationOptions.Parse(connectionString);
        options.AbortOnConnectFail = false;
        options.ConnectRetry = 5;
        options.ConnectTimeout = 3000;
        options.SyncTimeout = 2000;
        options.KeepAlive = 60;
        options.ReconnectRetryPolicy = new ExponentialRetry(500, 3000);

        var multiplexer = ConnectionMultiplexer.Connect(options);

        multiplexer.ConnectionFailed += (s, e) =>
            _logger.LogError(e.Exception, CachingLogMessages.RedisConnectionFailed, e.EndPoint, e.FailureType);

        multiplexer.ConnectionRestored += (s, e) =>
            _logger.LogInformation(CachingLogMessages.RedisConnectionRestored, e.EndPoint);

        multiplexer.ErrorMessage += (s, e) =>
            _logger.LogWarning(CachingLogMessages.RedisServerError, e.EndPoint, e.Message);

        return multiplexer;
    }

    /// <summary>
    /// Disposes the underlying Redis connection multiplexer if initialized.
    /// </summary>
    public void Dispose()
    {
        if (_connection.IsValueCreated)
        {
            _connection.Value.Dispose();
        }
    }
}
