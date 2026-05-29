const CERT_CONFIG = {
  'Fairtrade':           { bg: '#27AE60', icon: '🌱' },
  'Rainforest Alliance': { bg: '#1A5C38', icon: '🌳' },
  'BPA':                 { bg: '#0077B6', icon: '✅' },
}

export default function CertBadge({ type, status }) {
  const config = CERT_CONFIG[type]
  const bg = status === 'vencida' ? '#9CA3AF' : (config?.bg || '#6B7280')
  return (
    <span style={{
      background: bg,
      color: '#fff',
      padding: '3px 10px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'var(--font-cuerpo)',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
    }}>
      {config?.icon && <span style={{ fontSize: 10 }}>{config.icon}</span>}
      {type}
    </span>
  )
}
