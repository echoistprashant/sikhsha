'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Download, Users, BookOpen, GraduationCap, Sparkles } from 'lucide-react'
import { LessonDeck, DeckGenerateRequest } from '@/types/lesson'
import { deckService, type DifferentiatedDecks } from '@/lib/deckService'
import { StandardsBadges } from './StandardsBadges'
import { BloomsProgressionChart } from './BloomsProgressionChart'

interface ChalkieDeckGeneratorProps {
    // Curriculum selection from parent component
    selectedClass: string
    selectedSubject: string
    topic: string
}

export function ChalkieDeckGenerator({
    selectedClass,
    selectedSubject,
    topic
}: ChalkieDeckGeneratorProps) {
    const { toast } = useToast()
    const [theme, setTheme] = useState<string>('default')
    const [generating, setGenerating] = useState(false)
    const [currentDeck, setCurrentDeck] = useState<LessonDeck | null>(null)
    const [currentLevel, setCurrentLevel] = useState<'core' | 'support' | 'extension'>('core')
    const [allDecks, setAllDecks] = useState<DifferentiatedDecks | null>(null)

    const handleGenerateCore = async () => {
        if (!topic || !selectedSubject || !selectedClass) {
            toast({
                title: 'Missing Information',
                description: 'Please select class, subject, and topic',
                variant: 'destructive',
            })
            return
        }

        setGenerating(true)
        try {
            const request: DeckGenerateRequest = {
                topic,
                subject: selectedSubject,
                gradeLevel: selectedClass,
                theme
            }

            const deck = await deckService.generateComplete(request)
            setCurrentDeck(deck)
            setCurrentLevel('core')
            setAllDecks(null)

            toast({
                title: 'Deck Generated!',
                description: `Generated ${deck.slides.length} slides with Bloom's progression`,
            })
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

    const handleGenerateAllLevels = async () => {
        if (!topic || !selectedSubject || !selectedClass) {
            toast({
                title: 'Missing Information',
                description: 'Please select class, subject, and topic',
                variant: 'destructive',
            })
            return
        }

        setGenerating(true)
        try {
            const request: DeckGenerateRequest = {
                topic,
                subject: selectedSubject,
                gradeLevel: selectedClass,
                theme
            }

            const decks = await deckService.generateAllLevels(request)
            setAllDecks(decks)
            setCurrentDeck(decks.core)
            setCurrentLevel('core')

            toast({
                title: 'All Levels Generated!',
                description: `Support (${decks.support.slides.length}), Core (${decks.core.slides.length}), Extension (${decks.extension.slides.length}) slides`,
            })
        } catch (error: any) {
            toast({
                title: 'Generation Failed',
                description: error.message || 'Failed to generate differentiated decks',
                variant: 'destructive',
            })
        } finally {
            setGenerating(false)
        }
    }

    const handleDownloadPPTX = async (level: 'core' | 'support' | 'extension' = currentLevel) => {
        if (!topic || !selectedSubject || !selectedClass) {
            return
        }

        try {
            const request: DeckGenerateRequest = {
                topic,
                subject: selectedSubject,
                gradeLevel: selectedClass,
                theme,
                level: level.toUpperCase() as any
            }

            await deckService.generateAndDownloadPPTX(
                request,
                `${topic}_${level}.pptx`
            )

            toast({
                title: 'Download Started',
                description: 'Your PowerPoint file is being downloaded',
            })
        } catch (error: any) {
            toast({
                title: 'Download Failed',
                description: error.message || 'Failed to download PPTX',
                variant: 'destructive',
            })
        }
    }

    const switchLevel = (level: 'core' | 'support' | 'extension') => {
        if (allDecks) {
            setCurrentDeck(allDecks[level])
            setCurrentLevel(level)
        }
    }

    return (
        <div className="space-y-6">
            {/* Theme Selector */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">PowerPoint Theme</CardTitle>
                    <CardDescription>Choose a visual theme for your presentation</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="science_nature">Science & Nature</SelectItem>
                            <SelectItem value="mathematics">Mathematics</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Generation Controls */}
            <div className="flex gap-3">
                <Button
                    onClick={handleGenerateCore}
                    disabled={generating || !topic}
                    className="flex-1"
                    size="lg"
                >
                    {generating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Core Deck
                        </>
                    )}
                </Button>

                <Button
                    onClick={handleGenerateAllLevels}
                    disabled={generating || !topic}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                >
                    {generating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        'Generate All Levels'
                    )}
                </Button>
            </div>

            {/* Results Display */}
            {currentDeck && (
                <>
                    {/* Differentiation Level Tabs */}
                    {allDecks && (
                        <Tabs value={currentLevel} onValueChange={(v) => switchLevel(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="support" className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Support
                                </TabsTrigger>
                                <TabsTrigger value="core" className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    Core
                                </TabsTrigger>
                                <TabsTrigger value="extension" className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Extension
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}

                    {/* Standards & Bloom's */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <StandardsBadges standards={currentDeck.meta?.standards || []} />
                        <BloomsProgressionChart slides={currentDeck.slides.map(s => ({ title: s.title, bloom_level: s.bloom_level }))} />
                    </div>

                    {/* Deck Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{currentDeck.meta?.topic}</CardTitle>
                            <CardDescription>
                                {currentDeck.slides.length} slides • {currentDeck.meta?.grade}th Grade • {currentLevel.toUpperCase()} Level
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Learning Objectives */}
                            {(currentDeck.structure?.learning_objectives?.length || 0) > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Learning Objectives:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                        {currentDeck.structure.learning_objectives.map((obj, idx) => (
                                            <li key={idx}>
                                                {obj.objective} <span className="text-xs text-gray-500">({obj.bloom_level})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Download Button */}
                            <Button
                                onClick={() => handleDownloadPPTX()}
                                className="w-full"
                                size="lg"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                Download {currentLevel.toUpperCase()} PPTX
                            </Button>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
