/**
 * Mock mode configuration
 * When NEXT_PUBLIC_MOCK_MODE=true, the app uses in-memory mocks instead of real services
 */

export const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
}

export const getMockDelay = (): number => {
  // Simulate network latency in mock mode
  const delay = process.env.NEXT_PUBLIC_MOCK_DELAY
  return delay ? parseInt(delay, 10) : 100
}

export const simulateDelay = async (): Promise<void> => {
  const delay = getMockDelay()
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}
