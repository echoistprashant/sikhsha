'use client'

import { useState, useEffect } from 'react'
import WidgetCard from '../widget-card'
import api from '@/lib/api-client'
import { Calendar, UserCheck, UserX } from 'lucide-react'

interface TeacherPresence {
    present: Array<{ id: string; name: string; email: string }>
    absent: Array<{ id: string; name: string; email: string }>
}

export default function AttendanceWidget() {
    const [teacherPresence, setTeacherPresence] = useState<TeacherPresence>({ present: [], absent: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAttendance()
    }, [])

    const fetchAttendance = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]
            const response = await api.get(`/attendance/admin/teachers/presence?date=${today}`)
            setTeacherPresence({
                present: response.data?.present || [],
                absent: response.data?.absent || [],
            })
        } catch (err) {
            setError('Failed to load')
        } finally {
            setLoading(false)
        }
    }

    const absentCount = teacherPresence.absent.length
    const totalTeachers = teacherPresence.present.length + teacherPresence.absent.length
    const attendancePercent = totalTeachers > 0
        ? Math.round((teacherPresence.present.length / totalTeachers) * 100)
        : 0

    return (
        <WidgetCard
            title="Attendance"
            icon={<Calendar className="h-4 w-4" />}
            href="/admin/attendance"
            loading={loading}
            error={error}
            badge={absentCount > 0 ? `${absentCount} absent` : undefined}
            badgeVariant={absentCount > 0 ? 'danger' : 'default'}
        >
            <div className="space-y-3">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <div>
                            <p className="text-lg font-bold text-green-700">{teacherPresence.present.length}</p>
                            <p className="text-xs text-green-600">Present</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                        <UserX className="h-4 w-4 text-red-600" />
                        <div>
                            <p className="text-lg font-bold text-red-700">{absentCount}</p>
                            <p className="text-xs text-red-600">Absent</p>
                        </div>
                    </div>
                </div>

                {/* Absent Teachers List (if any) */}
                {absentCount > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Absent today:</p>
                        <div className="flex flex-wrap gap-1">
                            {teacherPresence.absent.slice(0, 3).map((teacher) => (
                                <span
                                    key={teacher.id}
                                    className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full"
                                >
                                    {teacher.name.split(' ')[0]}
                                </span>
                            ))}
                            {absentCount > 3 && (
                                <span className="px-2 py-0.5 text-xs text-gray-500">
                                    +{absentCount - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Attendance Rate */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Teacher attendance rate</span>
                    <span className={`font-medium ${attendancePercent >= 90 ? 'text-green-600' : attendancePercent >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                        {attendancePercent}%
                    </span>
                </div>
            </div>
        </WidgetCard>
    )
}
