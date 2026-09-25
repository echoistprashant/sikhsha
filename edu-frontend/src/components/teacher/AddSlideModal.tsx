'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, Sparkles, PlusCircle } from 'lucide-react'

// Slide type options
const SLIDE_TYPES = [
    { value: 'CONCEPT', label: 'Concept / Explanation', icon: '📚' },
    { value: 'ACTIVITY', label: 'Activity / Practice', icon: '🎯' },
    { value: 'ASSESSMENT', label: 'Assessment / Quiz', icon: '📋' },
    { value: 'SUMMARY', label: 'Summary / Recap', icon: '📝' },
]

interface AddSlideModalProps {
    isOpen: boolean
    onClose: () => void
    onAddSlide: (slide: GeneratedSlide) => void
    afterSlideIndex: number
    deckMeta: {
        subject: string
        gradeLevel: string
        topic: string
    }
}

export interface GeneratedSlide {
    title: string
    content: string
    slideType: string
    bloom_level: string
    order: number
}

export function AddSlideModal({
    isOpen,
    onClose,
    onAddSlide,
    afterSlideIndex,
    deckMeta,
}: AddSlideModalProps) {
    const [slideType, setSlideType] = useState<string>('CONCEPT')
    const [description, setDescription] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedSlide, setGeneratedSlide] = useState<GeneratedSlide | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleGenerate = async () => {
        if (!description.trim()) {
            setError('Please describe what you want in the slide')
            return
        }

        setIsGenerating(true)
        setError(null)
        setGeneratedSlide(null)

        try {
            const API_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'

            const response = await fetch(`${API_URL}/api/deck/add-slide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    slideType,
                    subject: deckMeta.subject,
                    gradeLevel: deckMeta.gradeLevel,
                    topic: deckMeta.topic,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || 'Failed to generate slide')
            }

            const data = await response.json()
            setGeneratedSlide({
                title: data.title,
                content: data.content,
                slideType: slideType,
                bloom_level: data.bloom_level || 'UNDERSTAND',
                order: afterSlideIndex + 1.5, // Will be adjusted when inserted
            })
        } catch (err: any) {
            setError(err.message || 'Failed to generate slide')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleInsert = () => {
        if (generatedSlide) {
            onAddSlide(generatedSlide)
            handleClose()
        }
    }

    const handleClose = () => {
        setSlideType('CONCEPT')
        setDescription('')
        setGeneratedSlide(null)
        setError(null)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5 text-green-600" />
                        Add New Slide
                    </DialogTitle>
                    <DialogDescription>
                        Describe what you want in the new slide and AI will generate it for you
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Slide Type Selection */}
                    <div className="space-y-2">
                        <Label>Slide Type</Label>
                        <Select value={slideType} onValueChange={setSlideType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select slide type" />
                            </SelectTrigger>
                            <SelectContent>
                                {SLIDE_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{type.icon}</span>
                                            <span>{type.label}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <Label>What should this slide contain?</Label>
                        <Textarea
                            placeholder="Example: Explain the three laws of thermodynamics with examples..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[120px] resize-none"
                        />
                        <p className="text-xs text-gray-500">
                            Be specific about what content, examples, or questions you want
                        </p>
                    </div>

                    {/* Generate Button */}
                    {!generatedSlide && (
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !description.trim()}
                            className="w-full"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Slide...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Slide
                                </>
                            )}
                        </Button>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Generated Slide Preview */}
                    {generatedSlide && (
                        <div className="space-y-3">
                            <Label>Generated Slide Preview</Label>
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">
                                    {generatedSlide.title}
                                </h4>
                                <div className="text-green-800 whitespace-pre-wrap text-sm">
                                    {generatedSlide.content}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    {generatedSlide && (
                        <>
                            <Button variant="outline" onClick={() => setGeneratedSlide(null)}>
                                Regenerate
                            </Button>
                            <Button onClick={handleInsert} className="bg-green-600 hover:bg-green-700">
                                Insert Slide
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
