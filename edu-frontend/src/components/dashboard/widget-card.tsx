'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ChevronRight, Loader2 } from 'lucide-react'

interface WidgetCardProps {
    title: string
    icon: React.ReactNode
    href?: string
    loading?: boolean
    error?: string | null
    badge?: string | number
    badgeVariant?: 'default' | 'warning' | 'danger' | 'success'
    children: React.ReactNode
    className?: string
    headerAction?: React.ReactNode
}

export default function WidgetCard({
    title,
    icon,
    href,
    loading = false,
    error = null,
    badge,
    badgeVariant = 'default',
    children,
    className,
    headerAction,
}: WidgetCardProps) {
    const badgeColors = {
        default: 'glass-badge',
        warning: 'glass-badge warning',
        danger: 'glass-badge danger',
        success: 'glass-badge success',
    }

    const content = (
        <Card
            className={cn(
                'h-full min-h-[280px] group transition-all duration-300 glass-card bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-800/50',
                href && 'cursor-pointer hover:shadow-xl hover:shadow-emerald-500/5',
                className
            )}
        >
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-[#1F1F1F] dark:bg-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                            <div className="text-white dark:text-[#1F1F1F]">
                                {icon}
                            </div>
                        </div>
                        <CardTitle className="text-base font-bold text-[#1F1F1F] dark:text-zinc-100 pl-1">
                            {title}
                        </CardTitle>
                        {badge !== undefined && (
                            <span className={cn('px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm', badgeColors[badgeVariant])}>
                                {badge}
                            </span>
                        )}
                    </div>
                    {href && (
                        <ChevronRight className="h-4 w-4 text-zinc-400 dark:text-zinc-500 group-hover:text-[#4CAF50] group-hover:translate-x-1 transition-all" />
                    )}
                    {headerAction && !href && headerAction}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50] opacity-70" />
                    </div>
                ) : error ? (
                    <div className="py-4 text-center">
                        <p className="text-sm text-red-500">{error}</p>
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    )

    if (href) {
        return <Link href={href}>{content}</Link>
    }

    return content
}
