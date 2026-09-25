'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Loader2, Plus, X, ArrowLeft, ArrowRight, ClipboardList, ImageIcon,
    Sparkles, Check, BookOpen, GraduationCap, Layers, ListChecks
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import Link from 'next/link'

interface QuestionType {
    type: string
    count: number
}

interface CurriculumTopic {
    name: string
    subtopics?: string[]
}

interface CurriculumChapter {
    name: string
    topics: CurriculumTopic[]
}

// One entry per selected chapter. `allTopics` means "include every topic of this chapter".
interface ChapterSelection {
    chapter: string
    allTopics: boolean
    topics: string[]
}

const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'true-false', label: 'True/False' },
    { value: 'long-answer', label: 'Long Answer' },
    { value: 'reasoning-based', label: 'Reasoning Based' },
    { value: 'application-based', label: 'Application Based' },
    { value: 'analytical', label: 'Analytical' },
    { value: 'fill-in-the-blank', label: 'Fill in the Blank' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'problem-solving', label: 'Problem Solving' }
]

const typeLabel = (value: string) =>
    questionTypeOptions.find(o => o.value === value)?.label ?? value

const CURRICULUM_OPTIONS = [
    { value: 'ICSE', label: 'ICSE / ISC', description: 'Indian Certificate of Secondary Education' },
    { value: 'CBSE', label: 'CBSE', description: 'Central Board of Secondary Education' },
]

const steps = [
    { id: 1, title: 'Curriculum', icon: BookOpen },
    { id: 2, title: 'Class', icon: GraduationCap },
    { id: 3, title: 'Subject', icon: BookOpen },
    { id: 4, title: 'Chapters & Topics', icon: Layers },
    { id: 5, title: 'Question Paper', icon: ListChecks }
]

