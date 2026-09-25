'use client'

import { useState, useEffect } from 'react'
import WidgetCard from '../widget-card'
import api from '@/lib/api-client'
import { BarChart3 } from 'lucide-react'

interface WeakArea {
    subject: string
    frequency: number
}

export default function WeakAreasWidget() {
    const [weakAreas, setWeakAreas] = useState<WeakArea[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchWeakAreas()
    }, [])

    const fetchWeakAreas = async () => {
        try {
            const response = await api.get('/student/weak-areas')
            setWeakAreas(response.data.slice(0, 3)) // Top 3 only
        } catch (err) {
            setError('Failed to load')
        } finally {
            setLoading(false)
        }
    }

    const maxFrequency = weakAreas.length > 0 ? Math.max(...weakAreas.map(wa => wa.frequency)) : 1

    const getMasteryLevel = (frequency: number) => {
        // Lower frequency = better mastery (fewer doubts asked)
        const ratio = frequency / maxFrequency
        if (ratio < 0.3) return { percent: 85, color: 'bg-green-500' }
        if (ratio < 0.6) return { percent: 60, color: 'bg-amber-500' }
        return { percent: 35, color: 'bg-red-500' }
    }

    return (
        <WidgetCard
            title="Weak Areas"
            icon={<BarChart3 className="h-4 w-4" />}
            href="/student/weak-areas"
            loading={loading}
            error={error}
        >
            {weakAreas.length === 0 ? (
                <div className="py-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No weak areas identified yet. Keep learning!
                </div>
            ) : (
                <div className="space-y-3">
                    {weakAreas.map((area, index) => {
                        const mastery = getMasteryLevel(area.frequency)
                        return (
                            <div key={area.subject}>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                                        {area.subject.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                                        {mastery.percent}% mastery
                                    </span>
                                </div>
                                <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${mastery.color}`}
                                        style={{ width: `${mastery.percent}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-1">
                        Click to see full analysis →
                    </p>
                </div>
            )}
        </WidgetCard>
    )
}
