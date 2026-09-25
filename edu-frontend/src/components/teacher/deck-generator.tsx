'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GlassTextarea } from '@/components/ui/glass-input'
import {
  GlassSelect,
  GlassSelectContent,
  GlassSelectItem,
  GlassSelectTrigger,
  GlassSelectValue,
} from '@/components/ui/glass-select'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import { Loader2, ArrowRight, Check } from 'lucide-react'
import { DeckGenerateRequest } from '@/types/lesson'
import { deckService } from '@/lib/deckService'
import { deckThemeOptions } from '@/lib/deckThemes'

interface Chapter {
  name: string
  topics: { name: string; subtopics?: string[] }[]
}

interface Topic {
  name: string
  subtopics?: string[]
}

const curatedThemeOptions = [
  { value: 'default', label: 'Recommended', description: 'Clean and classroom-ready for most lessons.' },
  { value: 'blueprint', label: 'Technical', description: 'Sharper structure for math, science, and diagrams.' },
  { value: 'dark', label: 'Dark Room', description: 'Better contrast for projector-heavy classrooms.' },
]

const classOptions = ['8', '9', '10', '11', '12']

const CURRICULUM_OPTIONS = [
  { value: 'ICSE', label: 'ICSE / ISC' },
  { value: 'CBSE', label: 'CBSE' },
]

