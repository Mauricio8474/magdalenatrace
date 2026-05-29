import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { QRCodeSVG } from 'qrcode.react'
import api from '../../api/client'
import CertBadge from '../../components/ui/CertBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// ── Leaflet icon ───────────────────────────────────────────────────
const farmIcon = new L.DivIcon({
  className: '',
  html: '<div style="background:#2D6A4F;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">🌿</div>',
  iconSize: [28, 28], iconAnchor: [14, 14],
})

function MapResizer() {
  const map = useMap()
  useEffect(() => { const t = setTimeout(() => map.invalidateSize(), 200); return () => clearTimeout(t) }, [map])
  return null
}

// ── Demo data ──────────────────────────────────────────────────────
const EXPERIENCIAS_PUBLICAS = [
  {
    id: 1,
    titulo: 'Tour del café en la Sierra Nevada',
    descripcion: 'Vive la experiencia completa del café de especialidad: recolección manual, despulpe, fermentación, secado en camas africanas y cata profesional. Todo en la finca El Paraíso, a 650 msnm en Minca, con la familia Pedraza que lleva tres generaciones cultivando café bajo sombra. Una mañana que cambia tu relación con la taza.',
    tipo_servicio: 'Agroturismo',
    precio_cop: 85000,
    duracion_horas: 4,
    cupo_maximo: 8,
    incluye: ['🚌 Transporte desde Santa Marta', '🍽️ Almuerzo típico samario', '☕ Cata guiada de 3 perfiles', '🎁 Bolsa 250g de café especial'],
    finca: { id: 1, nombre: 'El Paraíso', vereda: 'Minca', lat: 11.1333, lng: -74.1167, producto: 'Café', altitud: 650, certificaciones: ['Rainforest Alliance'] },
    operador: { nombre: 'Sierra Aventura Tours', tipo: 'Agencia de turismo', ciudad: 'Santa Marta' },
    disponible: true,
  },
  {
    id: 2,
    titulo: 'Chocolatería artesanal en Palmor',
    descripcion: 'Conoce el proceso completo del cacao fino de aroma en la finca El Edén. Desde la apertura de la mazorca hasta moldear tu propia tableta de chocolate: fermentación, secado solar, tostado y conchado artesanal con técnicas ancestrales del Magdalena. Te llevas tu creación empaquetada.',
    tipo_servicio: 'Experiencia gastronómica',
    precio_cop: 95000,
    duracion_horas: 5,
    cupo_maximo: 10,
    incluye: ['🚌 Transporte incluido', '🍫 Taller de chocolate artesanal', '🎁 Kit cacao + tableta personalizada', '👩‍🍳 Chef local certificada'],
    finca: { id: 3, nombre: 'El Edén', vereda: 'Palmor', lat: 10.7856, lng: -73.9234, producto: 'Cacao', altitud: 1100, certificaciones: ['BPA'] },
    operador: { nombre: 'Sierra Aventura Tours', tipo: 'Agencia de turismo', ciudad: 'Santa Marta' },
    disponible: true,
  },
]

