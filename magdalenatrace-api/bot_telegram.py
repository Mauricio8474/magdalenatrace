"""
bot_telegram.py — Bot de Telegram para productores de MagdalenaTrace
Ejecutado como thread daemon desde main.py

Flujo:
  /start → pedir teléfono → verificar/registrar → menú principal
  Menú: cosecha, insumo, despacho, mis lotes, certificaciones, catálogo
"""
import os
import asyncio
import logging
import random
from datetime import date

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters,
    ContextTypes,
)

from database import SessionLocal
from models import Usuario, Productor, Lote, CTE, Certificacion, RolEnum, TipoCTEEnum, EstadoLoteEnum

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("bot_telegram")

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")


class ESTADO:
    INICIO = 0
    ESPERANDO_TELEFONO = 1
    REGISTRO_NOMBRE = 2
    REGISTRO_FINCA = 3
    REGISTRO_VEREDA = 4
    REGISTRO_PRODUCTOS = 5
    REGISTRO_ALTITUD = 6
    MENU_PRINCIPAL = 7
    COSECHA_PRODUCTO = 8
    COSECHA_KG = 9
    COSECHA_VARIEDAD = 10
    COSECHA_LOTE = 11
    INSUMO_NOMBRE = 12
    INSUMO_CANTIDAD = 13
    INSUMO_LOTE = 14
    DESPACHO_PRODUCTO = 15
    DESPACHO_KG = 16
    DESPACHO_LOTE = 17


PROD_MAP = {"1": "café", "2": "cacao", "3": "banano", "4": "otro"}
PROD_REG_MAP = {"1": "café", "2": "cacao", "3": "banano", "4": "café,cacao,banano"}

user_sessions: dict[int, dict] = {}


def _ses(user_id: int) -> dict:
    if user_id not in user_sessions:
        user_sessions[user_id] = {"state": ESTADO.INICIO, "data": {}}
    return user_sessions[user_id]


def _state(user_id: int) -> int:
    return _ses(user_id)["state"]


def _set_state(user_id: int, s: int):
    _ses(user_id)["state"] = s


def _d(user_id: int) -> dict:
    return _ses(user_id)["data"]


def _menu_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("1️⃣ Registrar cosecha", callback_data="m_cosecha")],
        [InlineKeyboardButton("2️⃣ Registrar insumo", callback_data="m_insumo")],
        [InlineKeyboardButton("3️⃣ Registrar despacho", callback_data="m_despacho")],
        [InlineKeyboardButton("4️⃣ Mis lotes", callback_data="m_lotes")],
        [InlineKeyboardButton("5️⃣ Mis certificaciones", callback_data="m_certs")],
        [InlineKeyboardButton("6️⃣ Catálogo de lotes", callback_data="m_catalogo")],
        [InlineKeyboardButton("❓ Ayuda", callback_data="m_ayuda")],
    ])


MENU = (
    "🌾 *MagdalenaTrace — Menú*\n\n"
    "1️⃣ Registrar cosecha\n"
    "2️⃣ Registrar insumo\n"
    "3️⃣ Registrar despacho\n"
    "4️⃣ Ver mis lotes\n"
    "5️⃣ Ver mis certificaciones\n"
    "6️⃣ Catálogo de lotes\n"
    "❓ Ayuda"
)


def _db():
    return SessionLocal()


async def start(update: Update, _ctx: ContextTypes.DEFAULT_TYPE):
    uid = update.effective_user.id
    _set_state(uid, ESTADO.ESPERANDO_TELEFONO)
    _d(uid).clear()
    await update.message.reply_text(
        "🌾 *Bienvenido a MagdalenaTrace*\n\n"
        "Soy el asistente para productores de la Sierra Nevada.\n"
        "Registra cosechas, insumos y consulta tus lotes.\n\n"
        "Para comenzar, *¿cuál es tu número de teléfono?*\n"
        "Formato: `57300XXXXXXX`",
        parse_mode="Markdown",
    )


async def cmd_menu(update: Update, _ctx: ContextTypes.DEFAULT_TYPE):
    uid = update.effective_user.id
    _set_state(uid, ESTADO.MENU_PRINCIPAL)
    await update.message.reply_text(MENU, parse_mode="Markdown", reply_markup=_menu_keyboard())


