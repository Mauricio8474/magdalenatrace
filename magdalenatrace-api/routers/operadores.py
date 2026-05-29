"""
routers/operadores.py — Operadores turísticos, experiencias y reservas
Responsable: Mauricio Morales
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import OperadorTuristico, Experiencia, Productor, Reserva, Usuario, Turista
from schemas import (
    CrearExperienciaRequest,
    ToggleExperienciaRequest,
    DashboardOperadorResponse,
    CrearReservaRequest,
)
from auth import require_rol

router = APIRouter()


# ── GET /operadores/yo ─────────────────────────────────────────────────────────

@router.get("/yo", summary="Perfil del operador turístico autenticado")
def mi_perfil_operador(
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("operador_turistico", "admin")),
):
    op = db.query(OperadorTuristico).filter(
        OperadorTuristico.usuario_id == current_user.id
    ).first()
    if not op:
        raise HTTPException(status_code=404, detail="Perfil de operador no encontrado")

    experiencias = db.query(Experiencia).filter(Experiencia.operador_id == op.id).all()
    return {
        "id": op.id,
        "nombre": current_user.nombre_completo,
        "email": current_user.email,
        "empresa": op.empresa,
        "ciudad": op.ciudad,
        "servicios": op.servicios,
        "tipo_operador": op.tipo_operador,
        "experiencias": [
            {
                "id": e.id,
                "titulo": e.titulo,
                "descripcion": e.descripcion,
                "tipo_servicio": e.tipo_servicio,
                "precio_cop": e.precio_cop,
                "duracion_horas": e.duracion_horas,
                "cupo_maximo": e.cupo_maximo,
                "incluye": e.incluye,
                "disponible": e.disponible,
                "finca_nombre": e.productor.finca if e.productor else None,
                "finca_vereda": e.productor.vereda if e.productor else None,
                "productor_id": e.productor_id,
            }
            for e in experiencias
        ],
    }


# ── GET /operadores/dashboard ──────────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardOperadorResponse,
            summary="KPIs del operador turístico")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("operador_turistico", "admin")),
):
    op = db.query(OperadorTuristico).filter(
        OperadorTuristico.usuario_id == current_user.id
    ).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operador no encontrado")

    exp_activas = db.query(Experiencia).filter(
        Experiencia.operador_id == op.id,
        Experiencia.disponible == True,
    ).count()

    fincas = db.query(Experiencia.productor_id).filter(
        Experiencia.operador_id == op.id
    ).distinct().count()

    reservas = db.query(Reserva).join(Experiencia).filter(
        Experiencia.operador_id == op.id
    ).all()

    reservas_mes = len([r for r in reservas if r.estado != "cancelada"])
    visitantes   = sum(r.num_personas for r in reservas if r.estado != "cancelada")

    return {
        "experiencias_activas": exp_activas,
        "reservas_este_mes":    reservas_mes,
        "fincas_vinculadas":    fincas,
        "visitantes_totales":   visitantes,
    }


# ── GET /operadores/experiencias ───────────────────────────────────────────────

@router.get("/experiencias", summary="Lista de experiencias del operador")
def get_experiencias(
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("operador_turistico", "admin")),
):
    op = db.query(OperadorTuristico).filter(
        OperadorTuristico.usuario_id == current_user.id
    ).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operador no encontrado")

    experiencias = db.query(Experiencia).filter(
        Experiencia.operador_id == op.id
    ).all()

    return [
        {
            "id": e.id,
            "titulo": e.titulo,
            "descripcion": e.descripcion,
            "tipo_servicio": e.tipo_servicio,
            "precio_cop": e.precio_cop,
            "duracion_horas": e.duracion_horas,
            "cupo_maximo": e.cupo_maximo,
            "incluye": e.incluye,
            "disponible": e.disponible,
            "productor_id": e.productor_id,
            "finca_nombre": e.productor.finca if e.productor else None,
            "finca_vereda": e.productor.vereda if e.productor else None,
            "finca_producto": e.productor.productos if e.productor else None,
        }
        for e in experiencias
    ]


# ── POST /operadores/experiencias ──────────────────────────────────────────────

@router.post("/experiencias", status_code=201,
             summary="Crear experiencia turística vinculada a una finca")
def crear_experiencia(
    body: CrearExperienciaRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("operador_turistico", "admin")),
):
    op = db.query(OperadorTuristico).filter(
        OperadorTuristico.usuario_id == current_user.id
    ).first()
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
        tipo_servicio=body.tipo_servicio,
        cupo_maximo=body.cupo_maximo,
        incluye=body.incluye,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return {"id": e.id, "titulo": e.titulo, "mensaje": "Experiencia creada exitosamente"}


# ── PATCH /operadores/experiencias/{exp_id} ────────────────────────────────────

@router.patch("/experiencias/{exp_id}",
              summary="Activar o desactivar disponibilidad de una experiencia")
def toggle_experiencia(
    exp_id: int,
    body: ToggleExperienciaRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("operador_turistico", "admin")),
):
    op = db.query(OperadorTuristico).filter(
        OperadorTuristico.usuario_id == current_user.id
    ).first()

    exp = db.query(Experiencia).filter(Experiencia.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiencia no encontrada")

    # Sólo el dueño o admin puede modificar
    if op and exp.operador_id != op.id and current_user.rol != "admin":
        raise HTTPException(status_code=403, detail="Sin permiso sobre esta experiencia")

    exp.disponible = body.disponible
    db.commit()
    return {"id": exp_id, "disponible": exp.disponible}


# ── GET /operadores/experiencias/{exp_id} — PÚBLICA ───────────────────────────

@router.get("/experiencias/{exp_id}",
            summary="Vista pública de una experiencia (sin login requerido)")
def get_experiencia_publica(exp_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experiencia).filter(Experiencia.id == exp_id).first()
    if not exp or not exp.disponible:
        raise HTTPException(status_code=404, detail="Experiencia no encontrada o no disponible")

    op = exp.operador
    op_usuario = db.query(Usuario).filter(
        Usuario.id == op.usuario_id
    ).first() if op else None

    prod = exp.productor

    return {
        "id":             exp.id,
        "titulo":         exp.titulo,
        "descripcion":    exp.descripcion,
        "tipo_servicio":  exp.tipo_servicio,
        "precio_cop":     exp.precio_cop,
        "duracion_horas": exp.duracion_horas,
        "cupo_maximo":    exp.cupo_maximo,
        "incluye":        exp.incluye,
        "disponible":     exp.disponible,
        "operador": {
            "nombre":        op_usuario.nombre_completo if op_usuario else (op.empresa if op else ""),
            "tipo":          op.tipo_operador if op else None,
            "ciudad":        op.ciudad if op else None,
        },
        "finca": {
            "id":             prod.id if prod else None,
            "nombre":         prod.finca if prod else None,
            "vereda":         prod.vereda if prod else None,
            "lat":            prod.lat_aproximada if prod else None,
            "lng":            prod.lng_aproximada if prod else None,
            "altitud":        prod.altitud_msnm if prod else None,
            "producto":       prod.productos if prod else None,
            "certificaciones": [
                c.tipo for c in prod.certificaciones if c.estado == "vigente"
            ] if prod else [],
        },
    }


# ── GET /operadores/fincas ─────────────────────────────────────────────────────

@router.get("/fincas", summary="Fincas disponibles para vincular a experiencias")
def fincas_disponibles(
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("operador_turistico", "admin")),
):
    productores = db.query(Productor).all()
    return [
        {
            "id":            p.id,
            "finca":         p.finca,
            "vereda":        p.vereda,
            "municipio":     p.municipio,
            "altitud_msnm":  p.altitud_msnm,
            "productos":     p.productos,
            "lat_aproximada": p.lat_aproximada,
            "lng_aproximada": p.lng_aproximada,
            "certificaciones": [c.tipo for c in p.certificaciones if c.estado == "vigente"],
        }
        for p in productores
    ]


# ── POST /operadores/reservas ──────────────────────────────────────────────────

@router.post("/reservas", status_code=201, summary="Reservar una experiencia")
def crear_reserva(
    body: CrearReservaRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("turista", "admin")),
):
    exp = db.query(Experiencia).filter(
        Experiencia.id == body.experiencia_id,
        Experiencia.disponible == True,
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiencia no disponible")

    turista = db.query(Turista).filter(
        Turista.usuario_id == current_user.id
    ).first()
    if not turista:
        raise HTTPException(status_code=404, detail="Perfil de turista no encontrado")

    reserva = Reserva(
        experiencia_id=body.experiencia_id,
        turista_id=turista.id,
        fecha=body.fecha,
        num_personas=body.num_personas,
        notas=body.notas,
        estado="pendiente",
    )
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return {
        "id":                reserva.id,
        "experiencia_titulo": exp.titulo,
        "fecha":             reserva.fecha,
        "num_personas":      reserva.num_personas,
        "estado":            reserva.estado,
        "mensaje":           "Reserva creada exitosamente",
    }


# ── GET /operadores/reservas ───────────────────────────────────────────────────

@router.get("/reservas", summary="Reservas recibidas por el operador")
def get_reservas(
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("operador_turistico", "admin")),
):
    op = db.query(OperadorTuristico).filter(
        OperadorTuristico.usuario_id == current_user.id
    ).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operador no encontrado")

    reservas = (
        db.query(Reserva)
        .join(Experiencia)
        .filter(Experiencia.operador_id == op.id)
        .order_by(Reserva.creado_en.desc())
        .all()
    )

    resultado = []
    for r in reservas:
        turista_usuario = None
        if r.turista:
            turista_usuario = db.query(Usuario).filter(
                Usuario.id == r.turista.usuario_id
            ).first()
        resultado.append({
            "id":                  r.id,
            "experiencia_titulo":  r.experiencia.titulo,
            "fecha":               r.fecha,
            "num_personas":        r.num_personas,
            "estado":              r.estado,
            "turista_nombre":      turista_usuario.nombre_completo if turista_usuario else "Turista",
            "notas":               r.notas,
        })
    return resultado


# ── PATCH /operadores/reservas/{id}/estado ─────────────────────────────────────

@router.patch("/reservas/{reserva_id}/estado",
              summary="Confirmar o cancelar una reserva")
def actualizar_estado_reserva(
    reserva_id: int,
    estado: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_rol("operador_turistico", "admin")),
):
    if estado not in ("confirmada", "cancelada"):
        raise HTTPException(status_code=400, detail="Estado inválido. Usa 'confirmada' o 'cancelada'")

    reserva = db.query(Reserva).filter(Reserva.id == reserva_id).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    reserva.estado = estado
    db.commit()
    return {"id": reserva_id, "estado": estado}
