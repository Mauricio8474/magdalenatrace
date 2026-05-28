# MagdalenaTrace 🌿

**Plataforma de trazabilidad digital para la cadena de valor agrícola y turística del Magdalena.**

Hackathon Colombia 5.0 · Institución Universitaria de Santa Marta · 28 de mayo de 2026

---

## Equipo

| Integrante | Módulo | Rama Git |
|---|---|---|
| Mauricio Morales | API FastAPI + Base de datos | `feat/api-mauricio` |
| Damián | Web App + Chatbot + Exportador | `feat/web-damian` |
| Camila | QR + Operador Turístico + Mapa | `feat/qr-operador-camila` |
| Nicolle | Demo + Datos + Presentación | `feat/demo-datos-nicolle` |

---

## Estructura del proyecto

```
magdalenatrace/
├── magdalenatrace-api/     # Backend Python FastAPI (Mauricio)
├── magdalenatrace-web/     # Frontend React Vite (Damián, Camila, Nicolle)
└── docs/                   # Documentación del equipo
```

## Levantar el proyecto

### Backend (Mauricio)
```bash
cd magdalenatrace-api
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py                # Cargar datos demo
uvicorn main:app --reload     # API en http://localhost:8000
# Swagger: http://localhost:8000/docs
```

### Frontend (Damián, Camila, Nicolle)
```bash
cd magdalenatrace-web
npm install
npm run dev                   # Web en http://localhost:5173
```

---

## Ramas Git

```
main       ← solo código probado (nunca empujar directo)
develop    ← rama de integración
feat/api-mauricio
feat/web-damian
feat/qr-operador-camila
feat/demo-datos-nicolle
```

**Flujo:** trabajar en rama personal → push → Mauricio integra en develop → todos hacen pull.
