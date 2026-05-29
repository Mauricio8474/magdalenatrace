/**
 * client.js — Cliente HTTP centralizado para toda la app
 * Responsable: Mauricio define la baseURL, todos leen este archivo.
 * 
 * USO:
 *   import api from '../api/client'
 *   const { data } = await api.get('/lotes/catalogo')
 *   const { data } = await api.post('/exportadores/ordenes', body)
 */
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://magdalenatrace-production.up.railway.app',
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el token JWT automáticamente a cada petición
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Manejo global de errores de autenticación
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