export default function QuestionGeneratorPage() {
    const router = useRouter()
    const { toast } = useToast()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Board / Curriculum selection
    const [curriculum, setCurriculum] = useState<'ICSE' | 'CBSE'>('ICSE')

    // Curriculum data
    const [classes, setClasses] = useState<(string | number)[]>([])
    const [subjects, setSubjects] = useState<string[]>([])
    const [chapters, setChapters] = useState<CurriculumChapter[]>([])
    const [loadingChapters, setLoadingChapters] = useState(false)

    // Selection
    const [classLevel, setClassLevel] = useState('')
    const [subject, setSubject] = useState('')
    const [selections, setSelections] = useState<Record<string, ChapterSelection>>({})

    // Question dashboard
    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
        { type: 'multiple-choice', count: 5 }
    ])

    // Options
    const [difficulty, setDifficulty] = useState('medium')
    const [provider, setProvider] = useState<'gemini' | 'openai'>('openai')
    const [title, setTitle] = useState('')
    const [extraCommands, setExtraCommands] = useState('')
    const [enableVisuals, setEnableVisuals] = useState(true)
    const [visualStyle, setVisualStyle] = useState<'auto' | 'vector' | 'biology-color'>('auto')
    const [includeAnswers, setIncludeAnswers] = useState(false)
    const [includeExplanations, setIncludeExplanations] = useState(false)

    // ---- Data loading -------------------------------------------------------
    useEffect(() => {
        api.get(`/curriculum/classes?board=${curriculum}`)
            .then(res => setClasses(res.data))
            .catch(err => console.error('Failed to load classes:', err))
    }, [curriculum])

    useEffect(() => {
        if (!classLevel) return
        setSubjects([])
        api.get(`/curriculum/${classLevel}/subjects?board=${curriculum}`)
            .then(res => setSubjects(res.data))
            .catch(err => console.error('Failed to load subjects:', err))
    }, [classLevel, curriculum])

    useEffect(() => {
        if (!classLevel || !subject) return
        setLoadingChapters(true)
        setChapters([])
        api.get(`/curriculum/${classLevel}/${encodeURIComponent(subject)}/chapters?board=${curriculum}`)
            .then(res => setChapters(res.data || []))
            .catch(err => console.error('Failed to load chapters:', err))
            .finally(() => setLoadingChapters(false))
    }, [classLevel, subject, curriculum])

    // ---- Selection handlers -------------------------------------------------
    const selectCurriculum = (c: 'ICSE' | 'CBSE') => {
        if (c === curriculum) { setStep(2); return }
        setCurriculum(c)
        setClassLevel('')
        setSubject('')
        setSelections({})
        setStep(2)
    }

    const selectClass = (cls: string) => {
        if (cls === classLevel) return
        setClassLevel(cls)
        setSubject('')
        setSelections({})
        setStep(3)
    }

    const selectSubject = (sub: string) => {
        if (sub !== subject) {
            setSubject(sub)
            setSelections({})
        }
        setStep(4)
    }

    const isChapterSelected = (name: string) => Boolean(selections[name])

    const toggleChapter = (chapter: CurriculumChapter) => {
        setSelections(prev => {
            const next = { ...prev }
            if (next[chapter.name]) {
                delete next[chapter.name]
            } else {
                // Default to all topics when a chapter is first picked.
                next[chapter.name] = { chapter: chapter.name, allTopics: true, topics: [] }
            }
            return next
        })
    }

    const setAllTopics = (chapter: CurriculumChapter) => {
        setSelections(prev => ({
            ...prev,
            [chapter.name]: { chapter: chapter.name, allTopics: true, topics: [] }
        }))
    }

    const toggleTopic = (chapter: CurriculumChapter, topicName: string) => {
        setSelections(prev => {
            const current = prev[chapter.name]
            // Starting from "all topics", first manual pick narrows to that topic only.
            const base = !current || current.allTopics ? [] : [...current.topics]
            const exists = base.includes(topicName)
            const topics = exists ? base.filter(t => t !== topicName) : [...base, topicName]
            return {
                ...prev,
                [chapter.name]: { chapter: chapter.name, allTopics: false, topics }
            }
        })
    }

    const isTopicChecked = (chapterName: string, topicName: string) => {
        const sel = selections[chapterName]
        if (!sel) return false
        return sel.allTopics || sel.topics.includes(topicName)
    }

    // ---- Question type handlers --------------------------------------------
    const addQuestionType = () => {
        const used = new Set(questionTypes.map(q => q.type))
        const nextType = questionTypeOptions.find(o => !used.has(o.value)) ?? questionTypeOptions[0]
        setQuestionTypes([...questionTypes, { type: nextType.value, count: 5 }])
    }

    const removeQuestionType = (index: number) => {
        if (questionTypes.length > 1) {
            setQuestionTypes(questionTypes.filter((_, i) => i !== index))
        }
    }

    const updateQuestionType = (index: number, field: 'type' | 'count', value: string | number) => {
        const updated = [...questionTypes]
        if (field === 'type') {
            updated[index].type = value as string
        } else {
            updated[index].count = Math.max(1, Math.min(40, Number(value) || 1))
        }
        setQuestionTypes(updated)
    }

    // ---- Derived ------------------------------------------------------------
    const selectedList = Object.values(selections)
    const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0)

    // Flat list of every chosen sub-topic name (used as AI `concepts`).
    const concepts = useMemo(() => {
        const acc: string[] = []
        for (const sel of selectedList) {
            const chapter = chapters.find(c => c.name === sel.chapter)
            if (sel.allTopics) {
                chapter?.topics.forEach(t => acc.push(t.name))
            } else {
                acc.push(...sel.topics)
            }
        }
        return Array.from(new Set(acc))
    }, [selections, chapters])

    // Human-readable chapter descriptor used for the prompt/title.
    const chapterDescriptor = useMemo(() => {
        return selectedList
            .map(sel => {
                if (sel.allTopics) return `${sel.chapter} (all topics)`
                if (sel.topics.length) return `${sel.chapter} (${sel.topics.join(', ')})`
                return sel.chapter
            })
            .join('; ')
    }, [selections])

    const chaptersValid = selectedList.length > 0 &&
        selectedList.every(s => s.allTopics || s.topics.length > 0)

    // ---- Generate -----------------------------------------------------------
    const handleGenerate = async () => {
        if (!classLevel || !subject || !chaptersValid) {
            toast({
                title: 'Missing selections',
                description: 'Please pick a class, subject, and at least one chapter/topic.',
                variant: 'destructive'
            })
            return
        }

        setLoading(true)
        try {
            const payload = {
                subject,
                chapter: chapterDescriptor,
                concepts,
                difficulty,
                classLevel: String(classLevel),
                curriculum,
                extraCommands: extraCommands.trim() || undefined,
                title: title.trim() || undefined,
                provider,
                questionTypes,
                enableVisuals,
                visualStyle
            }

            const response = await api.post('/questions/generate-mixed', payload)

            sessionStorage.setItem('currentQuestions', JSON.stringify(response.data))
            sessionStorage.setItem('generationParams', JSON.stringify({
                subject,
                chapter: chapterDescriptor,
                concepts,
                difficulty,
                classLevel,
                curriculum,
                extraCommands,
                title,
                provider,
                questionTypes,
                enableVisuals,
                visualStyle,
                includeAnswers,
                includeExplanations,
                selections: selectedList
            }))

            toast({ title: 'Success', description: 'Questions generated successfully!' })
            router.push('/teacher/question-generator/view')
        } catch (err: any) {
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to generate questions',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    // ---- Render -------------------------------------------------------------
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8">
            <div className="max-w-5xl mx-auto px-6 space-y-8">
                {/* Header */}
                <div>
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="mb-6">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="inline-flex p-3 bg-zinc-950 rounded-lg shadow-sm">
                                    <ClipboardList className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
                                        Question Generator
                                    </h1>
                                    <p className="text-zinc-600 dark:text-zinc-400">
                                        Pick chapters and sub-topics, then build one paper with any mix of question types.
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900 whitespace-nowrap">
                                {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} planned
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stepper */}
                <Stepper step={step} setStep={setStep} canVisit={(target) => {
                    if (target <= 1) return true
                    if (target === 2) return Boolean(curriculum)
                    if (target === 3) return Boolean(curriculum && classLevel)
                    if (target === 4) return Boolean(curriculum && classLevel && subject)
                    if (target === 5) return Boolean(curriculum && classLevel && subject && chaptersValid)
                    return false
                }} />

                {/* Step content */}
                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Curriculum Board</CardTitle>
                            <CardDescription>Choose the curriculum board. Defaults to ICSE.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {CURRICULUM_OPTIONS.map(opt => {
                                    const active = opt.value === curriculum
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => selectCurriculum(opt.value as 'ICSE' | 'CBSE')}
                                            className={`rounded-xl border p-6 text-left font-semibold transition-all ${active
                                                ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-sm ring-2 ring-teal-400'
                                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-teal-300 hover:bg-teal-50/40'
                                                }`}
                                        >
                                            <div className="text-xl font-bold">{opt.label}</div>
                                            <div className="text-xs text-zinc-500 mt-1">{opt.description}</div>
                                            {active && <div className="text-xs text-teal-600 mt-2 font-medium">✓ Selected</div>}
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Class</CardTitle>
                            <CardDescription>{curriculum} · Choose the class you are setting questions for.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {classes.map(cls => {
                                    const value = String(cls)
                                    const active = value === classLevel
                                    return (
                                        <button
                                            key={value}
                                            onClick={() => selectClass(value)}
                                            className={`rounded-xl border p-5 text-center font-semibold transition-all ${active
                                                ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-sm'
                                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-teal-300 hover:bg-teal-50/40'
                                                }`}
                                        >
                                            <div className="text-2xl">{value}</div>
                                            <div className="text-xs text-zinc-500">Class</div>
                                        </button>
                                    )
                                })}
                                {classes.length === 0 && (
                                    <p className="text-sm text-zinc-500 col-span-full">Loading classes…</p>
                                )}
                            </div>
                            <div className="flex justify-between mt-6">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    ← Curriculum
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Subject</CardTitle>
                            <CardDescription>{curriculum} · Class {classLevel} · choose a subject.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {subjects.map(sub => {
                                    const active = sub === subject
                                    return (
                                        <button
                                            key={sub}
                                            onClick={() => selectSubject(sub)}
                                            className={`rounded-xl border p-4 text-left font-medium transition-all ${active
                                                ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-sm'
                                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-teal-300 hover:bg-teal-50/40'
                                                }`}
                                        >
                                            <BookOpen className="h-5 w-5 mb-2 text-teal-600" />
                                            {sub}
                                        </button>
                                    )
                                })}
                                {subjects.length === 0 && (
                                    <p className="text-sm text-zinc-500 col-span-full">Loading subjects…</p>
                                )}
                            </div>
                            <div className="flex justify-between mt-6">
                                <Button variant="outline" onClick={() => setStep(2)}>
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Class
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 4 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Chapters & Topics</CardTitle>
                                    <CardDescription>
                                        Select one or more chapters. Pick specific sub-topics or include all.
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="whitespace-nowrap">
                                    {selectedList.length} chapter{selectedList.length !== 1 ? 's' : ''} · {concepts.length} topic{concepts.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {loadingChapters && (
                                <p className="text-sm text-zinc-500 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading chapters…
                                </p>
                            )}
                            {!loadingChapters && chapters.length === 0 && (
                                <p className="text-sm text-zinc-500">No chapters found for this subject.</p>
                            )}

                            {chapters.map(chapter => {
                                const selected = isChapterSelected(chapter.name)
                                const sel = selections[chapter.name]
                                return (
                                    <div
                                        key={chapter.name}
                                        className={`rounded-xl border transition-all ${selected ? 'border-teal-400 bg-teal-50/40' : 'border-zinc-200 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between p-4">
                                            <button
                                                onClick={() => toggleChapter(chapter)}
                                                className="flex items-center gap-3 text-left flex-1"
                                            >
                                                <span className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? 'bg-teal-600 border-teal-600 text-white' : 'border-zinc-300 bg-white'
                                                    }`}>
                                                    {selected && <Check className="h-3.5 w-3.5" />}
                                                </span>
                                                <span className="font-medium text-zinc-900">{chapter.name}</span>
                                                <span className="text-xs text-zinc-500">
                                                    {chapter.topics.length} topic{chapter.topics.length !== 1 ? 's' : ''}
                                                </span>
                                            </button>
                                            {selected && (
                                                <Button
                                                    variant={sel?.allTopics ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setAllTopics(chapter)}
                                                    className="ml-3 whitespace-nowrap"
                                                >
                                                    Include all topics
                                                </Button>
                                            )}
                                        </div>

                                        {selected && chapter.topics.length > 0 && (
                                            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {chapter.topics.map(topic => {
                                                    const checked = isTopicChecked(chapter.name, topic.name)
                                                    return (
                                                        <label
                                                            key={topic.name}
                                                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${checked
                                                                ? 'border-teal-300 bg-white text-teal-900'
                                                                : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-white'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => toggleTopic(chapter, topic.name)}
                                                                className="rounded"
                                                            />
                                                            {topic.name}
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            <div className="flex justify-between pt-2">
                                <Button variant="outline" onClick={() => setStep(3)}>
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Subject
                                </Button>
                                <Button onClick={() => setStep(5)} disabled={!chaptersValid}>
                                    Build paper <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 5 && (
                    <div className="space-y-6">
                        {/* Selection summary */}
                        <Card className="border-teal-200 bg-teal-50/40">
                            <CardContent className="py-4">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <Badge variant="outline" className="bg-teal-50 text-teal-800 border-teal-300">{curriculum}</Badge>
                                    <Badge>Class {classLevel}</Badge>
                                    <Badge variant="secondary">{subject}</Badge>
                                    {selectedList.map(sel => (
                                        <Badge key={sel.chapter} variant="outline" className="bg-white">
                                            {sel.chapter}{sel.allTopics ? ' · all' : ` · ${sel.topics.length}`}
                                        </Badge>
                                    ))}
                                    <button
                                        onClick={() => setStep(4)}
                                        className="text-teal-700 underline underline-offset-2 ml-1"
                                    >
                                        edit
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Question dashboard */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Question Paper</CardTitle>
                                        <CardDescription>Add as many question types as you want and set how many of each.</CardDescription>
                                    </div>
                                    <Badge className="whitespace-nowrap">Total: {totalQuestions}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {questionTypes.map((qt, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                                        <div className="flex-1">
                                            <Select
                                                value={qt.type}
                                                onValueChange={(value) => updateQuestionType(index, 'type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {questionTypeOptions.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min={1}
                                                max={40}
                                                value={qt.count}
                                                onChange={(e) => updateQuestionType(index, 'count', e.target.value)}
                                                className="w-20 text-center"
                                            />
                                            <span className="text-sm text-zinc-600 whitespace-nowrap">questions</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeQuestionType(index)}
                                            disabled={questionTypes.length === 1}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addQuestionType}
                                    disabled={questionTypes.length >= questionTypeOptions.length}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add question type
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Options */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Options</CardTitle>
                                <CardDescription>Difficulty, model, title and instructions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="difficulty">Difficulty</Label>
                                        <Select value={difficulty} onValueChange={setDifficulty}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="easy">Easy</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="provider">Model</Label>
                                        <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gemini">Low Reasoning</SelectItem>
                                                <SelectItem value="openai">High Reasoning</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="title">Custom Title (Optional)</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Mid-Term Exam"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="extraCommands">Extra Instructions (Optional)</Label>
                                    <textarea
                                        id="extraCommands"
                                        value={extraCommands}
                                        onChange={(e) => setExtraCommands(e.target.value)}
                                        placeholder="Any specific requirements..."
                                        className="w-full min-h-[80px] p-2 border rounded-md"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Visuals */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-teal-700" />
                                    Visuals
                                </CardTitle>
                                <CardDescription>SVG diagrams for math and physics, colored plates for biology.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <label className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                                    <input
                                        type="checkbox"
                                        checked={enableVisuals}
                                        onChange={(e) => setEnableVisuals(e.target.checked)}
                                        className="mt-1 rounded"
                                    />
                                    <span>
                                        <span className="block font-medium text-zinc-900">Generate question visuals</span>
                                        <span className="block text-sm text-zinc-600">Best for graphs, geometry, circuits, forces, waves, cells, and biology diagrams.</span>
                                    </span>
                                </label>
                                <div>
                                    <Label htmlFor="visualStyle">Visual Style</Label>
                                    <Select value={visualStyle} onValueChange={(v: any) => setVisualStyle(v)} disabled={!enableVisuals}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">Auto: subject-aware</SelectItem>
                                            <SelectItem value="vector">Exam vector diagrams</SelectItem>
                                            <SelectItem value="biology-color">Color science illustrations</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* PDF options */}
                        <Card>
                            <CardHeader>
                                <CardTitle>PDF Options</CardTitle>
                                <CardDescription>Applied when you download from the next page.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeAnswers}
                                        onChange={(e) => setIncludeAnswers(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span>Include Answers in PDF</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeExplanations}
                                        onChange={(e) => setIncludeExplanations(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span>Include Explanations in PDF</span>
                                </label>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <Button variant="outline" onClick={() => setStep(4)}>
                                <ArrowLeft className="h-4 w-4 mr-2" /> Chapters
                            </Button>
                            <Button onClick={handleGenerate} disabled={loading} size="lg">
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
                                ) : (
                                    <><Sparkles className="h-4 w-4 mr-2" /> Generate {totalQuestions} Questions</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Step progress header
function Stepper({
    step,
    setStep,
    canVisit
}: {
    step: number
    setStep: (s: number) => void
    canVisit: (target: number) => boolean
}) {
    return (
        <div className="flex items-center">
            {steps.map((s, idx) => {
                const Icon = s.icon
                const active = s.id === step
                const done = s.id < step
                const reachable = canVisit(s.id)
                return (
                    <div key={s.id} className="flex items-center flex-1 last:flex-none">
                        <button
                            onClick={() => reachable && setStep(s.id)}
                            disabled={!reachable}
                            className={`flex items-center gap-2 ${reachable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                        >
                            <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${active
                                ? 'border-teal-600 bg-teal-600 text-white'
                                : done
                                    ? 'border-teal-600 bg-white text-teal-600'
                                    : 'border-zinc-300 bg-white text-zinc-400'
                                }`}>
                                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                            </span>
                            <span className={`text-sm font-medium hidden sm:block ${active ? 'text-teal-700' : 'text-zinc-500'}`}>
                                {s.title}
                            </span>
                        </button>
                        {idx < steps.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-3 ${done ? 'bg-teal-500' : 'bg-zinc-200'}`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
