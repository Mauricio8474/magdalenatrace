"""
seed.py — Datos demo realistas para el hackathon
Responsable: Nicolle (datos) + Mauricio (importación)
Ejecutar: python seed.py
"""
import random
from database import SessionLocal, engine, Base
from models import Usuario, Productor, Lote, CTE, Certificacion, Exportador, OrdenCompra, OperadorTuristico, Experiencia, Turista, RolEnum, EstadoLoteEnum, TipoCTEEnum
from auth import hash_password
from datetime import datetime

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Verificar si ya hay datos — si existe el admin, no volver a insertar
if db.query(Usuario).filter(Usuario.email == "admin@magdalenatrace.co").first():
    print("✅ Datos ya existen en la base de datos, saltando seed.")
    db.close()
    exit(0)

def difuminar(coord: float) -> float:
    """Difumina una coordenada ±0.01° para proteger la privacidad del productor."""
    return round(coord + random.uniform(-0.01, 0.01), 6)

print("🌱 Cargando datos demo de MagdalenaTrace...")

# ── Administrador ──────────────────────────────────────────────────────────────
admin = Usuario(email="admin@magdalenatrace.co", nombre_completo="Administrador Sistema",
                hashed_password=hash_password("admin2026"), rol=RolEnum.admin,
                activo=True, aprobado=True)
db.add(admin)
db.flush()

# ── Productores ────────────────────────────────────────────────────────────────
FINCAS = [
    {"nombre": "Ernesto Villazón", "finca": "El Paraíso",    "vereda": "Minca",        "lat": 11.1333, "lng": -74.1167, "alt": 650,  "prods": "café",         "ha": 2.5},
    {"nombre": "Rosa Meza",        "finca": "La Esperanza",  "vereda": "San Pedro",    "lat": 11.1789, "lng": -74.0523, "alt": 820,  "prods": "café",         "ha": 1.8},
    {"nombre": "Jairo Quintero",   "finca": "El Edén",       "vereda": "Palmor",       "lat": 10.7856, "lng": -73.9234, "alt": 1100, "prods": "cacao",        "ha": 3.2},
    {"nombre": "Carmen Orozco",    "finca": "Don Julio",     "vereda": "Guachaca",     "lat": 11.2341, "lng": -73.7823, "alt": 380,  "prods": "banano,cacao", "ha": 5.0},
    {"nombre": "Pedro Arévalo",    "finca": "La Montaña",    "vereda": "Pueblo Bello", "lat": 10.4123, "lng": -73.5678, "alt": 1450, "prods": "café",         "ha": 1.2},
]

CERTS = {
    "El Paraíso":   [("Rainforest Alliance", "RA-2024-COL-0892", "2024-03-01", "2025-03-01")],
    "La Esperanza": [("Fairtrade", "FT-2024-CO-1123", "2024-01-15", "2025-01-15")],
    "El Edén":      [("BPA", "BPA-MAG-2024-045", "2024-06-01", "2025-06-01")],
    "Don Julio":    [("Fairtrade", "FT-2024-CO-0987", "2024-02-01", "2025-02-01"),
                     ("Rainforest Alliance", "RA-2024-COL-1045", "2024-02-01", "2025-02-01")],
    "La Montaña":   [("Rainforest Alliance", "RA-2024-COL-0734", "2024-04-01", "2025-04-01")],
}

productores_creados = []
for f in FINCAS:
    u = Usuario(telefono=f"57300{random.randint(1000000,9999999)}",
                nombre_completo=f["nombre"], rol=RolEnum.productor, activo=True, aprobado=True)
    db.add(u); db.flush()

    p = Productor(usuario_id=u.id, finca=f["finca"], vereda=f["vereda"],
                  lat_aproximada=difuminar(f["lat"]), lng_aproximada=difuminar(f["lng"]),
                  altitud_msnm=f["alt"], productos=f["prods"], hectareas=f["ha"])
    db.add(p); db.flush()
    productores_creados.append(p)

    for tipo, num, emision, venc in CERTS.get(f["finca"], []):
        db.add(Certificacion(productor_id=p.id, tipo=tipo, numero_cert=num,
                             fecha_emision=emision, fecha_vencimiento=venc, estado="vigente",
                             organismo="SCS Global Services"))

