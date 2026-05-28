/**
 * Landing.jsx — Selector de roles
 * Responsable: Damián
 * TODO: Implementar las 4 tarjetas de rol con gradiente y hover
 */
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--usm-blue)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <h1 style={{ color: 'white', fontSize: 32, marginBottom: 8, fontWeight: 800 }}>MagdalenaTrace</h1>
      <p style={{ color: 'var(--usm-sky)', marginBottom: 48, fontSize: 14 }}>Institución Universitaria de Santa Marta · Educación que permanece</p>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { label: '🌱 Soy Productor',         path: '/whatsapp',   bg: 'var(--whatsapp-dark)' },
          { label: '📊 Soy Exportador',         path: '/exportador', bg: 'var(--usm-teal-dark)' },
          { label: '🗺️ Soy Turista/Comprador',  path: '/mapa',       bg: 'var(--usm-navy)' },
          { label: '🤖 Chatbot IA',             path: '/chatbot',    bg: 'var(--usm-blue-mid)' },
        ].map(({ label, path, bg }) => (
          <button key={path} onClick={() => navigate(path)}
            style={{ background: bg, color: 'white', border: 'none', borderRadius: 12, padding: '24px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer', minWidth: 200, fontFamily: 'var(--font-main)' }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
