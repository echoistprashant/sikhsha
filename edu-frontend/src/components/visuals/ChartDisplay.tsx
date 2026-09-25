'use client'

import React from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    ArcElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    ArcElement,
    PointElement,
    Title,
    Tooltip,
    Legend
)

interface ChartDisplayProps {
    config: any
    chartType: 'bar' | 'line' | 'pie' | 'scatter'
    quickChartUrl?: string
    className?: string
}

export function ChartDisplay({ config, chartType, quickChartUrl, className = '' }: ChartDisplayProps) {
    const [useImage, setUseImage] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // Fallback to QuickChart image if chart.js rendering fails
    const handleError = () => {
        if (quickChartUrl) {
            setUseImage(true)
        } else {
            setError('Failed to render chart')
        }
    }

    if (error) {
        return (
            <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
                <p className="text-yellow-700 text-sm">{error}</p>
            </div>
        )
    }

    // Use QuickChart image fallback
    if (useImage && quickChartUrl) {
        return (
            <div className={`chart-container ${className}`}>
                <img
                    src={quickChartUrl}
                    alt="Chart"
                    className="w-full h-auto rounded-lg border border-gray-200"
                    onError={() => setError('Failed to load chart image')}
                />
            </div>
        )
    }

    try {
        const chartData = config.data || { labels: [], datasets: [] }
        const chartOptions: ChartOptions<any> = {
            responsive: true,
            maintainAspectRatio: true,
            ...config.options,
        }

        return (
            <div className={`chart-container p-4 bg-white rounded-lg border border-gray-200 ${className}`}>
                {chartType === 'bar' && (
                    <Bar data={chartData} options={chartOptions} onError={handleError} />
                )}
                {chartType === 'line' && (
                    <Line data={chartData} options={chartOptions} onError={handleError} />
                )}
                {chartType === 'pie' && (
                    <Pie data={chartData} options={chartOptions} onError={handleError} />
                )}
            </div>
        )
    } catch (err) {
        handleError()
        return null
    }
}
