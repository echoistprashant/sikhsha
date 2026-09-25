'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassButton } from '@/components/ui/glass-button'
import { GlassInput, GlassTextarea } from '@/components/ui/glass-input'
import {
    GlassSelect,
    GlassSelectContent,
    GlassSelectItem,
    GlassSelectTrigger,
    GlassSelectValue,
} from '@/components/ui/glass-select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import { Loader2, FileText, Sparkles, Check, BookOpen, Clock } from 'lucide-react'

export default function LessonPlanner() {
    const router = useRouter()
    const [generating, setGenerating] = useState(false)
    const { toast } = useToast()

    // Curriculum selection state
    const [curriculum, setCurriculum] = useState<string>('ICSE')
    const [selectedClass, setSelectedClass] = useState<string>('')
    const [selectedSubject, setSelectedSubject] = useState<string>('')
    const [selectedChapter, setSelectedChapter] = useState<string>('')
    const [additionalInstructions, setAdditionalInstructions] = useState<string>('')

    // Duration state - only class period duration (AI determines total time needed)
    const [classDuration, setClassDuration] = useState<number>(45)

    // Data from curriculum API
    const [subjects, setSubjects] = useState<string[]>([])
    const [chapters, setChapters] = useState<any[]>([])
    const [loadingSubjects, setLoadingSubjects] = useState(false)
    const [loadingChapters, setLoadingChapters] = useState(false)

    const classOptions = ['8', '9', '10', '11', '12']
    const classDurationOptions = [30, 35, 40, 45, 50, 55, 60]

    // Load subjects when class or curriculum changes
    useEffect(() => {
        if (selectedClass) {
            setLoadingSubjects(true)
            setSelectedSubject('')
            setSelectedChapter('')
            setChapters([])

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

    const handleGenerate = async () => {
        if (!selectedClass || !selectedSubject || !selectedChapter) {
            toast({
                title: 'Missing Selection',
                description: 'Please select class, subject, and chapter',
                variant: 'destructive',
            })
            return
        }

        setGenerating(true)

        try {
            // Get topics from selected chapter
            const selectedChapterData = chapters.find((c: any) => c.name === selectedChapter)
            const topics = selectedChapterData?.topics?.map((t: any) => t.name) || [selectedChapter]

            // AI will determine total duration based on chapter content
            const response = await api.post('/teacher/lesson-plan/generate', {
                topics,
                subject: selectedSubject,
                gradeLevel: selectedClass,
                board: curriculum,
                classDuration,
                additionalInstructions: additionalInstructions.trim() || undefined
            })

            // Store plan in session storage
            sessionStorage.setItem('currentLessonPlan', JSON.stringify(response.data))

            toast({
                title: 'Success!',
                description: `Generated ${response.data.totalSessions} session lesson plan for ${selectedChapter}`,
            })

            // Navigate to viewer
            router.push('/teacher/lesson-planner/view')
        } catch (err: any) {
            console.error('Lesson plan generation error:', err)
            const errorMessage = err.response?.data?.message || 'Failed to generate lesson plan. Please try again.'
            toast({
                title: 'Generation Failed',
                description: errorMessage,
                variant: 'destructive',
            })
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#E5E1DD] dark:bg-zinc-950 flex items-center justify-center p-8 font-inter">
            <div className="w-full max-w-3xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-zinc-900 rounded-2xl shadow-lg">
                            <FileText className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">
                        Multi-Session Lesson Planner
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Generate structured lesson plans with session breakdowns, activities, and assessments
                    </p>
                </div>

                {/* Progress Stepper */}
                <div className="flex justify-between items-center px-4">
                    {[
                        { label: 'Curriculum', completed: !!curriculum },
                        { label: 'Class', completed: !!selectedClass },
                        { label: 'Subject', completed: !!selectedSubject },
                        { label: 'Chapter', completed: !!selectedChapter },
                    ].map((step, idx, arr) => (
                        <div key={step.label} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step.completed
                                    ? 'bg-zinc-900 text-white'
                                    : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {step.completed ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-semibold">{idx + 1}</span>
                                    )}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${step.completed ? 'text-white' : 'text-gray-400'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < arr.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 ${step.completed ? 'bg-zinc-900' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Selection Cards */}
                <div className="space-y-4">
                    {/* Curriculum Selection */}
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg">Select Curriculum Board</CardTitle>
                            <CardDescription>Choose ICSE or CBSE. Defaults to ICSE.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GlassSelect value={curriculum} onValueChange={(v) => { setCurriculum(v); setSelectedClass(''); setSelectedSubject(''); setSelectedChapter('') }}>
                                <GlassSelectTrigger className="h-12">
                                    <GlassSelectValue placeholder="Select curriculum..." />
                                </GlassSelectTrigger>
                                <GlassSelectContent>
                                    <GlassSelectItem value="ICSE">ICSE / ISC</GlassSelectItem>
                                    <GlassSelectItem value="CBSE">CBSE</GlassSelectItem>
                                </GlassSelectContent>
                            </GlassSelect>
                        </CardContent>
                    </Card>

                    {/* Class Selection */}
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg">Select Class</CardTitle>
                            <CardDescription>Choose the grade level</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GlassSelect value={selectedClass} onValueChange={setSelectedClass} disabled={!curriculum}>
                                <GlassSelectTrigger className="h-12">
                                    <GlassSelectValue placeholder="Select class..." />
                                </GlassSelectTrigger>
                                <GlassSelectContent>
                                    {classOptions.map(cls => (
                                        <GlassSelectItem key={cls} value={cls}>
                                            Class {cls}
                                        </GlassSelectItem>
                                    ))}
                                </GlassSelectContent>
                            </GlassSelect>
                        </CardContent>
                    </Card>

                    {/* Subject Selection */}
                    <Card className={`shadow-md transition-all ${selectedClass ? 'hover:shadow-lg' : 'opacity-50'}`}>
                        <CardHeader>
                            <CardTitle className="text-lg">Select Subject</CardTitle>
                            <CardDescription>Choose the subject area</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GlassSelect
                                value={selectedSubject}
                                onValueChange={setSelectedSubject}
                                disabled={!selectedClass || loadingSubjects}
                            >
                                <GlassSelectTrigger className="h-12 font-medium">
                                    <GlassSelectValue placeholder={loadingSubjects ? "Loading..." : "Select subject..."} />
                                </GlassSelectTrigger>
                                <GlassSelectContent>
                                    {subjects.map(subject => (
                                        <GlassSelectItem key={subject} value={subject}>
                                            {subject}
                                        </GlassSelectItem>
                                    ))}
                                </GlassSelectContent>
                            </GlassSelect>
                        </CardContent>
                    </Card>

                    {/* Chapter Selection */}
                    <Card className={`shadow-md transition-all ${selectedSubject ? 'hover:shadow-lg' : 'opacity-50'}`}>
                        <CardHeader>
                            <CardTitle className="text-lg">Select Chapter</CardTitle>
                            <CardDescription>Choose the chapter to plan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GlassSelect
                                value={selectedChapter}
                                onValueChange={setSelectedChapter}
                                disabled={!selectedSubject || loadingChapters}
                            >
                                <GlassSelectTrigger className="h-12 font-medium">
                                    <GlassSelectValue placeholder={loadingChapters ? "Loading..." : "Select chapter..."} />
                                </GlassSelectTrigger>
                                <GlassSelectContent>
                                    {chapters.map((chapter: any) => (
                                        <GlassSelectItem key={chapter.name} value={chapter.name}>
                                            {chapter.name}
                                        </GlassSelectItem>
                                    ))}
                                </GlassSelectContent>
                            </GlassSelect>
                        </CardContent>
                    </Card>

                    {/* Duration Settings */}
                    <Card className={`shadow-md transition-all ${selectedChapter ? 'hover:shadow-lg' : 'opacity-50'}`}>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-white" />
                                Duration Settings
                            </CardTitle>
                            <CardDescription>Set how long each class period is (AI will determine sessions needed)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="classDuration">Class Period Duration</Label>
                                <GlassSelect
                                    value={classDuration.toString()}
                                    onValueChange={(val) => setClassDuration(parseInt(val))}
                                    disabled={!selectedChapter}
                                >
                                    <GlassSelectTrigger id="classDuration" className="h-12 font-medium">
                                        <GlassSelectValue />
                                    </GlassSelectTrigger>
                                    <GlassSelectContent>
                                        {classDurationOptions.map(duration => (
                                            <GlassSelectItem key={duration} value={duration.toString()}>
                                                {duration} minutes
                                            </GlassSelectItem>
                                        ))}
                                    </GlassSelectContent>
                                </GlassSelect>
                                <p className="text-xs text-gray-500 mt-2">
                                    The AI will automatically determine how many sessions are needed to cover the chapter content.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Instructions */}
                    <Card className={`shadow-md transition-all ${selectedChapter ? 'hover:shadow-lg' : 'opacity-50'}`}>
                        <CardHeader>
                            <CardTitle className="text-lg">Additional Instructions (Optional)</CardTitle>
                            <CardDescription>Add any specific instructions for the AI to follow</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GlassTextarea
                                placeholder="E.g., Focus on hands-on activities, include group work suggestions, emphasize formative assessment..."
                                value={additionalInstructions}
                                onChange={(e) => setAdditionalInstructions(e.target.value)}
                                disabled={!selectedChapter}
                                className="min-h-[120px] resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Generate Button */}
                <GlassButton
                    onClick={handleGenerate}
                    disabled={!selectedChapter || generating}
                    size="lg"
                    className="w-full"
                    contentClassName="w-full flex items-center justify-center gap-2 text-lg font-semibold"
                >
                    {generating ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Generating Curriculum Plan...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-6 w-6" />
                            Generate Lesson Plan
                        </>
                    )}
                </GlassButton>

                {selectedChapter && !generating && (
                    <div className="bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-center">
                        <p className="text-zinc-900 dark:text-white font-medium">
                            Ready to generate plan for: <span className="font-bold">{selectedChapter}</span>
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                            {selectedSubject} • Grade {selectedClass}
                        </p>
                    </div>
                )}

                {/* Info Box */}
                <div className="p-6 bg-white rounded-lg shadow-md border-2 border-zinc-200 dark:border-zinc-700">
                    <p className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        What you'll get:
                    </p>
                    <ul className="text-gray-700 space-y-2">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-zinc-100 dark:bg-zinc-8000 rounded-full"></span>
                            All chapters and topics breakdown
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-zinc-100 dark:bg-zinc-8000 rounded-full"></span>
                            Learning objectives per topic
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-zinc-100 dark:bg-zinc-8000 rounded-full"></span>
                            Estimated teaching time
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-zinc-100 dark:bg-zinc-8000 rounded-full"></span>
                            Key teaching points
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
