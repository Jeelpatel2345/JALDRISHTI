-- ==============================================================================
-- JALDRISHTI: AI + GIS Watershed Intelligence Platform
-- Master Supabase PostgreSQL Database Schema & Migration Script
-- Compatible with Supabase SQL Editor (Run in 1-Click)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'district_officer' 
        CHECK (role IN ('super_admin', 'state_admin', 'district_officer', 'field_surveyor', 'analyst', 'reviewer', 'public')),
    district TEXT DEFAULT 'Rajkot',
    state TEXT DEFAULT 'Gujarat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WATERSHEDS TABLE
CREATE TABLE IF NOT EXISTS public.watersheds (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    area_ha NUMERIC(10, 2) NOT NULL,
    baseline_date DATE NOT NULL,
    health_index NUMERIC(5, 2) NOT NULL DEFAULT 65.0,
    geom_geojson JSONB NOT NULL,
    land_use_summary JSONB,
    intervention_count INT DEFAULT 0,
    verified_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INTERVENTIONS TABLE
CREATE TABLE IF NOT EXISTS public.interventions (
    id TEXT PRIMARY KEY,
    work_id TEXT NOT NULL UNIQUE,
    watershed_id TEXT NOT NULL REFERENCES public.watersheds(id) ON DELETE CASCADE,
    watershed_name TEXT NOT NULL,
    structure_type TEXT NOT NULL,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    elevation_m NUMERIC(8, 2),
    slope_pct NUMERIC(5, 2),
    stream_order INT DEFAULT 1,
    sanctioned_cost_inr NUMERIC(12, 2) NOT NULL,
    expenditure_inr NUMERIC(12, 2) DEFAULT 0,
    approval_status TEXT NOT NULL DEFAULT 'APPROVED_ACTIVE'
        CHECK (approval_status IN ('PROPOSED', 'ESTIMATED', 'SANCTIONED', 'IN_PROGRESS', 'COMPLETED_PENDING_VERIFICATION', 'APPROVED_ACTIVE', 'REJECTED_DISPUTED')),
    contractor_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FIELD EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS public.field_evidence (
    id TEXT PRIMARY KEY,
    intervention_id TEXT NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
    stage TEXT NOT NULL CHECK (stage IN ('pre_construction', 'during_construction', 'post_construction', 'outcome_evaluation')),
    photo_url TEXT NOT NULL,
    exif_latitude NUMERIC(10, 6) NOT NULL,
    exif_longitude NUMERIC(10, 6) NOT NULL,
    exif_timestamp TIMESTAMPTZ NOT NULL,
    distance_delta_meters NUMERIC(8, 2) NOT NULL,
    is_geofence_valid BOOLEAN NOT NULL DEFAULT true,
    tampering_score NUMERIC(5, 2) NOT NULL DEFAULT 0.05,
    verification_status TEXT NOT NULL DEFAULT 'verified'
        CHECK (verification_status IN ('pending', 'verified', 'flagged_distance', 'flagged_tampering', 'rejected')),
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VERIFICATION TASKS TABLE
CREATE TABLE IF NOT EXISTS public.verification_tasks (
    id TEXT PRIMARY KEY,
    task_type TEXT NOT NULL,
    intervention_id TEXT NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status TEXT NOT NULL DEFAULT 'PENDING_OFFICER_REVIEW' CHECK (status IN ('PENDING_OFFICER_REVIEW', 'RESOLVED_ACCEPTED', 'DISMISSED_INVALID')),
    assigned_to TEXT,
    flag_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watersheds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public / authenticated read access to core geospatial entities
CREATE POLICY "Allow public read watersheds" ON public.watersheds FOR SELECT USING (true);
CREATE POLICY "Allow public read interventions" ON public.interventions FOR SELECT USING (true);
CREATE POLICY "Allow public read evidence" ON public.field_evidence FOR SELECT USING (true);
CREATE POLICY "Allow public read tasks" ON public.verification_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public read audit" ON public.audit_logs FOR SELECT USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow auth insert evidence" ON public.field_evidence FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow auth insert audit" ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow auth update interventions" ON public.interventions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth update profiles" ON public.profiles FOR ALL USING (auth.uid() = id);

-- ==============================================================================
-- 9. SEED DATA ACROSS INDIA'S AGRO-CLIMATIC WATERSHED ZONES
-- ==============================================================================

-- Watershed 1: Ralegan Siddhi, Ahmednagar (Maharashtra)
INSERT INTO public.watersheds (id, code, name, district, state, area_ha, baseline_date, health_index, geom_geojson, land_use_summary, intervention_count, verified_count)
VALUES (
    'ws-ralegan-01',
    'WDC-PMKSY-MH-AHM-01',
    'Ralegan Siddhi Sub-Basin',
    'Ahmednagar',
    'Maharashtra',
    5240.00,
    '2021-04-10',
    89.4,
    '{"type": "Polygon", "coordinates": [[[74.450, 19.000], [74.520, 18.990], [74.550, 19.050], [74.500, 19.090], [74.430, 19.060], [74.450, 19.000]]]}',
    '{"Perennial Horticulture": 42, "Cereal Crops": 36, "Percolation Tanks": 10, "Homesteads": 12}',
    6,
    6
) ON CONFLICT (id) DO NOTHING;

-- Watershed 2: Arvari River Catchment, Alwar / Laporiya (Rajasthan)
INSERT INTO public.watersheds (id, code, name, district, state, area_ha, baseline_date, health_index, geom_geojson, land_use_summary, intervention_count, verified_count)
VALUES (
    'ws-alwar-02',
    'WDC-PMKSY-RJ-ALW-05',
    'Arvari River Catchment (Laporiya-Bhanwata)',
    'Alwar',
    'Rajasthan',
    6850.00,
    '2021-06-01',
    82.7,
    '{"type": "Polygon", "coordinates": [[[76.220, 27.280], [76.310, 27.270], [76.340, 27.350], [76.280, 27.390], [76.200, 27.360], [76.220, 27.280]]]}',
    '{"Johad Water Recharge": 24, "Pastureland Chauka": 38, "Mustard/Wheat": 28, "Rocky Ravines": 10}',
    5,
    5
) ON CONFLICT (id) DO NOTHING;

-- Watershed 3: Jhabua Tribal Catchment (Madhya Pradesh)
INSERT INTO public.watersheds (id, code, name, district, state, area_ha, baseline_date, health_index, geom_geojson, land_use_summary, intervention_count, verified_count)
VALUES (
    'ws-jhabua-03',
    'WDC-PMKSY-MP-JHB-11',
    'Jhabua Bheel Tribal Catchment',
    'Jhabua',
    'Madhya Pradesh',
    4910.00,
    '2021-07-15',
    75.2,
    '{"type": "Polygon", "coordinates": [[[74.520, 22.710], [74.610, 22.700], [74.640, 22.780], [74.580, 22.820], [74.500, 22.790], [74.520, 22.710]]]}',
    '{"Agroforestry": 34, "Contour Bunding": 41, "Seasonal Streams": 15, "Settlements": 10}',
    5,
    4
) ON CONFLICT (id) DO NOTHING;

-- Watershed 4: Shirapur Semi-Arid Basin, Solapur (Maharashtra)
INSERT INTO public.watersheds (id, code, name, district, state, area_ha, baseline_date, health_index, geom_geojson, land_use_summary, intervention_count, verified_count)
VALUES (
    'ws-shirapur-04',
    'WDC-PMKSY-MH-SOL-08',
    'Shirapur Semi-Arid Ridge Watershed',
    'Solapur',
    'Maharashtra',
    5890.00,
    '2021-09-10',
    71.8,
    '{"type": "Polygon", "coordinates": [[[75.830, 17.580], [75.920, 17.570], [75.950, 17.650], [75.890, 17.690], [75.810, 17.660], [75.830, 17.580]]]}',
    '{"Rainfed Jowar": 48, "Continuous Contour Trenches": 28, "Farm Ponds": 14, "Fallow Scrub": 10}',
    4,
    4
) ON CONFLICT (id) DO NOTHING;

-- Watershed 5: Penna Rain-Shadow Catchment, Anantapur (Andhra Pradesh)
INSERT INTO public.watersheds (id, code, name, district, state, area_ha, baseline_date, health_index, geom_geojson, land_use_summary, intervention_count, verified_count)
VALUES (
    'ws-atp-05',
    'WDC-PMKSY-AP-ATP-18',
    'Penna Rain-Shadow Catchment',
    'Ananthapuramu',
    'Andhra Pradesh',
    7400.00,
    '2021-05-10',
    67.4,
    '{"type": "Polygon", "coordinates": [[[77.540, 14.620], [77.650, 14.610], [77.680, 14.710], [77.610, 14.740], [77.530, 14.700], [77.540, 14.620]]]}',
    '{"Groundnut/Millet": 40, "Farm Pond Network": 18, "Arid Wasteland": 32, "Horticulture": 10}',
    4,
    3
) ON CONFLICT (id) DO NOTHING;

-- Watershed 6: Bhagirathi Springshed, Tehri Garhwal (Uttarakhand)
INSERT INTO public.watersheds (id, code, name, district, state, area_ha, baseline_date, health_index, geom_geojson, land_use_summary, intervention_count, verified_count)
VALUES (
    'ws-tehri-06',
    'WDC-PMKSY-UK-TEH-03',
    'Bhagirathi Upper Springshed Complex',
    'Tehri Garhwal',
    'Uttarakhand',
    3820.00,
    '2021-10-05',
    84.6,
    '{"type": "Polygon", "coordinates": [[[78.430, 30.340], [78.510, 30.330], [78.530, 30.410], [78.470, 30.440], [78.410, 30.400], [78.430, 30.340]]]}',
    '{"Sub-Himalayan Pine Forest": 52, "Terrace Cultivation": 28, "Spring Catchment": 12, "Villages": 8}',
    4,
    4
) ON CONFLICT (id) DO NOTHING;

-- Watershed 7: Khirasara-Aji Sub-Watershed, Rajkot (Gujarat)
INSERT INTO public.watersheds (id, code, name, district, state, area_ha, baseline_date, health_index, geom_geojson, land_use_summary, intervention_count, verified_count)
VALUES (
    'ws-rajkot-07',
    'WDC-PMKSY-GJ-RJK-04',
    'Khirasara-Aji Sub-Watershed',
    'Rajkot',
    'Gujarat',
    4850.00,
    '2021-06-15',
    78.5,
    '{"type": "Polygon", "coordinates": [[[70.745, 22.220], [70.825, 22.210], [70.860, 22.260], [70.835, 22.310], [70.750, 22.290], [70.745, 22.220]]]}',
    '{"Cotton/Groundnut": 58, "Scrub/Wasteland": 22, "Check Dam Water Bodies": 12, "Built-up": 8}',
    8,
    6
) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 10. REAL-WORLD INTERVENTION STRUCTURES
-- ==============================================================================

-- Ahmednagar, MH Interventions
INSERT INTO public.interventions (id, work_id, watershed_id, watershed_name, structure_type, latitude, longitude, elevation_m, slope_pct, stream_order, sanctioned_cost_inr, expenditure_inr, approval_status, contractor_name)
VALUES
('iv-ralegan-01', 'WDC-MH-AHM-PT-001', 'ws-ralegan-01', 'Ralegan Siddhi Sub-Basin', 'Percolation Tank with Silt Trap', 19.0425, 74.4981, 642.0, 1.8, 3, 1420000, 1380000, 'APPROVED_ACTIVE', 'Ralegan Water User Association'),
('iv-ralegan-02', 'WDC-MH-AHM-CCT-002', 'ws-ralegan-01', 'Ralegan Siddhi Sub-Basin', 'Continuous Contour Trenches (Ridge)', 19.0610, 74.4820, 680.0, 6.2, 1, 650000, 645000, 'APPROVED_ACTIVE', 'Gram Vikas Sanstha')
ON CONFLICT (id) DO NOTHING;

-- Alwar, RJ Interventions
INSERT INTO public.interventions (id, work_id, watershed_id, watershed_name, structure_type, latitude, longitude, elevation_m, slope_pct, stream_order, sanctioned_cost_inr, expenditure_inr, approval_status, contractor_name)
VALUES
('iv-alwar-01', 'WDC-RJ-ALW-JD-001', 'ws-alwar-02', 'Arvari River Catchment (Laporiya-Bhanwata)', 'Traditional Earthen Johad Bund', 27.3210, 76.2750, 290.0, 1.5, 2, 920000, 890000, 'APPROVED_ACTIVE', 'Tarun Jal Mandal'),
('iv-alwar-02', 'WDC-RJ-ALW-CHK-002', 'ws-alwar-02', 'Arvari River Catchment (Laporiya-Bhanwata)', 'Chauka Grassland Moisture System', 27.3450, 76.2910, 310.0, 2.1, 1, 580000, 560000, 'APPROVED_ACTIVE', 'Alwar Watershed Cell')
ON CONFLICT (id) DO NOTHING;

-- Jhabua, MP Interventions
INSERT INTO public.interventions (id, work_id, watershed_id, watershed_name, structure_type, latitude, longitude, elevation_m, slope_pct, stream_order, sanctioned_cost_inr, expenditure_inr, approval_status, contractor_name)
VALUES
('iv-jhabua-01', 'WDC-MP-JHB-LBC-001', 'ws-jhabua-03', 'Jhabua Bheel Tribal Catchment', 'Loose Boulder Check Dam Series', 22.7540, 74.5680, 370.0, 4.8, 2, 450000, 440000, 'APPROVED_ACTIVE', 'Halma Shramdaan Collective'),
('iv-jhabua-02', 'WDC-MP-JHB-FP-002', 'ws-jhabua-03', 'Jhabua Bheel Tribal Catchment', 'Community Farm Pond (Khet Talab)', 22.7720, 74.5890, 360.0, 1.9, 1, 520000, 510000, 'APPROVED_ACTIVE', 'Jhabua DWDU')
ON CONFLICT (id) DO NOTHING;

-- Tehri Garhwal, UK Interventions
INSERT INTO public.interventions (id, work_id, watershed_id, watershed_name, structure_type, latitude, longitude, elevation_m, slope_pct, stream_order, sanctioned_cost_inr, expenditure_inr, approval_status, contractor_name)
VALUES
('iv-tehri-01', 'WDC-UK-TEH-SPR-001', 'ws-tehri-06', 'Bhagirathi Upper Springshed Complex', 'Spring Chamber & Recharge Pit', 30.3720, 78.4650, 1420.0, 14.5, 1, 380000, 375000, 'APPROVED_ACTIVE', 'Garhwal Jal Nigam'),
('iv-tehri-02', 'WDC-UK-TEH-TER-002', 'ws-tehri-06', 'Bhagirathi Upper Springshed Complex', 'Bench Terrace Vegetative Infiltration', 30.3890, 78.4810, 1510.0, 18.0, 1, 480000, 470000, 'APPROVED_ACTIVE', 'Himalayan Spring Mission')
ON CONFLICT (id) DO NOTHING;

-- Rajkot, GJ Interventions
INSERT INTO public.interventions (id, work_id, watershed_id, watershed_name, structure_type, latitude, longitude, elevation_m, slope_pct, stream_order, sanctioned_cost_inr, expenditure_inr, approval_status, contractor_name)
VALUES
('iv-cd-014', 'WDC-GJ-RJK-CD-014', 'ws-rajkot-07', 'Khirasara-Aji Sub-Watershed', 'Masonry Check Dam', 22.2541, 70.7812, 178.5, 2.4, 2, 850000, 842000, 'APPROVED_ACTIVE', 'Saurashtra Water Works Corp'),
('iv-fp-089', 'WDC-GJ-RJK-FP-089', 'ws-rajkot-07', 'Khirasara-Aji Sub-Watershed', 'Community Farm Pond', 22.2715, 70.8124, 185.0, 1.2, 1, 420000, 415000, 'APPROVED_ACTIVE', 'Khirasara Farmer Producer Org')
ON CONFLICT (id) DO NOTHING;
