"""
routers/operadores.py — Operadores turísticos y experiencias
Responsable: Mauricio Morales
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import OperadorTuristico, Experiencia, Productor
from auth import require_rol

router = APIRouter()


class CrearExperienciaRequest(BaseModel):
    productor_id: int
    titulo: str
    descripcion: str
    precio_cop: float
    duracion_horas: float
    disponible: bool = True


@router.get("/yo", summary="Mi perfil de operador turístico")
def mi_perfil_operador(db: Session = Depends(get_db), current_user=Depends(require_rol("operador_turistico"))):
    op = db.query(OperadorTuristico).filter(OperadorTuristico.usuario_id == current_user.id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Perfil de operador no encontrado")

    experiencias = db.query(Experiencia).filter(Experiencia.operador_id == op.id).all()
    return {
        "id": op.id,
        "nombre": current_user.nombre_completo,
        "empresa": op.empresa,
        "ciudad": op.ciudad,
        "servicios": op.servicios,
        "experiencias": [
            {
                "id": e.id,
                "titulo": e.titulo,
                "descripcion": e.descripcion,
                "precio_cop": e.precio_cop,
                "duracion_horas": e.duracion_horas,
                "disponible": e.disponible,
            }
            for e in experiencias
        ],
    }


@router.post("/experiencias", status_code=201, summary="Crear experiencia turística en una finca")
def crear_experiencia(
    body: CrearExperienciaRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("operador_turistico")),
):
    op = db.query(OperadorTuristico).filter(OperadorTuristico.usuario_id == current_user.id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Perfil de operador no encontrado")

    productor = db.query(Productor).filter(Productor.id == body.productor_id).first()
    if not productor:
        raise HTTPException(status_code=404, detail="Productor no encontrado")

    e = Experiencia(
        operador_id=op.id,
        productor_id=body.productor_id,
        titulo=body.titulo,
        descripcion=body.descripcion,
        precio_cop=body.precio_cop,
        duracion_horas=body.duracion_horas,
        disponible=body.disponible,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return {"id": e.id, "titulo": e.titulo, "mensaje": "Experiencia creada exitosamente"}


@router.get("/fincas", summary="Fincas disponibles para vincular experiencias")
def fincas_disponibles(db: Session = Depends(get_db), current_user=Depends(require_rol("operador_turistico"))):
    productores = db.query(Productor).all()
    return [
        {
            "id": p.id,
            "finca": p.finca,
            "vereda": p.vereda,
            "municipio": p.municipio,
            "altitud_msnm": p.altitud_msnm,
            "productos": p.productos,
            "lat_aproximada": p.lat_aproximada,
            "lng_aproximada": p.lng_aproximada,
        }
        for p in productores
    ]
