'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { LayoutDashboard, LogOut, School, Users, Activity } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, logout } = useAuthStore()

    useEffect(() => {
        if (!user) {
            router.push('/login')
        } else if (user.role !== 'super_admin') {
            router.push('/dashboard')
        }
    }, [user, router])

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    if (!user || user.role !== 'super_admin') {
        return null
    }

    const navItems = [
        { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/super-admin/schools', label: 'Tenants (Schools)', icon: School },
        { href: '/super-admin/users', label: 'Global Users', icon: Users },
        { href: '/super-admin/activity', label: 'System Logs', icon: Activity },
    ]

    return (
        <div className="min-h-screen bg-[#E5E1DD]">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-[#1F1F1F] text-white border-r border-zinc-800">
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-8">
                        <LayoutDashboard className="h-6 w-6 text-purple-500" />
                        <h1 className="text-xl font-bold tracking-tight text-white">Super Admin</h1>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || (item.href !== '/super-admin' && pathname?.startsWith(item.href + '/'))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-purple-500/20 text-purple-400 font-medium"
                                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", isActive && "text-purple-400")} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="pt-6 border-t border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-1">Logged in as master</p>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-zinc-400">{user.email}</p>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="mt-4 w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 min-h-screen bg-[#f3f4f6]">
                {children}
            </div>
        </div>
    )
}
