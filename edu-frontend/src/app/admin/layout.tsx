'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import Sidebar from '@/components/dashboard/sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user } = useAuthStore()

    useEffect(() => {
        if (!user) {
            router.push('/login')
        } else if (user.role !== 'admin') {
            router.push('/dashboard')
        }
    }, [user, router])

    if (!user || user.role !== 'admin') {
        return null
    }

    return (
        <div className="flex min-h-screen bg-[#E5E1DD] dark:bg-zinc-950">
            <Sidebar role="admin" />
            <main className="flex-1 overflow-auto">
                <div className="p-8 min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    )
}
