'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api-client'
import { ArrowLeft, Loader2, ClipboardList, CheckCircle, XCircle, HelpCircle } from 'lucide-react'

interface Question {
    id: string
    question: string
    type: string
    options?: string[]
    correct_answer: string
    explanation: string
    difficulty_score?: number
}

interface QuestionSet {
    id: string
    title: string
    subject: string
    chapter: string
    class_level: string
    difficulty: string
    questions: Question[]
    created_at: string
}

export default function ViewQuestionsPage() {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null)
    const [showAnswers, setShowAnswers] = useState(false)

    useEffect(() => {
        if (id) fetchQuestions()
    }, [id])

    const fetchQuestions = async () => {
        try {
            const response = await api.get(`/teacher/question-set/${id}`)
            setQuestionSet(response.data)
        } catch (err) {
            console.error('Failed to fetch questions:', err)
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
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        )
    }

    if (!questionSet) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p className="text-gray-500">Question set not found</p>
                <Link href="/teacher/my-content">
                    <Button variant="outline" className="mt-4">Back to My Content</Button>
                </Link>
            </div>
        )
    }

    const questions = parseJson(questionSet.questions)

    const getDifficultyColor = (score?: number) => {
        if (!score) return 'bg-gray-100 text-gray-600'
        if (score <= 2) return 'bg-green-100 text-green-700'
        if (score <= 3) return 'bg-yellow-100 text-yellow-700'
        return 'bg-red-100 text-red-700'
    }

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'multiple-choice': 'MCQ',
            'short-answer': 'Short',
            'long-answer': 'Long',
            'true-false': 'T/F',
            'fill-in-the-blank': 'Fill',
        }
        return labels[type] || type
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Link href="/teacher/my-content">
                <Button variant="outline" size="sm" className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Content
                </Button>
            </Link>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <ClipboardList className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{questionSet.title || 'Question Set'}</h1>
                        <p className="text-gray-500">
                            {questionSet.subject} • Class {questionSet.class_level} • {questionSet.chapter}
                        </p>
                    </div>
                </div>
                <Button
                    variant={showAnswers ? "default" : "outline"}
                    onClick={() => setShowAnswers(!showAnswers)}
                >
                    {showAnswers ? 'Hide Answers' : 'Show Answers'}
                </Button>
            </div>

            <div className="space-y-4">
                {questions.map((q: Question, i: number) => (
                    <Card key={q.id || i}>
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                                        {i + 1}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                        {getTypeLabel(q.type)}
                                    </span>
                                    {q.difficulty_score && (
                                        <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(q.difficulty_score)}`}>
                                            Difficulty: {q.difficulty_score}/5
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium mb-3">{q.question}</p>

                            {/* Options for MCQ */}
                            {q.options && q.options.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    {q.options.map((opt: string, optIdx: number) => (
                                        <div
                                            key={optIdx}
                                            className={`p-2 rounded border ${showAnswers && q.correct_answer?.includes(opt.charAt(0))
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200'
                                                }`}
                                        >
                                            {opt}
                                            {showAnswers && q.correct_answer?.includes(opt.charAt(0)) && (
                                                <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Answer */}
                            {showAnswers && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="font-medium text-green-800 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Answer: {q.correct_answer}
                                    </p>
                                    {q.explanation && (
                                        <p className="text-sm text-green-700 mt-2">
                                            <strong>Explanation:</strong> {q.explanation}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {questions.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No questions in this set</p>
                </div>
            )}
        </div>
    )
}