# ── Lotes y CTEs ───────────────────────────────────────────────────────────────
LOTES_DEMO = [
    {"id": "L2025-001", "prod_idx": 0, "producto": "Café pergamino", "variedad": "Castillo",  "fecha": "2025-03-15", "kg": 320.0, "precio": 12500.0},
    {"id": "L2025-002", "prod_idx": 1, "producto": "Café pergamino", "variedad": "Caturra",   "fecha": "2025-04-10", "kg": 180.0, "precio": 11800.0},
    {"id": "L2025-003", "prod_idx": 2, "producto": "Cacao seco",     "variedad": "CCN-51",    "fecha": "2025-03-28", "kg": 450.0, "precio": 9500.0},
    {"id": "L2025-004", "prod_idx": 3, "producto": "Banano orgánico","variedad": "Cavendish", "fecha": "2025-05-01", "kg": 1200.0,"precio": 1200.0},
    {"id": "L2025-005", "prod_idx": 4, "producto": "Café pergamino", "variedad": "Castillo",  "fecha": "2025-04-20", "kg": 95.0,  "precio": 13200.0},
]

for l in LOTES_DEMO:
    prod = productores_creados[l["prod_idx"]]
    lote = Lote(id=l["id"], productor_id=prod.id, producto=l["producto"], variedad=l["variedad"],
                fecha_cosecha=l["fecha"], volumen_kg=l["kg"], precio_kg=l["precio"],
                estado=EstadoLoteEnum.disponible, qr_url=f"http://localhost:5173/lote/{l['id']}")
    db.add(lote); db.flush()

    # CTEs base para cada lote
    ctes_base = [
        CTE(lote_id=l["id"], tipo=TipoCTEEnum.insumo,  fecha="2025-02-01",
            descripcion="Aplicación de abono foliar orgánico 5 litros/ha", responsable_id=prod.usuario_id),
        CTE(lote_id=l["id"], tipo=TipoCTEEnum.cosecha, fecha=l["fecha"],
            descripcion=f"Cosecha manual selectiva, {l['kg']} kg", responsable_id=prod.usuario_id),
    ]
    for cte in ctes_base:
        db.add(cte)

# ── Exportador ─────────────────────────────────────────────────────────────────
u_exp = Usuario(email="exportador@sierraexporta.co", nombre_completo="Carlos Rueda",
                hashed_password=hash_password("exporta2026"), rol=RolEnum.exportador,
                activo=True, aprobado=True)
db.add(u_exp); db.flush()
exp = Exportador(usuario_id=u_exp.id, empresa="Sierra Exporta SAS", nit="900123456-7",
                 ciudad="Santa Marta", mercados_destino="Alemania,Francia,Japón")
db.add(exp)

# ── Operador Turístico ─────────────────────────────────────────────────────────
u_op = Usuario(email="operador@sierraaventura.co", nombre_completo="Ana Torres",
               hashed_password=hash_password("tours2026"), rol=RolEnum.operador_turistico,
               activo=True, aprobado=True)
db.add(u_op); db.flush()
op = OperadorTuristico(usuario_id=u_op.id, empresa="Sierra Aventura Tours",
                       ciudad="Santa Marta", servicios="Agroturismo,Ecoturismo")
db.add(op); db.flush()

exp_tur = Experiencia(operador_id=op.id, productor_id=productores_creados[0].id,
                      titulo="Tour del café en la Sierra Nevada", precio_cop=85000.0,
                      duracion_horas=4.0, disponible=True,
                      descripcion="Visita a la finca El Paraíso en Minca. Recorrido por el proceso completo del café: recolección, despulpe, secado y cata.")
db.add(exp_tur)

# ── Turista ────────────────────────────────────────────────────────────────────
u_tur = Usuario(email="tourist@example.com", nombre_completo="John Smith",
                hashed_password=hash_password("travel2026"), rol=RolEnum.turista,
                activo=True, aprobado=True)
db.add(u_tur); db.flush()
db.add(Turista(usuario_id=u_tur.id, pais_origen="Estados Unidos", favoritos="[]"))

db.commit()
print("✅ Datos demo cargados exitosamente")
print("   Admin:     admin@magdalenatrace.co / admin2026")
print("   Exportador: exportador@sierraexporta.co / exporta2026")
print("   Operador:  operador@sierraaventura.co / tours2026")
print("   Turista:   tourist@example.com / travel2026")
print(f"   Productores: {len(productores_creados)} fincas cargadas")
print(f"   Lotes: {len(LOTES_DEMO)} lotes disponibles")
db.close()
