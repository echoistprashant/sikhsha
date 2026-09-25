'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Class {
    id: string
    name: string
    grade_level: string
    section: string
    class_teacher_id: string | null
    class_teacher_name: string | null
}

interface Teacher {
    id: string
    name: string
    email: string
}

export default function ClassesPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [classes, setClasses] = useState<Class[]>([])
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [classesRes, teachersRes] = await Promise.all([
                api.get('/admin/classes'),
                api.get('/admin/users', { params: { role: 'teacher' } })
            ])
            setClasses(classesRes.data)
            setTeachers(teachersRes.data.users || [])
        } catch (error) {
            console.error('Failed to load data:', error)
            toast({
                title: 'Error',
                description: 'Failed to load classes and teachers',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const assignTeacher = async (classId: string, teacherId: string) => {
        try {
            await api.put('/admin/classes/assign-teacher', { classId, teacherId })
            toast({
                title: 'Success',
                description: 'Teacher assigned successfully!'
            })
            loadData()
        } catch (error) {
            console.error('Failed to assign teacher:', error)
            toast({
                title: 'Error',
                description: 'Failed to assign teacher',
                variant: 'destructive'
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
                    </div>
                </div>

                {/* Classes Table */}
                {classes.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
                        <p className="text-gray-500">Please add classes to the database first</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Teacher</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {classes.map((cls) => (
                                    <tr key={cls.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cls.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{cls.grade_level}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{cls.section || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={cls.class_teacher_name ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                                {cls.class_teacher_name || 'Not assigned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                value={cls.class_teacher_id || ''}
                                                onChange={(e) => assignTeacher(cls.id, e.target.value)}
                                            >
                                                <option value="">Select teacher...</option>
                                                {teachers.map((teacher) => (
                                                    <option key={teacher.id} value={teacher.id}>
                                                        {teacher.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
