const TYPES = {
  success: { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7', icon: '✅' },
  error:   { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', icon: '⚠️' },
  info:    { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE', icon: 'ℹ️' },
  warning: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', icon: '⚡' },
}

export default function AlertMessage({ type = 'info', message, onClose }) {
  if (!message) return null
  const cfg = TYPES[type] || TYPES.info
  return (
    <div style={{
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 10,
      padding: '12px 16px',
      fontSize: 14,
      fontWeight: 500,
      fontFamily: 'var(--font-cuerpo)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      animation: 'slideInRight 0.3s ease',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{cfg.icon}</span>
        <span>{message}</span>
      </span>
      {onClose && (
        <button onClick={onClose} style={{
          background: 'none', border: 'none',
          color: cfg.color, cursor: 'pointer',
          fontSize: 16, lineHeight: 1, opacity: 0.6,
          padding: '0 2px',
        }}>✕</button>
      )}
    </div>
  )
}
