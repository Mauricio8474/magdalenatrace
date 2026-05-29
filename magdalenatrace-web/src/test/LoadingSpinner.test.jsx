import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '../components/ui/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders default label', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
  })

  it('renders custom label', () => {
    render(<LoadingSpinner label="Espere por favor…" />)
    expect(screen.getByText('Espere por favor…')).toBeInTheDocument()
  })

  it('does not render label when empty string', () => {
    render(<LoadingSpinner label="" />)
    expect(screen.queryByText('Cargando…')).toBeNull()
  })

  it('renders spinner div', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('div > div:first-child')
    expect(spinner).toBeInTheDocument()
  })
})
