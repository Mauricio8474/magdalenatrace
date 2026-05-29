import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
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
        <pattern id="regPattern" width="120" height="120" patternUnits="userSpaceOnUse">
          <ellipse cx="28" cy="24" rx="8" ry="13" fill="white" opacity={opacity} transform="rotate(32 28 24)" />
          <ellipse cx="88" cy="62" rx="8" ry="13" fill="white" opacity={opacity} transform="rotate(-22 88 62)" />
          <ellipse cx="18" cy="92" rx="6" ry="9"  fill="white" opacity={opacity * 0.7} transform="rotate(14 18 92)" />
          <ellipse cx="60" cy="106" rx="7" ry="11" fill="white" opacity={opacity} transform="rotate(10 60 106)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#regPattern)" />
    </svg>
  )
}

const ROLES = [
  {
    value:  'exportador',
    icon:   '🌿',
    label:  'Exportador',
    desc:   'Accede al catálogo y crea órdenes de compra internacionales',
    accent: 'var(--verde-sierra)',
    pale:   'var(--verde-pale)',
  },
  {
    value:  'turista',
    icon:   '🗺️',
    label:  'Turista',
    desc:   'Explora fincas certificadas y reserva experiencias',
    accent: 'var(--azul-caribe)',
    pale:   '#E0F2FE',
  },
  {
    value:  'operador',
    icon:   '🏕️',
    label:  'Operador Turístico',
    desc:   'Hotel, agencia, guía o persona natural que ofrece agroturismo en el Magdalena',
    accent: 'var(--azul-caribe)',
    pale:   '#E0F2FE',
  },
]

// ── Campos para exportador y turista (simples) ────────────────────
const FIELD_SETS = {
  exportador: [
    { label: 'Nombre completo',     key: 'nombre_completo', type: 'text',     required: true,  placeholder: 'Ej: Carlos Mendoza' },
    { label: 'Correo electrónico',  key: 'email',           type: 'email',    required: true,  placeholder: 'tu@empresa.co' },
    { label: 'Contraseña',          key: 'password',        type: 'password', required: true,  placeholder: 'Mínimo 8 caracteres' },
    { label: 'Empresa exportadora', key: 'empresa',         type: 'text',     required: true,  placeholder: 'Ej: Sierra Exporta S.A.S.' },
    { label: 'NIT',                 key: 'nit',             type: 'text',     required: true,  placeholder: 'Ej: 900.123.456-7' },
    { label: 'Ciudad',              key: 'ciudad',          type: 'text',     required: true,  placeholder: 'Ej: Santa Marta' },
  ],
  turista: [
    { label: 'Nombre completo',    key: 'nombre_completo', type: 'text',     required: true,  placeholder: 'Ej: Ana García' },
    { label: 'Correo electrónico', key: 'email',           type: 'email',    required: true,  placeholder: 'tu@correo.com' },
    { label: 'Contraseña',         key: 'password',        type: 'password', required: true,  placeholder: 'Mínimo 8 caracteres' },
    { label: 'País de origen',     key: 'pais_origen',     type: 'text',     required: false, placeholder: 'Ej: Alemania' },
  ],
}

const TIPOS_OPERADOR = ['Hotel boutique / Eco-lodge', 'Agencia de turismo', 'Guía certificado', 'Persona natural']
const CIUDADES       = ['Santa Marta', 'Minca', 'Ciénaga', 'Otro']
const SERVICIOS_OPTS = ['Agroturismo', 'Ecoturismo', 'Finca-hotel', 'Tours guiados', 'Experiencias gastronómicas']

const INPUT_STYLE = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid #E5E7EB', borderRadius: 8,
  fontFamily: 'var(--font-cuerpo)', fontSize: 14,
  color: 'var(--texto-oscuro)', background: 'white',
  transition: 'border 0.2s', outline: 'none',
}

const LABEL_STYLE = {
  fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
  color: 'var(--texto-oscuro)', display: 'block', marginBottom: 5,
}

