'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BloomLevel } from '@/types/lesson'
import { TrendingUp } from 'lucide-react'

interface Slide {
    title: string
    bloom_level: BloomLevel
}

interface BloomsProgressionChartProps {
    slides: Slide[]
}

const bloomColors: Record<BloomLevel, string> = {
    [BloomLevel.REMEMBER]: 'bg-blue-100 text-blue-800 border-blue-200',
    [BloomLevel.UNDERSTAND]: 'bg-green-100 text-green-800 border-green-200',
    [BloomLevel.APPLY]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [BloomLevel.ANALYZE]: 'bg-orange-100 text-orange-800 border-orange-200',
    [BloomLevel.EVALUATE]: 'bg-red-100 text-red-800 border-red-200',
    [BloomLevel.CREATE]: 'bg-purple-100 text-purple-800 border-purple-200',
}

export function BloomsProgressionChart({ slides }: BloomsProgressionChartProps) {
    if (!slides || slides.length === 0) {
        return null
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Bloom's Taxonomy Progression
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {slides.map((slide, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-xs text-muted-foreground w-6 flex-shrink-0">
                                {idx + 1}
                            </span>
                            <Badge
                                variant="outline"
                                className={`${bloomColors[slide.bloom_level]} text-xs font-medium flex-shrink-0`}
                            >
                                {slide.bloom_level}
                            </Badge>
                            <span className="truncate flex-1 text-gray-700">
                                {slide.title}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
