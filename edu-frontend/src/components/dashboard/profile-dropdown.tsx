'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'

export default function ProfileDropdown() {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const { user, logout } = useAuthStore()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (!user) return null

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="glass"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 h-10 px-2 rounded-full"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(user.name)}
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 glass-dropdown">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                {getInitials(user.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <div className="mt-2 px-2 py-1 rounded-md text-xs font-medium capitalize inline-block glass-badge">
                            {user.role}
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <span>View Profile</span>
                        </button>
                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            <Settings className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <span>Settings</span>
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-1">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
