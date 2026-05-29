from tests.conftest import seed_test_data


class TestProductorYo:
    def test_perfil_requires_auth(self, client):
        resp = client.get("/productores/yo")
        assert resp.status_code == 401

    def test_perfil_ok(self, client, db):
        seed_test_data(db)
        from tests.conftest import TestSessionLocal
        d = TestSessionLocal()
        from models import Usuario
        u = d.query(Usuario).filter(Usuario.email == "productor@test.co").first()
        d.close()
        from auth import create_access_token
        token = create_access_token({"sub": str(u.id)})
        resp = client.get("/productores/yo", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["finca"] == "Finca Test"
        assert data["lotes_count"] >= 1
        assert data["nombre"] == "Productor Test"


class TestProductorLotes:
    def test_mis_lotes_ok(self, client, db):
        seed_test_data(db)
        from tests.conftest import TestSessionLocal
        d = TestSessionLocal()
        from models import Usuario
        u = d.query(Usuario).filter(Usuario.email == "productor@test.co").first()
        d.close()
        from auth import create_access_token
        token = create_access_token({"sub": str(u.id)})
        resp = client.get("/productores/yo/lotes", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["ctes_completados"] >= 1


class TestProductorCertificaciones:
    def test_certificaciones_ok(self, client, db):
        seed_test_data(db)
        from tests.conftest import TestSessionLocal
        d = TestSessionLocal()
        from models import Usuario
        u = d.query(Usuario).filter(Usuario.email == "productor@test.co").first()
        d.close()
        from auth import create_access_token
        token = create_access_token({"sub": str(u.id)})
        resp = client.get("/productores/yo/certificaciones", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["tipo"] == "Fairtrade"


class TestRegistroProductor:
    def test_registro_creates_productor(self, client, db):
        resp = client.post("/productores/registro", json={
            "telefono": "573009999999",
            "nombre_completo": "Nuevo Productor",
            "finca": "Nueva Finca",
            "vereda": "Minca",
            "municipio": "Santa Marta",
            "altitud_msnm": 1500,
            "productos": "café,cacao",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "productor_id" in data
        assert data["mensaje"] == "Productor registrado exitosamente"

    def test_registro_duplicate_phone(self, client, db):
        seed_test_data(db)
        resp = client.post("/productores/registro", json={
            "telefono": "573001234567",
            "nombre_completo": "Duplicado",
            "finca": "Finca",
            "vereda": "Minca",
            "municipio": "Santa Marta",
            "productos": "café",
        })
        assert resp.status_code == 400
        assert "ya registrado" in resp.json()["detail"].lower()
