/**
 * seed.js — Datos demo para desarrollo frontend sin API
 * Responsable: Nicolle
 *
 * USO:
 *   import { FINCAS_DEMO, LOTES_DEMO, CTES_DEMO, EXPERIENCIAS_DEMO } from '../data/seed'
 */

export const FINCAS_DEMO = [
  { id: 1, finca: 'El Paraíso',   vereda: 'Minca',        lat: 11.1333, lng: -74.1167, altitud: 650,  productos: 'café',         certificaciones: ['Rainforest Alliance'] },
  { id: 2, finca: 'La Esperanza', vereda: 'San Pedro',    lat: 11.1789, lng: -74.0523, altitud: 820,  productos: 'café',         certificaciones: ['Fairtrade'] },
  { id: 3, finca: 'El Edén',      vereda: 'Palmor',       lat: 10.7856, lng: -73.9234, altitud: 1100, productos: 'cacao',        certificaciones: ['BPA'] },
  { id: 4, finca: 'Don Julio',    vereda: 'Guachaca',     lat: 11.2341, lng: -73.7823, altitud: 380,  productos: 'banano,cacao', certificaciones: ['Fairtrade', 'Rainforest Alliance'] },
  { id: 5, finca: 'La Montaña',   vereda: 'Pueblo Bello', lat: 10.4123, lng: -73.5678, altitud: 1450, productos: 'café',         certificaciones: ['Rainforest Alliance'] },
]

export const LOTES_DEMO = [
  { id: 'L2025-001', producto: 'Café pergamino',  variedad: 'Castillo',  kg: 320,  precio_kg: 12500, vereda: 'Minca',        estado: 'disponible', certs: ['Rainforest Alliance'], productor_id: 1 },
  { id: 'L2025-002', producto: 'Café pergamino',  variedad: 'Caturra',   kg: 180,  precio_kg: 11800, vereda: 'San Pedro',    estado: 'disponible', certs: ['Fairtrade'],           productor_id: 2 },
  { id: 'L2025-003', producto: 'Cacao seco',      variedad: 'CCN-51',    kg: 450,  precio_kg: 9500,  vereda: 'Palmor',       estado: 'disponible', certs: ['BPA'],                 productor_id: 3 },
  { id: 'L2025-004', producto: 'Banano orgánico', variedad: 'Cavendish', kg: 1200, precio_kg: 1200,  vereda: 'Guachaca',     estado: 'disponible', certs: ['Fairtrade', 'Rainforest Alliance'], productor_id: 4 },
  { id: 'L2025-005', producto: 'Café pergamino',  variedad: 'Castillo',  kg: 95,   precio_kg: 13200, vereda: 'Pueblo Bello', estado: 'disponible', certs: ['Rainforest Alliance'], productor_id: 5 },
]

// CTEs enriquecidos para la línea de tiempo del demo
export const CTES_DEMO = {
  'L2025-001': [
    { tipo: 'insumo',  fecha: '2025-01-15', descripcion: 'Aplicación de abono foliar orgánico 5 L/ha — Proveedor: AgroSierra' },
    { tipo: 'insumo',  fecha: '2025-02-10', descripcion: 'Control preventivo de roya con caldo bordelés 3 L/ha' },
    { tipo: 'cosecha', fecha: '2025-03-15', descripcion: 'Cosecha manual selectiva, 320 kg café cereza — 8 jornaleros' },
    { tipo: 'acopio',  fecha: '2025-03-17', descripcion: 'Entrega en cooperativa Sierra Nevada — Despulpe húmedo, fermentación 36h' },
  ],
  'L2025-002': [
    { tipo: 'insumo',  fecha: '2025-02-20', descripcion: 'Fertilización con compost orgánico 2 kg/planta' },
    { tipo: 'cosecha', fecha: '2025-04-10', descripcion: 'Cosecha manual selectiva, 180 kg café cereza — variedad Caturra' },
    { tipo: 'acopio',  fecha: '2025-04-12', descripcion: 'Secado en camas africanas 12 días — humedad final 11%' },
  ],
  'L2025-003': [
    { tipo: 'insumo',   fecha: '2025-02-01', descripcion: 'Poda de mantenimiento y aplicación de fungicida orgánico' },
    { tipo: 'cosecha',  fecha: '2025-03-28', descripcion: 'Cosecha de mazorcas maduras, 450 kg cacao fresco' },
    { tipo: 'acopio',   fecha: '2025-03-30', descripcion: 'Fermentación 5 días en cajones de madera — secado solar 7 días' },
    { tipo: 'despacho', fecha: '2025-04-08', descripcion: 'Despacho a exportador en Santa Marta — 380 kg cacao seco certificado' },
  ],
  'L2025-004': [
    { tipo: 'insumo',  fecha: '2025-04-01', descripcion: 'Aplicación de potasio y magnesio foliar — programa Fairtrade' },
    { tipo: 'cosecha', fecha: '2025-05-01', descripcion: 'Corte de 1200 kg banano Cavendish grado exportación' },
  ],
  'L2025-005': [
    { tipo: 'insumo',  fecha: '2025-03-10', descripcion: 'Abonamiento con lombricompost 3 kg/planta — finca a 1450 msnm' },
    { tipo: 'cosecha', fecha: '2025-04-20', descripcion: 'Cosecha selectiva 95 kg café especial de altura — variedad Castillo' },
    { tipo: 'acopio',  fecha: '2025-04-22', descripcion: 'Proceso honey: secado con mucílago en camas elevadas 18 días' },
  ],
}

// Experiencias turísticas enriquecidas
export const EXPERIENCIAS_DEMO = [
  {
    id: 1,
    titulo: 'Tour del café en la Sierra Nevada',
    descripcion: 'Visita a la finca El Paraíso en Minca. Recorrido completo: recolección manual, despulpe, fermentación, secado y cata de café especial. Incluye almuerzo típico samario.',
    precio_cop: 85000,
    duracion_horas: 4,
    finca: 'El Paraíso',
    vereda: 'Minca',
    operador: 'Sierra Aventura Tours',
    incluye: ['Transporte desde Santa Marta', 'Almuerzo', 'Cata de café', 'Bolsa de café para llevar'],
  },
  {
    id: 2,
    titulo: 'Experiencia cacao en Palmor',
    descripcion: 'Conoce el proceso del cacao fino de aroma en la finca El Edén. Aprende a hacer chocolate artesanal y lleva tu tableta a casa.',
    precio_cop: 95000,
    duracion_horas: 5,
    finca: 'El Edén',
    vereda: 'Palmor',
    operador: 'Sierra Aventura Tours',
    incluye: ['Transporte', 'Taller de chocolate', 'Degustación', 'Kit de cacao'],
  },
]
