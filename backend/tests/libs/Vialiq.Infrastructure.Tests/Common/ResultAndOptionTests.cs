namespace Vialiq.Infrastructure.Tests.Common;

using System;
using System.Threading.Tasks;
using Vialiq.Core.Common;
using Xunit;

public class ResultAndOptionTests
{
    [Fact]
    public void Result_Success_ProducesExpectedFold()
    {
        var result = Result<int, string>.Success(42);

        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Equal(42, result.Value);

        var folded = result.Match(
            onSuccess: val => $"Value is {val}",
            onFailure: err => $"Error: {err}");

        Assert.Equal("Value is 42", folded);
    }

    [Fact]
    public void Result_Failure_ProducesExpectedFold()
    {
        var result = Result<int, string>.Failure("Connection timed out");

        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.Equal("Connection timed out", result.Error);

        var folded = result.Match(
            onSuccess: val => $"Value is {val}",
            onFailure: err => $"Error: {err}");

        Assert.Equal("Error: Connection timed out", folded);
    }

    [Fact]
    public void Result_MapAndBind_ChainsDeterministically()
    {
        var initial = Result<int, string>.Success(10);

        var mapped = initial.Map(x => x * 2);
        Assert.Equal(20, mapped.Value);

        var bound = mapped.Bind(x => x > 15 ? Result<string, string>.Success($"Pass: {x}") : Result<string, string>.Failure("Too low"));
        Assert.True(bound.IsSuccess);
        Assert.Equal("Pass: 20", bound.Value);

        var failedBind = mapped.Bind<string>(_ => Result<string, string>.Failure("Forced failure"));
        Assert.True(failedBind.IsFailure);
        Assert.Equal("Forced failure", failedBind.Error);
    }

    [Fact]
    public async Task Result_BindAsync_ExecutesAsynchronously()
    {
        var initial = Result<int, string>.Success(5);

        var asyncBound = await initial.BindAsync(async x =>
        {
            await Task.Yield();
            return Result<int, string>.Success(x + 10);
        });

        Assert.True(asyncBound.IsSuccess);
        Assert.Equal(15, asyncBound.Value);
    }

    [Fact]
    public void Option_SomeAndNone_BehaveAsExpected()
    {
        var some = Option<string>.Some("Active");
        var none = Option<string>.None;

        Assert.True(some.HasValue);
        Assert.False(none.HasValue);

        Assert.Equal("Active", some.ValueOr("Fallback"));
        Assert.Equal("Fallback", none.ValueOr("Fallback"));

        var mappedSome = some.Map(s => s.ToUpperInvariant());
        Assert.Equal("ACTIVE", mappedSome.ValueOr(""));

        var mappedNone = none.Map(s => s.ToUpperInvariant());
        Assert.False(mappedNone.HasValue);
    }
}
