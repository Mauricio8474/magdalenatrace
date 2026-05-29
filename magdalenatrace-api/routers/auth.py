"""
routers/auth.py — Autenticación y registro
Responsable: Mauricio Morales
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Usuario, Productor, Exportador, Turista, OperadorTuristico, RolEnum
from schemas import (
    LoginRequest, TokenResponse,
    RegistroExportadorRequest, RegistroTuristaRequest,
    RegistroOperadorRequest,
    WhatsAppIniciarRequest, WhatsAppIniciarResponse,
)
from auth import verify_password, hash_password, create_access_token

router = APIRouter()


@router.post("/login", response_model=TokenResponse, summary="Login con email y password")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == body.email).first()
    if not user or not user.hashed_password or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    if not user.activo:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inactivo")

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "rol": user.rol,
        "nombre": user.nombre_completo,
        "id": user.id,
    }


@router.post("/registro/exportador", status_code=201, summary="Registro de exportador (pendiente aprobación)")
def registro_exportador(body: RegistroExportadorRequest, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    u = Usuario(
        email=body.email,
        nombre_completo=body.nombre_completo,
        hashed_password=hash_password(body.password),
        rol=RolEnum.exportador,
        activo=True,
        aprobado=False,
    )
    db.add(u)
    db.flush()

    exp = Exportador(
        usuario_id=u.id,
        empresa=body.empresa,
        nit=body.nit,
        ciudad=body.ciudad,
        mercados_destino=body.mercados_destino,
    )
    db.add(exp)
    db.commit()
    return {"mensaje": "Registro enviado. Pendiente de aprobación por el administrador.", "id": u.id}


@router.post("/registro/turista", status_code=201, summary="Registro de turista (auto-aprobado)")
def registro_turista(body: RegistroTuristaRequest, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    u = Usuario(
        email=body.email,
        nombre_completo=body.nombre_completo,
        hashed_password=hash_password(body.password),
        rol=RolEnum.turista,
        activo=True,
        aprobado=True,
    )
    db.add(u)
    db.flush()

    db.add(Turista(usuario_id=u.id, pais_origen=body.pais_origen, favoritos="[]"))
    db.commit()

    token = create_access_token({"sub": str(u.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "rol": u.rol,
        "nombre": u.nombre_completo,
        "id": u.id,
    }


@router.post("/registro/operador", status_code=201,
             summary="Registro de operador turístico (aprobación inmediata)")
def registro_operador(body: RegistroOperadorRequest, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    u = Usuario(
        email=body.email,
        nombre_completo=body.nombre_completo,
        hashed_password=hash_password(body.password),
        rol=RolEnum.operador_turistico,
        activo=True,
        aprobado=True,   # operadores se aprueban automáticamente
    )
    db.add(u)
    db.flush()

    op = OperadorTuristico(
        usuario_id=u.id,
        empresa=body.empresa,
        ciudad=body.ciudad,
        servicios=body.servicios,
        tipo_operador=body.tipo_operador,
    )
    db.add(op)
    db.commit()

    token = create_access_token({"sub": str(u.id)})
    return {
        "access_token": token,
        "token_type":   "bearer",
        "rol":          u.rol,
        "nombre":       u.nombre_completo,
        "id":           u.id,
    }


@router.post("/whatsapp/iniciar", response_model=WhatsAppIniciarResponse,
             summary="Verifica si el número WhatsApp ya es productor")
def whatsapp_iniciar(body: WhatsAppIniciarRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.telefono == body.telefono).first()
    if not usuario:
        return {"nuevo": True, "productor_id": None, "nombre": None}

    productor = db.query(Productor).filter(Productor.usuario_id == usuario.id).first()
    return {
        "nuevo": False,
        "productor_id": productor.id if productor else None,
        "nombre": usuario.nombre_completo,
    }
