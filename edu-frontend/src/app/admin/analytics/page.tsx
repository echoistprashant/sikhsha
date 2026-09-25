'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminAnalyticsPage() {
    return (
        <div>
            <div className="mb-8">
                <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-2">Platform analytics and insights</p>
            </div>

            <Card className="text-center py-16">
                <CardContent>
                    <Construction className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                    <p className="text-gray-600">
                        Analytics dashboard is under development. Check back soon!
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
