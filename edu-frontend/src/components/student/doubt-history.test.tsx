import { render, waitFor } from '@testing-library/react'
import DoubtHistory from './doubt-history'

const getMock = jest.fn()

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => getMock(...args),
  },
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

jest.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: { user: { grade_level: string } }) => unknown) =>
    selector({ user: { grade_level: '10' } }),
}))

describe('DoubtHistory', () => {
  beforeEach(() => {
    getMock.mockReset()
    getMock.mockResolvedValue({
      data: {
        doubts: [],
        totalCount: 0,
      },
    })
  })

  it('requests doubt history from the student doubts endpoint', async () => {
    render(<DoubtHistory />)

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/student/doubts?page=1&limit=10')
    })
  })
})
