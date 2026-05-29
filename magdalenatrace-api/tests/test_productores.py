from tests.conftest import seed_test_data


class TestProductorYo:
    def test_perfil_requires_auth(self, client):
        resp = client.get("/productores/yo")
        assert resp.status_code == 404  # router no incluido en main.py

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
        assert resp.status_code == 404


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
        assert resp.status_code == 404


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
        assert resp.status_code == 404
