'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download, Key, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { QuestionDisplay } from '@/components/teacher/question-display'
import Link from 'next/link'

export default function QuestionViewerPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [questions, setQuestions] = useState<any>(null)
    const [generationParams, setGenerationParams] = useState<any>(null)
    const [includeAnswers, setIncludeAnswers] = useState(false)
    const [includeExplanations, setIncludeExplanations] = useState(false)

    useEffect(() => {
        // Load questions from sessionStorage
        const storedQuestions = sessionStorage.getItem('currentQuestions')
        const storedParams = sessionStorage.getItem('generationParams')

        if (storedQuestions) {
            try {
                setQuestions(JSON.parse(storedQuestions))
            } catch (error) {
                console.error('Failed to parse questions:', error)
                router.push('/teacher/question-generator')
            }
        } else {
            // No questions found, redirect back
            router.push('/teacher/question-generator')
        }

        if (storedParams) {
            try {
                setGenerationParams(JSON.parse(storedParams))
            } catch (error) {
                console.error('Failed to parse params:', error)
            }
        }
    }, [router])

    const handleDownloadPDF = async () => {
        if (!questions || !generationParams) {
            toast({
                title: 'Error',
                description: 'No questions or parameters available',
                variant: 'destructive'
            })
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/generate-mixed-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: generationParams.subject,
                    chapter: generationParams.chapter,
                    concepts: generationParams.concepts,
                    difficulty: generationParams.difficulty,
                    classLevel: generationParams.classLevel,
                    extraCommands: generationParams.extraCommands,
                    customTitle: generationParams.title,
                    provider: generationParams.provider,
                    questionTypes: generationParams.questionTypes,
                    enableVisuals: generationParams.enableVisuals,
                    visualStyle: generationParams.visualStyle,
                    includeAnswers,
                    includeExplanations
                })
            })

            if (!response.ok) throw new Error('PDF generation failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `questions_${Date.now()}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast({
                title: 'Success',
                description: 'PDF downloaded successfully!'
            })
        } catch (err: any) {
            toast({
                title: 'Error',
                description: 'Failed to generate PDF',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadAnswerKey = async () => {
        if (!questions || !generationParams) {
            toast({
                title: 'Error',
                description: 'No questions or parameters available',
                variant: 'destructive'
            })
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/generate-mixed-answer-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: generationParams.subject,
                    chapter: generationParams.chapter,
                    concepts: generationParams.concepts,
                    difficulty: generationParams.difficulty,
                    classLevel: generationParams.classLevel,
                    extraCommands: generationParams.extraCommands,
                    customTitle: generationParams.title,
                    provider: generationParams.provider,
                    questionTypes: generationParams.questionTypes,
                    enableVisuals: generationParams.enableVisuals,
                    visualStyle: generationParams.visualStyle
                })
            })

            if (!response.ok) throw new Error('Answer key generation failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `answer_key_${Date.now()}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast({
                title: 'Success',
                description: 'Answer key downloaded successfully!'
            })
        } catch (err: any) {
            toast({
                title: 'Error',
                description: 'Failed to generate answer key',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    if (!questions) {
        return null // Will redirect in useEffect
    }

    const questionList = questions.questions || questions

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/teacher/question-generator">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Generator
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-zinc-950 mt-4">Generated Questions</h1>
                        <p className="text-gray-600 mt-2">
                            {questionList?.length || 0} questions • {generationParams?.subject} • {generationParams?.chapter}
                        </p>
                        {generationParams?.enableVisuals && (
                            <p className="mt-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
                                Visual generation enabled
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Bar */}
                <Card>
                    <CardHeader>
                        <CardTitle>Download Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            {/* PDF Options */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="includeAnswers"
                                        checked={includeAnswers}
                                        onCheckedChange={(checked) => setIncludeAnswers(checked as boolean)}
                                    />
                                    <Label htmlFor="includeAnswers" className="cursor-pointer">
                                        Include Answers
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="includeExplanations"
                                        checked={includeExplanations}
                                        onCheckedChange={(checked) => setIncludeExplanations(checked as boolean)}
                                    />
                                    <Label htmlFor="includeExplanations" className="cursor-pointer">
                                        Include Explanations
                                    </Label>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleDownloadPDF}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download PDF
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleDownloadAnswerKey}
                                    disabled={loading}
                                    variant="outline"
                                >
                                    <Key className="h-4 w-4 mr-2" />
                                    Answer Key
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Questions Display */}
                <Card>
                    <CardHeader>
                        <CardTitle>Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <QuestionDisplay
                            questions={questionList}
                            showAnswers={true}
                        />
                    </CardContent>
                </Card>

                {/* Bottom Action */}
                <div className="flex justify-center pt-4">
                    <Link href="/teacher/question-generator">
                        <Button variant="outline" size="lg">
                            Generate More Questions
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
