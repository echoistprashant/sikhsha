'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import { Loader2, BookOpen, ArrowLeft, Calendar, CheckCircle2, Clock, Eye } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuthStore } from '@/stores/auth-store'
import ReactMarkdown from 'react-markdown'
import { Badge } from '@/components/ui/badge'

interface Doubt {
    id: string
    question: string
    subject: string
    solution: string
    status: 'pending' | 'resolved'
    created_at: string
    question_type: 'text' | 'image' | 'voice'
    related_concepts?: string[]
    student_grade?: string
}

export default function DoubtHistory() {
    const [doubts, setDoubts] = useState<Doubt[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [expandedDoubt, setExpandedDoubt] = useState<string | null>(null)
    const { toast } = useToast()
    const user = useAuthStore((state) => state.user)

    const limit = 10

    useEffect(() => {
        fetchDoubts()
    }, [page])

    const fetchDoubts = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.get(`/student/doubts?page=${page}&limit=${limit}`)
            setDoubts(response.data.doubts)
            setTotalCount(response.data.totalCount)
        } catch (err: any) {
            console.error('Error fetching doubt history:', err)
            const errorMessage = err.response?.data?.message || 'Failed to load doubt history'
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getSubjectColor = (subject: string) => {
        const colors: { [key: string]: string } = {
            mathematics: 'bg-blue-100 text-blue-800 border-blue-300',
            science: 'bg-green-100 text-green-800 border-green-300',
            physics: 'bg-purple-100 text-purple-800 border-purple-300',
            chemistry: 'bg-pink-100 text-pink-800 border-pink-300',
            biology: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            english: 'bg-orange-100 text-orange-800 border-orange-300',
            history: 'bg-amber-100 text-amber-800 border-amber-300',
            geography: 'bg-cyan-100 text-cyan-800 border-cyan-300',
            computer_science: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        }
        return colors[subject.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300'
    }

    const toggleExpand = (doubtId: string) => {
        setExpandedDoubt(expandedDoubt === doubtId ? null : doubtId)
    }

    const totalPages = Math.ceil(totalCount / limit)

    if (loading && page === 1) {
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
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    Doubt History
                </h1>
                <p className="text-muted-foreground text-lg">
                    Review all your previously asked questions and solutions.
                </p>
                {user?.grade_level && (
                    <p className="text-sm text-gray-600">
                        Grade: <span className="font-semibold">{user.grade_level}</span>
                    </p>
                )}
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {doubts.length === 0 && !error ? (
                <Card className="border-t-4 border-t-blue-500">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <BookOpen className="h-16 w-16 text-blue-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Doubts Yet
                        </h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            You haven't asked any questions yet. Start learning by asking your first doubt!
                        </p>
                        <Link href="/student/doubt-solver">
                            <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
                                Ask a Question
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {doubts.length} of {totalCount} doubts
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-sm">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {doubts.map((doubt) => (
                            <Card
                                key={doubt.id}
                                className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={`${getSubjectColor(doubt.subject)} border`}>
                                                    {doubt.subject.replace(/_/g, ' ')}
                                                </Badge>
                                                {doubt.status === 'resolved' && (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Resolved
                                                    </Badge>
                                                )}
                                                {doubt.student_grade && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Grade {doubt.student_grade}
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">
                                                {doubt.question}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(doubt.created_at)}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleExpand(doubt.id)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            {expandedDoubt === doubt.id ? 'Hide' : 'View'}
                                        </Button>
                                    </div>
                                </CardHeader>

                                {expandedDoubt === doubt.id && (
                                    <CardContent className="pt-0 border-t">
                                        <div className="mt-4 p-4 bg-green-50/50 rounded-lg border border-green-200">
                                            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Solution
                                            </h4>
                                            <div className="prose prose-sm max-w-none text-gray-700">
                                                <ReactMarkdown>{doubt.solution}</ReactMarkdown>
                                            </div>
                                        </div>

                                        {doubt.related_concepts && doubt.related_concepts.length > 0 && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h4 className="font-semibold text-blue-900 mb-2">Related Concepts</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {doubt.related_concepts.map((concept, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-white border border-blue-300 rounded-full text-sm text-blue-700"
                                                        >
                                                            {concept}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 flex items-center text-sm">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
