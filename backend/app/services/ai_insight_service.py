from typing import Dict, Any, List

def generate_ai_watershed_narrative(
    watershed_name: str,
    district: str,
    total_interventions: int,
    verified_interventions: int,
    avg_health_index: float,
    positive_signals_count: int,
    negative_signals_count: int
) -> Dict[str, Any]:
    """Generates an executive briefing note for a watershed unit."""
    coverage_pct = round((verified_interventions / max(1, total_interventions)) * 100, 1)
    
    summary = (
        f"Watershed '{watershed_name}' ({district} district) tracks {total_interventions} water-harvesting "
        f"and soil conservation structures with a current evidence coverage of {coverage_pct}%. "
        f"The composite watershed health index is rated at {avg_health_index:.1f}/100. "
        f"Out of evaluated assets, {positive_signals_count} exhibit observed positive vegetation/moisture signals, "
        f"while {negative_signals_count} demonstrate negative or declining post-monsoon trends requiring immediate ground audit."
    )
    
    recommendations = [
        "Prioritize physical inspections for assets flagged with GPS deviations > 50 meters.",
        "Cross-reference post-monsoon greening anomalies against block-level rainfall records to isolate seasonal weather effects.",
        "Ensure field surveyors re-photograph structures older than 180 days to maintain evidence currency."
    ]
    
    caveat = "Remote sensing data demonstrates observational spatial association and ecological trends; it does not by itself prove legal causality without ground verification."

    return {
        "summary": summary,
        "recommendations": recommendations,
        "scientific_caveat": caveat,
        "model_version": "JALDRISHTI-Explainable-Rule-Engine-v2.6"
    }

def generate_ai_intervention_narrative(
    work_id: str,
    structure_type: str,
    watershed_name: str,
    ndvi_delta: float,
    mndwi_delta: float,
    ers_score: float,
    decision_status: str,
    distance_meters: float
) -> Dict[str, Any]:
    """Generates an asset-level explainable audit note."""
    status_text = {
        "POSITIVE_SIGNAL": "Observed Positive Ecological Signal",
        "NEGATIVE_SIGNAL": "Observed Negative / Degradation Signal",
        "INCONCLUSIVE": "Inconclusive Trend (Weak Variation)",
        "NEEDS_VERIFICATION": "High Priority: Field Verification Required"
    }.get(decision_status, decision_status)

    lines = []
    lines.append(f"Forensic Assessment for {structure_type} ({work_id}) in {watershed_name}:")
    lines.append(f"• Evidence Readiness Score: {ers_score}/100 based on photo EXIF, work record, and satellite scenes.")
    
    if distance_meters <= 25.0:
        lines.append(f"• Geofence Integrity: Photo coordinate matches planned axis within {distance_meters:.1f}m (Acceptable).")
    else:
        lines.append(f"• Geofence Warning: Photo coordinate deviates by {distance_meters:.1f}m from planned work coordinates.")

    if ndvi_delta >= 0.08:
        lines.append(f"• Photosynthetic Canopy: Observed ΔNDVI of +{ndvi_delta:.3f} indicates healthy biomass recovery in the upstream micro-catchment.")
    elif ndvi_delta <= -0.05:
        lines.append(f"• Vegetative Stress: Observed ΔNDVI of {ndvi_delta:.3f} indicates localized vegetative loss or delayed cultivation.")
    else:
        lines.append(f"• Canopy Stability: Observed ΔNDVI of {ndvi_delta:.3f} is consistent with normal baseline variance.")

    if mndwi_delta >= 0.04:
        lines.append(f"• Surface Hydrology: Sustained post-monsoon water persistence detected (ΔMNDWI: +{mndwi_delta:.3f}).")
    elif mndwi_delta <= -0.05:
        lines.append(f"• Water Depletion: Reduced surface water storage duration observed (ΔMNDWI: {mndwi_delta:.3f}). Siltation check advised.")

    return {
        "headline": status_text,
        "narrative": "\n".join(lines),
        "confidence": "HIGH" if ers_score >= 80 else ("MEDIUM" if ers_score >= 55 else "LOW"),
        "caveat": "Observational assessment only. Physical check of spillway and embankment recommended prior to formal sign-off."
    }
