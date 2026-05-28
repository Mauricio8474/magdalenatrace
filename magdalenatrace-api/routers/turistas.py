"""
routers/turistas.py — Favoritos y reservas de turistas
Responsable: Mauricio Morales
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Turista, Lote, Experiencia
from auth import require_rol
import json

router = APIRouter()


class ReservaRequest(BaseModel):
    experiencia_id: int
    fecha: str
    personas: int = 1
    notas: Optional[str] = None


@router.post("/favoritos/{lote_id}", summary="Agregar lote a favoritos")
def agregar_favorito(
    lote_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("turista")),
):
    lote = db.query(Lote).filter(Lote.id == lote_id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")

    turista = db.query(Turista).filter(Turista.usuario_id == current_user.id).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Perfil de turista no encontrado")

    favoritos = json.loads(turista.favoritos or "[]")
    if lote_id not in favoritos:
        favoritos.append(lote_id)
        turista.favoritos = json.dumps(favoritos)
        db.commit()
        return {"mensaje": f"Lote {lote_id} agregado a favoritos", "favoritos": favoritos}
    return {"mensaje": "Ya está en favoritos", "favoritos": favoritos}


@router.delete("/favoritos/{lote_id}", summary="Quitar lote de favoritos")
def quitar_favorito(
    lote_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("turista")),
):
    turista = db.query(Turista).filter(Turista.usuario_id == current_user.id).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Perfil de turista no encontrado")

    favoritos = json.loads(turista.favoritos or "[]")
    if lote_id in favoritos:
        favoritos.remove(lote_id)
        turista.favoritos = json.dumps(favoritos)
        db.commit()
    return {"mensaje": "Favorito actualizado", "favoritos": favoritos}


@router.get("/favoritos", summary="Mis lotes favoritos")
def mis_favoritos(db: Session = Depends(get_db), current_user=Depends(require_rol("turista"))):
    turista = db.query(Turista).filter(Turista.usuario_id == current_user.id).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Perfil de turista no encontrado")

    ids = json.loads(turista.favoritos or "[]")
    lotes = []
    for lote_id in ids:
        l = db.query(Lote).filter(Lote.id == lote_id).first()
        if l:
            lotes.append({
                "id": l.id,
                "producto": l.producto,
                "variedad": l.variedad,
                "vereda": l.productor.vereda if l.productor else None,
                "estado": l.estado,
            })
    return lotes


@router.post("/reservas", status_code=201, summary="Reservar experiencia turística en finca")
def reservar_experiencia(
    body: ReservaRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("turista")),
):
    experiencia = db.query(Experiencia).filter(Experiencia.id == body.experiencia_id).first()
    if not experiencia:
        raise HTTPException(status_code=404, detail="Experiencia no encontrada")
    if not experiencia.disponible:
        raise HTTPException(status_code=400, detail="Experiencia no disponible en este momento")
    if body.personas < 1:
        raise HTTPException(status_code=400, detail="Debe reservar para al menos 1 persona")

    total = experiencia.precio_cop * body.personas
    return {
        "mensaje": "Reserva confirmada",
        "experiencia_id": experiencia.id,
        "experiencia": experiencia.titulo,
        "turista": current_user.nombre_completo,
        "fecha": body.fecha,
        "personas": body.personas,
        "precio_por_persona_cop": experiencia.precio_cop,
        "total_cop": total,
        "notas": body.notas,
    }
