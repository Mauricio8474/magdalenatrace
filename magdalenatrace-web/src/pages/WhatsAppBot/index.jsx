import { useState, useRef, useEffect } from 'react'
import api from '../../api/client'

// ── Estados del bot ───────────────────────────────────────────────────────────
const ESTADO = {
  INICIO: 'INICIO',
  REGISTRO_NOMBRE: 'REGISTRO_NOMBRE',
  REGISTRO_FINCA: 'REGISTRO_FINCA',
  REGISTRO_VEREDA: 'REGISTRO_VEREDA',
  REGISTRO_PRODUCTOS: 'REGISTRO_PRODUCTOS',
  REGISTRO_ALTITUD: 'REGISTRO_ALTITUD',
  MENU_PRINCIPAL: 'MENU_PRINCIPAL',
  COSECHA_PRODUCTO: 'COSECHA_PRODUCTO',
  COSECHA_KG: 'COSECHA_KG',
  COSECHA_VARIEDAD: 'COSECHA_VARIEDAD',
  COSECHA_LOTE: 'COSECHA_LOTE',
  INSUMO_NOMBRE: 'INSUMO_NOMBRE',
  INSUMO_CANTIDAD: 'INSUMO_CANTIDAD',
  INSUMO_LOTE: 'INSUMO_LOTE',
  CONSULTAR_LOTES: 'CONSULTAR_LOTES',
}

function now() {
  return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function Burbuja({ msg }) {
  const esBot = msg.from === 'bot'
  return (
    <div style={{ display: 'flex', justifyContent: esBot ? 'flex-start' : 'flex-end', marginBottom: 6, padding: '0 12px' }}>
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          background: esBot ? '#fff' : 'var(--whatsapp-bubble)',
          color: '#111',
          padding: '8px 12px 6px',
          borderRadius: esBot ? '0 8px 8px 8px' : '8px 0 8px 8px',
          fontSize: 13.5,
          boxShadow: '0 1px 1px rgba(0,0,0,0.12)',
          whiteSpace: 'pre-wrap',
          fontFamily: 'inherit',
          lineHeight: 1.5,
        }}>
          {msg.text}
        </div>
        <div style={{ fontSize: 10, color: '#9e9e9e', marginTop: 3, textAlign: esBot ? 'left' : 'right', paddingLeft: esBot ? 4 : 0, paddingRight: esBot ? 0 : 4 }}>
          {msg.time}
          {!esBot && <span style={{ marginLeft: 4, color: '#34B7F1' }}>✓✓</span>}
        </div>
      </div>
    </div>
  )
}

