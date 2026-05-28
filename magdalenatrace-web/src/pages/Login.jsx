import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      setError('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(email, pass) {
    setForm({ email, password: pass })
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--usm-blue)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-main)', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '40px 36px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--usm-blue)' }}>MagdalenaTrace</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
            Institución Universitaria de Santa Marta
          </div>
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 20, color: 'var(--usm-navy)' }}>Iniciar sesión</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--usm-navy)', display: 'block', marginBottom: 5 }}>
              Correo electrónico
            </label>
            <input
              type="email" required autoFocus
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              style={inputStyle}
              placeholder="tu@correo.co"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--usm-navy)', display: 'block', marginBottom: 5 }}>
              Contraseña
            </label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', color: '#DC2626', borderRadius: 6, padding: '10px 12px', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, padding: '12px', fontSize: 15 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Acceso rápido demo */}
        <div style={{ marginTop: 24, borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginBottom: 10 }}>
            Acceso rápido (demo)
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Exportador', email: 'exportador@sierraexporta.co', pass: 'exporta2026', color: 'var(--usm-teal-dark)' },
              { label: 'Turista',    email: 'tourist@example.com',          pass: 'travel2026',  color: 'var(--usm-navy)' },
              { label: 'Admin',      email: 'admin@magdalenatrace.co',      pass: 'admin2026',   color: 'var(--usm-blue)' },
            ].map(d => (
              <button key={d.label} onClick={() => fillDemo(d.email, d.pass)}
                style={{ background: d.color, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)' }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#6B7280' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" style={{ color: 'var(--usm-blue)', fontWeight: 600 }}>Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid #D1D5DB', borderRadius: 6,
  fontFamily: 'var(--font-main)', fontSize: 14,
  outline: 'none', transition: 'border 0.2s',
}
