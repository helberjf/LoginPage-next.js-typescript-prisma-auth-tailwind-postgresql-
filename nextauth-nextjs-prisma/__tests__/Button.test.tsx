import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/ui/button'

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('should apply default classes', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-4', 'py-2', 'rounded-md', 'font-medium', 'text-sm')
    expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white')
  })

  it('should apply additional classes', () => {
    render(<Button className="custom-class">Click me</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.className).toContain('disabled:opacity-50')
    expect(button.className).toContain('disabled:cursor-not-allowed')
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick} disabled>Click me</Button>)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })
})