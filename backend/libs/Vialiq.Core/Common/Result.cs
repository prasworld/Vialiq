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
    private readonly bool _isInitialized;

    /// <summary>
    /// Gets a value indicating whether this result represents a successful operation.
    /// </summary>
    public bool IsSuccess { get; }

    /// <summary>
    /// Gets a value indicating whether this result represents a failed operation.
    /// </summary>
    public bool IsFailure => !IsSuccess;

    /// <summary>
    /// Gets the success payload value if <see cref="IsSuccess"/> is true; otherwise <c>default</c>.
    /// </summary>
    public TValue Value { get; }

    /// <summary>
    /// Gets the error payload value if <see cref="IsFailure"/> is true; otherwise <c>default</c>.
    /// </summary>
    public TError Error { get; }

    private Result(TValue value)
    {
        _isInitialized = true;
        IsSuccess = true;
        Value = value;
        Error = default!;
    }

    private Result(TError error)
    {
        if (error is null)
        {
            throw new ArgumentNullException(nameof(error));
        }

        _isInitialized = true;
        IsSuccess = false;
        Value = default!;
        Error = error;
    }

    /// <summary>
    /// Creates a successful <see cref="Result{TValue, TError}"/> holding the designated value.
    /// </summary>
    /// <param name="value">The success value.</param>
    /// <returns>A successful result instance.</returns>
    public static Result<TValue, TError> Success(TValue value) => new(value);

    /// <summary>
    /// Creates a failed <see cref="Result{TValue, TError}"/> holding the designated error.
    /// </summary>
    /// <param name="error">The error value.</param>
    /// <returns>A failed result instance.</returns>
    public static Result<TValue, TError> Failure(TError error) => new(error);

    /// <summary>
    /// Implicitly converts a success value of type <typeparamref name="TValue"/> into a successful <see cref="Result{TValue, TError}"/>.
    /// </summary>
    /// <param name="value">The success value to convert.</param>
    public static implicit operator Result<TValue, TError>(TValue value) => Success(value);

    /// <summary>
    /// Implicitly converts an error value of type <typeparamref name="TError"/> into a failed <see cref="Result{TValue, TError}"/>.
    /// </summary>
    /// <param name="error">The error value to convert.</param>
    public static implicit operator Result<TValue, TError>(TError error) => Failure(error);

    /// <summary>
    /// Executes a functional fold / pattern match, returning the output of either <paramref name="onSuccess"/> or <paramref name="onFailure"/>.
    /// </summary>
    /// <typeparam name="TResult">The return type of the transformation.</typeparam>
    /// <param name="onSuccess">Function invoked with <see cref="Value"/> when this result is successful.</param>
    /// <param name="onFailure">Function invoked with <see cref="Error"/> when this result is a failure.</param>
    /// <returns>The result of applying the matched function.</returns>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="onSuccess"/> or <paramref name="onFailure"/> is null.</exception>
    /// <exception cref="InvalidOperationException">Thrown when attempting to match on an uninitialized result struct.</exception>
    public TResult Match<TResult>(Func<TValue, TResult> onSuccess, Func<TError, TResult> onFailure)
    {
        ArgumentNullException.ThrowIfNull(onSuccess);
        ArgumentNullException.ThrowIfNull(onFailure);
        if (!_isInitialized)
        {
            throw new InvalidOperationException("Cannot match on an uninitialized Result.");
        }
        return IsSuccess ? onSuccess(Value) : onFailure(Error);
    }

    /// <summary>
    /// Asynchronously executes a pattern match, returning the awaited output of either <paramref name="onSuccess"/> or <paramref name="onFailure"/>.
    /// </summary>
    /// <typeparam name="TResult">The return type of the asynchronous transformation.</typeparam>
    /// <param name="onSuccess">Asynchronous function invoked with <see cref="Value"/> when this result is successful.</param>
    /// <param name="onFailure">Asynchronous function invoked with <see cref="Error"/> when this result is a failure.</param>
    /// <returns>A task representing the result of applying the matched function.</returns>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="onSuccess"/> or <paramref name="onFailure"/> is null.</exception>
    /// <exception cref="InvalidOperationException">Thrown when attempting to match on an uninitialized result struct.</exception>
    public Task<TResult> MatchAsync<TResult>(Func<TValue, Task<TResult>> onSuccess, Func<TError, Task<TResult>> onFailure)
    {
        ArgumentNullException.ThrowIfNull(onSuccess);
        ArgumentNullException.ThrowIfNull(onFailure);
        if (!_isInitialized)
        {
            throw new InvalidOperationException("Cannot match on an uninitialized Result.");
        }
        return IsSuccess ? onSuccess(Value) : onFailure(Error);
    }

    /// <summary>
    /// Transforms the success value using <paramref name="mapper"/> if successful; otherwise preserves the existing error.
    /// </summary>
    /// <typeparam name="TNewValue">The transformed value type.</typeparam>
    /// <param name="mapper">The pure transformation function.</param>
    /// <returns>A new <see cref="Result{TNewValue, TError}"/> holding the transformed value or original error.</returns>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="mapper"/> is null.</exception>
    public Result<TNewValue, TError> Map<TNewValue>(Func<TValue, TNewValue> mapper)
    {
        ArgumentNullException.ThrowIfNull(mapper);
        return IsSuccess ? Result<TNewValue, TError>.Success(mapper(Value)) : Result<TNewValue, TError>.Failure(Error);
    }

    /// <summary>
    /// Monadically chains another result-producing operation if this result is successful.
    /// </summary>
    /// <typeparam name="TNewValue">The resulting success payload type.</typeparam>
    /// <param name="binder">The monadic binding function.</param>
    /// <returns>The result returned by <paramref name="binder"/> or the original error.</returns>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="binder"/> is null.</exception>
    public Result<TNewValue, TError> Bind<TNewValue>(Func<TValue, Result<TNewValue, TError>> binder)
    {
        ArgumentNullException.ThrowIfNull(binder);
        return IsSuccess ? binder(Value) : Result<TNewValue, TError>.Failure(Error);
    }

    /// <summary>
    /// Asynchronously monadically chains another result-producing operation if this result is successful.
    /// </summary>
    /// <typeparam name="TNewValue">The resulting success payload type.</typeparam>
    /// <param name="binder">The asynchronous monadic binding function.</param>
    /// <returns>A task representing the result returned by <paramref name="binder"/> or the original error.</returns>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="binder"/> is null.</exception>
    public async Task<Result<TNewValue, TError>> BindAsync<TNewValue>(Func<TValue, Task<Result<TNewValue, TError>>> binder)
    {
        ArgumentNullException.ThrowIfNull(binder);
        return IsSuccess ? await binder(Value).ConfigureAwait(false) : Result<TNewValue, TError>.Failure(Error);
    }
}

