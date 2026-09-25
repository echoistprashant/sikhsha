'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import { Loader2, HelpCircle, AlertCircle, CheckCircle2, BookOpen, Send, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'

const doubtSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    question: z.string().min(10, 'Question must be at least 10 characters').max(1000, 'Question is too long'),
})

type DoubtFormData = z.infer<typeof doubtSchema>

interface DoubtResponse {
    answer: string
    relatedConcepts: string[]
    confidence: number
}

export default function DoubtSolver() {
    const [solving, setSolving] = useState(false)
    const [solution, setSolution] = useState<DoubtResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const user = useAuthStore((state) => state.user)

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DoubtFormData>({
        resolver: zodResolver(doubtSchema),
    })

    const onSubmit = async (data: DoubtFormData) => {
        setSolving(true)
        setError(null)
        setSolution(null)

        try {
            const response = await api.post('/student/doubt/text', data)
            setSolution(response.data)
            toast({
                title: 'Doubt Solved!',
                description: 'Here is the explanation for your question.',
                variant: 'default',
            })
        } catch (err: any) {
            console.error('Doubt solving error:', err)
            const errorMessage = err.response?.data?.message || 'Failed to solve doubt. Please try again.'
            setError(errorMessage)
            toast({
                title: 'Solving Failed',
                description: errorMessage,
                variant: 'destructive',
            })
        } finally {
            setSolving(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8 space-y-2">
                <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-zinc-100">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl shadow-sm">
                        <HelpCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Instant Doubt Solver
                </h1>
                <p className="text-slate-600 dark:text-zinc-400 text-lg">
                    Get instant, AI-powered explanations for your academic questions.
                </p>
                {user?.grade_level && (
                    <p className="text-sm text-slate-600 dark:text-zinc-400">
                        Grade: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{user.grade_level}</span>
                    </p>
                )}
            </div>

            <div className="grid md:grid-cols-1 gap-8">
                <Card className="border-t-4 border-t-emerald-500 shadow-xl dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-zinc-100">Ask a Question</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-zinc-400">
                            Select a subject and type your question below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="subject" className="font-semibold text-slate-800 dark:text-zinc-200">Subject <span className="text-red-500">*</span></Label>
                                <Select
                                    onValueChange={(value) => setValue('subject', value)}
                                    disabled={solving}
                                >
                                    <SelectTrigger className={`!bg-white dark:!bg-zinc-800 !text-slate-900 dark:!text-zinc-100 border border-slate-300 dark:border-zinc-700 h-11 ${errors.subject ? 'border-red-500' : ''}`}>
                                        <SelectValue placeholder="Select subject..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="physics">Physics</SelectItem>
                                        <SelectItem value="chemistry">Chemistry</SelectItem>
                                        <SelectItem value="biology">Biology</SelectItem>
                                        <SelectItem value="mathematics">Mathematics</SelectItem>
                                        <SelectItem value="science">Science (K-10)</SelectItem>
                                        <SelectItem value="hindi">Hindi</SelectItem>
                                        <SelectItem value="english">English</SelectItem>
                                        <SelectItem value="computer_science">Computer Science</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.subject && (
                                    <p className="text-sm text-red-500">{errors.subject.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="question" className="font-semibold text-slate-800 dark:text-zinc-200">Your Question <span className="text-red-500">*</span></Label>
                                <Textarea
                                    id="question"
                                    placeholder="Type your question here... (e.g., Explain the process of photosynthesis)"
                                    className={`min-h-[130px] !bg-white dark:!bg-zinc-800 !text-slate-900 dark:!text-zinc-100 placeholder:!text-slate-500 dark:placeholder:!text-zinc-400 border border-slate-300 dark:border-zinc-700 text-base ${errors.question ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-emerald-500'}`}
                                    {...register('question')}
                                    disabled={solving}
                                />
                                {errors.question && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> {errors.question.message}
                                    </p>
                                )}
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={solving}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base h-12 shadow-lg transition-all"
                                size="lg"
                            >
                                {solving ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing Question...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-5 w-5" />
                                        Solve Doubt
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {solution && (
                    <Card className="border-t-4 border-t-green-600 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="bg-green-50/50 pb-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl text-green-900">Explanation</CardTitle>
                                    <CardDescription className="mt-1 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        AI Generated Answer
                                    </CardDescription>
                                </div>
                                <div className="bg-white p-2 rounded-full shadow-sm">
                                    <BookOpen className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="prose prose-slate max-w-none">
                                <ReactMarkdown>{solution.answer}</ReactMarkdown>
                            </div>

                            {solution.relatedConcepts && solution.relatedConcepts.length > 0 && (
                                <div className="bg-slate-50 p-4 rounded-lg border mt-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Related Concepts</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {solution.relatedConcepts.map((concept, i) => (
                                            <span key={i} className="px-3 py-1 bg-white border rounded-full text-sm text-slate-600 shadow-sm">
                                                {concept}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-6 bg-slate-50 border-t flex gap-3 justify-end">
                            <Button variant="outline">Ask Follow-up</Button>
                            <Button className="bg-green-600 hover:bg-green-700">Save to History</Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    )
}
