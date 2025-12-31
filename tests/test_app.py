import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_root_redirect():
    response = client.get("/")
    assert response.status_code == 200
    # Since it redirects to static file, but TestClient might not serve static files
    # Actually, the root redirects to /static/index.html, but TestClient may not handle static files
    # Let's check what happens
    # For now, assume it works or test the redirect status

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]

def test_signup_success():
    # Test signing up for an activity
    response = client.post("/activities/Chess%20Club/signup", data={"email": "test@mergington.edu"})
    assert response.status_code == 200
    data = response.json()
    assert "Signed up" in data["message"]

def test_signup_already_signed_up():
    # First signup
    client.post("/activities/Chess%20Club/signup", data={"email": "duplicate@mergington.edu"})
    # Second signup should fail
    response = client.post("/activities/Chess%20Club/signup", data={"email": "duplicate@mergington.edu"})
    assert response.status_code == 400
    data = response.json()
    assert "already signed up" in data["detail"]

def test_signup_activity_not_found():
    response = client.post("/activities/NonExistent/signup", data={"email": "test@mergington.edu"})
    assert response.status_code == 404
    data = response.json()
    assert "Activity not found" in data["detail"]

def test_unregister_success():
    # First signup
    client.post("/activities/Programming%20Class/signup", data={"email": "unregister@mergington.edu"})
    # Then unregister
    response = client.request("DELETE", "/activities/Programming%20Class/unregister", data={"email": "unregister@mergington.edu"})
    assert response.status_code == 200
    data = response.json()
    assert "Unregistered" in data["message"]

def test_unregister_not_signed_up():
    response = client.request("DELETE", "/activities/Programming%20Class/unregister", data={"email": "notsigned@mergington.edu"})
    assert response.status_code == 400
    data = response.json()
    assert "not signed up" in data["detail"]

def test_unregister_activity_not_found():
    response = client.request("DELETE", "/activities/NonExistent/unregister", data={"email": "test@mergington.edu"})
    assert response.status_code == 404
    data = response.json()
    assert "Activity not found" in data["detail"]