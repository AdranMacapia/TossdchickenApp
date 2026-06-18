import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { NumericKeypad } from './NumericKeypad'

describe('NumericKeypad', () => {
  it('renders buttons for digits 0-9 and backspace', () => {
    render(<NumericKeypad value={0} onChange={vi.fn()} />)
    for (let d = 0; d <= 9; d++) {
      expect(screen.getByLabelText(String(d))).toBeInTheDocument()
    }
    expect(screen.getByLabelText('backspace')).toBeInTheDocument()
  })

  it('appends digit to current value', async () => {
    const onChange = vi.fn()
    render(<NumericKeypad value={5} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('3'))
    expect(onChange).toHaveBeenCalledWith(53)
  })

  it('removes last digit on backspace', async () => {
    const onChange = vi.fn()
    render(<NumericKeypad value={53} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('backspace'))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('backspace on single digit returns 0', async () => {
    const onChange = vi.fn()
    render(<NumericKeypad value={5} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('backspace'))
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('clamps to max', async () => {
    const onChange = vi.fn()
    render(<NumericKeypad value={9} onChange={onChange} max={20} />)
    await userEvent.click(screen.getByLabelText('9')) // 9×10+9=99 → clamp to 20
    expect(onChange).toHaveBeenCalledWith(20)
  })
})
