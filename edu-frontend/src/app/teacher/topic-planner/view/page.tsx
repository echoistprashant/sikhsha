'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import { Loader2, ArrowLeft, CheckCircle2, FileText, Sparkles } from 'lucide-react'
import type { Deck } from '@/types/teacher'
import { VisualRenderer } from '@/components/visuals/VisualRenderer'

export default function TopicViewerPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [topic, setTopic] = useState<Deck | null>(null)
    const [selectedTheme, setSelectedTheme] = useState('professional')
    const [editingWithAI, setEditingWithAI] = useState(false)
    const [aiFeedback, setAiFeedback] = useState('')
    const [showAIEditor, setShowAIEditor] = useState(false)

    useEffect(() => {
        // Load topic from sessionStorage
        const storedTopic = sessionStorage.getItem('currentTopic')
        if (storedTopic) {
            try {
                setTopic(JSON.parse(storedTopic))
            } catch (error) {
                console.error('Failed to parse topic:', error)
                router.push('/teacher/topic-planner')
            }
        } else {
            // No topic found, redirect back
            router.push('/teacher/topic-planner')
        }
    }, [router])

    const exportToPowerPoint = async () => {
        if (!topic) return

        try {
            const response = await api.post(`/export/powerpoint?theme=${selectedTheme}`, topic, {
                responseType: 'blob',
            })

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${topic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx`
            a.click()
            window.URL.revokeObjectURL(url)

            toast({
                title: 'PowerPoint Created!',
                description: 'Your presentation has been downloaded',
            })
        } catch (error) {
            console.error('PowerPoint export error:', error)
            toast({
                title: 'Export Failed',
                description: 'Could not create PowerPoint file',
                variant: 'destructive',
            })
        }
    }

    const editWithAI = async () => {
        if (!topic || !aiFeedback.trim()) {
            toast({
                title: 'Feedback Required',
                description: 'Please provide feedback for AI to improve the topic',
                variant: 'destructive',
            })
            return
        }

        setEditingWithAI(true)
        try {
            const response = await api.post(`/teacher/topic/${topic.id}/ai-update`, {
                feedback: aiFeedback
            })

            toast({
                title: 'Topic Updated!',
                description: 'AI has improved your topic based on your feedback',
            })

            // Refresh the topic
            const updatedTopic = await api.get(`/teacher/topic/${topic.id}`)
            setTopic(updatedTopic.data)
            sessionStorage.setItem('currentTopic', JSON.stringify(updatedTopic.data))
            setAiFeedback('')
            setShowAIEditor(false)
        } catch (error: any) {
            console.error('AI edit error:', error)
            toast({
                title: 'Edit Failed',
                description: error.response?.data?.message || 'Could not update topic with AI',
                variant: 'destructive',
            })
        } finally {
            setEditingWithAI(false)
        }
    }

    const saveToLibrary = () => {
        toast({
            title: 'Coming Soon',
            description: 'Library save will be available soon!',
        })
    }

    if (!topic) {
        return null // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <Link href="/teacher/topic-planner">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Generator
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mt-4">Generated Topic Outline</h1>
                    <p className="text-gray-600 mt-2">
                        {topic.slides.length} sections • {topic.title}
                    </p>
                </div>

                {/* Main Content Card */}
                <Card className="border-t-4 border-t-green-600 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl text-green-900">{topic.title}</CardTitle>
                                <CardDescription className="mt-1 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Generated successfully • {topic.slides.length} sections
                                </CardDescription>
                            </div>
                            <div className="bg-white p-3 rounded-full shadow-md">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="overflow-y-auto max-h-[600px] p-0">
                        <div className="divide-y">
                            {topic.slides.map((slide, index) => (
                                <div key={slide.id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <h3 className="font-semibold text-lg text-gray-900">
                                                {slide.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed">
                                                {slide.content}
                                            </p>

                                            {/* Render visual if available */}
                                            {slide.visualMetadata && (
                                                <VisualRenderer
                                                    visualMetadata={slide.visualMetadata}
                                                    showMetadata={true}
                                                />
                                            )}

                                            {slide.notes && (
                                                <div className="mt-3 p-3 bg-amber-50 text-amber-900 text-sm rounded-lg border border-amber-100">
                                                    <strong>Notes:</strong> {slide.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter className="p-6 bg-slate-50 border-t space-y-4">
                        <div className="w-full space-y-3">
                            {/* AI Editor Section */}
                            {showAIEditor ? (
                                <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                        <Label className="text-sm font-medium text-purple-900">Edit with AI</Label>
                                    </div>
                                    <Textarea
                                        placeholder="Tell AI how to improve this topic... (e.g., 'Add more examples', 'Simplify section 3', 'Make it more engaging')"
                                        value={aiFeedback}
                                        onChange={(e) => setAiFeedback(e.target.value)}
                                        className="min-h-[80px]"
                                        disabled={editingWithAI}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={editWithAI}
                                            disabled={editingWithAI || !aiFeedback.trim()}
                                            className="bg-purple-600 hover:bg-purple-700"
                                        >
                                            {editingWithAI ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                    Apply Changes
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setShowAIEditor(false)
                                                setAiFeedback('')
                                            }}
                                            variant="outline"
                                            disabled={editingWithAI}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => setShowAIEditor(true)}
                                    variant="outline"
                                    className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                                >
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Edit with AI
                                </Button>
                            )}

                            <div className="flex items-center gap-3">
                                <Label className="text-sm font-medium">Export Theme:</Label>
                                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="professional">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-blue-600"></div>
                                                Professional
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="creative">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-purple-600"></div>
                                                Creative
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="minimal">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-gray-800"></div>
                                                Minimal
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="colorful">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-red-500"></div>
                                                Colorful
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="academic">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded bg-indigo-900"></div>
                                                Academic
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    onClick={exportToPowerPoint}
                                    variant="default"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                >
                                    Export to PowerPoint
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={saveToLibrary}>
                                    Save to Library
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                {/* Bottom Action */}
                <div className="flex justify-center pt-4">
                    <Link href="/teacher/topic-planner">
                        <Button variant="outline" size="lg">
                            Generate Another Topic
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
