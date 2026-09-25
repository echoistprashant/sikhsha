'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api-client'
import { ArrowLeft, Loader2, FileText, Target, Clock, BookOpen, CheckCircle } from 'lucide-react'

interface LessonPlan {
    id: string
    title: string
    subject: string
    grade_level: string
    total_duration: number
    objectives: string[]
    concepts: any[]
    sequence: any[]
    assessments: string[]
    resources: string[]
    created_at: string
}

export default function ViewLessonPlanPage() {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [plan, setPlan] = useState<LessonPlan | null>(null)

    useEffect(() => {
        if (id) fetchPlan()
    }, [id])

    const fetchPlan = async () => {
        try {
            const response = await api.get(`/teacher/lesson-plan/${id}`)
            setPlan(response.data)
        } catch (err) {
            console.error('Failed to fetch lesson plan:', err)
        } finally {
            setLoading(false)
        }
    }

    const parseJson = (data: any) => {
        if (typeof data === 'string') {
            try { return JSON.parse(data) } catch { return [] }
        }
        return data || []
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (!plan) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p className="text-gray-500">Lesson plan not found</p>
                <Link href="/teacher/my-content">
                    <Button variant="outline" className="mt-4">Back to My Content</Button>
                </Link>
            </div>
        )
    }

    const objectives = parseJson(plan.objectives)
    const sequence = parseJson(plan.sequence)
    const assessments = parseJson(plan.assessments)
    const resources = parseJson(plan.resources)

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Link href="/teacher/my-content">
                <Button variant="outline" size="sm" className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Content
                </Button>
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{plan.title}</h1>
                    <p className="text-gray-500">
                        {plan.subject} • Class {plan.grade_level} • {plan.total_duration} mins
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Objectives */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-600" />
                            Learning Objectives
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {objectives.map((obj: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{obj}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Sequence */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Lesson Sequence
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sequence.map((step: any, i: number) => (
                                <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{step.activity}</h4>
                                            <span className="text-sm text-gray-500">{step.duration} min</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{step.method}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Assessments */}
                {assessments.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-purple-600" />
                                Assessments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-1">
                                {assessments.map((a: string, i: number) => (
                                    <li key={i} className="text-gray-700">{a}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Resources */}
                {resources.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Resources Needed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {resources.map((r: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                        {r}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
