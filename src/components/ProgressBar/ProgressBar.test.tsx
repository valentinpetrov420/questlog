import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProgressBar from './ProgressBar'

describe('ProgressBar', () => {
  it('displays the percent text', () => {
    render(<ProgressBar percent={67} />)

    expect(screen.getByText('67%')).toBeInTheDocument()
  });

  it('sets the fill width to match percent, 50%', () => {
    render(<ProgressBar percent={50} />)
    const fill = screen.getByText('50%')
    expect(fill).toHaveStyle({ width: '50%' })
  });
  it('sets the fill width to match percent, 0%', () => {
    render(<ProgressBar percent={0} />)
    const fill = screen.getByText('0%')
    expect(fill).toHaveStyle({ width: '0%' })
  });
  it('sets the fill width to match percent, 100%', () => {
    render(<ProgressBar percent={100} />)
    const fill = screen.getByText('100%')
    expect(fill).toHaveStyle({ width: '100%' })
  });
});