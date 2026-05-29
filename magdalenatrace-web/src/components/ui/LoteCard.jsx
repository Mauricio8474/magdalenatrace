import CertBadge from './CertBadge'
import LoteProgressBar from './LoteProgressBar'

const PRODUCT_COLORS = {
  'Café':   { accent: '#7B3F00', bg: 'linear-gradient(135deg, #3E1F00, #2D6A4F)' },
  'Cacao':  { accent: '#D4A04A', bg: 'linear-gradient(135deg, #1a0a00, #7B3F00)' },
  'Banano': { accent: '#40916C', bg: 'linear-gradient(135deg, #1a3a2a, #40916C)' },
}

export default function LoteCard({ lote, onOrden }) {
  const colors = PRODUCT_COLORS[lote.producto] || { accent: 'var(--verde-sierra)', bg: 'var(--verde-sierra)' }
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      fontFamily: 'var(--font-cuerpo)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.14)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
    }}
    >
      {/* Header gradient */}
      <div style={{ background: colors.bg, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginBottom: 2 }}>
              {lote.id}
            </div>
            <div style={{ fontFamily: 'var(--font-titulo)', fontSize: 20, color: 'white', fontWeight: 700 }}>
              {lote.producto}
            </div>
            {lote.variedad && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                {lote.variedad}
              </div>
            )}
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 8, padding: '6px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white', lineHeight: 1 }}>
              {(lote.volumen_kg ?? lote.kg)?.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>kg</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {(lote.certificaciones || []).map(c => (
            <CertBadge key={c} type={c} status="vigente" />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, marginBottom: 14, color: 'var(--texto-medio)' }}>
          <div>📍 {lote.vereda || '—'}</div>
          {lote.altitud_msnm && <div>⛰️ {lote.altitud_msnm} m</div>}
          {lote.precio_kg && (
            <div style={{ color: 'var(--cafe-medio)', fontWeight: 600 }}>
              💰 ${lote.precio_kg?.toLocaleString()}/kg
            </div>
          )}
        </div>

        {lote.ctes_total && (
          <div style={{ marginBottom: 14 }}>
            <LoteProgressBar completados={lote.ctes_completados} total={lote.ctes_total} />
          </div>
        )}

        {onOrden && (
          <button onClick={() => onOrden(lote)} className="btn-secondary"
            style={{ width: '100%', padding: '10px', fontSize: 13 }}>
            Crear orden de compra
          </button>
        )}
      </div>
    </div>
  )
}
