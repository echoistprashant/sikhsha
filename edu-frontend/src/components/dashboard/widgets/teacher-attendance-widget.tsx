'use client'

import { useState, useEffect } from 'react'
import WidgetCard from '../widget-card'
import api from '@/lib/api-client'
import { Calendar, UserCheck, UserX, Users, AlertCircle, CheckCircle2 } from 'lucide-react'

interface ClassInfo {
    class: string
    section: string
    studentCount: number
}

interface AttendanceStatus {
    isClassTeacher: boolean
    classInfo: ClassInfo | null
    attendanceMarked: boolean
    summary?: {
        total: number
        present: number
        absent: number
    }
}

export default function TeacherAttendanceWidget() {
    const [status, setStatus] = useState<AttendanceStatus>({
        isClassTeacher: true,
        classInfo: null,
        attendanceMarked: false,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAttendanceStatus()
    }, [])

    const fetchAttendanceStatus = async () => {
        try {
            // First, check if teacher has students assigned
            const studentsResponse = await api.get('/attendance/teacher/students')
            const data = studentsResponse.data

            const classInfo: ClassInfo = {
                class: data.class,
                section: data.section,
                studentCount: data.students?.length || 0,
            }

            // Check if attendance is already marked for today
            const today = new Date().toISOString().split('T')[0]
            let attendanceMarked = false
            let summary = undefined

            try {
                const attendanceResponse = await api.get('/attendance/teacher/attendance', {
                    params: {
                        date: today,
                        class: data.class,
                        section: data.section,
                    },
                })

                if (attendanceResponse.data.records && attendanceResponse.data.records.length > 0) {
                    attendanceMarked = true
                    const records = attendanceResponse.data.records
                    const present = records.filter((r: any) => r.status === 'present').length
                    summary = {
                        total: records.length,
                        present,
                        absent: records.length - present,
                    }
                }
            } catch (err) {
                // If error fetching attendance, assume not marked yet
            }

            setStatus({
                isClassTeacher: true,
                classInfo,
                attendanceMarked,
                summary,
            })
        } catch (err: any) {
            if (
                err.response?.data?.message?.includes('not assigned as a class teacher') ||
                err.response?.data?.code === 'NOT_CLASS_TEACHER'
            ) {
                setStatus({
                    isClassTeacher: false,
                    classInfo: null,
                    attendanceMarked: false,
                })
            } else {
                setError('Failed to load')
            }
        } finally {
            setLoading(false)
        }
    }

    // Not a class teacher
    if (!loading && !status.isClassTeacher) {
        return (
            <WidgetCard
                title="Attendance"
                icon={<Calendar className="h-4 w-4" />}
                loading={loading}
                error={error}
            >
                <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                        <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Not assigned as class teacher
                    </p>
                </div>
            </WidgetCard>
        )
    }

    // Attendance already marked
    if (!loading && status.attendanceMarked && status.summary) {
        return (
            <WidgetCard
                title="Attendance"
                icon={<Calendar className="h-4 w-4" />}
                href="/teacher/attendance"
                loading={loading}
                error={error}
                badge="Done"
                badgeVariant="success"
            >
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Marked for today</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                            <Users className="h-4 w-4 mx-auto mb-1 text-gray-500" />
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {status.summary.total}
                            </p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <UserCheck className="h-4 w-4 mx-auto mb-1 text-green-600" />
                            <p className="text-lg font-bold text-green-600">{status.summary.present}</p>
                            <p className="text-xs text-green-600">Present</p>
                        </div>
                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <UserX className="h-4 w-4 mx-auto mb-1 text-red-600" />
                            <p className="text-lg font-bold text-red-600">{status.summary.absent}</p>
                            <p className="text-xs text-red-600">Absent</p>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        Class {status.classInfo?.class} - Section {status.classInfo?.section}
                    </p>
                </div>
            </WidgetCard>
        )
    }

    // Attendance not marked yet
    return (
        <WidgetCard
            title="Attendance"
            icon={<Calendar className="h-4 w-4" />}
            href="/teacher/attendance"
            loading={loading}
            error={error}
            badge="Pending"
            badgeVariant="warning"
        >
            <div className="space-y-3">
                <div className="flex items-center gap-3 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">
                            Mark Today's Attendance
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {status.classInfo
                                ? `Class ${status.classInfo.class} - Section ${status.classInfo.section}`
                                : 'Tap to get started'}
                        </p>
                    </div>
                </div>

                {status.classInfo && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Students</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                            {status.classInfo.studentCount}
                        </span>
                    </div>
                )}
            </div>
        </WidgetCard>
    )
}
