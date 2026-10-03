from typing import Dict, Any, Tuple

def compute_evidence_readiness_score(
    photo_quality: float,        # 0.0 to 1.0 (clarity, resolution)
    distance_meters: float,      # distance to planned intervention
    photo_age_days: int,         # days since capture
    work_record_matched: bool,   # valid WDC-PMKSY ID
    satellite_scenes_count: int  # count of cloud-free scenes
) -> float:
    """
    Evidence_Readiness = 0.25 * photo_quality + 0.20 * geo_validity + 
                         0.20 * temporal_coverage + 0.15 * work_record_match + 
                         0.20 * satellite_data_quality
    Returns a score between 0.0 and 100.0
    """
    # Geo validity: 1.0 if <= 25m, decays to 0 at 100m
    if distance_meters <= 25.0:
        geo_validity = 1.0
    elif distance_meters <= 100.0:
        geo_validity = max(0.0, 1.0 - (distance_meters - 25.0) / 75.0)
    else:
        geo_validity = 0.0

    # Temporal coverage: 1.0 if within 90 days, decaying after
    if photo_age_days <= 90:
        temp_coverage = 1.0
    elif photo_age_days <= 365:
        temp_coverage = max(0.2, 1.0 - (photo_age_days - 90) / 365.0)
    else:
        temp_coverage = 0.2

    work_match = 1.0 if work_record_matched else 0.0
    sat_quality = min(1.0, satellite_scenes_count / 8.0) # 8+ scenes = full score

    ers = (
        0.25 * photo_quality +
        0.20 * geo_validity +
        0.20 * temp_coverage +
        0.15 * work_match +
        0.20 * sat_quality
    ) * 100.0

    return round(ers, 2)

def evaluate_directional_outcome(
    ndvi_delta: float,
    mndwi_delta: float,
    readiness_score: float,
    distance_meters: float
) -> Tuple[str, str]:
    """
    Evaluates outcome status based on observational deltas and evidence quality gates.
    Returns (decision_status, reasoning)
    """
    if readiness_score < 50.0 or distance_meters > 75.0:
        return (
            "NEEDS_VERIFICATION",
            f"Evidence readiness score is low ({readiness_score}/100) or GPS coordinate deviation ({distance_meters:.1f}m) exceeds acceptable threshold."
        )

    if ndvi_delta >= 0.08 and mndwi_delta >= 0.03:
        return (
            "POSITIVE_SIGNAL",
            f"Observed positive vegetation recovery (ΔNDVI: +{ndvi_delta:.3f}) and sustained surface moisture (ΔMNDWI: +{mndwi_delta:.3f}) post-intervention."
        )
    elif ndvi_delta <= -0.05 or mndwi_delta <= -0.06:
        return (
            "NEGATIVE_SIGNAL",
            f"Observed decline in vegetation vigour (ΔNDVI: {ndvi_delta:.3f}) or reduced water retention post-intervention. Siltation or breach inspection recommended."
        )
    else:
        return (
            "INCONCLUSIVE",
            f"Observed indicators show marginal variance (ΔNDVI: {ndvi_delta:.3f}, ΔMNDWI: {mndwi_delta:.3f}). Seasonal rainfall correlation required."
        )
