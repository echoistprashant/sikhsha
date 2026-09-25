'use client'

import { Slide } from '@/types/lesson'

interface StructuredSlideCardProps {
  slide: Slide
  onSwitchLayout: (slideId: string, layoutId: string) => void
  onToggleLock: (slideId: string, locked: boolean) => void
}

export function StructuredSlideCard({
  slide,
  onSwitchLayout,
  onToggleLock,
}: StructuredSlideCardProps) {
  const slideId = slide.id
  const layoutCandidates = slide.layoutCandidates ?? []
  const selectedLayout = typeof slide.visualMetadata?.visualConfig?.selectedLayout === 'string'
    ? slide.visualMetadata.visualConfig.selectedLayout
    : null
  const currentLayout = (
    selectedLayout && layoutCandidates.includes(selectedLayout)
      ? selectedLayout
      : layoutCandidates[0]
  ) ?? 'unresolved'
  const currentLayoutIndex = layoutCandidates.indexOf(currentLayout)
  const nextLayout = layoutCandidates.length > 1
    ? layoutCandidates[(currentLayoutIndex + 1) % layoutCandidates.length]
    : null
  const isLocked = Boolean(slide.editingHints?.locked)

  return (
    <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {slide.pedagogicalRole || slide.slideType}
          </p>
          <h4 className="font-semibold text-zinc-950">{slide.title}</h4>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            isLocked ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {isLocked ? 'Locked' : 'Editable'}
        </span>
      </div>

      <p className="mb-2 text-sm text-zinc-600">{slide.content}</p>
      <p className="mb-4 text-sm text-zinc-500">Layout: {currentLayout}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => slideId && nextLayout && onSwitchLayout(slideId, nextLayout)}
          disabled={!slideId || !nextLayout}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Switch Layout
        </button>
        <button
          type="button"
          onClick={() => slideId && onToggleLock(slideId, !isLocked)}
          disabled={!slideId}
          aria-label={isLocked ? 'Unlock slide' : 'Lock slide'}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLocked ? 'Unlock' : 'Lock'}
        </button>
      </div>
    </article>
  )
}
