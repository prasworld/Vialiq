namespace Vialiq.Core.Interfaces;

using Vialiq.Core.Models;

/// <summary>
/// Provides access to the ambient Tenant and Study context for the current execution pipeline.
/// </summary>
public interface ITenantStudyContextAccessor
{
    /// <summary>
    /// Gets the current ambient <see cref="TenantStudyContext"/> for the active request or execution scope.
    /// </summary>
    TenantStudyContext? CurrentContext { get; }
}
