import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import DeckCarouselViewer from './DeckCarouselViewer'

const pushMock = jest.fn()
const toastMock = jest.fn()
const regenerateClusterMock = jest.fn()
const switchSlideLayoutMock = jest.fn()
const updateStructuredDeckMock = jest.fn()
const generateLevelMock = jest.fn()
const generateAndDownloadPPTXMock = jest.fn()
const addActivityCallbackRef: { current?: (activity: any) => Promise<void> | void } = {}
const addSlideCallbackRef: { current?: (slide: any) => Promise<void> | void } = {}
const routerMock = {
  push: pushMock,
}
const searchParamsMock = {
  get: jest.fn(),
}
const toastApiMock = {
  toast: toastMock,
}

jest.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  useSearchParams: () => searchParamsMock,
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => toastApiMock,
}))

jest.mock('@/lib/deckService', () => ({
  deckService: {
    generateLevel: (...args: unknown[]) => generateLevelMock(...args),
    generateAndDownloadPPTX: (...args: unknown[]) => generateAndDownloadPPTXMock(...args),
    updateStructuredDeck: (...args: unknown[]) => updateStructuredDeckMock(...args),
    regenerateCluster: (...args: unknown[]) => regenerateClusterMock(...args),
    switchSlideLayout: (...args: unknown[]) => switchSlideLayoutMock(...args),
  },
}))

jest.mock('./AddActivityModal', () => ({
  AddActivityModal: ({ onAddActivity }: { onAddActivity: (activity: any) => Promise<void> | void }) => {
    addActivityCallbackRef.current = onAddActivity
    return (
      <button
        type="button"
        onClick={() => onAddActivity({
          title: 'Quick Check',
          content: 'What happens without a force?',
          bloom_level: 'APPLY',
        })}
      >
        Trigger Add Activity
      </button>
    )
  },
}))

jest.mock('./AddSlideModal', () => ({
  AddSlideModal: ({ onAddSlide }: { onAddSlide: (slide: any) => Promise<void> | void }) => {
    addSlideCallbackRef.current = onAddSlide
    return (
      <button
        type="button"
        onClick={() => onAddSlide({
          title: 'Worked Example',
          content: 'A force creates acceleration.',
          slideType: 'CONCEPT',
          bloom_level: 'APPLY',
        })}
      >
        Trigger Add Slide
      </button>
    )
  },
}))

jest.mock('@/components/visuals/VisualRenderer', () => ({
  VisualRenderer: () => <div>Visual Preview</div>,
}))

const baseDeck = {
  id: 'deck_1',
  meta: {
    lesson_id: 'lesson_1',
    topic: 'Newton',
    subject: 'Physics',
    grade: '9',
    standards: [],
    theme: 'blueprint',
    pedagogical_model: 'I_DO_WE_DO_YOU_DO',
    created_at: '2026-05-24T00:00:00.000Z',
  },
  structure: {
    learning_objectives: [],
    vocabulary: [],
    prerequisites: [],
    bloom_progression: [],
  },
  slides: [{
    id: 'slide_1',
    title: 'Concept 1',
    content: 'Force changes motion.',
    order: 1,
    slideType: 'CONCEPT',
    bloom_level: 'UNDERSTAND',
    clusterId: 'explain_1',
    pedagogicalRole: 'explain_core',
    instructionalGoal: 'Explain',
    layoutCandidates: ['concept-with-image', 'two-column-explain'],
    editingHints: {
      locked: false,
    },
  }],
  createdBy: 'teacher_1',
  createdAt: '2026-05-24T00:00:00.000Z',
  updatedAt: '2026-05-24T00:00:00.000Z',
}

