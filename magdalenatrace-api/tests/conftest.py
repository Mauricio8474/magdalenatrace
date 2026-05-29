import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["TELEGRAM_BOT_TOKEN"] = ""
os.environ["SECRET_KEY"] = "test-secret-key-2026"
os.environ["GROQ_API_KEY"] = "test-key"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from models import Usuario, Productor, Lote, Certificacion, CTE, Exportador
from models import RolEnum, EstadoLoteEnum, TipoCTEEnum
from auth import hash_password

from main import app


engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db(monkeypatch):
    monkeypatch.setattr("database.engine", engine)
    monkeypatch.setattr("database.SessionLocal", TestSessionLocal)
    monkeypatch.setattr("main.engine", engine)
    monkeypatch.setattr("main.SessionLocal", TestSessionLocal)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def seed_test_data(db):
    u = Usuario(
        email="admin-test@magdalenatrace.co",
        nombre_completo="Admin Test",
        hashed_password=hash_password("admin2026"),
        rol=RolEnum.admin,
        activo=True,
        aprobado=True,
    )
    db.add(u)
    db.flush()

    uprod = Usuario(
        email="productor@test.co",
        telefono="573001234567",
        nombre_completo="Productor Test",
        hashed_password=hash_password("test2026"),
        rol=RolEnum.productor,
        activo=True,
        aprobado=True,
    )
    db.add(uprod)
    db.flush()

    p = Productor(
        usuario_id=uprod.id,
        finca="Finca Test",
        vereda="Pueblo Bello",
        municipio="Santa Marta",
        altitud_msnm=1200,
        productos="café",
    )
    db.add(p)
    db.flush()

    l = Lote(
        id="L-TEST-001",
        productor_id=p.id,
        producto="Café pergamino",
        variedad="Castillo",
        volumen_kg=100.0,
        precio_kg=12000.0,
        estado=EstadoLoteEnum.disponible,
    )
    db.add(l)
    db.flush()

    db.add(CTE(
        lote_id=l.id,
        tipo=TipoCTEEnum.cosecha,
        fecha="2025-03-15",
        descripcion="Cosecha manual",
        responsable_id=uprod.id,
    ))

    db.add(Certificacion(
        productor_id=p.id,
        tipo="Fairtrade",
        numero_cert="FT-TEST-001",
        fecha_emision="2024-01-01",
        fecha_vencimiento="2025-01-01",
        estado="vigente",
        organismo="Test Org",
    ))

    uexp = Usuario(
        email="exportador@test.co",
        nombre_completo="Exportador Test",
        hashed_password=hash_password("test2026"),
        rol=RolEnum.exportador,
        activo=True,
        aprobado=True,
    )
    db.add(uexp)
    db.flush()

    db.add(Exportador(
        usuario_id=uexp.id,
        empresa="Test Export SA",
        nit="900999999-9",
        ciudad="Santa Marta",
        mercados_destino="Alemania",
    ))

    db.commit()
