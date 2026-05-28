export default function USMHeader({ userName, onLogout }) {
  return (
    <header style={{
      background: 'var(--usm-blue)', color: '#fff',
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: 'var(--font-main)',
    }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.3 }}>MagdalenaTrace</div>
        <div style={{ fontSize: 11, opacity: 0.75, marginTop: 1 }}>
          Institución Universitaria de Santa Marta
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {userName && (
          <span style={{ fontSize: 13, opacity: 0.9 }}>Hola, <strong>{userName}</strong></span>
        )}
        {onLogout && (
          <button onClick={onLogout} style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 6, padding: '6px 14px',
            fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer',
          }}>
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  )
}