// ── Formulario extendido del Operador ─────────────────────────────
function OperadorFields({ form, setForm, servicios, toggleServicio }) {
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  return (
    <>
      <div>
        <label style={LABEL_STYLE}>NOMBRE COMPLETO O RAZÓN SOCIAL *</label>
        <input type="text" required value={form.nombre_completo} onChange={f('nombre_completo')}
          placeholder="Ej: Sierra Aventura Tours S.A.S." style={INPUT_STYLE} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={LABEL_STYLE}>TIPO DE OPERADOR *</label>
          <select required value={form.tipo_operador} onChange={f('tipo_operador')}
            style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}>
            <option value="">Selecciona…</option>
            {TIPOS_OPERADOR.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL_STYLE}>CIUDAD BASE *</label>
          <select required value={form.ciudad_base} onChange={f('ciudad_base')}
            style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}>
            <option value="">Selecciona…</option>
            {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={LABEL_STYLE}>CORREO ELECTRÓNICO *</label>
        <input type="email" required value={form.email} onChange={f('email')}
          placeholder="tu@empresa.co" style={INPUT_STYLE} />
      </div>
      <div>
        <label style={LABEL_STYLE}>CONTRASEÑA *</label>
        <input type="password" required value={form.password} onChange={f('password')}
          placeholder="Mínimo 8 caracteres" style={INPUT_STYLE} />
      </div>

      <div>
        <label style={{ ...LABEL_STYLE, marginBottom: 10 }}>SERVICIOS OFRECIDOS</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SERVICIOS_OPTS.map(s => {
            const sel = servicios.includes(s)
            return (
              <button key={s} type="button" onClick={() => toggleServicio(s)}
                style={{
                  padding: '6px 12px', borderRadius: 20,
                  border: `1.5px solid ${sel ? 'var(--azul-caribe)' : '#E5E7EB'}`,
                  background: sel ? '#E0F2FE' : 'white',
                  color: sel ? 'var(--azul-caribe)' : '#6B7280',
                  fontSize: 12, fontWeight: sel ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'var(--font-cuerpo)',
                  transition: 'all 0.15s',
                }}>
                {sel ? '✓ ' : ''}{s}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function Registro() {
  const navigate     = useNavigate()
  const [searchParams] = useSearchParams()
  const [rol, setRol] = useState(() => {
    const p = searchParams.get('rol')
    return ['exportador', 'turista', 'operador'].includes(p) ? p : 'exportador'
  })
  const [form, setForm] = useState({
    nombre_completo: '', email: '', password: '',
    empresa: '', nit: '', ciudad: '', pais_origen: '',
    tipo_operador: '', ciudad_base: '',
  })
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  function toggleServicio(s) {
    setServiciosSeleccionados(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpointMap = {
        exportador: '/auth/registro/exportador',
        turista:    '/auth/registro/turista',
        operador:   '/auth/registro/operador',
      }
      const bodyMap = {
        exportador: { nombre_completo: form.nombre_completo, email: form.email, password: form.password, empresa: form.empresa, nit: form.nit, ciudad: form.ciudad },
        turista:    { nombre_completo: form.nombre_completo, email: form.email, password: form.password, pais_origen: form.pais_origen || undefined },
        operador:   {
          nombre_completo: form.nombre_completo, email: form.email, password: form.password,
          empresa: form.nombre_completo,
          ciudad: form.ciudad_base,
          tipo_operador: form.tipo_operador,
          servicios: serviciosSeleccionados.join(',') || undefined,
        },
      }
      const { data } = await api.post(endpointMap[rol], bodyMap[rol])
      if (data.access_token) {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify({ rol: data.rol, nombre: data.nombre, id: data.id }))
        if (data.rol === 'exportador') navigate('/exportador')
        else if (data.rol === 'operador_turistico') navigate('/operador')
        else navigate('/mapa')
      } else {
        navigate('/login?msg=registro_ok')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse. Revisa los datos e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const selectedRol = ROLES.find(r => r.value === rol)

  const formPanel = (
    <div style={{
      background: 'white', borderRadius: 20,
      padding: 'clamp(22px, 4vw, 38px) clamp(18px, 4vw, 34px)',
      width: '100%', maxWidth: 480,
      boxShadow: '0 8px 48px rgba(0,0,0,0.13)',
      animation: 'slideUp 0.5s ease',
      maxHeight: '92vh', overflowY: 'auto',
    }}>
      {isMobile && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <LeafIcon size={36} color="#D4A04A" />
          <div style={{ fontFamily: 'var(--font-titulo)', fontWeight: 700, fontSize: 18, color: 'var(--verde-sierra)', marginTop: 4 }}>
            MagdalenaTrace
          </div>
        </div>
      )}

      <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: 24, color: 'var(--texto-oscuro)', marginBottom: 4 }}>
        Crear cuenta
      </h2>
      <p style={{ color: 'var(--texto-medio)', fontSize: 13, marginBottom: 22 }}>
        Elige tu tipo de cuenta para comenzar
      </p>

      {/* Role selector — 3 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, marginBottom: 16 }}>
        {ROLES.map(r => {
          const active = rol === r.value
          return (
            <button key={r.value} type="button" onClick={() => setRol(r.value)}
              style={{
                padding: '11px 6px', borderRadius: 10,
                border: `2px solid ${active ? r.accent : '#E5E7EB'}`,
                background: active ? r.pale : 'white',
                cursor: 'pointer', fontFamily: 'var(--font-cuerpo)',
                fontSize: 11, fontWeight: 600,
                color: active ? r.accent : '#9CA3AF',
                textAlign: 'center', transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{r.icon}</div>
              <div style={{ lineHeight: 1.2 }}>{r.label}</div>
            </button>
          )
        })}
      </div>

      {/* Role description badge */}
      <div style={{
        background: selectedRol?.pale || 'var(--verde-pale)',
        color: selectedRol?.accent || 'var(--verde-sierra)',
        borderRadius: 8, padding: '8px 12px',
        fontSize: 12, marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 6,
        border: `1px solid ${selectedRol?.accent || 'var(--verde-sierra)'}22`,
      }}>
        <span>{selectedRol?.icon}</span>
        <span>{selectedRol?.desc}</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Exportador & Turista: generic field rendering */}
        {rol !== 'operador' && FIELD_SETS[rol].map(({ label, key, type, required, placeholder }) => (
          <div key={key}>
            <label style={LABEL_STYLE}>{label.toUpperCase()}{required && ' *'}</label>
            <input type={type} required={required} value={form[key]} onChange={f(key)}
              placeholder={placeholder} style={INPUT_STYLE} />
          </div>
        ))}

        {/* Operador: custom rich form */}
        {rol === 'operador' && (
          <OperadorFields form={form} setForm={setForm}
            servicios={serviciosSeleccionados} toggleServicio={toggleServicio} />
        )}

        {rol === 'exportador' && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#92400E' }}>
            ⏳ Tu cuenta de exportador quedará pendiente de aprobación por el administrador antes de poder operar.
          </div>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, animation: 'slideInRight 0.3s ease' }}>
            ⚠️ {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary"
          style={{ padding: '13px', fontSize: 14, marginTop: 4, width: '100%',
            background: selectedRol?.accent?.includes('azul') ? 'var(--azul-caribe)' : undefined }}>
          {loading ? '⏳ Registrando…' : 'Crear cuenta'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--texto-medio)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" style={{ color: 'var(--verde-sierra)', fontWeight: 600 }}>Inicia sesión</Link>
      </p>
    </div>
  )

  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--verde-sierra) 0%, var(--cafe-oscuro) 100%)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px 16px 40px', fontFamily: 'var(--font-cuerpo)',
        position: 'relative', overflow: 'hidden',
      }}>
        <CoffeePatternBg opacity={0.07} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480, marginTop: 16 }}>
          {formPanel}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-cuerpo)' }}>
      <div style={{
        width: '38%', minWidth: 300,
        background: 'linear-gradient(145deg, var(--verde-sierra) 0%, #1a3525 50%, var(--cafe-oscuro) 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 44,
      }}>
        <CoffeePatternBg opacity={0.1} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', maxWidth: 280 }}>
          <LeafIcon size={60} color="#D4A04A" />
          <h1 style={{ fontFamily: 'var(--font-titulo)', color: 'white', fontSize: 28, marginTop: 16, marginBottom: 8 }}>
            MagdalenaTrace
          </h1>
          <p style={{ color: 'var(--verde-pale)', fontSize: 14, marginBottom: 40, lineHeight: 1.65 }}>
            Únete a la plataforma de trazabilidad del Magdalena
          </p>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '20px 24px' }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.7 }}>
              "La trazabilidad no es solo un documento —
              es la historia viva de cada familia agricultora
              de la Sierra Nevada."
            </p>
            <p style={{ color: '#D4A04A', fontSize: 12, marginTop: 10, fontWeight: 500 }}>— Equipo MagdalenaTrace</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, background: 'var(--crema)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        {formPanel}
      </div>
    </div>
  )
}
