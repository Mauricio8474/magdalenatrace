export default function LoadingSpinner({ size = 36, label = 'Cargando…' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 32,
      fontFamily: 'var(--font-cuerpo)',
    }}>
      <div style={{
        width: size, height: size,
        border: `3px solid var(--verde-pale)`,
        borderTopColor: 'var(--verde-medio)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {label && (
        <span style={{ fontSize: 13, color: 'var(--texto-medio)', animation: 'pulse 1.5s ease infinite' }}>
          {label}
        </span>
      )}
    </div>
  )
}