async def cmd_cancelar(update: Update, _ctx: ContextTypes.DEFAULT_TYPE):
    uid = update.effective_user.id
    _set_state(uid, ESTADO.MENU_PRINCIPAL)
    await update.message.reply_text("✅ Operación cancelada.", reply_markup=_menu_keyboard())


async def _mostrar_lotes(uid: int, reply):
    pid = _d(uid).get("productor_id")
    if not pid:
        await reply("⚠️ No tienes perfil de productor.")
        return
    db = _db()
    try:
        lotes = db.query(Lote).filter(Lote.productor_id == pid).all()
        if not lotes:
            await reply("📋 No tienes lotes registrados aún.", kb=True)
            return
        lines = []
        for l in lotes:
            certs = db.query(Certificacion).filter(Certificacion.productor_id == pid,
                                                    Certificacion.estado == "vigente").all()
            cs = f" 🏅{', '.join(c.tipo for c in certs)}" if certs else ""
            lines.append(f"📦 *{l.id}* — {l.producto}{cs}\n   {l.volumen_kg} kg · {l.estado} · {len(l.ctes)}/4 CTEs")
        await reply(f"📋 *Tus lotes ({len(lotes)}):*\n\n" + "\n\n".join(lines), md=True)
    finally:
        db.close()


async def _mostrar_certs(uid: int, reply):
    pid = _d(uid).get("productor_id")
    if not pid:
        await reply("⚠️ No tienes perfil de productor.")
        return
    db = _db()
    try:
        certs = db.query(Certificacion).filter(Certificacion.productor_id == pid).all()
        if not certs:
            await reply("🏅 No tienes certificaciones.", kb=True)
            return
        lines = []
        for c in certs:
            e = "✅" if c.estado == "vigente" else "⚠️"
            lines.append(f"{e} *{c.tipo}* — {c.estado}\n   Vence: {c.fecha_vencimiento} · {c.organismo}")
        await reply("🏅 *Tus certificaciones:*\n\n" + "\n\n".join(lines), md=True)
    finally:
        db.close()


async def _mostrar_catalogo(reply):
    db = _db()
    try:
        lotes = db.query(Lote).filter(Lote.estado == "disponible").all()
        if not lotes:
            await reply("📦 No hay lotes disponibles.", kb=True)
            return
        lines = []
        for l in lotes[:10]:
            v = l.productor.vereda if l.productor else "?"
            lines.append(f"📦 *{l.id}* — {l.producto}\n   {l.volumen_kg} kg · ${l.precio_kg:,.0f}/kg · {v}")
        t = f"📋 *Catálogo disponible:*\n\n" + "\n\n".join(lines)
        if len(lotes) > 10:
            t += f"\n\n... y {len(lotes) - 10} más."
        await reply(t, md=True)
    finally:
        db.close()