describe('DeckCarouselViewer structured editing', () => {
  beforeEach(() => {
    pushMock.mockReset()
    toastMock.mockReset()
    regenerateClusterMock.mockReset()
    switchSlideLayoutMock.mockReset()
    updateStructuredDeckMock.mockReset()
    generateLevelMock.mockReset()
    generateAndDownloadPPTXMock.mockReset()
    addActivityCallbackRef.current = undefined
    addSlideCallbackRef.current = undefined
    sessionStorage.clear()
    sessionStorage.setItem('currentDeck', JSON.stringify(baseDeck))
    sessionStorage.setItem('deckRequestParams', JSON.stringify({
      topic: 'Newton',
      subject: 'Physics',
      gradeLevel: '9',
    }))
  })

  it('calls the dedicated cluster regeneration service when adding an explain slide', async () => {
    regenerateClusterMock.mockResolvedValue({
      ...baseDeck,
      slides: [
        ...baseDeck.slides,
        {
          ...baseDeck.slides[0],
          id: 'slide_2',
          title: 'Concept 1 Explain More',
          order: 2,
          pedagogicalRole: 'explain_deepen',
          layoutCandidates: ['two-column-explain', 'concept-with-image'],
        },
      ],
    })
    switchSlideLayoutMock.mockResolvedValue(baseDeck)

    render(<DeckCarouselViewer />)

    fireEvent.click(await screen.findByRole('button', { name: /add explain slide/i }))

    await waitFor(() => {
      expect(regenerateClusterMock).toHaveBeenCalledWith({
        deckId: 'deck_1',
        clusterId: 'explain_1',
        pedagogicalRole: 'explain_deepen',
      })
    })
  })

  it('calls the dedicated layout switching service when changing a structured slide layout', async () => {
    regenerateClusterMock.mockResolvedValue(baseDeck)
    switchSlideLayoutMock.mockResolvedValue({
      ...baseDeck,
      slides: [{
        ...baseDeck.slides[0],
        layoutCandidates: ['two-column-explain', 'concept-with-image'],
      }],
    })

    render(<DeckCarouselViewer />)

    fireEvent.click(await screen.findByRole('button', { name: /switch layout/i }))

    await waitFor(() => {
      expect(switchSlideLayoutMock).toHaveBeenCalledWith({
        deckId: 'deck_1',
        slideId: 'slide_1',
        layoutId: 'two-column-explain',
      })
    })
  })

  it('persists lock-toggle edits through updateStructuredDeck', async () => {
    regenerateClusterMock.mockResolvedValue(baseDeck)
    switchSlideLayoutMock.mockResolvedValue(baseDeck)
    updateStructuredDeckMock.mockResolvedValue({
      ...baseDeck,
      slides: [{
        ...baseDeck.slides[0],
        editingHints: {
          locked: true,
        },
      }],
    })

    render(<DeckCarouselViewer />)

    fireEvent.click(await screen.findByRole('button', { name: /lock slide/i }))

    await waitFor(() => {
      expect(updateStructuredDeckMock).toHaveBeenCalledWith(
        'deck_1',
        expect.objectContaining({
          slides: [
            expect.objectContaining({
              id: 'slide_1',
              editingHints: expect.objectContaining({
                locked: true,
              }),
            }),
          ],
        })
      )
    })
  })

  it('persists added activities through updateStructuredDeck', async () => {
    regenerateClusterMock.mockResolvedValue(baseDeck)
    switchSlideLayoutMock.mockResolvedValue(baseDeck)
    updateStructuredDeckMock.mockResolvedValue({
      ...baseDeck,
      slides: [
        baseDeck.slides[0],
        {
          title: 'Quick Check',
          content: 'What happens without a force?',
          order: 2,
          slideType: 'ACTIVITY',
          bloom_level: 'APPLY',
        },
      ],
    })

    render(<DeckCarouselViewer />)

    fireEvent.click(await screen.findByRole('button', { name: /trigger add activity/i }))

    await waitFor(() => {
      expect(updateStructuredDeckMock).toHaveBeenCalledWith(
        'deck_1',
        expect.objectContaining({
          slides: [
            expect.objectContaining({ id: 'slide_1' }),
            expect.objectContaining({
              title: 'Quick Check',
              slideType: 'ACTIVITY',
              order: 2,
            }),
          ],
        })
      )
    })
  })

  it('does not show add-activity success or advance when updateStructuredDeck fails', async () => {
    updateStructuredDeckMock.mockRejectedValue(new Error('Persistence failed'))

    render(<DeckCarouselViewer />)

    fireEvent.click(await screen.findByRole('button', { name: /trigger add activity/i }))

    await waitFor(() => {
      expect(updateStructuredDeckMock).toHaveBeenCalled()
    })

    expect(screen.queryByText('Quick Check')).not.toBeInTheDocument()
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Save Failed',
      description: 'Persistence failed',
      variant: 'destructive',
    }))
    expect(toastMock).not.toHaveBeenCalledWith(expect.objectContaining({
      title: 'Activity Added',
    }))
  })

  it('does not show add-slide success or advance when updateStructuredDeck fails', async () => {
    updateStructuredDeckMock.mockRejectedValue(new Error('Persistence failed'))

    render(<DeckCarouselViewer />)

    fireEvent.click(await screen.findByRole('button', { name: /trigger add slide/i }))

    await waitFor(() => {
      expect(updateStructuredDeckMock).toHaveBeenCalled()
    })

    expect(screen.queryByText('Worked Example')).not.toBeInTheDocument()
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Save Failed',
      description: 'Persistence failed',
      variant: 'destructive',
    }))
    expect(toastMock).not.toHaveBeenCalledWith(expect.objectContaining({
      title: 'Slide Added',
    }))
  })

  it('keeps the fallback visual panel for layout-switched slides without a real visual type', async () => {
    regenerateClusterMock.mockResolvedValue(baseDeck)
    switchSlideLayoutMock.mockResolvedValue({
      ...baseDeck,
      slides: [{
        ...baseDeck.slides[0],
        layoutCandidates: ['two-column-explain', 'concept-with-image'],
        visualMetadata: {
          visualConfig: {
            selectedLayout: 'two-column-explain',
          },
        },
      }],
    })

    render(<DeckCarouselViewer />)

    fireEvent.click(await screen.findByRole('button', { name: /switch layout/i }))

    await waitFor(() => {
      expect(screen.getByText(/visual direction/i)).toBeInTheDocument()
      expect(screen.queryByText('Visual Preview')).not.toBeInTheDocument()
    })
  })

  it('stops the all-level download flow when a single PPTX download fails', async () => {
    jest.useFakeTimers()
    generateLevelMock
      .mockResolvedValueOnce({ ...baseDeck, id: 'deck_support' })
      .mockResolvedValueOnce({ ...baseDeck, id: 'deck_core' })
      .mockResolvedValueOnce({ ...baseDeck, id: 'deck_extension' })
    generateAndDownloadPPTXMock.mockRejectedValue(new Error('Export failed'))

    render(<DeckCarouselViewer />)

    fireEvent.click(await screen.findByRole('button', { name: /generate all levels/i }))

    await waitFor(() => {
      expect(generateLevelMock).toHaveBeenCalledTimes(3)
    })

    fireEvent.click(await screen.findByRole('button', { name: /download all/i }))

    await waitFor(() => {
      expect(generateAndDownloadPPTXMock).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Download Failed',
        description: 'Export failed',
        variant: 'destructive',
      }))
    })
    expect(toastMock).not.toHaveBeenCalledWith(expect.objectContaining({
      title: 'All Levels Downloaded!',
    }))

    jest.useRealTimers()
  })

  it('moves slide navigation into a collapsible bottom rail', async () => {
    render(<DeckCarouselViewer />)

    expect(await screen.findByText('Slide Navigator')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hide slides/i })).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByRole('button', { name: /hide slides/i }))

    expect(screen.getByRole('button', { name: /show slides/i })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Slide Navigator')).not.toBeInTheDocument()
  })
})
