"""
routers/exportadores.py — Dashboard y órdenes de exportadores
Responsable: Mauricio Morales
PRIVACIDAD: precio_kg solo visible dentro de la orden del exportador dueño
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Exportador, Lote, OrdenCompra, Certificacion, EstadoLoteEnum, EstadoOrdenEnum
from schemas import CrearOrdenRequest, DashboardExportadorResponse
from auth import require_rol

router = APIRouter()


@router.get("/yo", summary="Mi perfil de exportador")
def mi_perfil_exportador(db: Session = Depends(get_db), current_user=Depends(require_rol("exportador"))):
    exp = db.query(Exportador).filter(Exportador.usuario_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Perfil de exportador no encontrado")

    ordenes = db.query(OrdenCompra).filter(OrdenCompra.exportador_id == exp.id).all()
    return {
        "id": exp.id,
        "nombre": current_user.nombre_completo,
        "empresa": exp.empresa,
        "nit": exp.nit,
        "ciudad": exp.ciudad,
        "mercados_destino": exp.mercados_destino,
        "aprobado": current_user.aprobado,
        "ordenes_count": len(ordenes),
    }


@router.get("/dashboard", response_model=DashboardExportadorResponse,
            summary="Dashboard: lotes disponibles, órdenes activas, kg en tránsito, FairTrade")
def dashboard_exportador(
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("exportador", "admin")),
):
    exp = db.query(Exportador).filter(Exportador.usuario_id == current_user.id).first()

    lotes_disponibles = db.query(Lote).filter(Lote.estado == EstadoLoteEnum.disponible).count()

    ordenes_activas = 0
    kg_en_transito = 0.0
    if exp:
        ordenes = db.query(OrdenCompra).filter(
            OrdenCompra.exportador_id == exp.id,
            OrdenCompra.estado.in_([EstadoOrdenEnum.pendiente, EstadoOrdenEnum.aprobada]),
        ).all()
        ordenes_activas = len(ordenes)
        kg_en_transito = sum(o.volumen_kg or 0.0 for o in ordenes)

    certs_fairtrade = db.query(Certificacion).filter(
        Certificacion.tipo == "Fairtrade",
        Certificacion.estado == "vigente",
    ).count()

    return {
        "lotes_disponibles": lotes_disponibles,
        "ordenes_activas": ordenes_activas,
        "kg_en_transito": kg_en_transito,
        "certificaciones_fairtrade_activas": certs_fairtrade,
    }


@router.post("/ordenes", status_code=201, summary="Crear orden de compra (lote pasa a 'reservado')")
def crear_orden(
    body: CrearOrdenRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("exportador")),
):
    if not current_user.aprobado:
        raise HTTPException(status_code=403, detail="Tu cuenta de exportador aún no ha sido aprobada")

    exp = db.query(Exportador).filter(Exportador.usuario_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Perfil de exportador no encontrado")

    lote = db.query(Lote).filter(Lote.id == body.lote_id).first()
    if not lote:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    if lote.estado != EstadoLoteEnum.disponible:
        raise HTTPException(status_code=400, detail=f"Lote no disponible — estado actual: {lote.estado}")
    if body.volumen_kg > lote.volumen_kg:
        raise HTTPException(
            status_code=400,
            detail=f"Volumen solicitado ({body.volumen_kg} kg) supera el disponible ({lote.volumen_kg} kg)"
        )

    orden = OrdenCompra(
        exportador_id=exp.id,
        lote_id=body.lote_id,
        precio_acordado_kg=body.precio_acordado_kg,
        volumen_kg=body.volumen_kg,
        destino=body.destino,
        notas=body.notas,
        estado=EstadoOrdenEnum.pendiente,
    )
    db.add(orden)
    lote.estado = EstadoLoteEnum.reservado
    db.commit()
    db.refresh(orden)

    return {
        "id": orden.id,
        "lote_id": orden.lote_id,
        "estado": orden.estado,
        "destino": orden.destino,
        "volumen_kg": orden.volumen_kg,
        "precio_acordado_kg": orden.precio_acordado_kg,
        "mensaje": "Orden creada. El lote ha sido reservado.",
    }


@router.get("/ordenes", summary="Mis órdenes con progreso de CTEs")
def mis_ordenes(db: Session = Depends(get_db), current_user=Depends(require_rol("exportador"))):
    exp = db.query(Exportador).filter(Exportador.usuario_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Perfil de exportador no encontrado")

    ordenes = db.query(OrdenCompra).filter(OrdenCompra.exportador_id == exp.id).all()
    resultado = []
    for o in ordenes:
        lote = db.query(Lote).filter(Lote.id == o.lote_id).first()
        resultado.append({
            "id": o.id,
            "lote_id": o.lote_id,
            "producto": lote.producto if lote else None,
            "variedad": lote.variedad if lote else None,
            "estado_orden": o.estado,
            "estado_lote": lote.estado if lote else None,
            "destino": o.destino,
            "volumen_kg": o.volumen_kg,
            "precio_acordado_kg": o.precio_acordado_kg,
            "valor_total": (o.volumen_kg or 0) * (o.precio_acordado_kg or 0),
            "creado_en": o.creado_en.isoformat() if o.creado_en else None,
            "ctes_completados": len(lote.ctes) if lote else 0,
            "ctes_total": 4,
            "notas": o.notas,
        })
    return resultado
