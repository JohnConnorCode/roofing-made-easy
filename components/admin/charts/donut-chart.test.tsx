import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DonutChart } from './donut-chart'

const sampleData = [
  { label: 'Residential', value: 60 },
  { label: 'Commercial', value: 30 },
  { label: 'Repairs', value: 10 },
]

describe('DonutChart', () => {
  it('renders "No data available" when data is empty', () => {
    render(<DonutChart data={[]} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders "No data available" when all values are 0', () => {
    const zeroData = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 },
    ]
    render(<DonutChart data={zeroData} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders SVG circles for each data item', () => {
    const { container } = render(<DonutChart data={sampleData} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    const circles = svg!.querySelectorAll('circle')
    expect(circles.length).toBe(sampleData.length)
  })

  it('shows legend with labels and percentages', () => {
    render(<DonutChart data={sampleData} />)
    // Labels should appear in the legend
    expect(screen.getByText('Residential')).toBeInTheDocument()
    expect(screen.getByText('Commercial')).toBeInTheDocument()
    expect(screen.getByText('Repairs')).toBeInTheDocument()
    // Percentages: 60/100=60%, 30/100=30%, 10/100=10%
    expect(screen.getByText(/60%/)).toBeInTheDocument()
    expect(screen.getByText(/30%/)).toBeInTheDocument()
    expect(screen.getByText(/10%/)).toBeInTheDocument()
  })

  it('shows center label and center value when provided', () => {
    render(
      <DonutChart
        data={sampleData}
        centerLabel="Total"
        centerValue="100"
      />
    )
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('does not render center section when centerLabel and centerValue are not provided', () => {
    const { container } = render(<DonutChart data={sampleData} />)
    // The center overlay div should not exist
    const relativeDiv = container.querySelector('.relative')
    const centerOverlay = relativeDiv?.querySelector('.absolute.inset-0')
    expect(centerOverlay).toBeNull()
  })

  it('uses custom colors when provided', () => {
    const dataWithColors = [
      { label: 'X', value: 50, color: '#ff0000' },
      { label: 'Y', value: 50, color: '#0000ff' },
    ]
    const { container } = render(<DonutChart data={dataWithColors} />)
    const circles = container.querySelectorAll('circle')
    expect(circles[0].getAttribute('stroke')).toBe('#ff0000')
    expect(circles[1].getAttribute('stroke')).toBe('#0000ff')
  })

  it('uses default colors when custom colors are not provided', () => {
    const { container } = render(<DonutChart data={sampleData} />)
    const circles = container.querySelectorAll('circle')
    // First default color is #d4a853
    expect(circles[0].getAttribute('stroke')).toBe('#d4a853')
    // Second default color is #3b82f6
    expect(circles[1].getAttribute('stroke')).toBe('#3b82f6')
  })

  it('uses formatValue for legend display', () => {
    const formatValue = (v: number) => `$${v}k`
    render(<DonutChart data={sampleData} formatValue={formatValue} />)
    expect(screen.getByText(/\$60k/)).toBeInTheDocument()
    expect(screen.getByText(/\$30k/)).toBeInTheDocument()
    expect(screen.getByText(/\$10k/)).toBeInTheDocument()
  })

  it('renders legend color swatches matching chart colors', () => {
    const dataWithColors = [
      { label: 'A', value: 70, color: '#123456' },
      { label: 'B', value: 30, color: '#654321' },
    ]
    const { container } = render(<DonutChart data={dataWithColors} />)
    // Legend swatches are span elements with inline backgroundColor
    const swatches = container.querySelectorAll('span[style*="background-color"]')
    expect(swatches.length).toBe(2)
    expect((swatches[0] as HTMLElement).style.backgroundColor).toBe('rgb(18, 52, 86)')
    expect((swatches[1] as HTMLElement).style.backgroundColor).toBe('rgb(101, 67, 33)')
  })

  it('respects custom size prop', () => {
    const { container } = render(<DonutChart data={sampleData} size={200} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('200')
    expect(svg?.getAttribute('height')).toBe('200')
  })
})
