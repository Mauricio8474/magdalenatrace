import pytest
from tests.conftest import seed_test_data


class TestLogin:
    def test_login_success(self, client, db):
        seed_test_data(db)
        resp = client.post("/auth/login", json={
            "email": "admin-test@magdalenatrace.co",
            "password": "admin2026",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["rol"] == "admin"

    def test_login_invalid_password(self, client, db):
        seed_test_data(db)
        resp = client.post("/auth/login", json={
            "email": "admin@magdalenatrace.co",
            "password": "wrong",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client):
        resp = client.post("/auth/login", json={
            "email": "noexiste@test.co",
            "password": "test",
        })
        assert resp.status_code == 401


class TestRegistroTurista:
    def test_registro_turista_ok(self, client):
        resp = client.post("/auth/registro/turista", json={
            "email": "turista@test.co",
            "nombre_completo": "Turista Test",
            "password": "test2026",
            "pais_origen": "Colombia",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["rol"] == "turista"

    def test_registro_turista_email_duplicado(self, client):
        client.post("/auth/registro/turista", json={
            "email": "turista@test.co",
            "nombre_completo": "Turista Uno",
            "password": "test2026",
            "pais_origen": "Colombia",
        })
        resp = client.post("/auth/registro/turista", json={
            "email": "turista@test.co",
            "nombre_completo": "Turista Dos",
            "password": "test2026",
            "pais_origen": "Colombia",
        })
        assert resp.status_code == 400
        assert "ya registrado" in resp.json()["detail"].lower()
