import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { QRCodeSVG } from 'qrcode.react'
import api from '../../api/client'
import CertBadge from '../../components/ui/CertBadge'
import AlertMessage from '../../components/ui/AlertMessage'
import { FINCAS_DEMO, EXPERIENCIAS_DEMO } from '../../data/seed'

// ── Icons ──────────────────────────────────────────────────────────

function LeafIcon({ size = 22, color = '#D4A04A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3C11 6.5 6 11 6 16.5C6 20.6 9.6 24 14 24C18.4 24 22 20.6 22 16.5C22 11 17 6.5 14 3Z" fill={color} />
      <path d="M14 11V24" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Leaflet DivIcons (sin dependencia de PNGs) ─────────────────────
const farmMarker = new L.DivIcon({
  className: '',
  html: '<div style="background:#2D6A4F;color:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">🌿</div>',
  iconSize: [26, 26], iconAnchor: [13, 13],
})
const farmMarkerSel = new L.DivIcon({
  className: '',
  html: '<div style="background:#D4A04A;color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:13px;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.4);">✓</div>',
  iconSize: [30, 30], iconAnchor: [15, 15],
})

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map])
  return null
}

// ── Demo data ──────────────────────────────────────────────────────

const RESERVAS_DEMO = [
  { id: 1, turista: 'John Smith',   experiencia: 'Tour del café en la Sierra Nevada', fecha: '2026-06-15', personas: 2, estado: 'confirmada' },
  { id: 2, turista: 'Ana García',   experiencia: 'Tour del café en la Sierra Nevada', fecha: '2026-06-22', personas: 1, estado: 'pendiente' },
  { id: 3, turista: 'Lukas Weber',  experiencia: 'Chocolatería artesanal en Palmor',   fecha: '2026-07-01', personas: 4, estado: 'pendiente' },
  { id: 4, turista: 'María López',  experiencia: 'Tour del café en la Sierra Nevada', fecha: '2026-07-05', personas: 2, estado: 'cancelada' },
]

const TIPOS_SERVICIO = ['Agroturismo', 'Ecoturismo', 'Finca-hotel', 'Tours guiados', 'Experiencia gastronómica']
const INCLUYE_OPTS = ['Transporte', 'Alimentación', 'Kit del producto', 'Guía certificado']

const FORM_INICIAL = {
  titulo: '', descripcion: '', tipo_servicio: '', precio_cop: '',
  duracion_horas: '', cupo_maximo: '', finca_id: '', finca_nombre: '',
}

// ── NavItem (sidebar) ──────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', border: 'none',
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 18px',
      color: active ? '#D4A04A' : 'rgba(255,255,255,0.65)',
      fontSize: 14, fontWeight: active ? 600 : 400,
      cursor: 'pointer', fontFamily: 'var(--font-cuerpo)',
      borderRadius: 8,
      background: active ? 'rgba(212,160,74,0.12)' : 'transparent',
      transition: 'all 0.2s',
      borderLeft: `3px solid ${active ? '#D4A04A' : 'transparent'}`,
      textAlign: 'left', marginBottom: 2,
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' } }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

