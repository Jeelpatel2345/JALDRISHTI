import json
import hashlib
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.orm import Session
from ..core.database import SessionLocal, engine, Base
from ..core.security import get_password_hash
from ..models.models import (
    User, Watershed, Project, Intervention, FieldVisit, FieldEvidence,
    SatelliteObservation, OutcomeAssessment, VerificationTask, Alert, AuditEvent
)

def seed_database(db: Session):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    if db.query(User).first():
        print("Database already contains data. Skipping re-seed.")
        return

    print("Seeding JALDRISHTI database with realistic SIH demo dataset...")

    # 1. Users & Personas
    default_password_hash = get_password_hash("Jaldrishti@2026")
    users = [
        User(
            email="admin@jaldrishti.gov.in",
            full_name="Dr. Rajeshwari Sharma",
            hashed_password=default_password_hash,
            role="super_admin",
            district="New Delhi",
            state="National",
            is_active=True
        ),
        User(
            email="rajkot.officer@jaldrishti.gov.in",
            full_name="Vikram Mehta",
            hashed_password=default_password_hash,
            role="district_officer",
            district="Rajkot",
            state="Gujarat",
            is_active=True
        ),
        User(
            email="field.surveyor@jaldrishti.gov.in",
            full_name="Ramesh Solanki",
            hashed_password=default_password_hash,
            role="field_surveyor",
            district="Rajkot",
            state="Gujarat",
            is_active=True
        ),
        User(
            email="analyst@jaldrishti.gov.in",
            full_name="Dr. Sneha Pillai",
            hashed_password=default_password_hash,
            role="analyst",
            district="Bangalore",
            state="Karnataka",
            is_active=True
        ),
        User(
            email="auditor@jaldrishti.gov.in",
            full_name="Arun K. Verma",
            hashed_password=default_password_hash,
            role="reviewer",
            district="Hyderabad",
            state="Andhra Pradesh",
            is_active=True
        )
    ]
    db.add_all(users)
    db.commit()

    # 2. Watersheds (Real Indian Coordinates & Realistic Boundary Polygons)
    # Rajkot centroid: ~ 22.25, 70.80
    rajkot_poly = {
        "type": "Polygon",
        "coordinates": [[
            [70.745, 22.220], [70.825, 22.210], [70.860, 22.260],
            [70.835, 22.310], [70.750, 22.290], [70.745, 22.220]
        ]]
    }
    # Dharwad centroid: ~ 15.45, 75.00
    dharwad_poly = {
        "type": "Polygon",
        "coordinates": [[
            [74.950, 15.410], [75.040, 15.400], [75.070, 15.470],
            [75.020, 15.510], [74.940, 15.480], [74.950, 15.410]
        ]]
    }
    # Ananthapuramu centroid: ~ 14.68, 77.60
    ananthapur_poly = {
        "type": "Polygon",
        "coordinates": [[
            [77.540, 14.620], [77.650, 14.610], [77.680, 14.710],
            [77.610, 14.740], [77.530, 14.700], [77.540, 14.620]
        ]]
    }

    watersheds = [
        Watershed(
            code="WDC-PMKSY-GJ-RJK-04",
            name="Khirasara-Aji Sub-Watershed",
            district="Rajkot",
            state="Gujarat",
            area_ha=4850.0,
            geom_geojson=json.dumps(rajkot_poly),
            baseline_date=date(2021, 6, 15),
            health_index=78.5,
            land_use_summary=json.dumps({"Agriculture": 58, "Scrub/Wasteland": 22, "Water Body": 8, "Built-up": 12})
        ),
        Watershed(
            code="WDC-PMKSY-KA-DHW-09",
            name="Kelageri-Malaprabha Micro-Catchment",
            district="Dharwad",
            state="Karnataka",
            area_ha=6120.0,
            geom_geojson=json.dumps(dharwad_poly),
            baseline_date=date(2021, 8, 20),
            health_index=64.2,
            land_use_summary=json.dumps({"Dry Deciduous Forest": 35, "Rainfed Agriculture": 45, "Water Body": 6, "Fallow": 14})
        ),
        Watershed(
            code="WDC-PMKSY-AP-ATP-18",
            name="Penna Rain-Shadow Ridge Basin",
            district="Ananthapuramu",
            state="Andhra Pradesh",
            area_ha=7400.0,
            geom_geojson=json.dumps(ananthapur_poly),
            baseline_date=date(2021, 5, 10),
            health_index=58.7,
            land_use_summary=json.dumps({"Arid Scrubland": 48, "Millet Agriculture": 36, "Rocky Outcrops": 12, "Water Storage": 4})
        )
    ]
    db.add_all(watersheds)
    db.commit()

    ws_rajkot = watersheds[0]
    ws_dharwad = watersheds[1]
    ws_ananthapur = watersheds[2]

    # 3. Projects under WDC-PMKSY
    projects = [
        Project(
            watershed_id=ws_rajkot.id,
            project_code="WDC2.0-GJ-RJK-P1",
            project_name="Rajkot Semi-Arid Soil & Water Conservation Phase-II",
            sanction_year=2021,
            status="IN_PROGRESS",
            total_budget_inr=18500000.0
        ),
        Project(
            watershed_id=ws_dharwad.id,
            project_code="WDC2.0-KA-DHW-P2",
            project_name="Dharwad Black Cotton Runoff Harvesting Project",
            sanction_year=2021,
            status="IN_PROGRESS",
            total_budget_inr=22400000.0
        ),
        Project(
            watershed_id=ws_ananthapur.id,
            project_code="WDC2.0-AP-ATP-P3",
            project_name="Ananthapur Drought Resilience & Subsurface Infiltration Scheme",
            sanction_year=2021,
            status="IN_PROGRESS",
            total_budget_inr=26800000.0
        )
    ]
    db.add_all(projects)
    db.commit()

    # 4. Interventions (24 structures across the 3 watersheds)
    # We will seed detailed records including our flagship Hero Check Dam: WDC-GJ-RJK-CD-014
    interventions_data = [
        # Rajkot Structures
        {
            "work_id": "WDC-GJ-RJK-CD-014",
            "ws": ws_rajkot,
            "proj": projects[0],
            "type": "Masonry Check Dam",
            "lat": 22.2541,
            "lon": 70.7812,
            "elev": 178.5,
            "slope": 2.4,
            "order": 2,
            "cost": 850000.0,
            "plan_date": date(2022, 3, 10),
            "comp_date": date(2022, 10, 15),
            "status": "COMPLETED",
            "signal": "POSITIVE_SIGNAL",
            "ers": 88.5,
            "ndvi_b": 0.224, "ndvi_c": 0.385, "mndwi_b": -0.12, "mndwi_c": 0.08
        },
        {
            "work_id": "WDC-GJ-RJK-PT-008",
            "ws": ws_rajkot,
            "proj": projects[0],
            "type": "Percolation Tank",
            "lat": 22.2680,
            "lon": 70.8015,
            "elev": 182.0,
            "slope": 1.8,
            "order": 1,
            "cost": 1200000.0,
            "plan_date": date(2022, 4, 1),
            "comp_date": date(2022, 11, 20),
            "status": "COMPLETED",
            "signal": "POSITIVE_SIGNAL",
            "ers": 82.0,
            "ndvi_b": 0.210, "ndvi_c": 0.320, "mndwi_b": -0.15, "mndwi_c": 0.04
        },
        {
            "work_id": "WDC-GJ-RJK-FP-022",
            "ws": ws_rajkot,
            "proj": projects[0],
            "type": "Farm Pond",
            "lat": 22.2420,
            "lon": 70.7650,
            "elev": 172.0,
            "slope": 3.1,
            "order": 1,
            "cost": 250000.0,
            "plan_date": date(2022, 5, 12),
            "comp_date": date(2022, 9, 30),
            "status": "COMPLETED",
            "signal": "INCONCLUSIVE",
            "ers": 68.0,
            "ndvi_b": 0.250, "ndvi_c": 0.265, "mndwi_b": -0.08, "mndwi_c": -0.06
        },
        {
            "work_id": "WDC-GJ-RJK-NB-003",
            "ws": ws_rajkot,
            "proj": projects[0],
            "type": "Earthen Nala Bund",
            "lat": 22.2810,
            "lon": 70.8220,
            "elev": 195.0,
            "slope": 4.2,
            "order": 2,
            "cost": 650000.0,
            "plan_date": date(2022, 6, 1),
            "comp_date": date(2023, 1, 15),
            "status": "COMPLETED",
            "signal": "NEEDS_VERIFICATION",
            "ers": 45.0, # Flagged: High distance deviation
            "ndvi_b": 0.215, "ndvi_c": 0.208, "mndwi_b": -0.14, "mndwi_c": -0.15
        },
        {
            "work_id": "WDC-GJ-RJK-PL-045",
            "ws": ws_rajkot,
            "proj": projects[0],
            "type": "Afforestation / Plantation",
            "lat": 22.2350,
            "lon": 70.7920,
            "elev": 188.0,
            "slope": 5.0,
            "order": 1,
            "cost": 420000.0,
            "plan_date": date(2022, 7, 1),
            "comp_date": date(2023, 8, 10),
            "status": "COMPLETED",
            "signal": "POSITIVE_SIGNAL",
            "ers": 91.0,
            "ndvi_b": 0.180, "ndvi_c": 0.340, "mndwi_b": -0.20, "mndwi_c": -0.15
        },
        {
            "work_id": "WDC-GJ-RJK-GP-019",
            "ws": ws_rajkot,
            "proj": projects[0],
            "type": "Boulder Gully Plug",
            "lat": 22.2720,
            "lon": 70.7550,
            "elev": 204.0,
            "slope": 6.8,
            "order": 1,
            "cost": 150000.0,
            "plan_date": date(2022, 8, 15),
            "comp_date": date(2022, 12, 1),
            "status": "COMPLETED",
            "signal": "INCONCLUSIVE",
            "ers": 72.0,
            "ndvi_b": 0.195, "ndvi_c": 0.210, "mndwi_b": -0.18, "mndwi_c": -0.17
        },
        {
            "work_id": "WDC-GJ-RJK-CD-031",
            "ws": ws_rajkot,
            "proj": projects[0],
            "type": "Masonry Check Dam",
            "lat": 22.2950,
            "lon": 70.7880,
            "elev": 174.0,
            "slope": 2.1,
            "order": 3,
            "cost": 920000.0,
            "plan_date": date(2022, 9, 1),
            "comp_date": date(2023, 3, 20),
            "status": "COMPLETED",
            "signal": "POSITIVE_SIGNAL",
            "ers": 85.0,
            "ndvi_b": 0.230, "ndvi_c": 0.365, "mndwi_b": -0.10, "mndwi_c": 0.05
        },
        {
            "work_id": "WDC-GJ-RJK-FP-055",
            "ws": ws_rajkot,
            "proj": projects[0],
            "type": "Farm Pond",
            "lat": 22.2610,
            "lon": 70.8350,
            "elev": 180.0,
            "slope": 2.9,
            "order": 1,
            "cost": 280000.0,
            "plan_date": date(2023, 1, 10),
            "comp_date": date(2023, 6, 15),
            "status": "COMPLETED",
            "signal": "POSITIVE_SIGNAL",
            "ers": 79.0,
            "ndvi_b": 0.240, "ndvi_c": 0.315, "mndwi_b": -0.12, "mndwi_c": 0.01
        },

        # Dharwad Structures
        {
            "work_id": "WDC-KA-DHW-FP-082",
            "ws": ws_dharwad,
            "proj": projects[1],
            "type": "Farm Pond",
            "lat": 15.4610,
            "lon": 75.0120,
            "elev": 690.0,
            "slope": 2.8,
            "order": 1,
            "cost": 310000.0,
            "plan_date": date(2022, 2, 15),
            "comp_date": date(2022, 8, 25),
            "status": "COMPLETED",
            "signal": "INCONCLUSIVE",
            "ers": 58.0, # High cloud cover in scenes
            "ndvi_b": 0.310, "ndvi_c": 0.325, "mndwi_b": -0.05, "mndwi_c": -0.04
        },
        {
            "work_id": "WDC-KA-DHW-CD-011",
            "ws": ws_dharwad,
            "proj": projects[1],
            "type": "Check Dam",
            "lat": 15.4780,
            "lon": 75.0350,
            "elev": 675.0,
            "slope": 3.0,
            "order": 2,
            "cost": 890000.0,
            "plan_date": date(2022, 3, 20),
            "comp_date": date(2022, 10, 10),
            "status": "COMPLETED",
            "signal": "POSITIVE_SIGNAL",
            "ers": 86.0,
            "ndvi_b": 0.280, "ndvi_c": 0.410, "mndwi_b": -0.08, "mndwi_c": 0.09
        },
        {
            "work_id": "WDC-KA-DHW-CT-034",
            "ws": ws_dharwad,
            "proj": projects[1],
            "type": "Continuous Contour Trench",
            "lat": 15.4350,
            "lon": 74.9850,
            "elev": 720.0,
            "slope": 8.5,
            "order": 1,
            "cost": 490000.0,
            "plan_date": date(2022, 4, 10),
            "comp_date": date(2022, 11, 30),
            "status": "COMPLETED",
            "signal": "POSITIVE_SIGNAL",
            "ers": 80.0,
            "ndvi_b": 0.220, "ndvi_c": 0.335, "mndwi_b": -0.22, "mndwi_c": -0.16
        },
        {
            "work_id": "WDC-KA-DHW-NB-029",
            "ws": ws_dharwad,
            "proj": projects[1],
            "type": "Nala Bund",
            "lat": 15.4920,
            "lon": 75.0510,
            "elev": 660.0,
            "slope": 2.2,
            "order": 2,
            "cost": 720000.0,
            "plan_date": date(2022, 5, 5),
            "comp_date": date(2023, 1, 20),
            "status": "COMPLETED",
            "signal": "NEGATIVE_SIGNAL",
            "ers": 74.0,
            "ndvi_b": 0.350, "ndvi_c": 0.285, "mndwi_b": 0.02, "mndwi_c": -0.09
        },

        # Ananthapuramu Structures
        {
            "work_id": "WDC-AP-ATP-GC-003",
            "ws": ws_ananthapur,
            "proj": projects[2],
            "type": "Gully Control Structure",
            "lat": 14.6620,
            "lon": 77.6250,
            "elev": 345.0,
            "slope": 4.8,
            "order": 1,
            "cost": 210000.0,
            "plan_date": date(2022, 2, 10),
            "comp_date": date(2022, 9, 15),
            "status": "COMPLETED",
            "signal": "NEEDS_VERIFICATION",
            "ers": 42.0, # Flagged: GPS mismatch 142m away
            "ndvi_b": 0.160, "ndvi_c": 0.155, "mndwi_b": -0.22, "mndwi_c": -0.24
        },
        {
            "work_id": "WDC-AP-ATP-CD-018",
            "ws": ws_ananthapur,
            "proj": projects[2],
            "type": "Check Dam",
            "lat": 14.6950,
            "lon": 77.6480,
            "elev": 330.0,
            "slope": 1.9,
            "order": 2,
            "cost": 950000.0,
            "plan_date": date(2022, 4, 15),
            "comp_date": date(2022, 12, 10),
            "status": "COMPLETED",
            "signal": "POSITIVE_SIGNAL",
            "ers": 89.0,
            "ndvi_b": 0.175, "ndvi_c": 0.285, "mndwi_b": -0.19, "mndwi_c": 0.02
        },
        {
            "work_id": "WDC-AP-ATP-PT-009",
            "ws": ws_ananthapur,
            "proj": projects[2],
            "type": "Percolation Tank",
            "lat": 14.6400,
            "lon": 77.5850,
            "elev": 360.0,
            "slope": 2.5,
            "order": 1,
            "cost": 1350000.0,
            "plan_date": date(2022, 6, 1),
            "comp_date": date(2023, 2, 28),
            "status": "COMPLETED",
            "signal": "POSITIVE_SIGNAL",
            "ers": 84.0,
            "ndvi_b": 0.180, "ndvi_c": 0.270, "mndwi_b": -0.18, "mndwi_c": 0.05
        },
        {
            "work_id": "WDC-AP-ATP-SD-005",
            "ws": ws_ananthapur,
            "proj": projects[2],
            "type": "Subsurface Dyke",
            "lat": 14.7150,
            "lon": 77.6700,
            "elev": 320.0,
            "slope": 1.2,
            "order": 3,
            "cost": 1100000.0,
            "plan_date": date(2022, 7, 10),
            "comp_date": date(2023, 4, 15),
            "status": "COMPLETED",
            "signal": "POSITIVE_SIGNAL",
            "ers": 81.0,
            "ndvi_b": 0.190, "ndvi_c": 0.290, "mndwi_b": -0.15, "mndwi_c": -0.02
        }
    ]

    interventions_entities = []
    for item in interventions_data:
        iv = Intervention(
            work_id=item["work_id"],
            watershed_id=item["ws"].id,
            project_id=item["proj"].id,
            structure_type=item["type"],
            latitude=item["lat"],
            longitude=item["lon"],
            elevation_m=item["elev"],
            slope_pct=item["slope"],
            stream_order=item["order"],
            sanctioned_cost_inr=item["cost"],
            planned_date=item["plan_date"],
            completion_date=item["comp_date"],
            status=item["status"]
        )
        db.add(iv)
        interventions_entities.append((iv, item))
    db.commit()

    # 5. Field Evidence & Field Visits
    # Provide realistic photos, SHA-256 hashes, EXIF parameters
    sample_images = [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80", # Check Dam full of water
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80", # Farm Pond / agricultural basin
        "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=1200&q=80", # Watershed earthen embankment
        "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80"  # Stream runoff structure
    ]

    for idx, (iv, item) in enumerate(interventions_entities):
        # Determine distance deviation: Check Dam 014 = 6.2m; Gully Control 003 = 142.5m; Nala Bund 003 = 88.0m
        if iv.work_id == "WDC-GJ-RJK-CD-014":
            dist = 6.2
            photo_lat = iv.latitude + 0.00005
            photo_lon = iv.longitude + 0.00004
            verified = True
        elif iv.work_id == "WDC-AP-ATP-GC-003":
            dist = 142.5
            photo_lat = iv.latitude + 0.00115
            photo_lon = iv.longitude + 0.00085
            verified = False
        elif iv.work_id == "WDC-GJ-RJK-NB-003":
            dist = 88.0
            photo_lat = iv.latitude + 0.00072
            photo_lon = iv.longitude + 0.00045
            verified = False
        else:
            dist = round(4.5 + (idx % 8) * 2.2, 1)
            photo_lat = iv.latitude + 0.00003
            photo_lon = iv.longitude + 0.00002
            verified = True

        img_url = sample_images[idx % len(sample_images)]
        img_hash = hashlib.sha256(f"{iv.work_id}-{idx}-jaldrishti".encode()).hexdigest()

        evidence = FieldEvidence(
            intervention_id=iv.id,
            uploaded_by="Ramesh Solanki (Field Surveyor)",
            image_url=img_url,
            latitude=photo_lat,
            longitude=photo_lon,
            gps_accuracy_m=3.8,
            distance_to_asset_m=dist,
            capture_time=datetime(2023, 11, 14, 11, 24, 0, tzinfo=timezone.utc),
            exif_valid=True,
            device_model="Samsung Galaxy M33 GNSS (L1+L5)",
            image_sha256=img_hash,
            condition_rating="INTACT" if dist <= 25 else "SILTED",
            field_notes=f"Post-monsoon inspection of {iv.structure_type}. Structure intact with visible storage impoundment.",
            quality_score=0.92,
            is_verified=verified,
            reviewer_id="Vikram Mehta (District Officer)" if verified else None,
            review_notes="EXIF confirmed and coordinate matches planned nala axis within 7 meters." if verified else None,
            reviewed_at=datetime(2023, 11, 20, 15, 30, 0, tzinfo=timezone.utc) if verified else None
        )
        db.add(evidence)

        # Field visit record
        visit = FieldVisit(
            intervention_id=iv.id,
            inspector_name="Ramesh Solanki (Assistant Engineer)",
            visit_date=date(2023, 11, 14),
            inspection_notes=f"Conducted physical measurement for {iv.structure_type}. Masonry crest wall and apron show no seepage cracks.",
            structure_condition="FUNCTIONAL",
            siltation_level="LOW" if dist <= 25 else "MODERATE",
            recommended_action="Periodic desiltation recommended before next kharif onset."
        )
        db.add(visit)

        # 6. Satellite Observations (24 monthly intervals: Oct 2021 to Sep 2023)
        # Demonstrating pre vs post intervention trajectory
        base_ndvi = item["ndvi_b"]
        curr_ndvi = item["ndvi_c"]
        base_mndwi = item["mndwi_b"]
        curr_mndwi = item["mndwi_c"]

        start_dt = date(2021, 10, 1)
        for m in range(24):
            obs_dt = start_dt + timedelta(days=m * 30.5)
            # progressive interpolation towards post-intervention value
            progress = min(1.0, m / 20.0)
            seasonal_factor = 0.08 if obs_dt.month in [9, 10, 11] else (-0.05 if obs_dt.month in [4, 5] else 0.0)
            
            n_val = round(base_ndvi + (curr_ndvi - base_ndvi) * progress + seasonal_factor, 4)
            w_val = round(base_mndwi + (curr_mndwi - base_mndwi) * progress + (seasonal_factor * 0.8), 4)
            m_val = round(n_val * 0.75, 4)
            lst_val = round(34.5 - (n_val * 12.0), 1)

            # Cloud cover
            cloud_pct = 28.0 if obs_dt.month in [7, 8] else round(2.0 + (m % 5) * 1.5, 1)

            sat_obs = SatelliteObservation(
                intervention_id=iv.id,
                observation_date=obs_dt,
                sensor="Sentinel-2 MSI",
                scene_id=f"S2A_MSIL2A_{obs_dt.strftime('%Y%m%d')}_R014_T42",
                cloud_cover_pct=cloud_pct,
                ndvi_mean=n_val,
                mndwi_mean=w_val,
                ndmi_mean=m_val,
                lst_celsius=lst_val,
                is_cloud_free=(cloud_pct <= 20.0)
            )
            db.add(sat_obs)

        # 7. Outcome Assessment Record
        ai_narrative = (
            f"Observed positive vegetation recovery (ΔNDVI: +{curr_ndvi - base_ndvi:.3f}) and "
            f"prolonged surface water retention (ΔMNDWI: +{curr_mndwi - base_mndwi:.3f}) within the 100m catchment zone. "
            f"Evidence readiness score is {item['ers']}/100. Observational trend aligns with intended recharge function."
        ) if item["signal"] == "POSITIVE_SIGNAL" else (
            f"Discrepancy detected: GPS deviation is {dist:.1f}m. Field re-verification task dispatched to verify actual structure placement."
        )

        oa = OutcomeAssessment(
            intervention_id=iv.id,
            before_window_start=date(2021, 10, 1),
            before_window_end=date(2021, 12, 31),
            after_window_start=date(2023, 10, 1),
            after_window_end=date(2023, 12, 31),
            baseline_ndvi=base_ndvi,
            current_ndvi=curr_ndvi,
            ndvi_delta=round(curr_ndvi - base_ndvi, 4),
            baseline_mndwi=base_mndwi,
            current_mndwi=curr_mndwi,
            mndwi_delta=round(curr_mndwi - base_mndwi, 4),
            baseline_ndmi=round(base_ndvi * 0.7, 4),
            current_ndmi=round(curr_ndvi * 0.7, 4),
            ndmi_delta=round((curr_ndvi - base_ndvi) * 0.7, 4),
            evidence_readiness_score=item["ers"],
            decision_status=item["signal"],
            ai_summary_narrative=ai_narrative,
            evaluated_at=datetime.now(timezone.utc)
        )
        db.add(oa)

        # 8. Verification Task if flagged
        if item["signal"] == "NEEDS_VERIFICATION":
            v_task = VerificationTask(
                intervention_id=iv.id,
                priority="HIGH" if dist > 100 else "MEDIUM",
                failure_reason="GPS_DISCREPANCY" if dist > 50 else "NEGATIVE_VEGETATION_TREND",
                status="PENDING",
                assigned_officer="Ramesh Solanki (Field Surveyor)",
                reviewer_notes=f"Flagged automatically: Photo coordinate deviation ({dist}m) exceeds 50m geofence tolerance. Please revisit site."
            )
            db.add(v_task)

            alert = Alert(
                watershed_id=item["ws"].id,
                intervention_id=iv.id,
                severity="CRITICAL" if dist > 100 else "WARNING",
                alert_type="EVIDENCE_MISMATCH",
                title=f"Evidence Geofence Exception on {iv.work_id}",
                message=f"Photo captured 142m from planned civil axis for {iv.structure_type}. Requires field re-verification.",
                is_resolved=False
            )
            db.add(alert)

    # 9. Audit Events
    audit1 = AuditEvent(
        entity_type="INTERVENTION",
        entity_id=interventions_entities[0][0].id,
        event_type="VERIFY",
        actor_id="Vikram Mehta",
        actor_role="district_officer",
        previous_state=json.dumps({"status": "PENDING_VERIFICATION", "ers": 82.0}),
        updated_state=json.dumps({"status": "VERIFIED", "ers": 88.5}),
        ip_address="10.14.8.42"
    )
    db.add(audit1)

    db.commit()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    db = SessionLocal()
    seed_database(db)
    db.close()
