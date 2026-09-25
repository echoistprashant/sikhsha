'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api-client'
import { ArrowLeft, Loader2, BookOpen, Clock, Package, Target, CheckCircle } from 'lucide-react'

interface Activity {
    id: string
    title: string
    subject: string
    grade_level: string
    duration: number
    activity_type: string
    materials: string[]
    steps: string[]
    learning_outcomes: string[]
    created_at: string
}

export default function ViewActivityPage() {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [activity, setActivity] = useState<Activity | null>(null)

    useEffect(() => {
        if (id) fetchActivity()
    }, [id])

    const fetchActivity = async () => {
        try {
            const response = await api.get(`/teacher/activity/${id}`)
            setActivity(response.data)
        } catch (err) {
            console.error('Failed to fetch activity:', err)
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
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        )
    }

    if (!activity) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p className="text-gray-500">Activity not found</p>
                <Link href="/teacher/my-content">
                    <Button variant="outline" className="mt-4">Back to My Content</Button>
                </Link>
            </div>
        )
    }

    const materials = parseJson(activity.materials)
    const steps = parseJson(activity.steps)
    const outcomes = parseJson(activity.learning_outcomes)

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Link href="/teacher/my-content">
                <Button variant="outline" size="sm" className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Content
                </Button>
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{activity.title}</h1>
                    <p className="text-gray-500">
                        {activity.subject} • Class {activity.grade_level} • {activity.duration} mins • {activity.activity_type}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Materials */}
                {materials.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-orange-600" />
                                Materials Needed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {materials.map((m: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Steps */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Activity Steps
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-3">
                            {steps.map((step: string, i: number) => (
                                <li key={i} className="flex gap-3">
                                    <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="pt-0.5">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>

                {/* Learning Outcomes */}
                {outcomes.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-600" />
                                Learning Outcomes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {outcomes.map((outcome: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{outcome}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
