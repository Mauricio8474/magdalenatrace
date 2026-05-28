import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import CertBadge from '../../components/ui/CertBadge'
import USMHeader from '../../components/ui/USMHeader'
import LoteProgressBar from '../../components/ui/LoteProgressBar'
import { LOTES_DEMO } from '../../data/seed'

function KpiCard({ label, value, icon }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      borderTop: '4px solid var(--usm-blue)',
      padding: '20px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      flex: '1 1 180px', minWidth: 150,
    }}>
      <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--usm-blue)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--usm-navy)', marginTop: 5, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 32,
        width: '100%', maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        fontFamily: 'var(--font-main)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ color: 'var(--usm-navy)', fontSize: 18 }}>Nueva orden de compra</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ background: 'var(--usm-blue-pale)', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: 'var(--usm-navy)' }}>
          <strong>{lote?.producto}</strong> · {lote?.variedad} · {lote?.vereda}<br />
          Lote: <strong>{lote?.id}</strong> &nbsp;·&nbsp; Disponible: <strong>{(lote?.volumen_kg ?? lote?.kg)?.toLocaleString()} kg</strong>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Volumen a comprar (kg)', key: 'volumen_kg', type: 'number', placeholder: `Máx. ${lote?.volumen_kg ?? lote?.kg} kg` },
            { label: 'Precio acordado / kg (COP)', key: 'precio_acordado_kg', type: 'number', placeholder: 'Ej: 12500' },
            { label: 'Destino de exportación', key: 'destino', type: 'text', placeholder: 'Ej: Hamburgo, Alemania' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--usm-navy)', display: 'block', marginBottom: 4 }}>{label}</label>
              <input
                type={type} required value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontFamily: 'var(--font-main)', fontSize: 14 }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--usm-navy)', display: 'block', marginBottom: 4 }}>Notas (opcional)</label>
            <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              rows={2} style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 6, fontFamily: 'var(--font-main)', fontSize: 14, resize: 'vertical' }} />
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', color: '#DC2626', borderRadius: 6, padding: '10px 12px', fontSize: 13 }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, background: '#F3F4F6', color: 'var(--usm-navy)', border: 'none', borderRadius: 6, padding: 11, fontFamily: 'var(--font-main)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, padding: 11, fontSize: 14 }}>
              {loading ? 'Procesando…' : 'Confirmar orden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ExportadorDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [kpis,        setKpis]        = useState(null)
  const [lotes,       setLotes]       = useState([])
  const [ordenes,     setOrdenes]     = useState([])
  const [modal,       setModal]       = useState(null)
  const [success,     setSuccess]     = useState('')
  const [loadingData, setLoadingData] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoadingData(true)
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
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    fetchAll()
  }, [navigate, fetchAll])

  function logout() {
    localStorage.clear()
    navigate('/')
  }

  async function handleOrdenSuccess() {
    setModal(null)
    setSuccess('✅ Orden creada exitosamente. El lote fue reservado.')
    setTimeout(() => setSuccess(''), 4000)
    await fetchAll()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', fontFamily: 'var(--font-main)' }}>
      <USMHeader userName={user.nombre} onLogout={logout} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {success && (
          <div style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontWeight: 600, fontSize: 14 }}>
            {success}
          </div>
        )}

        {/* KPIs */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, marginBottom: 14, color: 'var(--usm-navy)' }}>Resumen operativo</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <KpiCard icon="📦" label="Lotes disponibles"         value={loadingData ? '…' : (kpis?.lotes_disponibles ?? 0)} />
            <KpiCard icon="📋" label="Órdenes activas"           value={loadingData ? '…' : (kpis?.ordenes_activas ?? 0)} />
            <KpiCard icon="🚢" label="Kg en tránsito"            value={loadingData ? '…' : (kpis?.kg_en_transito?.toLocaleString() ?? 0)} />
            <KpiCard icon="🌿" label="Certificaciones Fairtrade" value={loadingData ? '…' : (kpis?.certificaciones_fairtrade_activas ?? 0)} />
          </div>
        </section>

        {/* Catálogo */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, marginBottom: 14, color: 'var(--usm-navy)' }}>
            Catálogo de lotes disponibles
            <span style={{ fontSize: 12, fontWeight: 400, color: '#6B7280', marginLeft: 8 }}>({lotes.length} lotes)</span>
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--usm-blue)', color: '#fff' }}>
                  {['ID', 'Producto', 'Variedad', 'Kg', 'Vereda', 'Altitud', 'Certificaciones', 'Precio/kg', 'Acción'].map(col => (
                    <th key={col} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr><td colSpan={9} style={{ padding: 28, textAlign: 'center', color: '#9CA3AF' }}>Cargando catálogo…</td></tr>
                ) : lotes.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: 28, textAlign: 'center', color: '#9CA3AF' }}>No hay lotes disponibles en este momento</td></tr>
                ) : lotes.map((l, i) => (
                  <tr key={l.id}
                    style={{ background: i % 2 === 0 ? '#fff' : 'var(--usm-blue-pale)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : 'var(--usm-blue-pale)')}
                  >
                    <td style={TD}><strong style={{ color: 'var(--usm-blue)' }}>{l.id}</strong></td>
                    <td style={TD}>{l.producto}</td>
                    <td style={TD}>{l.variedad || '—'}</td>
                    <td style={TD}><strong>{(l.volumen_kg ?? l.kg)?.toLocaleString()}</strong></td>
                    <td style={TD}>{l.vereda}</td>
                    <td style={TD}>{l.altitud_msnm ? `${l.altitud_msnm} m` : '—'}</td>
                    <td style={{ ...TD }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(l.certificaciones || []).map(c => <CertBadge key={c} type={c} status="vigente" />)}
                      </div>
                    </td>
                    <td style={TD}><strong style={{ color: 'var(--usm-navy)' }}>${(l.precio_kg)?.toLocaleString()}</strong></td>
                    <td style={TD}>
                      <button onClick={() => setModal(l)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
                        Crear orden
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Órdenes */}
        <section>
          <h2 style={{ fontSize: 16, marginBottom: 14, color: 'var(--usm-navy)' }}>
            Mis órdenes activas
            <span style={{ fontSize: 12, fontWeight: 400, color: '#6B7280', marginLeft: 8 }}>({ordenes.length})</span>
          </h2>
          {ordenes.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 10, padding: 28, textAlign: 'center', color: '#9CA3AF', fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              No tienes órdenes activas. Crea una desde el catálogo.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {ordenes.map(o => (
                <div key={o.id} style={{
                  background: '#fff', borderRadius: 10, padding: '18px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  borderLeft: '4px solid var(--usm-teal)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--usm-navy)' }}>{o.lote_id}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{o.producto}{o.variedad ? ` · ${o.variedad}` : ''}</div>
                    </div>
                    <span style={{
                      background: o.estado_orden === 'pendiente' ? '#FEF3C7' : '#D1FAE5',
                      color:      o.estado_orden === 'pendiente' ? '#92400E' : '#065F46',
                      padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                    }}>
                      {o.estado_orden}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, color: '#374151' }}>
                    <div>🚢 <strong>{o.destino}</strong></div>
                    <div>📦 <strong>{o.volumen_kg?.toLocaleString()} kg</strong></div>
                    <div>💰 <strong>${o.precio_acordado_kg?.toLocaleString()}/kg</strong></div>
                    <div>💵 Total: <strong>${o.valor_total?.toLocaleString()}</strong></div>
                  </div>
                  <LoteProgressBar completados={o.ctes_completados} total={o.ctes_total} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {modal && <OrdenModal lote={modal} onClose={() => setModal(null)} onSuccess={handleOrdenSuccess} />}
    </div>
  )
}

const TD = { padding: '10px 14px', verticalAlign: 'middle' }
