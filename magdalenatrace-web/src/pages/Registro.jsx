import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

const ROLES = [
  { value: 'exportador', label: '📊 Exportador', desc: 'Accede al catálogo y crea órdenes de compra' },
  { value: 'turista',    label: '🗺️ Turista',    desc: 'Explora fincas y reserva experiencias' },
]

export default function Registro() {
  const navigate = useNavigate()
  const [rol,     setRol]     = useState('exportador')
  const [form,    setForm]    = useState({ nombre_completo: '', email: '', password: '', empresa: '', nit: '', ciudad: '', pais_origen: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = rol === 'exportador' ? '/auth/registro/exportador' : '/auth/registro/turista'
      const body = rol === 'exportador'
        ? { nombre_completo: form.nombre_completo, email: form.email, password: form.password, empresa: form.empresa, nit: form.nit, ciudad: form.ciudad }
        : { nombre_completo: form.nombre_completo, email: form.email, password: form.password, pais_origen: form.pais_origen }
      const { data } = await api.post(endpoint, body)
      if (data.access_token) {
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify({ rol: data.rol, nombre: data.nombre, id: data.id }))
        navigate(data.rol === 'exportador' ? '/exportador' : '/mapa')
      } else {
        navigate('/login?msg=registro_ok')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--usm-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-main)', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '40px 36px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--usm-blue)' }}>MagdalenaTrace</div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Crear cuenta</div>
        </div>

        {/* Selector de rol */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {ROLES.map(r => (
            <button key={r.value} onClick={() => setRol(r.value)}
              style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: `2px solid ${rol === r.value ? 'var(--usm-blue)' : '#E5E7EB'}`, background: rol === r.value ? 'var(--usm-blue-pale)' : '#fff', cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: 13, fontWeight: 600, color: rol === r.value ? 'var(--usm-navy)' : '#6B7280', textAlign: 'center' }}>
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Nombre completo', key: 'nombre_completo', type: 'text', required: true },
            { label: 'Correo electrónico', key: 'email', type: 'email', required: true },
            { label: 'Contraseña', key: 'password', type: 'password', required: true },
            ...(rol === 'exportador' ? [
              { label: 'Empresa', key: 'empresa', type: 'text', required: true },
              { label: 'NIT', key: 'nit', type: 'text', required: true },
              { label: 'Ciudad', key: 'ciudad', type: 'text', required: true },
            ] : [
              { label: 'País de origen', key: 'pais_origen', type: 'text', required: false },
            ]),
          ].map(({ label, key, type, required }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--usm-navy)', display: 'block', marginBottom: 4 }}>{label}</label>
              <input type={type} required={required} value={form[key]} onChange={f(key)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontFamily: 'var(--font-main)', fontSize: 13 }} />
            </div>
          ))}

          {rol === 'exportador' && (
            <p style={{ fontSize: 11, color: '#6B7280', background: '#FEF3C7', padding: '8px 10px', borderRadius: 6 }}>
              ℹ️ Tu cuenta de exportador quedará pendiente de aprobación por el administrador.
            </p>
          )}

          {error && <div style={{ background: '#FEF2F2', color: '#DC2626', borderRadius: 6, padding: '10px 12px', fontSize: 13 }}>{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: 12, fontSize: 14, marginTop: 4 }}>
            {loading ? 'Registrando…' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#6B7280' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--usm-blue)', fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