// ── Helpers ────────────────────────────────────────────────────────
function LeafIcon({ size = 28, color = '#D4A04A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3C11 6.5 6 11 6 16.5C6 20.6 9.6 24 14 24C18.4 24 22 20.6 22 16.5C22 11 17 6.5 14 3Z" fill={color} />
      <path d="M14 11V24" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CoffeePatternBg({ opacity = 0.08, id = 'expPattern' }) {
  return (
    <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <pattern id={id} width="120" height="120" patternUnits="userSpaceOnUse">
          <ellipse cx="28" cy="24" rx="8" ry="13" fill="white" opacity={opacity} transform="rotate(32 28 24)" />
          <ellipse cx="88" cy="62" rx="8" ry="13" fill="white" opacity={opacity} transform="rotate(-22 88 62)" />
          <ellipse cx="18" cy="92" rx="6" ry="9"  fill="white" opacity={opacity * 0.7} transform="rotate(14 18 92)" />
          <ellipse cx="60" cy="106" rx="7" ry="11" fill="white" opacity={opacity} transform="rotate(10 60 106)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function ExperienciaPublica() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exp, setExp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showQRModal, setShowQRModal] = useState(false)

  useEffect(() => {
    api.get(`/operadores/experiencias/${id}`)
      .then(r => setExp(r.data))
      .catch(() => {
        const demo = EXPERIENCIAS_PUBLICAS.find(e => String(e.id) === String(id))
        setExp(demo || EXPERIENCIAS_PUBLICAS[0])
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--crema)' }}>
      <LoadingSpinner label="Cargando experiencia…" />
    </div>
  )

  if (!exp) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 18, color: 'var(--texto-medio)' }}>Experiencia no encontrada</p>
      <Link to="/mapa"><button className="btn-primary" style={{ padding: '10px 24px' }}>Explorar el mapa</button></Link>
    </div>
  )

  const pageUrl = `${window.location.origin}/experiencia/${exp.id}`
  const isLoggedIn = !!localStorage.getItem('token')

  const SERVICE_BG = {
    'Agroturismo':              '#D1FAE5',
    'Ecoturismo':               'var(--verde-pale)',
    'Tours guiados':            '#E0F2FE',
    'Experiencia gastronómica': '#FEE2E2',
    'Finca-hotel':              '#FEF3C7',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--crema)', fontFamily: 'var(--font-cuerpo)' }}>
      {/* Navbar minimal */}
      <nav style={{ background: 'rgba(62,31,0,0.95)', backdropFilter: 'blur(10px)', height: 56, display: 'flex', alignItems: 'center', padding: '0 clamp(16px, 4vw, 48px)', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <LeafIcon size={24} color="#D4A04A" />
          <span style={{ fontFamily: 'var(--font-titulo)', fontSize: 16, fontWeight: 700, color: '#D4A04A' }}>MagdalenaTrace</span>
        </Link>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/mapa"><button style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, padding: '6px 14px', fontFamily: 'var(--font-cuerpo)', fontSize: 12, cursor: 'pointer' }}>🗺️ Mapa</button></Link>
          <Link to={isLoggedIn ? '/' : '/login'}><button style={{ background: 'var(--verde-sierra)', color: 'white', border: 'none', borderRadius: 7, padding: '6px 14px', fontFamily: 'var(--font-cuerpo)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{isLoggedIn ? 'Mi cuenta' : 'Iniciar sesión'}</button></Link>
        </div>
      </nav>

      {/* Hero header */}
      <div style={{ background: 'linear-gradient(135deg, var(--verde-sierra) 0%, #1a3525 60%, var(--cafe-oscuro) 100%)', padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 48px)', position: 'relative', overflow: 'hidden' }}>
        <CoffeePatternBg opacity={0.07} id="heroExpPattern" />
        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {exp.tipo_servicio && (
            <span style={{ background: SERVICE_BG[exp.tipo_servicio] || '#E0F2FE', color: 'var(--texto-oscuro)', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 14 }}>
              {exp.tipo_servicio}
            </span>
          )}
          <h1 style={{ fontFamily: 'var(--font-titulo)', fontSize: 'clamp(28px, 5vw, 48px)', color: 'white', lineHeight: 1.2, marginBottom: 14, fontWeight: 800 }}>
            {exp.titulo}
          </h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            <span>📍 {exp.finca?.vereda || exp.vereda}</span>
            <span>⛰️ {exp.finca?.altitud || '—'} msnm</span>
            <span>👤 {exp.operador?.nombre || 'Operador turístico'}</span>
            <span style={{ color: '#D4A04A', fontWeight: 700 }}>⭐ {exp.operador?.tipo || 'Agencia'}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 32, alignItems: 'start' }}>

          {/* Left column */}
          <div>
            {/* Price + duration highlight */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
              <div style={{ background: 'white', borderRadius: 14, padding: '18px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', flex: '1 1 140px' }}>
                <div style={{ fontSize: 11, color: 'var(--texto-medio)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>PRECIO POR PERSONA</div>
                <div style={{ fontFamily: 'var(--font-titulo)', fontSize: 30, fontWeight: 800, color: 'var(--cafe-medio)', lineHeight: 1 }}>
                  ${Number(exp.precio_cop).toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--texto-medio)', marginTop: 4 }}>COP</div>
              </div>
              <div style={{ background: 'white', borderRadius: 14, padding: '18px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', flex: '1 1 120px' }}>
                <div style={{ fontSize: 11, color: 'var(--texto-medio)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>DURACIÓN</div>
                <div style={{ fontFamily: 'var(--font-titulo)', fontSize: 30, fontWeight: 800, color: 'var(--verde-sierra)', lineHeight: 1 }}>
                  {exp.duracion_horas}h
                </div>
                <div style={{ fontSize: 11, color: 'var(--texto-medio)', marginTop: 4 }}>horas aprox.</div>
              </div>
              {exp.cupo_maximo && (
                <div style={{ background: 'white', borderRadius: 14, padding: '18px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', flex: '1 1 120px' }}>
                  <div style={{ fontSize: 11, color: 'var(--texto-medio)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>CUPO MÁXIMO</div>
                  <div style={{ fontFamily: 'var(--font-titulo)', fontSize: 30, fontWeight: 800, color: 'var(--azul-caribe)', lineHeight: 1 }}>
                    {exp.cupo_maximo}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--texto-medio)', marginTop: 4 }}>personas</div>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ background: 'white', borderRadius: 16, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: 20, color: 'var(--texto-oscuro)', marginBottom: 14 }}>Sobre esta experiencia</h2>
              <p style={{ color: 'var(--texto-medio)', lineHeight: 1.8, fontSize: 15 }}>{exp.descripcion}</p>
            </div>

            {/* Incluye */}
            {(exp.incluye?.length > 0 || exp.incluyeSeleccionado?.length > 0) && (
              <div style={{ background: 'white', borderRadius: 16, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: 20, color: 'var(--texto-oscuro)', marginBottom: 16 }}>¿Qué incluye?</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(exp.incluye || exp.incluyeSeleccionado || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--verde-pale)', borderRadius: 10 }}>
                      <span style={{ fontSize: 16 }}>{typeof item === 'string' && item.includes('🚌') ? '🚌' : typeof item === 'string' && item.includes('🍽') ? '🍽️' : '✅'}</span>
                      <span style={{ fontSize: 14, color: 'var(--verde-sierra)', fontWeight: 500 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mapa de la finca */}
            {exp.finca?.lat && (
              <div style={{ background: 'white', borderRadius: 16, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: 20, color: 'var(--texto-oscuro)', marginBottom: 6 }}>
                  Finca: {exp.finca.nombre}
                </h2>
                <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--texto-medio)' }}>
                  <span>📍 {exp.finca.vereda}</span>
                  {exp.finca.altitud && <span>⛰️ {exp.finca.altitud} msnm</span>}
                  {exp.finca.producto && <span>🌾 {exp.finca.producto}</span>}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(exp.finca.certificaciones || []).map(c => <CertBadge key={c} type={c} status="vigente" />)}
                  </div>
                </div>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid var(--verde-pale)' }}>
                  <MapContainer center={[exp.finca.lat, exp.finca.lng]} zoom={13} style={{ height: 220, zIndex: 1 }} scrollWheelZoom={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                    <MapResizer />
                    <Marker position={[exp.finca.lat, exp.finca.lng]} icon={farmIcon}>
                      <Popup>
                        <strong>{exp.finca.nombre}</strong><br />
                        📍 {exp.finca.vereda}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* Right sticky column */}
          <div style={{ position: 'sticky', top: 80 }}>
            {/* CTA card */}
            <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-titulo)', fontSize: 28, fontWeight: 800, color: 'var(--cafe-medio)', marginBottom: 4 }}>
                ${Number(exp.precio_cop).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--texto-medio)', marginBottom: 20 }}>COP por persona · {exp.duracion_horas} horas</div>

              <button
                onClick={() => isLoggedIn ? alert('Funcionalidad de reservas en desarrollo') : navigate('/login')}
                className="btn-secondary"
                style={{ width: '100%', padding: '16px', fontSize: 16, marginBottom: 10 }}
              >
                {isLoggedIn ? '🎟️ Reservar ahora' : '🔑 Iniciar sesión para reservar'}
              </button>
              <p style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.5 }}>
                Cupo máximo: {exp.cupo_maximo || '—'} personas<br />
                Cancelación gratuita 48h antes
              </p>
            </div>

            {/* Operador info */}
            {exp.operador && (
              <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-titulo)', fontSize: 15, color: 'var(--texto-oscuro)', marginBottom: 12 }}>Operador turístico</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--verde-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏕️</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--texto-oscuro)' }}>{exp.operador.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--texto-medio)' }}>{exp.operador.tipo} · {exp.operador.ciudad}</div>
                  </div>
                </div>
              </div>
            )}

            {/* QR compartir */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-titulo)', fontSize: 14, color: 'var(--texto-oscuro)', marginBottom: 12 }}>Compartir experiencia</h3>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px', background: 'var(--crema)', borderRadius: 10, marginBottom: 12 }}>
                <QRCodeSVG value={pageUrl} size={120} bgColor="transparent" fgColor="var(--cafe-oscuro)" />
              </div>
              <button onClick={() => { navigator.clipboard?.writeText(pageUrl); alert('Enlace copiado') }} style={{ width: '100%', background: 'var(--gris-claro)', color: 'var(--texto-medio)', border: 'none', borderRadius: 8, padding: '8px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)' }}>
                📋 Copiar enlace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer minimal */}
      <footer style={{ background: 'var(--cafe-oscuro)', padding: '28px clamp(16px, 4vw, 48px)', marginTop: 48 }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LeafIcon size={18} color="#D4A04A" />
            <span style={{ fontFamily: 'var(--font-titulo)', color: '#D4A04A', fontSize: 14 }}>MagdalenaTrace</span>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            <Link to="/mapa" style={{ color: 'rgba(255,255,255,0.5)' }}>Mapa de fincas</Link>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.5)' }}>Inicio</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
