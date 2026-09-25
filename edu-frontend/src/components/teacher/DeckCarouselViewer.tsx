'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Download, ArrowLeft, Loader2, Users, BookOpen, GraduationCap, ClipboardList, FileText, Image as ImageIcon } from 'lucide-react'
import { LessonDeck, DeckGenerateRequest, Slide } from '@/types/lesson'
import { deckService } from '@/lib/deckService'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddActivityModal, GeneratedActivity } from './AddActivityModal'
import { AddSlideModal, GeneratedSlide } from './AddSlideModal'
import { VisualRenderer } from '@/components/visuals/VisualRenderer'
import { DeckClusterEditor, type DeckCluster } from './DeckClusterEditor'
import { deckThemeStyles } from '@/lib/deckThemes'

interface SlideCardProps {
    slide: {
        title: string
        content: string
        slideType?: string
        bloom_level?: string
        order: number
        imageQuery?: string
        visualMetadata?: any
    }
    theme?: string
}

function inferClusterKind(role?: Slide['pedagogicalRole']): DeckCluster['kind'] {
    if (!role) {
        return 'other'
    }

    if (role === 'hook') {
        return 'hook'
    }

    if (role === 'summary') {
        return 'summary'
    }

    if (role.startsWith('explain')) {
        return 'explain'
    }

    if (role.includes('practice') || role.includes('example')) {
        return 'practice'
    }

    return 'other'
}

function buildDeckClusters(deck: LessonDeck | null): DeckCluster[] {
    if (!deck) {
        return []
    }

    const clusterMap = new Map<string, DeckCluster>()

    deck.slides.forEach((slide, index) => {
        const clusterId = slide.clusterId || `slide_${slide.id || index + 1}`
        const existing = clusterMap.get(clusterId)

        if (existing) {
            existing.slides.push(slide)
            return
        }

        clusterMap.set(clusterId, {
            id: clusterId,
            title: slide.instructionalGoal || slide.title || `Cluster ${index + 1}`,
            kind: inferClusterKind(slide.pedagogicalRole),
            slides: [slide],
        })
    })

    return Array.from(clusterMap.values())
}

