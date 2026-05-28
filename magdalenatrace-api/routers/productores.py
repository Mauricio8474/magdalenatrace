"""
routers/productores.py — Gestión de productores
Responsable: Mauricio Morales
PRIVACIDAD: nombre_completo nunca en vistas públicas → "Productor de {vereda}"
            coordenadas difuminadas ±0.01° al guardar
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario, Productor, Lote, Certificacion, RolEnum
from schemas import RegistroProductorRequest
from auth import require_rol
from datetime import datetime
import random

router = APIRouter()


def _difuminar(coord: float) -> float:
    return round(coord + random.uniform(-0.01, 0.01), 6)


@router.post("/registro", status_code=201, summary="Registrar productor desde bot WhatsApp")
def registro_productor(body: RegistroProductorRequest, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.telefono == body.telefono).first():
        raise HTTPException(status_code=400, detail="Teléfono ya registrado")

    u = Usuario(
        telefono=body.telefono,
        nombre_completo=body.nombre_completo,
        rol=RolEnum.productor,
        activo=True,
        aprobado=True,
    )
    db.add(u)
    db.flush()

    p = Productor(
        usuario_id=u.id,
        finca=body.finca,
        vereda=body.vereda,
        municipio=body.municipio,
        lat_aproximada=_difuminar(body.lat) if body.lat else None,
        lng_aproximada=_difuminar(body.lng) if body.lng else None,
        altitud_msnm=body.altitud_msnm,
        productos=body.productos,
        hectareas=body.hectareas,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"productor_id": p.id, "usuario_id": u.id, "mensaje": "Productor registrado exitosamente"}


@router.get("/yo", summary="Mi perfil de productor")
def mi_perfil(db: Session = Depends(get_db), current_user=Depends(require_rol("productor"))):
    productor = db.query(Productor).filter(Productor.usuario_id == current_user.id).first()
    if not productor:
        raise HTTPException(status_code=404, detail="Perfil de productor no encontrado")

    certs = db.query(Certificacion).filter(Certificacion.productor_id == productor.id).all()
    lotes = db.query(Lote).filter(Lote.productor_id == productor.id).all()

    return {
        "id": productor.id,
        "nombre": current_user.nombre_completo,
        "finca": productor.finca,
        "vereda": productor.vereda,
        "municipio": productor.municipio,
        "altitud_msnm": productor.altitud_msnm,
        "productos": productor.productos,
        "hectareas": productor.hectareas,
        "lotes_count": len(lotes),
        "certificaciones": [
            {
                "tipo": c.tipo,
                "numero_cert": c.numero_cert,
                "estado": c.estado,
                "fecha_vencimiento": c.fecha_vencimiento,
                "organismo": c.organismo,
            }
            for c in certs
        ],
    }


@router.get("/yo/lotes", summary="Mis lotes con CTEs")
def mis_lotes(db: Session = Depends(get_db), current_user=Depends(require_rol("productor"))):
    productor = db.query(Productor).filter(Productor.usuario_id == current_user.id).first()
    if not productor:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    lotes = db.query(Lote).filter(Lote.productor_id == productor.id).all()
    return [
        {
            "id": l.id,
            "producto": l.producto,
            "variedad": l.variedad,
            "fecha_cosecha": l.fecha_cosecha,
            "volumen_kg": l.volumen_kg,
            "precio_kg": l.precio_kg,
            "estado": l.estado,
            "ctes_completados": len(l.ctes),
            "ctes_total": 4,
            "ctes": [
                {"tipo": c.tipo, "fecha": c.fecha, "descripcion": c.descripcion}
                for c in l.ctes
            ],
        }
        for l in lotes
    ]


@router.get("/yo/certificaciones", summary="Mis certificaciones con estado de vencimiento")
def mis_certificaciones(db: Session = Depends(get_db), current_user=Depends(require_rol("productor"))):
    productor = db.query(Productor).filter(Productor.usuario_id == current_user.id).first()
    if not productor:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    certs = db.query(Certificacion).filter(Certificacion.productor_id == productor.id).all()
    hoy = datetime.utcnow().date()
    resultado = []
    for c in certs:
        dias_restantes = None
        vencimiento_estado = c.estado
        try:
            venc = datetime.strptime(c.fecha_vencimiento, "%Y-%m-%d").date()
            dias_restantes = (venc - hoy).days
            if dias_restantes < 0:
                vencimiento_estado = "vencida"
            elif dias_restantes < 90:
                vencimiento_estado = "por_vencer"
            else:
                vencimiento_estado = "vigente"
        except Exception:
            pass

        resultado.append({
            "tipo": c.tipo,
            "numero_cert": c.numero_cert,
            "fecha_emision": c.fecha_emision,
            "fecha_vencimiento": c.fecha_vencimiento,
            "estado": c.estado,
            "vencimiento_estado": vencimiento_estado,
            "dias_restantes": dias_restantes,
            "organismo": c.organismo,
        })
    return resultado


@router.get("/{productor_id}/perfil", summary="Perfil público del productor (para exportadores)")
def perfil_productor_publico(
    productor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("exportador", "admin")),
):
    productor = db.query(Productor).filter(Productor.id == productor_id).first()
    if not productor:
        raise HTTPException(status_code=404, detail="Productor no encontrado")

    certs = db.query(Certificacion).filter(Certificacion.productor_id == productor_id).all()
    lotes = db.query(Lote).filter(Lote.productor_id == productor_id).all()

    return {
        "id": productor.id,
        "nombre": f"Productor de {productor.vereda}",   # PRIVACIDAD: nunca nombre real
        "finca": productor.finca,
        "vereda": productor.vereda,
        "municipio": productor.municipio,
        "altitud_msnm": productor.altitud_msnm,
        "productos": productor.productos,
        "hectareas": productor.hectareas,
        "certificaciones": [{"tipo": c.tipo, "estado": c.estado} for c in certs],
        "lotes_disponibles": sum(1 for l in lotes if l.estado == "disponible"),
        "lotes_total": len(lotes),
    }
