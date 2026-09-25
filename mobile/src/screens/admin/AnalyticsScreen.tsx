import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { BarChart2, TrendingUp, Users, Zap, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const CARD_BG = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.06)';

const METRICS = [
  { icon: Users, label: 'Total Users', value: '--', sub: 'Fetching live data...', color: PRIMARY },
  { icon: BarChart2, label: 'Deck Views', value: '--', sub: 'Last 30 days', color: '#a78bfa' },
  { icon: Zap, label: 'AI Calls', value: '--', sub: 'API usage', color: '#f59e0b' },
  { icon: TrendingUp, label: 'Growth Rate', value: '--', sub: 'Month over month', color: '#22c55e' },
];

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#f1f5f9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <BarChart2 size={20} color={PRIMARY} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Coming soon notice */}
        <View style={styles.noticeBanner}>
          <AlertCircle size={22} color={PRIMARY} />
          <View style={styles.noticeText}>
            <Text style={styles.noticeTitle}>Analytics Coming Soon</Text>
            <Text style={styles.noticeSub}>
              Advanced analytics and AI cost tracking are being finalized. Data shown below is illustrative.
            </Text>
          </View>
        </View>

        {/* Metric Cards */}
        <View style={styles.metricsGrid}>
          {METRICS.map(m => (
            <View key={m.label} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: m.color + '18' }]}>
                <m.icon size={22} color={m.color} />
              </View>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={[styles.metricVal, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.metricSub}>{m.sub}</Text>
            </View>
          ))}
        </View>

        {/* Placeholder Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Platform Activity</Text>
            <View style={styles.chartBadge}><Text style={styles.chartBadgeText}>COMING SOON</Text></View>
          </View>
          <View style={styles.chartPlaceholder}>
            <BarChart2 size={48} color="rgba(19,200,236,0.2)" />
            <Text style={styles.chartPlaceholderText}>
              Advanced charts and AI usage visualization are being developed.
            </Text>
          </View>
        </View>

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Analytics Now?</Text>
          <Text style={styles.contactSub}>
            Contact Sikhsha AI support to request early access to admin analytics for your organization.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  scroll: { padding: 20 },
  noticeBanner: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: 'rgba(19,200,236,0.08)', borderWidth: 1, borderColor: 'rgba(19,200,236,0.2)',
    borderRadius: 14, padding: 16, marginBottom: 24,
  },
  noticeText: { flex: 1 },
  noticeTitle: { color: '#f1f5f9', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  noticeSub: { color: '#94a3b8', fontSize: 12, lineHeight: 18 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  metricCard: {
    width: '47%', backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
    borderRadius: 16, padding: 16, gap: 6,
  },
  metricIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  metricLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '500' },
  metricVal: { fontSize: 26, fontWeight: '800' },
  metricSub: { color: '#475569', fontSize: 10 },
  chartCard: {
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
    borderRadius: 16, padding: 20, marginBottom: 16,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  chartTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  chartBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  chartBadgeText: { color: '#64748b', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  chartPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  chartPlaceholderText: { color: '#475569', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  contactCard: {
    backgroundColor: 'rgba(19,200,236,0.06)', borderWidth: 1, borderColor: 'rgba(19,200,236,0.15)',
    borderRadius: 14, padding: 18,
  },
  contactTitle: { color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 6 },
  contactSub: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
});

export default AnalyticsScreen;
