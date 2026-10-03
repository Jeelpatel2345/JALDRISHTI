# JALDRISHTI — AI + GIS Watershed Intelligence & Field Evidence Platform

> **Smart India Hackathon 2026 • Problem Statement SIH26015**  
> **Challenge:** *Application of Geospatial Techniques for visualization and analysis to interpret Geo-Coded Images to enhance watershed Development Outcomes.*  
> **Organization:** Ministry of Rural Development (MoRD) / Department of Land Resources (DoLR)  
> **Program Alignment:** Watershed Development Component of Pradhan Mantri Krishi Sinchayee Yojana (WDC-PMKSY 2.0)  

---

## 1. Executive Summary

Existing watershed development programs across India collect over 1.5 million geo-tagged photographs and baseline entries in government MIS databases. However, **documentation is not outcome evidence**:
- A field photograph proves a structure was visited; it does not prove ecological recovery or groundwater recharge.
- Satellite observations show temporal change, but do not prove that a specific civil structure caused it.
- Small structures (check dams, gully plugs) fall within mixed 10m–30m satellite pixels, creating signal ambiguity.

**JALDRISHTI** bridges this gap through an **Unbroken Spatial Evidence Chain**:

$$\text{Watershed} \longrightarrow \text{Intervention Asset} \longrightarrow \text{Field Evidence (EXIF + Hash)} \longrightarrow \text{Multi-Spectral Satellite Time-Series} \longrightarrow \text{Terrain Context (DEM)} \longrightarrow \text{Outcome Indicators} \longrightarrow \text{Confidence Score} \longrightarrow \text{Human Verification} \longrightarrow \text{Statutory Report}$$

The platform strictly enforces **scientific honesty**: remote sensing establishes *observational association and trend*, while ground truth confirms physical execution.

---

## 2. Platform Architecture

JALDRISHTI is built on a decoupled, production-ready full-stack architecture:

- **Frontend (SPA):** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Leaflet (interactive vector and polygon GIS), Recharts (24-month multi-spectral time series curves), and Framer Motion.
- **Backend (API):** FastAPI (Python 3.11), Pydantic v2 schemas, JWT authentication, RBAC middleware, and Haversine geospatial proximity engine.
- **Database (Persistence):** Relational & PostGIS-compatible SQLAlchemy schema with automated SQLite local zero-setup fallback and instant PostgreSQL/PostGIS connectivity.
- **Explainable AI Engine:** Deterministic rule-based synthesis translating multi-spectral deltas into plain-language executive briefs, with pluggable external LLM gateways (OpenAI, Gemini, Ollama).
- **Statutory Dossier Engine:** Audit-ready one-page verification reports formatted for Department of Land Resources compliance.

```
                    +------------------------------------------+
                    |        JALDRISHTI Web Application        |
                    |   React 18 + TS + Tailwind + Leaflet     |
                    +------------------------------------------+
                                         |
                                         | (RESTful JSON / GeoJSON)
                                         v
                    +------------------------------------------+
                    |          FastAPI Application Core        |
                    |   Pydantic v2 Schemas + JWT + RBAC       |
                    +------------------------------------------+
                      /                 |                  \
                     /                  |                   \
                    v                   v                    v
         +-------------------+ +-------------------+ +-------------------+
         | PostGIS / SQLite  | | Satellite Engine  | | Explainable AI    |
         | Spatial Entities  | | Sentinel-2 / DEM  | | Narrative Triage  |
         +-------------------+ +-------------------+ +-------------------+
```

---

## 3. Core Operational Modules

