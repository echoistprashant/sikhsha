'use client'

import { useState, useEffect } from 'react'
import { GlassButton } from '@/components/ui/glass-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import { Loader2, Users, UserCheck, UserX, Calendar, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface Student {
    id: string
    name: string
    email: string
    section: string
    grade_level: string
}

interface AttendanceRecord {
    studentId: string
    status: 'present' | 'absent'
}

interface MarkedRecord {
    id: string
    student_id: string
    student_name: string
    student_email: string
    status: string
    marked_at: string
}

export default function Attendance() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [students, setStudents] = useState<Student[]>([])
    const [classInfo, setClassInfo] = useState<{ class: string; section: string }>({
        class: '',
        section: '',
    })
    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({})
    const [error, setError] = useState<string | null>(null)
    const [notClassTeacher, setNotClassTeacher] = useState(false)
    const [attendanceMarked, setAttendanceMarked] = useState(false)
    const [markedRecords, setMarkedRecords] = useState<MarkedRecord[]>([])

    useEffect(() => {
        loadStudents()
    }, [])

    const loadStudents = async () => {
        setLoading(true)
        setError(null)
        setNotClassTeacher(false)
        setAttendanceMarked(false)
        setMarkedRecords([])

        try {
            const response = await api.get('/attendance/teacher/students')
            const data = response.data
            setStudents(data.students)
            setClassInfo({ class: data.class, section: data.section })

            // Check if attendance is already marked for today
            const today = new Date().toISOString().split('T')[0]
            try {
                const attendanceResponse = await api.get('/attendance/teacher/attendance', {
                    params: {
                        date: today,
                        class: data.class,
                        section: data.section,
                    },
                })

                // If we have records for today, attendance is already marked
                if (attendanceResponse.data.records && attendanceResponse.data.records.length > 0) {
                    setAttendanceMarked(true)
                    setMarkedRecords(attendanceResponse.data.records)
                    return
                }
            } catch (err) {
                // If error fetching attendance, assume not marked yet
                console.log('No attendance found for today')
            }

            // Pre-check all students as present
            const defaultAttendance: Record<string, 'present' | 'absent'> = {}
            data.students.forEach((student: Student) => {
                defaultAttendance[student.id] = 'present'
            })
            setAttendance(defaultAttendance)
        } catch (err: any) {
            // Check for NOT_CLASS_TEACHER error
            if (
                err.response?.data?.message?.includes('not assigned as a class teacher') ||
                err.response?.data?.code === 'NOT_CLASS_TEACHER'
            ) {
                setNotClassTeacher(true)
            } else {
                setError(err.response?.data?.message || 'Failed to load students')
            }
        } finally {
            setLoading(false)
        }
    }

    const toggleStatus = (studentId: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
        }))
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setError(null)

        try {
            const attendanceArray: AttendanceRecord[] = students.map(student => ({
                studentId: student.id,
                status: attendance[student.id],
            }))

            const today = new Date().toISOString().split('T')[0]

            await api.post('/attendance/teacher/attendance', {
                date: today,
                attendance: attendanceArray,
            })

            toast({
                title: 'Success!',
                description: 'Attendance marked successfully!',
            })

            loadStudents()
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to submit attendance'

            if (errorMessage.includes('future date') || err.response?.data?.code === 'FUTURE_DATE') {
                toast({
                    title: 'Invalid Date',
                    description: 'Cannot mark attendance for future dates. Please check your device date and time settings.',
                    variant: 'destructive',
                })
            } else {
                setError(errorMessage)
                toast({
                    title: 'Error',
                    description: errorMessage,
                    variant: 'destructive',
                })
            }
        } finally {
            setSubmitting(false)
        }
    }

    const presentCount = Object.values(attendance).filter(status => status === 'present').length
    const absentCount = students.length - presentCount

    const formatDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    // Not a class teacher state
    if (notClassTeacher) {
        return (
            <div className="min-h-screen bg-[#E5E1DD] dark:bg-zinc-950 flex items-center justify-center p-8">
                <Card className="max-w-md w-full text-center shadow-lg">
                    <CardContent className="pt-8 pb-8 space-y-4">
                        <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Class Teacher Access Required
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            You are not assigned as a class teacher. Please contact your administrator to get assigned to a class before marking attendance.
                        </p>
                        <GlassButton onClick={loadStudents} className="mt-4">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </GlassButton>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Attendance already marked state - show student list with status
    if (attendanceMarked && markedRecords.length > 0) {
        const markedPresentCount = markedRecords.filter(r => r.status === 'present').length
        const markedAbsentCount = markedRecords.length - markedPresentCount

        return (
            <div className="min-h-screen bg-[#E5E1DD] dark:bg-zinc-950 p-6 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-600 dark:bg-green-700 rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                    Today's Attendance
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {classInfo.class} - Section {classInfo.section}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                                ✓ Marked
                            </span>
                            <p className="text-gray-500 dark:text-gray-500">{formatDate()}</p>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <Card className="shadow-md">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                    <Users className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{markedRecords.length}</p>
                                    <p className="text-sm text-gray-500">Total</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <UserCheck className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                    <p className="text-2xl font-bold text-green-600">{markedPresentCount}</p>
                                    <p className="text-sm text-green-600">Present</p>
                                </div>
                                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <UserX className="h-6 w-6 mx-auto mb-2 text-red-600" />
                                    <p className="text-2xl font-bold text-red-600">{markedAbsentCount}</p>
                                    <p className="text-sm text-red-600">Absent</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Students List */}
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Students</CardTitle>
                            <CardDescription>
                                Attendance status for today
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {markedRecords.map(record => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between py-4 px-2"
                                    >
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {record.student_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {record.student_email}
                                            </p>
                                        </div>
                                        <div
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${record.status === 'present'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                }`}
                                        >
                                            {record.status === 'present' ? 'Present' : 'Absent'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <GlassButton onClick={loadStudents} className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </GlassButton>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#E5E1DD] dark:bg-zinc-950 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-zinc-900 dark:bg-zinc-800 rounded-xl">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                Mark Attendance
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {classInfo.class} - Section {classInfo.section}
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-500">{formatDate()}</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Summary Card */}
                <Card className="shadow-md">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                <Users className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
                                <p className="text-sm text-gray-500">Total</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <UserCheck className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                                <p className="text-sm text-green-600">Present</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <UserX className="h-6 w-6 mx-auto mb-2 text-red-600" />
                                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                                <p className="text-sm text-red-600">Absent</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Students List */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Students</CardTitle>
                            <CardDescription>
                                All students are marked present. Tap to mark absent.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {students.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => toggleStatus(student.id)}
                                        className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors rounded-lg -mx-2"
                                    >
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {student.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Section {student.section}
                                            </p>
                                        </div>
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${attendance[student.id] === 'present'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500'
                                                }`}
                                        >
                                            {attendance[student.id] === 'present' && (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submit Button */}
                {!loading && students.length > 0 && (
                    <GlassButton
                        onClick={handleSubmit}
                        disabled={submitting}
                        size="lg"
                        className="w-full"
                        contentClassName="w-full flex items-center justify-center gap-2 text-lg font-semibold"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <UserCheck className="h-5 w-5" />
                                Submit Attendance
                            </>
                        )}
                    </GlassButton>
                )}
            </div>
        </div>
    )
}
