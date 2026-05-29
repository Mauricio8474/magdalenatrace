import os
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar modelos ANTES de create_all para que SQLAlchemy los registre
from models import Usuario, Productor, Lote, CTE, Certificacion, Exportador, OrdenCompra, OperadorTuristico, Experiencia, Turista, Reserva
from database import Base, engine, SessionLocal
from routers import auth, lotes, exportadores, operadores, turistas, chatbot, productores
from sqlalchemy import text

app = FastAPI(
    title="MagdalenaTrace API",
    description="Trazabilidad digital para la cadena de valor del Magdalena.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _apply_migrations():
    """Agrega columnas nuevas a tablas existentes (SQLite no soporta ALTER TABLE DROP,
    pero sí ADD COLUMN — seguro de correr múltiples veces)."""
    new_cols = [
        # tabla                     columna            tipo
        ("experiencias",  "tipo_servicio", "VARCHAR"),
        ("experiencias",  "cupo_maximo",   "INTEGER"),
        ("experiencias",  "incluye",       "VARCHAR"),
        ("operadores_turisticos", "tipo_operador", "VARCHAR"),
        ("usuarios",      "telegram_id",   "BIGINT"),
    ]
    with engine.connect() as conn:
        for table, col, col_type in new_cols:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                conn.commit()
                print(f"  ↳ Migración: {table}.{col} añadida")
            except Exception:
                pass   # La columna ya existe


@app.on_event("startup")
def startup():
    # Debug: listar TODAS las env vars para diagnóstico
    print("=" * 60, flush=True)
    print("🔍 DIAGNÓSTICO DE ENV VARS EN RAILWAY:", flush=True)
    for k, v in sorted(os.environ.items()):
        if any(x in k.lower() for x in ("key", "api", "token", "secret", "gemini", "telegram")):
            print(f"  {k}={v[:12] if v else '(empty)'}... (len={len(v or '')})", flush=True)
    print(f"  CWD: {os.getcwd()}", flush=True)
    print("=" * 60, flush=True)

    # 0. Inicializar API key del chatbot (Groq)
    chatbot.init_api_key()

    # 1. Crear tablas nuevas (Reserva, etc.)
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas creadas / verificadas")

    # 2. Migrar columnas en tablas existentes
    _apply_migrations()

    # 3. Seed si BD vacía
    db = SessionLocal()
    try:
        count = db.query(Usuario).count()
        if count == 0:
            print("🌱 BD vacía — cargando datos demo...")
            import seed
        else:
            print(f"✅ BD tiene {count} usuarios — seed omitido")
    except Exception as e:
        print(f"❌ Error en seed: {e}")
    finally:
        db.close()

    # 4. Bot de Telegram en thread daemon
    if os.getenv("TELEGRAM_BOT_TOKEN"):
        print("🤖 Iniciando bot de Telegram en thread secundario...")
        from bot_telegram import run_bot
        bot_thread = threading.Thread(target=run_bot, daemon=True, name="telegram-bot")
        bot_thread.start()
        print("✅ Bot de Telegram activo")
    else:
        print("⚠️  TELEGRAM_BOT_TOKEN no configurado — bot no iniciado")

# Routers
app.include_router(auth.router,         prefix="/auth",         tags=["Autenticación"])
app.include_router(lotes.router,        prefix="/lotes",        tags=["Lotes"])
app.include_router(exportadores.router, prefix="/exportadores", tags=["Exportadores"])
app.include_router(operadores.router,   prefix="/operadores",   tags=["Operadores Turísticos"])
app.include_router(turistas.router,     prefix="/turistas",     tags=["Turistas"])
app.include_router(chatbot.router,      prefix="/chatbot",      tags=["Chatbot IA"])
app.include_router(productores.router,  prefix="/productores",  tags=["Productores"])

@app.get("/", tags=["Health"])
def root():
    return {"mensaje": "MagdalenaTrace API funcionando ✅", "docs": "/docs"}

@app.get("/debug/env")
def debug_env():
    groq = os.getenv("GROQ_API_KEY", "")
    telegram = os.getenv("TELEGRAM_BOT_TOKEN", "")
    return {
        "GROQ_API_KEY_exists": bool(groq),
        "GROQ_API_KEY_len": len(groq),
        "GROQ_API_KEY_prefix": groq[:12] if groq else "NONE",
        "TELEGRAM_BOT_TOKEN_exists": bool(telegram),
        "TELEGRAM_BOT_TOKEN_len": len(telegram),
        "all_env_keys": sorted([k for k in os.environ.keys() if not k.startswith("_")]),
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}