1. **Public Landing & Problem Statement (`/`):** Establishes the 3-step evidence loop (*Capture $\rightarrow$ Analyze $\rightarrow$ Verify*) and presents SIH26015 context.
2. **Command Center (`/dashboard`):** Situation room with live KPI gauges, interactive GIS map, priority action queue, and 12-month greening trajectory.
3. **Watershed Explorer (`/watersheds`):** Filterable sub-basin registry with health index ratings, LULC breakdown, and micro-catchment boundaries.
4. **Interventions Registry (`/interventions`):** Complete asset register of check dams, farm ponds, percolation tanks, and nala bunds linked to WDC-PMKSY Work IDs.
5. **Interactive Evidence Drawer:** Flagship slide-over inspection panel displaying photo EXIF, SHA-256 hash, distance-to-asset meter, 24-month NDVI/MNDWI curves, and reviewer adjudication buttons.
6. **Field Evidence Vault (`/evidence`):** Forensic repository with client-side GNSS verification, distance deviation flags ($>50\text{m}$ auto-exception), and upload simulator.
7. **Earth Observation Workbench (`/analytics`):** Before-vs-After Split Screen Swipe slider, 24-month Sentinel-2 curves, and DEM elevation cross-sections.
8. **Outcome Assessment Scorecards (`/outcomes`):** 4-Quadrant outcome matrix with transparent formula weights ($0.25 Q_{\text{photo}} + 0.20 V_{\text{geo}} + 0.20 C_{\text{temp}} + 0.15 M_{\text{work}} + 0.20 S_{\text{sat}}$).
9. **Verification Triage Desk (`/verification`):** Ranked exception queue for high-priority audits (e.g. GPS discrepancy or vegetative stress).
10. **Statutory Dossiers & PDF Reports (`/reports`):** One-click printable compliance reports with digital sign-off blocks.
11. **Scientific Methodology & Boundaries (`/methodology`):** Mathematical formulas, sensor resolutions, and the *What JALDRISHTI Does Not Claim* scientific honesty charter.
12. **1-Click Operational Persona Simulator (`/login`):** Instant role switcher for evaluators (District Director, Field Surveyor, RS Analyst, Quality Auditor, Super Admin).

---

## 4. Quickstart Guide (Local Execution)

Both backend and frontend run locally out of the box with zero external configuration required.

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Step 1: Start the Backend (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend will automatically create the database schema and seed the realistic demo dataset (Rajkot, Dharwad, Ananthapuramu) on first boot.*
- Interactive Swagger API Docs: `http://localhost:8000/docs`

### Step 2: Start the Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
- Open your browser at: `http://localhost:5173`

---

## 5. Running the Automated Test Suite

JALDRISHTI includes automated unit and integration tests covering API endpoints, data integrity, and role-based access:

```bash
cd backend
python -m pytest test_api.py -v
```

All 8 core test suites validate:
- Root and health endpoints
- Dashboard aggregated KPIs
- Watershed and intervention registry queries
- GeoJSON boundary and marker serialization
- Hero asset forensic evidence bundle retrieval
- Multi-spectral time series and outcome scorecard calculations
- Role simulator token generation

---

## 6. SIH 4-Minute Winning Demo Script

1. **00:00 - 00:45 (The Problem & Hook):** Open `/`. Explain: *"Under WDC-PMKSY, millions of geo-tagged photos exist, but documentation is not outcome evidence. A check dam photo does not prove water recharge. JALDRISHTI connects ground truth with 24-month Sentinel-2 curves and terrain context into an auditable evidence chain."*
2. **00:45 - 01:45 (Command Center):** Click **Launch Command Center** (`/dashboard`). Point out the live telemetry for 4,850 ha of Rajkot watershed, the clustered intervention map, and the Priority Action Queue on the right.
3. **01:45 - 02:45 (The Hero Evidence Bundle):** Click Check Dam **`WDC-GJ-RJK-CD-014`**. The Evidence Drawer slides over without losing map context:
   - Ground Truth: Photo with EXIF tags, timestamp, SHA-256 hash, and distance check (6.2m from planned civil axis).
   - Remote Sensing: Sentinel-2 shows an NDVI increase of $+0.161$ and water persistence expanding from 1.2 to 4.1 months post-monsoon.
   - Terrain Check: Placed on a 2nd-order stream with optimal 2.4% slope.
4. **02:45 - 03:30 (Explainable AI & Triage):** Show the AI summary: *"Observed positive vegetation recovery; water persistence extended; high confidence."* Demonstrate exception triage: show an asset flagged with 142m GPS deviation requiring field re-verification.
5. **03:30 - 04:00 (Statutory Reporting):** Open `/reports` and show the one-page statutory dossier ready for MoRD compliance sign-off. Finish with: *"JALDRISHTI turns compliance records into evidence-backed governance."*

---

## 7. License & Attribution
Developed for Smart India Hackathon 2026 (SIH26015) in alignment with Ministry of Rural Development & Department of Land Resources (DoLR) guidelines.
