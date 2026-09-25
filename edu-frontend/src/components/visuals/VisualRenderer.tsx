'use client'

import React from 'react'
import { MermaidDiagram } from './MermaidDiagram'
import { ChartDisplay } from './ChartDisplay'
import { MathFormula } from './MathFormula'
import { StockPhoto } from './StockPhoto'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

interface VisualRendererProps {
    visualMetadata: {
        visualType?: string
        visualConfig?: any
        confidence?: number
        generatedBy?: string
        reasoning?: string
        imageQuery?: string
    }
    showMetadata?: boolean
    className?: string
}

export function VisualRenderer({
    visualMetadata,
    showMetadata = false,
    className = ''
}: VisualRendererProps) {
    const [showDebug, setShowDebug] = React.useState(false)

    if (!visualMetadata || !visualMetadata.visualType) {
        return null
    }

    const { visualType, visualConfig, confidence, generatedBy, reasoning, imageQuery } = visualMetadata
    const generatedData = visualConfig?.generatedData || {}

    // Render appropriate visual component
    const renderVisual = () => {
        try {
            switch (visualType) {
                case 'diagram':
                    if (generatedBy === 'mermaid' && generatedData.code) {
                        return (
                            <MermaidDiagram
                                code={generatedData.code}
                                diagramType={generatedData.diagramType}
                                className={className}
                            />
                        )
                    }
                    break

                case 'chart':
                    if (generatedBy === 'chartjs' && generatedData.config) {
                        return (
                            <ChartDisplay
                                config={generatedData.config}
                                chartType={generatedData.chartType || 'bar'}
                                quickChartUrl={generatedData.quickChartUrl}
                                className={className}
                            />
                        )
                    }
                    break

                case 'math':
                    if (generatedBy === 'latex' && generatedData.equations) {
                        return (
                            <MathFormula
                                equations={generatedData.equations}
                                displayMode={generatedData.displayMode || 'block'}
                                className={className}
                            />
                        )
                    }
                    break

                case 'stock_photo': {
                    const query = imageQuery || visualConfig?.imageQuery || generatedData?.imageQuery
                    if (query) {
                        return (
                            <StockPhoto
                                imageQuery={query}
                                className={`h-full w-full ${className}`}
                            />
                        )
                    }
                    break
                }

                default:
                    return null
            }
        } catch (error) {
            console.error('Visual rendering error:', error)
            return (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Failed to render {visualType} visual
                    </p>
                </div>
            )
        }

        return null
    }

    const visual = renderVisual()

    if (!visual) {
        return null
    }

    return (
        <div className="visual-renderer my-4">
            {visual}

            {/* Optional metadata badge */}
            {showMetadata && (
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {generatedBy}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {confidence}% confident
                        </span>
                    </div>

                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                        {showDebug ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        {showDebug ? 'Hide' : 'Show'} details
                    </button>
                </div>
            )}

            {/* Debug information */}
            {showMetadata && showDebug && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-2">
                    <div>
                        <span className="font-semibold">Visual Type:</span> {visualType}
                    </div>
                    <div>
                        <span className="font-semibold">Generated By:</span> {generatedBy}
                    </div>
                    <div>
                        <span className="font-semibold">Confidence:</span> {confidence}%
                    </div>
                    {reasoning && (
                        <div>
                            <span className="font-semibold">Reasoning:</span> {reasoning}
                        </div>
                    )}
                    <details className="mt-2">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            View configuration
                        </summary>
                        <pre className="mt-2 p-2 bg-white rounded border border-gray-200 overflow-x-auto text-xs">
                            {JSON.stringify(visualConfig, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    )
}
