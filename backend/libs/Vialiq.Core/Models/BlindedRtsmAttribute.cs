namespace Vialiq.Core.Models;

using System;
using Vialiq.Core.Constants;

/// <summary>
/// Declares that a property contains double-blind RTSM data (treatment arm, kit type, dose).
/// Outbound serialization pipeline will strip or mask this property for blinded users.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class BlindedRtsmAttribute : Attribute
{
    /// <summary>
    /// Gets the mask string displayed in place of confidential blinded values.
    /// </summary>
    public string MaskValue { get; }

    /// <summary>
    /// Initializes a new instance of <see cref="BlindedRtsmAttribute"/> with an optional custom mask token.
    /// </summary>
    /// <param name="maskValue">The mask token to display. Defaults to <c>"BLINDED"</c>.</param>
    public BlindedRtsmAttribute(string maskValue = MongoClusterConstants.DefaultMaskValue)
    {
        MaskValue = maskValue;
    }
}
