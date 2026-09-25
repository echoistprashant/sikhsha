'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Loader2, BookOpen, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'

const topicSchema = z.object({
    topic: z.string().min(3, 'Topic must be at least 3 characters').max(100, 'Topic must be less than 100 characters'),
    subject: z.string().min(1, 'Subject is required'),
    gradeLevel: z.string().min(1, 'Grade level is required'),
    classDuration: z.number().min(20, 'Minimum 20 minutes').max(90, 'Maximum 90 minutes').default(40),
})

type TopicFormData = z.infer<typeof topicSchema>

export default function TopicGenerator() {
    const router = useRouter()
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TopicFormData>({
        resolver: zodResolver(topicSchema),
        defaultValues: {
            classDuration: 40,
        },
    })

    const onSubmit = async (data: TopicFormData) => {
        setGenerating(true)
        setError(null)

        try {
            const response = await api.post('/teacher/topic/generate', data)
            console.log("RAW TOPIC RESPONSE 👉", response.data)

            // Store in sessionStorage
            sessionStorage.setItem('currentTopic', JSON.stringify(response.data))

            toast({
                title: 'Success!',
                description: `Generated ${response.data.slides.length} sections for ${data.topic}`,
                variant: 'default',
            })

            // Navigate to viewer
            router.push('/teacher/topic-planner/view')
        } catch (err: any) {
            console.error('Topic generation error:', err)
            const errorMessage = err.response?.data?.message || 'Failed to generate topic. Please try again.'
            setError(errorMessage)
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
        <div className="min-h-screen bg-gradient-to-br bg-zinc-100 dark:bg-zinc-950 py-8">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="mb-8 space-y-2">
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <div className="text-center space-y-3">
                        <div className="inline-flex p-4 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl shadow-lg">
                            <BookOpen className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                            Topic Outline Generator
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Create comprehensive topic outlines in seconds using AI
                        </p>
                    </div>
                </div>

                <Card className="border-t-4 border-t-zinc-900 dark:border-t-zinc-700 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">Topic Details</CardTitle>
                        <CardDescription>
                            Configure your topic outline requirements
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic <span className="text-red-500">*</span></Label>
                                <Input
                                    id="topic"
                                    placeholder="e.g., Photosynthesis, World War II, Quadratic Equations"
                                    {...register('topic')}
                                    disabled={generating}
                                    className={errors.topic ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                />
                                {errors.topic && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> {errors.topic.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(value) => setValue('subject', value)}
                                        disabled={generating}
                                    >
                                        <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select..." />
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
                                    <Label htmlFor="gradeLevel">Grade <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(value) => setValue('gradeLevel', value)}
                                        disabled={generating}
                                    >
                                        <SelectTrigger className={errors.gradeLevel ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[...Array(12)].map((_, i) => (
                                                <SelectItem key={i + 1} value={`${i + 1}`}>
                                                    Grade {i + 1}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="college">College</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gradeLevel && (
                                        <p className="text-sm text-red-500">{errors.gradeLevel.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="classDuration">Class Duration: {watch('classDuration')} minutes</Label>
                                    <span className="text-xs text-gray-500">20-90 min</span>
                                </div>
                                <Input
                                    id="classDuration"
                                    type="range"
                                    min="20"
                                    max="90"
                                    step="5"
                                    className="cursor-pointer"
                                    disabled={generating}
                                    {...register('classDuration', { valueAsNumber: true })}
                                />
                                <p className="text-xs text-gray-500 text-center">
                                    ~{Math.ceil(watch('classDuration') / 4)} sections will be generated
                                </p>
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
                                disabled={generating}
                                className="w-full bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 text-white shadow-lg hover:shadow-xl transition-all"
                                size="lg"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Generating Content...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Generate Topic Outline
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
