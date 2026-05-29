import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { QRCodeSVG } from 'qrcode.react'
import api from '../../api/client'
import { LOTES_DEMO, CTES_DEMO, FINCAS_DEMO } from '../../data/seed'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Coordenadas por vereda (para el mini mapa)
const COORDS_VEREDA = {
  'Minca':        [11.1333, -74.1167],
  'San Pedro':    [11.1789, -74.0523],
  'Palmor':       [10.7856, -73.9234],
  'Guachaca':     [11.2341, -73.7823],
  'Pueblo Bello': [10.4123, -73.5678],
}

const ESTADO_STYLE = {
  disponible: { bg: '#D1FAE5', color: '#065F46', label: '● Disponible' },
  reservado:  { bg: '#FEF3C7', color: '#92400E', label: '● Reservado'  },
  vendido:    { bg: '#E0E7FF', color: '#3730A3', label: '● Vendido'    },
  despachado: { bg: '#DBEAFE', color: '#1D4ED8', label: '● Despachado' },
}

const CTE_META = {
  insumo:   { color: 'var(--usm-teal)',     icon: '🌿', label: 'Insumo'   },
  cosecha:  { color: 'var(--usm-green)',    icon: '☕', label: 'Cosecha'  },
  acopio:   { color: 'var(--usm-blue-mid)', icon: '📦', label: 'Acopio'   },
  despacho: { color: 'var(--usm-navy)',     icon: '🚢', label: 'Despacho' },
}

const CERT_COLORS = {
  'Fairtrade':           '#38AB3F',
  'Rainforest Alliance': '#058389',
  'BPA':                 '#219BD6',
}

