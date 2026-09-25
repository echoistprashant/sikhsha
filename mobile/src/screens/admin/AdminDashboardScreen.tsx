import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Users, Layers, Zap, TrendingUp, Bell, Info,
  GraduationCap, Sparkles, BrainCircuit,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { getAnalyticsSummary, type AnalyticsSummary } from '../../api/adminApi';

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const CARD_BG = 'rgba(19, 200, 236, 0.05)';
const BORDER = 'rgba(19, 200, 236, 0.1)';

const MetricCard = ({ icon: Icon, label, value, trend }: {
  icon: any; label: string; value: string | number; trend?: string;
}) => (
  <View style={cardStyles.container}>
    <View style={cardStyles.top}>
      <View style={cardStyles.iconBox}><Icon size={20} color={PRIMARY} /></View>
      {trend && (
        <View style={cardStyles.trendRow}>
          <TrendingUp size={12} color="#22c55e" />
          <Text style={cardStyles.trendText}>{trend}</Text>
        </View>
      )}
    </View>
    <Text style={cardStyles.label}>{label}</Text>
    <Text style={cardStyles.value}>{value}</Text>
  </View>
);

const cardStyles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
    borderRadius: 14, padding: 16, gap: 4,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  iconBox: { backgroundColor: 'rgba(19,200,236,0.1)', padding: 8, borderRadius: 8 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trendText: { color: '#22c55e', fontSize: 12, fontWeight: '600' },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  value: { color: '#f1f5f9', fontSize: 28, fontWeight: '700' },
});

const AdminDashboardScreen: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  useEffect(() => {
    if (!token) { return; }
    let cancelled = false;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const data = await getAnalyticsSummary(token);
        if (!cancelled) { setSummary(data); }
      } catch (err: any) {
        if (!cancelled) { setError(err.message || 'Failed to load'); }
      } finally {
        if (!cancelled) { setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}><GraduationCap size={20} color={DARK_BG} /></View>
          <View>
            <Text style={styles.logoText}>Sikhsha AI</Text>
            <Text style={styles.portalLabel}>Administrator Portal</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}><Bell size={20} color="#f1f5f9" /></TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
            <Text style={styles.avatarText}>{(user?.name || 'A').charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard Overview</Text>
          <Text style={styles.sectionSubtitle}>Real-time platform performance and user engagement metrics.</Text>
        </View>

        {/* Metrics */}
        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginVertical: 32 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.section}>
            <View style={styles.metricsGrid}>
              <View style={styles.metricsRow}>
                <MetricCard icon={Users} label="Total Users" value={summary?.totalUsers ?? '12,540'} trend="+12%" />
                <MetricCard icon={Layers} label="Total Decks" value={summary?.totalDecks ?? '842'} trend="+5.2%" />
              </View>
              <MetricCard icon={Zap} label="Total Activities" value={summary?.totalActivities ?? '45,218'} trend="+18.4%" />
            </View>
          </View>
        )}

        {/* Admin Notice */}
        <View style={[styles.section, styles.noticeBanner]}>
          <View style={styles.noticeIcon}><Info size={22} color={PRIMARY} /></View>
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Administrator Notice</Text>
            <Text style={styles.noticeText}>
              The quarterly system maintenance is scheduled for Sunday. Platform services may be intermittent for approximately 45 minutes.
            </Text>
          </View>
          <TouchableOpacity style={styles.acknowledgeBtn}>
            <LinearGradient colors={[PRIMARY, '#0db8d9']} style={styles.acknowledgeBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.acknowledgeBtnText}>Acknowledge</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* AI Tools Pipeline */}
        <View style={styles.section}>
          <View style={styles.pipelineHeader}>
            <Text style={styles.pipelineTitle}>AI Tools Pipeline</Text>
            <View style={styles.comingSoonBadge}><Text style={styles.comingSoonText}>COMING SOON</Text></View>
          </View>
          <View style={styles.pipelineGrid}>
            {/* Tool 1 */}
            <View style={styles.toolCard}>
              <View style={styles.toolIconBox}><Sparkles size={20} color={PRIMARY} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toolName}>Automated Deck Generator</Text>
                <Text style={styles.toolDesc}>Create comprehensive study decks from PDFs instantly.</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: '66%' }]} />
                  </View>
                  <Text style={styles.progressLabel}>BETA</Text>
                </View>
              </View>
            </View>
            {/* Tool 2 */}
            <View style={styles.toolCard}>
              <View style={styles.toolIconBox}><BrainCircuit size={20} color={PRIMARY} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toolName}>Personalized Learning Paths</Text>
                <Text style={styles.toolDesc}>Adaptive AI that analyzes user performance to suggest reviews.</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: '33%' }]} />
                  </View>
                  <Text style={styles.progressLabel}>DEV</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    backgroundColor: 'rgba(16,31,34,0.9)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { backgroundColor: PRIMARY, width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  portalLabel: { color: '#64748b', fontSize: 11, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(19,200,236,0.2)', borderWidth: 1.5, borderColor: 'rgba(19,200,236,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: PRIMARY, fontWeight: '700', fontSize: 14 },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#f1f5f9', fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  sectionSubtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  metricsGrid: { gap: 10 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  errorText: { color: '#f87171', marginBottom: 12 },
  noticeBanner: {
    backgroundColor: 'rgba(19,200,236,0.08)', borderWidth: 1, borderColor: 'rgba(19,200,236,0.2)',
    borderRadius: 16, padding: 16, flexDirection: 'column', gap: 12,
  },
  noticeIcon: {
    width: 40, height: 40, backgroundColor: DARK_BG, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  noticeContent: { flex: 0, gap: 4 },
  noticeTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '700' },
  noticeText: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
  acknowledgeBtn: { borderRadius: 10, overflow: 'hidden', alignSelf: 'flex-start' },
  acknowledgeBtnGrad: { paddingHorizontal: 20, paddingVertical: 10 },
  acknowledgeBtnText: { color: DARK_BG, fontWeight: '700', fontSize: 13 },
  pipelineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  pipelineTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: '700' },
  comingSoonBadge: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  comingSoonText: { color: '#94a3b8', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  pipelineGrid: { gap: 12 },
  toolCard: {
    flexDirection: 'row', gap: 14, padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
  },
  toolIconBox: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: 'rgba(19,200,236,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  toolName: { color: '#f1f5f9', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  toolDesc: { color: '#64748b', fontSize: 12, lineHeight: 18, marginBottom: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 4, backgroundColor: 'rgba(19,200,236,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: PRIMARY, borderRadius: 2 },
  progressLabel: { color: PRIMARY, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
});

export default AdminDashboardScreen;
