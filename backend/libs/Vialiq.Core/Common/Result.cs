namespace Vialiq.Core.Common;

using System;
using System.Threading.Tasks;

#pragma warning disable CA1000 // Do not declare static members on generic types (Standard pattern in functional Result implementations)
#pragma warning disable CA1716 // Identifiers should not match keywords

/// <summary>
/// Functional, immutable, railway-oriented result type representing either success with a value or failure with an error.
/// Eliminates unhandled exception throwing for standard business and operational validation flow.
/// </summary>
/// <typeparam name="TValue">The success payload type.</typeparam>
/// <typeparam name="TError">The error payload type.</typeparam>
public readonly record struct Result<TValue, TError>
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public TValue Value { get; }
    public TError Error { get; }

    private Result(TValue value)
    {
        IsSuccess = true;
        Value = value;
        Error = default!;
    }

    private Result(TError error)
    {
        IsSuccess = false;
        Value = default!;
        Error = error ?? throw new ArgumentNullException(nameof(error));
    }

    public static Result<TValue, TError> Success(TValue value) => new(value);
    public static Result<TValue, TError> Failure(TError error) => new(error);

    public static implicit operator Result<TValue, TError>(TValue value) => Success(value);
    public static implicit operator Result<TValue, TError>(TError error) => Failure(error);

    /// <summary>
    /// Functional fold / pattern match.
    /// </summary>
    public TResult Match<TResult>(Func<TValue, TResult> onSuccess, Func<TError, TResult> onFailure)
    {
        ArgumentNullException.ThrowIfNull(onSuccess);
        ArgumentNullException.ThrowIfNull(onFailure);
        return IsSuccess ? onSuccess(Value) : onFailure(Error);
    }

    /// <summary>
    /// Asynchronous pattern match.
    /// </summary>
    public Task<TResult> MatchAsync<TResult>(Func<TValue, Task<TResult>> onSuccess, Func<TError, Task<TResult>> onFailure)
    {
        ArgumentNullException.ThrowIfNull(onSuccess);
        ArgumentNullException.ThrowIfNull(onFailure);
        return IsSuccess ? onSuccess(Value) : onFailure(Error);
    }

    /// <summary>
    /// Functional map: Transforms the success value if successful; otherwise preserves the error.
    /// </summary>
    public Result<TNewValue, TError> Map<TNewValue>(Func<TValue, TNewValue> mapper)
    {
        ArgumentNullException.ThrowIfNull(mapper);
        return IsSuccess ? Result<TNewValue, TError>.Success(mapper(Value)) : Result<TNewValue, TError>.Failure(Error);
    }

    /// <summary>
    /// Functional bind: Monadic sequencing.
    /// </summary>
    public Result<TNewValue, TError> Bind<TNewValue>(Func<TValue, Result<TNewValue, TError>> binder)
    {
        ArgumentNullException.ThrowIfNull(binder);
        return IsSuccess ? binder(Value) : Result<TNewValue, TError>.Failure(Error);
    }

    /// <summary>
    /// Asynchronous monadic bind.
    /// </summary>
    public async Task<Result<TNewValue, TError>> BindAsync<TNewValue>(Func<TValue, Task<Result<TNewValue, TError>>> binder)
    {
        ArgumentNullException.ThrowIfNull(binder);
        return IsSuccess ? await binder(Value).ConfigureAwait(false) : Result<TNewValue, TError>.Failure(Error);
    }
}

/// <summary>
/// Static companion class for functional Result creation.
/// </summary>
public static class Result
{
    public static Result<TValue, TError> Success<TValue, TError>(TValue value) => Result<TValue, TError>.Success(value);
    public static Result<TValue, TError> Failure<TValue, TError>(TError error) => Result<TValue, TError>.Failure(error);
}

/// <summary>
/// Functional, immutable representation of an optional value (Some vs. None).
/// </summary>
/// <typeparam name="T">The contained value type.</typeparam>
public readonly record struct Option<T>
{
    private readonly bool _hasValue;
    private readonly T _value;

    private Option(T value)
    {
        _hasValue = true;
        _value = value;
    }

    public static Option<T> None => default;
    public static Option<T> Some(T value) => new(value);

    public bool HasValue => _hasValue;

    public TResult Match<TResult>(Func<T, TResult> onSome, Func<TResult> onNone)
    {
        ArgumentNullException.ThrowIfNull(onSome);
        ArgumentNullException.ThrowIfNull(onNone);
        return _hasValue ? onSome(_value) : onNone();
    }

    public Option<TResult> Map<TResult>(Func<T, TResult> mapper)
    {
        ArgumentNullException.ThrowIfNull(mapper);
        return _hasValue ? Option<TResult>.Some(mapper(_value)) : Option<TResult>.None;
    }

    public T ValueOr(T fallback) => _hasValue ? _value : fallback;
    public T ValueOr(Func<T> fallbackFactory) => _hasValue ? _value : fallbackFactory();
}

/// <summary>
/// Static companion class for functional Option creation.
/// </summary>
public static class Option
{
    public static Option<T> Some<T>(T value) => Option<T>.Some(value);
    public static Option<T> None<T>() => Option<T>.None;
}

#pragma warning restore CA1000
#pragma warning restore CA1716
