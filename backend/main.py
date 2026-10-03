from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.seed.seed_data import seed_database

# API Routers
from app.api.auth import router as auth_router
from app.api.watersheds import router as watersheds_router
from app.api.interventions import router as interventions_router
from app.api.evidence import router as evidence_router
from app.api.field_visits import router as visits_router
from app.api.gis import router as gis_router
from app.api.analytics import router as analytics_router
from app.api.outcomes import router as outcomes_router
from app.api.verification import router as verification_router
from app.api.alerts import router as alerts_router
from app.api.reports import router as reports_router
from app.api.audit import router as audit_router
from app.api.dashboard import router as dashboard_router

# Initialize Tables
Base.metadata.create_all(bind=engine)

# Auto-seed realistic demo data on startup if empty
try:
    db = SessionLocal()
    seed_database(db)
    db.close()
except Exception as e:
    print(f"Database auto-seed check: {e}")

app = FastAPI(
    title="JALDRISHTI API",
    description="AI + GIS Watershed Intelligence & Field Evidence Platform API (SIH26015)",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files for Uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers under /api/v1
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)
app.include_router(watersheds_router, prefix=api_prefix)
app.include_router(interventions_router, prefix=api_prefix)
app.include_router(evidence_router, prefix=api_prefix)
app.include_router(visits_router, prefix=api_prefix)
app.include_router(gis_router, prefix=api_prefix)
app.include_router(analytics_router, prefix=api_prefix)
app.include_router(outcomes_router, prefix=api_prefix)
app.include_router(verification_router, prefix=api_prefix)
app.include_router(alerts_router, prefix=api_prefix)
app.include_router(reports_router, prefix=api_prefix)
app.include_router(audit_router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "platform": "JALDRISHTI",
        "description": "AI + GIS Watershed Intelligence & Field Evidence Platform",
        "sih_problem_statement": "SIH26015",
        "authority": "Department of Land Resources (DoLR), MoRD",
        "api_docs": "/docs",
        "status": "OPERATIONAL"
    }

@app.get("/api/v1/methodology")
def get_methodology():
    return {
        "title": "JALDRISHTI Scientific Methodology & Sensor Boundaries",
        "sensors": [
            {
                "name": "Sentinel-2 MSI",
                "bands": "B3 (Green, 10m), B4 (Red, 10m), B8 (NIR, 10m), B11 (SWIR, 20m)",
                "revisit_time_days": 5,
                "purpose": "Primary optical source for NDVI (Greening) and MNDWI (Water Persistence)"
            },
            {
                "name": "Landsat 8/9 OLI-2 / TIRS",
                "bands": "Thermal Band 10 (100m resampled to 30m)",
                "revisit_time_days": 8,
                "purpose": "Land Surface Temperature (LST) and long-term 10-year historical baseline"
            },
            {
                "name": "SRTM / CartoDEM 30m",
                "purpose": "Hydrologic flow accumulation, stream order delineation (Strahler), and slope compliance"
            }
        ],
        "formulas": {
            "NDVI": "(NIR - Red) / (NIR + Red)",
            "MNDWI": "(Green - SWIR) / (Green + SWIR)",
            "NDMI": "(NIR - SWIR) / (NIR + SWIR)",
            "Evidence_Readiness": "0.25*photo_quality + 0.20*geo_validity + 0.20*temporal_coverage + 0.15*work_match + 0.20*satellite_quality"
        },
        "scientific_honesty_statement": (
            "Remote sensing establishes observed spatial association and ecological trends within catchment influence zones. "
            "It does not independently establish legal causality without ground verification."
        )
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
