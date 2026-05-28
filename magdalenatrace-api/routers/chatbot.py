"""
routers/chatbot.py — Proxy a Claude API con detección de visualización
Responsable: Mauricio Morales
Detecta: [VIZ:mapa] | [VIZ:tabla] | [VIZ:certs] en la respuesta del modelo
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import ChatbotRequest, ChatbotResponse
from models import Lote, Productor, Certificacion
import os

router = APIRouter()

SYSTEM_PROMPT = """Eres el asistente de MagdalenaTrace, plataforma de trazabilidad agrícola de la Sierra Nevada de Santa Marta, Colombia.

SOLO respondes preguntas sobre:
- Fincas y productores de la Sierra Nevada de Santa Marta
- Lotes de café, cacao, banano y otros productos del Magdalena
- Trazabilidad y cadena de valor agrícola
- Certificaciones (Fairtrade, Rainforest Alliance, BPA)
- Turismo agroecológico en la región
- Exportaciones de productos agrícolas del Magdalena

Si la pregunta NO tiene relación con estos temas, responde exactamente:
"Solo puedo ayudarte con información sobre las fincas, lotes y trazabilidad de la Sierra Nevada de Santa Marta."

Cuando sea relevante, incluye UN marcador de visualización al FINAL de tu respuesta:
- Si mencionas ubicaciones o distribución geográfica de fincas → agrega [VIZ:mapa]
- Si presentas listados comparativos o datos tabulares → agrega [VIZ:tabla]
- Si hablas de certificaciones de productores → agrega [VIZ:certs]
- En cualquier otro caso → no incluyas marcador

Sé conciso, amigable y usa términos locales cuando sea apropiado. Máximo 3 párrafos."""


def _detectar_viz(texto: str, db: Session):
    tipo_viz = "texto"
    datos_viz = None

    if "[VIZ:mapa]" in texto:
        tipo_viz = "mapa"
        texto = texto.replace("[VIZ:mapa]", "").strip()
        productores = db.query(Productor).all()
        datos_viz = [
            {
                "id": p.id,
                "finca": p.finca,
                "vereda": p.vereda,
                "lat": p.lat_aproximada,
                "lng": p.lng_aproximada,
                "productos": p.productos,
                "altitud_msnm": p.altitud_msnm,
            }
            for p in productores
            if p.lat_aproximada and p.lng_aproximada
        ]
    elif "[VIZ:tabla]" in texto:
        tipo_viz = "tabla"
        texto = texto.replace("[VIZ:tabla]", "").strip()
        lotes = db.query(Lote).filter(Lote.estado == "disponible").all()
        datos_viz = [
            {
                "id": l.id,
                "producto": l.producto,
                "variedad": l.variedad,
                "volumen_kg": l.volumen_kg,
                "vereda": l.productor.vereda if l.productor else None,
                "altitud_msnm": l.productor.altitud_msnm if l.productor else None,
            }
            for l in lotes
        ]
    elif "[VIZ:certs]" in texto:
        tipo_viz = "certs"
        texto = texto.replace("[VIZ:certs]", "").strip()
        certs = db.query(Certificacion).all()
        datos_viz = [
            {
                "tipo": c.tipo,
                "estado": c.estado,
                "numero_cert": c.numero_cert,
                "fecha_vencimiento": c.fecha_vencimiento,
                "organismo": c.organismo,
            }
            for c in certs
        ]

    return texto, tipo_viz, datos_viz


@router.post("/mensaje", response_model=ChatbotResponse, summary="Chat con el asistente de MagdalenaTrace")
def chatbot_mensaje(body: ChatbotRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key or api_key == "tu_api_key_aqui":
        return {
            "respuesta": (
                "El asistente está en modo demo (API key no configurada). "
                "Puedes consultar las fincas de la Sierra Nevada, lotes disponibles "
                "y certificaciones desde los otros módulos de MagdalenaTrace."
            ),
            "tipo_viz": "texto",
            "datos_viz": None,
        }

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        messages = [{"role": h.rol, "content": h.contenido} for h in body.historial]
        messages.append({"role": "user", "content": body.mensaje})

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages,
        )

        respuesta_texto = response.content[0].text
        respuesta_texto, tipo_viz, datos_viz = _detectar_viz(respuesta_texto, db)

        return {"respuesta": respuesta_texto, "tipo_viz": tipo_viz, "datos_viz": datos_viz}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el chatbot: {str(e)}")
