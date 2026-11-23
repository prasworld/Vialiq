namespace Vialiq.Core.Models.Database;

using System;
using Vialiq.Core.Constants;

/// <summary>
/// Identifies the physical MongoDB replica set cluster tier in the 3-layer architecture.
/// </summary>
public enum MongoClusterTier
{
    /// <summary>
    /// Layer 1: Admin / Control Plane cluster (rs-admin:27017).
    /// Hosts global tenant catalog, study registry, Key Vault, and user accounts.
    /// Zero clinical study or patient data.
    /// </summary>
    Admin = 1,

    /// <summary>
    /// Layer 2: Development and UAT sandbox cluster (rs-dev:27027).
    /// Hosts non-live study databases for protocol amendment testing and form schema development.
    /// </summary>
    Dev = 2,

    /// <summary>
    /// Layer 3: Qualified, audit-regulated Live Production cluster (rs-prod:27037).
    /// Hosts active GxP clinical trial databases subject to FDA 21 CFR Part 11 and ICH GCP.
    /// </summary>
    Prod = 3
}

/// <summary>
/// Pure functional mapping extensions for MongoClusterTier.
/// </summary>
public static class MongoClusterTierExtensions
{
    /// <summary>
    /// Resolves the canonical replica set cluster identifier string for a given tier.
    /// </summary>
    public static string ToCanonicalClusterId(this MongoClusterTier tier) => tier switch
    {
        MongoClusterTier.Admin => MongoClusterConstants.CanonicalClusterIds.Admin,
        MongoClusterTier.Dev => MongoClusterConstants.CanonicalClusterIds.Dev,
        MongoClusterTier.Prod => MongoClusterConstants.CanonicalClusterIds.Prod,
        _ => throw new ArgumentOutOfRangeException(nameof(tier), tier, InfrastructureErrorMessages.UnsupportedClusterTier(tier))
    };
}
