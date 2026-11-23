namespace Vialiq.Core.Models;

using System;

/// <summary>
/// Declares that a property contains double-blind RTSM data (treatment arm, kit type, dose).
/// Outbound serialization pipeline will strip or mask this property for blinded users.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class BlindedRtsmAttribute : Attribute
{
    public string MaskValue { get; }

    public BlindedRtsmAttribute(string maskValue = "BLINDED")
    {
        MaskValue = maskValue;
    }
}
