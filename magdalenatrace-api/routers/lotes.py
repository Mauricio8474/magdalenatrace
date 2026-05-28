"""
routers/lotes.py
Responsable: Mauricio Morales
Endpoints críticos para el demo:
  GET /lotes/publico/{lote_id}  ← Camila lo usa en /lote/:id
  GET /lotes/catalogo           ← Damián lo usa en el dashboard
  POST /lotes/{id}/ctes         ← Bot WhatsApp lo llama al registrar eventos
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Lote, CTE, Certificacion, Experiencia, OperadorTuristico, Usuario
from schemas import LotePublicoResponse, LoteCatalogoItem, CrearCTERequest
from auth import require_rol
import json

router = APIRouter()


@router.get("/publico/{lote_id}", response_model=LotePublicoResponse, summary="Pasaporte digital del lote (sin login)")
def get_lote_publico(lote_id: str, db: Session = Depends(get_db)):
    """
    Vista pública del lote — accedida al escanear el QR.
    NO requiere autenticación.
    NUNCA expone: nombre del productor, teléfono, precio_kg, coordenadas exactas.
    """
    lote = db.query(Lote).filter(Lote.id == lote_id).first()
    if not lote:
        raise HTTPException(status_code=404, detail=f"Lote {lote_id} no encontrado")

    productor = lote.productor
    certs = db.query(Certificacion).filter(Certificacion.productor_id == productor.id).all()
    experiencias = db.query(Experiencia).filter(
        Experiencia.productor_id == productor.id,
        Experiencia.disponible == True
    ).all()

    return {
        "id": lote.id,
        "producto": lote.producto,
        "variedad": lote.variedad,
        "fecha_cosecha": lote.fecha_cosecha,
        "volumen_kg": lote.volumen_kg,
        "estado": lote.estado,
        "vereda": productor.vereda,
        "municipio": productor.municipio,
        "altitud_msnm": productor.altitud_msnm,
        "certificaciones": [{"tipo": c.tipo, "estado": c.estado} for c in certs],
        "ctes": [{"tipo": c.tipo, "fecha": c.fecha, "descripcion": c.descripcion} for c in lote.ctes],
        "experiencias_disponibles": [
            {
                "titulo": e.titulo,
                "precio_cop": e.precio_cop,
                "operador": db.query(OperadorTuristico).filter(OperadorTuristico.id == e.operador_id).first().empresa
            }
            for e in experiencias
        ],
    }


@router.get("/catalogo", summary="Catálogo de lotes disponibles para exportadores")
def get_catalogo(
    producto: str = None,
    certificacion: str = None,
    vereda: str = None,
    kg_minimos: float = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("exportador", "admin"))
):
    """Lista de lotes disponibles. Solo exportadores aprobados."""
    query = db.query(Lote).filter(Lote.estado == "disponible")
    if producto:
        query = query.filter(Lote.producto.ilike(f"%{producto}%"))
    if kg_minimos:
        query = query.filter(Lote.volumen_kg >= kg_minimos)

    lotes = query.all()
    resultado = []
    for l in lotes:
        certs = db.query(Certificacion).filter(Certificacion.productor_id == l.productor_id).all()
        if certificacion and not any(c.tipo == certificacion for c in certs):
            continue
        if vereda and l.productor.vereda.lower() != vereda.lower():
            continue
        resultado.append({
            "id": l.id,
            "producto": l.producto,
            "variedad": l.variedad,
            "volumen_kg": l.volumen_kg,
            "precio_kg": l.precio_kg,
            "vereda": l.productor.vereda,
            "altitud_msnm": l.productor.altitud_msnm,
            "ctes_completados": len(l.ctes),
            "ctes_total": 4,
            "certificaciones": [c.tipo for c in certs],
            "productor_id": l.productor_id,
        })
    return resultado


@router.post("/{lote_id}/ctes", summary="Registrar CTE en un lote")
def crear_cte(
    lote_id: str,
    body: CrearCTERequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("productor", "admin"))
):
    """Registra un evento crítico de trazabilidad. Solo el productor dueño."""
    lote = db.query(Lote).filter(Lote.id == lote_id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")

    # Verificar que el productor sea el dueño
    if current_user.rol == "productor":
        from models import Productor
        productor = db.query(Productor).filter(Productor.usuario_id == current_user.id).first()
        if not productor or lote.productor_id != productor.id:
            raise HTTPException(status_code=403, detail="Este lote no te pertenece")

    fecha = "2025-05-28" if body.fecha == "hoy" else body.fecha
    cte = CTE(lote_id=lote_id, tipo=body.tipo, fecha=fecha,
              descripcion=body.descripcion, responsable_id=current_user.id,
              datos_json=json.dumps(body.datos_adicionales or {}))
    db.add(cte)
    db.commit()
    db.refresh(cte)
    return {"id": cte.id, "lote_id": lote_id, "tipo": cte.tipo,
            "fecha": cte.fecha, "descripcion": cte.descripcion}
