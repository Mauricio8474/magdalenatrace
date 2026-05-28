import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix obligatorio para iconos de Leaflet en React (Vite rompe las rutas por defecto)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Ícono personalizado color teal USM
function makeIcon(color = '#1C5DA9') {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      transform:rotate(-45deg);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  })
}

const CERT_COLORS = {
  'Fairtrade':           '#38AB3F',
  'Rainforest Alliance': '#058389',
  'BPA':                 '#219BD6',
}

// Coordenadas reales de cada finca + lote demo asociado
const FINCAS = [
  { id:1, finca:'El Paraíso',   vereda:'Minca',        lat:11.1333, lng:-74.1167, alt:650,  producto:'café',         certs:['Rainforest Alliance'],                lote:'L2025-001' },
  { id:2, finca:'La Esperanza', vereda:'San Pedro',    lat:11.1789, lng:-74.0523, alt:820,  producto:'café',         certs:['Fairtrade'],                          lote:'L2025-002' },
  { id:3, finca:'El Edén',      vereda:'Palmor',       lat:10.7856, lng:-73.9234, alt:1100, producto:'cacao',        certs:['BPA'],                               lote:'L2025-003' },
  { id:4, finca:'Don Julio',    vereda:'Guachaca',     lat:11.2341, lng:-73.7823, alt:380,  producto:'banano/cacao', certs:['Fairtrade','Rainforest Alliance'],    lote:'L2025-004' },
  { id:5, finca:'La Montaña',   vereda:'Pueblo Bello', lat:10.4123, lng:-73.5678, alt:1450, producto:'café',         certs:['Rainforest Alliance'],                lote:'L2025-005' },
]

const FILTROS = ['Todas', 'Fairtrade', 'Rainforest Alliance', 'BPA']

// Sub-componente que centraliza el mapa cuando cambia `center`
function FlyTo({ center, zoom = 12 }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 0.8 })
  }, [center, zoom, map])
  return null
}

export default function MapaPage() {
  const navigate    = useNavigate()
  const markerRefs  = useRef({})
  const [filtro,    setFiltro]  = useState('Todas')
  const [flyTo,     setFlyTo]   = useState(null)
  const [activa,    setActiva]  = useState(null)

  const fincasFiltradas = filtro === 'Todas'
    ? FINCAS
    : FINCAS.filter(f => f.certs.includes(filtro))

  function seleccionarFinca(f) {
    setFlyTo([f.lat, f.lng])
    setActiva(f.id)
    setTimeout(() => {
      markerRefs.current[f.id]?.openPopup()
    }, 900)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-main)' }}>

      {/* Header */}
      <header style={{
        background: 'var(--usm-blue)', color: '#fff',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>MagdalenaTrace — Mapa de Fincas</div>
          <div style={{ fontSize: 11, opacity: 0.75 }}>Sierra Nevada de Santa Marta · {fincasFiltradas.length} fincas</div>
        </div>
        <button onClick={() => navigate('/')}
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '6px 14px', fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          ← Inicio
        </button>
      </header>

      {/* Cuerpo: mapa + panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Mapa 60% */}
        <div style={{ flex: '0 0 60%', position: 'relative' }}>
          <MapContainer
            center={[10.9878, -74.7889]}
            zoom={9}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {flyTo && <FlyTo center={flyTo} />}

            {fincasFiltradas.map(f => (
              <Marker
                key={f.id}
                position={[f.lat, f.lng]}
                icon={makeIcon(activa === f.id ? '#63C2CA' : '#1C5DA9')}
                ref={el => { if (el) markerRefs.current[f.id] = el }}
                eventHandlers={{ click: () => setActiva(f.id) }}
              >
                <Popup minWidth={220}>
                  <div style={{ fontFamily: 'var(--font-main)', padding: '2px 0' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--usm-navy)', marginBottom: 4 }}>
                      {f.finca}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
                      📍 {f.vereda} &nbsp;·&nbsp; 🏔️ {f.alt} msnm
                    </div>
                    <div style={{ fontSize: 12, marginBottom: 8 }}>
                      <strong>Producto:</strong> {f.producto}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                      {f.certs.map(c => (
                        <span key={c} style={{ background: CERT_COLORS[c] || '#6B7280', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
                          {c}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate(`/lote/${f.lote}`)}
                      style={{ width: '100%', background: 'var(--usm-blue)', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 0', fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      Ver trazabilidad →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Panel lateral 40% */}
        <div style={{ flex: '0 0 40%', overflowY: 'auto', background: '#fff', borderLeft: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>

          {/* Filtros */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB', background: 'var(--bg-light)', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>
              Filtrar por certificación
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FILTROS.map(f => (
                <button key={f} onClick={() => setFiltro(f)}
                  style={{
                    padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-main)',
                    background: filtro === f ? 'var(--usm-blue)' : 'var(--usm-deco)',
                    color: filtro === f ? '#fff' : 'var(--usm-navy)',
                    transition: 'all 0.15s',
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de fincas */}
          <div style={{ padding: '12px 14px', flex: 1 }}>
            {fincasFiltradas.length === 0 ? (
              <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
                No hay fincas con esa certificación.
              </p>
            ) : fincasFiltradas.map(f => (
              <div
                key={f.id}
                onClick={() => seleccionarFinca(f)}
                style={{
                  background: activa === f.id ? 'var(--usm-blue-pale)' : '#fff',
                  border: `1px solid ${activa === f.id ? 'var(--usm-teal)' : '#E5E7EB'}`,
                  borderRadius: 10, padding: '14px 14px', marginBottom: 10,
                  cursor: 'pointer', transition: 'all 0.15s',
                  borderLeft: `4px solid ${activa === f.id ? 'var(--usm-teal)' : 'var(--usm-blue)'}`,
                }}
                onMouseEnter={e => { if (activa !== f.id) e.currentTarget.style.background = 'var(--usm-deco)' }}
                onMouseLeave={e => { e.currentTarget.style.background = activa === f.id ? 'var(--usm-blue-pale)' : '#fff' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--usm-navy)' }}>{f.finca}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      📍 {f.vereda} &nbsp;·&nbsp; 🏔️ {f.alt} m &nbsp;·&nbsp; {f.producto}
                    </div>
                  </div>
                  <div style={{ fontSize: 18 }}>{f.producto.includes('café') ? '☕' : f.producto.includes('cacao') ? '🍫' : '🍌'}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                  {f.certs.map(c => (
                    <span key={c} style={{ background: CERT_COLORS[c] || '#6B7280', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
                      {c}
                    </span>
                  ))}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/lote/${f.lote}`) }}
                  style={{ marginTop: 10, fontSize: 11, background: 'none', border: '1px solid var(--usm-blue)', color: 'var(--usm-blue)', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font-main)', fontWeight: 600 }}>
                  Ver trazabilidad →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
