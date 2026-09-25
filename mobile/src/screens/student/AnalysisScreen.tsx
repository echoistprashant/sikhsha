import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { MOCK_RESULTS, calculateAnalysisData } from '../../api/mockData';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
    backgroundGradientFrom: '#1e293b',
    backgroundGradientTo: '#0f172a',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: '5',
        strokeWidth: '2',
        stroke: '#38bdf8',
    },
};

const pieColors = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

const AnalysisScreen: React.FC = () => {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analysisData, setAnalysisData] = useState<ReturnType<typeof calculateAnalysisData> | null>(null);

    useEffect(() => {
        // Simulate loading data
        const loadData = async () => {
            setLoading(true);
            // In real app, fetch from API
            await new Promise<void>(resolve => setTimeout(resolve, 500));
            const data = calculateAnalysisData(MOCK_RESULTS);
            setAnalysisData(data);
            setLoading(false);
        };

        loadData();
    }, []);

    if (!token || user?.role !== 'student') {
        return (
            <GlassScreen>
                <View style={styles.centerMessage}>
                    <Text style={styles.title}>Student access required</Text>
                    <Text style={styles.subtitle}>
                        Please log in with a student account to view analysis.
                    </Text>
                </View>
            </GlassScreen>
        );
    }

    if (loading || !analysisData) {
        return (
            <GlassScreen>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#e5e7eb" />
                    <Text style={styles.loadingText}>Loading your performance data...</Text>
                </View>
            </GlassScreen>
        );
    }

    // Prepare data for Line Chart
    const lineChartData = {
        labels: analysisData.performanceTrend.map((_, i) => `E${i + 1}`),
        datasets: [
            {
                data: analysisData.performanceTrend.map(item => item.percentage),
                color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
                strokeWidth: 2,
            },
        ],
        legend: ['Performance %'],
    };

    // Prepare data for Pie Chart
    const pieChartData = Object.entries(analysisData.subjectAverages).map(([subject, avg], index) => ({
        name: subject,
        population: Math.round(avg),
        color: pieColors[index % pieColors.length],
        legendFontColor: '#e5e7eb',
        legendFontSize: 12,
    }));

    return (
        <GlassScreen>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.heading}>Performance Analysis</Text>
                <Text style={styles.subtitle}>
                    Track your academic progress and identify areas for improvement.
                </Text>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statLabel}>Average Score</Text>
                        <Text style={styles.statValue}>{analysisData.averageScore.toFixed(1)}%</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Exams</Text>
                        <Text style={styles.statValue}>{analysisData.totalExams}</Text>
                    </GlassCard>
                </View>

                <View style={styles.statsRow}>
                    <GlassCard style={[styles.statCard, styles.fullWidth]}>
                        <Text style={styles.statLabel}>Best Subject</Text>
                        <Text style={styles.statValueHighlight}>{analysisData.bestSubject}</Text>
                    </GlassCard>
                </View>

                {/* Performance Trend Chart */}
                <GlassCard style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Performance Trend</Text>
                    <Text style={styles.chartSubtitle}>Your exam scores over time</Text>
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={lineChartData}
                            width={screenWidth - 64}
                            height={200}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                            fromZero
                            yAxisSuffix="%"
                        />
                    </View>
                </GlassCard>

                {/* Subject Distribution Chart */}
                <GlassCard style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Subject Distribution</Text>
                    <Text style={styles.chartSubtitle}>Average scores by subject</Text>
                    <View style={styles.pieContainer}>
                        <PieChart
                            data={pieChartData}
                            width={screenWidth - 64}
                            height={200}
                            chartConfig={chartConfig}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                </GlassCard>

                {/* Subject Breakdown */}
                <GlassCard style={styles.breakdownCard}>
                    <Text style={styles.chartTitle}>Subject Breakdown</Text>
                    {Object.entries(analysisData.subjectAverages).map(([subject, avg], index) => (
                        <View key={subject} style={styles.breakdownItem}>
                            <View style={[styles.colorDot, { backgroundColor: pieColors[index % pieColors.length] }]} />
                            <Text style={styles.breakdownSubject}>{subject}</Text>
                            <Text style={styles.breakdownValue}>{avg.toFixed(1)}%</Text>
                        </View>
                    ))}
                </GlassCard>
            </ScrollView>
        </GlassScreen>
    );
};

const styles = StyleSheet.create({
    scroll: {
        paddingVertical: 16,
        paddingHorizontal: 4,
    },
    heading: {
        fontSize: 22,
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#9ca3af',
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
    },
    fullWidth: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#e5e7eb',
    },
    statValueHighlight: {
        fontSize: 24,
        fontWeight: '800',
        color: '#38bdf8',
    },
    chartCard: {
        marginBottom: 16,
        paddingBottom: 8,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#e5e7eb',
        marginBottom: 4,
    },
    chartSubtitle: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 12,
    },
    chartContainer: {
        alignItems: 'center',
        marginHorizontal: -8,
    },
    chart: {
        borderRadius: 16,
    },
    pieContainer: {
        alignItems: 'center',
        marginHorizontal: -8,
    },
    breakdownCard: {
        marginBottom: 24,
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(75, 85, 99, 0.3)',
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    breakdownSubject: {
        flex: 1,
        fontSize: 14,
        color: '#f9fafb',
    },
    breakdownValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#38bdf8',
    },
    centerMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: 6,
    },
});

export default AnalysisScreen;
