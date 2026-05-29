from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, SessionLocal

app = FastAPI(
    title="MagdalenaTrace API",
    description="Trazabilidad digital para la cadena de valor agrícola y turística del Magdalena.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    # 1. Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    # 2. Cargar seed si la BD está vacía
    from models import Usuario
    db = SessionLocal()
    try:
        count = db.query(Usuario).count()
        if count == 0:
            print("🌱 BD vacía — cargando datos demo...")
            import seed
        else:
            print(f"✅ BD ya tiene {count} usuarios, seed omitido.")
    except Exception as e:
        print(f"Error en startup: {e}")
    finally:
        db.close()

# Routers — descomentar según estén implementados
# from routers import auth, productores, lotes, exportadores, operadores, turistas, chatbot
# app.include_router(auth.router,         prefix="/auth",         tags=["Autenticación"])
# app.include_router(lotes.router,        prefix="/lotes",        tags=["Lotes"])
# app.include_router(exportadores.router, prefix="/exportadores", tags=["Exportadores"])
# app.include_router(operadores.router,   prefix="/operadores",   tags=["Operadores Turísticos"])
# app.include_router(turistas.router,     prefix="/turistas",     tags=["Turistas"])
# app.include_router(chatbot.router,      prefix="/chatbot",      tags=["Chatbot IA"])

@app.get("/", tags=["Health"])
def root():
    return {"mensaje": "MagdalenaTrace API funcionando ✅", "docs": "/docs"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}