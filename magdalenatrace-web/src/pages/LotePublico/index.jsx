/** LotePublico/index.jsx — Responsable: Camila · TODO: implementar */
import { useParams } from 'react-router-dom'
export default function LotePublico() {
  const { id } = useParams()
  return <div style={{padding:40,fontFamily:'var(--font-main)'}}><h2>Pasaporte del Lote {id}</h2><p>TODO: Camila implementa el pasaporte digital con línea de tiempo de CTEs</p></div>
}
