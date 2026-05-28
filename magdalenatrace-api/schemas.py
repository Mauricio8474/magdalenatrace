"""
schemas.py — Pydantic schemas (contratos de entrada/salida de la API)
Responsable: Mauricio Morales
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth ───────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str
    nombre: str
    id: int

class RegistroExportadorRequest(BaseModel):
    nombre_completo: str
    email: str
    password: str
    empresa: str
    nit: str
    ciudad: str
    mercados_destino: Optional[str] = None

class RegistroTuristaRequest(BaseModel):
    nombre_completo: str
    email: str
    password: str
    pais_origen: Optional[str] = None

class WhatsAppIniciarRequest(BaseModel):
    telefono: str   # formato internacional: "573001234567"

class WhatsAppIniciarResponse(BaseModel):
    nuevo: bool
    productor_id: Optional[int]
    nombre: Optional[str]


# ── Productor ──────────────────────────────────────────────────────────────────

class RegistroProductorRequest(BaseModel):
    """Enviado por el bot tras completar el flujo de registro en WhatsApp."""
    telefono: str
    nombre_completo: str
    finca: str
    vereda: str
    municipio: str = "Santa Marta"
    lat: Optional[float] = None   # coordenada real — se difumina antes de guardar
    lng: Optional[float] = None
    altitud_msnm: Optional[int] = None
    productos: str   # "café,cacao"
    hectareas: Optional[float] = None


# ── Lotes ──────────────────────────────────────────────────────────────────────

class CTEItem(BaseModel):
    tipo: str
    fecha: str
    descripcion: str

class CertificacionPublica(BaseModel):
    tipo: str
    estado: str

class ExperienciaResumen(BaseModel):
    titulo: str
    precio_cop: float
    operador: str

class LotePublicoResponse(BaseModel):
    """Vista pública del lote — sin datos sensibles. Camila la usa en /lote/:id"""
    id: str
    producto: str
    variedad: Optional[str]
    fecha_cosecha: Optional[str]
    volumen_kg: float
    estado: str
    vereda: str
    municipio: str
    altitud_msnm: Optional[int]
    certificaciones: List[CertificacionPublica]
    ctes: List[CTEItem]
    experiencias_disponibles: List[ExperienciaResumen] = []
    # NUNCA incluye: nombre_productor, telefono, precio_kg, coordenadas_exactas

class LoteCatalogoItem(BaseModel):
    """Vista del catálogo para exportadores. Damián la usa en el dashboard."""
    id: str
    producto: str
    variedad: Optional[str]
    volumen_kg: float
    precio_kg: float
    vereda: str
    altitud_msnm: Optional[int]
    ctes_completados: int
    ctes_total: int = 4
    certificaciones: List[str]
    productor_id: int

class CrearLoteRequest(BaseModel):
    producto: str
    variedad: Optional[str] = None
    fecha_cosecha: str
    volumen_kg: float
    precio_kg: Optional[float] = None
    notas: Optional[str] = None

class CrearCTERequest(BaseModel):
    tipo: str   # "insumo" | "cosecha" | "acopio" | "despacho"
    fecha: str
    descripcion: str
    datos_adicionales: Optional[dict] = None


# ── Exportadores ───────────────────────────────────────────────────────────────

class CrearOrdenRequest(BaseModel):
    lote_id: str
    volumen_kg: float
    precio_acordado_kg: float
    destino: str
    notas: Optional[str] = None

class DashboardExportadorResponse(BaseModel):
    lotes_disponibles: int
    ordenes_activas: int
    kg_en_transito: float
    certificaciones_fairtrade_activas: int


# ── Chatbot ────────────────────────────────────────────────────────────────────

class MensajeHistorial(BaseModel):
    rol: str       # "user" | "assistant"
    contenido: str

class ChatbotRequest(BaseModel):
    mensaje: str
    historial: List[MensajeHistorial] = []

class ChatbotResponse(BaseModel):
    respuesta: str
    tipo_viz: str = "texto"   # "texto" | "mapa" | "tabla" | "certs"
    datos_viz: Optional[list] = None
