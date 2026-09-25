import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  GraduationCap, Bell, BookOpen, ClipboardList, Star,
  MessageCircle, FolderOpen, BarChart2, HelpCircle, ChevronRight,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentStackParamList } from '../../navigation/StudentNavigator';
import { useAuth } from '../../context/AuthContext';
import { getDoubtHistory, getWeakAreas, type Doubt, type WeakArea } from '../../api/studentApi';

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const CARD_BG = 'rgba(19,200,236,0.05)';
const BORDER = 'rgba(19,200,236,0.1)';

const HUB_ITEMS = [
  { icon: HelpCircle, label: 'Doubts', sub: 'Get instant help', nav: 'DoubtSolver', highlight: true },
  { icon: BookOpen, label: 'Homework', sub: 'View assignments', nav: 'Homework' },
  { icon: ClipboardList, label: 'Results', sub: 'View exam scores', nav: 'Results' },
  { icon: FolderOpen, label: 'Study Files', sub: 'PDFs & Resources', nav: 'Files' },
  { icon: BarChart2, label: 'Analysis', sub: 'Your performance', nav: 'Analysis' },
  { icon: Star, label: 'Weak Areas', sub: 'Areas to improve', nav: 'Doubts' },
] as const;

const StudentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { token, user, logout } = useAuth();
  const [recentDoubts, setRecentDoubts] = useState<Doubt[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      try {
        const [history, weak] = await Promise.all([getDoubtHistory(token, { page: 1, limit: 5 }), getWeakAreas(token)]);
        if (!cancelled) { setRecentDoubts(history.doubts || []); setWeakAreas(weak || []); }
      } catch { /* ignore */ } finally { if (!cancelled) { setLoading(false); } }
    };
    load();
    return () => { cancelled = true; };
  }, [token]);

  const resolvedCount = recentDoubts.filter(d => d.status === 'resolved').length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}><GraduationCap size={20} color={DARK_BG} /></View>
          <Text style={styles.logoText}>Sikhsha AI</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}><Bell size={18} color={PRIMARY} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.name || 'S').charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hi, {user?.name || 'Student'}</Text>
              <View style={styles.studentBadge}><Text style={styles.studentBadgeText}>Student · Class XI</Text></View>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{recentDoubts.length}</Text>
              <Text style={styles.statLabel}>Total Doubts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{resolvedCount}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{weakAreas.length}</Text>
              <Text style={styles.statLabel}>Weak Areas</Text>
            </View>
          </View>
        )}

        {/* Hub Grid */}
        <Text style={styles.hubLabel}>STUDENT HUB</Text>
        <View style={styles.hubGrid}>
          {HUB_ITEMS.map(({ icon: Icon, label, sub, nav, highlight }) => (
            <TouchableOpacity
              key={label}
              style={[styles.hubCard, highlight && styles.hubCardHighlight]}
              onPress={() => navigation.navigate(nav as any)}
              activeOpacity={0.75}
            >
              {highlight ? (
                <LinearGradient colors={[PRIMARY, '#0db8d9']} style={styles.hubIconBox}>
                  <Icon size={22} color={DARK_BG} />
                </LinearGradient>
              ) : (
                <View style={styles.hubIconBox}><Icon size={22} color={PRIMARY} /></View>
              )}
              <Text style={[styles.hubItemLabel, highlight && styles.hubItemLabelH]}>{label}</Text>
              <Text style={styles.hubItemSub}>{sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Doubts */}
        {recentDoubts.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Doubts</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Doubts' as any)}>
                <Text style={styles.viewAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentDoubts.slice(0, 3).map(d => (
              <TouchableOpacity
                key={d.id}
                style={styles.doubtItem}
                onPress={() => navigation.navigate('DoubtDetail', { doubtId: d.id })}
              >
                <View style={styles.doubtIcon}>
                  <MessageCircle size={16} color={PRIMARY} />
                </View>
                <View style={styles.doubtContent}>
                  <Text style={styles.doubtQ} numberOfLines={1}>{d.question}</Text>
                  <Text style={styles.doubtMeta}>{d.subject || 'General'}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: d.status === 'resolved' ? '#22c55e' : '#f59e0b' }]} />
                <ChevronRight size={16} color="#475569" />
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
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
    backgroundColor: 'rgba(16,31,34,0.95)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { backgroundColor: PRIMARY, width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#f1f5f9', fontSize: 17, fontWeight: '700' },
  headerRight: { flexDirection: 'row' },
  iconBtn: {
    width: 36, height: 36, borderRadius: 8, borderWidth: 1,
    borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingBottom: 30 },
  welcomeCard: { paddingHorizontal: 20, paddingVertical: 20 },
  welcomeLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: DARK_BG, fontSize: 24, fontWeight: '700' },
  greeting: { color: '#f1f5f9', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  studentBadge: {
    backgroundColor: 'rgba(19,200,236,0.1)', borderRadius: 20, paddingHorizontal: 10,
    paddingVertical: 4, alignSelf: 'flex-start',
  },
  studentBadgeText: { color: PRIMARY, fontSize: 11, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 24,
    backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER, paddingVertical: 16,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statVal: { color: '#f1f5f9', fontSize: 24, fontWeight: '700' },
  statLabel: { color: '#64748b', fontSize: 10, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: BORDER },
  hubLabel: { paddingHorizontal: 20, color: '#64748b', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 },
  hubGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20 },
  hubCard: {
    width: '47%', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD_BG, gap: 8,
  },
  hubCardHighlight: { borderColor: 'rgba(19,200,236,0.3)' },
  hubIconBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: 'rgba(19,200,236,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  hubItemLabel: { color: '#f1f5f9', fontWeight: '700', fontSize: 14 },
  hubItemLabelH: { color: '#f1f5f9' },
  hubItemSub: { color: '#64748b', fontSize: 11 },
  recentSection: { paddingHorizontal: 20, marginTop: 24 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  recentTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  viewAll: { color: PRIMARY, fontSize: 12, fontWeight: '700' },
  doubtItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD_BG, marginBottom: 8,
  },
  doubtIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(19,200,236,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  doubtContent: { flex: 1 },
  doubtQ: { color: '#f1f5f9', fontWeight: '600', fontSize: 13 },
  doubtMeta: { color: '#64748b', fontSize: 11, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});

export default StudentDashboardScreen;
