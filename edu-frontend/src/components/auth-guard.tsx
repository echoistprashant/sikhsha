'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
    children: React.ReactNode
    requiredRole?: 'student' | 'teacher' | 'admin'
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check localStorage for token since zustand might not be hydrated yet
        const token = localStorage.getItem('auth_token')
        const storedUser = localStorage.getItem('user')

        if (!token || !storedUser) {
            // Not authenticated, redirect to login
            router.push('/login')
            return
        }

        // Check role if required
        if (requiredRole) {
            try {
                const parsedUser = JSON.parse(storedUser)
                if (parsedUser.role !== requiredRole) {
                    // Wrong role, redirect to dashboard
                    router.push('/dashboard')
                    return
                }
            } catch {
                router.push('/login')
                return
            }
        }

        setIsLoading(false)
    }, [router, requiredRole])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
