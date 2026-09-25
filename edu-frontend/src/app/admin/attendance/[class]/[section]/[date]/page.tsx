'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/lib/api-client'
import { ArrowLeft, CheckCircle, XCircle, Download } from 'lucide-react'

interface AttendanceRecord {
    id: string
    student_id: string
    student_name: string
    student_email: string
    status: string
    marked_at: string
}

export default function AttendanceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [records, setRecords] = useState<AttendanceRecord[]>([])
    const [classInfo, setClassInfo] = useState({ class: '', section: '', date: '' })

    useEffect(() => {
        if (params.class && params.section && params.date) {
            loadAttendanceDetails()
        }
    }, [params])

    const loadAttendanceDetails = async () => {
        setLoading(true)
        try {
            const classParam = params.class as string
            const sectionParam = params.section as string
            const dateParam = params.date as string

            const response = await apiClient.get(
                `/attendance/admin/attendance/${classParam}/${sectionParam}/${dateParam}`
            )

            setRecords(response.data.records || [])
            setClassInfo({
                class: response.data.class,
                section: response.data.section,
                date: response.data.date,
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load attendance details',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const presentStudents = records.filter(r => r.status === 'present')
    const absentStudents = records.filter(r => r.status === 'absent')

    const exportCSV = () => {
        const headers = ['Student Name', 'Email', 'Status', 'Marked At']
        const rows = records.map(r => [
            r.student_name,
            r.student_email,
            r.status,
            new Date(r.marked_at).toLocaleString(),
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(',')),
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance_${classInfo.class}_${classInfo.section}_${classInfo.date}.csv`
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
            title: 'Success',
            description: 'Attendance data exported to CSV',
        })
    }

    return (
        <div>
            <div className="mb-8">
                <Button onClick={() => router.push('/admin/attendance')} variant="ghost" className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Overview
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">
                    {classInfo.class} - Section {classInfo.section}
                </h1>
                <p className="text-gray-600 mt-2">
                    Attendance for {new Date(classInfo.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900">{records.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Present</p>
                                <p className="text-3xl font-bold text-green-600">{presentStudents.length}</p>
                            </div>
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Absent</p>
                                <p className="text-3xl font-bold text-red-600">{absentStudents.length}</p>
                            </div>
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end mb-4">
                <Button onClick={exportCSV} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Student Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Present Students */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">Present Students ({presentStudents.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : presentStudents.length === 0 ? (
                            <p className="text-gray-500 text-sm">No students marked present</p>
                        ) : (
                            <div className="space-y-3">
                                {presentStudents.map((record) => (
                                    <div key={record.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900">{record.student_name}</p>
                                            <p className="text-sm text-gray-600 truncate">{record.student_email}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Marked at {new Date(record.marked_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Absent Students */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-600">Absent Students ({absentStudents.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : absentStudents.length === 0 ? (
                            <p className="text-gray-500 text-sm">No students marked absent</p>
                        ) : (
                            <div className="space-y-3">
                                {absentStudents.map((record) => (
                                    <div key={record.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900">{record.student_name}</p>
                                            <p className="text-sm text-gray-600 truncate">{record.student_email}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Marked at {new Date(record.marked_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
