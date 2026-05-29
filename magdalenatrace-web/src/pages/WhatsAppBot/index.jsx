import { useState, useEffect } from 'react'

const BOT_USERNAME = 'magdalenatrace_bahia_bot'
const BOT_LINK = `https://t.me/${BOT_USERNAME}`

const PASOS = [
  {
    icon: '📱',
    titulo: 'Abre Telegram',
    desc: 'Si no lo tienes, descárgalo gratis en tu celular.',
  },
  {
    icon: '🔍',
    titulo: 'Busca el bot',
    desc: `En Telegram busca @${BOT_USERNAME} o toca el enlace de abajo.`,
  },
  {
    icon: '▶️',
    titulo: 'Inicia el bot',
    desc: 'Presiona "Iniciar" y escribe /start para registrarte.',
  },
  {
    icon: '🌾',
    titulo: '¡Listo!',
    desc: 'Registra cosechas, insumos y consulta tus lotes desde Telegram.',
  },
]

export default function TelegramBot() {
  const [copiado, setCopiado] = useState(false)

  const handleCopiar = () => {
    navigator.clipboard.writeText(BOT_USERNAME)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1E3256 0%, #0F1F3A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        background: '#fff',
        borderRadius: 20,
        padding: '40px 28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
      }}>
        {/* Icono Telegram */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2AABEE, #229ED9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 36,
          boxShadow: '0 8px 24px rgba(42,171,238,0.35)',
        }}>
          ✈️
        </div>

        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#1E3256',
          marginBottom: 6,
        }}>
          Canal del Productor
        </h1>
        <p style={{
          fontSize: 14,
          color: '#6B7280',
          marginBottom: 28,
          lineHeight: 1.5,
        }}>
          Conéctate con MagdalenaTrace a través de Telegram. No necesitas app web, solo el bot.
        </p>

        {/* Pasos */}
        <div style={{ textAlign: 'left', marginBottom: 28 }}>
          {PASOS.map((p, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 14,
              marginBottom: 18,
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
              }}>
                {p.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1E3256', marginBottom: 2 }}>
                  {p.titulo}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.4 }}>
                  {p.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón abrir Telegram */}
        <a
          href={BOT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            width: '100%',
            padding: '14px 0',
            background: 'linear-gradient(135deg, #2AABEE, #229ED9)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(42,171,238,0.3)',
            marginBottom: 12,
          }}
        >
          ✈️ Abrir en Telegram
        </a>

        {/* Copiar username */}
        <button
          onClick={handleCopiar}
          style={{
            width: '100%',
            padding: '12px 0',
            background: 'transparent',
            color: '#6B7280',
            border: '2px dashed #D1D5DB',
            borderRadius: 12,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {copiado ? '✅ ¡Copiado!' : `📋 Copiar @${BOT_USERNAME}`}
        </button>

        {/* QR */}
        <div style={{ marginTop: 24, padding: '16px', background: '#F9FAFB', borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
            O escanea el código QR desde la app de Telegram:
          </div>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${BOT_LINK}`}
            alt="QR Telegram Bot"
            style={{ width: 140, height: 140, borderRadius: 8 }}
          />
        </div>
      </div>
    </div>
  )
}
