import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

function LeafIcon({ size = 40, color = '#D4A04A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3C11 6.5 6 11 6 16.5C6 20.6 9.6 24 14 24C18.4 24 22 20.6 22 16.5C22 11 17 6.5 14 3Z" fill={color} />
      <path d="M14 11V24" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CoffeePatternBg({ opacity = 0.1 }) {
  return (
    <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <pattern id="loginPattern" width="120" height="120" patternUnits="userSpaceOnUse">
          <ellipse cx="28" cy="24" rx="8" ry="13" fill="white" opacity={opacity} transform="rotate(32 28 24)" />
          <ellipse cx="88" cy="62" rx="8" ry="13" fill="white" opacity={opacity} transform="rotate(-22 88 62)" />
          <ellipse cx="18" cy="92" rx="6" ry="9" fill="white" opacity={opacity * 0.7} transform="rotate(14 18 92)" />
          <ellipse cx="98" cy="14" rx="5" ry="8" fill="white" opacity={opacity * 0.7} transform="rotate(-40 98 14)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#loginPattern)" />
    </svg>
  )
}

const INPUT_STYLE = {
  width: '100%',
  padding: '11px 14px 11px 42px',
  border: '1.5px solid #E5E7EB',
  borderRadius: 8,
  fontFamily: 'var(--font-cuerpo)',
  fontSize: 14,
  color: 'var(--texto-oscuro)',
  background: 'white',
  transition: 'border 0.2s',
  outline: 'none',
}

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify({ rol: data.rol, nombre: data.nombre, id: data.id }))
      if (data.rol === 'exportador') navigate('/exportador')
      else if (data.rol === 'admin') navigate('/exportador')
      else if (data.rol === 'operador_turistico') navigate('/operador')
      else navigate('/mapa')
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  const DEMOS = [
    { label: 'Exportador', email: 'exportador@sierraexporta.co',   pass: 'exporta2026', color: 'var(--verde-sierra)' },
    { label: 'Turista',    email: 'tourist@example.com',            pass: 'travel2026',  color: 'var(--azul-caribe)' },
    { label: 'Operador',   email: 'operador@sierraaventura.co',    pass: 'tours2026',   color: '#0077B6' },
    { label: 'Admin',      email: 'admin@magdalenatrace.co',        pass: 'admin2026',   color: 'var(--cafe-medio)' },
  ]

  const formPanel = (
    <div style={{
      background: 'white',
      borderRadius: 20,
      padding: 'clamp(28px, 5vw, 44px) clamp(24px, 4vw, 40px)',
      width: '100%',
      maxWidth: 420,
      boxShadow: '0 8px 48px rgba(0,0,0,0.13)',
      animation: 'slideUp 0.5s ease',
    }}>
      {isMobile && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <LeafIcon size={40} color="#D4A04A" />
          <div style={{ fontFamily: 'var(--font-titulo)', fontWeight: 700, fontSize: 20, color: 'var(--verde-sierra)', marginTop: 6 }}>
            MagdalenaTrace
          </div>
        </div>
      )}

      <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: 26, color: 'var(--texto-oscuro)', marginBottom: 6 }}>
        Bienvenido de nuevo
      </h2>
      <p style={{ color: 'var(--texto-medio)', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>
        Ingresa a tu cuenta MagdalenaTrace
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Email */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--texto-oscuro)', display: 'block', marginBottom: 6, letterSpacing: 0.2 }}>
            CORREO ELECTRÓNICO
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>✉️</span>
            <input
              type="email" required autoFocus
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={INPUT_STYLE}
              placeholder="tu@correo.co"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--texto-oscuro)', display: 'block', marginBottom: 6, letterSpacing: 0.2 }}>
            CONTRASEÑA
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔒</span>
            <input
              type={showPass ? 'text' : 'password'} required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ ...INPUT_STYLE, paddingRight: 44 }}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPass(v => !v)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, opacity: 0.5,
              padding: 2,
            }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2', color: '#991B1B',
            border: '1px solid #FECACA',
            borderRadius: 8, padding: '10px 14px',
            fontSize: 13, fontWeight: 500,
            animation: 'slideInRight 0.3s ease',
          }}>
            ⚠️ {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary"
          style={{ padding: '14px', fontSize: 15, marginTop: 2, width: '100%' }}>
          {loading ? '⏳ Entrando…' : 'Iniciar sesión'}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 14px' }}>
        <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
        <span style={{ color: '#9CA3AF', fontSize: 12 }}>o accede con demo</span>
        <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {DEMOS.map(d => (
          <button key={d.label} onClick={() => setForm({ email: d.email, password: d.pass })}
            style={{
              background: d.color, color: 'white',
              border: 'none', borderRadius: 7,
              padding: '6px 14px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-cuerpo)',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            {d.label}
          </button>
        ))}
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--texto-medio)' }}>
        ¿No tienes cuenta?{' '}
        <Link to="/registro" style={{ color: 'var(--verde-sierra)', fontWeight: 600 }}>
          Regístrate aquí
        </Link>
      </p>
    </div>
  )

  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--verde-sierra) 0%, var(--cafe-oscuro) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, fontFamily: 'var(--font-cuerpo)',
        position: 'relative', overflow: 'hidden',
      }}>
        <CoffeePatternBg opacity={0.08} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>
          {formPanel}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-cuerpo)' }}>
      {/* Left branding panel */}
      <div style={{
        width: '40%', minWidth: 320,
        background: 'linear-gradient(145deg, var(--verde-sierra) 0%, #1a3525 50%, var(--cafe-oscuro) 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48,
      }}>
        <CoffeePatternBg opacity={0.1} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', maxWidth: 300 }}>
          <div style={{ animation: 'fadeIn 0.8s ease' }}>
            <LeafIcon size={64} color="#D4A04A" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-titulo)',
            color: 'white', fontSize: 30, marginTop: 16, marginBottom: 8,
          }}>
            MagdalenaTrace
          </h1>
          <p style={{ color: 'var(--verde-pale)', fontSize: 15, marginBottom: 48, lineHeight: 1.6 }}>
            Conectando el origen con el mundo
          </p>

          {[
            { icon: '📊', role: 'Exportador',          desc: 'Accede al catálogo de lotes certificados' },
            { icon: '🗺️', role: 'Turista / Comprador', desc: 'Descubre el origen de lo que consumes' },
            { icon: '🏕️', role: 'Operador Turístico',  desc: 'Gestiona tus experiencias de agroturismo' },
            { icon: '✈️', role: 'Productor',            desc: 'Vía Telegram — sin login web', telegram: true },
          ].map(r => (
            <div key={r.role} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: r.telegram ? 'rgba(42,171,238,0.10)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${r.telegram ? 'rgba(42,171,238,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10, padding: '10px 16px',
              marginBottom: 10, textAlign: 'left',
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: r.telegram ? '#2AABEE' : '#D4A04A' }}>{r.role}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, background: 'var(--crema)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32,
      }}>
        {formPanel}
      </div>
    </div>
  )
}
