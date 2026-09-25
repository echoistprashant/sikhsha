'use client'

import { useState, useEffect } from 'react'
import WidgetCard from '../widget-card'
import api from '@/lib/api-client'
import { Users, UserCheck, UserX, Clock } from 'lucide-react'

interface StudentPresence {
    present: number
    absent: number
    late: number
    excused: number
    total: number
}

export default function StudentAttendanceWidget() {
    const [presence, setPresence] = useState<StudentPresence>({ present: 0, absent: 0, late: 0, excused: 0, total: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchStudentPresence()
    }, [])

    const fetchStudentPresence = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]
            const response = await api.get(`/attendance/admin/students/presence?date=${today}`)
            setPresence({
                present: response.data?.present || 0,
                absent: response.data?.absent || 0,
                late: response.data?.late || 0,
                excused: response.data?.excused || 0,
                total: response.data?.total || 0,
            })
        } catch (err) {
            setError('Failed to load')
        } finally {
            setLoading(false)
        }
    }

    const attendancePercent = presence.total > 0
        ? Math.round((presence.present / presence.total) * 100)
        : 0

    return (
        <WidgetCard
            title="Student Attendance"
            icon={<Users className="h-4 w-4" />}
            href="/admin/attendance"
            loading={loading}
            error={error}
        >
            <div className="space-y-3">
                {/* Main Stat */}
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                    <div className="p-2 bg-[#4CAF50] rounded-lg shadow-sm">
                        <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[#1F1F1F] dark:text-white">{presence.present}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Students Present</p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                        <UserX className="h-4 w-4 text-red-600 mb-1" />
                        <p className="font-semibold text-red-700 dark:text-red-300">{presence.absent}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Absent</p>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <Clock className="h-4 w-4 text-amber-600 mb-1" />
                        <p className="font-semibold text-amber-700 dark:text-amber-300">{presence.late}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">Late</p>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700">
                        <Users className="h-4 w-4 text-zinc-600 mb-1" />
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">{presence.total}</p>
                        <p className="text-xs text-zinc-500">Total</p>
                    </div>
                </div>

                {/* Attendance Rate */}
                <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Student attendance rate</span>
                    <span className={`font-medium ${attendancePercent >= 90 ? 'text-[#4CAF50]' : attendancePercent >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                        {attendancePercent}%
                    </span>
                </div>
            </div>
        </WidgetCard>
    )
}
