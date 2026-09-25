// ===================================================
// Deck Generation Service - Backend API Integration
// Updated to use EDU Backend API instead of direct AI service calls
// ===================================================

import { LessonDeck, DeckGenerateRequest } from '@/types/lesson'

// Use backend API URL instead of AI service
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface DifferentiatedDecks {
    support: LessonDeck
    core: LessonDeck
    extension: LessonDeck
}

export interface StructuredDeckPayload {
    deckId?: string
    id?: string
    title?: string
    theme?: string
    lesson?: Partial<LessonDeck>
    meta?: LessonDeck['meta']
    structure?: LessonDeck['structure']
    slides?: LessonDeck['slides']
}

export interface DeckRegenerateSlideRequest {
    deckId: string
    clusterId: string
    pedagogicalRole: string
}

export interface DeckSwitchLayoutRequest {
    deckId: string
    slideId: string
    layoutId: string
}

function isStructuredDeckPayload(
    request: DeckGenerateRequest | StructuredDeckPayload
): request is StructuredDeckPayload {
    return 'lesson' in request || 'meta' in request || 'title' in request || 'deckId' in request || 'id' in request
}

function normalizeDeckResponse(payload: any): LessonDeck {
    const lesson = payload?.lesson ?? payload ?? {}

    return {
        id: String(payload?.id ?? lesson?.id ?? lesson?.meta?.lesson_id ?? ''),
        meta: payload?.meta ?? lesson?.meta ?? {
            lesson_id: '',
            topic: payload?.title ?? 'Teaching Deck',
            grade: '',
            standards: [],
            theme: 'default',
            pedagogical_model: 'I_DO_WE_DO_YOU_DO',
            created_at: new Date().toISOString(),
        },
        structure: payload?.structure ?? lesson?.structure ?? {
            learning_objectives: [],
            vocabulary: [],
            prerequisites: [],
            bloom_progression: [],
        },
        slides: payload?.slides ?? lesson?.slides ?? [],
        createdBy: String(payload?.createdBy ?? payload?.created_by ?? lesson?.createdBy ?? ''),
        createdAt: String(payload?.createdAt ?? payload?.created_at ?? lesson?.createdAt ?? ''),
        updatedAt: String(payload?.updatedAt ?? payload?.updated_at ?? lesson?.updatedAt ?? ''),
    }
}

class DeckService {
    /**
     * Get auth token from localStorage
     */
    private getAuthToken(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem('auth_token')
    }

    /**
     * Get auth headers
     */
    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        const token = this.getAuthToken()
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        return headers
    }

    /**
     * Generate a complete lesson deck with Bloom's progression
     * Routes through backend API
     */
    async generateComplete(request: DeckGenerateRequest): Promise<LessonDeck> {
        const response = await fetch(`${API_URL}/teacher/deck/generate`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to generate deck' }))
            throw new Error(error.message || error.detail || 'Failed to generate deck')
        }

        return normalizeDeckResponse(await response.json())
    }

    /**
     * Generate all three differentiation levels (Support, Core, Extension)
     * Note: This may need backend support - currently generates core level
     */
    async generateAllLevels(request: DeckGenerateRequest): Promise<DifferentiatedDecks> {
        // Generate all three levels sequentially
        const [support, core, extension] = await Promise.all([
            this.generateLevel(request, 'support'),
            this.generateLevel(request, 'core'),
            this.generateLevel(request, 'extension'),
        ])

        return { support, core, extension }
    }

    /**
     * Generate a specific differentiation level
     * Routes through backend API with level parameter
     */
    async generateLevel(
        request: DeckGenerateRequest,
        level: 'support' | 'core' | 'extension'
    ): Promise<LessonDeck> {
        const requestWithLevel = { ...request, level: level.toUpperCase() }

        const response = await fetch(`${API_URL}/teacher/deck/generate`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(requestWithLevel),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: `Failed to generate ${level} deck` }))
            throw new Error(error.message || error.detail || `Failed to generate ${level} deck`)
        }

        return normalizeDeckResponse(await response.json())
    }

    async updateStructuredDeck(deckId: string, deck: LessonDeck): Promise<LessonDeck> {
        const response = await fetch(`${API_URL}/teacher/deck/${deckId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({
                title: deck.meta?.topic,
                lesson: {
                    meta: deck.meta,
                    structure: deck.structure,
                    slides: deck.slides,
                },
            }),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update deck' }))
            throw new Error(error.message || error.detail || 'Failed to update deck')
        }

        return normalizeDeckResponse(await response.json())
    }

    async regenerateCluster(request: DeckRegenerateSlideRequest): Promise<LessonDeck> {
        const response = await fetch(`${API_URL}/teacher/decks/regenerate-cluster`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to regenerate cluster' }))
            throw new Error(error.message || error.detail || 'Failed to regenerate cluster')
        }

        return normalizeDeckResponse(await response.json())
    }

    async switchSlideLayout(request: DeckSwitchLayoutRequest): Promise<LessonDeck> {
        const response = await fetch(`${API_URL}/teacher/decks/switch-layout`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to switch slide layout' }))
            throw new Error(error.message || error.detail || 'Failed to switch slide layout')
        }

        return normalizeDeckResponse(await response.json())
    }

    /**
     * Download PPTX file with embedded images
     * Routes through backend API
     */
    async downloadPPTX(request: DeckGenerateRequest | StructuredDeckPayload): Promise<Blob> {
        const response = await fetch(`${API_URL}/ai/pptx`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }))
            throw new Error(error.message || error.detail || 'Failed to generate PPTX')
        }

        return response.blob()
    }

    /**
     * Helper: Download blob as file
     */
    downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    /**
     * Combined: Generate and download PPTX in one call
     */
    async generateAndDownloadPPTX(request: DeckGenerateRequest | StructuredDeckPayload, filename?: string) {
        const blob = await this.downloadPPTX(request)
        const inferredTopic = isStructuredDeckPayload(request)
            ? request.lesson?.meta?.topic || request.meta?.topic || request.title
            : request.topic
        const defaultFilename = `${inferredTopic?.replace(/\s+/g, '_') || 'lesson'}.pptx`
        this.downloadBlob(blob, filename || defaultFilename)
    }
}

// Singleton instance
export const deckService = new DeckService()