function Typing() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '0 12px', marginBottom: 6 }}>
      <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '0 8px 8px 8px', boxShadow: '0 1px 1px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%', background: '#9e9e9e',
              animation: 'wa-bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function WhatsAppBot() {
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [estado,   setEstado]   = useState(ESTADO.INICIO)
  const [typing,   setTyping]   = useState(false)
  const [datos,    setDatos]    = useState({
    telefono: '', nombre: '', finca: '', vereda: '', productos: '', altitud: '',
    productor_id: null,
    cosecha: { producto: '', kg: '', variedad: '', lote: '' },
    insumo:  { nombre: '', cantidad: '', lote: '' },
  })
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  // Envía mensaje del bot con delay
  function botSend(text, delay = 800) {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { from: 'bot', text, time: now() }])
    }, delay)
  }

  // Mensaje del usuario
  function userSend(text) {
    setMessages(prev => [...prev, { from: 'user', text, time: now() }])
  }

  // Iniciar la conversación
  useEffect(() => {
    setTimeout(() => botSend('Hola 👋 Soy MagdalenaTrace.\n\nConéctate con la cadena agrícola de la Sierra Nevada desde tu celular.\n\n¿Cuál es tu número de teléfono? (formato: 57300XXXXXXX)', 600), 300)
  }, [])

  async function handleInput() {
    const txt = input.trim()
    if (!txt) return
    setInput('')
    inputRef.current?.focus()
    userSend(txt)

    // ── máquina de estados ───────────────────────────────────────────────────

    if (estado === ESTADO.INICIO) {
      const tel = txt.replace(/\D/g, '')
      setDatos(d => ({ ...d, telefono: tel }))
      try {
        const { data } = await api.post('/auth/whatsapp/iniciar', { telefono: tel })
        if (data.nuevo) {
          setEstado(ESTADO.REGISTRO_NOMBRE)
          botSend('¡Bienvenido! Vamos a registrarte.\n\n¿Cuál es tu nombre completo?')
        } else {
          setDatos(d => ({ ...d, nombre: data.nombre, productor_id: data.productor_id }))
          setEstado(ESTADO.MENU_PRINCIPAL)
          botSend(`¡Bienvenido de nuevo, *${data.nombre}*! 🌿\n\n${MENU_TEXT}`)
        }
      } catch {
        botSend('No pude verificar tu número. Intenta de nuevo.')
      }
      return
    }

    if (estado === ESTADO.REGISTRO_NOMBRE) {
      setDatos(d => ({ ...d, nombre: txt }))
      setEstado(ESTADO.REGISTRO_FINCA)
      botSend('¿Cómo se llama tu finca? 🌱')
      return
    }
    if (estado === ESTADO.REGISTRO_FINCA) {
      setDatos(d => ({ ...d, finca: txt }))
      setEstado(ESTADO.REGISTRO_VEREDA)
      botSend('¿En qué vereda está tu finca?')
      return
    }
    if (estado === ESTADO.REGISTRO_VEREDA) {
      setDatos(d => ({ ...d, vereda: txt }))
      setEstado(ESTADO.REGISTRO_PRODUCTOS)
      botSend('¿Qué cultivas?\n\n1. Café\n2. Cacao\n3. Banano\n4. Varios')
      return
    }
    if (estado === ESTADO.REGISTRO_PRODUCTOS) {
      const map = { '1':'café', '2':'cacao', '3':'banano', '4':'café,cacao,banano' }
      const prod = map[txt] || txt.toLowerCase()
      setDatos(d => ({ ...d, productos: prod }))
      setEstado(ESTADO.REGISTRO_ALTITUD)
      botSend('¿A qué altura está tu finca? (metros sobre el nivel del mar, aproximado)')
      return
    }
    if (estado === ESTADO.REGISTRO_ALTITUD) {
      const alt = parseInt(txt, 10) || 0
      const reg = { ...datos, altitud: alt }
      setDatos(d => ({ ...d, altitud: alt }))
      // Llamar a la API
      try {
        const { data } = await api.post('/productores/registro', {
          telefono: reg.telefono, nombre_completo: reg.nombre,
          finca: reg.finca, vereda: reg.vereda, municipio: 'Santa Marta',
          productos: reg.productos, altitud_msnm: alt,
        })
        setDatos(d => ({ ...d, productor_id: data.productor_id }))
        setEstado(ESTADO.MENU_PRINCIPAL)
        botSend(`✅ ¡Registrado exitosamente, *${reg.nombre}*!\n\nFinca: *${reg.finca}* · Vereda: *${reg.vereda}*\n\n${MENU_TEXT}`)
      } catch (err) {
        const det = err.response?.data?.detail || 'Error al registrar'
        if (det.includes('registrado')) {
          setEstado(ESTADO.MENU_PRINCIPAL)
          botSend(`Ese teléfono ya está registrado. Continuando…\n\n${MENU_TEXT}`)
        } else {
          botSend(`Error: ${det}. Escribe "reiniciar" para empezar de nuevo.`)
        }
      }
      return
    }

    // Reinicio global
    if (txt.toLowerCase() === 'reiniciar' || txt.toLowerCase() === 'menu' || txt === '0') {
      setEstado(ESTADO.MENU_PRINCIPAL)
      botSend(`Menú principal:\n\n${MENU_TEXT}`)
      return
    }

    if (estado === ESTADO.MENU_PRINCIPAL) {
      if (txt === '1') { setEstado(ESTADO.COSECHA_PRODUCTO); botSend('¿Qué producto cosechaste?\n\n1. Café\n2. Cacao\n3. Banano\n4. Otro') }
      else if (txt === '2') { setEstado(ESTADO.INSUMO_NOMBRE); botSend('¿Qué insumo aplicaste?') }
      else if (txt === '3') { setEstado(ESTADO.COSECHA_PRODUCTO); setDatos(d => ({ ...d, cosecha: { ...d.cosecha, tipo: 'despacho' } })); botSend('¿Qué producto despachaste?\n\n1. Café\n2. Cacao\n3. Banano\n4. Otro') }
      else if (txt === '4') { await consultarLotes() }
      else if (txt === '5') { await consultarCerts() }
      else if (txt === '6') { botSend('La consulta de compradores estará disponible próximamente. 📊') }
      else botSend(`No entendí esa opción. Elige del 1 al 6:\n\n${MENU_TEXT}`)
      return
    }

    // Cosecha
    if (estado === ESTADO.COSECHA_PRODUCTO) {
      const map = { '1':'café', '2':'cacao', '3':'banano', '4':'otro' }
      setDatos(d => ({ ...d, cosecha: { ...d.cosecha, producto: map[txt] || txt } }))
      setEstado(ESTADO.COSECHA_KG)
      botSend('¿Cuántos kg cosechaste?')
      return
    }
    if (estado === ESTADO.COSECHA_KG) {
      setDatos(d => ({ ...d, cosecha: { ...d.cosecha, kg: txt } }))
      setEstado(ESTADO.COSECHA_VARIEDAD)
      botSend('¿Qué variedad? (escribe 0 para omitir)')
      return
    }
    if (estado === ESTADO.COSECHA_VARIEDAD) {
      setDatos(d => ({ ...d, cosecha: { ...d.cosecha, variedad: txt === '0' ? '' : txt } }))
      setEstado(ESTADO.COSECHA_LOTE)
      botSend('¿En qué lote? (ej: L2025-001 · escribe NUEVO para crear uno)')
      return
    }
    if (estado === ESTADO.COSECHA_LOTE) {
      const loteId = txt.toUpperCase()
      const cte = { tipo: 'cosecha', fecha: new Date().toISOString().slice(0,10), descripcion: `Cosecha ${datos.cosecha.producto} — ${datos.cosecha.kg} kg${datos.cosecha.variedad ? ` · ${datos.cosecha.variedad}` : ''}` }
      try {
        await api.post(`/lotes/${loteId}/ctes`, cte)
        const fecha = new Date().toLocaleDateString('es-CO')
        botSend(`✅ Registrado: *${datos.cosecha.kg} kg* de ${datos.cosecha.producto}\nLote: *${loteId}* 📦\nFecha: ${fecha}\n\nEscribe *menu* para volver al menú.`)
      } catch (err) {
        botSend(`No se pudo registrar: ${err.response?.data?.detail || 'verifica el ID del lote'}.\n\nEscribe *menu* para volver.`)
      }
      setEstado(ESTADO.MENU_PRINCIPAL)
      return
    }

    // Insumo
    if (estado === ESTADO.INSUMO_NOMBRE) {
      setDatos(d => ({ ...d, insumo: { ...d.insumo, nombre: txt } }))
      setEstado(ESTADO.INSUMO_CANTIDAD)
      botSend('¿Qué cantidad y unidad? (ej: 5 litros, 2 kg/planta)')
      return
    }
    if (estado === ESTADO.INSUMO_CANTIDAD) {
      setDatos(d => ({ ...d, insumo: { ...d.insumo, cantidad: txt } }))
      setEstado(ESTADO.INSUMO_LOTE)
      botSend('¿En cuál lote o área? (ej: L2025-001)')
      return
    }
    if (estado === ESTADO.INSUMO_LOTE) {
      const loteId = txt.toUpperCase()
      const cte = { tipo: 'insumo', fecha: new Date().toISOString().slice(0,10), descripcion: `Insumo: ${datos.insumo.nombre} — ${datos.insumo.cantidad}` }
      try {
        await api.post(`/lotes/${loteId}/ctes`, cte)
        botSend(`✅ Insumo registrado ✓\n*${datos.insumo.nombre}* · ${datos.insumo.cantidad}\nLote: *${loteId}*\n\nEscribe *menu* para volver.`)
      } catch (err) {
        botSend(`No se pudo registrar: ${err.response?.data?.detail || 'verifica el ID del lote'}.\n\nEscribe *menu* para volver.`)
      }
      setEstado(ESTADO.MENU_PRINCIPAL)
      return
    }

    botSend('No entendí. Escribe *menu* para ver las opciones.')
  }

  async function consultarLotes() {
    botSend('Consultando tus lotes…')
    try {
      const { data } = await api.get('/productores/yo/lotes')
      if (!data.length) { botSend('No tienes lotes registrados aún.'); return }
      const texto = data.map(l =>
        `📦 *${l.id}* · ${l.producto}\nEstado: ${l.estado} · ${l.volumen_kg} kg · ${l.ctes_completados}/4 CTEs`
      ).join('\n\n')
      botSend(`Tus lotes:\n\n${texto}\n\nEscribe *menu* para volver.`)
    } catch {
      botSend('No pude obtener tus lotes. Asegúrate de estar autenticado.')
    }
  }

  async function consultarCerts() {
    botSend('Consultando certificaciones…')
    try {
      const { data } = await api.get('/productores/yo/certificaciones')
      if (!data.length) { botSend('No tienes certificaciones registradas.'); return }
      const texto = data.map(c =>
        `🏅 *${c.tipo}* · ${c.estado}\nVence: ${c.fecha_vencimiento}${c.dias_restantes != null ? ` (${c.dias_restantes}d)` : ''}`
      ).join('\n\n')
      botSend(`Tus certificaciones:\n\n${texto}\n\nEscribe *menu* para volver.`)
    } catch {
      botSend('No pude obtener las certificaciones.')
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleInput() }
  }

  return (
    <>
      <style>{`
        @keyframes wa-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
        .wa-input:focus { outline: none; }
      `}</style>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", maxWidth: 480, margin: '0 auto', boxShadow: '0 0 40px rgba(0,0,0,0.15)' }}>

        {/* Header WhatsApp */}
        <div style={{ background: 'var(--whatsapp-dark)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--whatsapp)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🌿</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>MagdalenaTrace Bot</div>
            <div style={{ color: '#B2DFDB', fontSize: 12 }}>en línea</div>
          </div>
          <div style={{ display: 'flex', gap: 14, color: '#B2DFDB', fontSize: 20 }}>
            <span style={{ cursor: 'pointer' }}>📞</span>
            <span style={{ cursor: 'pointer' }}>⋮</span>
          </div>
        </div>

        {/* Mensajes */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--whatsapp-chat)', padding: '8px 0' }}>
          {messages.map((m, i) => <Burbuja key={i} msg={m} />)}
          {typing && <Typing />}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ background: '#F0F0F0', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 24, padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe un mensaje"
              className="wa-input"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: 'transparent' }}
            />
            <span style={{ color: '#9e9e9e', fontSize: 18 }}>😊</span>
          </div>
          <button
            onClick={handleInput}
            disabled={!input.trim()}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: input.trim() ? 'var(--whatsapp)' : '#9e9e9e',
              color: '#fff', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </>
  )
}

const MENU_TEXT = `¿Qué deseas hacer?

1️⃣ Registrar cosecha
2️⃣ Registrar insumo
3️⃣ Registrar despacho
4️⃣ Ver mis lotes
5️⃣ Ver certificaciones
6️⃣ Ver quién compró mi producto`
