# Guión del Demo — MagdalenaTrace
Responsable: Nicolle
Tiempo total: máximo 6 minutos

## Setup previo (antes de subir al frente)
- [ ] API corriendo: `uvicorn main:app --reload` en la PC de Mauricio
- [ ] Web corriendo: `npm run dev` en la PC de Damián
- [ ] Celular con datos listo para escanear QR
- [ ] Ventanas abiertas y preparadas: /, /exportador, /mapa, /chatbot

## Los 10 pasos del demo

1. **Landing (30s)** — Abrir `/`. "MagdalenaTrace conecta toda la cadena de valor del Magdalena en una sola plataforma con dos canales: WhatsApp para el productor, y web para el resto."

2. **Bot WhatsApp (60s)** — Click en "Soy Productor". "El caficultor de la Sierra Nevada no descarga apps. Usa WhatsApp, que ya conoce." Simular: menú → opción 2 (cosecha) → "80 kg café pergamino" → confirmación con ✅

3. **Dashboard exportador (60s)** — Abrir `/exportador`. "Inmediatamente, ese lote aparece en el catálogo del exportador." Mostrar el lote, click en "Ver detalle" → perfil del productor + CTEs. Click en "Crear orden" → llenar modal → confirmar.

4. **Mapa de fincas (30s)** — Abrir `/mapa`. "El turista que llega a Santa Marta puede ver exactamente de dónde viene lo que consume." Click en marcador de Minca → popup con certificaciones.

5. **Pasaporte digital (60s)** — Click en "Ver trazabilidad" → `/lote/L2025-001`. "Este es el pasaporte digital del lote. Todo lo que el productor registró, disponible aquí."

6. **QR en celular (30s)** — Mostrar el QR en pantalla. Escanearlo con el celular. Mostrar que abre la misma vista. "Sin instalar apps, solo escaneando."

7. **Chatbot (60s)** — Abrir `/chatbot`. Escribir: "¿Cuántas fincas tienen Rainforest Alliance?" → mapa generado. Luego: "¿Qué lotes de café están disponibles?" → tabla.

8. **Cierre (30s)** — "MagdalenaTrace no es solo una demo. Es un producto real que puede escalar. El productor ya lo usa por WhatsApp, el exportador ya puede comprar, el turista ya puede confiar. Gracias."

## Mensajes clave para los jurados
- "El productor no necesita aprender nada nuevo — WhatsApp es suficiente"
- "Cada dato que el productor registra aparece en tiempo real para el exportador y el turista"
- "Fairtrade y Rainforest Alliance verificables en tiempo real, no solo en papel"
- "Desarrollado en 3.5 horas por estudiantes de la USM con tecnología de clase mundial"
