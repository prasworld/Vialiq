namespace Vialiq.Core.Constants;

/// <summary>
/// Immutable, strongly-typed clinical user roles.
/// Eliminates bare string literals in authorization policies, security attributes, and audit logs.
/// </summary>
public static class ClinicalUserRoles
{
    /// <summary>
    /// Principal Investigator or Sub-Investigator with full medical responsibility.
    /// </summary>
    public const string Investigator = "Investigator";

    /// <summary>
    /// Clinical Research Coordinator responsible for site-level subject visit data entry.
    /// </summary>
    public const string Crc = "CRC";

    /// <summary>
    /// Clinical Research Associate performing source data verification and site monitoring.
    /// </summary>
    public const string Cra = "CRA";

    /// <summary>
    /// Clinical Data Manager managing queries, discrepancy resolution, and dictionary coding.
    /// </summary>
    public const string DataManager = "DataManager";

    /// <summary>
    /// Unblinded Pharmacist dispensing investigational product and handling randomization kits.
    /// </summary>
    public const string UnblindedPharmacist = "UnblindedPharmacist";

    /// <summary>
    /// Study-level administrator managing user site assignments and protocol versions.
    /// </summary>
    public const string StudyAdmin = "StudyAdmin";

    /// <summary>
    /// Enterprise Super Administrator with control-plane tenant provisioning privileges.
    /// </summary>
    public const string SuperAdmin = "SuperAdmin";

    /// <summary>
    /// Regulatory compliance auditor with read-only access to Part 11 audit trails.
    /// </summary>
    public const string Auditor = "Auditor";

    /// <summary>
    /// Read-only user permitted to view non-sensitive clinical data.
    /// </summary>
    public const string ReadOnly = "ReadOnly";
}
