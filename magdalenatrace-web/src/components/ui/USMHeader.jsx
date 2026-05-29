function LeafIcon({ size = 24, color = '#D4A04A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3C11 6.5 6 11 6 16.5C6 20.6 9.6 24 14 24C18.4 24 22 20.6 22 16.5C22 11 17 6.5 14 3Z" fill={color} />
      <path d="M14 11V24" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function USMHeader({ userName, onLogout }) {
  return (
    <header style={{
      background: 'var(--cafe-oscuro)',
      color: '#fff',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-cuerpo)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LeafIcon size={24} color="#D4A04A" />
        <div>
          <div style={{
            fontFamily: 'var(--font-titulo)',
            fontWeight: 700,
            fontSize: 17,
            color: '#D4A04A',
            letterSpacing: 0.3,
            lineHeight: 1.2,
          }}>
            MagdalenaTrace
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.2 }}>
            Institución Universitaria de Santa Marta
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {userName && (
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
            Hola, <strong style={{ color: '#D4A04A' }}>{userName}</strong>
          </span>
        )}
        {onLogout && (
          <button onClick={onLogout} style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 7,
            padding: '6px 14px',
            fontFamily: 'var(--font-cuerpo)',
            fontWeight: 500,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.14)'; e.target.style.color = 'white' }}
          onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = 'rgba(255,255,255,0.8)' }}
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  )
}
