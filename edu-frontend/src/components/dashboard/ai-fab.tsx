'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, X, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AiFabProps {
    userRole?: string
}

export default function AiFab({ userRole = 'user' }: AiFabProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)

    const suggestions = {
        student: [
            'Explain a concept to me',
            'Help me with homework',
            'Quiz me on a topic',
        ],
        teacher: [
            'Help me create a quiz',
            'Suggest teaching strategies',
            'Generate discussion questions',
        ],
        admin: [
            'Summarize today\'s activity',
            'Show attendance trends',
            'Draft a notice',
        ],
    }

    const currentSuggestions = suggestions[userRole as keyof typeof suggestions] || suggestions.student

    const handleSend = async () => {
        if (!query.trim()) return
        setLoading(true)
        // TODO: Integrate with AI service
        setTimeout(() => {
            setLoading(false)
            setQuery('')
        }, 1000)
    }

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* AI Panel */}
            <div
                className={cn(
                    'fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ease-out',
                    open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                            <p className="text-xs text-gray-500">Ask me anything</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </Button>
                </div>

                {/* Quick Suggestions */}
                <div className="p-4 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Quick actions</p>
                    <div className="flex flex-wrap gap-2">
                        {currentSuggestions.map((suggestion, i) => (
                            <button
                                key={i}
                                onClick={() => setQuery(suggestion)}
                                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-full transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your question..."
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={loading || !query.trim()}
                            className="h-9 w-9 p-0 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                            ) : (
                                <Send className="h-4 w-4 text-white" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* FAB Button */}
            <Button
                onClick={() => setOpen(!open)}
                className={cn(
                    'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-300',
                    'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
                    'hover:scale-110 hover:shadow-xl',
                    open && 'rotate-45'
                )}
            >
                <Sparkles className={cn('h-6 w-6 text-white transition-transform', open && 'rotate-45')} />

                {/* Pulse animation ring */}
                <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-25" />
            </Button>
        </>
    )
}