function SlideCard({ slide, theme = 'default' }: SlideCardProps) {
    const isQuestion = slide?.slideType === 'ACTIVITY' || slide?.slideType === 'ASSESSMENT'
    const styles = deckThemeStyles[theme] || deckThemeStyles.default
    const hasRenderableVisual = Boolean(slide?.visualMetadata?.visualType)
    const hasStockPhoto = Boolean(!hasRenderableVisual && slide?.imageQuery)

    if (!slide) {
        return null
    }

    // Build a synthetic visualMetadata for stock photos so VisualRenderer handles them
    const stockPhotoMetadata = hasStockPhoto
        ? { visualType: 'stock_photo', imageQuery: slide.imageQuery }
        : null

    return (
        <Card className={`w-full max-w-6xl aspect-video max-h-[72vh] shadow-2xl border ${styles.bg}`}>
            <CardContent className="p-7 md:p-10 h-full flex flex-col overflow-hidden">
                {/* Slide Header */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className={`text-2xl md:text-4xl font-bold ${styles.title} leading-tight max-w-[78%]`}>{slide.title}</h2>
                        {slide.bloom_level && (
                            <span className={`px-3 py-1 ${styles.badge} text-xs font-semibold rounded-md`}>
                                {slide.bloom_level}
                            </span>
                        )}
                    </div>
                    {slide.slideType && (
                        <p className={`text-sm ${styles.text} uppercase tracking-wide opacity-70`}>{slide.slideType}</p>
                    )}
                </div>

                {/* Slide Content */}
                <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_0.82fr] gap-6 min-h-0">
                    <div className={`rounded-lg border ${styles.panel} p-6 overflow-y-auto`}>
                    {isQuestion ? (
                        // Format questions specially
                        <div className="space-y-4 text-base md:text-lg leading-relaxed">
                            {slide.content.split('\n').map((line, idx) => {
                                const trimmed = line.trim()
                                if (!trimmed) return null

                                // Detect question/answer/option patterns
                                if (trimmed.startsWith('Question:')) {
                                    return <p key={idx} className={`font-semibold text-xl ${styles.title}`}>{trimmed}</p>
                                } else if (trimmed.match(/^[A-D]\)/)) {
                                    return <p key={idx} className={`ml-4 ${styles.text}`}>{trimmed}</p>
                                } else if (trimmed.startsWith('Answer:')) {
                                    return <p key={idx} className="font-semibold text-green-600 mt-4">{trimmed}</p>
                                } else if (trimmed.startsWith('Explanation:')) {
                                    return <p key={idx} className={`${styles.text} mt-2 opacity-80`}>{trimmed}</p>
                                } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                                    return <li key={idx} className={`ml-4 ${styles.text}`}>{trimmed.substring(1).trim()}</li>
                                }
                                return <p key={idx} className={styles.text}>{trimmed}</p>
                            })}
                        </div>
                    ) : (
                        // Regular bullet-point content
                        <div className="space-y-3 text-base md:text-lg leading-relaxed">
                            {slide.content.split('\n').map((line, idx) => {
                                const trimmed = line.trim()
                                if (!trimmed) return null
                                if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                                    return (
                                        <li key={idx} className={`ml-6 ${styles.text} list-disc`}>
                                            {trimmed.substring(1).trim()}
                                        </li>
                                    )
                                }
                                return <p key={idx} className={styles.text}>{trimmed}</p>
                            })}
                        </div>
                    )}
                    </div>
                    <div className={`rounded-lg border ${styles.panel} p-5 min-h-0 flex flex-col`}>
                        {hasRenderableVisual ? (
                            <VisualRenderer visualMetadata={slide.visualMetadata} className="flex-1" />
                        ) : hasStockPhoto ? (
                            <VisualRenderer visualMetadata={stockPhotoMetadata!} className="flex-1" />
                        ) : (
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className={`h-1.5 w-20 rounded-full ${styles.accent} mb-5`} />
                                    <p className={`text-sm font-semibold ${styles.title}`}>Visual Direction</p>
                                    <p className={`mt-3 text-sm leading-relaxed ${styles.text}`}>
                                        Use a clear diagram, photo, or board sketch to anchor this idea.
                                    </p>
                                </div>
                                <div className="h-36 rounded-lg border border-dashed border-current/25 flex items-center justify-center opacity-80">
                                    <ImageIcon className={`h-10 w-10 ${styles.text}`} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function DeckCarouselViewer() {
    const router = useRouter()
    const { toast } = useToast()

    const [coreDeck, setCoreDeck] = useState<LessonDeck | null>(null)
    const [basicDeck, setBasicDeck] = useState<LessonDeck | null>(null)
    const [expertiseDeck, setExpertiseDeck] = useState<LessonDeck | null>(null)
    const [currentLevel, setCurrentLevel] = useState<'basic' | 'core' | 'expertise'>('core')
    const [currentSlide, setCurrentSlide] = useState(0)
    const [loading, setLoading] = useState(true)
    const [generatingAll, setGeneratingAll] = useState(false)
    const [downloadingAll, setDownloadingAll] = useState(false)
    const [slidesPanelOpen, setSlidesPanelOpen] = useState(true)
    const [requestParams, setRequestParams] = useState<DeckGenerateRequest | null>(null)

    // Modal states for Add Activity / Add Slide
    const [activityModalOpen, setActivityModalOpen] = useState(false)
    const [slideModalOpen, setSlideModalOpen] = useState(false)
    const [selectedSlideForAction, setSelectedSlideForAction] = useState<number>(0)

    // Get current deck based on selected level
    const currentDeck = currentLevel === 'basic' ? basicDeck : currentLevel === 'expertise' ? expertiseDeck : coreDeck
    const deckClusters = buildDeckClusters(currentDeck)
    const activeTheme = currentDeck?.meta?.theme || coreDeck?.meta?.theme || 'default'

    useEffect(() => {
        // Try to load deck and request params from session storage
        const storedDeck = sessionStorage.getItem('currentDeck')
        const storedParams = sessionStorage.getItem('deckRequestParams')

        if (storedParams) {
            try {
                setRequestParams(JSON.parse(storedParams))
            } catch (error) {
                console.error('Failed to parse request params:', error)
            }
        }

        if (storedDeck) {
            try {
                const parsedDeck = JSON.parse(storedDeck)
                setCoreDeck(parsedDeck)
                setLoading(false)
            } catch (error) {
                console.error('Failed to parse deck:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to load deck. Redirecting to generator.',
                    variant: 'destructive',
                })
                setTimeout(() => router.push('/teacher/deck-generator'), 2000)
            }
        } else {
            toast({
                title: 'No Deck Found',
                description: 'Redirecting to generator.',
                variant: 'destructive',
            })
            setTimeout(() => router.push('/teacher/deck-generator'), 2000)
        }
    }, [router, toast])

    useEffect(() => {
        // Keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                prevSlide()
            } else if (e.key === 'ArrowRight') {
                nextSlide()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentSlide, currentDeck])

    // Reset slide position when switching levels
    useEffect(() => {
        setCurrentSlide(0)
    }, [currentLevel])

    useEffect(() => {
        if (coreDeck) {
            sessionStorage.setItem('currentDeck', JSON.stringify(coreDeck))
        }
    }, [coreDeck])

    const updateDeckForCurrentLevel = (updater: (deck: LessonDeck) => LessonDeck) => {
        if (!currentDeck) {
            return
        }

        const nextDeck = updater(currentDeck)

        if (currentLevel === 'core') {
            setCoreDeck(nextDeck)
            return
        }

        if (currentLevel === 'basic' && basicDeck) {
            setBasicDeck(nextDeck)
            return
        }

        if (currentLevel === 'expertise' && expertiseDeck) {
            setExpertiseDeck(nextDeck)
        }
    }

    const persistEditedDeck = async (deck: LessonDeck): Promise<LessonDeck | null> => {
        if (!deck.id) {
            return null
        }

        try {
            const updatedDeck = await deckService.updateStructuredDeck(deck.id, deck)

            if (currentLevel === 'core') {
                setCoreDeck(updatedDeck)
            } else if (currentLevel === 'basic' && basicDeck) {
                setBasicDeck(updatedDeck)
            } else if (currentLevel === 'expertise' && expertiseDeck) {
                setExpertiseDeck(updatedDeck)
            }

            return updatedDeck
        } catch (error: any) {
            toast({
                title: 'Save Failed',
                description: error.message || 'Failed to save deck changes',
                variant: 'destructive',
            })

            return null
        }
    }

    const updateAndPersistDeck = async (updater: (deck: LessonDeck) => LessonDeck) => {
        if (!currentDeck) {
            return null
        }

        const nextDeck = updater(currentDeck)
        return persistEditedDeck(nextDeck)
    }

    const nextSlide = () => {
        if (currentDeck && currentSlide < currentDeck.slides.length - 1) {
            setCurrentSlide(currentSlide + 1)
        }
    }

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1)
        }
    }

    const handleGenerateAllLevels = async () => {
        if (!coreDeck) {
            toast({
                title: 'Error',
                description: 'No deck available. Please generate a deck first.',
                variant: 'destructive',
            })
            return
        }

        setGeneratingAll(true)
        try {
            toast({
                title: 'Generating All Levels',
                description: 'Creating Basic, Core, and Expertise versions...',
            })

            // Use stored request params OR fallback to coreDeck.meta (for backward compatibility)
            const request: DeckGenerateRequest = requestParams || {
                topics: coreDeck.meta?.topic ? [coreDeck.meta.topic] : [],
                topic: coreDeck.meta?.topic || '',
                subject: coreDeck.meta?.subject || '',
                gradeLevel: coreDeck.meta?.grade || '',
                theme: coreDeck.meta?.theme || 'default',
            }

            // Validate we have the required fields
            if (!request.subject || !request.gradeLevel || (!request.topic && (!request.topics || request.topics.length === 0))) {
                toast({
                    title: 'Missing Required Data',
                    description: 'Please go back and regenerate the deck to store required parameters.',
                    variant: 'destructive',
                })
                setGeneratingAll(false)
                return
            }

            // Generate all three levels
            const [basicResult, coreResult, expertiseResult] = await Promise.all([
                deckService.generateLevel(request, 'support'),
                deckService.generateLevel(request, 'core'),
                deckService.generateLevel(request, 'extension'),
            ])

            setBasicDeck(basicResult)
            setCoreDeck(coreResult)
            setExpertiseDeck(expertiseResult)

            toast({
                title: 'All Levels Generated!',
                description: 'You can now switch between Basic, Core, and Expertise',
            })
        } catch (error: any) {
            toast({
                title: 'Generation Failed',
                description: error.message || 'Failed to generate all levels',
                variant: 'destructive',
            })
        } finally {
            setGeneratingAll(false)
        }
    }

    const handleDownloadPPTX = async (
        level: 'CORE' | 'SUPPORT' | 'EXTENSION',
        options?: { showSuccessToast?: boolean; showErrorToast?: boolean }
    ) => {
        const deckToDownload = level === 'SUPPORT' ? basicDeck : level === 'EXTENSION' ? expertiseDeck : coreDeck
        if (!deckToDownload) return

        const { showSuccessToast = true, showErrorToast = true } = options || {}

        try {
            const levelName = level === 'SUPPORT' ? 'Basic' : level === 'EXTENSION' ? 'Expertise' : 'Core'

            await deckService.generateAndDownloadPPTX(
                {
                    id: deckToDownload.id,
                    title: deckToDownload.meta?.topic || 'lesson',
                    lesson: deckToDownload,
                },
                `${deckToDownload.meta?.topic || 'lesson'}_${levelName}.pptx`
            )

            if (showSuccessToast) {
                toast({
                    title: 'Download Started',
                    description: `${levelName} level PowerPoint file is being downloaded`,
                })
            }
        } catch (error: any) {
            if (showErrorToast) {
                toast({
                    title: 'Download Failed',
                    description: error.message || 'Failed to download PPTX',
                    variant: 'destructive',
                })
            }

            throw error
        }
    }

    const handleDownloadAllLevels = async () => {
        if (!coreDeck) return

        setDownloadingAll(true)
        try {
            toast({
                title: 'Downloading All Levels',
                description: 'Downloading Basic, Core, and Expertise PPTs...',
            })

            // Download all three levels sequentially
            await handleDownloadPPTX('SUPPORT', { showSuccessToast: false, showErrorToast: false })
            await new Promise(resolve => setTimeout(resolve, 1500))

            await handleDownloadPPTX('CORE', { showSuccessToast: false, showErrorToast: false })
            await new Promise(resolve => setTimeout(resolve, 1500))

            await handleDownloadPPTX('EXTENSION', { showSuccessToast: false, showErrorToast: false })

            toast({
                title: 'All Levels Downloaded!',
                description: 'Basic, Core, and Expertise PPTs are ready',
            })
        } catch (error: any) {
            toast({
                title: 'Download Failed',
                description: error.message || 'Failed to download all levels',
                variant: 'destructive',
            })
        } finally {
            setDownloadingAll(false)
        }
    }

    const handleAddExplainSlide = async (clusterId: string) => {
        if (!currentDeck?.id) {
            return
        }

        try {
            const updatedDeck = await deckService.regenerateCluster({
                deckId: currentDeck.id,
                clusterId,
                pedagogicalRole: 'explain_deepen',
            })

            updateDeckForCurrentLevel(() => updatedDeck)
            setCurrentSlide(Math.max(updatedDeck.slides.length - 1, 0))

            toast({
                title: 'Explain Slide Added',
                description: 'Added a new explain slide for this cluster.',
            })
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message || 'Failed to add explain slide',
                variant: 'destructive',
            })
        }
    }

    const handleSwitchLayout = async (slideId: string, layoutId: string) => {
        if (!currentDeck?.id) {
            return
        }

        try {
            const updatedDeck = await deckService.switchSlideLayout({
                deckId: currentDeck.id,
                slideId,
                layoutId,
            })

            updateDeckForCurrentLevel(() => updatedDeck)

            toast({
                title: 'Layout Updated',
                description: `Switched slide layout to ${layoutId}.`,
            })
        } catch (error: any) {
            toast({
                title: 'Layout Update Failed',
                description: error.message || 'Failed to switch slide layout',
                variant: 'destructive',
            })
        }
    }

    const handleToggleLock = (slideId: string, locked: boolean) => {
        if (!currentDeck) {
            return
        }

        const nextDeck = {
            ...currentDeck,
            slides: currentDeck.slides.map((slide) => (
                slide.id === slideId
                    ? {
                        ...slide,
                        editingHints: {
                            ...slide.editingHints,
                            locked,
                        },
                    }
                    : slide
            )),
        }

        updateDeckForCurrentLevel(() => nextDeck)
        persistEditedDeck(nextDeck)
    }

    if (loading || !coreDeck) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-600 dark:text-emerald-400" />
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br bg-zinc-100 dark:bg-zinc-950">
            {/* Top Bar */}
            <header className="bg-white/90 p-4 backdrop-blur md:p-5">
                <div className="mx-auto flex max-w-7xl flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/teacher/deck-generator')}
                            className="flex items-center gap-2 self-start rounded-xl border-zinc-200 bg-zinc-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Generator
                        </Button>

                        <div className="flex flex-wrap justify-end gap-2">
                            {!basicDeck && !expertiseDeck && (
                                <Button
                                    onClick={handleGenerateAllLevels}
                                    disabled={generatingAll}
                                    variant="outline"
                                    className="flex items-center gap-2 rounded-xl border-zinc-200 bg-zinc-50"
                                >
                                    {generatingAll ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate All Levels'
                                    )}
                                </Button>
                            )}
                            <Button
                                onClick={() => handleDownloadPPTX(
                                    currentLevel === 'basic' ? 'SUPPORT' : currentLevel === 'expertise' ? 'EXTENSION' : 'CORE'
                                )}
                                variant="outline"
                                className="flex items-center gap-2 rounded-xl border-zinc-200 bg-zinc-50"
                            >
                                <Download className="h-4 w-4" />
                                Download {currentLevel === 'basic' ? 'Basic' : currentLevel === 'expertise' ? 'Expertise' : 'Core'}
                            </Button>
                            {(basicDeck || expertiseDeck) && (
                                <Button
                                    onClick={handleDownloadAllLevels}
                                    disabled={downloadingAll}
                                    className="flex items-center gap-2 rounded-xl"
                                >
                                    {downloadingAll ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Downloading All...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Download All
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{coreDeck.meta?.topic}</h2>
                        <p className="text-sm text-gray-500">
                            {coreDeck.meta?.subject} • Grade {coreDeck.meta?.grade}
                            {currentDeck && ` • ${currentDeck.slides.length} slides`}
                        </p>
                    </div>
                </div>
            </header>

            <main className="relative flex-1 overflow-y-auto px-4 pb-4 pt-2 md:px-8 md:pb-6">
                <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col items-center">
                    <div className="flex min-h-[420px] w-full flex-1 items-center justify-center py-4">
                        {currentDeck && <SlideCard slide={currentDeck.slides[currentSlide]} theme={activeTheme} />}
                    </div>

                    <div className="w-full max-w-6xl">
                        <DeckClusterEditor
                            clusters={deckClusters}
                            onAddExplainSlide={handleAddExplainSlide}
                            onSwitchLayout={handleSwitchLayout}
                            onToggleLock={handleToggleLock}
                        />
                    </div>

                    {currentDeck && currentDeck.meta && (
                        <div className="flex flex-wrap gap-3 py-4">
                            <button
                                onClick={() => {
                                    setSelectedSlideForAction(currentSlide)
                                    setActivityModalOpen(true)
                                }}
                                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-white shadow-md transition-colors hover:bg-zinc-800"
                            >
                                <ClipboardList className="h-4 w-4" />
                                Add Activity
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedSlideForAction(currentSlide)
                                    setSlideModalOpen(true)
                                }}
                                className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-green-700"
                            >
                                <FileText className="h-4 w-4" />
                                Add Slide
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="absolute left-4 top-[38%] z-10 rounded-full bg-white p-3 shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30 md:left-6"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>

                <button
                    onClick={nextSlide}
                    disabled={!currentDeck || currentSlide === currentDeck.slides.length - 1}
                    className="absolute right-4 top-[38%] z-10 rounded-full bg-white p-3 shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30 md:right-6"
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                </button>
            </main>

            <footer className="bg-white/92 px-4 pb-4 pt-3 backdrop-blur md:px-5">
                <div className="mx-auto flex max-w-7xl flex-col gap-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Slide <span className="font-bold text-gray-900">{currentSlide + 1}</span> of{' '}
                                <span className="font-bold text-gray-900">{currentDeck?.slides.length || 0}</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-500">Use ← → arrow keys to navigate</p>
                        </div>

                        {(basicDeck || expertiseDeck) && (
                            <Tabs value={currentLevel} onValueChange={(v) => setCurrentLevel(v as any)} className="w-full lg:max-w-md">
                                <TabsList className="grid w-full grid-cols-3 rounded-xl">
                                    <TabsTrigger value="basic" disabled={!basicDeck} className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Basic
                                    </TabsTrigger>
                                    <TabsTrigger value="core" className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        Core
                                    </TabsTrigger>
                                    <TabsTrigger value="expertise" disabled={!expertiseDeck} className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Expertise
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSlidesPanelOpen((open) => !open)}
                            aria-expanded={slidesPanelOpen}
                            className="flex items-center gap-2 self-start rounded-xl border-zinc-200 bg-zinc-50 lg:self-auto"
                        >
                            {slidesPanelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            {slidesPanelOpen ? 'Hide Slides' : 'Show Slides'}
                        </Button>
                    </div>

                    {slidesPanelOpen && (
                        <div className="rounded-2xl bg-zinc-100/90 p-3">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Slide Navigator</p>
                                <p className="text-xs text-zinc-500">{activeTheme.replace(/_/g, ' ')}</p>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {currentDeck?.slides.map((slide: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`min-w-[220px] shrink-0 rounded-xl border px-4 py-3 text-left transition-all ${
                                            currentSlide === idx
                                                ? 'border-emerald-500 bg-white shadow-sm'
                                                : 'border-transparent bg-white/70 hover:border-zinc-200 hover:bg-white'
                                        }`}
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Slide {idx + 1}</p>
                                        <p className="mt-2 line-clamp-2 text-sm font-semibold text-zinc-900">{slide.title}</p>
                                        {slide.slideType && (
                                            <p className="mt-2 text-xs text-zinc-500">{slide.slideType}</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </footer>

            {/* Add Activity Modal */}
            {currentDeck && currentDeck.meta && (
                <AddActivityModal
                    isOpen={activityModalOpen}
                    onClose={() => setActivityModalOpen(false)}
                    onAddActivity={async (activity: GeneratedActivity) => {
                        const newSlide = {
                            title: activity.title,
                            content: activity.content,
                            slideType: 'ACTIVITY' as const,
                            bloom_level: activity.bloom_level,
                            order: selectedSlideForAction + 2,
                        }

                        const updatedDeck = await updateAndPersistDeck((deck) => {
                            const updatedSlides = [...deck.slides]
                            updatedSlides.splice(selectedSlideForAction + 1, 0, newSlide as any)
                            updatedSlides.forEach((s, i) => {
                                s.order = i + 1
                            })

                            return {
                                ...deck,
                                slides: updatedSlides,
                            }
                        })

                        if (updatedDeck) {
                            setCurrentSlide(selectedSlideForAction + 1)

                            toast({
                                title: 'Activity Added',
                                description: `"${activity.title}" has been added after slide ${selectedSlideForAction + 1}`,
                            })
                        }
                    }}
                    slideContext={{
                        title: currentDeck.slides[selectedSlideForAction]?.title || '',
                        content: currentDeck.slides[selectedSlideForAction]?.content || '',
                        slideIndex: selectedSlideForAction,
                    }}
                    deckMeta={{
                        subject: currentDeck.meta?.subject || '',
                        gradeLevel: currentDeck.meta?.grade || '',
                        topic: currentDeck.meta?.topic || '',
                    }}
                />
            )}

            {/* Add Slide Modal */}
            {currentDeck && currentDeck.meta && (
                <AddSlideModal
                    isOpen={slideModalOpen}
                    onClose={() => setSlideModalOpen(false)}
                    onAddSlide={async (slide: GeneratedSlide) => {
                        const newSlide = {
                            title: slide.title,
                            content: slide.content,
                            slideType: slide.slideType as any,
                            bloom_level: slide.bloom_level,
                            order: selectedSlideForAction + 2,
                        }

                        const updatedDeck = await updateAndPersistDeck((deck) => {
                            const updatedSlides = [...deck.slides]
                            updatedSlides.splice(selectedSlideForAction + 1, 0, newSlide as any)
                            updatedSlides.forEach((s, i) => {
                                s.order = i + 1
                            })

                            return {
                                ...deck,
                                slides: updatedSlides,
                            }
                        })

                        if (updatedDeck) {
                            setCurrentSlide(selectedSlideForAction + 1)

                            toast({
                                title: 'Slide Added',
                                description: `"${slide.title}" has been added after slide ${selectedSlideForAction + 1}`,
                            })
                        }
                    }}
                    afterSlideIndex={selectedSlideForAction}
                    deckMeta={{
                        subject: currentDeck.meta?.subject || '',
                        gradeLevel: currentDeck.meta?.grade || '',
                        topic: currentDeck.meta?.topic || '',
                    }}
                />
            )}
        </div >
    )
}
