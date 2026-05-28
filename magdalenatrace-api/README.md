# magdalenatrace-api

Backend de MagdalenaTrace — FastAPI + SQLite.
**Responsable:** Mauricio Morales

## Setup
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # editar ANTHROPIC_API_KEY
python seed.py             # datos demo
uvicorn main:app --reload
```

## Estructura
```
magdalenatrace-api/
├── main.py          # App + CORS + routers
├── database.py      # Conexión SQLite
├── models.py        # Modelos ORM (NO tocar sin avisar al equipo)
├── schemas.py       # Pydantic schemas
├── auth.py          # JWT + roles
├── seed.py          # Datos demo
└── routers/
    ├── auth.py
    ├── productores.py
    ├── lotes.py
    ├── exportadores.py
    ├── operadores.py
    ├── turistas.py
    └── chatbot.py
```

## Endpoints disponibles
Ver http://localhost:8000/docs (Swagger automático)
