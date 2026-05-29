import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/client'
import CertBadge from '../../components/ui/CertBadge'
import LoteProgressBar from '../../components/ui/LoteProgressBar'
import AlertMessage from '../../components/ui/AlertMessage'
import { LOTES_DEMO } from '../../data/seed'

// ── Logo ──────────────────────────────────────────────────────────

function LeafIcon({ size = 22, color = '#D4A04A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3C11 6.5 6 11 6 16.5C6 20.6 9.6 24 14 24C18.4 24 22 20.6 22 16.5C22 11 17 6.5 14 3Z" fill={color} />
      <path d="M14 11V24" stroke="#2D6A4F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Sidebar nav item ──────────────────────────────────────────────

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', border: 'none',
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 18px',
      color: active ? '#D4A04A' : 'rgba(255,255,255,0.65)',
      fontSize: 14, fontWeight: active ? 600 : 400,
      cursor: 'pointer',
      fontFamily: 'var(--font-cuerpo)',
      borderRadius: 8,
      background: active ? 'rgba(212,160,74,0.12)' : 'transparent',
      transition: 'all 0.2s',
      borderLeft: `3px solid ${active ? '#D4A04A' : 'transparent'}`,
      textAlign: 'left',
      marginBottom: 2,
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' } }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

// ── KPI card ──────────────────────────────────────────────────────

function KpiCard({ label, value, icon, accent }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 14,
      padding: '22px 20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      flex: '1 1 180px', minWidth: 150,
      borderTop: `4px solid ${accent}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)' }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: `${accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, marginBottom: 12,
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: 30, fontWeight: 800,
        color: accent, lineHeight: 1,
        fontFamily: 'var(--font-titulo)',
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--texto-medio)', marginTop: 6, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  )
}

// ── Order modal ───────────────────────────────────────────────────

function OrdenModal({ lote, onClose, onSuccess }) {
  const [form, setForm] = useState({
    volumen_kg: lote?.volumen_kg ?? lote?.kg ?? '',
    precio_acordado_kg: lote?.precio_kg ?? '',
    destino: '',
    notas: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/exportadores/ordenes', {
        lote_id: lote.id,
        volumen_kg: Number(form.volumen_kg),
        precio_acordado_kg: Number(form.precio_acordado_kg),
        destino: form.destino,
        notas: form.notas || undefined,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la orden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
      animation: 'fadeIn 0.2s ease',
    }}
    onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white', borderRadius: 18, padding: '32px 28px',
        width: '100%', maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
        fontFamily: 'var(--font-cuerpo)',
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-titulo)', color: 'var(--texto-oscuro)', fontSize: 20 }}>
            Nueva orden de compra
          </h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20,
            cursor: 'pointer', color: '#9CA3AF', lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>

        <div style={{
          background: 'var(--verde-pale)', borderRadius: 10,
          padding: '12px 16px', marginBottom: 22,
          fontSize: 13, color: 'var(--verde-sierra)',
          border: '1px solid rgba(45,106,79,0.15)',
        }}>
          <strong>{lote?.producto}</strong> · {lote?.variedad} · {lote?.vereda}<br />
          Lote: <strong>{lote?.id}</strong> &nbsp;·&nbsp; Disponible: <strong>{(lote?.volumen_kg ?? lote?.kg)?.toLocaleString()} kg</strong>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Volumen a comprar (kg)',    key: 'volumen_kg',         type: 'number', placeholder: `Máx. ${lote?.volumen_kg ?? lote?.kg} kg` },
            { label: 'Precio acordado / kg (COP)',key: 'precio_acordado_kg', type: 'number', placeholder: 'Ej: 12.500' },
            { label: 'Destino de exportación',    key: 'destino',            type: 'text',   placeholder: 'Ej: Hamburgo, Alemania' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--texto-oscuro)', display: 'block', marginBottom: 5, letterSpacing: 0.2 }}>
                {label.toUpperCase()}
              </label>
              <input
                type={type} required value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontFamily: 'var(--font-cuerpo)', fontSize: 14, outline: 'none' }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--texto-oscuro)', display: 'block', marginBottom: 5, letterSpacing: 0.2 }}>
              NOTAS (OPCIONAL)
            </label>
            <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              rows={2} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 8, fontFamily: 'var(--font-cuerpo)', fontSize: 14, resize: 'vertical', outline: 'none' }} />
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, background: '#F3F4F6', color: 'var(--texto-medio)',
              border: 'none', borderRadius: 8, padding: 12,
              fontFamily: 'var(--font-cuerpo)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, padding: 12, fontSize: 14 }}>
              {loading ? '⏳ Procesando…' : '✅ Confirmar orden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────

const TD = { padding: '11px 14px', verticalAlign: 'middle', fontSize: 13 }
const TABS = ['dashboard', 'catalogo', 'ordenes']

export default function ExportadorDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [tab, setTab] = useState('dashboard')
  const [kpis, setKpis] = useState(null)
  const [lotes, setLotes] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [modal, setModal] = useState(null)
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [kpiRes, lotesRes, ordenesRes] = await Promise.all([
        api.get('/exportadores/dashboard'),
        api.get('/lotes/catalogo'),
        api.get('/exportadores/ordenes'),
      ])
      setKpis(kpiRes.data)
      setLotes(lotesRes.data)
      setOrdenes(ordenesRes.data)
    } catch {
      setLotes(LOTES_DEMO.map(l => ({
        id: l.id, producto: l.producto, variedad: l.variedad,
        volumen_kg: l.kg, precio_kg: l.precio_kg,
        vereda: l.vereda, altitud_msnm: null,
        ctes_completados: 2, ctes_total: 4,
        certificaciones: l.certs,
      })))
      setKpis({ lotes_disponibles: 5, ordenes_activas: 0, kg_en_transito: 0, certificaciones_fairtrade_activas: 2 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    fetchAll()
  }, [navigate, fetchAll])

  function logout() { localStorage.clear(); navigate('/') }

  async function handleOrdenSuccess() {
    setModal(null)
    setSuccess('Orden creada exitosamente. El lote fue reservado.')
    setTimeout(() => setSuccess(''), 5000)
    await fetchAll()
  }

  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  // ── Sidebar ────────────────────────────────────────────────────

  const sidebar = (
    <nav className={`dashboard-sidebar${sidebarOpen ? ' open' : ''}`}>
      {/* Logo */}
      <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LeafIcon size={22} color="#D4A04A" />
          <span style={{ fontFamily: 'var(--font-titulo)', fontSize: 15, fontWeight: 700, color: '#D4A04A' }}>
            MagdalenaTrace
          </span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4, letterSpacing: 0.2 }}>
          Portal Exportador
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--verde-sierra)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: 'white',
          marginBottom: 6,
        }}>
          {user.nombre?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
          {user.nombre || 'Exportador'}
        </div>
        <div style={{ fontSize: 11, color: '#D4A04A', marginTop: 1 }}>Cuenta activa</div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '12px 10px', flex: 1 }}>
        <NavItem icon="📊" label="Dashboard"   active={tab === 'dashboard'} onClick={() => { setTab('dashboard'); setSidebarOpen(false) }} />
        <NavItem icon="📦" label="Catálogo"    active={tab === 'catalogo'}  onClick={() => { setTab('catalogo');  setSidebarOpen(false) }} />
        <NavItem icon="📋" label="Mis órdenes" active={tab === 'ordenes'}   onClick={() => { setTab('ordenes');   setSidebarOpen(false) }} />
        <div style={{ margin: '10px 0', height: 1, background: 'rgba(255,255,255,0.07)' }} />
        <Link to="/chatbot" style={{ textDecoration: 'none' }}>
          <NavItem icon="🤖" label="Chatbot IA" active={false} onClick={() => {}} />
        </Link>
      </div>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <NavItem icon="🚪" label="Cerrar sesión" active={false} onClick={logout} />
      </div>
    </nav>
  )

  // ── Content tabs ──────────────────────────────────────────────

  const tabDashboard = (
    <>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{
          fontFamily: 'var(--font-titulo)',
          fontSize: 24, color: 'var(--texto-oscuro)', marginBottom: 4,
        }}>
          Buenos días, {user.nombre?.split(' ')[0] || 'exportador'} 👋
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texto-medio)' }}>{today}</p>
      </div>

      {success && (
        <div style={{ marginBottom: 18 }}>
          <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <KpiCard icon="📦" label="Lotes disponibles"          value={loading ? '…' : (kpis?.lotes_disponibles ?? 0)}                        accent="var(--verde-sierra)" />
        <KpiCard icon="📋" label="Órdenes activas"            value={loading ? '…' : (kpis?.ordenes_activas ?? 0)}                            accent="#D4A04A" />
        <KpiCard icon="🚢" label="Kg en tránsito"             value={loading ? '…' : (kpis?.kg_en_transito?.toLocaleString() ?? 0)}            accent="var(--azul-caribe)" />
        <KpiCard icon="🌱" label="Certs. Fairtrade activas"   value={loading ? '…' : (kpis?.certificaciones_fairtrade_activas ?? 0)}           accent="#27AE60" />
      </div>

      {/* Quick catalog preview */}
      <div style={{ background: 'white', borderRadius: 14, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-titulo)', fontSize: 17, color: 'var(--texto-oscuro)' }}>
            Lotes recientes
          </h2>
          <button onClick={() => setTab('catalogo')} style={{
            background: 'none', border: 'none', color: 'var(--verde-sierra)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-cuerpo)',
          }}>
            Ver todos →
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--verde-sierra)', color: 'white' }}>
                {['ID', 'Producto', 'Kg', 'Precio/kg', 'Certificaciones', 'Acción'].map(col => (
                  <th key={col} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'var(--font-cuerpo)' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Cargando…</td></tr>
              ) : lotes.slice(0, 3).map((l, i) => (
                <tr key={l.id} style={{ background: i % 2 === 0 ? 'white' : 'var(--gris-claro)' }}>
                  <td style={TD}><strong style={{ color: 'var(--verde-sierra)' }}>{l.id}</strong></td>
                  <td style={TD}>{l.producto}</td>
                  <td style={TD}><strong>{(l.volumen_kg ?? l.kg)?.toLocaleString()}</strong></td>
                  <td style={TD}><strong style={{ color: 'var(--cafe-medio)' }}>${l.precio_kg?.toLocaleString()}</strong></td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(l.certificaciones || []).map(c => <CertBadge key={c} type={c} status="vigente" />)}
                    </div>
                  </td>
                  <td style={TD}>
                    <button onClick={() => setModal(l)} className="btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}>
                      + Orden
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  const tabCatalogo = (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-titulo)', fontSize: 24, color: 'var(--texto-oscuro)', marginBottom: 4 }}>
          Catálogo de lotes
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texto-medio)' }}>
          {lotes.length} lotes disponibles para exportación
        </p>
      </div>

      {success && (
        <div style={{ marginBottom: 18 }}>
          <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--verde-sierra)', color: 'white' }}>
                {['ID', 'Producto', 'Variedad', 'Kg', 'Vereda', 'Altitud', 'Certificaciones', 'Precio/kg', 'Trazabilidad', 'Acción'].map(col => (
                  <th key={col} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'var(--font-cuerpo)' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>Cargando catálogo…</td></tr>
              ) : lotes.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>No hay lotes disponibles en este momento</td></tr>
              ) : lotes.map((l, i) => (
                <tr key={l.id}
                  style={{ background: i % 2 === 0 ? 'white' : 'var(--gris-claro)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--verde-pale)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : 'var(--gris-claro)'}
                >
                  <td style={TD}><strong style={{ color: 'var(--verde-sierra)' }}>{l.id}</strong></td>
                  <td style={TD}>{l.producto}</td>
                  <td style={TD}>{l.variedad || '—'}</td>
                  <td style={TD}><strong>{(l.volumen_kg ?? l.kg)?.toLocaleString()}</strong></td>
                  <td style={TD}>{l.vereda}</td>
                  <td style={TD}>{l.altitud_msnm ? `${l.altitud_msnm} m` : '—'}</td>
                  <td style={TD}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(l.certificaciones || []).map(c => <CertBadge key={c} type={c} status="vigente" />)}
                    </div>
                  </td>
                  <td style={TD}><strong style={{ color: 'var(--cafe-medio)' }}>${l.precio_kg?.toLocaleString()}</strong></td>
                  <td style={TD}>
                    {l.ctes_total && <LoteProgressBar completados={l.ctes_completados} total={l.ctes_total} />}
                  </td>
                  <td style={TD}>
                    <button onClick={() => setModal(l)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>
                      Crear orden
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  const tabOrdenes = (
    <>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-titulo)', fontSize: 24, color: 'var(--texto-oscuro)', marginBottom: 4 }}>
          Mis órdenes activas
        </h1>
        <p style={{ fontSize: 13, color: 'var(--texto-medio)' }}>
          {ordenes.length} {ordenes.length === 1 ? 'orden' : 'órdenes'} en seguimiento
        </p>
      </div>

      {ordenes.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 14, padding: 40,
          textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
          <p style={{ color: 'var(--texto-medio)', fontSize: 15, marginBottom: 16 }}>
            No tienes órdenes activas todavía
          </p>
          <button onClick={() => setTab('catalogo')} className="btn-primary" style={{ padding: '10px 24px' }}>
            Ir al catálogo
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {ordenes.map(o => (
            <div key={o.id} style={{
              background: 'white', borderRadius: 14, padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              borderLeft: '4px solid var(--verde-medio)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-titulo)', fontWeight: 700, fontSize: 15, color: 'var(--texto-oscuro)' }}>{o.lote_id}</div>
                  <div style={{ fontSize: 12, color: 'var(--texto-medio)', marginTop: 2 }}>
                    {o.producto}{o.variedad ? ` · ${o.variedad}` : ''}
                  </div>
                </div>
                <span style={{
                  background: o.estado_orden === 'pendiente' ? '#FFFBEB' : '#D1FAE5',
                  color:      o.estado_orden === 'pendiente' ? '#92400E' : '#065F46',
                  padding: '3px 10px', borderRadius: 12,
                  fontSize: 11, fontWeight: 600,
                }}>
                  {o.estado_orden}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, marginBottom: 14, color: 'var(--texto-medio)' }}>
                <div>🚢 <strong>{o.destino}</strong></div>
                <div>📦 <strong>{o.volumen_kg?.toLocaleString()} kg</strong></div>
                <div>💰 <strong>${o.precio_acordado_kg?.toLocaleString()}/kg</strong></div>
                <div>💵 <strong>${o.valor_total?.toLocaleString()}</strong></div>
              </div>
              <LoteProgressBar completados={o.ctes_completados} total={o.ctes_total} />
            </div>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font-cuerpo)' }}>
      {sidebar}

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 99,
        }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="dashboard-main" style={{ marginLeft: isMobile ? 0 : 240 }}>
        {/* Mobile top bar */}
        {isMobile && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'var(--cafe-oscuro)',
            height: 56, display: 'flex', alignItems: 'center',
            padding: '0 16px', justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{
              background: 'none', border: 'none',
              color: '#D4A04A', fontSize: 22, cursor: 'pointer',
            }}>☰</button>
            <span style={{ fontFamily: 'var(--font-titulo)', color: '#D4A04A', fontSize: 16, fontWeight: 700 }}>
              MagdalenaTrace
            </span>
            <button onClick={logout} style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.55)', fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--font-cuerpo)',
            }}>
              Salir
            </button>
          </div>
        )}

        {/* Tab content */}
        <div style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
          {tab === 'dashboard' && tabDashboard}
          {tab === 'catalogo'  && tabCatalogo}
          {tab === 'ordenes'   && tabOrdenes}
        </div>
      </main>

      {modal && <OrdenModal lote={modal} onClose={() => setModal(null)} onSuccess={handleOrdenSuccess} />}
    </div>
  )
}
