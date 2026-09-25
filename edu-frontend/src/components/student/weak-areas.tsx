'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import { Loader2, TrendingDown, BookOpen, ArrowLeft, BarChart3, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/auth-store'

interface WeakArea {
    subject: string
    frequency: number
}

export default function WeakAreas() {
    const [weakAreas, setWeakAreas] = useState<WeakArea[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const user = useAuthStore((state) => state.user)

    useEffect(() => {
        fetchWeakAreas()
    }, [])

    const fetchWeakAreas = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.get('/student/weak-areas')
            setWeakAreas(response.data)
        } catch (err: any) {
            console.error('Error fetching weak areas:', err)
            const errorMessage = err.response?.data?.message || 'Failed to load weak areas'
            setError(errorMessage)
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const getSubjectColor = (index: number) => {
        const colors = [
            'bg-red-100 border-red-500 text-red-900',
            'bg-orange-100 border-orange-500 text-orange-900',
            'bg-yellow-100 border-yellow-500 text-yellow-900',
            'bg-blue-100 border-blue-500 text-blue-900',
            'bg-purple-100 border-purple-500 text-purple-900',
        ]
        return colors[index % colors.length]
    }

    const getIntensityPercentage = (frequency: number, maxFrequency: number) => {
        return maxFrequency > 0 ? (frequency / maxFrequency) * 100 : 0
    }

    const maxFrequency = weakAreas.length > 0 ? Math.max(...weakAreas.map(wa => wa.frequency)) : 1

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-5xl">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8 space-y-2">
                <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                    Weak Areas Analysis
                </h1>
                <p className="text-muted-foreground text-lg">
                    Identify subjects where you need more practice based on your doubt history.
                </p>
                {user?.grade_level && (
                    <p className="text-sm text-gray-600">
                        Grade: <span className="font-semibold">{user.grade_level}</span>
                    </p>
                )}
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {weakAreas.length === 0 && !error ? (
                <Card className="border-t-4 border-t-green-500">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <BookOpen className="h-16 w-16 text-green-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Great Job! No Weak Areas Yet
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            You haven't asked many doubts yet, or you're doing really well! Keep learning and asking questions.
                        </p>
                        <Link href="/student/doubt-solver">
                            <Button className="mt-6 bg-purple-600 hover:bg-purple-700">
                                Ask a Question
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">How to Use This</h4>
                                <p className="text-sm text-blue-800">
                                    Subjects are ranked by the number of doubts you've asked. Focus your study time on the top subjects to improve your understanding.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {weakAreas.map((area, index) => {
                            const intensity = getIntensityPercentage(area.frequency, maxFrequency)

                            return (
                                <Card
                                    key={area.subject}
                                    className={`border-l-4 ${getSubjectColor(index)} transition-all hover:shadow-lg`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2">
                                                        <span className="text-lg font-bold">#{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold capitalize">
                                                            {area.subject.replace(/_/g, ' ')}
                                                        </h3>
                                                        <p className="text-sm opacity-80">
                                                            {area.frequency} {area.frequency === 1 ? 'doubt' : 'doubts'} asked
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="w-full bg-white/50 rounded-full h-3 mb-2">
                                                    <div
                                                        className="bg-current h-3 rounded-full transition-all duration-500"
                                                        style={{ width: `${intensity}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs opacity-70">
                                                    {intensity.toFixed(0)}% of your total doubts
                                                </p>
                                            </div>

                                            <div className="ml-6">
                                                <TrendingDown className="h-12 w-12 opacity-30" />
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-current/20">
                                            <div className="flex gap-2">
                                                <Link href={`/student/doubt-solver?subject=${area.subject}`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        Ask New Question
                                                    </Button>
                                                </Link>
                                                <Link href="/student/doubt-solver" className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        View History
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {weakAreas.length > 0 && (
                        <Card className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                            <CardHeader>
                                <CardTitle className="text-purple-900">Study Recommendations</CardTitle>
                                <CardDescription className="text-purple-700">
                                    Tips to improve your weak areas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-purple-900">
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-600 font-bold">•</span>
                                        <span>Focus on the top 2-3 subjects where you have the most doubts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-600 font-bold">•</span>
                                        <span>Review the concepts you struggled with and practice similar problems</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-600 font-bold">•</span>
                                        <span>Ask follow-up questions when you need more clarification</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-purple-600 font-bold">•</span>
                                        <span>Schedule regular study sessions for your weak subjects</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