/// <summary>
/// Static companion class for functional <see cref="Result{TValue, TError}"/> creation.
/// </summary>
public static class Result
{
    /// <summary>
    /// Creates a successful <see cref="Result{TValue, TError}"/>.
    /// </summary>
    /// <typeparam name="TValue">The success payload type.</typeparam>
    /// <typeparam name="TError">The error payload type.</typeparam>
    /// <param name="value">The success value.</param>
    /// <returns>A successful result instance.</returns>
    public static Result<TValue, TError> Success<TValue, TError>(TValue value) => Result<TValue, TError>.Success(value);

    /// <summary>
    /// Creates a failed <see cref="Result{TValue, TError}"/>.
    /// </summary>
    /// <typeparam name="TValue">The success payload type.</typeparam>
    /// <typeparam name="TError">The error payload type.</typeparam>
    /// <param name="error">The error payload.</param>
    /// <returns>A failed result instance.</returns>
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

    /// <summary>
    /// Gets an empty <see cref="Option{T}"/> representing absence of a value (None).
    /// </summary>
    public static Option<T> None => default;

    /// <summary>
    /// Creates an <see cref="Option{T}"/> holding a non-null value (Some).
    /// </summary>
    /// <param name="value">The value to encapsulate.</param>
    /// <returns>An option holding the specified value.</returns>
    public static Option<T> Some(T value) => new(value);

    /// <summary>
    /// Gets a value indicating whether this option contains a value.
    /// </summary>
    public bool HasValue => _hasValue;

    /// <summary>
    /// Executes a functional fold, returning the result of <paramref name="onSome"/> if a value is present, or <paramref name="onNone"/> otherwise.
    /// </summary>
    /// <typeparam name="TResult">The transformation result type.</typeparam>
    /// <param name="onSome">Function to execute on the contained value.</param>
    /// <param name="onNone">Function to execute if no value is present.</param>
    /// <returns>The result of applying the matched function.</returns>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="onSome"/> or <paramref name="onNone"/> is null.</exception>
    public TResult Match<TResult>(Func<T, TResult> onSome, Func<TResult> onNone)
    {
        ArgumentNullException.ThrowIfNull(onSome);
        ArgumentNullException.ThrowIfNull(onNone);
        return _hasValue ? onSome(_value) : onNone();
    }

    /// <summary>
    /// Transforms the contained value using <paramref name="mapper"/> if present; otherwise returns <see cref="None"/>.
    /// </summary>
    /// <typeparam name="TResult">The transformed value type.</typeparam>
    /// <param name="mapper">The mapping function.</param>
    /// <returns>An option holding the transformed value, or None.</returns>
    /// <exception cref="ArgumentNullException">Thrown when <paramref name="mapper"/> is null.</exception>
    public Option<TResult> Map<TResult>(Func<T, TResult> mapper)
    {
        ArgumentNullException.ThrowIfNull(mapper);
        return _hasValue ? Option<TResult>.Some(mapper(_value)) : Option<TResult>.None;
    }

    /// <summary>
    /// Returns the contained value if present, or <paramref name="fallback"/> otherwise.
    /// </summary>
    /// <param name="fallback">The default value to return if None.</param>
    /// <returns>The contained value or fallback.</returns>
    public T ValueOr(T fallback) => _hasValue ? _value : fallback;

    /// <summary>
    /// Returns the contained value if present, or evaluates <paramref name="fallbackFactory"/> otherwise.
    /// </summary>
    /// <param name="fallbackFactory">Factory invoked if None.</param>
    /// <returns>The contained value or the result of fallbackFactory.</returns>
    public T ValueOr(Func<T> fallbackFactory) => _hasValue ? _value : fallbackFactory();
}

/// <summary>
/// Static companion class for functional <see cref="Option{T}"/> creation.
/// </summary>
public static class Option
{
    /// <summary>
    /// Creates an option holding a value.
    /// </summary>
    /// <typeparam name="T">The value type.</typeparam>
    /// <param name="value">The value to encapsulate.</param>
    /// <returns>An option holding the value.</returns>
    public static Option<T> Some<T>(T value) => Option<T>.Some(value);

    /// <summary>
    /// Creates an empty option (None).
    /// </summary>
    /// <typeparam name="T">The value type.</typeparam>
    /// <returns>An empty option.</returns>
    public static Option<T> None<T>() => Option<T>.None;
}

#pragma warning restore CA1000
#pragma warning restore CA1716
