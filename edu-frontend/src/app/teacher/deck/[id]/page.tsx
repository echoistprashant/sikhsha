'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api-client'
import { ArrowLeft, Loader2, GraduationCap, Presentation } from 'lucide-react'

interface Slide {
    id: string
    title: string
    content: string
    slide_order: number
}

interface Deck {
    id: string
    title: string
    subject: string
    grade_level: string
    created_at: string
}

export default function ViewDeckPage() {
    const { id } = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [deck, setDeck] = useState<Deck | null>(null)
    const [slides, setSlides] = useState<Slide[]>([])
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        if (id) fetchDeck()
    }, [id])

    const fetchDeck = async () => {
        try {
            const response = await api.get(`/teacher/deck/${id}`)
            setDeck(response.data.deck || response.data)
            setSlides(response.data.slides || [])
        } catch (err) {
            console.error('Failed to fetch deck:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (!deck) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p className="text-gray-500">Deck not found</p>
                <Link href="/teacher/my-content">
                    <Button variant="outline" className="mt-4">Back to My Content</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Link href="/teacher/my-content">
                <Button variant="outline" size="sm" className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to My Content
                </Button>
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{deck.title}</h1>
                    <p className="text-gray-500">{deck.subject} • Class {deck.grade_level}</p>
                </div>
            </div>

            {slides.length > 0 ? (
                <div className="space-y-4">
                    {/* Slide Navigation */}
                    <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                            disabled={currentSlide === 0}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium">
                            Slide {currentSlide + 1} of {slides.length}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                            disabled={currentSlide === slides.length - 1}
                        >
                            Next
                        </Button>
                    </div>

                    {/* Current Slide */}
                    <Card className="min-h-[400px]">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Presentation className="h-5 w-5" />
                                {slides[currentSlide]?.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="prose max-w-none whitespace-pre-wrap">
                                {slides[currentSlide]?.content}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Slide Thumbnails */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                onClick={() => setCurrentSlide(index)}
                                className={`flex-shrink-0 w-24 h-16 rounded border-2 p-2 text-xs text-left overflow-hidden ${currentSlide === index
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span className="font-medium line-clamp-2">{slide.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-gray-500">No slides in this deck</p>
            )}
        </div>
    )
}
