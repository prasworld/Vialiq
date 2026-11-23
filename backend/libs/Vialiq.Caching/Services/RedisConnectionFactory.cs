namespace Vialiq.Caching.Services;

using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using Vialiq.Caching.Abstractions;
using Vialiq.Caching.Constants;
using Vialiq.Core.Constants;

public sealed class RedisConnectionFactory : IRedisConnectionFactory, IDisposable
{
    private readonly Lazy<ConnectionMultiplexer> _connection;
    private readonly ILogger<RedisConnectionFactory> _logger;

    public RedisConnectionFactory(IConfiguration config, ILogger<RedisConnectionFactory> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _connection = new Lazy<ConnectionMultiplexer>(() => CreateConnection(config));
    }

    public IConnectionMultiplexer Connection => _connection.Value;
    public IDatabase GetDatabase() => Connection.GetDatabase();
    public ISubscriber GetSubscriber() => Connection.GetSubscriber();

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

    public void Dispose()
    {
        if (_connection.IsValueCreated)
        {
            _connection.Value.Dispose();
        }
    }
}
