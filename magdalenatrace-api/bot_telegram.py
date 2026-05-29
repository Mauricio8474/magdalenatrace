"""
bot_telegram.py — Bot de Telegram para productores de MagdalenaTrace
Equipo: BahIA SMR — Hackathon Colombia 5.0

Flujos implementados:
  /start → registro o menú según si ya existe
  Menú   → cosecha | insumo | despacho | ver lotes | certs | ventas
"""
import os
import asyncio
import logging
import random
import threading
from datetime import datetime

from telegram import Update, ReplyKeyboardMarkup, ReplyKeyboardRemove
from telegram.ext import (
    Application, CommandHandler, MessageHandler,
    filters, ContextTypes, ConversationHandler,
)

from database import SessionLocal
from models import (
    Usuario, Productor, Lote, CTE, Certificacion,
    RolEnum, EstadoLoteEnum, TipoCTEEnum,
)

logging.basicConfig(
    format="%(asctime)s [BOT] %(levelname)s — %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# ── Estados de la conversación ─────────────────────────────────────────────────
(
    MENU_PRINCIPAL,
    REG_NOMBRE, REG_FINCA, REG_VEREDA, REG_PRODUCTO, REG_ALTITUD,
    COSECHA_PRODUCTO, COSECHA_KG, COSECHA_VARIEDAD, COSECHA_LOTE,
    INSUMO_NOMBRE, INSUMO_CANTIDAD, INSUMO_LOTE,
    DESPACHO_LOTE, DESPACHO_TRANSPORTISTA, DESPACHO_DESTINO,
) = range(16)

KEYBOARD_MENU = [
    ["1️⃣ Registrar cosecha",  "2️⃣ Registrar insumo"],
    ["3️⃣ Registrar despacho", "4️⃣ Ver mis lotes"],
    ["5️⃣ Ver certificaciones", "6️⃣ Ver mis ventas"],
]

# ── Helpers ────────────────────────────────────────────────────────────────────

def difuminar(coord: float) -> float:
    """Difumina coordenada ±0.01° para proteger privacidad del productor."""
    return round(coord + random.uniform(-0.01, 0.01), 6)


def get_productor(telegram_id: int):
    """Busca productor por telegram_id (almacenado en Usuario.telefono)."""
    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter(
            Usuario.telefono == str(telegram_id),
            Usuario.rol == RolEnum.productor,
        ).first()
        if usuario:
            productor = db.query(Productor).filter(
                Productor.usuario_id == usuario.id
            ).first()
            return usuario, productor
        return None, None
    finally:
        db.close()


# ── /start ─────────────────────────────────────────────────────────────────────

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id   = update.effective_user.id
    nombre_tg     = update.effective_user.first_name
    usuario, prod = get_productor(telegram_id)

    if prod:
        await update.message.reply_text(
            f"¡Bienvenido de nuevo, {usuario.nombre_completo}! 👋🌿\n\n"
            "¿Qué deseas registrar hoy?",
            reply_markup=ReplyKeyboardMarkup(KEYBOARD_MENU, resize_keyboard=True),
        )
        return MENU_PRINCIPAL

    await update.message.reply_text(
        f"¡Hola {nombre_tg}! 👋\n\n"
        "Bienvenido a *MagdalenaTrace* — la plataforma de trazabilidad "
        "agrícola del Magdalena. 🌿\n\n"
        "Voy a registrarte en el sistema. Solo toma un minuto.\n\n"
        "¿Cuál es tu *nombre completo*?",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove(),
    )
    return REG_NOMBRE


# ── REGISTRO ───────────────────────────────────────────────────────────────────

async def reg_nombre(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["nombre"] = update.message.text.strip()
    await update.message.reply_text("¿Cómo se llama tu finca? 🏡")
    return REG_FINCA


async def reg_finca(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["finca"] = update.message.text.strip()
    await update.message.reply_text("¿En qué vereda está ubicada? 📍")
    return REG_VEREDA


async def reg_vereda(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["vereda"] = update.message.text.strip()
    await update.message.reply_text(
        "¿Qué productos cultivas? 🌿",
        reply_markup=ReplyKeyboardMarkup(
            [["1️⃣ Café", "2️⃣ Cacao"], ["3️⃣ Banano", "4️⃣ Varios"]],
            resize_keyboard=True,
        ),
    )
    return REG_PRODUCTO


async def reg_producto(update: Update, context: ContextTypes.DEFAULT_TYPE):
    opciones = {
        "1️⃣ Café":   "café",
        "2️⃣ Cacao":  "cacao",
        "3️⃣ Banano": "banano",
        "4️⃣ Varios": "café,cacao,banano",
    }
    context.user_data["productos"] = opciones.get(update.message.text, update.message.text)
    await update.message.reply_text(
        "¿A qué altura está tu finca?\n"
        "Escribe los metros sobre el nivel del mar. Ej: *800*",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove(),
    )
    return REG_ALTITUD


async def reg_altitud(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        altitud = int(update.message.text.replace("m", "").replace("msnm", "").strip())
    except ValueError:
        altitud = 800

    telegram_id = update.effective_user.id
    db = SessionLocal()
    try:
        usuario = Usuario(
            telefono=str(telegram_id),
            nombre_completo=context.user_data["nombre"],
            rol=RolEnum.productor,
            activo=True,
            aprobado=True,
        )
        db.add(usuario)
        db.flush()

        productor = Productor(
            usuario_id=usuario.id,
            finca=context.user_data["finca"],
            vereda=context.user_data["vereda"],
            municipio="Santa Marta",
            lat_aproximada=difuminar(11.1333),
            lng_aproximada=difuminar(-74.1167),
            altitud_msnm=altitud,
            productos=context.user_data["productos"],
        )
        db.add(productor)
        db.commit()

        await update.message.reply_text(
            f"✅ *¡Registro exitoso!*\n\n"
            f"👤 Nombre: {context.user_data['nombre']}\n"
            f"🏡 Finca: {context.user_data['finca']}\n"
            f"📍 Vereda: {context.user_data['vereda']}\n"
            f"🌿 Productos: {context.user_data['productos']}\n"
            f"🏔️ Altitud: {altitud} msnm\n\n"
            "Ya estás en MagdalenaTrace. ¿Qué deseas hacer?",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardMarkup(KEYBOARD_MENU, resize_keyboard=True),
        )
        return MENU_PRINCIPAL

    except Exception as e:
        db.rollback()
        logger.error(f"Error en registro productor {telegram_id}: {e}")
        await update.message.reply_text(
            "⚠️ Hubo un error al registrarte. Escribe /start para intentar de nuevo."
        )
        return ConversationHandler.END
    finally:
        db.close()


# ── MENÚ PRINCIPAL ─────────────────────────────────────────────────────────────

async def menu_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    texto      = update.message.text.lower()
    telegram_id = update.effective_user.id
    usuario, productor = get_productor(telegram_id)

    if not productor:
        await update.message.reply_text("Escribe /start para registrarte primero.")
        return ConversationHandler.END

    # ── Cosecha ──
    if "cosecha" in texto or texto.startswith("1"):
        await update.message.reply_text(
            "🌾 *Registrar cosecha*\n\n¿Qué producto cosechaste?",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardMarkup(
                [["1️⃣ Café", "2️⃣ Cacao"], ["3️⃣ Banano", "4️⃣ Otro"]],
                resize_keyboard=True,
            ),
        )
        return COSECHA_PRODUCTO

    # ── Insumo ──
    if "insumo" in texto or texto.startswith("2"):
        await update.message.reply_text(
            "🌿 *Registrar insumo*\n\n¿Qué insumo aplicaste?\n"
            "Ej: Urea, Abono foliar, Fungicida Caldo Bordelés",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardRemove(),
        )
        return INSUMO_NOMBRE

    # ── Despacho ──
    if "despacho" in texto or texto.startswith("3"):
        db = SessionLocal()
        try:
            lotes = db.query(Lote).filter(
                Lote.productor_id == productor.id,
                Lote.estado == EstadoLoteEnum.disponible,
            ).all()
            if not lotes:
                await update.message.reply_text(
                    "No tienes lotes disponibles para despachar.\n"
                    "Registra una cosecha primero."
                )
                return MENU_PRINCIPAL
            keyboard = [[l.id] for l in lotes]
            await update.message.reply_text(
                "🚢 *Registrar despacho*\n\n¿Cuál lote vas a despachar?",
                parse_mode="Markdown",
                reply_markup=ReplyKeyboardMarkup(keyboard, resize_keyboard=True),
            )
            return DESPACHO_LOTE
        finally:
            db.close()

    # ── Ver lotes ──
    if "lote" in texto or texto.startswith("4"):
        db = SessionLocal()
        try:
            lotes = db.query(Lote).filter(Lote.productor_id == productor.id).all()
            if not lotes:
                await update.message.reply_text(
                    "No tienes lotes registrados aún.\n"
                    "Registra una cosecha para crear tu primer lote. 🌾"
                )
                return MENU_PRINCIPAL
            estado_emoji = {"disponible": "✅", "reservado": "🔒", "vendido": "🤝", "despachado": "📤"}
            msg = "📦 *Tus lotes:*\n\n"
            for l in lotes:
                emoji = estado_emoji.get(str(l.estado).split(".")[-1], "📦")
                msg += f"{emoji} *{l.id}* — {l.producto}\n   {l.volumen_kg} kg · {l.estado}\n\n"
            await update.message.reply_text(msg, parse_mode="Markdown")
        finally:
            db.close()
        return MENU_PRINCIPAL

    # ── Certificaciones ──
    if "certif" in texto or texto.startswith("5"):
        db = SessionLocal()
        try:
            certs = db.query(Certificacion).filter(
                Certificacion.productor_id == productor.id
            ).all()
            if not certs:
                await update.message.reply_text(
                    "No tienes certificaciones registradas.\n"
                    "Contacta al administrador para agregar tus certificaciones."
                )
                return MENU_PRINCIPAL
            msg = "🏅 *Tus certificaciones:*\n\n"
            for c in certs:
                emoji = "✅" if c.estado == "vigente" else "⚠️"
                msg += f"{emoji} *{c.tipo}*\n   Vence: {c.fecha_vencimiento}\n\n"
            await update.message.reply_text(msg, parse_mode="Markdown")
        finally:
            db.close()
        return MENU_PRINCIPAL

    # ── Ventas ──
    if "venta" in texto or texto.startswith("6"):
        db = SessionLocal()
        try:
            estados_vendido = ["vendido", "despachado", "reservado"]
            lotes = db.query(Lote).filter(
                Lote.productor_id == productor.id,
            ).all()
            lotes_v = [l for l in lotes if str(l.estado).split(".")[-1] in estados_vendido]
            if not lotes_v:
                await update.message.reply_text("Aún no tienes ventas registradas.")
                return MENU_PRINCIPAL
            msg = "🤝 *Tus ventas:*\n\n"
            for l in lotes_v:
                msg += f"📦 *{l.id}* — {l.producto}\n   {l.volumen_kg} kg · {l.estado}\n\n"
            await update.message.reply_text(msg, parse_mode="Markdown")
        finally:
            db.close()
        return MENU_PRINCIPAL

    # Opción no reconocida
    await update.message.reply_text(
        "No entendí esa opción. Usa el menú de botones 👇",
        reply_markup=ReplyKeyboardMarkup(KEYBOARD_MENU, resize_keyboard=True),
    )
    return MENU_PRINCIPAL


# ── COSECHA ────────────────────────────────────────────────────────────────────

async def cosecha_producto(update: Update, context: ContextTypes.DEFAULT_TYPE):
    opciones = {
        "1️⃣ Café":   "Café pergamino",
        "2️⃣ Cacao":  "Cacao seco",
        "3️⃣ Banano": "Banano orgánico",
        "4️⃣ Otro":   "Otro",
    }
    context.user_data["cosecha_producto"] = opciones.get(update.message.text, update.message.text)
    await update.message.reply_text(
        "¿Cuántos *kilogramos* cosechaste? Escribe solo el número. Ej: *120*",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove(),
    )
    return COSECHA_KG


async def cosecha_kg(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        context.user_data["cosecha_kg"] = float(
            update.message.text.replace("kg", "").replace(",", ".").strip()
        )
    except ValueError:
        await update.message.reply_text("Escribe solo el número. Ej: 120")
        return COSECHA_KG
    await update.message.reply_text(
        "¿Qué *variedad*? Ej: Castillo, Caturra, CCN-51\n"
        "Escribe *0* para omitir.",
        parse_mode="Markdown",
    )
    return COSECHA_VARIEDAD


async def cosecha_variedad(update: Update, context: ContextTypes.DEFAULT_TYPE):
    val = update.message.text.strip()
    context.user_data["cosecha_variedad"] = None if val == "0" else val
    await update.message.reply_text(
        "¿En cuál lote lo registramos?\n"
        "Escribe el ID de un lote existente *o* escribe *NUEVO* para crear uno.",
        parse_mode="Markdown",
    )
    return COSECHA_LOTE


async def cosecha_lote(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id  = update.effective_user.id
    usuario, prod = get_productor(telegram_id)
    lote_input   = update.message.text.strip().upper()
    fecha_hoy    = datetime.now().strftime("%Y-%m-%d")
    db = SessionLocal()
    try:
        if lote_input == "NUEVO":
            count    = db.query(Lote).count() + 1
            lote_id  = f"L{datetime.now().year}-{count:03d}"
            lote     = Lote(
                id=lote_id,
                productor_id=prod.id,
                producto=context.user_data["cosecha_producto"],
                variedad=context.user_data.get("cosecha_variedad"),
                fecha_cosecha=fecha_hoy,
                volumen_kg=context.user_data["cosecha_kg"],
                estado=EstadoLoteEnum.disponible,
                qr_url=f"https://magdalenatrace-nqwyqwmdy-mauricio-s-projects-ai.vercel.app/lote/{lote_id}",
            )
            db.add(lote)
            db.flush()
        else:
            lote = db.query(Lote).filter(
                Lote.id == lote_input,
                Lote.productor_id == prod.id,
            ).first()
            if not lote:
                await update.message.reply_text(
                    f"No encontré el lote *{lote_input}*.\n"
                    "Escribe NUEVO para crear uno o revisa el ID.",
                    parse_mode="Markdown",
                )
                return COSECHA_LOTE
            lote_id = lote.id

        cte = CTE(
            lote_id=lote_id,
            tipo=TipoCTEEnum.cosecha,
            fecha=fecha_hoy,
            descripcion=f"Cosecha manual selectiva, {context.user_data['cosecha_kg']} kg",
            responsable_id=usuario.id,
        )
        db.add(cte)
        db.commit()

        await update.message.reply_text(
            f"✅ *¡Cosecha registrada!*\n\n"
            f"📦 Lote: `{lote_id}`\n"
            f"🌾 Producto: {context.user_data['cosecha_producto']}\n"
            f"⚖️ Cantidad: {context.user_data['cosecha_kg']} kg\n"
            f"📅 Fecha: {fecha_hoy}\n\n"
            f"Trazabilidad pública:\n`vercel.app/lote/{lote_id}`",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardMarkup(KEYBOARD_MENU, resize_keyboard=True),
        )
        return MENU_PRINCIPAL

    except Exception as e:
        db.rollback()
        logger.error(f"Error cosecha {telegram_id}: {e}")
        await update.message.reply_text("⚠️ Error al guardar. Escribe /start e intenta de nuevo.")
        return ConversationHandler.END
    finally:
        db.close()


# ── INSUMO ─────────────────────────────────────────────────────────────────────

async def insumo_nombre(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["insumo_nombre"] = update.message.text.strip()
    await update.message.reply_text(
        "¿Qué cantidad aplicaste? Ej: 2 bultos, 5 litros, 1 kg"
    )
    return INSUMO_CANTIDAD


async def insumo_cantidad(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["insumo_cantidad"] = update.message.text.strip()
    await update.message.reply_text(
        "¿En cuál lote o área lo aplicaste?\n"
        "Escribe el ID del lote. Ej: L2025-001"
    )
    return INSUMO_LOTE


async def insumo_lote(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id   = update.effective_user.id
    usuario, prod = get_productor(telegram_id)
    lote_input    = update.message.text.strip().upper()
    fecha_hoy     = datetime.now().strftime("%Y-%m-%d")
    db = SessionLocal()
    try:
        lote = db.query(Lote).filter(
            Lote.id == lote_input,
            Lote.productor_id == prod.id,
        ).first()

        if lote:
            cte = CTE(
                lote_id=lote.id,
                tipo=TipoCTEEnum.insumo,
                fecha=fecha_hoy,
                descripcion=(
                    f"{context.user_data['insumo_nombre']} — "
                    f"{context.user_data['insumo_cantidad']}"
                ),
                responsable_id=usuario.id,
            )
            db.add(cte)
            db.commit()
            msg_lote = f"asociado al lote `{lote.id}`"
        else:
            msg_lote = "(lote no encontrado, insumo guardado sin asociar)"

        await update.message.reply_text(
            f"✅ *Insumo registrado*\n\n"
            f"🌿 Insumo: {context.user_data['insumo_nombre']}\n"
            f"📦 Cantidad: {context.user_data['insumo_cantidad']}\n"
            f"📅 Fecha: {fecha_hoy}\n"
            f"🔗 {msg_lote}",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardMarkup(KEYBOARD_MENU, resize_keyboard=True),
        )
        return MENU_PRINCIPAL

    except Exception as e:
        db.rollback()
        logger.error(f"Error insumo {telegram_id}: {e}")
        await update.message.reply_text("⚠️ Error al guardar. Intenta de nuevo.")
        return MENU_PRINCIPAL
    finally:
        db.close()


# ── DESPACHO ───────────────────────────────────────────────────────────────────

async def despacho_lote(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["despacho_lote"] = update.message.text.strip().upper()
    await update.message.reply_text(
        "¿A quién le entregas el producto?\n"
        "Nombre del transportista o empresa:",
        reply_markup=ReplyKeyboardRemove(),
    )
    return DESPACHO_TRANSPORTISTA


async def despacho_transportista(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["despacho_transportista"] = update.message.text.strip()
    await update.message.reply_text(
        "¿Hacia dónde sale el producto?\nEj: Santa Marta, Barranquilla, Bogotá"
    )
    return DESPACHO_DESTINO


async def despacho_destino(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id   = update.effective_user.id
    usuario, prod = get_productor(telegram_id)
    destino       = update.message.text.strip()
    lote_id       = context.user_data["despacho_lote"]
    fecha_hoy     = datetime.now().strftime("%Y-%m-%d")
    db = SessionLocal()
    try:
        lote = db.query(Lote).filter(
            Lote.id == lote_id,
            Lote.productor_id == prod.id,
        ).first()

        if lote:
            lote.estado = EstadoLoteEnum.despachado
            cte = CTE(
                lote_id=lote_id,
                tipo=TipoCTEEnum.despacho,
                fecha=fecha_hoy,
                descripcion=(
                    f"Despacho a {destino} vía "
                    f"{context.user_data['despacho_transportista']}"
                ),
                responsable_id=usuario.id,
            )
            db.add(cte)
            db.commit()

        await update.message.reply_text(
            f"✅ *Despacho registrado*\n\n"
            f"📦 Lote: `{lote_id}`\n"
            f"🚛 Transportista: {context.user_data['despacho_transportista']}\n"
            f"📍 Destino: {destino}\n"
            f"📅 Fecha: {fecha_hoy}\n\n"
            "El lote queda marcado como *despachado*.",
            parse_mode="Markdown",
            reply_markup=ReplyKeyboardMarkup(KEYBOARD_MENU, resize_keyboard=True),
        )
        return MENU_PRINCIPAL

    except Exception as e:
        db.rollback()
        logger.error(f"Error despacho {telegram_id}: {e}")
        await update.message.reply_text("⚠️ Error al registrar. Intenta de nuevo.")
        return MENU_PRINCIPAL
    finally:
        db.close()


# ── CANCELAR ───────────────────────────────────────────────────────────────────

async def cancelar(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Operación cancelada. ¿Qué deseas hacer?",
        reply_markup=ReplyKeyboardMarkup(KEYBOARD_MENU, resize_keyboard=True),
    )
    return MENU_PRINCIPAL


# ── run_bot() ──────────────────────────────────────────────────────────────────

def run_bot():
    """
    Corre el bot de Telegram en su propio event loop.
    Diseñado para ejecutarse en un thread secundario junto con FastAPI.
    """
    if not TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN no está definido. Bot no iniciado.")
        return

    async def _polling():
        application = Application.builder().token(TOKEN).build()

        conv = ConversationHandler(
            entry_points=[CommandHandler("start", start)],
            states={
                MENU_PRINCIPAL:        [MessageHandler(filters.TEXT & ~filters.COMMAND, menu_handler)],
                REG_NOMBRE:            [MessageHandler(filters.TEXT & ~filters.COMMAND, reg_nombre)],
                REG_FINCA:             [MessageHandler(filters.TEXT & ~filters.COMMAND, reg_finca)],
                REG_VEREDA:            [MessageHandler(filters.TEXT & ~filters.COMMAND, reg_vereda)],
                REG_PRODUCTO:          [MessageHandler(filters.TEXT & ~filters.COMMAND, reg_producto)],
                REG_ALTITUD:           [MessageHandler(filters.TEXT & ~filters.COMMAND, reg_altitud)],
                COSECHA_PRODUCTO:      [MessageHandler(filters.TEXT & ~filters.COMMAND, cosecha_producto)],
                COSECHA_KG:            [MessageHandler(filters.TEXT & ~filters.COMMAND, cosecha_kg)],
                COSECHA_VARIEDAD:      [MessageHandler(filters.TEXT & ~filters.COMMAND, cosecha_variedad)],
                COSECHA_LOTE:          [MessageHandler(filters.TEXT & ~filters.COMMAND, cosecha_lote)],
                INSUMO_NOMBRE:         [MessageHandler(filters.TEXT & ~filters.COMMAND, insumo_nombre)],
                INSUMO_CANTIDAD:       [MessageHandler(filters.TEXT & ~filters.COMMAND, insumo_cantidad)],
                INSUMO_LOTE:           [MessageHandler(filters.TEXT & ~filters.COMMAND, insumo_lote)],
                DESPACHO_LOTE:         [MessageHandler(filters.TEXT & ~filters.COMMAND, despacho_lote)],
                DESPACHO_TRANSPORTISTA:[MessageHandler(filters.TEXT & ~filters.COMMAND, despacho_transportista)],
                DESPACHO_DESTINO:      [MessageHandler(filters.TEXT & ~filters.COMMAND, despacho_destino)],
            },
            fallbacks=[CommandHandler("cancelar", cancelar)],
        )
        application.add_handler(conv)

        logger.info("🤖 Bot MagdalenaTrace iniciando polling en Telegram...")
        async with application:
            await application.start()
            await application.updater.start_polling(drop_pending_updates=True)
            # Mantener el bot activo hasta que el thread sea cancelado
            await asyncio.Event().wait()

    # Event loop propio para el thread (evita conflictos con el loop de uvicorn)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_polling())
    except Exception as e:
        logger.error(f"Bot Telegram error: {e}")
    finally:
        loop.close()


if __name__ == "__main__":
    run_bot()
