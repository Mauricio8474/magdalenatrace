# 🌿 MagdalenaTrace

<div align="center">

**Plataforma de trazabilidad digital para la cadena de valor agrícola y turística del Magdalena**

[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Railway](https://img.shields.io/badge/Railway-Deploy-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**🏆 Hackathon Colombia 5.0 · Santa Marta · 28 de mayo de 2026**

**Equipo BahIA SMR — Institución Universitaria de Santa Marta (USM)**

</div>

---

## 📋 Tabla de contenidos

- [🚀 Demo en producción](#-demo-en-producción)
- [👥 Equipo](#-equipo)
- [🎯 ¿Qué es MagdalenaTrace?](#-qué-es-magdalenatrace)
- [👤 Actores del sistema](#-actores-del-sistema)
- [🛠️ Stack tecnológico](#%EF%B8%8F-stack-tecnológico)
- [📦 Módulos implementados](#-módulos-implementados)
- [⚙️ Instalación local](#%EF%B8%8F-instalación-local)
- [🔑 Credenciales demo](#-credenciales-demo)
- [📁 Estructura del proyecto](#-estructura-del-proyecto)
- [🌿 Ramas Git](#-ramas-git)
- [🏅 Sobre el reto](#-sobre-el-reto)

---

## 🚀 Demo en producción

| Servicio | URL |
|----------|-----|
| 🌐 **Frontend** | [magdalenatrace.vercel.app](https://magdalenatrace-nqwyqwmdy-mauricio-s-projects-ai.vercel.app) |
| ⚡ **API REST** | [magdalenatrace-production.up.railway.app](https://magdalenatrace-production.up.railway.app) |
| 📖 **Docs API (Swagger)** | [/docs](https://magdalenatrace-production.up.railway.app/docs) |

---

## 👥 Equipo

**Equipo BahIA SMR** — Institución Universitaria de Santa Marta

| Integrante | Rol | Módulos | Rama |
|-----------|-----|---------|------|
| **Mauricio Morales Paba** | Backend Lead | API FastAPI · Base de datos · Deploy Railway | `feat/api-mauricio` |
| **Damián** | Frontend Lead | Web App · Chatbot IA · Dashboard Exportador | `feat/web-damian` |
| **Camila** | Frontend | QR · Operador Turístico · Mapa interactivo | `feat/qr-operador-camila` |
| **Nicolle** | Demo & Datos | Datos demo · Seed · Presentación | `feat/demo-datos-nicolle` |

---

## 🎯 ¿Qué es MagdalenaTrace?

MagdalenaTrace es una plataforma de **trazabilidad digital certificada** para el café, cacao y banano de la Sierra Nevada de Santa Marta. Conecta a productores, exportadores, operadores turísticos y compradores internacionales a través de una cadena de valor digital verificable.

Cada lote agrícola tiene un **pasaporte digital** accesible por código QR que muestra:
- 📍 Origen geográfico de la finca (coordenadas difuminadas para privacidad)
- 🌱 Todos los eventos de trazabilidad (CTEs): insumos, cosecha, acopio, despacho
- 🏅 Certificaciones vigentes: Fairtrade, Rainforest Alliance, BPA
- 🏕️ Experiencias agroturísticas disponibles vinculadas a la finca

---

## 👤 Actores del sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐    ┌──────────────────┐
│   🌱 Productor  │    │  📊 Exportador   │    │ 🏕️ Op. Turístico  │    │  🗺️ Turista      │
│                 │    │                  │    │                    │    │                  │
│ Registra su     │    │ Accede al        │    │ Crea experiencias  │    │ Escanea QR,      │
│ finca y lotes   │    │ catálogo de      │    │ de agroturismo     │    │ reserva tours,   │
│ vía WhatsApp    │    │ lotes, crea      │    │ vinculadas a       │    │ descubre el      │
│ (sin cuenta web)│    │ órdenes de       │    │ fincas reales      │    │ origen del       │
│                 │    │ compra y         │    │                    │    │ producto         │
│                 │    │ descarga CTEs    │    │                    │    │                  │
└────────┬────────┘    └────────┬─────────┘    └─────────┬──────────┘    └────────┬─────────┘
         │                      │                         │                         │
         └──────────────────────┴─────────────────────────┴─────────────────────────┘
                                        MagdalenaTrace API
```

### 1. 🌱 Productor agrícola
- Interactúa exclusivamente a través del **simulador de WhatsApp Bot**
- Registra su finca, vereda, productos y certificaciones
- Registra cosechas, insumos y eventos de trazabilidad (CTEs)
- Sin necesidad de cuenta web ni smartphone de alta gama

### 2. 📊 Exportador
- Dashboard web con catálogo completo de lotes disponibles
- Filtros por producto, certificación, vereda y volumen mínimo
- Creación de órdenes de compra con destino y precio acordado
- Descarga de documentación de trazabilidad completa (CTEs)
- KPIs: lotes disponibles, órdenes activas, kg en tránsito, certificaciones

### 3. 🏕️ Operador Turístico
- Panel web para gestionar experiencias de agroturismo
- Vinculación de experiencias a fincas reales con mapa Leaflet
- Toggle activo/inactivo por experiencia
- Sistema de reservas: recibir, confirmar o cancelar
- QR dinámico por experiencia para compartir en redes
- Tipos: Hotel boutique, Agencia de turismo, Guía certificado, Persona natural

### 4. 🗺️ Turista / Comprador internacional
- Mapa interactivo de fincas de la Sierra Nevada
- Pasaporte digital de lote accesible sin login (via QR)
- Vista pública de experiencias turísticas
- Reserva de experiencias agroturísticas
- Sin barreras de idioma (interfaz preparada para turistas internacionales)

---

## 🛠️ Stack tecnológico

### Backend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Python | 3.13 | Lenguaje base |
| FastAPI | 0.110+ | Framework API REST |
| SQLAlchemy | 2.x | ORM para SQLite |
| SQLite | 3 | Base de datos (Railway) |
| python-jose | — | JWT tokens |
| passlib + bcrypt | — | Hash de contraseñas |
| Pydantic v2 | — | Validación de esquemas |
| Railway | — | Deploy automático desde `main` |

### Frontend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18 | Framework UI |
| Vite | 5 | Build tool |
| React Router | v6 | Navegación SPA |
| Leaflet + React-Leaflet | 4.x | Mapas interactivos |
| qrcode.react | 3.x | Generación de QR |
| Recharts | — | Gráficas |
| Axios | — | Cliente HTTP |
| Claude API (Anthropic) | — | Chatbot IA |
| Vercel | — | Deploy automático desde `main` |

---

## 📦 Módulos implementados

### API REST — 7 routers

```
/auth          → Login, registro (exportador / turista / operador), WhatsApp
/lotes         → Catálogo, creación, CTEs, pasaporte público
/exportadores  → Dashboard, órdenes de compra
/operadores    → Perfil, experiencias, reservas, fincas disponibles
/turistas      → Perfil, favoritos
/productores   → Registro WhatsApp, lotes, CTEs
/chatbot       → Chat con Claude API en lenguaje natural
```

### Base de datos — 9 modelos

```
Usuario · Productor · Lote · CTE · Certificacion
Exportador · OrdenCompra · OperadorTuristico · Experiencia · Turista · Reserva
```

### Frontend — 10 páginas

```
/              → Landing page con hero animado
/login         → Autenticación split-screen
/registro      → Registro multi-rol (exportador / turista / operador)
/mapa          → Mapa interactivo de fincas (Leaflet)
/lote/:id      → Pasaporte digital del lote (público, via QR)
/exportador    → Dashboard exportador con catálogo y órdenes
/operador      → Panel operador turístico con experiencias y reservas
/experiencia/:id → Vista pública de experiencia turística
/chatbot       → Chatbot IA con Claude API
/whatsapp      → Simulador del bot WhatsApp para el productor
```

### Características destacadas

- 🔐 **Privacidad**: coordenadas de productores difuminadas ±0.01° en la BD
- 🎨 **Identidad visual propia**: paleta "Magdalena" (Sierra Nevada + café + Caribe)
- 📱 **Responsive**: mobile-first, funciona en telefóno del jurado
- 🔄 **Fallback a datos demo**: si la API falla, el frontend carga datos de `seed.js`
- 🗺️ **Mini mapas en modales**: selección de finca con clic en mapa Leaflet
- 📊 **QR dinámicos**: cada lote y experiencia tiene su propio QR generado en cliente

---

## ⚙️ Instalación local

### Requisitos previos

- Python 3.10+
- Node.js 18+
- Git

### Backend

```bash
# 1. Clonar repositorio
git clone https://github.com/Mauricio8474/magdalenatrace.git
cd magdalenatrace/magdalenatrace-api

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Levantar la API (seed automático al iniciar)
uvicorn main:app --reload

# ✅ API en:   http://localhost:8000
# ✅ Docs en:  http://localhost:8000/docs
```

> **Nota:** el seed se ejecuta automáticamente al iniciar si la base de datos está vacía.

### Frontend

```bash
cd magdalenatrace/magdalenatrace-web

# 1. Instalar dependencias
npm install

# 2. (Opcional) Apuntar al backend local
# En src/api/client.js cambiar la baseURL a http://localhost:8000

# 3. Levantar servidor de desarrollo
npm run dev

# ✅ Frontend en: http://localhost:5173
```

---

## 🔑 Credenciales demo

> Estas cuentas están precargadas en la base de datos de producción.

| Rol | Email | Contraseña | Panel |
|-----|-------|-----------|-------|
| 👑 Admin | `admin@magdalenatrace.co` | `admin2026` | `/exportador` |
| 📊 Exportador | `exportador@sierraexporta.co` | `exporta2026` | `/exportador` |
| 🏕️ Operador | `operador@sierraaventura.co` | `tours2026` | `/operador` |
| 🏕️ Operador 2 | `ecolodge@minca.co` | `minca2026` | `/operador` |
| 🗺️ Turista | `tourist@example.com` | `travel2026` | `/mapa` |

---

## 📁 Estructura del proyecto

```
magdalenatrace/
│
├── magdalenatrace-api/          # 🐍 Backend Python + FastAPI
│   ├── main.py                  # App FastAPI, startup, routers
│   ├── models.py                # Modelos SQLAlchemy (11 modelos)
│   ├── schemas.py               # Schemas Pydantic (request/response)
│   ├── auth.py                  # JWT, bcrypt, require_rol()
│   ├── database.py              # Engine SQLite, get_db()
│   ├── seed.py                  # Datos demo para desarrollo
│   └── routers/
│       ├── auth.py              # Login, registro (3 roles)
│       ├── lotes.py             # Catálogo, CTEs, pasaporte QR
│       ├── exportadores.py      # Dashboard, órdenes de compra
│       ├── operadores.py        # Experiencias, reservas, fincas
│       ├── turistas.py          # Perfil turista
│       ├── productores.py       # Registro WhatsApp, lotes
│       └── chatbot.py           # Claude API integration
│
├── magdalenatrace-web/          # ⚛️ Frontend React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Hero animado + 4 secciones
│   │   │   ├── Login.jsx        # Split-screen, 4 actores
│   │   │   ├── Registro.jsx     # Multi-rol con selección dinámica
│   │   │   ├── Mapa.jsx         # Mapa Leaflet con fincas
│   │   │   ├── LotePublico/     # Pasaporte digital (QR)
│   │   │   ├── Exportador/      # Dashboard exportador
│   │   │   ├── Operador/        # Panel operador turístico
│   │   │   ├── Experiencia/     # Vista pública experiencia
│   │   │   ├── Chatbot/         # Chatbot IA
│   │   │   └── WhatsAppBot/     # Simulador productor
│   │   ├── components/
│   │   │   └── ui/              # CertBadge, LoteCard, AlertMessage…
│   │   ├── api/
│   │   │   └── client.js        # Axios + token injection
│   │   ├── data/
│   │   │   └── seed.js          # Datos demo para fallback
│   │   └── index.css            # Paleta Magdalena + animaciones
│   └── index.html
│
└── README.md
```

---

## 🌿 Ramas Git

```
main                      ← producción (Railway + Vercel)
develop                   ← integración del equipo
feat/api-mauricio         ← API backend (Mauricio)
feat/web-damian           ← frontend web (Damián)
feat/qr-operador-camila   ← QR y operador turístico (Camila)
feat/demo-datos-nicolle   ← datos demo y presentación (Nicolle)
```

**Flujo de trabajo:**

```bash
# Cada integrante trabaja en su rama personal
git checkout feat/mi-rama
git add .
git commit -m "feat: descripción del cambio"
git push origin feat/mi-rama

# Mauricio integra en develop y luego en main para deploy
```

> **Convención de commits:** `feat:` nueva función · `fix:` corrección · `docs:` documentación · `refactor:` refactorización

---

## 🏅 Sobre el reto

**Hackathon Colombia 5.0** es la competencia de innovación tecnológica más importante del Caribe colombiano, organizada por la Institución Universitaria de Santa Marta (USM). La edición 2026 tuvo lugar el **28 de mayo en Santa Marta**, con el reto de desarrollar soluciones digitales para la cadena de valor agrícola y turística del departamento del Magdalena.

**Equipo BahIA SMR** eligió construir MagdalenaTrace: una plataforma de trazabilidad que conecta a los pequeños productores de café, cacao y banano de la Sierra Nevada de Santa Marta con exportadores internacionales y turistas, usando tecnología accesible (WhatsApp para los productores) y estándares internacionales de certificación (Fairtrade, Rainforest Alliance, BPA).

---

<div align="center">

**🌿 BahIA SMR — Hackathon Colombia 5.0 — USM Santa Marta 2026**

*"Educación que permanece" — Institución Universitaria de Santa Marta*

</div>
