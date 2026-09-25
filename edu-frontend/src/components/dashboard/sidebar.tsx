'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import {
    Home,
    GraduationCap,
    BookOpen,
    FileText,
    User,
    LayoutDashboard,
    BarChart3,
    Calendar,
    HelpCircle,
    FolderOpen,
    ClipboardList,
    Settings,
    LogOut,
} from 'lucide-react'

interface NavItem {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    children?: NavItem[]
}

interface SidebarProps {
    role: 'student' | 'teacher' | 'admin'
}

export const navItemsByRole: Record<string, NavItem[]> = {
    student: [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/student/doubt-solver', label: 'Doubt Solver', icon: HelpCircle },
        { href: '/student/history', label: 'Doubt History', icon: BookOpen },
        { href: '/student/weak-areas', label: 'Weak Areas', icon: BarChart3 },
    ],
    teacher: [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/teacher/attendance', label: 'Attendance', icon: Calendar },
        { href: '/teacher/deck-generator', label: 'Deck Generator', icon: GraduationCap },
        { href: '/teacher/activities', label: 'Activity Generator', icon: BookOpen },
        { href: '/teacher/lesson-planner', label: 'Lesson Planner', icon: FileText },
        // { href: '/teacher/topic-planner', label: 'Topic Planner', icon: ClipboardList },
        { href: '/teacher/question-generator', label: 'Questions', icon: ClipboardList },
        { href: '/teacher/my-content', label: 'My Content', icon: FolderOpen },
    ],
    admin: [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/admin/users', label: 'User Management', icon: User },
        { href: '/admin/teacher-content', label: 'Teacher Content', icon: FileText },
        { href: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
        { href: '/admin/attendance', label: 'Attendance', icon: Calendar },
    ],
}

const bottomNav: NavItem[] = [
    { href: '#', label: 'Settings', icon: Settings },
    { href: '#', label: 'Help Center', icon: HelpCircle },
]

export default function Sidebar({ role }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { logout } = useAuthStore()
    const navItems = navItemsByRole[role] || []

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    return (
        <aside
            className={cn(
                'sticky top-0 self-start shrink-0 h-screen flex flex-col bg-[#E5E1DD] dark:bg-zinc-900 border-r border-zinc-300/50 dark:border-zinc-800 transition-all duration-300 ease-in-out',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo/Brand */}
            <div className="h-16 flex items-center px-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
                {!collapsed && (
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold italic tracking-tight text-[#1F1F1F] dark:text-white">
                            Shiksha
                        </span>
                    </Link>
                )}
                {collapsed && (
                    <div className="w-8 h-8 mx-auto rounded-lg bg-[#1F1F1F] dark:bg-white flex items-center justify-center text-white dark:text-[#1F1F1F] font-bold text-sm">
                        S
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    'flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-200 cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-[#1F1F1F] dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800',
                                    collapsed && 'justify-center px-2',
                                    isActive && 'text-[#4CAF50] dark:text-[#4CAF50] font-semibold bg-emerald-50 dark:bg-emerald-950/20'
                                )}
                            >
                                <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-[#4CAF50]" : "text-zinc-500")} />
                                {!collapsed && <span className="text-sm">{item.label}</span>}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Navigation */}
            <div className="px-3 py-2 space-y-1 border-t border-zinc-100 dark:border-zinc-800">
                {bottomNav.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link key={item.label} href={item.href}>
                            <div
                                className={cn(
                                    'flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-200 cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800',
                                    collapsed && 'justify-center px-2'
                                )}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!collapsed && <span className="text-sm">{item.label}</span>}
                            </div>
                        </Link>
                    )
                })}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className={cn(
                        'flex items-center gap-3 w-full h-10 px-3 rounded-lg transition-all duration-200 cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        collapsed && 'justify-center px-2'
                    )}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm">Log out</span>}
                </button>
            </div>
        </aside>
    )
}
