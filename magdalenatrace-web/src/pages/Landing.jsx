import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// ── SVG helpers ───────────────────────────────────────────────────

function LeafIcon({ size = 28, color = '#D4A04A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 3C11 6.5 6 11 6 16.5C6 20.6 9.6 24 14 24C18.4 24 22 20.6 22 16.5C22 11 17 6.5 14 3Z" fill={color} />
      <path d="M14 11V24" stroke={color === '#D4A04A' ? '#2D6A4F' : 'rgba(255,255,255,0.35)'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CoffeePatternBg({ opacity = 0.08, patternId = 'cp0' }) {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <pattern id={patternId} width="120" height="120" patternUnits="userSpaceOnUse">
          <ellipse cx="28" cy="24" rx="8" ry="13" fill="white" opacity={opacity} transform="rotate(32 28 24)" />
          <path d="M24 13 Q28 24 24 35" stroke="white" strokeWidth="1" fill="none" opacity={opacity * 0.6} />
          <ellipse cx="88" cy="62" rx="8" ry="13" fill="white" opacity={opacity} transform="rotate(-22 88 62)" />
          <path d="M84 51 Q88 62 84 73" stroke="white" strokeWidth="1" fill="none" opacity={opacity * 0.6} />
          <ellipse cx="18" cy="92" rx="6" ry="9" fill="white" opacity={opacity * 0.7} transform="rotate(14 18 92)" />
          <ellipse cx="98" cy="14" rx="5" ry="8" fill="white" opacity={opacity * 0.7} transform="rotate(-40 98 14)" />
          <ellipse cx="60" cy="106" rx="7" ry="11" fill="white" opacity={opacity} transform="rotate(10 60 106)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

// ── Navbar ────────────────────────────────────────────────────────

function Navbar({ scrolled }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(62,31,0,0.97)' : 'rgba(62,31,0,0.88)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(16px, 4vw, 48px)',
      transition: 'background 0.3s, box-shadow 0.3s',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.3)' : 'none',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ animation: 'leafSway 3.5s ease-in-out infinite' }}>
          <LeafIcon size={28} color="#D4A04A" />
        </div>
        <span style={{
          fontFamily: 'var(--font-titulo)',
          fontSize: 19, fontWeight: 700,
          color: '#D4A04A', letterSpacing: 0.2,
        }}>
          MagdalenaTrace
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link to="/registro?rol=operador" style={{
          color: 'rgba(255,255,255,0.6)', fontSize: 13,
          whiteSpace: 'nowrap', transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.target.style.color = '#D4A04A'}
        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
        >
          🏕️ Soy operador
        </Link>
        <Link to="/login">
          <button style={{
            background: 'transparent', color: '#D4A04A',
            border: '1.5px solid rgba(212,160,74,0.7)',
            borderRadius: 8, padding: '8px 18px',
            fontFamily: 'var(--font-cuerpo)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(212,160,74,0.12)'; e.target.style.borderColor = '#D4A04A' }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(212,160,74,0.7)' }}
          >
            Iniciar sesión
          </button>
        </Link>
        <Link to="/registro">
          <button style={{
            background: 'var(--verde-sierra)', color: 'white',
            border: 'none', borderRadius: 8, padding: '8px 18px',
            fontFamily: 'var(--font-cuerpo)', fontWeight: 600, fontSize: 13,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.target.style.background = 'var(--verde-medio)'}
          onMouseLeave={e => e.target.style.background = 'var(--verde-sierra)'}
          >
            Registrarse
          </button>
        </Link>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--cafe-oscuro) 0%, #1a3525 55%, var(--verde-sierra) 100%)',
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <CoffeePatternBg opacity={0.08} patternId="heroPattern" />

      <div style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center',
        padding: 'clamp(100px, 14vw, 140px) clamp(20px, 5vw, 60px) 80px',
        maxWidth: 840, margin: '0 auto',
      }}>
        {/* Region badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(212,160,74,0.14)',
          border: '1px solid rgba(212,160,74,0.4)',
          borderRadius: 24, padding: '6px 16px',
          color: '#D4A04A', fontSize: 12, fontWeight: 500,
          marginBottom: 32,
          animation: 'fadeIn 0.8s ease 0.2s both',
          letterSpacing: 0.3,
        }}>
          <span>🌿</span>
          <span>Sierra Nevada de Santa Marta · Departamento del Magdalena</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-titulo)',
          fontSize: 'clamp(36px, 6vw, 66px)',
          fontWeight: 800,
          color: 'white',
          lineHeight: 1.15,
          marginBottom: 26,
        }}>
          <span style={{
            display: 'block',
            animation: 'wordAppear 0.8s ease 0.4s both',
            opacity: 0,
          }}>
            La historia de cada grano,
          </span>
          <span style={{
            display: 'block',
            color: '#D4A04A',
            animation: 'wordAppear 0.8s ease 0.8s both',
            opacity: 0,
          }}>
            en la palma de tu mano
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          color: 'var(--verde-claro)',
          fontSize: 'clamp(15px, 2vw, 19px)',
          lineHeight: 1.7,
          maxWidth: 560, margin: '0 auto 44px',
          animation: 'wordAppear 0.8s ease 1.1s both',
          opacity: 0,
        }}>
          Trazabilidad digital certificada para el café, cacao y banano
          de la Sierra Nevada de Santa Marta
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
          animation: 'wordAppear 0.8s ease 1.4s both',
          opacity: 0,
        }}>
          <Link to="/mapa">
            <button className="btn-secondary" style={{ padding: '14px 28px', fontSize: 15 }}>
              🗺️ Ver el mapa de fincas
            </button>
          </Link>
          <Link to="/login">
            <button className="btn-outline" style={{ padding: '14px 28px', fontSize: 15 }}>
              Soy exportador →
            </button>
          </Link>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'flex', gap: 'clamp(20px, 5vw, 56px)',
          justifyContent: 'center', marginTop: 64,
          animation: 'wordAppear 0.8s ease 1.7s both', opacity: 0,
        }}>
          {[
            { num: '5+',   label: 'Fincas certificadas' },
            { num: '3',    label: 'Cultivos trazados' },
            { num: '100%', label: 'Digital y verificable' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: 800, color: '#D4A04A',
                fontFamily: 'var(--font-titulo)',
                lineHeight: 1,
              }}>
                {s.num}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4, letterSpacing: 0.3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 28,
        left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        color: 'rgba(255,255,255,0.35)',
        animation: 'fadeIn 1s ease 2.2s both',
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>Explorar</span>
        <span style={{ display: 'inline-block', animation: 'bounceArrow 2s ease-in-out infinite' }}>▼</span>
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────

function HowItWorks() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const cards = [
    {
      icon: '🌿',
      role: 'Exportador',
      accent: 'var(--verde-sierra)',
      desc: 'Accede al catálogo de lotes certificados, genera órdenes de compra y descarga la trazabilidad completa para tus clientes internacionales.',
      link: '/login',
    },
    {
      icon: '🗺️',
      role: 'Turista / Comprador',
      accent: 'var(--azul-caribe)',
      desc: 'Escanea el QR de cualquier producto y conoce su historia: la finca, el agricultor, las certificaciones y las experiencias disponibles.',
      link: '/mapa',
    },
    {
      icon: '🏕️',
      role: 'Operador Turístico',
      accent: '#0077B6',
      desc: 'Vincula tus experiencias de agroturismo a fincas reales y ofrece a tus visitantes una conexión auténtica con el origen del producto.',
      link: '/registro?rol=operador',
    },
    {
      icon: '🌱',
      role: 'Productor',
      accent: '#2AABEE',
      desc: 'Los productores registran sus fincas, lotes y eventos de trazabilidad directamente desde Telegram — sin necesidad de cuenta web.',
      link: '/whatsapp',
      badge: 'Vía Telegram',
    },
  ]

  return (
    <section style={{ background: 'var(--crema)', padding: 'clamp(64px, 8vw, 96px) clamp(20px, 5vw, 48px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{
            fontFamily: 'var(--font-titulo)',
            fontSize: 'clamp(26px, 4vw, 40px)',
            color: 'var(--verde-sierra)',
            marginBottom: 14,
          }}>
            Una cadena. Cuatro actores. Un sistema.
          </h2>
          <p style={{ color: 'var(--texto-medio)', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Cada rol tiene su portal. Todos comparten la misma trazabilidad.
          </p>
        </div>

        <div ref={ref} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
        }}>
          {cards.map((card, i) => (
            <Link key={i} to={card.link || '/'} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white',
                borderRadius: 18,
                padding: '30px 26px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${card.accent}`,
                height: '100%',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(36px)',
                transition: `opacity 0.65s ease ${i * 0.15}s, transform 0.65s ease ${i * 0.15}s`,
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 14px 44px rgba(0,0,0,0.13)'
                e.currentTarget.style.transform = 'translateY(-5px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              >
                {card.badge && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    background: '#DCFCE7', color: '#16A34A',
                    fontSize: 10, fontWeight: 700, padding: '3px 8px',
                    borderRadius: 20, letterSpacing: 0.3,
                  }}>
                    {card.badge}
                  </div>
                )}
                <div style={{ fontSize: 38, marginBottom: 14 }}>{card.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-titulo)',
                  fontSize: 20, color: 'var(--texto-oscuro)',
                  marginBottom: 10, fontWeight: 700,
                }}>
                  {card.role}
                </h3>
                <p style={{ color: 'var(--texto-medio)', lineHeight: 1.75, fontSize: 14 }}>
                  {card.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Certificaciones ───────────────────────────────────────────────

function Certificaciones() {
  const certs = [
    {
      name: 'Fairtrade',
      bg: '#27AE60',
      icon: '🌱',
      desc: 'Garantiza condiciones laborales justas y un precio mínimo estable para los productores de la Sierra Nevada.',
    },
    {
      name: 'Rainforest Alliance',
      bg: '#1A5C38',
      icon: '🌳',
      desc: 'Promueve la sostenibilidad ambiental, el bienestar comunitario y la conservación de la biodiversidad regional.',
    },
    {
      name: 'BPA',
      bg: '#0077B6',
      icon: '✅',
      desc: 'Buenas Prácticas Agrícolas certificadas por el ICA de Colombia. Garantía de inocuidad y calidad del producto.',
    },
  ]

  return (
    <section style={{
      background: 'var(--verde-sierra)',
      padding: 'clamp(64px, 8vw, 96px) clamp(20px, 5vw, 48px)',
      position: 'relative', overflow: 'hidden',
    }}>
      <CoffeePatternBg opacity={0.05} patternId="certPattern" />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--font-titulo)',
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            color: 'white', marginBottom: 12,
          }}>
            Productos verificados bajo estándares internacionales
          </h2>
          <p style={{ color: 'var(--verde-pale)', fontSize: 16, maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>
            Cada lote viene acompañado de la documentación necesaria para acceder a mercados premium en Europa y Norteamérica
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
        }}>
          {certs.map(cert => (
            <div key={cert.name} style={{
              background: 'rgba(255,255,255,0.09)',
              backdropFilter: 'blur(8px)',
              borderRadius: 18,
              padding: '32px 26px',
              border: '1px solid rgba(255,255,255,0.14)',
              textAlign: 'center',
              transition: 'background 0.25s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: cert.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 18px',
                boxShadow: `0 4px 18px ${cert.bg}60`,
              }}>
                {cert.icon}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-titulo)',
                color: 'white', fontSize: 20, marginBottom: 10,
              }}>
                {cert.name}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, fontSize: 14 }}>
                {cert.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Productos ─────────────────────────────────────────────────────

function Productos() {
  const productos = [
    {
      nombre: 'Café',
      emoji: '☕',
      gradient: 'linear-gradient(145deg, #3E1F00 0%, #2D6A4F 100%)',
      altitud: '900 – 1.800 msnm',
      region: 'Sierra Nevada de Santa Marta',
      desc: 'Café de especialidad con perfil aromático único, cultivado por familias indígenas y campesinas de la Sierra Nevada.',
    },
    {
      nombre: 'Cacao',
      emoji: '🍫',
      gradient: 'linear-gradient(145deg, #1a0a00 0%, #7B3F00 55%, #D4A04A 100%)',
      altitud: '300 – 1.000 msnm',
      region: 'Zona Bananera, Magdalena',
      desc: 'Cacao fino de aroma con alta demanda en el mercado de chocolate artesanal europeo y norteamericano.',
    },
    {
      nombre: 'Banano',
      emoji: '🍌',
      gradient: 'linear-gradient(145deg, #1a3a2a 0%, #40916C 55%, #8fbc4a 100%)',
      altitud: '0 – 400 msnm',
      region: 'Ciénaga, Magdalena',
      desc: 'Banano certificado para exportación con trazabilidad completa desde la finca hasta el puerto de Santa Marta.',
    },
  ]

  return (
    <section style={{ background: 'var(--crema)', padding: 'clamp(64px, 8vw, 96px) clamp(20px, 5vw, 48px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--font-titulo)',
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            color: 'var(--cafe-oscuro)', marginBottom: 12,
          }}>
            Los productos del Magdalena
          </h2>
          <p style={{ color: 'var(--texto-medio)', fontSize: 16 }}>
            Tres cultivos. Una historia de origen verificable.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 28,
        }}>
          {productos.map(p => (
            <div key={p.nombre} style={{
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.11)',
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.17)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.11)'
            }}
            >
              <div style={{ background: p.gradient, padding: '44px 28px 32px', position: 'relative' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>{p.emoji}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-titulo)',
                    fontSize: 28, color: 'white', fontWeight: 700, marginBottom: 4,
                  }}>
                    {p.nombre}
                  </h3>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                    📍 {p.region}
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', padding: '22px 28px' }}>
                <div style={{
                  display: 'inline-block',
                  background: 'var(--verde-pale)', color: 'var(--verde-sierra)',
                  borderRadius: 8, padding: '4px 10px',
                  fontSize: 12, fontWeight: 600, marginBottom: 12,
                }}>
                  ⛰️ {p.altitud}
                </div>
                <p style={{ color: 'var(--texto-medio)', lineHeight: 1.7, fontSize: 14, marginBottom: 18 }}>
                  {p.desc}
                </p>
                <Link to="/mapa">
                  <button style={{
                    width: '100%', background: 'var(--verde-sierra)', color: 'white',
                    border: 'none', borderRadius: 8, padding: '10px 20px',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-cuerpo)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'var(--cafe-oscuro)'; e.target.style.transform = 'scale(1.01)' }}
                  onMouseLeave={e => { e.target.style.background = 'var(--verde-sierra)'; e.target.style.transform = 'scale(1)' }}
                  >
                    Ver lotes disponibles →
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      background: 'var(--cafe-oscuro)',
      padding: 'clamp(48px, 6vw, 72px) clamp(20px, 5vw, 48px) 36px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 40, marginBottom: 48,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <LeafIcon size={22} color="#D4A04A" />
              <span style={{
                fontFamily: 'var(--font-titulo)', fontSize: 16, fontWeight: 700, color: '#D4A04A',
              }}>
                MagdalenaTrace
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', maxWidth: 220 }}>
              Educación que permanece — Institución Universitaria de Santa Marta
            </p>
          </div>

          <div>
            <h4 style={{
              fontFamily: 'var(--font-titulo)', color: '#D4A04A',
              fontSize: 15, marginBottom: 16, fontWeight: 600,
            }}>
              Plataforma
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Mapa de fincas',            to: '/mapa' },
                { label: 'Para exportadores',          to: '/login' },
                { label: 'Para turistas',              to: '/mapa' },
                { label: 'Operadores turísticos',      to: '/registro?rol=operador' },
                { label: 'Chatbot IA',                 to: '/chatbot' },
              ].map(l => (
                <Link key={l.label} to={l.to} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#D4A04A'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-titulo)', color: '#D4A04A', fontSize: 15, marginBottom: 16, fontWeight: 600 }}>
              Contacto
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              <span>📧 info@magdalenatrace.co</span>
              <span>📍 Santa Marta, Magdalena</span>
              <span>🌐 Hackathon Colombia 5.0</span>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 22,
          display: 'flex', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
          fontSize: 12, color: 'rgba(255,255,255,0.35)',
        }}>
          <span>© 2026 MagdalenaTrace — Hackathon Colombia 5.0</span>
          <span>Institución Universitaria de Santa Marta · USM</span>
        </div>
      </div>
    </footer>
  )
}

// ── Main ──────────────────────────────────────────────────────────

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div style={{ fontFamily: 'var(--font-cuerpo)', overflowX: 'hidden' }}>
      <Navbar scrolled={scrolled} />
      <Hero />
      <HowItWorks />
      <Certificaciones />
      <Productos />
      <Footer />
    </div>
  )
}
