'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import { Search, Trash2, Edit, UserPlus, ArrowLeft, Upload, Download } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface User {
    id: string
    name: string
    email: string
    role: 'student' | 'teacher' | 'admin'
    grade_level?: string
    section?: string
    class_teacher_of?: string
    assigned_section?: string
    subjects_teaching?: string
    department?: string
    created_at: string
    joining_date?: string
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [userToEdit, setUserToEdit] = useState<User | null>(null)
    const [editName, setEditName] = useState('')
    const [editGradeLevel, setEditGradeLevel] = useState('')
    const [editSection, setEditSection] = useState('')
    const [editClassTeacherOf, setEditClassTeacherOf] = useState('')
    const [editAssignedSection, setEditAssignedSection] = useState('')
    const [editSubjects, setEditSubjects] = useState<string[]>([])
    const [editJoiningDate, setEditJoiningDate] = useState('')
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [newUserName, setNewUserName] = useState('')
    const [newUserEmail, setNewUserEmail] = useState('')
    const [newUserRole, setNewUserRole] = useState<string>('student')
    const [newUserGradeLevel, setNewUserGradeLevel] = useState('')
    const [newUserSection, setNewUserSection] = useState('')
    const [newUserDepartment, setNewUserDepartment] = useState('')
    const [newUserSubjects, setNewUserSubjects] = useState<string[]>([])
    const [newUserJoiningDate, setNewUserJoiningDate] = useState('')
    const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false)
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const { toast } = useToast()

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const params: any = {}
            if (search) params.search = search
            if (roleFilter !== 'all') params.role = roleFilter
            // Add timestamp to prevent browser caching (fixes 304 Not Modified issue)
            params._t = new Date().getTime()

            const response = await api.get('/admin/users', { params })
            setUsers(response.data.users)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to fetch users',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [roleFilter])

    const handleSearch = () => {
        fetchUsers()
    }

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return

        try {
            await api.delete(`/api/admin/users/${userToDelete.id}`)
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            })
            fetchUsers()
            setDeleteDialogOpen(false)
            setUserToDelete(null)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete user',
                variant: 'destructive',
            })
        }
    }

    const handleEditClick = (user: User) => {
        setUserToEdit(user)
        setEditName(user.name)
        setEditGradeLevel(user.grade_level || '')
        setEditSection(user.section || '')
        setEditClassTeacherOf(user.class_teacher_of || '')
        setEditAssignedSection(user.assigned_section || '')
        setEditSubjects(user.subjects_teaching ? user.subjects_teaching.split(',') : [])
        setEditJoiningDate(user.joining_date ? new Date(user.joining_date).toISOString().split('T')[0] : '')
        setEditDialogOpen(true)
    }

    const handleEditConfirm = async () => {
        if (!userToEdit) return

        try {
            const updateData: any = {
                name: editName,
                joining_date: editJoiningDate || null,
            }

            if (userToEdit.role === 'student') {
                updateData.grade_level = editGradeLevel
                updateData.section = editSection
            } else if (userToEdit.role === 'teacher') {
                updateData.class_teacher_of = editClassTeacherOf
                updateData.assigned_section = editAssignedSection
                updateData.subjects_teaching = editSubjects.length > 0 ? editSubjects.join(',') : null
            }

            await api.put(`/api/admin/users/${userToEdit.id}`, updateData)
            toast({
                title: 'Success',
                description: 'User updated successfully',
            })
            // Force refresh by resetting filter briefly or just calling fetch
            setUsers([]) // Clear list to show loading state if needed or just to force change
            fetchUsers()
            setEditDialogOpen(false)
            setUserToEdit(null)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update user',
                variant: 'destructive',
            })
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800'
            case 'teacher': return 'bg-blue-100 text-blue-800'
            case 'student': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const handleCreateClick = () => {
        setNewUserName('')
        setNewUserEmail('')
        setNewUserRole('student')
        setNewUserGradeLevel('')
        setNewUserSection('')
        setNewUserDepartment('')
        setNewUserDepartment('')
        setNewUserSubjects([])
        setNewUserJoiningDate(new Date().toISOString().split('T')[0]) // Default to today
        setCreateDialogOpen(true)
    }

    const handleCreateConfirm = async () => {
        if (!newUserName || !newUserEmail || !newUserRole) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            })
            return
        }

        if (newUserRole === 'student' && !newUserGradeLevel) {
            toast({
                title: 'Error',
                description: 'Grade level is required for students',
                variant: 'destructive',
            })
            return
        }

        try {
            const createData: any = {
                name: newUserName,
                email: newUserEmail,
                role: newUserRole,
                joining_date: newUserJoiningDate,
            }

            if (newUserRole === 'student') {
                createData.grade_level = newUserGradeLevel
                createData.section = newUserSection
            } else if (newUserRole === 'teacher') {
                createData.subjects_teaching = newUserSubjects
            } else if (newUserRole === 'staff') {
                createData.department = newUserDepartment
            }

            const response = await api.post('/admin/users', createData)
            toast({
                title: 'Success',
                description: `User created successfully. Default password: ${response.data.defaultPassword}`,
                duration: 10000,
            })

            setUsers([]) // Clear list
            fetchUsers()
            setCreateDialogOpen(false)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create user',
                variant: 'destructive',
            })
        }
    }

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/admin/users/template', {
                responseType: 'blob',
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'user_import_template.csv')
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to download template',
                variant: 'destructive',
            })
        }
    }

    const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCsvFile(e.target.files[0])
        }
    }

    const handleBulkImport = async () => {
        if (!csvFile) {
            toast({
                title: 'Error',
                description: 'Please select a CSV file',
                variant: 'destructive',
            })
            return
        }

        setImporting(true)
        try {
            const reader = new FileReader()
            reader.onload = async (e) => {
                const csvData = e.target?.result as string
                const response = await api.post('/admin/users/bulk-import', { csvData })

                toast({
                    title: 'Import Complete',
                    description: `${response.data.success} users created successfully. ${response.data.failed} failed.`,
                    duration: 10000,
                })
                fetchUsers()
                setBulkImportDialogOpen(false)
                setCsvFile(null)
            }
            reader.readAsText(csvFile)
        } catch (error: any) {
            toast({
                title: 'Import Failed',
                description: error.response?.data?.message || 'Failed to import users',
                variant: 'destructive',
            })
        } finally {
            setImporting(false)
        }
    }

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
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-2">Manage all users on the platform</p>
                </div>
            </div>

            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-full md:w-auto">
                            <TabsList className="grid grid-cols-4 w-auto">
                                <TabsTrigger value="all" className="px-6">
                                    All Users
                                </TabsTrigger>
                                <TabsTrigger value="student" className="px-6">
                                    Students
                                </TabsTrigger>
                                <TabsTrigger value="teacher" className="px-6">
                                    Teachers
                                </TabsTrigger>
                                <TabsTrigger value="admin" className="px-6">
                                    Admins
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="flex-1 flex gap-2 ml-4">
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} variant="outline">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                            <Button onClick={() => setBulkImportDialogOpen(true)} variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Import CSV
                            </Button>
                            <Button onClick={handleDownloadTemplate} variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                CSV Template
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No users found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4">Name</th>
                                        <th className="text-left p-4">Email</th>
                                        <th className="text-left p-4">Role</th>
                                        <th className="text-left p-4">Grade/Section</th>
                                        <th className="text-left p-4">Date of Joining</th>
                                        <th className="text-right p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4 font-medium">{user.name}</td>
                                            <td className="p-4 text-gray-600">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {user.role === 'student' && user.grade_level ? `${user.grade_level} - ${user.section || 'No Section'}` : ''}
                                                {user.role === 'teacher' && user.class_teacher_of ? `Class Teacher: ${user.class_teacher_of} - ${user.assigned_section || 'No Section'}` : ''}
                                                {user.role === 'admin' ? 'Administrator' : ''}
                                                {!user.grade_level && !user.class_teacher_of && user.role !== 'admin' ? '-' : ''}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {user.joining_date ? new Date(user.joining_date).toLocaleDateString() : new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditClick(user)}
                                                    >
                                                        <Edit className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(user)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information for <strong>{userToEdit?.name}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Name field for all users */}
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Enter name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Joining</Label>
                            <Input
                                type="date"
                                value={editJoiningDate}
                                onChange={(e) => setEditJoiningDate(e.target.value)}
                            />
                        </div>

                        {/* Student-specific fields */}
                        {userToEdit?.role === 'student' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Grade/Class</Label>
                                    <Select value={editGradeLevel} onValueChange={setEditGradeLevel}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Class 8">Class 8</SelectItem>
                                            <SelectItem value="Class 9">Class 9</SelectItem>
                                            <SelectItem value="Class 10">Class 10</SelectItem>
                                            <SelectItem value="Class 11">Class 11</SelectItem>
                                            <SelectItem value="Class 12">Class 12</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Section</Label>
                                    <Select value={editSection} onValueChange={setEditSection}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">Section A</SelectItem>
                                            <SelectItem value="B">Section B</SelectItem>
                                            <SelectItem value="C">Section C</SelectItem>
                                            <SelectItem value="D">Section D</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        {/* Teacher-specific fields */}
                        {userToEdit?.role === 'teacher' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Class Teacher Of</Label>
                                    <Select value={editClassTeacherOf} onValueChange={setEditClassTeacherOf}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">None</SelectItem>
                                            <SelectItem value="Class 8">Class 8</SelectItem>
                                            <SelectItem value="Class 9">Class 9</SelectItem>
                                            <SelectItem value="Class 10">Class 10</SelectItem>
                                            <SelectItem value="Class 11">Class 11</SelectItem>
                                            <SelectItem value="Class 12">Class 12</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Assigned Section</Label>
                                    <Select value={editAssignedSection} onValueChange={setEditAssignedSection}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">None</SelectItem>
                                            <SelectItem value="A">Section A</SelectItem>
                                            <SelectItem value="B">Section B</SelectItem>
                                            <SelectItem value="C">Section C</SelectItem>
                                            <SelectItem value="D">Section D</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subjects Teaching</Label>
                                    <div className="border rounded p-3 max-h-40 overflow-y-auto">
                                        {['Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics'].map((subject) => (
                                            <label key={subject} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={editSubjects.includes(subject)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setEditSubjects([...editSubjects, subject])
                                                        } else {
                                                            setEditSubjects(editSubjects.filter(s => s !== subject))
                                                        }
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="text-sm">{subject}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {editSubjects.length > 0 && (
                                        <p className="text-sm text-gray-600">
                                            Selected: {editSubjects.join(', ')}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditConfirm}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create User Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>Add a new user to the system. A default password will be generated.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name *</Label>
                                <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@example.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Joining</Label>
                            <Input
                                type="date"
                                value={newUserJoiningDate}
                                onChange={(e) => setNewUserJoiningDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role *</Label>
                            <Select value={newUserRole} onValueChange={setNewUserRole}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {newUserRole === 'student' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Grade Level *</Label>
                                    <Input value={newUserGradeLevel} onChange={(e) => setNewUserGradeLevel(e.target.value)} placeholder="e.g., Class 10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Section</Label>
                                    <Input value={newUserSection} onChange={(e) => setNewUserSection(e.target.value)} placeholder="e.g., A" />
                                </div>
                            </div>
                        )}
                        {newUserRole === 'teacher' && (
                            <div className="space-y-2">
                                <Label>Subjects Teaching (comma-separated)</Label>
                                <Input value={newUserSubjects.join(',')} onChange={(e) => setNewUserSubjects(e.target.value.split(',').map(s => s.trim()))} placeholder="e.g., Math, Physics" />
                            </div>
                        )}
                        <div className="bg-blue-50 p-4 rounded border border-blue-200">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> A default password will be generated for this user. They will be notified and can change it after first login.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateConfirm} className="bg-blue-600 hover:bg-blue-700">Create User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CSV Import Dialog */}
            <Dialog open={bulkImportDialogOpen} onOpenChange={setBulkImportDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Bulk Import Users</DialogTitle>
                        <DialogDescription>Upload a CSV file to import multiple users at once</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>CSV File</Label>
                            <Input type="file" accept=".csv" onChange={handleCsvFileChange} />
                            {csvFile && (
                                <p className="text-sm text-gray-600">Selected: {csvFile.name}</p>
                            )}
                        </div>
                        <div className="bg-amber-50 p-4 rounded border border-amber-200">
                            <p className="text-sm font-medium text-amber-900 mb-2">CSV Format Requirements:</p>
                            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                                <li>Required columns: name, email, role</li>
                                <li>For students: grade_level is required, section is optional</li>
                                <li>For teachers: subjects_teaching (semicolon-separated)</li>
                                <li>Default password "welcome@123" will be set for all users</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkImportDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkImport} disabled={!csvFile || importing} className="bg-green-600 hover:bg-green-700">
                            {importing ? 'Importing...' : 'Import Users'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
