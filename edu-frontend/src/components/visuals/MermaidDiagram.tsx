'use client'

import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
    code: string
    diagramType?: string
    className?: string
}

export function MermaidDiagram({ code, diagramType, className = '' }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [error, setError] = React.useState<string | null>(null)

    useEffect(() => {
        // Initialize mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        })

        const renderDiagram = async () => {
            if (!containerRef.current || !code) return

            try {
                setError(null)

                // Generate unique ID for this diagram
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

                // Render the diagram
                const { svg } = await mermaid.render(id, code)

                if (containerRef.current) {
                    containerRef.current.innerHTML = svg
                }
            } catch (err) {
                console.error('Mermaid rendering error:', err)
                setError('Failed to render diagram')
            }
        }

        renderDiagram()
    }, [code])

    if (error) {
        return (
            <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
                <p className="text-red-600 text-sm">{error}</p>
                <details className="mt-2">
                    <summary className="text-xs text-red-500 cursor-pointer">Show diagram code</summary>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                        {code}
                    </pre>
                </details>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className={`mermaid-container overflow-x-auto ${className}`}
            style={{ minHeight: '100px' }}
        />
    )
}
