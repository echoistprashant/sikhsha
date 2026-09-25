'use client'

import { Suspense } from 'react'
import DeckCarouselViewer from '@/components/teacher/DeckCarouselViewer'
import { Loader2 } from 'lucide-react'

function DeckViewerContent() {
    return <DeckCarouselViewer />
}

export default function DeckViewerPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        }>
            <DeckViewerContent />
        </Suspense>
    )
}
