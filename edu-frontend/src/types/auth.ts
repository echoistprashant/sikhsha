export interface User {
    id: string
    email: string
    name: string
    role: 'teacher' | 'student' | 'admin' | 'super_admin'
    school_id?: string
    grade_level?: string
    section?: string
    class_teacher_of?: string
    assigned_section?: string
    created_at: string
}

export interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => void
    setUser: (user: User) => void
}

export interface RegisterData {
    name: string
    email: string
    password: string
    role: 'teacher' | 'student' | 'admin' | 'super_admin'
    school_id?: string
    grade_level?: string
    section?: string
    subjects_teaching?: string[]
}
