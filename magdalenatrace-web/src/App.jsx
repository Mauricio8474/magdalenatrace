import { Routes, Route, Navigate } from 'react-router-dom'

// ── Páginas (cada integrante implementa las suyas) ────────────────────────────
// Damián
import Login         from './pages/Login.jsx'
import Registro      from './pages/Registro.jsx'
import ExportadorDashboard from './pages/Exportador/Dashboard.jsx'
import ChatbotPage   from './pages/Chatbot/index.jsx'
import WhatsAppBot   from './pages/WhatsAppBot/index.jsx'

// Camila
import MapaPage      from './pages/Mapa.jsx'
import LotePublico   from './pages/LotePublico/index.jsx'
import OperadorDashboard from './pages/Operador/Dashboard.jsx'

// Landing
import Landing           from './pages/Landing.jsx'
import ExperienciaPublica from './pages/Experiencia/index.jsx'

function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/"               element={<Landing />} />
      <Route path="/login"          element={<Login />} />
      <Route path="/registro"       element={<Registro />} />
      <Route path="/mapa"           element={<MapaPage />} />
      <Route path="/lote/:id"       element={<LotePublico />} />
      <Route path="/experiencia/:id" element={<ExperienciaPublica />} />

      {/* Canal Productor */}
      <Route path="/whatsapp"       element={<WhatsAppBot />} />

      {/* Canal Exportador */}
      <Route path="/exportador"     element={<ExportadorDashboard />} />

      {/* Chatbot IA */}
      <Route path="/chatbot"        element={<ChatbotPage />} />

      {/* Operador Turístico */}
      <Route path="/operador"       element={<OperadorDashboard />} />

      {/* Fallback */}
      <Route path="*"               element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
