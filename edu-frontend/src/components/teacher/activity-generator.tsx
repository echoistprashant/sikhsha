'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput, GlassTextarea } from '@/components/ui/glass-input'
import {
    GlassSelect,
    GlassSelectContent,
    GlassSelectItem,
    GlassSelectTrigger,
    GlassSelectValue,
} from '@/components/ui/glass-select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import api from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sparkles, Check, ChevronRight, BookOpen, Brain, PlayCircle, Trophy, RefreshCw, X } from 'lucide-react'

// Types
interface QuizQuestion {
    id: string
    content: string
    type: string
    options: string[]
    answer: string
    explanation: string
    difficulty: string
}

interface Chapter {
    name: string
    topics?: { name: string }[]
}

interface Topic {
    name: string
}

const CLASS_OPTIONS = ['8', '9', '10', '11', '12']

export default function ActivityGenerator() {
    const router = useRouter()
    const { toast } = useToast()

    // Mode: 'setup' | 'quiz'
    const [mode, setMode] = useState<'setup' | 'quiz'>('setup')

    // Setup State
    const [curriculum, setCurriculum] = useState<string>('ICSE')
    const [selectedClass, setSelectedClass] = useState<string>('')
    const [selectedSubject, setSelectedSubject] = useState<string>('')
    const [selectedChapter, setSelectedChapter] = useState<string>('')
    const [selectedTopic, setSelectedTopic] = useState<string>('')
    const [additionalInstructions, setAdditionalInstructions] = useState<string>('')

    // Data Lists
    const [subjects, setSubjects] = useState<string[]>([])
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [topics, setTopics] = useState<Topic[]>([])

    // Loading States
    const [loadingSubjects, setLoadingSubjects] = useState(false)
    const [loadingChapters, setLoadingChapters] = useState(false)
    const [loadingTopics, setLoadingTopics] = useState(false)
    const [generating, setGenerating] = useState(false)

    // Quiz State
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<{ [key: string]: string }>({}) // questionId -> selectedOption
    const [showExplanation, setShowExplanation] = useState(false)

    // --- Curriculum Fetching ---

    useEffect(() => {
        if (!selectedClass) return
        setLoadingSubjects(true)
        setSubjects([])
        setSelectedSubject('')

        api.get(`/curriculum/${selectedClass}/subjects?board=${curriculum}`)
            .then(res => setSubjects(res.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoadingSubjects(false))
    }, [selectedClass, curriculum])

    useEffect(() => {
        if (!selectedClass || !selectedSubject) return
        setLoadingChapters(true)
        setChapters([])
        setSelectedChapter('')

        api.get(`/curriculum/${selectedClass}/${encodeURIComponent(selectedSubject)}/chapters?board=${curriculum}`)
            .then(res => setChapters(res.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoadingChapters(false))
    }, [selectedClass, selectedSubject, curriculum])

    useEffect(() => {
        if (!selectedClass || !selectedSubject || !selectedChapter) return
        setLoadingTopics(true)
        setTopics([])
        setSelectedTopic('')

        api.get(`/curriculum/${selectedClass}/${encodeURIComponent(selectedSubject)}/${encodeURIComponent(selectedChapter)}/topics?board=${curriculum}`)
            .then(res => setTopics(res.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoadingTopics(false))
    }, [selectedClass, selectedSubject, selectedChapter, curriculum])


    // --- Quiz Logic ---

    const handleStartSession = async () => {
        if (!selectedClass || !selectedSubject || !selectedChapter || !selectedTopic) return

        setGenerating(true)
        try {
            const payload = {
                classLevel: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                topic: selectedTopic,
                curriculum,
                count: 5,
                additionalInstructions: additionalInstructions.trim() || undefined
            }

            const response = await api.post('/teacher/activity/generate', payload)

            if (response.data.questions && response.data.questions.length > 0) {
                setQuestions(response.data.questions)
                setMode('quiz')
                setCurrentIndex(0)
                setAnswers({})
                setShowExplanation(false)
            } else {
                toast({ title: 'Error', description: 'No questions generated.', variant: 'destructive' })
            }
        } catch (error: any) {
            toast({
                title: 'Generation Failed',
                description: error.response?.data?.message || 'Could not start session.',
                variant: 'destructive'
            })
        } finally {
            setGenerating(false)
        }
    }

    const fetchMoreQuestions = async () => {
        try {
            const payload = {
                classLevel: selectedClass,
                subject: selectedSubject,
                chapter: selectedChapter,
                topic: selectedTopic,
                count: 2
            }
            const response = await api.post('/teacher/activity/generate', payload)
            if (response.data.questions.length > 0) {
                setQuestions(prev => {
                    const existingIds = new Set(prev.map(q => q.id))
                    const newQs = response.data.questions.filter((q: QuizQuestion) => !existingIds.has(q.id))
                    return [...prev, ...newQs]
                })
                toast({ title: 'New questions added!', description: 'Keep going!', duration: 2000 })
            }
        } catch (err) {
            console.error('Failed to auto-fetch questions', err)
        }
    }

    const handleAnswerSelect = (option: string) => {
        const currentQ = questions[currentIndex]
        if (answers[currentQ.id]) return // Already answered

        setAnswers(prev => ({ ...prev, [currentQ.id]: option }))
        setShowExplanation(true)

        const answeredCount = Object.keys(answers).length + 1
        // Trigger fetch more every 2 questions
        if (answeredCount % 2 === 0) {
            fetchMoreQuestions()
        }
    }

    const handleSkip = () => {
        // Trigger fetch if we are near the end
        if (currentIndex >= questions.length - 2) {
            fetchMoreQuestions()
        }
        nextQuestion()
    }

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
            // Show explanation if the NEXT question was already answered (e.g. going back and forth? No, we only go forward typically but if we support back...)
            // Actually, we don't support back. But if we did, we check answer.
            setShowExplanation(!!answers[questions[currentIndex + 1]?.id])
        }
    }

    const endSession = () => {
        if (confirm('Are you sure you want to end this quiz?')) {
            setMode('setup')
            setQuestions([])
            setAnswers({})
        }
    }

    // --- Rendering ---

    if (mode === 'quiz') {
        const currentQ = questions[currentIndex]
        if (!currentQ) return <div className="p-8 text-center text-[#1F1F1F]"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>

        const userAnswer = answers[currentQ.id]
        const isAnswered = !!userAnswer
        const isCorrect = userAnswer === currentQ.answer

        // Check if this is a non-MCQ question (no options or empty options)
        const hasOptions = currentQ.options && currentQ.options.length > 0
        const isDescriptive = !hasOptions || currentQ.type?.toLowerCase().includes('descriptive') || currentQ.type?.toLowerCase().includes('short') || currentQ.type?.toLowerCase().includes('long')

        // Handler for showing answer on non-MCQ questions
        const handleShowAnswer = () => {
            setAnswers(prev => ({ ...prev, [currentQ.id]: currentQ.answer }))
            setShowExplanation(true)

            const answeredCount = Object.keys(answers).length + 1
            if (answeredCount % 2 === 0) {
                fetchMoreQuestions()
            }
        }

        return (
            <div className="min-h-screen bg-[#E5E1DD] text-gray-900 p-4 md:p-8 flex items-center justify-center font-inter">
                <div className="w-full max-w-4xl space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex gap-2">
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={endSession}>
                                <X className="w-4 h-4 mr-2" /> End
                            </Button>
                            <Button variant="outline" className="text-gray-600 hover:text-gray-900" onClick={handleSkip}>
                                Skip
                            </Button>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500 font-medium">Question {currentIndex + 1}</span>
                            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-zinc-900 transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <Card className="bg-white border-gray-200 shadow-xl">
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-zinc-900 rounded-lg">
                                        <Brain className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {currentQ.type && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full uppercase">
                                                    {currentQ.type}
                                                </span>
                                            )}
                                            {currentQ.difficulty && (
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full uppercase ${currentQ.difficulty.toLowerCase() === 'easy' ? 'bg-green-100 text-green-600' :
                                                        currentQ.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                            'bg-red-100 text-red-600'
                                                    }`}>
                                                    {currentQ.difficulty}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold leading-relaxed text-gray-800">
                                            {currentQ.content}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            {/* Options for MCQ questions */}
                            {hasOptions && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {currentQ.options?.map((opt, idx) => {
                                        let btnClass = "h-auto p-6 text-left justify-start text-lg border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700"

                                        if (isAnswered) {
                                            if (opt === currentQ.answer) {
                                                btnClass = "h-auto p-6 text-left justify-start text-lg border-2 border-green-500 bg-green-50 text-green-700 font-medium shadow-sm"
                                            } else if (opt === userAnswer) {
                                                btnClass = "h-auto p-6 text-left justify-start text-lg border-2 border-red-500 bg-red-50 text-red-700 font-medium"
                                            } else {
                                                btnClass = "h-auto p-6 text-left justify-start text-lg border-2 border-gray-100 bg-gray-50 text-gray-400 opacity-60"
                                            }
                                        }

                                        return (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                className={btnClass}
                                                onClick={() => handleAnswerSelect(opt)}
                                                disabled={isAnswered}
                                            >
                                                <div className="flex items-center gap-3 w-full">
                                                    <span className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold ${isAnswered && (opt === currentQ.answer || opt === userAnswer) ? 'border-current' : 'border-gray-300 text-gray-500'}`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="whitespace-normal leading-tight">{opt}</span>
                                                </div>
                                            </Button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Show Answer button for non-MCQ questions */}
                            {!hasOptions && !isAnswered && (
                                <div className="flex justify-center">
                                    <GlassButton size="lg" onClick={handleShowAnswer}>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-5 w-5" /> Show Answer
                                        </div>
                                    </GlassButton>
                                </div>
                            )}

                            {/* Feedback Section */}
                            {isAnswered && (
                                <div className={`mt-8 p-6 rounded-xl border ${isCorrect || !hasOptions ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} animate-in fade-in slide-in-from-bottom-4`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-full ${isCorrect || !hasOptions ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {isCorrect || !hasOptions ? <Check className="h-6 w-6 text-green-600" /> : <Trophy className="h-6 w-6 text-red-600" />}
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <h3 className={`text-lg font-bold ${isCorrect || !hasOptions ? 'text-green-800' : 'text-red-800'}`}>
                                                {!hasOptions ? 'Answer' : (isCorrect ? 'Correct Answer!' : 'Incorrect')}
                                            </h3>
                                            {/* Show the correct answer for descriptive questions */}
                                            {!hasOptions && (
                                                <div className="p-4 bg-white rounded-lg border border-green-200 mb-3">
                                                    <p className="text-gray-800 font-medium whitespace-pre-wrap">{currentQ.answer}</p>
                                                </div>
                                            )}
                                            {currentQ.explanation && (
                                                <p className="text-gray-700 leading-relaxed text-lg">
                                                    {currentQ.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {currentIndex < questions.length - 1 && (
                                        <div className="mt-6 flex justify-end">
                                            <GlassButton size="lg" onClick={nextQuestion}>
                                                <div className="flex items-center gap-2">
                                                    Next Question <ChevronRight className="h-5 w-5" />
                                                </div>
                                            </GlassButton>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-[#E5E1DD] dark:bg-zinc-950 flex items-center justify-center p-4 font-inter">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 bg-zinc-900 rounded-2xl shadow-sm mb-4">
                        <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                        Interactive Quiz Session
                    </h1>
                    <p className="text-lg text-gray-600 max-w-lg mx-auto">
                        Launch a live, AI-generated quiz for your classroom instantly.
                    </p>
                </div>

                <Card className="bg-white border-white/50 shadow-xl shadow-zinc-200/50">
                    <CardContent className="p-8 space-y-6">
                        <div className="grid gap-6">
                                {/* Curriculum */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold pl-1">Curriculum Board</Label>
                                    <GlassSelect value={curriculum} onValueChange={(v) => { setCurriculum(v); setSelectedClass(''); setSelectedSubject(''); setSelectedChapter(''); setSelectedTopic('') }}>
                                        <GlassSelectTrigger className="bg-white/40 border-white/50 h-12 text-lg text-gray-800 focus:ring-[#4CAF50]">
                                            <GlassSelectValue placeholder="Select Curriculum" />
                                        </GlassSelectTrigger>
                                        <GlassSelectContent>
                                            <GlassSelectItem value="ICSE">ICSE / ISC</GlassSelectItem>
                                            <GlassSelectItem value="CBSE">CBSE</GlassSelectItem>
                                        </GlassSelectContent>
                                    </GlassSelect>
                                </div>

                                {/* Class */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-semibold pl-1">Class</Label>
                                    <GlassSelect value={selectedClass} onValueChange={setSelectedClass} disabled={!curriculum}>
                                        <GlassSelectTrigger className="bg-white/40 border-white/50 h-12 text-lg text-gray-800 focus:ring-[#4CAF50]">
                                            <GlassSelectValue placeholder="Select Class" />
                                        </GlassSelectTrigger>
                                        <GlassSelectContent>
                                            {CLASS_OPTIONS.map(c => <GlassSelectItem key={c} value={c}>Class {c}</GlassSelectItem>)}
                                        </GlassSelectContent>
                                    </GlassSelect>
                                </div>


                            <div className="space-y-2">
                                <Label className="text-gray-700 font-semibold pl-1">Subject</Label>
                                <GlassSelect value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                                    <GlassSelectTrigger className="bg-white/40 border-white/50 h-12 text-lg text-gray-800 focus:ring-[#4CAF50]">
                                        <GlassSelectValue placeholder={loadingSubjects ? "Loading..." : "Select Subject"} />
                                    </GlassSelectTrigger>
                                    <GlassSelectContent>
                                        {subjects.map(s => <GlassSelectItem key={s} value={s}>{s}</GlassSelectItem>)}
                                    </GlassSelectContent>
                                </GlassSelect>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700 font-semibold pl-1">Chapter</Label>
                                <GlassSelect value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedSubject}>
                                    <GlassSelectTrigger className="bg-white/40 border-white/50 h-12 text-lg text-gray-800 focus:ring-[#4CAF50]">
                                        <GlassSelectValue placeholder={loadingChapters ? "Loading..." : "Select Chapter"} />
                                    </GlassSelectTrigger>
                                    <GlassSelectContent>
                                        {chapters.map(c => <GlassSelectItem key={c.name} value={c.name}>{c.name}</GlassSelectItem>)}
                                    </GlassSelectContent>
                                </GlassSelect>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700 font-semibold pl-1">Topic</Label>
                                {topics.length > 0 ? (
                                    <GlassSelect value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedChapter}>
                                        <GlassSelectTrigger className="bg-white/40 border-white/50 h-12 text-lg text-gray-800 focus:ring-[#4CAF50]">
                                            <GlassSelectValue placeholder={loadingTopics ? "Loading..." : "Select Topic"} />
                                        </GlassSelectTrigger>
                                        <GlassSelectContent>
                                            {topics.map(t => <GlassSelectItem key={t.name} value={t.name}>{t.name}</GlassSelectItem>)}
                                        </GlassSelectContent>
                                    </GlassSelect>
                                ) : (
                                    <GlassInput
                                        placeholder="Enter Topic"
                                        value={selectedTopic}
                                        onChange={(e) => setSelectedTopic(e.target.value)}
                                        className="bg-white/40 border-white/50 h-12 text-lg text-gray-800 focus:ring-[#4CAF50]"
                                        disabled={!selectedChapter}
                                    />
                                )}
                            </div>

                            {/* Additional Instructions */}
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-semibold pl-1">Additional Instructions (Optional)</Label>
                                <GlassTextarea
                                    placeholder="E.g., Make questions more challenging, focus on application-level thinking, include real-world scenarios..."
                                    value={additionalInstructions}
                                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                                    disabled={!selectedTopic}
                                    className="bg-white/40 border-white/50 min-h-[120px] text-gray-800 focus:ring-[#4CAF50] resize-none"
                                />
                            </div>
                        </div>

                        <GlassButton
                            className="w-full"
                            onClick={handleStartSession}
                            disabled={generating || !selectedTopic}
                            size="lg"
                        >
                            <div className="w-full flex items-center justify-center gap-2 text-lg font-bold">
                                {generating ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Generating Quiz...</>
                                ) : (
                                    <><PlayCircle className="h-5 w-5" /> Start Interactive Session</>
                                )}
                            </div>
                        </GlassButton>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
