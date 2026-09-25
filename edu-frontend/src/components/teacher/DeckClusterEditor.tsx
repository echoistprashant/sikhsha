'use client'
import { Slide } from '@/types/lesson'
import { StructuredSlideCard } from './StructuredSlideCard'

export interface DeckCluster {
  id: string
  title: string
  kind: 'hook' | 'explain' | 'practice' | 'summary' | 'other'
  slides: Slide[]
}

interface DeckClusterEditorProps {
  clusters: DeckCluster[]
  onAddExplainSlide: (clusterId: string) => void
  onSwitchLayout: (slideId: string, layoutId: string) => void
  onToggleLock: (slideId: string, locked: boolean) => void
}

export function DeckClusterEditor({
  clusters,
  onAddExplainSlide,
  onSwitchLayout,
  onToggleLock,
}: DeckClusterEditorProps) {
  if (!clusters.length) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5">
        <p className="text-sm text-zinc-500">Structured editing becomes available when the deck has cluster metadata.</p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      {clusters.map((cluster) => (
        <section key={cluster.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-zinc-950">{cluster.title}</h3>
              <p className="text-sm text-zinc-500">{cluster.slides.length} slides</p>
            </div>
            {cluster.kind === 'explain' && (
              <button
                type="button"
                onClick={() => onAddExplainSlide(cluster.id)}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
              >
                Add Explain Slide
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {cluster.slides.map((slide, index) => (
              <StructuredSlideCard
                key={slide.id || `${cluster.id}-${index}-${slide.title}`}
                slide={slide}
                onSwitchLayout={onSwitchLayout}
                onToggleLock={onToggleLock}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
