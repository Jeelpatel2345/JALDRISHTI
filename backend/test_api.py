import pytest
from starlette.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "JALDRISHTI"
    assert data["sih_problem_statement"] == "SIH26015"

def test_dashboard_overview():
    response = client.get("/api/v1/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_watersheds"] >= 3
    assert data["total_interventions"] >= 15
    assert "priority_queue" in data

def test_watersheds_list():
    response = client.get("/api/v1/watersheds")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert any("Khirasara" in ws["name"] for ws in data)

def test_interventions_list():
    response = client.get("/api/v1/interventions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 15
    hero_cd = next((i for i in data if i["work_id"] == "WDC-GJ-RJK-CD-014"), None)
    assert hero_cd is not None

def test_gis_geojson():
    response = client.get("/api/v1/gis/watersheds/geojson")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 3

    response2 = client.get("/api/v1/gis/interventions/geojson")
    assert response2.status_code == 200
    data2 = response2.json()
    assert len(data2["features"]) >= 15

def test_hero_intervention_detail():
    int_resp = client.get("/api/v1/interventions")
    hero_cd = next((i for i in int_resp.json() if i["work_id"] == "WDC-GJ-RJK-CD-014"), None)
    assert hero_cd is not None

    detail_resp = client.get(f"/api/v1/interventions/{hero_cd['id']}")
    assert detail_resp.status_code == 200
    data = detail_resp.json()
    assert len(data["field_evidence"]) > 0
    assert len(data["satellite_observations"]) == 24
    assert data["outcome_assessment"] is not None
    assert data["outcome_assessment"]["decision_status"] == "POSITIVE_SIGNAL"

def test_methodology():
    response = client.get("/api/v1/methodology")
    assert response.status_code == 200
    data = response.json()
    assert "Sentinel-2 MSI" in str(data)

def test_demo_auth_switch():
    response = client.post("/api/v1/auth/demo-switch", json={"role": "district_officer"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "district_officer"

if __name__ == "__main__":
    pytest.main(["-v", "test_api.py"])
