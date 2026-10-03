from typing import List, Dict, Any, Optional

def calculate_ndvi(nir: float, red: float) -> float:
    """Normalized Difference Vegetation Index: (NIR - Red) / (NIR + Red)"""
    denom = nir + red
    if denom == 0:
        return 0.0
    return round((nir - red) / denom, 4)

def calculate_mndwi(green: float, swir: float) -> float:
    """Modified Normalized Difference Water Index: (Green - SWIR) / (Green + SWIR)"""
    denom = green + swir
    if denom == 0:
        return 0.0
    return round((green - swir) / denom, 4)

def calculate_ndmi(nir: float, swir: float) -> float:
    """Normalized Difference Moisture Index: (NIR - SWIR) / (NIR + SWIR)"""
    denom = nir + swir
    if denom == 0:
        return 0.0
    return round((nir - swir) / denom, 4)

def filter_cloud_contaminated_scenes(observations: List[Dict[str, Any]], max_cloud_pct: float = 20.0) -> List[Dict[str, Any]]:
    """Quality Gate: Filters or marks observations with high cloud contamination."""
    filtered = []
    for obs in observations:
        obs_copy = obs.copy()
        if obs_copy.get("cloud_cover_pct", 0) > max_cloud_pct:
            obs_copy["is_cloud_free"] = False
        else:
            obs_copy["is_cloud_free"] = True
        filtered.append(obs_copy)
    return filtered
