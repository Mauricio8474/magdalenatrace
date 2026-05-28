const COLORS = {
  'Fairtrade':           '#38AB3F',
  'Rainforest Alliance': '#058389',
  'BPA':                 '#219BD6',
}

export default function CertBadge({ type, status }) {
  const bg = status === 'vencida' ? '#9CA3AF' : (COLORS[type] || '#6B7280')
  return (
    <span style={{
      background: bg, color: '#fff',
      padding: '2px 8px', borderRadius: 12,
      fontSize: 11, fontWeight: 600,
      fontFamily: 'var(--font-main)',
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {type}
    </span>
  )
}
