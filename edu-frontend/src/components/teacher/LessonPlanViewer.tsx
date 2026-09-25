'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassButton } from '@/components/ui/glass-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, ChevronDown, ChevronRight, Clock, BookOpen, Target, List, Download, Printer, Play, Users, Lightbulb, CheckCircle, AlertCircle, GraduationCap, Layers } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { normalizeLessonPlan, type LessonPlan } from './lesson-plan-normalizer'

export default function LessonPlanViewer() {
    const router = useRouter()
    const { toast } = useToast()
    const [plan, setPlan] = useState<LessonPlan | null>(null)
    const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Load plan from session storage
        const storedPlan = sessionStorage.getItem('currentLessonPlan')
        if (storedPlan) {
            try {
                const parsedPlan = JSON.parse(storedPlan)
                const normalizedPlan = normalizeLessonPlan(parsedPlan)
                if (!normalizedPlan || !Array.isArray(normalizedPlan.sessions)) {
                    throw new Error('Invalid lesson plan shape')
                }
                setPlan(normalizedPlan)
                // Auto-expand first session
                setExpandedSessions(
                    normalizedPlan.sessions.length > 0
                        ? new Set([normalizedPlan.sessions[0].sessionNumber])
                        : new Set()
                )
                setLoading(false)
            } catch (error) {
                console.error('Failed to parse lesson plan:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to load lesson plan. Redirecting to planner.',
                    variant: 'destructive',
                })
                setTimeout(() => router.push('/teacher/lesson-planner'), 2000)
            }
        } else {
            toast({
                title: 'No Plan Found',
                description: 'Redirecting to planner.',
                variant: 'destructive',
            })
            setTimeout(() => router.push('/teacher/lesson-planner'), 2000)
        }
    }, [router, toast])

    const toggleSession = (sessionNum: number) => {
        setExpandedSessions(prev => {
            const next = new Set(prev)
            if (next.has(sessionNum)) {
                next.delete(sessionNum)
            } else {
                next.add(sessionNum)
            }
            return next
        })
    }

    const expandAll = () => {
        if (plan) {
            setExpandedSessions(new Set(plan.sessions.map(s => s.sessionNumber)))
        }
    }

    const collapseAll = () => {
        setExpandedSessions(new Set())
    }

    const handlePrint = () => {
        window.print()
    }

    const getMethodColor = (method: string) => {
        switch (method.toLowerCase()) {
            case 'i do':
                return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'we do':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'you do':
                return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'discussion':
                return 'bg-amber-100 text-amber-700 border-amber-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    if (loading || !plan) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading lesson plan...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br bg-zinc-100 dark:bg-zinc-950">
            {/* Top Bar */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-10 print:hidden">
                <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
                    <GlassButton
                        size="sm"
                        onClick={() => router.push('/teacher/lesson-planner')}
                        contentClassName="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Planner
                    </GlassButton>

                    <div className="text-center flex-1">
                        <h2 className="text-xl font-bold text-gray-900">{plan.title}</h2>
                        <p className="text-sm text-gray-500">
                            {plan.totalSessions} sessions • {Math.round(plan.totalDuration / 60)} hours total
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <GlassButton size="sm" onClick={handlePrint} contentClassName="flex items-center gap-2">
                            <Printer className="h-4 w-4" />
                            Print
                        </GlassButton>
                        <GlassButton size="sm" contentClassName="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Save
                        </GlassButton>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-8">
                {/* Overview Card */}
                <Card className="mb-6 border-t-4 border-t-zinc-900 dark:border-t-zinc-700 shadow-lg">
                    <CardHeader className="bg-zinc-100 dark:bg-zinc-800/50">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl text-zinc-900 dark:text-white">Lesson Overview</CardTitle>
                                <CardDescription className="mt-2 flex items-center gap-4 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        {plan.totalSessions} sessions
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                        {plan.totalDuration} minutes total
                                    </span>
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <GlassButton size="sm" onClick={expandAll}>
                                    Expand All
                                </GlassButton>
                                <GlassButton size="sm" onClick={collapseAll}>
                                    Collapse All
                                </GlassButton>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Master Objectives */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                Learning Objectives
                            </h4>
                            <ul className="grid gap-2">
                                {plan.objectives.map((obj, i) => (
                                    <li key={i} className="flex items-start gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{obj}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Prerequisites */}
                        {plan.prerequisites && plan.prerequisites.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    Prerequisites
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {plan.prerequisites.map((prereq, i) => (
                                        <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm">
                                            {prereq}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Key Concepts */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-600" />
                                Key Concepts
                            </h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {plan.concepts.map((concept) => (
                                    <div key={concept.id} className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                                        <h5 className="font-semibold text-gray-900">{concept.name}</h5>
                                        <p className="text-sm text-gray-600 mt-1">{concept.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sessions */}
                <div className="space-y-4">
                    {plan.sessions.map((session) => (
                        <Card key={session.sessionNumber} className="shadow-md hover:shadow-lg transition-shadow print:break-inside-avoid">
                            {/* Session Header */}
                            <button
                                onClick={() => toggleSession(session.sessionNumber)}
                                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {expandedSessions.has(session.sessionNumber) ? (
                                        <ChevronDown className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <ChevronRight className="h-6 w-6 text-gray-400" />
                                    )}
                                    <span className="w-12 h-12 bg-zinc-200 dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-lg">
                                        {session.sessionNumber}
                                    </span>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-lg text-gray-900">{session.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {session.duration} minutes • {session.activities.length} activities
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full">
                                    <Clock className="h-4 w-4 inline mr-1" />
                                    {session.duration} min
                                </span>
                            </button>

                            {/* Session Content (Expandable) */}
                            {expandedSessions.has(session.sessionNumber) && (
                                <CardContent className="pl-24 pr-6 pb-6 space-y-6 bg-slate-50/50">
                                    {/* Session Objectives */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                            <Target className="h-4 w-4" />
                                            Session Objectives
                                        </h4>
                                        <ul className="space-y-1">
                                            {session.objectives.map((obj, i) => (
                                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className="mt-1.5 w-1.5 h-1.5 bg-zinc-100 dark:bg-zinc-8000 rounded-full flex-shrink-0" />
                                                    {obj}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Introduction/Hook */}
                                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Play className="h-4 w-4 text-blue-600" />
                                                Introduction & Hook
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <span className="text-xs font-semibold text-blue-600 uppercase">Opening Hook</span>
                                                <p className="text-sm text-gray-700">{session.introduction.hook}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-blue-600 uppercase">Activate Prior Knowledge</span>
                                                <p className="text-sm text-gray-700">{session.introduction.priorKnowledge}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-blue-600 uppercase">Today's Agenda</span>
                                                <p className="text-sm text-gray-700">{session.introduction.agendaShare}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Activities Timeline */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            Learning Activities
                                        </h4>
                                        <div className="space-y-3">
                                            {session.activities.map((activity) => (
                                                <Card key={activity.order} className="bg-white shadow-sm">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                                                                    {activity.order}
                                                                </span>
                                                                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getMethodColor(activity.method)}`}>
                                                                    {activity.method}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-500">
                                                                {activity.duration} min
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mb-2">{activity.activity}</p>
                                                        {activity.resources.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {activity.resources.map((resource, i) => (
                                                                    <span key={i} className="text-xs bg-slate-100 text-gray-600 px-2 py-0.5 rounded">
                                                                        {resource}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {activity.notes && (
                                                            <p className="text-xs text-gray-500 italic mt-2">
                                                                💡 {activity.notes}
                                                            </p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Checks for Understanding */}
                                    {session.checkForUnderstanding && session.checkForUnderstanding.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                Checks for Understanding
                                            </h4>
                                            <div className="space-y-2">
                                                {session.checkForUnderstanding.map((check, i) => (
                                                    <div key={i} className="p-3 bg-green-50 border border-green-100 rounded-lg">
                                                        <span className="text-xs font-semibold text-green-700 uppercase">{check.type}</span>
                                                        <p className="text-sm text-gray-700 mt-1">{check.prompt}</p>
                                                        {check.expectedResponse && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Expected: {check.expectedResponse}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Closure */}
                                    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-l-purple-500">
                                        <CardContent className="p-4">
                                            <h4 className="text-sm font-semibold text-purple-700 uppercase mb-2 flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4" />
                                                Closure
                                            </h4>
                                            <p className="text-sm text-gray-700">{session.closure}</p>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Assessment & Differentiation */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    {/* Assessment Plan */}
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Assessment Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h5 className="text-sm font-semibold text-gray-500 uppercase mb-2">Formative (Ongoing)</h5>
                                <ul className="space-y-2">
                                    {plan.assessments.formative.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-sm font-semibold text-gray-500 uppercase mb-2">Summative (End)</h5>
                                <p className="text-sm text-gray-700 p-3 bg-green-50 rounded-lg border border-green-100">
                                    {plan.assessments.summative}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Differentiation */}
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                Differentiation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h5 className="text-sm font-semibold text-blue-600 uppercase mb-2">Support (Struggling Learners)</h5>
                                <ul className="space-y-1">
                                    {plan.differentiation.support.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-sm font-semibold text-purple-600 uppercase mb-2">Extension (Advanced Learners)</h5>
                                <ul className="space-y-1">
                                    {plan.differentiation.extension.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {plan.differentiation.accommodations && plan.differentiation.accommodations.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-semibold text-amber-600 uppercase mb-2">Accommodations (IEP/ELL)</h5>
                                    <ul className="space-y-1">
                                        {plan.differentiation.accommodations.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Resources */}
                <Card className="shadow-md mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <List className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            Resources & Materials
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {plan.resources.map((resource, i) => (
                                <span key={i} className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm">
                                    {resource}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
