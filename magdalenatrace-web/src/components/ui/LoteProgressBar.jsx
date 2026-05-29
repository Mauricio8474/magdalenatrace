export default function LoteProgressBar({ completados = 0, total = 4 }) {
  const pct = Math.min(100, (completados / total) * 100)
  return (
    <div style={{ fontFamily: 'var(--font-cuerpo)' }}>
      <div style={{ background: '#E5E7EB', borderRadius: 4, height: 8, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: `linear-gradient(90deg, var(--verde-sierra), var(--verde-medio))`,
          borderRadius: 4,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
        {completados}/{total} CTEs completados
      </div>
    </div>
  )
}
