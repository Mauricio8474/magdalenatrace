from tests.conftest import seed_test_data


class TestLotesPublico:
    def test_get_lote_publico_exists(self, client, db):
        seed_test_data(db)
        resp = client.get("/lotes/publico/L-TEST-001")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "L-TEST-001"
        assert data["producto"] == "Café pergamino"
        assert "nombre" not in str(data.keys()).lower()

    def test_get_lote_publico_not_found(self, client):
        resp = client.get("/lotes/publico/NO-EXISTE")
        assert resp.status_code == 404

    def test_get_lote_publico_no_auth_required(self, client, db):
        seed_test_data(db)
        resp = client.get("/lotes/publico/L-TEST-001")
        assert resp.status_code == 200


class TestLotesCatalogo:
    def test_catalogo_requires_auth(self, client, db):
        seed_test_data(db)
        resp = client.get("/lotes/catalogo")
        assert resp.status_code == 401

    def test_catalogo_returns_lotes(self, client, db):
        seed_test_data(db)
        from tests.conftest import TestSessionLocal
        d = TestSessionLocal()
        from models import Usuario, Exportador
        u = d.query(Usuario).filter(Usuario.email == "exportador@test.co").first()
        d.close()
        from auth import create_access_token
        token = create_access_token({"sub": str(u.id)})
        resp = client.get("/lotes/catalogo", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["producto"] == "Café pergamino"


class TestLotesCTE:
    def test_crear_cte_sin_auth(self, client, db):
        seed_test_data(db)
        resp = client.post("/lotes/L-TEST-001/ctes", json={
            "tipo": "cosecha",
            "fecha": "hoy",
            "descripcion": "Test CTE",
        })
        assert resp.status_code == 401

    def test_crear_cte_ok(self, client, db):
        seed_test_data(db)
        from tests.conftest import TestSessionLocal
        d = TestSessionLocal()
        from models import Usuario
        u = d.query(Usuario).filter(Usuario.email == "productor@test.co").first()
        d.close()
        from auth import create_access_token
        token = create_access_token({"sub": str(u.id)})
        resp = client.post("/lotes/L-TEST-001/ctes", headers={"Authorization": f"Bearer {token}"}, json={
            "tipo": "cosecha",
            "fecha": "hoy",
            "descripcion": "Cosecha de prueba",
        })
        assert resp.status_code == 200
        assert resp.json()["lote_id"] == "L-TEST-001"


class TestLotesQR:
    def test_qr_generates(self, client, db):
        seed_test_data(db)
        resp = client.get("/lotes/L-TEST-001/qr")
        assert resp.status_code == 200
        data = resp.json()
        assert data["lote_id"] == "L-TEST-001"
        assert "qr_base64" in data
        assert "data:image/png" in data["data_uri"]
