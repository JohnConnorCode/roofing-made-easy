import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BarChart } from './bar-chart'

const sampleData = [
  { label: 'January', value: 100 },
  { label: 'February', value: 200 },
  { label: 'March', value: 150 },
]

describe('BarChart', () => {
  it('renders "No data available" when data is empty', () => {
    render(<BarChart data={[]} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders correct number of bars for vertical chart (default)', () => {
    const { container } = render(<BarChart data={sampleData} />)
    // Each vertical bar item is a flex column div containing the value, bar, and label
    // The labels are rendered as text content
    for (const item of sampleData) {
      expect(screen.getByText(item.label)).toBeInTheDocument()
    }
    // Verify values are shown (toLocaleString format by default)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('renders correct number of bars for horizontal chart', () => {
    render(<BarChart data={sampleData} horizontal />)
    for (const item of sampleData) {
      expect(screen.getByText(item.label)).toBeInTheDocument()
    }
    // Values should also be visible
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('shows formatted values when formatValue is provided', () => {
    const formatValue = (v: number) => `$${v}`
    render(<BarChart data={sampleData} formatValue={formatValue} />)
    expect(screen.getByText('$100')).toBeInTheDocument()
    expect(screen.getByText('$200')).toBeInTheDocument()
    expect(screen.getByText('$150')).toBeInTheDocument()
  })

  it('shows formatted values in horizontal mode', () => {
    const formatValue = (v: number) => `${v}%`
    render(<BarChart data={sampleData} formatValue={formatValue} horizontal />)
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('200%')).toBeInTheDocument()
    expect(screen.getByText('150%')).toBeInTheDocument()
  })

  it('shows labels for each data item', () => {
    render(<BarChart data={sampleData} />)
    expect(screen.getByText('January')).toBeInTheDocument()
    expect(screen.getByText('February')).toBeInTheDocument()
    expect(screen.getByText('March')).toBeInTheDocument()
  })

  it('uses custom colors when provided', () => {
    const dataWithColors = [
      { label: 'A', value: 50, color: '#ff0000' },
      { label: 'B', value: 80, color: '#00ff00' },
    ]
    const { container } = render(<BarChart data={dataWithColors} />)
    // The bar divs use inline backgroundColor styles
    const bars = container.querySelectorAll('[style*="background-color"]')
    const styles = Array.from(bars).map((el) => (el as HTMLElement).style.backgroundColor)
    // rgb conversion of #ff0000 and #00ff00
    expect(styles).toContain('rgb(255, 0, 0)')
    expect(styles).toContain('rgb(0, 255, 0)')
  })

  it('uses default colors when custom colors are not provided', () => {
    const { container } = render(<BarChart data={sampleData} />)
    const bars = container.querySelectorAll('[style*="background-color"]')
    expect(bars.length).toBe(sampleData.length)
    // First default color is #d4a853
    expect((bars[0] as HTMLElement).style.backgroundColor).toBe('rgb(212, 168, 83)')
  })

  it('applies the specified height to the vertical chart container', () => {
    const { container } = render(<BarChart data={sampleData} height={300} />)
    const chartContainer = container.firstChild as HTMLElement
    expect(chartContainer.style.height).toBe('300px')
  })

  it('handles single data point', () => {
    const single = [{ label: 'Only', value: 42 }]
    render(<BarChart data={single} />)
    expect(screen.getByText('Only')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })
})
