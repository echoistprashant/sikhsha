'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

interface StandardsBadgesProps {
    standards: string[]
}

export function StandardsBadges({ standards }: StandardsBadgesProps) {
    if (!standards || standards.length === 0) {
        return null
    }

    return (
        <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-900">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Aligned Curriculum Standards
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {standards.map((std) => (
                        <Badge key={std} variant="secondary" className="bg-green-100 text-green-800">
                            {std}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
