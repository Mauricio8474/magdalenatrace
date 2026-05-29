import { describe, it, expect } from 'vitest'

describe('App Routing', () => {
  it('imports all page components without error', async () => {
    const Landing = await import('../pages/Landing.jsx')
    expect(Landing.default).toBeDefined()
  })

  it('imports Login without error', async () => {
    const Login = await import('../pages/Login.jsx')
    expect(Login.default).toBeDefined()
  })

  it('imports App without error', async () => {
    const App = await import('../App.jsx')
    expect(App.default).toBeDefined()
  })
})
