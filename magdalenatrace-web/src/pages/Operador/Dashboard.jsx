import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

const FINCAS_DISPONIBLES = [
  { id:1, finca:'El Paraíso',   vereda:'Minca',        producto:'café' },
  { id:2, finca:'La Esperanza', vereda:'San Pedro',    producto:'café' },
  { id:3, finca:'El Edén',      vereda:'Palmor',       producto:'cacao' },
  { id:4, finca:'Don Julio',    vereda:'Guachaca',     producto:'banano/cacao' },
  { id:5, finca:'La Montaña',   vereda:'Pueblo Bello', producto:'café' },
]

const RESERVAS_DEMO = [
  { id:1, turista:'John Smith',    experiencia:'Tour del café en la Sierra Nevada', fecha:'2025-06-15', personas:2, estado:'confirmada' },
  { id:2, turista:'Ana García',    experiencia:'Tour del café en la Sierra Nevada', fecha:'2025-06-22', personas:1, estado:'pendiente'  },
]

const FORM_INICIAL = { titulo:'', descripcion:'', precio_cop:'', duracion_horas:'', productor_id:'' }

export default function OperadorDashboard() {
  const navigate   = useNavigate()
  const user       = JSON.parse(localStorage.getItem('user') || '{}')

  const [perfil,       setPerfil]       = useState(null)
  const [experiencias, setExperiencias] = useState([])
  const [mostrarForm,  setMostrarForm]  = useState(false)
  const [form,         setForm]         = useState(FORM_INICIAL)
  const [saving,       setSaving]       = useState(false)
  const [msg,          setMsg]          = useState('')
  const [error,        setError]        = useState('')

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    fetchPerfil()
  }, [navigate])

  async function fetchPerfil() {
    try {
      const { data } = await api.get('/operadores/yo')
      setPerfil(data)
      setExperiencias(data.experiencias || [])
    } catch {
      // Demo fallback
      setPerfil({ nombre: user.nombre || 'Ana Torres', empresa: 'Sierra Aventura Tours', ciudad: 'Santa Marta', servicios: 'Agroturismo,Ecoturismo' })
      const guardadas = JSON.parse(localStorage.getItem('experiencias_demo') || '[]')
      setExperiencias([
        { id:1, titulo:'Tour del café en la Sierra Nevada', descripcion:'Visita a finca El Paraíso en Minca', precio_cop:85000, duracion_horas:4, disponible:true },
        ...guardadas,
      ])
    }
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function guardarExperiencia(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.post('/operadores/experiencias', {
        productor_id: Number(form.productor_id),
        titulo: form.titulo,
        descripcion: form.descripcion,
        precio_cop: Number(form.precio_cop),
        duracion_horas: Number(form.duracion_horas),
        disponible: true,
      })
      setMsg('✅ Experiencia creada exitosamente')
      setMostrarForm(false)
      setForm(FORM_INICIAL)
      fetchPerfil()
    } catch {
      // Guardar localmente si la API falla
      const nueva = { id: Date.now(), ...form, precio_cop: Number(form.precio_cop), duracion_horas: Number(form.duracion_horas), disponible: true }
      const guardadas = JSON.parse(localStorage.getItem('experiencias_demo') || '[]')
      localStorage.setItem('experiencias_demo', JSON.stringify([...guardadas, nueva]))
      setExperiencias(prev => [...prev, nueva])
      setMsg('✅ Experiencia guardada localmente (demo)')
      setMostrarForm(false)
      setForm(FORM_INICIAL)
    } finally {
      setSaving(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  function logout() {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', fontFamily: 'var(--font-main)' }}>

      {/* Header */}
      <header style={{ background: 'var(--usm-blue)', color: '#fff', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>MagdalenaTrace</div>
          <div style={{ fontSize: 11, opacity: 0.75 }}>Panel Operador Turístico · {perfil?.empresa}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, opacity: 0.9 }}>Hola, <strong>{perfil?.nombre || user.nombre}</strong></span>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '6px 14px', fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>

        {/* Banner éxito */}
        {msg && (
          <div style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontWeight: 600, fontSize: 14 }}>
            {msg}
          </div>
        )}

        {/* Info del operador */}
        {perfil && (
          <div style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: 40 }}>🏔️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--usm-navy)' }}>{perfil.empresa}</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>📍 {perfil.ciudad} &nbsp;·&nbsp; 🎯 {perfil.servicios}</div>
            </div>
          </div>
        )}

        {/* Experiencias */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, color: 'var(--usm-navy)' }}>
              Mis experiencias
              <span style={{ fontSize: 12, fontWeight: 400, color: '#6B7280', marginLeft: 8 }}>({experiencias.length})</span>
            </h2>
            <button onClick={() => setMostrarForm(v => !v)} className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
              {mostrarForm ? '✕ Cancelar' : '+ Nueva experiencia'}
            </button>
          </div>

          {/* Formulario nueva experiencia */}
          {mostrarForm && (
            <div style={{ background: '#fff', borderRadius: 10, padding: '24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', border: '1px solid var(--usm-teal)' }}>
              <h3 style={{ fontSize: 15, marginBottom: 16, color: 'var(--usm-navy)' }}>Nueva experiencia turística</h3>
              <form onSubmit={guardarExperiencia} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Título de la experiencia</label>
                  <input required value={form.titulo} onChange={f('titulo')} placeholder="Ej: Tour del café en Minca" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Descripción</label>
                  <textarea required value={form.descripcion} onChange={f('descripcion')} rows={3} placeholder="Describe la experiencia, qué incluye, qué verán…" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Precio COP / persona</label>
                  <input required type="number" value={form.precio_cop} onChange={f('precio_cop')} placeholder="Ej: 85000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Duración (horas)</label>
                  <input required type="number" step="0.5" value={form.duracion_horas} onChange={f('duracion_horas')} placeholder="Ej: 4" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Finca a vincular</label>
                  <select required value={form.productor_id} onChange={f('productor_id')} style={inputStyle}>
                    <option value="">Selecciona una finca…</option>
                    {FINCAS_DISPONIBLES.map(fi => (
                      <option key={fi.id} value={fi.id}>
                        {fi.finca} — {fi.vereda} ({fi.producto})
                      </option>
                    ))}
                  </select>
                </div>
                {error && <div style={{ gridColumn:'1/-1', background:'#FEF2F2', color:'#DC2626', borderRadius:6, padding:'10px 12px', fontSize:13 }}>{error}</div>}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setMostrarForm(false)}
                    style={{ flex:1, background:'#F3F4F6', color:'var(--usm-navy)', border:'none', borderRadius:6, padding:11, fontFamily:'var(--font-main)', fontWeight:600, cursor:'pointer', fontSize:14 }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ flex:2, padding:11, fontSize:14 }}>
                    {saving ? 'Guardando…' : 'Guardar experiencia'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de experiencias */}
          {experiencias.length === 0 ? (
            <div style={{ background:'#fff', borderRadius:10, padding:28, textAlign:'center', color:'#9CA3AF', fontSize:14, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              No tienes experiencias creadas. Crea la primera con el botón de arriba.
            </div>
          ) : (
            <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {experiencias.map(exp => (
                <div key={exp.id} style={{ background:'#fff', borderRadius:10, padding:'18px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', borderLeft:'4px solid var(--usm-teal)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--usm-navy)', lineHeight:1.3 }}>{exp.titulo}</div>
                    <span style={{ background: exp.disponible ? '#D1FAE5':'#F3F4F6', color: exp.disponible?'#065F46':'#9CA3AF', padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:700, flexShrink:0, marginLeft:8 }}>
                      {exp.disponible ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div style={{ fontSize:12, color:'#6B7280', marginBottom:10, lineHeight:1.4 }}>
                    {exp.descripcion || '—'}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:13 }}>
                    <div>💰 <strong>${Number(exp.precio_cop)?.toLocaleString()}</strong>/persona</div>
                    <div>⏱️ <strong>{exp.duracion_horas}h</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reservas recibidas */}
        <section>
          <h2 style={{ fontSize:16, marginBottom:14, color:'var(--usm-navy)' }}>
            Reservas recibidas
            <span style={{ fontSize:12, fontWeight:400, color:'#6B7280', marginLeft:8 }}>(demo)</span>
          </h2>
          <div style={{ overflowX:'auto', borderRadius:10, boxShadow:'0 2px 8px rgba(0,0,0,0.07)' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:13 }}>
              <thead>
                <tr style={{ background:'var(--usm-blue)', color:'#fff' }}>
                  {['Turista','Experiencia','Fecha','Personas','Estado'].map(col => (
                    <th key={col} style={{ padding:'10px 14px', textAlign:'left', fontWeight:600 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESERVAS_DEMO.map((r, i) => (
                  <tr key={r.id} style={{ background: i%2===0 ? '#fff':'var(--usm-blue-pale)' }}>
                    <td style={{ padding:'10px 14px' }}>{r.turista}</td>
                    <td style={{ padding:'10px 14px' }}>{r.experiencia}</td>
                    <td style={{ padding:'10px 14px' }}>{r.fecha}</td>
                    <td style={{ padding:'10px 14px', textAlign:'center' }}>{r.personas}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ background: r.estado==='confirmada'?'#D1FAE5':'#FEF3C7', color: r.estado==='confirmada'?'#065F46':'#92400E', padding:'3px 10px', borderRadius:12, fontSize:11, fontWeight:700 }}>
                        {r.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  )
}

const labelStyle = { fontSize:13, fontWeight:600, color:'var(--usm-navy)', display:'block', marginBottom:4 }
const inputStyle = { width:'100%', padding:'9px 12px', border:'1px solid #D1D5DB', borderRadius:6, fontFamily:'var(--font-main)', fontSize:13, background:'#fff' }
