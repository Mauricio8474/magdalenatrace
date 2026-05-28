# Guión del Demo — MagdalenaTrace
**Responsable:** Nicolle  
**Tiempo total:** 6 minutos exactos  
**Presenta:** Nicolle habla, nadie más toca el teclado

---

## ✅ Checklist PRE-DEMO (30 min antes)

```
[ ] API corriendo:  cd magdalenatrace-api && uvicorn main:app --reload
[ ] Frontend:       cd magdalenatrace-web && npm run dev
[ ] Verificar:      curl http://localhost:8000/health → {"status":"ok"}
[ ] BD limpia:      5 lotes disponibles, 0 órdenes activas
[ ] Celular:        Datos móviles ON, QR lector listo (cámara nativa)
[ ] Ventanas abiertas y en orden:
    1. http://localhost:5173/          (Landing)
    2. http://localhost:5173/whatsapp  (Bot)
    3. http://localhost:5173/exportador (Dashboard — LOGIN HECHO)
    4. http://localhost:5173/mapa       (Mapa)
    5. http://localhost:5173/lote/L2025-001 (Pasaporte)
    6. http://localhost:5173/chatbot    (Chatbot)
[ ] Login exportador hecho en pestaña 3:
    email: exportador@sierraexporta.co
    pass:  exporta2026
[ ] Hacer el demo completo UNA VEZ para calentarlo
```

---

## Los 7 pasos del demo

### PASO 1 — Introducción en Landing `[30 seg]`
**Pestaña:** http://localhost:5173/

> *"Buenas tardes. Somos el equipo MagdalenaTrace de la Institución Universitaria de Santa Marta.*
> *El Magdalena exporta café, cacao y banano a mercados que hoy exigen trazabilidad digital.*
> *Sin ella, perdemos competitividad.*
> *Nuestra solución conecta toda la cadena en una plataforma con **dos canales**:*
> ***WhatsApp para el productor** — porque no descarga apps,*
> *y **web para el exportador y el turista**."*

👉 **Acción:** Mostrar las 4 tarjetas. Click en "🌱 Soy Productor".

---

### PASO 2 — Bot WhatsApp `[60 seg]`
**Pestaña:** http://localhost:5173/whatsapp

> *"El caficultor de la Sierra Nevada ya tiene WhatsApp. Con nuestro bot, registra su cosecha*
> *escribiendo solo números. Miren:"*

👉 **Acción en vivo:**
1. Escribir número: `573001234567` → Enter
2. El bot responde "Bienvenido" + menú
3. Escribir `1` (Registrar cosecha)
4. Escribir `1` (Café)
5. Escribir `80`
6. Escribir `Castillo`
7. Escribir `L2025-005` (lote del productor de Pueblo Bello)

> *"¿Ven? Con siete mensajes sencillos, el agricultor registró 80 kg de cosecha.*
> *Todo va directo a la base de datos, en tiempo real."*

**⚠️ Si algo falla:** *"Mientras el registro llega al servidor, permítanme mostrarles cómo eso aparece del otro lado..."* → pasar al siguiente paso.

---

### PASO 3 — Dashboard Exportador `[60 seg]`
**Pestaña:** http://localhost:5173/exportador (ya con sesión iniciada)

> *"Inmediatamente, el exportador ve el catálogo actualizado.*
> *Cinco lotes de la Sierra Nevada — café de Minca a 650 metros, cacao de Palmor a 1100 metros.*
> *Cada uno con sus certificaciones verificadas: Fairtrade, Rainforest Alliance, BPA."*

👉 **Acción:** Señalar los badges de colores en la tabla.

> *"Con un click, el exportador reserva el lote que le interesa:"*

👉 **Acción:**
1. Click en **"Crear orden"** de L2025-001 (Café Minca, Rainforest Alliance)
2. Volumen: `200`, Precio: `12000`, Destino: `Hamburgo, Alemania`
3. Click **"Confirmar orden"**

> *"El lote desaparece del catálogo — ya está reservado — y aparece aquí abajo en 'Mis órdenes activas'*
> *con la barra de progreso de la cadena de trazabilidad."*

👉 **Acción:** Señalar la orden creada con la barra de CTEs.

---

### PASO 4 — Mapa de fincas `[30 seg]`
**Pestaña:** http://localhost:5173/mapa

> *"El turista que llega a Santa Marta puede ver exactamente de dónde viene lo que consume.*
> *Cinco fincas reales de la Sierra Nevada, con sus certificaciones."*