export default function DeckGenerator() {
  const router = useRouter()
  const { toast } = useToast()

  // Curriculum selection state
  const [curriculum, setCurriculum] = useState<string>('ICSE')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedChapter, setSelectedChapter] = useState<string>('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [theme, setTheme] = useState<string>('default')
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('')

  // Data from curriculum API
  const [subjects, setSubjects] = useState<string[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [loadingTopics, setLoadingTopics] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Load subjects when class or curriculum changes
  useEffect(() => {
    if (selectedClass) {
      setLoadingSubjects(true)
      setSelectedSubject('')
      setSelectedChapter('')
      setSelectedTopic('')
      setChapters([])
      setTopics([])

      api.get(`/curriculum/${selectedClass}/subjects?board=${curriculum}`)
        .then(response => {
          setSubjects(response.data || [])
        })
        .catch(err => {
          console.error('Failed to fetch subjects:', err)
          setSubjects([])
        })
        .finally(() => setLoadingSubjects(false))
    }
  }, [selectedClass, curriculum])

  // Load chapters when subject changes
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      setLoadingChapters(true)
      setSelectedChapter('')
      setSelectedTopic('')
      setTopics([])

      api.get(`/curriculum/${selectedClass}/${encodeURIComponent(selectedSubject)}/chapters?board=${curriculum}`)
        .then(response => {
          setChapters(response.data || [])
        })
        .catch(err => {
          console.error('Failed to fetch chapters:', err)
          setChapters([])
        })
        .finally(() => setLoadingChapters(false))
    }
  }, [selectedClass, selectedSubject, curriculum])

  // Load topics when chapter changes
  useEffect(() => {
    if (selectedClass && selectedSubject && selectedChapter) {
      setLoadingTopics(true)
      setSelectedTopic('')

      api.get(`/curriculum/${selectedClass}/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(selectedChapter)}/topics?board=${curriculum}`)
        .then(response => {
          setTopics(response.data || [])
        })
        .catch(err => {
          console.error('Failed to fetch topics:', err)
          setTopics([])
        })
        .finally(() => setLoadingTopics(false))
    }
  }, [selectedClass, selectedSubject, selectedChapter, curriculum])

  const handleGenerateDeck = async () => {
    if (!selectedTopic || !selectedSubject || !selectedClass) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all selections',
        variant: 'destructive',
      })
      return
    }

    setGenerating(true)
    try {
      const request: DeckGenerateRequest = {
        topics: [selectedTopic],
        subject: selectedSubject,
        gradeLevel: selectedClass,
        chapter: selectedChapter,
        curriculum,
        structuredFormat: true,
        theme,
        additionalInstructions: additionalInstructions.trim() || undefined
      }

      const deck = await deckService.generateComplete(request)

      // Store deck and original request params in session storage for viewer
      sessionStorage.setItem('currentDeck', JSON.stringify(deck))
      sessionStorage.setItem('deckRequestParams', JSON.stringify(request))

      toast({
        title: 'Deck Generated!',
        description: `Generated ${deck.slides.length} slides with Bloom's progression`,
      })

      // Navigate to carousel viewer
      router.push('/teacher/deck-generator/view')
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate deck',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  const selectedThemeOption = deckThemeOptions.find((option) => option.id === theme) ?? deckThemeOptions[0]
  const canGenerate = Boolean(selectedClass && selectedSubject && selectedTopic)
  const selectionSteps = [
    {
      label: 'Curriculum',
      description: 'Choose the curriculum board (ICSE or CBSE).',
      value: curriculum ? curriculum : '',
    },
    {
      label: 'Class',
      description: 'Choose the grade level for this deck.',
      value: selectedClass ? `Class ${selectedClass}` : '',
    },
    {
      label: 'Subject',
      description: 'Set the subject area and narrow the teaching voice.',
      value: selectedSubject,
    },
    {
      label: 'Chapter',
      description: 'Choose the unit or chapter the deck should cover.',
      value: selectedChapter,
    },
    {
      label: 'Topic',
      description: 'Pick the exact lesson focus for the generated deck.',
      value: selectedTopic,
    },
  ]
  const activeStepIndex = !curriculum ? 0 : !selectedClass ? 1 : !selectedSubject ? 2 : !selectedChapter ? 3 : !selectedTopic ? 4 : 4
  const completedSteps = selectionSteps.filter((step) => step.value).length
  const progressPercent = Math.max(12, (completedSteps / selectionSteps.length) * 100)

  return (
    <div className="min-h-screen bg-[#e7e0d7] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="relative mx-auto max-w-5xl px-6 py-8 md:px-8 lg:py-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-white/50 blur-3xl dark:bg-white/5" />
          <div className="absolute right-0 top-16 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl dark:bg-emerald-500/10" />
        </div>

        <div className="relative space-y-8">
          <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-38px_rgba(24,24,27,0.5)] backdrop-blur dark:border-white/10 dark:bg-white/5 xl:p-8">
            <div className="space-y-8">
              <div className="rounded-[28px] border border-zinc-200/80 bg-[#fbf8f4] p-5 text-zinc-950 md:p-6">
                <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="flex flex-col">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                      Lesson Setup
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
                      Guided selection
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      Move through the lesson details in order. Each step unlocks the next one.
                    </p>

                    <div className="mt-6 space-y-0">
                      {selectionSteps.map((step, index) => {
                        const isCompleted = index < activeStepIndex || (index === 3 && Boolean(selectedTopic))
                        const isActive = index === activeStepIndex && !isCompleted
                        const isLast = index === selectionSteps.length - 1

                        return (
                          <div key={step.label} className="relative flex items-start gap-3 pb-5">
                            {!isLast && (
                              <div className="absolute left-[13px] top-8 h-[calc(100%-0.5rem)] w-px bg-white/12" />
                            )}
                            <div className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                              isCompleted
                                ? 'border-emerald-500 bg-emerald-600 text-white'
                                : isActive
                                  ? 'border-zinc-900/20 bg-zinc-950 text-white'
                                  : 'border-zinc-300 bg-transparent text-zinc-500'
                            }`}>
                              {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                            </div>
                            <div className="pt-0.5">
                              <div className={`text-sm font-medium ${
                                isCompleted || isActive ? 'text-zinc-950' : 'text-zinc-500'
                              }`}>
                                {step.label}
                              </div>
                              <div className="mt-1 text-xs text-zinc-500">
                                {step.value || step.description}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-auto pt-2">
                      <p className="text-sm font-medium text-zinc-700">
                        Step {Math.min(activeStepIndex + 1, 5)} of 5
                      </p>
                      <div className="mt-3 h-1 rounded-full bg-zinc-200">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-zinc-200 bg-white p-5 md:p-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
                        {selectionSteps[activeStepIndex].label}
                      </p>
                      <h3 className="text-2xl font-semibold text-zinc-950">
                        {selectionSteps[activeStepIndex].label}
                      </h3>
                      <p className="text-sm leading-6 text-zinc-600">
                        {selectionSteps[activeStepIndex].description}
                      </p>
                    </div>

                    <div className="mt-6 space-y-4">
                      {/* Curriculum */}
                      <div className={`rounded-2xl border p-4 ${
                        activeStepIndex === 0 ? 'border-emerald-500/70 bg-[#fbf8f4]' : 'border-zinc-200 bg-[#fbf8f4]'
                      }`}>
                        <p className="mb-2 text-sm font-medium text-zinc-950">Curriculum Board</p>
                        <GlassSelect value={curriculum} onValueChange={(v) => { setCurriculum(v); setSelectedClass(''); setSelectedSubject(''); setSelectedChapter(''); setSelectedTopic('') }}>
                          <GlassSelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white text-zinc-900 shadow-none">
                            <GlassSelectValue placeholder="Select curriculum..." />
                          </GlassSelectTrigger>
                          <GlassSelectContent>
                            {CURRICULUM_OPTIONS.map(opt => (
                              <GlassSelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </GlassSelectItem>
                            ))}
                          </GlassSelectContent>
                        </GlassSelect>
                      </div>

                      {/* Class */}
                      <div className={`rounded-2xl border p-4 ${
                        activeStepIndex === 1 ? 'border-emerald-500/70 bg-[#fbf8f4]' : 'border-zinc-200 bg-[#fbf8f4]'
                      }`}>
                        <p className="mb-2 text-sm font-medium text-zinc-950">Class</p>
                        <GlassSelect value={selectedClass} onValueChange={setSelectedClass} disabled={!curriculum}>
                          <GlassSelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white text-zinc-900 shadow-none">
                            <GlassSelectValue placeholder="Select class..." />
                          </GlassSelectTrigger>
                          <GlassSelectContent>
                            {['8', '9', '10', '11', '12'].map(cls => (
                              <GlassSelectItem key={cls} value={cls}>
                                Class {cls}
                              </GlassSelectItem>
                            ))}
                          </GlassSelectContent>
                        </GlassSelect>
                      </div>

                      <div className={`rounded-2xl border p-4 ${
                        activeStepIndex === 1 ? 'border-emerald-500/70 bg-[#fbf8f4]' : 'border-zinc-200 bg-[#fbf8f4]'
                      }`}>
                        <p className="mb-2 text-sm font-medium text-zinc-950">Subject</p>
                        <GlassSelect
                          value={selectedSubject}
                          onValueChange={setSelectedSubject}
                          disabled={!selectedClass || loadingSubjects}
                        >
                          <GlassSelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white text-zinc-900 shadow-none disabled:opacity-45">
                            <GlassSelectValue placeholder={loadingSubjects ? 'Loading subjects...' : 'Select subject...'} />
                          </GlassSelectTrigger>
                          <GlassSelectContent>
                            {subjects.map(subject => (
                              <GlassSelectItem key={subject} value={subject}>
                                {subject}
                              </GlassSelectItem>
                            ))}
                          </GlassSelectContent>
                        </GlassSelect>
                      </div>

                      <div className={`rounded-2xl border p-4 ${
                        activeStepIndex === 2 ? 'border-emerald-500/70 bg-[#fbf8f4]' : 'border-zinc-200 bg-[#fbf8f4]'
                      }`}>
                        <p className="mb-2 text-sm font-medium text-zinc-950">Chapter</p>
                        <GlassSelect
                          value={selectedChapter}
                          onValueChange={setSelectedChapter}
                          disabled={!selectedSubject || loadingChapters}
                        >
                          <GlassSelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white text-zinc-900 shadow-none disabled:opacity-45">
                            <GlassSelectValue placeholder={loadingChapters ? 'Loading chapters...' : 'Select chapter...'} />
                          </GlassSelectTrigger>
                          <GlassSelectContent>
                            {chapters.map(chapter => (
                              <GlassSelectItem key={chapter.name} value={chapter.name}>
                                {chapter.name}
                              </GlassSelectItem>
                            ))}
                          </GlassSelectContent>
                        </GlassSelect>
                      </div>

                      <div className={`rounded-2xl border p-4 ${
                        activeStepIndex === 3 ? 'border-emerald-500/70 bg-[#fbf8f4]' : 'border-zinc-200 bg-[#fbf8f4]'
                      }`}>
                        <p className="mb-2 text-sm font-medium text-zinc-950">Topic</p>
                        <GlassSelect
                          value={selectedTopic}
                          onValueChange={setSelectedTopic}
                          disabled={!selectedChapter || loadingTopics || topics.length === 0}
                        >
                          <GlassSelectTrigger className="h-12 rounded-xl border-zinc-200 bg-white text-zinc-900 shadow-none disabled:opacity-45">
                            <GlassSelectValue
                              placeholder={
                                loadingTopics
                                  ? 'Loading topics...'
                                  : selectedChapter
                                    ? topics.length > 0
                                      ? 'Select topic...'
                                      : 'No topics available'
                                    : 'Select chapter first'
                              }
                            />
                          </GlassSelectTrigger>
                          <GlassSelectContent>
                            {topics.map(topic => (
                              <GlassSelectItem key={topic.name} value={topic.name}>
                                {topic.name}
                              </GlassSelectItem>
                            ))}
                          </GlassSelectContent>
                        </GlassSelect>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-[26px] border border-zinc-200/80 bg-[#fbf8f4] p-5 transition-opacity dark:border-white/10 dark:bg-white/[0.03] ${
                selectedTopic ? 'opacity-100' : 'opacity-60'
              }`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">Presentation Style</p>
                <h3 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-white">Keep theme selection simple</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Use the recommended style unless you have a clear reason to change it.</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {curatedThemeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      disabled={!selectedTopic}
                      className={`rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed ${
                        theme === option.value
                          ? 'border-zinc-950 bg-white shadow-[0_20px_35px_-26px_rgba(24,24,27,0.5)] dark:border-white dark:bg-zinc-900'
                          : 'border-zinc-200 bg-white/85 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{option.label}</div>
                          <div className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{option.description}</div>
                        </div>
                        <div className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          theme === option.value ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`rounded-[26px] border border-zinc-200/80 bg-[#fbf8f4] p-5 transition-opacity dark:border-white/10 dark:bg-white/[0.03] ${
                selectedTopic ? 'opacity-100' : 'opacity-60'
              }`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                  Final Notes
                </p>
                <h3 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-white">Additional Instructions</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Add only what materially changes the result, such as tone, difficulty, or diagram preference.
                </p>
                <div className="mt-4">
                  <GlassTextarea
                    placeholder="E.g., keep the language executive and concise, use real classroom examples, reduce visual clutter..."
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    disabled={!selectedTopic}
                    className="min-h-[132px] resize-none rounded-[22px] border-zinc-200 bg-white text-zinc-900 shadow-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-zinc-900/8 pt-6 dark:border-white/10 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {selectedTopic
                      ? `Ready to generate: ${selectedTopic}`
                      : 'Choose a topic to enable deck generation.'}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {selectedTopic
                      ? `${selectedSubject} • Grade ${selectedClass} • ${selectedThemeOption.name}`
                      : 'The deck will use your class, subject, chapter, topic, and theme selections.'}
                  </p>
                </div>
                <Button
                  onClick={handleGenerateDeck}
                  disabled={!canGenerate || generating}
                  size="lg"
                  className="h-14 rounded-full bg-zinc-950 px-6 text-base font-medium text-white shadow-[0_22px_44px_-24px_rgba(24,24,27,0.8)] hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating your deck...
                    </>
                  ) : (
                    <>
                      Generate deck
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
