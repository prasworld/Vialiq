namespace Vialiq.Core.Constants;

/// <summary>
/// Immutable, strongly-typed clinical user roles.
/// Eliminates bare string literals in authorization policies and audit logs.
/// </summary>
public static class ClinicalUserRoles
{
    public const string Investigator = "Investigator";
    public const string Crc = "CRC";
    public const string Cra = "CRA";
    public const string DataManager = "DataManager";
    public const string UnblindedPharmacist = "UnblindedPharmacist";
    public const string StudyAdmin = "StudyAdmin";
    public const string SuperAdmin = "SuperAdmin";
    public const string Auditor = "Auditor";
    public const string ReadOnly = "ReadOnly";
}
