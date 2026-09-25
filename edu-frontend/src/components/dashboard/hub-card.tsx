'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HubCardProps {
    title: string
    description: string
    icon: LucideIcon
    href: string
    colorClass: string
    delay?: number
    onClick?: () => void
}

export const HubCard = ({
    title,
    description,
    icon: Icon,
    href,
    colorClass,
    delay = 0,
    onClick
}: HubCardProps) => {
    return (
        <motion.a
            href={href}
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn(
                "group relative overflow-hidden rounded-2xl p-6 transition-all glass-card"
            )}
        >
            <div className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5",
                colorClass
            )} />

            <div className="relative z-10 flex flex-col h-full">
                <div className={cn(
                    "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 glass-icon"
                )}>
                    <Icon className={cn("h-6 w-6", colorClass.replace('bg-', 'text-'))} />
                </div>

                <h3 className="mb-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {title}
                </h3>

                <p className="mb-6 flex-grow text-sm text-zinc-500 dark:text-zinc-400">
                    {description}
                </p>

                <div className="flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    <span>Access Module</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </motion.a>
    )
}
