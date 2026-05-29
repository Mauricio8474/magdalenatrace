"""
models.py — Modelos ORM de MagdalenaTrace
Responsable: Mauricio Morales
⚠️ NADIE modifica este archivo sin avisar al equipo primero.
   Es la fuente de verdad de la base de datos.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum


# ── Enumeraciones ──────────────────────────────────────────────────────────────

class RolEnum(str, enum.Enum):
    admin               = "admin"
    productor           = "productor"
    exportador          = "exportador"
    operador_turistico  = "operador_turistico"
    turista             = "turista"

class EstadoLoteEnum(str, enum.Enum):
    disponible  = "disponible"
    reservado   = "reservado"
    vendido     = "vendido"
    despachado  = "despachado"

class EstadoOrdenEnum(str, enum.Enum):
    pendiente   = "pendiente"
    aprobada    = "aprobada"
    rechazada   = "rechazada"
    completada  = "completada"

class TipoCTEEnum(str, enum.Enum):
    insumo   = "insumo"
    cosecha  = "cosecha"
    acopio   = "acopio"
    despacho = "despacho"


# ── Modelos ────────────────────────────────────────────────────────────────────

class Usuario(Base):
    __tablename__ = "usuarios"
    id               = Column(Integer, primary_key=True, index=True)
    email            = Column(String, unique=True, nullable=True, index=True)
    telefono         = Column(String, unique=True, nullable=True, index=True)
    nombre_completo  = Column(String, nullable=False)
    hashed_password  = Column(String, nullable=True)
    rol              = Column(SAEnum(RolEnum), nullable=False)
    activo           = Column(Boolean, default=True)
    aprobado         = Column(Boolean, default=False)
    creado_en        = Column(DateTime, default=datetime.utcnow)


class Productor(Base):
    __tablename__ = "productores"
    id               = Column(Integer, primary_key=True, index=True)
    usuario_id       = Column(Integer, ForeignKey("usuarios.id"), unique=True)
    finca            = Column(String, nullable=False)
    vereda           = Column(String, nullable=False)
    municipio        = Column(String, default="Santa Marta")
    # ⚠️ PRIVACIDAD: coordenadas difuminadas ±0.01° — nunca exponer las exactas
    lat_aproximada   = Column(Float)
    lng_aproximada   = Column(Float)
    altitud_msnm     = Column(Integer)
    productos        = Column(String)   # "café,cacao,banano"
    hectareas        = Column(Float)
    usuario          = relationship("Usuario", backref="productor_perfil")
    lotes            = relationship("Lote", back_populates="productor")
    certificaciones  = relationship("Certificacion", back_populates="productor")


class Lote(Base):
    __tablename__ = "lotes"
    id             = Column(String, primary_key=True, index=True)  # "L2025-001"
    productor_id   = Column(Integer, ForeignKey("productores.id"))
    exportador_id  = Column(Integer, ForeignKey("exportadores.id"), nullable=True)
    producto       = Column(String, nullable=False)
    variedad       = Column(String)
    fecha_cosecha  = Column(String)
    volumen_kg     = Column(Float)
    # ⚠️ PRIVACIDAD: precio_kg solo visible para productor dueño y exportador en orden
    precio_kg      = Column(Float)
    estado         = Column(SAEnum(EstadoLoteEnum), default=EstadoLoteEnum.disponible)
    qr_url         = Column(String)
    notas          = Column(Text)
    creado_en      = Column(DateTime, default=datetime.utcnow)
    productor      = relationship("Productor", back_populates="lotes")
    ctes           = relationship("CTE", back_populates="lote", order_by="CTE.fecha")


class CTE(Base):
    __tablename__ = "ctes"
    id               = Column(Integer, primary_key=True, index=True)
    lote_id          = Column(String, ForeignKey("lotes.id"))
    tipo             = Column(SAEnum(TipoCTEEnum))
    fecha            = Column(String)
    descripcion      = Column(Text)
    responsable_id   = Column(Integer, ForeignKey("usuarios.id"))
    datos_json       = Column(Text)   # JSON string con datos adicionales libres
    lote             = relationship("Lote", back_populates="ctes")


class Certificacion(Base):
    __tablename__ = "certificaciones"
    id                  = Column(Integer, primary_key=True, index=True)
    productor_id        = Column(Integer, ForeignKey("productores.id"))
    tipo                = Column(String)   # "Fairtrade", "Rainforest Alliance", "BPA"
    numero_cert         = Column(String)
    fecha_emision       = Column(String)
    fecha_vencimiento   = Column(String)
    estado              = Column(String, default="vigente")  # vigente|vencida|en_renovacion
    organismo           = Column(String)
    productor           = relationship("Productor", back_populates="certificaciones")


class Exportador(Base):
    __tablename__ = "exportadores"
    id                 = Column(Integer, primary_key=True, index=True)
    usuario_id         = Column(Integer, ForeignKey("usuarios.id"), unique=True)
    empresa            = Column(String, nullable=False)
    nit                = Column(String)
    ciudad             = Column(String)
    mercados_destino   = Column(String)   # "Alemania,Francia,Japón"
    usuario            = relationship("Usuario", backref="exportador_perfil")
    ordenes            = relationship("OrdenCompra", back_populates="exportador")


class OrdenCompra(Base):
    __tablename__ = "ordenes_compra"
    id                  = Column(Integer, primary_key=True, index=True)
    exportador_id       = Column(Integer, ForeignKey("exportadores.id"))
    lote_id             = Column(String, ForeignKey("lotes.id"))
    precio_acordado_kg  = Column(Float)
    volumen_kg          = Column(Float)
    destino             = Column(String)
    estado              = Column(SAEnum(EstadoOrdenEnum), default=EstadoOrdenEnum.pendiente)
    notas               = Column(Text)
    creado_en           = Column(DateTime, default=datetime.utcnow)
    exportador          = relationship("Exportador", back_populates="ordenes")
    lote                = relationship("Lote")


class OperadorTuristico(Base):
    __tablename__ = "operadores_turisticos"
    id              = Column(Integer, primary_key=True, index=True)
    usuario_id      = Column(Integer, ForeignKey("usuarios.id"), unique=True)
    empresa         = Column(String)
    ciudad          = Column(String)
    servicios       = Column(String)        # "Agroturismo,Ecoturismo,Finca-Hotel"
    tipo_operador   = Column(String, nullable=True)  # "hotel"|"agencia"|"guia"|"persona_natural"
    usuario         = relationship("Usuario", backref="operador_perfil")
    experiencias    = relationship("Experiencia", back_populates="operador")


class Experiencia(Base):
    __tablename__ = "experiencias"
    id             = Column(Integer, primary_key=True, index=True)
    operador_id    = Column(Integer, ForeignKey("operadores_turisticos.id"))
    productor_id   = Column(Integer, ForeignKey("productores.id"))
    titulo         = Column(String)
    descripcion    = Column(Text)
    precio_cop     = Column(Float)
    duracion_horas = Column(Float)
    disponible     = Column(Boolean, default=True)
    tipo_servicio  = Column(String, nullable=True)    # "Agroturismo"|"Ecoturismo"|...
    cupo_maximo    = Column(Integer, nullable=True)
    incluye        = Column(String, nullable=True)    # "Transporte,Alimentación,Guía"
    operador       = relationship("OperadorTuristico", back_populates="experiencias")
    productor      = relationship("Productor")


class Turista(Base):
    __tablename__ = "turistas"
    id           = Column(Integer, primary_key=True, index=True)
    usuario_id   = Column(Integer, ForeignKey("usuarios.id"), unique=True)
    pais_origen  = Column(String)
    favoritos    = Column(Text, default="[]")   # JSON: lista de lote_ids
    usuario      = relationship("Usuario", backref="turista_perfil")


class EstadoReservaEnum(str, enum.Enum):
    pendiente  = "pendiente"
    confirmada = "confirmada"
    cancelada  = "cancelada"


class Reserva(Base):
    __tablename__ = "reservas"
    id             = Column(Integer, primary_key=True, index=True)
    experiencia_id = Column(Integer, ForeignKey("experiencias.id"))
    turista_id     = Column(Integer, ForeignKey("turistas.id"), nullable=True)
    fecha          = Column(String)
    num_personas   = Column(Integer, default=1)
    estado         = Column(SAEnum(EstadoReservaEnum), default=EstadoReservaEnum.pendiente)
    notas          = Column(Text, nullable=True)
    creado_en      = Column(DateTime, default=datetime.utcnow)
    experiencia    = relationship("Experiencia")
    turista        = relationship("Turista", foreign_keys=[turista_id])