function descargarQR(loteId) {
  const container = document.getElementById(`qr-lote-${loteId}`)
  const svg = container?.querySelector('svg')
  if (!svg) return
  const svgData = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([svgData], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `QR-${loteId}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function LotePublico() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [lote,     setLote]    = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function fetchLote() {
      try {
        const { data } = await api.get(`/lotes/publico/${id}`)
        setLote(data)
      } catch {
        // Fallback a datos demo
        const demo = LOTES_DEMO.find(l => l.id === id) || LOTES_DEMO[0]
        const finca = FINCAS_DEMO.find(f => f.id === demo?.productor_id) || FINCAS_DEMO[0]
        setLote({
          id: demo.id,
          producto: demo.producto, variedad: demo.variedad,
          fecha_cosecha: '2025-03-15', volumen_kg: demo.kg,
          estado: demo.estado,
          vereda: finca.vereda, municipio: 'Santa Marta',
          altitud_msnm: finca.altitud,
          certificaciones: (demo.certs || []).map(c => ({ tipo: c, estado: 'vigente' })),
          ctes: CTES_DEMO[demo.id] || [],
          experiencias_disponibles: [],
        })
      } finally {
        setCargando(false)
      }
    }
    fetchLote()
  }, [id])

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-light)', fontFamily: 'var(--font-main)' }}>
      <div style={{ textAlign: 'center', color: 'var(--usm-navy)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
        <div style={{ fontWeight: 600 }}>Cargando pasaporte digital…</div>
      </div>
    </div>
  )

  if (!lote) return (
    <div style={{ padding: 40, fontFamily: 'var(--font-main)', textAlign: 'center' }}>
      <h2>Lote no encontrado</h2>
      <button onClick={() => navigate('/mapa')} className="btn-primary" style={{ marginTop: 16 }}>Ver mapa</button>
    </div>
  )

  const estadoStyle = ESTADO_STYLE[lote.estado] || ESTADO_STYLE.disponible
  const coords      = COORDS_VEREDA[lote.vereda]
  const qrUrl       = `${window.location.origin}/lote/${lote.id}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', fontFamily: 'var(--font-main)' }}>

      {/* Header con efecto decorativo */}
      <header style={{ background: 'var(--usm-blue)', color: '#fff', padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Franjas decorativas */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, left: `${i * 18 - 10}%`, width: 60, height: '200%',
            background: 'var(--usm-deco)', opacity: 0.12,
            transform: 'rotate(15deg)', transformOrigin: 'top left', pointerEvents: 'none',
          }} />
        ))}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <button onClick={() => navigate('/mapa')}
            style={{ position: 'absolute', left: 0, top: 0, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '5px 12px', fontFamily: 'var(--font-main)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            ← Mapa
          </button>
          <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            Institución Universitaria de Santa Marta
          </div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>MagdalenaTrace</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 3 }}>Pasaporte Digital de Trazabilidad</div>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

        {/* Card principal */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--usm-blue)', letterSpacing: -0.5 }}>{lote.id}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--usm-navy)', marginTop: 2 }}>
                {lote.producto}
                {lote.variedad && <span style={{ fontWeight: 400, fontSize: 15, color: '#6B7280' }}> · {lote.variedad}</span>}
              </div>
            </div>
            <span style={{ background: estadoStyle.bg, color: estadoStyle.color, padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
              {estadoStyle.label}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
            {[
              { icon: '📅', label: 'Fecha de cosecha', value: lote.fecha_cosecha || '—' },
              { icon: '⚖️', label: 'Volumen',          value: `${lote.volumen_kg?.toLocaleString()} kg` },
              { icon: '📍', label: 'Vereda',           value: `${lote.vereda}, ${lote.municipio}` },
              { icon: '🏔️', label: 'Altitud',          value: lote.altitud_msnm ? `${lote.altitud_msnm} m.s.n.m.` : '—' },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ background: 'var(--bg-light)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{icon}</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--usm-navy)', marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Certificaciones */}
          {lote.certificaciones?.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6B7280', marginRight: 4 }}>Certificaciones:</span>
              {lote.certificaciones.map(c => (
                <span key={c.tipo} style={{
                  background: c.estado === 'vencida' ? '#9CA3AF' : (CERT_COLORS[c.tipo] || '#6B7280'),
                  color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                }}>
                  {c.tipo}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Línea de tiempo CTEs */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 15, marginBottom: 20, color: 'var(--usm-navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
            🔗 Cadena de Trazabilidad
            <span style={{ fontWeight: 400, fontSize: 12, color: '#9CA3AF' }}>({lote.ctes?.length || 0} eventos)</span>
          </h3>

          {(!lote.ctes || lote.ctes.length === 0) ? (
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>Sin eventos de trazabilidad registrados aún.</p>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Línea vertical */}
              <div style={{ position: 'absolute', left: 17, top: 0, bottom: 0, width: 2, background: 'var(--usm-deco)' }} />

              {lote.ctes.map((cte, i) => {
                const meta = CTE_META[cte.tipo] || { color: '#6B7280', icon: '📋', label: cte.tipo }
                return (
                  <div key={i} style={{ display: 'flex', gap: 16, marginBottom: i < lote.ctes.length - 1 ? 20 : 0, position: 'relative' }}>
                    {/* Punto de la línea */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: meta.color, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, zIndex: 1, boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}>
                      {meta.icon}
                    </div>
                    {/* Contenido */}
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: meta.color, padding: '2px 8px', borderRadius: 10 }}>
                          {meta.label}
                        </span>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{cte.fecha}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--usm-navy)', lineHeight: 1.5 }}>{cte.descripcion}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Mini mapa */}
        {coords && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: 15, marginBottom: 14, color: 'var(--usm-navy)' }}>
              📍 Zona de origen — {lote.vereda}
            </h3>
            <div style={{ borderRadius: 8, overflow: 'hidden', height: 200 }}>
              <MapContainer
                center={coords} zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                doubleClickZoom={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={coords}>
                  <Popup>{lote.vereda}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Experiencias */}
        {lote.experiencias_disponibles?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: 15, marginBottom: 14, color: 'var(--usm-navy)' }}>🌄 Experiencias turísticas disponibles</h3>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {lote.experiencias_disponibles.map((exp, i) => (
                <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', background: 'var(--bg-light)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--usm-navy)', marginBottom: 4 }}>{exp.titulo}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>por {exp.operador}</div>
                  <div style={{ fontWeight: 800, color: 'var(--usm-blue)', fontSize: 16, marginBottom: 10 }}>
                    ${exp.precio_cop?.toLocaleString()} COP
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: 12, padding: '7px 0' }}>
                    Reservar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <h3 style={{ fontSize: 15, marginBottom: 6, color: 'var(--usm-navy)' }}>📱 Código QR del lote</h3>
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 18 }}>
            Escanea para acceder al pasaporte digital desde cualquier dispositivo
          </p>
          <div id={`qr-lote-${lote.id}`} style={{ display: 'inline-block', padding: 16, background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', marginBottom: 12 }}>
            <QRCodeSVG
              value={qrUrl}
              size={180}
              fgColor="#1C5DA9"
              bgColor="#FFFFFF"
              level="M"
            />
          </div>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14, wordBreak: 'break-all' }}>{qrUrl}</p>
          <button onClick={() => descargarQR(lote.id)} className="btn-secondary" style={{ fontSize: 13, padding: '8px 20px' }}>
            ⬇ Descargar QR
          </button>
        </div>

      </div>
    </div>
  )
}
