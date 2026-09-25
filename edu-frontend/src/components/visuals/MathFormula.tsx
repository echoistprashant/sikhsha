'use client'

import React, { useEffect } from 'react'
import 'katex/dist/katex.min.css'

interface MathFormulaProps {
    equations: string[]
    displayMode?: 'inline' | 'block'
    className?: string
}

export function MathFormula({ equations, displayMode = 'block', className = '' }: MathFormulaProps) {
    const [renderedEquations, setRenderedEquations] = React.useState<string[]>([])
    const [error, setError] = React.useState<string | null>(null)

    useEffect(() => {
        const renderMath = async () => {
            try {
                // Dynamically import katex to avoid SSR issues
                const katex = (await import('katex')).default

                const rendered = equations.map((eq) => {
                    try {
                        return katex.renderToString(eq, {
                            throwOnError: false,
                            displayMode: displayMode === 'block',
                            output: 'html',
                        })
                    } catch (err) {
                        console.error(`Failed to render equation: ${eq}`, err)
                        return `<span class="text-red-500">Error: ${eq}</span>`
                    }
                })

                setRenderedEquations(rendered)
            } catch (err) {
                console.error('Failed to load KaTeX:', err)
                setError('Failed to load math renderer')
            }
        }

        renderMath()
    }, [equations, displayMode])

    if (error) {
        return (
            <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
                <p className="text-red-600 text-sm">{error}</p>
                <p className="text-xs text-red-500 mt-2">Equations: {equations.join(', ')}</p>
            </div>
        )
    }

    if (displayMode === 'block') {
        return (
            <div className={`math-block space-y-4 ${className}`}>
                {renderedEquations.map((html, index) => (
                    <div
                        key={index}
                        className="p-4 bg-blue-50 rounded-lg border border-blue-100 overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className={`math-inline flex flex-wrap gap-3 items-center ${className}`}>
            {renderedEquations.map((html, index) => (
                <span
                    key={index}
                    className="inline-block px-2 py-1 bg-blue-50 rounded border border-blue-100"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            ))}
        </div>
    )
}
