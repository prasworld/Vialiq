namespace Vialiq.Core.Interfaces;

using Vialiq.Core.Models;

/// <summary>
/// Provides access to the ambient Tenant and Study context for the current execution pipeline.
/// </summary>
public interface ITenantStudyContextAccessor
{
    TenantStudyContext? CurrentContext { get; }
}
