import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

const SUGERENCIAS = [
  '¿Cuántas fincas tienen certificación Rainforest Alliance?',
  '¿Qué lotes de café están disponibles?',
  '¿Fincas para visitar cerca de Minca?',
  '¿Cuál es el historial del lote L2025-001?',
  '¿Qué certificaciones manejan los productores?',
  '¿Cuál es la altitud promedio de las fincas?',
]

function Bubble({ msg }) {
  const isUser = msg.rol === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--usm-teal)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 2,
        }}>🤖</div>
      )}
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          background: isUser ? 'var(--usm-blue)' : '#fff',
          color: isUser ? '#fff' : 'var(--usm-navy)',
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: 13, lineHeight: 1.55,
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-main)',
        }}>
          {msg.contenido}
        </div>
        {msg.tipo_viz === 'tabla' && msg.datos_viz?.length > 0 && (
          <div style={{ marginTop: 8, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'var(--usm-blue)', color: '#fff' }}>
                  {Object.keys(msg.datos_viz[0]).map(k => (
                    <th key={k} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {msg.datos_viz.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : 'var(--usm-blue-pale)' }}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} style={{ padding: '6px 10px', borderTop: '1px solid #E5E7EB' }}>{String(v ?? '—')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {msg.tipo_viz === 'mapa' && msg.datos_viz?.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--usm-navy)' }}>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 11, textTransform: 'uppercase', color: '#6B7280' }}>
                📍 Fincas mencionadas
              </div>
              {msg.datos_viz.map(f => (
                <div key={f.id} style={{ padding: '4px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <strong>{f.finca}</strong> · {f.vereda}
                  {f.altitud_msnm && <span style={{ color: '#6B7280' }}> · {f.altitud_msnm} m</span>}
                  {f.productos && <span style={{ color: 'var(--usm-teal-dark)' }}> · {f.productos}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {msg.tipo_viz === 'certs' && msg.datos_viz?.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 11, textTransform: 'uppercase', color: '#6B7280' }}>
                🏅 Certificaciones
              </div>
              {msg.datos_viz.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F3F4F6', fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: 'var(--usm-navy)' }}>{c.tipo}</span>
                  <span style={{ color: c.estado === 'vigente' ? '#38AB3F' : '#9CA3AF' }}>{c.estado}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--usm-teal)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
      <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%', background: '#9CA3AF',
              animation: 'bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChatbotPage() {
  const navigate = useNavigate()
  const [messages,  setMessages]  = useState([
    { rol: 'assistant', contenido: '¡Hola! Soy el asistente de MagdalenaTrace 🌿\n\nPuedo ayudarte con información sobre las fincas, lotes y trazabilidad de la Sierra Nevada de Santa Marta. ¿Qué deseas saber?', tipo_viz: 'texto' }
  ])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(texto) {
    const txt = texto.trim()
    if (!txt || loading) return
    setInput('')

    const historial = messages.map(m => ({ rol: m.rol, contenido: m.contenido }))
    setMessages(prev => [...prev, { rol: 'user', contenido: txt, tipo_viz: 'texto' }])
    setLoading(true)

    try {
      const { data } = await api.post('/chatbot/mensaje', { mensaje: txt, historial })
      setMessages(prev => [...prev, { rol: 'assistant', contenido: data.respuesta, tipo_viz: data.tipo_viz, datos_viz: data.datos_viz }])
    } catch {
      setMessages(prev => [...prev, { rol: 'assistant', contenido: 'No pude conectar con el servidor. Verifica que la API esté corriendo.', tipo_viz: 'texto' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-main)', background: 'var(--bg-light)' }}>

        {/* Header */}
        <div style={{ background: 'var(--usm-blue)', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>🤖 MagdalenaTrace · Asistente IA</div>
            <div style={{ fontSize: 11, opacity: 0.75 }}>Sierra Nevada de Santa Marta · Trazabilidad agrícola</div>
          </div>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '6px 14px', fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            Volver
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Sugerencias (izquierda) */}
          <div style={{ width: 240, background: '#fff', borderRight: '1px solid #E5E7EB', padding: 16, overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 }}>
              Preguntas sugeridas
            </div>
            {SUGERENCIAS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                style={{
                  width: '100%', textAlign: 'left', background: 'var(--usm-blue-pale)',
                  border: '1px solid var(--usm-deco)', borderRadius: 8,
                  padding: '10px 12px', marginBottom: 8,
                  fontSize: 12, color: 'var(--usm-navy)', cursor: 'pointer',
                  fontFamily: 'var(--font-main)', lineHeight: 1.4,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--usm-sky)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--usm-blue-pale)')}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat (derecha) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--usm-navy)', overflow: 'hidden' }}>
            {/* Mensajes */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {messages.map((m, i) => <Bubble key={i} msg={m} />)}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ background: '#fff', borderTop: '1px solid #E5E7EB', padding: '12px 16px', display: 'flex', gap: 10, flexShrink: 0 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Escribe tu pregunta sobre fincas o trazabilidad…"
                disabled={loading}
                style={{
                  flex: 1, padding: '10px 14px',
                  border: '1px solid #D1D5DB', borderRadius: 24,
                  fontFamily: 'var(--font-main)', fontSize: 13, outline: 'none',
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                style={{
                  background: loading ? '#9CA3AF' : 'var(--usm-blue)',
                  color: '#fff', border: 'none', borderRadius: '50%',
                  width: 40, height: 40, cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