async def button_handler(update: Update, _ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    uid = update.effective_user.id
    d = q.data

    async def edit(text: str, md=False, kb=False):
        kw = {"parse_mode": "Markdown"} if md else {}
        if kb:
            kw["reply_markup"] = _menu_keyboard()
        await q.edit_message_text(text, **kw)

    kb_back = InlineKeyboardMarkup([[InlineKeyboardButton("🔙 Volver", callback_data="m_volver")]])

    if d == "m_cosecha":
        _set_state(uid, ESTADO.COSECHA_PRODUCTO)
        await edit("📦 *Registrar cosecha*\n\n¿Qué producto cosechaste?\n\n1️⃣ Café\n2️⃣ Cacao\n3️⃣ Banano\n4️⃣ Otro", md=True)
    elif d == "m_insumo":
        _set_state(uid, ESTADO.INSUMO_NOMBRE)
        await edit("🌱 *Registrar insumo*\n\n¿Qué insumo aplicaste?", md=True)
    elif d == "m_despacho":
        _set_state(uid, ESTADO.DESPACHO_PRODUCTO)
        await edit("🚚 *Registrar despacho*\n\n¿Qué producto despachaste?\n\n1️⃣ Café\n2️⃣ Cacao\n3️⃣ Banano\n4️⃣ Otro", md=True)
    elif d == "m_lotes":
        await _mostrar_lotes(uid, lambda t, md=False: edit(t, md=md, kb=True))
    elif d == "m_certs":
        await _mostrar_certs(uid, lambda t, md=False: edit(t, md=md, kb=True))
    elif d == "m_catalogo":
        await _mostrar_catalogo(lambda t, md=False: edit(t, md=md, kb=True))
    elif d == "m_ayuda":
        await edit(
            "❓ *Ayuda*\n\n"
            "/start — Iniciar\n"
            "/menu — Menú principal\n"
            "/cancelar — Cancelar operación\n\n"
            "¿Problemas? Contacta al administrador.",
            md=True, kb=True,
        )
    elif d == "m_volver":
        _set_state(uid, ESTADO.MENU_PRINCIPAL)
        await edit(MENU, md=True, kb=True)


async def handle_message(update: Update, _ctx: ContextTypes.DEFAULT_TYPE):
    uid = update.effective_user.id
    text = update.message.text.strip()
    st = _state(uid)
    d = _d(uid)

    async def reply(text: str, md=False, kb=False):
        kw = {"parse_mode": "Markdown"} if md else {}
        if kb:
            kw["reply_markup"] = _menu_keyboard()
        await update.message.reply_text(text, **kw)

    tlow = text.lower()
    if tlow in ("/menu", "menu", "0"):
        _set_state(uid, ESTADO.MENU_PRINCIPAL)
        await reply(MENU, md=True, kb=True)
        return
    if tlow in ("/cancelar", "cancelar"):
        _set_state(uid, ESTADO.MENU_PRINCIPAL)
        await reply("✅ Cancelado.", kb=True)
        return

    # ── ESPERANDO_TELEFONO ─────────────────────────────────────────────────
    if st == ESTADO.ESPERANDO_TELEFONO:
        tel = text.replace(" ", "").replace("-", "").replace("+", "")
        if not tel.isdigit() or len(tel) < 10:
            await reply("⚠️ Número inválido. Formato: `57300XXXXXXX`", md=True)
            return
        d["telefono"] = tel
        db = _db()
        try:
            u = db.query(Usuario).filter(Usuario.telefono == tel).first()
            if u and u.rol == RolEnum.productor:
                p = db.query(Productor).filter(Productor.usuario_id == u.id).first()
                d["nombre"] = u.nombre_completo
                d["productor_id"] = p.id if p else None
                d["usuario_id"] = u.id
                _set_state(uid, ESTADO.MENU_PRINCIPAL)
                await reply(f"👋 ¡Bienvenido de nuevo, *{u.nombre_completo}*!\n\n{MENU}", md=True, kb=True)
            else:
                _set_state(uid, ESTADO.REGISTRO_NOMBRE)
                await reply("🌾 No estás registrado. Vamos a crear tu perfil.\n\n¿Cuál es tu *nombre completo*?", md=True)
        finally:
            db.close()
        return

    # ── REGISTRO ───────────────────────────────────────────────────────────
    if st == ESTADO.REGISTRO_NOMBRE:
        d["nombre"] = text
        _set_state(uid, ESTADO.REGISTRO_FINCA)
        await reply("🌱 ¿Cómo se llama tu *finca*?", md=True)
        return

    if st == ESTADO.REGISTRO_FINCA:
        d["finca"] = text
        _set_state(uid, ESTADO.REGISTRO_VEREDA)
        await reply("📍 ¿En qué *vereda* está tu finca?", md=True)
        return

    if st == ESTADO.REGISTRO_VEREDA:
        d["vereda"] = text
        _set_state(uid, ESTADO.REGISTRO_PRODUCTOS)
        await reply("🌿 ¿Qué cultivos tienes?\n\n1️⃣ Café\n2️⃣ Cacao\n3️⃣ Banano\n4️⃣ Varios")
        return

    if st == ESTADO.REGISTRO_PRODUCTOS:
        d["productos"] = PROD_REG_MAP.get(text, text.lower())
        _set_state(uid, ESTADO.REGISTRO_ALTITUD)
        await reply("⛰️ ¿Altitud de tu finca? (msnm, ej: 1200)")
        return

    if st == ESTADO.REGISTRO_ALTITUD:
        alt = 0
        try:
            alt = int(text)
        except ValueError:
            pass
        d["altitud"] = alt
        db = _db()
        try:
            def _df(c):
                return round(c + random.uniform(-0.01, 0.01), 6) if c else None

            u = Usuario(telefono=d["telefono"], nombre_completo=d["nombre"],
                        rol=RolEnum.productor, activo=True, aprobado=True)
            db.add(u)
            db.flush()
            p = Productor(usuario_id=u.id, finca=d["finca"], vereda=d["vereda"],
                          municipio="Santa Marta", altitud_msnm=alt, productos=d["productos"])
            db.add(p)
            db.commit()
            db.refresh(p)
            d["productor_id"] = p.id
            d["usuario_id"] = u.id
            _set_state(uid, ESTADO.MENU_PRINCIPAL)
            await reply(
                f"✅ *¡Registrado!*\n\n"
                f"👤 {d['nombre']}\n🌱 {d['finca']} · {d['vereda']}\n"
                f"🌿 {d['productos']} · {alt} m\n\n{MENU}",
                md=True, kb=True,
            )
        except Exception as e:
            db.rollback()
            await reply(f"❌ Error: {e}. Usa /start para reiniciar.")
        finally:
            db.close()
        return

    # ── MENU_PRINCIPAL (texto) ─────────────────────────────────────────────
    if st == ESTADO.MENU_PRINCIPAL:
        if text == "1":
            _set_state(uid, ESTADO.COSECHA_PRODUCTO)
            await reply("📦 ¿Qué producto cosechaste?\n\n1️⃣ Café\n2️⃣ Cacao\n3️⃣ Banano\n4️⃣ Otro")
        elif text == "2":
            _set_state(uid, ESTADO.INSUMO_NOMBRE)
            await reply("🌱 ¿Qué insumo aplicaste?")
        elif text == "3":
            _set_state(uid, ESTADO.DESPACHO_PRODUCTO)
            await reply("🚚 ¿Qué producto despachaste?\n\n1️⃣ Café\n2️⃣ Cacao\n3️⃣ Banano\n4️⃣ Otro")
        elif text == "4":
            await _mostrar_lotes(uid, lambda t, md=False: reply(t, md=md))
        elif text == "5":
            await _mostrar_certs(uid, lambda t, md=False: reply(t, md=md))
        elif text == "6":
            await _mostrar_catalogo(lambda t, md=False: reply(t, md=md))
        else:
            await reply("⚠️ Opción inválida. Usa /menu para ver opciones.")
        return

    # ── COSECHA ────────────────────────────────────────────────────────────
    if st == ESTADO.COSECHA_PRODUCTO:
        d["cosecha"] = {"producto": PROD_MAP.get(text, text.lower())}
        _set_state(uid, ESTADO.COSECHA_KG)
        await reply("📦 ¿Cuántos kg?")
        return

    if st == ESTADO.COSECHA_KG:
        d.setdefault("cosecha", {})["kg"] = text
        _set_state(uid, ESTADO.COSECHA_VARIEDAD)
        await reply("🌱 ¿Variedad? (0 para omitir)")
        return

    if st == ESTADO.COSECHA_VARIEDAD:
        d.setdefault("cosecha", {})["variedad"] = "" if text == "0" else text
        _set_state(uid, ESTADO.COSECHA_LOTE)
        await reply("🔢 ¿Lote? (ej: L2025-001)")
        return

    if st == ESTADO.COSECHA_LOTE:
        c = d.get("cosecha", {})
        lid = text.upper()
        desc = f"Cosecha {c.get('producto', '?')} — {c.get('kg', '?')} kg"
        if c.get("variedad"):
            desc += f" · {c['variedad']}"
        db = _db()
        try:
            hoy = date.today().isoformat()
            db.add(CTE(lote_id=lid, tipo=TipoCTEEnum.cosecha, fecha=hoy,
                       descripcion=desc, responsable_id=d.get("usuario_id"), datos_json="{}"))
            db.commit()
            await reply(f"✅ *Cosecha registrada*\n\n{c.get('kg', '?')} kg de {c.get('producto', '?')}\nLote: {lid}\n📅 {hoy}", md=True, kb=True)
        except Exception as e:
            await reply(f"❌ Error: {e}")
        finally:
            db.close()
        _set_state(uid, ESTADO.MENU_PRINCIPAL)
        return

    # ── INSUMO ─────────────────────────────────────────────────────────────
    if st == ESTADO.INSUMO_NOMBRE:
        d["insumo"] = {"nombre": text}
        _set_state(uid, ESTADO.INSUMO_CANTIDAD)
        await reply("🌱 ¿Cantidad y unidad? (ej: 5 litros)")
        return

    if st == ESTADO.INSUMO_CANTIDAD:
        d.setdefault("insumo", {})["cantidad"] = text
        _set_state(uid, ESTADO.INSUMO_LOTE)
        await reply("🔢 ¿Lote? (ej: L2025-001)")
        return

    if st == ESTADO.INSUMO_LOTE:
        ins = d.get("insumo", {})
        lid = text.upper()
        desc = f"Insumo: {ins.get('nombre', '?')} — {ins.get('cantidad', '?')}"
        db = _db()
        try:
            hoy = date.today().isoformat()
            db.add(CTE(lote_id=lid, tipo=TipoCTEEnum.insumo, fecha=hoy,
                       descripcion=desc, responsable_id=d.get("usuario_id"), datos_json="{}"))
            db.commit()
            await reply(f"✅ *Insumo registrado*\n\n{ins.get('nombre', '?')} — {ins.get('cantidad', '?')}\nLote: {lid}", md=True, kb=True)
        except Exception as e:
            await reply(f"❌ Error: {e}")
        finally:
            db.close()
        _set_state(uid, ESTADO.MENU_PRINCIPAL)
        return

    # ── DESPACHO ───────────────────────────────────────────────────────────
    if st == ESTADO.DESPACHO_PRODUCTO:
        d["despacho"] = {"producto": PROD_MAP.get(text, text.lower())}
        _set_state(uid, ESTADO.DESPACHO_KG)
        await reply("🚚 ¿Cuántos kg?")
        return

    if st == ESTADO.DESPACHO_KG:
        d.setdefault("despacho", {})["kg"] = text
        _set_state(uid, ESTADO.DESPACHO_LOTE)
        await reply("🔢 ¿De qué lote?")
        return

    if st == ESTADO.DESPACHO_LOTE:
        dp = d.get("despacho", {})
        lid = text.upper()
        desc = f"Despacho {dp.get('producto', '?')} — {dp.get('kg', '?')} kg"
        db = _db()
        try:
            hoy = date.today().isoformat()
            db.add(CTE(lote_id=lid, tipo=TipoCTEEnum.despacho, fecha=hoy,
                       descripcion=desc, responsable_id=d.get("usuario_id"), datos_json="{}"))
            lote = db.query(Lote).filter(Lote.id == lid).first()
            if lote:
                lote.estado = EstadoLoteEnum.despachado
            db.commit()
            await reply(f"✅ *Despacho registrado*\n\n{dp.get('kg', '?')} kg de {dp.get('producto', '?')}\nLote: {lid}", md=True, kb=True)
        except Exception as e:
            await reply(f"❌ Error: {e}")
        finally:
            db.close()
        _set_state(uid, ESTADO.MENU_PRINCIPAL)
        return

    # ── fallback ──────────────────────────────────────────────────────────
    await reply("⚠️ No entendí. Usa /menu para ver opciones.")


def run_bot():
    """Llamado desde main.py en thread daemon."""
    if not TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN no configurado — bot no iniciado")
        return

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("menu", cmd_menu))
    app.add_handler(CommandHandler("cancelar", cmd_cancelar))
    app.add_handler(CallbackQueryHandler(button_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Bot de Telegram iniciando polling...")
    try:
        app.run_polling(allowed_updates=Update.ALL_TYPES)
    finally:
        loop.close()
