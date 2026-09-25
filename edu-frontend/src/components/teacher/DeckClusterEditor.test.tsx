import { fireEvent, render, screen } from '@testing-library/react'
import { DeckClusterEditor } from './DeckClusterEditor'

describe('DeckClusterEditor', () => {
  it('renders deck clusters and calls onAddExplainSlide when requested', async () => {
    const onAddExplainSlide = jest.fn()

    render(
      <DeckClusterEditor
        clusters={[
          {
            id: 'hook_1',
            title: 'Hook',
            kind: 'hook',
            slides: [{
              id: 'slide_1',
              title: 'Hook Slide',
              content: 'Why do objects move?',
              order: 1,
              slideType: 'INTRODUCTION',
              bloom_level: 'UNDERSTAND',
            }],
          },
          {
            id: 'explain_1',
            title: 'Explain',
            kind: 'explain',
            slides: [{
              id: 'slide_2',
              title: 'Concept 1',
              content: 'Force changes motion.',
              order: 2,
              slideType: 'CONCEPT',
              bloom_level: 'UNDERSTAND',
            }],
          },
        ]}
        onAddExplainSlide={onAddExplainSlide}
        onSwitchLayout={jest.fn()}
        onToggleLock={jest.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Explain' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Hook' })).toBeInTheDocument()
    expect(screen.getByText('Hook Slide')).toBeInTheDocument()
    expect(screen.getByText('Concept 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /add explain slide/i }))

    expect(onAddExplainSlide).toHaveBeenCalledWith('explain_1')
  })

  it('shows lock state and emits layout and lock actions for structured slides', async () => {
    const onSwitchLayout = jest.fn()
    const onToggleLock = jest.fn()

    render(
      <DeckClusterEditor
        clusters={[{
          id: 'practice_1',
          title: 'Guided Practice',
          kind: 'practice',
          slides: [{
            id: 'slide_3',
            title: 'Worked Example',
            content: 'Apply F = ma to the cart.',
            order: 3,
            slideType: 'ACTIVITY',
            bloom_level: 'APPLY',
            pedagogicalRole: 'worked_example',
            layoutCandidates: ['guided-practice', 'two-column-explain'],
            editingHints: {
              locked: true,
            },
          }],
        }]}
        onAddExplainSlide={jest.fn()}
        onSwitchLayout={onSwitchLayout}
        onToggleLock={onToggleLock}
      />
    )

    expect(screen.getByText(/locked/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /switch layout/i }))
    expect(onSwitchLayout).toHaveBeenCalledWith('slide_3', 'two-column-explain')

    fireEvent.click(screen.getByRole('button', { name: /unlock slide/i }))
    expect(onToggleLock).toHaveBeenCalledWith('slide_3', false)
  })

  it('cycles to the next layout candidate based on the selected layout for slides with 3 candidates', async () => {
    const onSwitchLayout = jest.fn()

    render(
      <DeckClusterEditor
        clusters={[{
          id: 'explain_2',
          title: 'Deepen',
          kind: 'explain',
          slides: [{
            id: 'slide_4',
            title: 'Compare Layouts',
            content: 'Three candidate layouts are available.',
            order: 4,
            slideType: 'CONCEPT',
            bloom_level: 'UNDERSTAND',
            pedagogicalRole: 'explain_deepen',
            layoutCandidates: ['concept-with-image', 'two-column-explain', 'diagram-callout'],
            visualMetadata: {
              visualConfig: {
                selectedLayout: 'two-column-explain',
              },
            },
          }],
        }]}
        onAddExplainSlide={jest.fn()}
        onSwitchLayout={onSwitchLayout}
        onToggleLock={jest.fn()}
      />
    )

    expect(screen.getByText('Layout: two-column-explain')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /switch layout/i }))
    expect(onSwitchLayout).toHaveBeenCalledWith('slide_4', 'diagram-callout')
  })
})
