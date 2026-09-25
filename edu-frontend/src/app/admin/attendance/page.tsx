'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import { Calendar, Users, CheckCircle, XCircle, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ClassAttendance {
    class: string
    section: string
    total_students: number
    present_count: number
    absent_count: number
    attendance_percentage: number
}

interface TeacherPresence {
    present: Array<{ id: string; name: string; email: string }>
    absent: Array<{ id: string; name: string; email: string }>
}

export default function AdminAttendancePage() {
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    )
    const [classes, setClasses] = useState<ClassAttendance[]>([])
    const [teacherPresence, setTeacherPresence] = useState<TeacherPresence>({
        present: [],
        absent: [],
    })
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')
    const [selectedMonth, setSelectedMonth] = useState<string>(
        new Date().toISOString().slice(0, 7) // YYYY-MM format
    )
    const [monthlyData, setMonthlyData] = useState<any>(null)
    const { toast } = useToast()

    useEffect(() => {
        if (viewMode === 'daily') {
            loadAttendanceData()
        } else {
            loadMonthlyData()
        }
    }, [selectedDate, selectedMonth, viewMode])

    const loadAttendanceData = async () => {
        setLoading(true)
        try {
            const [attendanceRes, teacherRes] = await Promise.all([
                api.get(`/attendance/admin/attendance?date=${selectedDate}`),
                api.get(`/attendance/admin/teachers/presence?date=${selectedDate}`),
            ])

            setClasses(attendanceRes.data.classes || [])
            setTeacherPresence({
                present: teacherRes.data?.present || [],
                absent: teacherRes.data?.absent || [],
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load attendance data',
                variant: 'destructive',
            })
            setClasses([])
            setTeacherPresence({ present: [], absent: [] })
        } finally {
            setLoading(false)
        }
    }

    const loadMonthlyData = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/attendance/admin/monthly?month=${selectedMonth}`)
            setMonthlyData(response.data)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load monthly data',
                variant: 'destructive',
            })
            setMonthlyData(null)
        } finally {
            setLoading(false)
        }
    }

    const changeDate = (days: number) => {
        const current = new Date(selectedDate)
        current.setDate(current.getDate() + days)
        setSelectedDate(current.toISOString().split('T')[0])
    }

    const totalStudents = classes.reduce((sum, c) => sum + c.total_students, 0)
    const totalPresent = classes.reduce((sum, c) => sum + c.present_count, 0)
    const totalAbsent = classes.reduce((sum, c) => sum + c.absent_count, 0)
    const overallPercentage = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : 0

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance Overview</h1>
                    <p className="text-gray-600 mt-2">Monitor attendance across all classes</p>
                </div>
                <Select value={viewMode} onValueChange={(value: 'daily' | 'monthly') => setViewMode(value)}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily View</SelectItem>
                        <SelectItem value="monthly">Monthly View</SelectItem>
                    </SelectContent>
                </Select >
            </div >

            {/* Date/Month Selector */}
            < Card className="mb-6" >
                <CardContent className="pt-6">
                    {viewMode === 'daily' ? (
                        <div className="flex items-center justify-between">
                            <Button onClick={() => changeDate(-1)} variant="outline">
                                ← Previous Day
                            </Button>
                            <div className="text-center">
                                <div className="flex items-center gap-2 justify-center">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="text-lg font-semibold border rounded px-3 py-1"
                                    />
                                </div>
                                {selectedDate === new Date().toISOString().split('T')[0] && (
                                    <span className="text-sm text-green-600 font-medium">Today</span>
                                )}
                            </div>
                            <Button
                                onClick={() => changeDate(1)}
                                variant="outline"
                                disabled={selectedDate === new Date().toISOString().split('T')[0]}
                            >
                                Next Day →
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-4">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="text-lg font-semibold border rounded px-3 py-1"
                                max={new Date().toISOString().slice(0, 7)}
                            />
                        </div>
                    )}
                </CardContent>
            </Card >

            {/* Summary Cards */}
            {
                viewMode === 'monthly' && monthlyData ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Working Days</p>
                                        <p className="text-3xl font-bold text-gray-900">{monthlyData.summary.totalWorkingDays}</p>
                                    </div>
                                    <Calendar className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Present Days</p>
                                        <p className="text-3xl font-bold text-green-600">{monthlyData.summary.presentDays}</p>
                                    </div>
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{
                                            width: `${(monthlyData.summary.presentDays / monthlyData.summary.totalWorkingDays) * 100}%`
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Absent Days</p>
                                        <p className="text-3xl font-bold text-red-600">{monthlyData.summary.absentDays}</p>
                                    </div>
                                    <XCircle className="h-10 w-10 text-red-600" />
                                </div>
                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-600 h-2 rounded-full"
                                        style={{
                                            width: `${(monthlyData.summary.absentDays / monthlyData.summary.totalWorkingDays) * 100}%`
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Attendance %</p>
                                        <p className="text-3xl font-bold text-blue-600">{monthlyData.summary.attendancePercentage.toFixed(1)}%</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-bold">%</span>
                                    </div>
                                </div>
                                <div className="mt-2 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2rounded-full"
                                        style={{
                                            width: `${monthlyData.summary.attendancePercentage}%`
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : viewMode === 'daily' ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Students</p>
                                        <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
                                    </div>
                                    <Users className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Present</p>
                                        <p className="text-3xl font-bold text-green-600">{totalPresent}</p>
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
                                        <p className="text-3xl font-bold text-red-600">{totalAbsent}</p>
                                    </div>
                                    <XCircle className="h-10 w-10 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Attendance %</p>
                                        <p className="text-3xl font-bold text-blue-600">{overallPercentage}%</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-bold">%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : null
            }

            {/* Class-wise Attendance - Only show in daily view */}
            {
                viewMode === 'daily' && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Class-wise Attendance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : classes.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No attendance records found for this date
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-4">Class</th>
                                                <th className="text-left p-4">Section</th>
                                                <th className="text-center p-4">Total</th>
                                                <th className="text-center p-4">Present</th>
                                                <th className="text-center p-4">Absent</th>
                                                <th className="text-center p-4">Percentage</th>
                                                <th className="text-right p-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classes.map((classData) => (
                                                <tr key={`${classData.class}-${classData.section}`} className="border-b hover:bg-gray-50">
                                                    <td className="p-4 font-medium">{classData.class}</td>
                                                    <td className="p-4">Section {classData.section}</td>
                                                    <td className="p-4 text-center">{classData.total_students}</td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-green-600 font-semibold">
                                                            {classData.present_count}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-red-600 font-semibold">
                                                            {classData.absent_count}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`font-semibold ${Number(classData.attendance_percentage) >= 90 ? 'text-green-600' :
                                                            Number(classData.attendance_percentage) >= 75 ? 'text-yellow-600' :
                                                                'text-red-600'
                                                            }`}>
                                                            {Number(classData.attendance_percentage || 0).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Link
                                                            href={`/admin/attendance/${classData.class}/${classData.section}/${selectedDate}`}
                                                        >
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            }

            {/* Teacher Presence - Only show in daily view */}
            {
                viewMode === 'daily' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Teacher Presence</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-green-600 mb-3">
                                        Present ({teacherPresence?.present?.length || 0})
                                    </h3>
                                    {(teacherPresence?.present?.length || 0) === 0 ? (
                                        <p className="text-gray-500 text-sm">No teachers marked present</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {teacherPresence.present.map((teacher) => (
                                                <li key={teacher.id} className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>{teacher.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-red-600 mb-3">
                                        Absent ({teacherPresence?.absent?.length || 0})
                                    </h3>
                                    {(teacherPresence?.absent?.length || 0) === 0 ? (
                                        <p className="text-gray-500 text-sm">No teachers marked absent</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {teacherPresence.absent.map((teacher) => (
                                                <li key={teacher.id} className="flex items-center gap-2">
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                    <span>{teacher.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            }
        </div >
    )
}
