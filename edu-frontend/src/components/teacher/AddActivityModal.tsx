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
import { Loader2, Sparkles, ClipboardCheck } from 'lucide-react'

// Activity type options
const ACTIVITY_TYPES = [
    { value: 'mcq', label: 'Multiple Choice (MCQ)', icon: '🔘' },
    { value: 'short-answer', label: 'Short Answer', icon: '📝' },
    { value: 'long-answer', label: 'Long Answer', icon: '📄' },
    { value: 'fill-in-blank', label: 'Fill in the Blanks', icon: '✏️' },
]

interface AddActivityModalProps {
    isOpen: boolean
    onClose: () => void
    onAddActivity: (activity: GeneratedActivity) => void
    slideContext: {
        title: string
        content: string
        slideIndex: number
    }
    deckMeta: {
        subject: string
        gradeLevel: string
        topic: string
    }
}

export interface GeneratedActivity {
    title: string
    content: string
    type: string
    slideType: 'ACTIVITY'
    bloom_level: string
    order: number
}

export function AddActivityModal({
    isOpen,
    onClose,
    onAddActivity,
    slideContext,
    deckMeta,
}: AddActivityModalProps) {
    const [activityType, setActivityType] = useState<string>('mcq')
    const [customPrompt, setCustomPrompt] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedActivity, setGeneratedActivity] = useState<GeneratedActivity | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleGenerate = async () => {
        setIsGenerating(true)
        setError(null)
        setGeneratedActivity(null)

        try {
            const API_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'

            const response = await fetch(`${API_URL}/api/deck/add-activity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slideContext: {
                        title: slideContext.title,
                        content: slideContext.content,
                    },
                    activityType,
                    customPrompt: customPrompt || undefined,
                    subject: deckMeta.subject,
                    gradeLevel: deckMeta.gradeLevel,
                    topic: deckMeta.topic,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || 'Failed to generate activity')
            }

            const data = await response.json()
            setGeneratedActivity({
                title: data.title,
                content: data.content,
                type: activityType,
                slideType: 'ACTIVITY',
                bloom_level: data.bloom_level || 'APPLY',
                order: slideContext.slideIndex + 1.5, // Will be adjusted when inserted
            })
        } catch (err: any) {
            setError(err.message || 'Failed to generate activity')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleInsert = () => {
        if (generatedActivity) {
            onAddActivity(generatedActivity)
            handleClose()
        }
    }

    const handleClose = () => {
        setActivityType('mcq')
        setCustomPrompt('')
        setGeneratedActivity(null)
        setError(null)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-blue-600" />
                        Add Activity
                    </DialogTitle>
                    <DialogDescription>
                        Generate an interactive activity based on &quot;{slideContext.title}&quot;
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Activity Type Selection */}
                    <div className="space-y-2">
                        <Label>Activity Type</Label>
                        <Select value={activityType} onValueChange={setActivityType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select activity type" />
                            </SelectTrigger>
                            <SelectContent>
                                {ACTIVITY_TYPES.map((type) => (
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

                    {/* Custom Prompt (Optional) */}
                    <div className="space-y-2">
                        <Label>Custom Instructions (Optional)</Label>
                        <Textarea
                            placeholder="Add any specific requirements for the activity..."
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="min-h-[80px] resize-none"
                        />
                        <p className="text-xs text-gray-500">
                            Leave empty to auto-generate based on slide content
                        </p>
                    </div>

                    {/* Generate Button */}
                    {!generatedActivity && (
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Activity...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Activity
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

                    {/* Generated Activity Preview */}
                    {generatedActivity && (
                        <div className="space-y-3">
                            <Label>Generated Activity Preview</Label>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">
                                    {generatedActivity.title}
                                </h4>
                                <div className="text-blue-800 whitespace-pre-wrap text-sm">
                                    {generatedActivity.content}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    {generatedActivity && (
                        <>
                            <Button variant="outline" onClick={() => setGeneratedActivity(null)}>
                                Regenerate
                            </Button>
                            <Button onClick={handleInsert}>
                                Insert Activity
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
