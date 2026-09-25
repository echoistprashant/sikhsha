'use client'

import WidgetCard from '../widget-card'
import { FileText } from 'lucide-react'

export default function UpcomingLessonWidget() {
    return (
        <WidgetCard
            title="Lesson Planner"
            icon={<FileText className="h-4 w-4" />}
            href="/teacher/lesson-planner"
        >
            <div className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                    <p className="font-medium text-gray-900">Create Lesson Plans</p>
                    <p className="text-sm text-gray-500">AI-powered lesson planning</p>
                </div>
            </div>
        </WidgetCard>
    )
}
