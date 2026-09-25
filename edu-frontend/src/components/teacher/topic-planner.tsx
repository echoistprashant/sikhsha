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
import { Loader2, Presentation, AlertCircle, CheckCircle2, FileText, ArrowLeft, Sparkles } from 'lucide-react'
import type { Deck } from '@/types/teacher'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { VisualRenderer } from '@/components/visuals/VisualRenderer'

const deckSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters').max(100, 'Topic must be less than 100 characters'),
  subject: z.string().min(1, 'Subject is required'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  classDuration: z.number().min(20, 'Minimum 20 minutes').max(90, 'Maximum 90 minutes').default(40),
})

type DeckFormData = z.infer<typeof deckSchema>

export default function DeckGenerator() {
  const [generating, setGenerating] = useState(false)
  const [generatedDeck, setGeneratedDeck] = useState<Deck | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState('professional')
  const [editingWithAI, setEditingWithAI] = useState(false)
  const [aiFeedback, setAiFeedback] = useState('')
  const [showAIEditor, setShowAIEditor] = useState(false)
  const { toast } = useToast()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DeckFormData>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      classDuration: 40,
    },
  })

  const onSubmit = async (data: DeckFormData) => {
    setGenerating(true)
    setError(null)
    setGeneratedDeck(null)

    try {
      const response = await api.post('/teacher/deck/generate', data)
      console.log("RAW DECK RESPONSE 👉", response.data)
      setGeneratedDeck(response.data)
      toast({
        title: 'Success!',
        description: `Generated ${response.data.slides.length} slides for ${data.topic}`,
        variant: 'default',
      })
    } catch (err: any) {
      console.error('Deck generation error:', err)
      const errorMessage = err.response?.data?.message || 'Failed to generate deck. Please try again.'
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

  const exportToPowerPoint = async (deck: Deck) => {
    try {
      const response = await api.post(`/export/powerpoint?theme=${selectedTheme}`, deck, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx`
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

  const exportToPDF = async (deck: Deck) => {
    try {
      const response = await api.post('/export/pdf', deck, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_deck.pdf`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: 'PDF Created!',
        description: 'Your deck has been downloaded',
      })
    } catch (error) {
      console.error('PDF export error:', error)
      toast({
        title: 'Export Failed',
        description: 'Could not create PDF file',
        variant: 'destructive',
      })
    }
  }

  const editWithAI = async () => {
    if (!generatedDeck || !aiFeedback.trim()) {
      toast({
        title: 'Feedback Required',
        description: 'Please provide feedback for AI to improve the deck',
        variant: 'destructive',
      })
      return
    }

    setEditingWithAI(true)
    try {
      const response = await api.post(`/teacher/deck/${generatedDeck.id}/ai-update`, {
        feedback: aiFeedback
      })

      toast({
        title: 'Deck Updated!',
        description: 'AI has improved your deck based on your feedback',
      })

      // Refresh the deck
      const updatedDeck = await api.get(`/teacher/deck/${generatedDeck.id}`)
      setGeneratedDeck(updatedDeck.data)
      setAiFeedback('')
      setShowAIEditor(false)
    } catch (error: any) {
      console.error('AI edit error:', error)
      toast({
        title: 'Edit Failed',
        description: error.response?.data?.message || 'Could not update deck with AI',
        variant: 'destructive',
      })
    } finally {
      setEditingWithAI(false)
    }
  }

  const saveToDeck = () => {
    toast({
      title: 'Coming Soon',
      description: 'Library save will be available soon!',
    })
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
          <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
            <Presentation className="h-8 w-8 text-zinc-900 dark:text-white" />
          </div>
          Teaching Deck Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Create professional presentation decks in seconds using AI.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-t-4 border-t-zinc-900 dark:border-t-zinc-700 shadow-md">
            <CardHeader>
              <CardTitle>Deck Details</CardTitle>
              <CardDescription>
                Configure your presentation requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic <span className="text-red-500">*</span></Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Photosynthesis, World War II"
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
                      value={watch('subject')}
                      onValueChange={(value) => setValue('subject', value, { shouldValidate: true })}
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
                      value={watch('gradeLevel')}
                      onValueChange={(value) => setValue('gradeLevel', value, { shouldValidate: true })}
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
                    <span className="text-xs text-muted-foreground">20-90 min</span>
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
                  <p className="text-xs text-muted-foreground text-center">
                    ~{Math.ceil(watch('classDuration') / 4)} slides will be generated
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
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white transition-all"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      Generate Deck
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          {generating ? (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-slate-50 border-dashed">
              <div className="relative">
                <div className="absolute inset-0 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-ping opacity-25"></div>
                <Loader2 className="h-16 w-16 text-zinc-900 dark:text-white animate-spin relative z-10" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">Crafting your presentation</h3>
              <p className="text-muted-foreground mt-2 max-w-xs">
                AI is researching the topic, structuring slides, and generating content & visuals...
              </p>
            </Card>
          ) : generatedDeck ? (
            <Card className="h-full border-t-4 border-t-green-600 shadow-md flex flex-col">
              <CardHeader className="bg-green-50/50 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-green-900">{generatedDeck.title}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Generated successfully • {generatedDeck.slides.length} slides
                    </CardDescription>
                  </div>
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[600px] p-0">
                <div className="divide-y">
                  {generatedDeck.slides.map((slide, index) => (
                    <div key={slide.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {slide.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {slide.content}
                          </p>

                          {/* NEW: Render visual if available */}
                          {slide.visualMetadata && (
                            <VisualRenderer
                              visualMetadata={slide.visualMetadata}
                              showMetadata={true}
                            />
                          )}

                          {slide.notes && (
                            <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-100">
                              <strong>Speaker Notes:</strong> {slide.notes}
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
                    <div className="space-y-3 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <Label className="text-sm font-medium text-zinc-900 dark:text-white">Edit with AI</Label>
                      </div>
                      <Textarea
                        placeholder="Tell AI how to improve this deck... (e.g., 'Add more examples', 'Simplify slide 3', 'Make it more engaging')"
                        value={aiFeedback}
                        onChange={(e) => setAiFeedback(e.target.value)}
                        className="min-h-[80px]"
                        disabled={editingWithAI}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={editWithAI}
                          disabled={editingWithAI || !aiFeedback.trim()}
                          className="bg-emerald-600 hover:bg-emerald-700"
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
                      className="w-full border-emerald-400 text-emerald-600 hover:bg-zinc-100 dark:bg-zinc-800"
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
                            <div className="w-4 h-4 rounded bg-zinc-900"></div>
                            Professional
                          </div>
                        </SelectItem>
                        <SelectItem value="creative">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-emerald-600"></div>
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
                            <div className="w-4 h-4 rounded bg-zinc-900"></div>
                            Academic
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button
                      onClick={() => exportToPowerPoint(generatedDeck)}
                      variant="default"
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800"
                    >
                      Export to PowerPoint
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => saveToDeck()}>
                      Save to Library
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 border-dashed">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Presentation className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">No deck generated yet</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Fill out the form on the left to generate a comprehensive teaching deck tailored to your needs.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

