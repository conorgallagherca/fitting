// Jest setup file for FitLingo testing
// This file is run once to set up the testing environment

import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession() {
    return {
      data: null,
      status: 'unauthenticated',
    }
  },
  SessionProvider: ({ children }) => children,
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock Zustand stores
jest.mock('@/lib/gamification-store', () => ({
  useGamificationStore: () => ({
    badges: [],
    unlockedBadges: [],
    newBadges: [],
    notifications: {
      enabled: false,
      time: '18:00',
      permission: 'default',
    },
    showBadgeModal: false,
    celebrationQueue: [],
    requestNotificationPermission: jest.fn(),
    updateNotificationSettings: jest.fn(),
    scheduleDailyReminder: jest.fn(),
    dismissBadgeModal: jest.fn(),
    clearNewBadges: jest.fn(),
    testStreakMilestone: jest.fn(),
    testWorkoutMilestone: jest.fn(),
  }),
}))

// Mock recharts for chart components
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}))

// Mock browser APIs that might not be available in test environment
Object.defineProperty(window, 'Notification', {
  value: jest.fn(() => ({
    close: jest.fn(),
  })),
  configurable: true,
})

// Mock matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Silence console.warn and console.error during tests unless explicitly needed
const originalWarn = console.warn
const originalError = console.error

beforeAll(() => {
  console.warn = (...args) => {
    if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('ReactDOM.render')) {
      return
    }
    originalWarn.call(console, ...args)
  }
  
  console.error = (...args) => {
    if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('Error:')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
}) 