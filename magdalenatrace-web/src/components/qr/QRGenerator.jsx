import { QRCodeSVG } from 'qrcode.react'

export default function QRGenerator({ loteId, size = 180 }) {
  const url = `${window.location.origin}/lote/${loteId}`

  function descargar() {
    const container = document.getElementById(`qr-svg-${loteId}`)
    const svg = container?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `QR-${loteId}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  }

  return (
    <div style={{ textAlign: 'center', fontFamily: 'var(--font-main)' }}>
      <div id={`qr-svg-${loteId}`} style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
        <QRCodeSVG
          value={url}
          size={size}
          fgColor="#1C5DA9"
          bgColor="#FFFFFF"
          level="M"
        />
      </div>
      <p style={{ fontSize: 11, color: '#6B7280', margin: '8px 0 10px', fontFamily: 'var(--font-main)' }}>
        {loteId}
      </p>
      <button onClick={descargar} className="btn-secondary" style={{ fontSize: 12, padding: '6px 16px' }}>
        ⬇ Descargar QR
      </button>
    </div>
  )
}