👉 **Acción:**
1. Click en el marcador de **Minca** (norte del mapa)
2. Mostrar el popup: El Paraíso, 650 msnm, Rainforest Alliance
3. Click en **"Ver trazabilidad →"**

---

### PASO 5 — Pasaporte digital `[45 seg]`
**Pestaña:** http://localhost:5173/lote/L2025-001

> *"Este es el pasaporte digital del lote.*
> *Todo lo que el productor registró está aquí: los insumos orgánicos que aplicó en enero,*
> *el control de roya en febrero, la cosecha manual en marzo, y la entrega en cooperativa.*
> *Transparencia total para el comprador internacional.*
> *Y — sin exponer nunca el nombre ni el teléfono del productor."*

👉 **Acción:** Hacer scroll lento por la línea de tiempo de los 5 CTEs.

---

### PASO 6 — QR en celular `[30 seg]`  ⭐ *El momento más impactante*
**Pestaña:** http://localhost:5173/lote/L2025-001 (scroll hasta el QR)

> *"Y ahora lo más poderoso del sistema:"*

👉 **Acción:** Tomar el celular y escanearlo con la cámara nativa.

> *"Sin instalar apps. Solo la cámara del celular."*

[Mostrar el celular al jurado con la misma página abierta]

> *"La trazabilidad completa en la mano del consumidor, en cualquier parte del mundo."*

**⚠️ Si el QR no escanea:** Escribir la URL manualmente en el celular: `localhost:5173/lote/L2025-001`

---

### PASO 7 — Chatbot IA `[45 seg]`
**Pestaña:** http://localhost:5173/chatbot

> *"Por último, el chatbot inteligente de trazabilidad."*

👉 **Acción:** Click en la sugerencia **"¿Cuántas fincas tienen Rainforest Alliance?"**

> *"El exportador puede hacer consultas complejas en lenguaje natural.*
> *Sin filtros manuales, sin tablas — solo pregunta y recibe la respuesta con los datos reales."*

👉 **Acción:** Click en **"¿Qué lotes de café están disponibles?"**

---

### CIERRE `[30 seg]`

> *"MagdalenaTrace no es una demo de hackathon. Es un producto real.*
> *El productor ya puede usarlo por WhatsApp hoy.*
> *El exportador ya puede comprar con trazabilidad verificada.*
> *El turista ya puede confiar en lo que consume.*
> *Construido en 3 horas y media por estudiantes de la Institución Universitaria de Santa Marta,*
> *con tecnología de clase mundial.*
> *Gracias."*

---

## Mensajes clave para responder preguntas del jurado

| Pregunta probable | Respuesta |
|---|---|
| "¿Escala a más productores?" | "La arquitectura es REST + SQLite migrable a PostgreSQL. El bot de WhatsApp puede atender miles de productores simultáneos." |
| "¿Qué pasa si el productor no tiene internet?" | "El bot de WhatsApp funciona con 2G. Solo necesita enviar un mensaje de texto." |
| "¿Cómo se verifican las certificaciones?" | "Hoy el administrador las carga. La siguiente versión conecta directo a la API de Fairtrade International." |
| "¿Qué diferencia tiene de otras soluciones?" | "El canal WhatsApp para el productor. No requiere app, no requiere capacitación. Ya saben usarlo." |
| "¿Cuánto cuesta?" | "El modelo es SaaS. El productor paga 0. El exportador paga una suscripción por acceso al catálogo." |

---

## Protocolo de emergencia

| Situación | Qué hacer |
|---|---|
| API no responde | El frontend tiene datos demo locales. El demo continúa. |
| Mapa no carga | Mostrar el panel lateral con las 5 fincas. Mismo impacto. |
| QR no escanea | Escribir URL en el celular manualmente. |
| Chatbot sin API key | Modo fallback activo — no es error 500, responde con mensaje claro. |
| Cualquier error | "En producción esto funciona así..." y seguir con el siguiente paso. |

---

## Estado del sistema al inicio del demo

```
✅ 5 lotes disponibles (0 órdenes activas)
✅ 5 fincas reales Sierra Nevada con CTEs enriquecidos
✅ Lote L2025-001: 5 CTEs (insumo×2, cosecha, acopio, +experiencia turística)
✅ Lote L2025-002: 4 CTEs (insumo×2, cosecha, acopio)  
✅ Lote L2025-003: 4 CTEs — cadena completa con despacho
✅ 4 certificaciones activas: 2 Fairtrade, 2 Rainforest Alliance, 1 BPA
✅ Privacidad verificada: nombre/teléfono/precio NO expuestos en vista pública
✅ QR funcional: apunta a http://localhost:5173/lote/L2025-001
```
