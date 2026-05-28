/**
 * seed.js — Datos demo para desarrollo frontend sin API
 * Responsable: Nicolle
 * 
 * USO (mientras la API no está lista):
 *   import { FINCAS_DEMO, LOTES_DEMO } from '../data/seed'
 */
export const FINCAS_DEMO = [
  { id: 1, finca: "El Paraíso",    vereda: "Minca",        lat: 11.1333, lng: -74.1167, altitud: 650,  productos: "café",         certificaciones: ["Rainforest Alliance"] },
  { id: 2, finca: "La Esperanza",  vereda: "San Pedro",    lat: 11.1789, lng: -74.0523, altitud: 820,  productos: "café",         certificaciones: ["Fairtrade"] },
  { id: 3, finca: "El Edén",       vereda: "Palmor",       lat: 10.7856, lng: -73.9234, altitud: 1100, productos: "cacao",        certificaciones: ["BPA"] },
  { id: 4, finca: "Don Julio",     vereda: "Guachaca",     lat: 11.2341, lng: -73.7823, altitud: 380,  productos: "banano,cacao", certificaciones: ["Fairtrade", "Rainforest Alliance"] },
  { id: 5, finca: "La Montaña",    vereda: "Pueblo Bello", lat: 10.4123, lng: -73.5678, altitud: 1450, productos: "café",         certificaciones: ["Rainforest Alliance"] },
]

export const LOTES_DEMO = [
  { id: "L2025-001", producto: "Café pergamino", variedad: "Castillo",  kg: 320, precio_kg: 12500, vereda: "Minca",        estado: "disponible", certs: ["Rainforest Alliance"] },
  { id: "L2025-002", producto: "Café pergamino", variedad: "Caturra",   kg: 180, precio_kg: 11800, vereda: "San Pedro",    estado: "disponible", certs: ["Fairtrade"] },
  { id: "L2025-003", producto: "Cacao seco",     variedad: "CCN-51",    kg: 450, precio_kg: 9500,  vereda: "Palmor",       estado: "disponible", certs: ["BPA"] },
  { id: "L2025-004", producto: "Banano orgánico", variedad: "Cavendish",kg: 1200,precio_kg: 1200,  vereda: "Guachaca",     estado: "disponible", certs: ["Fairtrade"] },
  { id: "L2025-005", producto: "Café pergamino", variedad: "Castillo",  kg: 95,  precio_kg: 13200, vereda: "Pueblo Bello", estado: "disponible", certs: ["Rainforest Alliance"] },
]

export const CTES_DEMO = {
  "L2025-001": [
    { tipo: "insumo",  fecha: "2025-02-01", descripcion: "Aplicación de abono foliar orgánico 5 L/ha" },
    { tipo: "cosecha", fecha: "2025-03-15", descripcion: "Cosecha manual selectiva, 320 kg café cereza" },
  ],
  "L2025-002": [
    { tipo: "insumo",  fecha: "2025-03-01", descripcion: "Fertilización con compost 2 kg/planta" },
    { tipo: "cosecha", fecha: "2025-04-10", descripcion: "Cosecha manual selectiva, 180 kg café cereza" },
  ],
}