// ── KpiCard ────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, accent }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '22px 20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      flex: '1 1 180px', minWidth: 150,
      borderTop: `4px solid ${accent}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)' }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 }}>
        {icon}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: accent, lineHeight: 1, fontFamily: 'var(--font-titulo)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--texto-medio)', marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

// ── QR Modal ───────────────────────────────────────────────────────

function QRModal({ exp, onClose }) {
  const url = `${window.location.origin}/experiencia/${exp.id}`
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 18, padding: '32px 28px', maxWidth: 320, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.28)', animation: 'slideUp 0.3s ease' }}>
        <div style={{ fontFamily: 'var(--font-titulo)', fontSize: 18, color: 'var(--texto-oscuro)', marginBottom: 8 }}>{exp.titulo}</div>
        <p style={{ fontSize: 12, color: 'var(--texto-medio)', marginBottom: 20 }}>Escanea para ver la experiencia pública</p>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 12, background: 'var(--crema)', borderRadius: 12, marginBottom: 16 }}>
          <QRCodeSVG value={url} size={180} bgColor="transparent" fgColor="var(--cafe-oscuro)" />
        </div>
        <p style={{ fontSize: 11, color: '#9CA3AF', wordBreak: 'break-all', marginBottom: 20 }}>{url}</p>
        <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '10px' }}>Cerrar</button>
      </div>
    </div>
  )
}

// ── Nueva Experiencia Modal ────────────────────────────────────────

function NuevaExperienciaModal({ onClose, onSave }) {
  const [form, setForm] = useState(FORM_INICIAL)
  const [incluyeSeleccionado, setIncluyeSeleccionado] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const toggleIncluye = s => setIncluyeSeleccionado(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  const INPUT_S = { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontFamily: 'var(--font-cuerpo)', fontSize: 13, outline: 'none', background: 'white' }
  const LABEL_S = { fontSize: 11, fontWeight: 600, color: 'var(--texto-oscuro)', display: 'block', marginBottom: 4, letterSpacing: 0.2 }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.finca_id) { setError('Selecciona una finca en el mapa'); return }
    setError('')
    setSaving(true)
    try {
      await api.post('/operadores/experiencias', {
        productor_id: Number(form.finca_id),
        titulo: form.titulo, descripcion: form.descripcion,
        precio_cop: Number(form.precio_cop), duracion_horas: Number(form.duracion_horas),
        tipo_servicio: form.tipo_servicio, cupo_maximo: Number(form.cupo_maximo) || 10,
        incluye: incluyeSeleccionado.join(','), disponible: true,
      })
      onSave({ ...form, incluyeSeleccionado, id: Date.now(), disponible: true })
    } catch {
      const nueva = { ...form, incluyeSeleccionado, id: Date.now(), disponible: true, pendiente_sync: true }
      const guardadas = JSON.parse(localStorage.getItem('experiencias_demo') || '[]')
      localStorage.setItem('experiencias_demo', JSON.stringify([...guardadas, nueva]))
      onSave(nueva)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '20px 16px', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 18, padding: '28px 26px', width: '100%', maxWidth: 560, boxShadow: '0 24px 64px rgba(0,0,0,0.28)', fontFamily: 'var(--font-cuerpo)', animation: 'slideUp 0.3s ease', marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-titulo)', fontSize: 20, color: 'var(--texto-oscuro)' }}>Nueva experiencia turística</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={LABEL_S}>TÍTULO *</label>
            <input required value={form.titulo} onChange={f('titulo')} placeholder="Ej: Tour del café en Minca" style={INPUT_S} />
          </div>
          <div>
            <label style={LABEL_S}>DESCRIPCIÓN *</label>
            <textarea required value={form.descripcion} onChange={f('descripcion')} rows={3}
              placeholder="Describe la experiencia, qué verán y aprenderán…"
              style={{ ...INPUT_S, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL_S}>TIPO DE SERVICIO *</label>
              <select required value={form.tipo_servicio} onChange={f('tipo_servicio')} style={{ ...INPUT_S, cursor: 'pointer' }}>
                <option value="">Selecciona…</option>
                {TIPOS_SERVICIO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL_S}>CUPO MÁXIMO</label>
              <input type="number" min={1} max={50} value={form.cupo_maximo} onChange={f('cupo_maximo')} placeholder="Ej: 8" style={INPUT_S} />
            </div>
            <div>
              <label style={LABEL_S}>PRECIO COP / PERSONA *</label>
              <input type="number" required min={0} value={form.precio_cop} onChange={f('precio_cop')} placeholder="Ej: 85000" style={INPUT_S} />
            </div>
            <div>
              <label style={LABEL_S}>DURACIÓN (HORAS) *</label>
              <input type="number" required min={0.5} step={0.5} value={form.duracion_horas} onChange={f('duracion_horas')} placeholder="Ej: 4" style={INPUT_S} />
            </div>
          </div>

          {/* Incluye checkboxes */}
          <div>
            <label style={{ ...LABEL_S, marginBottom: 8 }}>¿QUÉ INCLUYE?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {INCLUYE_OPTS.map(s => {
                const sel = incluyeSeleccionado.includes(s)
                return (
                  <button key={s} type="button" onClick={() => toggleIncluye(s)} style={{
                    padding: '5px 11px', borderRadius: 20,
                    border: `1.5px solid ${sel ? 'var(--verde-sierra)' : '#E5E7EB'}`,
                    background: sel ? 'var(--verde-pale)' : 'white',
                    color: sel ? 'var(--verde-sierra)' : '#6B7280',
                    fontSize: 11, fontWeight: sel ? 600 : 400,
                    cursor: 'pointer', fontFamily: 'var(--font-cuerpo)', transition: 'all 0.15s',
                  }}>
                    {sel ? '✓ ' : ''}{s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mini Leaflet map for farm selection */}
          <div>
            <label style={{ ...LABEL_S, marginBottom: 8 }}>
              FINCA A VINCULAR *
              {form.finca_nombre && <span style={{ fontWeight: 400, color: 'var(--verde-sierra)', marginLeft: 6 }}>✓ {form.finca_nombre}</span>}
            </label>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>Haz clic en un marcador para seleccionar la finca</p>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: `2px solid ${form.finca_id ? 'var(--verde-sierra)' : '#E5E7EB'}` }}>
              <MapContainer center={[10.9, -74.0]} zoom={8} style={{ height: 210, zIndex: 1 }} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                <MapResizer />
                {FINCAS_DEMO.map(fi => (
                  <Marker key={fi.id} position={[fi.lat, fi.lng]}
                    icon={form.finca_id === fi.id ? farmMarkerSel : farmMarker}
                    eventHandlers={{ click: () => setForm(p => ({ ...p, finca_id: fi.id, finca_nombre: fi.finca })) }}
                  >
                    <Popup>
                      <strong>{fi.finca}</strong><br />
                      📍 {fi.vereda} · {fi.productos}<br />
                      ⛰️ {fi.altitud} msnm
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {error && <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>⚠️ {error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: '#F3F4F6', color: 'var(--texto-medio)', border: 'none', borderRadius: 8, padding: 12, fontFamily: 'var(--font-cuerpo)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 2, padding: 12, fontSize: 14 }}>
              {saving ? '⏳ Guardando…' : '✅ Guardar experiencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Experience Card ────────────────────────────────────────────────

const SERVICE_COLORS = {
  'Agroturismo':              { bg: '#D1FAE5', color: '#065F46' },
  'Ecoturismo':               { bg: 'var(--verde-pale)', color: 'var(--verde-sierra)' },
  'Finca-hotel':              { bg: '#FEF3C7', color: '#92400E' },
  'Tours guiados':            { bg: '#E0F2FE', color: '#0369A1' },
  'Experiencia gastronómica': { bg: '#FEE2E2', color: '#991B1B' },
}

function ExperienciaCard({ exp, onToggle, onQR, onReservas }) {
  const sc = SERVICE_COLORS[exp.tipo_servicio] || SERVICE_COLORS['Agroturismo']
  return (
    <div style={{
      background: 'white', borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 4px 18px rgba(0,0,0,0.07)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      opacity: exp.disponible ? 1 : 0.65,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.12)' }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.07)' }}
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--verde-sierra), #1a3525)', padding: '20px 20px 16px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ fontFamily: 'var(--font-titulo)', color: 'white', fontSize: 16, lineHeight: 1.3, marginRight: 8 }}>{exp.titulo}</h3>
          {/* Toggle */}
          <button onClick={() => onToggle(exp)} title={exp.disponible ? 'Desactivar' : 'Activar'} style={{
            width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: exp.disponible ? '#D4A04A' : 'rgba(255,255,255,0.2)',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute', top: 2, left: exp.disponible ? 18 : 2,
              width: 16, height: 16, borderRadius: '50%', background: 'white',
              transition: 'left 0.2s', display: 'block',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          {exp.tipo_servicio && (
            <span style={{ ...sc, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
              {exp.tipo_servicio}
            </span>
          )}
          {exp.pendiente_sync && (
            <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
              ⏳ Pendiente sync
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>
        {exp.finca_nombre && (
          <p style={{ fontSize: 12, color: 'var(--verde-sierra)', fontWeight: 500, marginBottom: 10 }}>
            📍 {exp.finca_nombre || exp.finca}
          </p>
        )}
        <p style={{ fontSize: 12, color: 'var(--texto-medio)', marginBottom: 14, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {exp.descripcion}
        </p>
        <div style={{ display: 'flex', gap: 12, fontSize: 13, marginBottom: 16 }}>
          <span><strong style={{ color: 'var(--cafe-medio)', fontFamily: 'var(--font-titulo)', fontSize: 15 }}>${Number(exp.precio_cop).toLocaleString()}</strong>/persona</span>
          <span style={{ color: 'var(--texto-medio)' }}>⏱️ {exp.duracion_horas}h</span>
          {exp.cupo_maximo && <span style={{ color: 'var(--texto-medio)' }}>👥 {exp.cupo_maximo} máx.</span>}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onReservas(exp)} style={{ flex: 1, background: 'var(--verde-pale)', color: 'var(--verde-sierra)', border: 'none', borderRadius: 7, padding: '7px 6px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)', transition: 'all 0.15s' }}>
            📋 Reservas
          </button>
          <button onClick={() => onQR(exp)} style={{ flex: 1, background: '#E0F2FE', color: '#0369A1', border: 'none', borderRadius: 7, padding: '7px 6px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)', transition: 'all 0.15s' }}>
            📱 Ver QR
          </button>
          <Link to={`/experiencia/${exp.id}`} target="_blank" style={{ flex: 1 }}>
            <button style={{ width: '100%', background: 'var(--gris-claro)', color: 'var(--texto-medio)', border: 'none', borderRadius: 7, padding: '7px 6px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)' }}>
              🌐 Público
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────

export default function OperadorDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [tab, setTab] = useState('dashboard')
  const [perfil, setPerfil] = useState(null)
  const [experiencias, setExperiencias] = useState([])
  const [fincasVinculadas, setFincasVinculadas] = useState([])
  const [reservas, setReservas] = useState(RESERVAS_DEMO)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [showNueva, setShowNueva] = useState(false)
  const [showQR, setShowQR] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [showFincaMap, setShowFincaMap] = useState(false)

  useEffect(() => {
    const handler = () => { const m = window.innerWidth < 768; setIsMobile(m); if (!m) setSidebarOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const { data } = await api.get('/operadores/yo')
      setPerfil(data)
      setExperiencias(data.experiencias || [])
    } catch {
      const guardadas = JSON.parse(localStorage.getItem('experiencias_demo') || '[]')
      setPerfil({
        nombre: user.nombre || 'Ana Torres',
        empresa: 'Sierra Aventura Tours',
        ciudad: 'Santa Marta',
        tipo_operador: 'Agencia de turismo',
        servicios: 'Agroturismo, Ecoturismo',
      })
      setExperiencias([
        { id: 1, titulo: 'Tour del café en la Sierra Nevada', descripcion: 'Visita a la finca El Paraíso en Minca.', tipo_servicio: 'Agroturismo', precio_cop: 85000, duracion_horas: 4, cupo_maximo: 8, finca_nombre: 'El Paraíso', disponible: true },
        { id: 2, titulo: 'Chocolatería artesanal en Palmor',   descripcion: 'Cacao fino de aroma en la finca El Edén.', tipo_servicio: 'Experiencia gastronómica', precio_cop: 95000, duracion_horas: 5, cupo_maximo: 10, finca_nombre: 'El Edén', disponible: true },
        ...guardadas,
      ])
      const fv = JSON.parse(localStorage.getItem('fincas_vinculadas') || '[]')
      setFincasVinculadas(fv.length ? fv : [FINCAS_DEMO[0], FINCAS_DEMO[2]])
    }
  }, [user.nombre])

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    fetchData()
  }, [navigate, fetchData])

  function logout() { localStorage.clear(); navigate('/') }

  function flash(text, type = 'success') {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 4000)
  }

  function handleNuevaSave(nueva) {
    setExperiencias(prev => [...prev, nueva])
    setShowNueva(false)
    flash('Experiencia creada exitosamente' + (nueva.pendiente_sync ? ' (guardada localmente)' : ''))
  }

  async function handleToggle(exp) {
    const nuevo = !exp.disponible
    try {
      await api.patch(`/operadores/experiencias/${exp.id}`, { disponible: nuevo })
    } catch { /* actualizar localmente igual */ }
    setExperiencias(prev => prev.map(e => e.id === exp.id ? { ...e, disponible: nuevo } : e))
    flash(`Experiencia ${nuevo ? 'activada' : 'desactivada'}`)
  }

  function handleConfirmarReserva(id) {
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'confirmada' } : r))
    flash('Reserva confirmada')
  }
  function handleCancelarReserva(id) {
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r))
    flash('Reserva cancelada', 'warning')
  }

  function vincularFinca(finca) {
    if (fincasVinculadas.find(f => f.id === finca.id)) return
    const nuevas = [...fincasVinculadas, finca]
    setFincasVinculadas(nuevas)
    localStorage.setItem('fincas_vinculadas', JSON.stringify(nuevas))
    flash(`Finca "${finca.finca}" vinculada exitosamente`)
    setShowFincaMap(false)
  }

  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const expActivas     = experiencias.filter(e => e.disponible).length
  const reservasMes    = reservas.filter(r => r.estado !== 'cancelada').length
  const visitantesTotal = reservas.reduce((a, r) => a + (r.estado !== 'cancelada' ? r.personas : 0), 0)

  // ── Sidebar ────────────────────────────────────────────────────

  const sidebar = (
    <nav className={`dashboard-sidebar${sidebarOpen ? ' open' : ''}`}>
      <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LeafIcon size={22} color="#D4A04A" />
          <span style={{ fontFamily: 'var(--font-titulo)', fontSize: 15, fontWeight: 700, color: '#D4A04A' }}>MagdalenaTrace</span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Portal Operador Turístico</div>
      </div>

      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--azul-caribe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 6 }}>
          {perfil?.nombre?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{perfil?.nombre || user.nombre || 'Operador'}</div>
        <div style={{ fontSize: 11, color: '#D4A04A', marginTop: 1 }}>{perfil?.tipo_operador || 'Operador turístico'}</div>
      </div>

      <div style={{ padding: '12px 10px', flex: 1 }}>
        <NavItem icon="📊" label="Dashboard"        active={tab === 'dashboard'}   onClick={() => { setTab('dashboard');   setSidebarOpen(false) }} />
        <NavItem icon="🏕️" label="Mis experiencias" active={tab === 'experiencias'} onClick={() => { setTab('experiencias'); setSidebarOpen(false) }} />
        <NavItem icon="🌿" label="Fincas vinculadas" active={tab === 'fincas'}       onClick={() => { setTab('fincas');       setSidebarOpen(false) }} />
        <NavItem icon="📅" label="Reservas"          active={tab === 'reservas'}     onClick={() => { setTab('reservas');     setSidebarOpen(false) }} />
        <div style={{ margin: '10px 0', height: 1, background: 'rgba(255,255,255,0.07)' }} />
        <Link to="/chatbot" style={{ textDecoration: 'none' }}>
          <NavItem icon="🤖" label="Chatbot IA" active={false} onClick={() => {}} />
        </Link>
      </div>

      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <NavItem icon="🚪" label="Cerrar sesión" active={false} onClick={logout} />
      </div>
    </nav>
  )

  // ── Tab contents ──────────────────────────────────────────────

  const tabDashboard = (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-titulo)', fontSize: 24, color: 'var(--texto-oscuro)', marginBottom: 4 }}>
          Bienvenido, {perfil?.nombre?.split(' ')[0] || user.nombre?.split(' ')[0] || 'operador'} 👋
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--texto-medio)' }}>{today}</p>
          {perfil?.tipo_operador && (
            <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20 }}>
              {perfil.tipo_operador}
            </span>
          )}
        </div>
      </div>

      {msg.text && <div style={{ marginBottom: 18 }}><AlertMessage type={msg.type || 'success'} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} /></div>}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <KpiCard icon="🧭" label="Experiencias activas"  value={expActivas}        accent="var(--verde-medio)" />
        <KpiCard icon="📅" label="Reservas este mes"     value={reservasMes}       accent="var(--dorado)" />
        <KpiCard icon="📍" label="Fincas vinculadas"     value={fincasVinculadas.length} accent="var(--cafe-medio)" />
        <KpiCard icon="👥" label="Visitantes totales"    value={visitantesTotal}   accent="var(--azul-caribe)" />
      </div>

      {/* Preview de experiencias */}
      <div style={{ background: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: 17, color: 'var(--texto-oscuro)' }}>Experiencias activas</h2>
          <button onClick={() => setTab('experiencias')} style={{ background: 'none', border: 'none', color: 'var(--verde-sierra)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)' }}>Ver todas →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {experiencias.filter(e => e.disponible).slice(0, 3).map(exp => (
            <div key={exp.id} style={{ background: 'var(--gris-claro)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontFamily: 'var(--font-titulo)', fontSize: 14, color: 'var(--texto-oscuro)', marginBottom: 4 }}>{exp.titulo}</div>
              <div style={{ fontSize: 12, color: 'var(--verde-sierra)', fontWeight: 600 }}>${Number(exp.precio_cop).toLocaleString()} · {exp.duracion_horas}h</div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximas reservas */}
      <div style={{ background: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: 17, color: 'var(--texto-oscuro)' }}>Reservas pendientes</h2>
          <button onClick={() => setTab('reservas')} style={{ background: 'none', border: 'none', color: 'var(--verde-sierra)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)' }}>Ver todas →</button>
        </div>
        {reservas.filter(r => r.estado === 'pendiente').slice(0, 3).map(r => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gris-claro)', fontSize: 13 }}>
            <div>
              <span style={{ fontWeight: 600 }}>{r.turista}</span>
              <span style={{ color: 'var(--texto-medio)', marginLeft: 6 }}>· {r.personas} persona{r.personas > 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => handleConfirmarReserva(r.id)} style={{ background: 'var(--verde-pale)', color: 'var(--verde-sierra)', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)' }}>✓ Confirmar</button>
              <button onClick={() => handleCancelarReserva(r.id)} style={{ background: '#FEF2F2', color: '#991B1B', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)' }}>✕ Cancelar</button>
            </div>
          </div>
        ))}
        {reservas.filter(r => r.estado === 'pendiente').length === 0 && (
          <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>No hay reservas pendientes</p>
        )}
      </div>
    </>
  )

  const tabExperiencias = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-titulo)', fontSize: 24, color: 'var(--texto-oscuro)', marginBottom: 4 }}>Mis experiencias</h1>
          <p style={{ fontSize: 13, color: 'var(--texto-medio)' }}>{experiencias.length} experiencias creadas · {expActivas} activas</p>
        </div>
        <button onClick={() => setShowNueva(true)} className="btn-secondary" style={{ padding: '12px 22px', fontSize: 14 }}>
          + Nueva experiencia
        </button>
      </div>

      {msg.text && <div style={{ marginBottom: 18 }}><AlertMessage type={msg.type || 'success'} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} /></div>}

      {experiencias.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 14, padding: 48, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🏕️</div>
          <p style={{ color: 'var(--texto-medio)', fontSize: 15, marginBottom: 16 }}>No tienes experiencias creadas todavía</p>
          <button onClick={() => setShowNueva(true)} className="btn-secondary" style={{ padding: '12px 28px' }}>Crear primera experiencia</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {experiencias.map(exp => (
            <ExperienciaCard key={exp.id} exp={exp}
              onToggle={handleToggle}
              onQR={e => setShowQR(e)}
              onReservas={() => setTab('reservas')} />
          ))}
        </div>
      )}
    </>
  )

  const tabFincas = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-titulo)', fontSize: 24, color: 'var(--texto-oscuro)', marginBottom: 4 }}>Fincas vinculadas</h1>
          <p style={{ fontSize: 13, color: 'var(--texto-medio)' }}>{fincasVinculadas.length} fincas activas</p>
        </div>
        <button onClick={() => setShowFincaMap(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
          + Vincular nueva finca
        </button>
      </div>

      {msg.text && <div style={{ marginBottom: 18 }}><AlertMessage type={msg.type || 'success'} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} /></div>}

      {fincasVinculadas.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 14, padding: 40, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🌿</div>
          <p style={{ color: 'var(--texto-medio)', fontSize: 15, marginBottom: 16 }}>No tienes fincas vinculadas todavía</p>
          <button onClick={() => setShowFincaMap(true)} className="btn-primary" style={{ padding: '10px 20px' }}>Explorar fincas</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {fincasVinculadas.map(f => (
            <div key={f.id} style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: '4px solid var(--verde-sierra)' }}>
              <div style={{ fontFamily: 'var(--font-titulo)', fontSize: 16, color: 'var(--texto-oscuro)', marginBottom: 6 }}>{f.finca}</div>
              <p style={{ fontSize: 12, color: 'var(--texto-medio)', marginBottom: 10 }}>📍 {f.vereda} · ⛰️ {f.altitud} msnm</p>
              <p style={{ fontSize: 12, color: 'var(--texto-medio)', marginBottom: 10 }}>🌾 {f.productos}</p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {f.certificaciones.map(c => <CertBadge key={c} type={c} status="vigente" />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mapa para vincular nuevas fincas */}
      {showFincaMap && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={e => e.target === e.currentTarget && setShowFincaMap(false)}>
          <div style={{ background: 'white', borderRadius: 18, padding: '28px 26px', width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.28)', animation: 'slideUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-titulo)', fontSize: 18 }}>Vincular finca</h3>
              <button onClick={() => setShowFincaMap(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--texto-medio)', marginBottom: 14 }}>Haz clic en un marcador para vincular esa finca a tu operación</p>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '2px solid var(--verde-pale)', marginBottom: 16 }}>
              <MapContainer center={[10.9, -74.0]} zoom={8} style={{ height: 260, zIndex: 1 }} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                <MapResizer />
                {FINCAS_DEMO.map(fi => {
                  const yaVinculada = fincasVinculadas.find(f => f.id === fi.id)
                  return (
                    <Marker key={fi.id} position={[fi.lat, fi.lng]}
                      icon={yaVinculada ? farmMarkerSel : farmMarker}
                      eventHandlers={{ click: () => !yaVinculada && vincularFinca(fi) }}>
                      <Popup>
                        <strong>{fi.finca}</strong> — {fi.vereda}<br />
                        {yaVinculada ? '✓ Ya vinculada' : <span style={{ cursor: 'pointer', color: '#2D6A4F' }}>Click para vincular</span>}
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            </div>
            <button onClick={() => setShowFincaMap(false)} style={{ width: '100%', padding: '10px', background: 'var(--gris-claro)', color: 'var(--texto-medio)', border: 'none', borderRadius: 8, fontFamily: 'var(--font-cuerpo)', fontWeight: 600, cursor: 'pointer' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )

  const ESTADO_COLORS = {
    pendiente:  { bg: '#FFFBEB', color: '#92400E' },
    confirmada: { bg: '#D1FAE5', color: '#065F46' },
    cancelada:  { bg: '#FEF2F2', color: '#991B1B' },
  }

  const tabReservas = (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-titulo)', fontSize: 24, color: 'var(--texto-oscuro)', marginBottom: 4 }}>Reservas recibidas</h1>
        <p style={{ fontSize: 13, color: 'var(--texto-medio)' }}>{reservas.length} reservas · {reservas.filter(r => r.estado === 'pendiente').length} pendientes</p>
      </div>

      {msg.text && <div style={{ marginBottom: 18 }}><AlertMessage type={msg.type || 'success'} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} /></div>}

      <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-cuerpo)' }}>
            <thead>
              <tr style={{ background: 'var(--verde-sierra)', color: 'white' }}>
                {['Turista', 'Experiencia', 'Fecha', 'Personas', 'Estado', 'Acciones'].map(c => (
                  <th key={c} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservas.map((r, i) => {
                const sc = ESTADO_COLORS[r.estado] || ESTADO_COLORS.pendiente
                return (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? 'white' : 'var(--gris-claro)' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>{r.turista}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--texto-medio)', maxWidth: 200 }}>{r.experiencia}</td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>{r.fecha}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'center' }}>{r.personas}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ ...sc, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{r.estado}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      {r.estado === 'pendiente' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleConfirmarReserva(r.id)} style={{ background: 'var(--verde-pale)', color: 'var(--verde-sierra)', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)' }}>✓ Confirmar</button>
                          <button onClick={() => handleCancelarReserva(r.id)} style={{ background: '#FEF2F2', color: '#991B1B', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)' }}>✕ Cancelar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  // ── Render ────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-cuerpo)' }}>
      {sidebar}

      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)} />
      )}

      <main className="dashboard-main" style={{ marginLeft: isMobile ? 0 : 240 }}>
        {isMobile && (
          <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'var(--cafe-oscuro)', height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#D4A04A', fontSize: 22, cursor: 'pointer' }}>☰</button>
            <span style={{ fontFamily: 'var(--font-titulo)', color: '#D4A04A', fontSize: 16, fontWeight: 700 }}>MagdalenaTrace</span>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)' }}>Salir</button>
          </div>
        )}

        <div style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
          {tab === 'dashboard'    && tabDashboard}
          {tab === 'experiencias' && tabExperiencias}
          {tab === 'fincas'       && tabFincas}
          {tab === 'reservas'     && tabReservas}
        </div>
      </main>

      {showNueva && <NuevaExperienciaModal onClose={() => setShowNueva(false)} onSave={handleNuevaSave} />}
      {showQR    && <QRModal exp={showQR} onClose={() => setShowQR(null)} />}
    </div>
  )
}
