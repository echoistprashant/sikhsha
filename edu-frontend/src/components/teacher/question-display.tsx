'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Lightbulb, ImageIcon } from 'lucide-react'
import { useState } from 'react'

interface Question {
    id?: string
    question: string
    type: string
    answer?: string
    correct_answer?: string
    explanation?: string
    options?: string[]
    difficulty_score?: number
    imageUrl?: string
    imageMetadata?: {
        title?: string
        caption?: string
        alt?: string
        kind?: string
        vector?: boolean
    }
    visual?: {
        title?: string
        caption?: string
        alt?: string
        imageUrl?: string
        svg?: string
        kind?: string
    }
    visualContent?: {
        imageUrl?: string
        description?: string
        type?: string
    }
    metadata?: {
        topic?: string
        subtopic?: string
        common_mistakes?: string[]
        hints?: string[]
        prerequisite_knowledge?: string[]
    }
}

interface QuestionDisplayProps {
    questions: Question[]
    showAnswers?: boolean
}

export function QuestionDisplay({ questions, showAnswers = true }: QuestionDisplayProps) {
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
    const [showAllAnswers, setShowAllAnswers] = useState(showAnswers)

    const toggleQuestion = (index: number) => {
        setExpandedQuestions(prev => {
            const next = new Set(prev)
            if (next.has(index)) {
                next.delete(index)
            } else {
                next.add(index)
            }
            return next
        })
    }

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'multiple-choice': 'bg-blue-100 text-blue-700',
            'short-answer': 'bg-green-100 text-green-700',
            'long-answer': 'bg-purple-100 text-purple-700',
            'true-false': 'bg-yellow-100 text-yellow-700',
            'fill-in-the-blank': 'bg-orange-100 text-orange-700',
            'reasoning-based': 'bg-pink-100 text-pink-700',
            'application-based': 'bg-teal-100 text-teal-700',
            'analytical': 'bg-indigo-100 text-indigo-700',
            'case-study': 'bg-rose-100 text-rose-700',
            'problem-solving': 'bg-cyan-100 text-cyan-700',
        }
        return colors[type] || 'bg-gray-100 text-gray-700'
    }

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'multiple-choice': 'MCQ',
            'short-answer': 'Short Answer',
            'long-answer': 'Long Answer',
            'true-false': 'True/False',
            'fill-in-the-blank': 'Fill in Blank',
            'reasoning-based': 'Reasoning',
            'application-based': 'Application',
            'analytical': 'Analytical',
            'case-study': 'Case Study',
            'problem-solving': 'Problem Solving',
        }
        return labels[type] || type
    }

    const getDifficultyColor = (score?: number) => {
        if (!score) return ''
        if (score <= 2) return 'bg-green-500'
        if (score <= 3) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const getAnswer = (q: Question) => {
        const answer = q.answer ?? q.correct_answer
        return Array.isArray(answer) ? answer.join(', ') : answer
    }

    const getVisual = (q: Question) => {
        const imageUrl = q.visual?.imageUrl || q.visualContent?.imageUrl || q.imageUrl
        const svg = q.visual?.svg
        if (!imageUrl && !svg) return null

        return {
            src: imageUrl || `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg || '')}`,
            title: q.visual?.title || q.imageMetadata?.title || 'Question visual',
            caption: q.visual?.caption || q.imageMetadata?.caption || q.visualContent?.description || q.imageMetadata?.alt,
            kind: q.visual?.kind || q.imageMetadata?.kind || q.visualContent?.type,
            vector: q.imageMetadata?.vector || (imageUrl || '').startsWith('data:image/svg+xml') || Boolean(svg)
        }
    }

    if (!questions || questions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No questions generated yet
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {questions.length} question{questions.length !== 1 ? 's' : ''} generated
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllAnswers(!showAllAnswers)}
                >
                    {showAllAnswers ? 'Hide All Answers' : 'Show All Answers'}
                </Button>
            </div>

            {/* Question Cards */}
            {questions.map((q, index) => {
                const visual = getVisual(q)
                const answer = getAnswer(q)

                return (
                <Card key={index} className="overflow-hidden border-zinc-200 shadow-sm">
                    <CardContent className="p-0">
                        {/* Question Header */}
                        <div
                            className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleQuestion(index)}
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex-shrink-0">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Badge className={getTypeColor(q.type)}>
                                        {getTypeLabel(q.type)}
                                    </Badge>
                                    {q.difficulty_score && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(q.difficulty_score)}`} />
                                            Difficulty: {q.difficulty_score}/5
                                        </div>
                                    )}
                                    {q.metadata?.topic && (
                                        <span className="text-xs text-gray-400">{q.metadata.topic}</span>
                                    )}
                                    {visual && (
                                        <Badge className="bg-zinc-900 text-white">
                                            <ImageIcon className="h-3 w-3 mr-1" />
                                            {visual.vector ? 'SVG visual' : 'Visual'}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-gray-800 whitespace-pre-wrap">{q.question}</p>

                                {visual && (
                                    <figure className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <figcaption className="text-sm font-semibold text-zinc-900">
                                                {visual.title}
                                            </figcaption>
                                            {visual.kind && (
                                                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
                                                    {visual.kind.replace('-', ' ')}
                                                </span>
                                            )}
                                        </div>
                                        <img
                                            src={visual.src}
                                            alt={visual.caption || visual.title}
                                            className="mx-auto max-h-[320px] w-full rounded-md object-contain"
                                        />
                                        {visual.caption && (
                                            <p className="mt-2 text-xs text-zinc-500">{visual.caption}</p>
                                        )}
                                    </figure>
                                )}

                                {/* Options for MCQ */}
                                {q.options && q.options.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {q.options.map((opt, optIdx) => {
                                            const isCorrect = showAllAnswers && answer?.includes(opt.charAt(0))
                                            return (
                                                <div
                                                    key={optIdx}
                                                    className={`p-2 rounded border text-sm ${isCorrect
                                                            ? 'border-green-500 bg-green-50 text-green-800'
                                                            : 'border-gray-200 text-gray-700'
                                                        }`}
                                                >
                                                    {opt}
                                                    {isCorrect && <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0 text-gray-400">
                                {expandedQuestions.has(index) ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </div>
                        </div>

                        {/* Expanded Content - Answer & Explanation */}
                        {(expandedQuestions.has(index) || showAllAnswers) && (
                            <div className="border-t px-4 py-3 bg-gray-50 space-y-3">
                                {/* Answer */}
                                {answer && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                                            <CheckCircle className="h-4 w-4" />
                                            Answer
                                        </div>
                                        <p className="text-green-700 whitespace-pre-wrap">{answer}</p>
                                    </div>
                                )}

                                {/* Explanation */}
                                {q.explanation && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                                            <Lightbulb className="h-4 w-4" />
                                            Explanation
                                        </div>
                                        <p className="text-blue-700 whitespace-pre-wrap text-sm">{q.explanation}</p>
                                    </div>
                                )}

                                {/* Hints */}
                                {q.metadata?.hints && q.metadata.hints.length > 0 && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="text-yellow-800 font-medium mb-1">Hints</div>
                                        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                                            {q.metadata.hints.map((hint, i) => (
                                                <li key={i}>{hint}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Common Mistakes */}
                                {q.metadata?.common_mistakes && q.metadata.common_mistakes.length > 0 && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                                            <XCircle className="h-4 w-4" />
                                            Common Mistakes to Avoid
                                        </div>
                                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                            {q.metadata.common_mistakes.map((mistake, i) => (
                                                <li key={i}>{mistake}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
                )
            })}
        </div>
    )
}
