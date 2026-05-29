import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AlertMessage from '../components/ui/AlertMessage'

describe('AlertMessage', () => {
  it('renders null when no message', () => {
    const { container } = render(<AlertMessage />)
    expect(container.firstChild).toBeNull()
  })

  it('renders message text', () => {
    render(<AlertMessage message="Test alert" />)
    expect(screen.getByText('Test alert')).toBeInTheDocument()
  })

  it('renders success icon for success type', () => {
    render(<AlertMessage type="success" message="OK" />)
    expect(screen.getByText('✅')).toBeInTheDocument()
  })

  it('renders close button when onClose is provided', () => {
    const onClose = vi.fn()
    render(<AlertMessage message="Dismiss" onClose={onClose} />)
    fireEvent.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not render close button when onClose is not provided', () => {
    render(<AlertMessage message="No close" />)
    expect(screen.queryByText('✕')).toBeNull()
  })
})
