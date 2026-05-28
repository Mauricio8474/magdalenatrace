"""
main.py — Punto de entrada de la API MagdalenaTrace
Responsable: Mauricio Morales
Levantar: uvicorn main:app --reload
Swagger:  http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine

# Crear todas las tablas al iniciar (si no existen)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MagdalenaTrace API",
    description="Trazabilidad digital para la cadena de valor agrícola y turística del Magdalena.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Permite peticiones desde el frontend React en localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
# TODO: descomentar cada router a medida que se implemente
# from routers import auth, productores, lotes, exportadores, operadores, turistas, chatbot
# app.include_router(auth.router,         prefix="/auth",         tags=["Autenticación"])
# app.include_router(productores.router,  prefix="/productores",  tags=["Productores"])
# app.include_router(lotes.router,        prefix="/lotes",        tags=["Lotes"])
# app.include_router(exportadores.router, prefix="/exportadores", tags=["Exportadores"])
# app.include_router(operadores.router,   prefix="/operadores",   tags=["Operadores Turísticos"])
# app.include_router(turistas.router,     prefix="/turistas",     tags=["Turistas"])
# app.include_router(chatbot.router,      prefix="/chatbot",      tags=["Chatbot IA"])

@app.get("/", tags=["Health"])
def root():
    return {
        "mensaje": "MagdalenaTrace API funcionando ✅",
        "docs": "http://localhost:8000/docs",
        "version": "1.0.0"
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
