import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-xl border border-white/50 bg-white/40 px-4 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800/50 dark:bg-zinc-900/40 dark:text-zinc-100 dark:placeholder:text-zinc-400 backdrop-blur-md",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
GlassInput.displayName = "GlassInput"

export interface GlassTextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[100px] w-full rounded-xl border border-white/50 bg-white/40 px-4 py-3 text-sm shadow-sm transition-all placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4CAF50] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800/50 dark:bg-zinc-900/40 dark:text-zinc-100 dark:placeholder:text-zinc-400 backdrop-blur-md",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
GlassTextarea.displayName = "GlassTextarea"

export { GlassInput, GlassTextarea }
