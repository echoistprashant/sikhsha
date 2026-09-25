import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  GraduationCap, Search, Bell, LayoutGrid, BookOpen,
  Zap, Library, Database, ClipboardList, LineChart,
  ClipboardCheck, MoreVertical, ChevronRight, Pencil, History,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TeacherStackParamList } from '../../navigation/TeacherNavigator';
import { useAuth } from '../../context/AuthContext';
import { getDecks, getActivities, getLessonPlans, type Deck } from '../../api/teacherApi';

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const CARD_BG = 'rgba(19, 200, 236, 0.05)';
const BORDER = 'rgba(19, 200, 236, 0.1)';

const COCKPIT_ITEMS = [
  { icon: LayoutGrid, label: 'Decks', sub: 'Manage flashcards', nav: 'DeckGenerator' },
  { icon: Zap, label: 'Activities', sub: 'Active tasks', nav: 'ActivityGenerator' },
  { icon: BookOpen, label: 'Lesson Plans', sub: 'Full curriculum', nav: 'LessonPlans' },
  { icon: Library, label: 'Concept Library', sub: 'Resource hub', nav: 'ConceptLibrary' },
  { icon: Database, label: 'Question Bank', sub: 'Assessments', nav: 'QuestionGenerator' },
  { icon: ClipboardList, label: 'Homework', sub: 'Student assignments', nav: 'AssignHomework' },
  { icon: LineChart, label: 'Results', sub: 'Performance analytics', nav: 'UpdateResult' },
  { icon: ClipboardCheck, label: 'Attendance', sub: 'Student records', nav: 'Attendance' },
] as const;

const TeacherDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const { token, user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
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
        const d = await getDecks(token);
        if (!cancelled) { setDecks(d); }
      } catch (err: any) {
        if (!cancelled) { setError(err.message || 'Failed to load'); }
      } finally { if (!cancelled) { setLoading(false); } }
    };
    load();
    return () => { cancelled = true; };
  }, [token]);

  const recentDecks = decks.slice(0, 2);

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
          <TouchableOpacity style={styles.iconBtn}><Search size={18} color={PRIMARY} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtnNotif} onPress={handleLogout}>
            <Bell size={18} color={PRIMARY} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile section */}
        <View style={styles.profileSection}>
          <View style={styles.profileLeft}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user?.name || 'T').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.greeting}>Hi, {user?.name || 'Teacher'}</Text>
                <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
              </View>
              <View style={styles.subRow}>
                <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>Teacher</Text></View>
                <Text style={styles.deptText}>Mathematics Dept.</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Pencil size={14} color={DARK_BG} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Cockpit */}
        <View style={styles.cockpitSection}>
          <Text style={styles.cockpitTitle}>
            <LayoutGrid size={16} color={PRIMARY} />{'  '}Teacher Cockpit
          </Text>
          {loading ? (
            <ActivityIndicator color={PRIMARY} style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.cockpitGrid}>
              {COCKPIT_ITEMS.map(({ icon: Icon, label, sub, nav }) => (
                <TouchableOpacity
                  key={label}
                  style={styles.cockpitCard}
                  onPress={() => navigation.navigate(nav as any)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cockpitIconBox}><Icon size={22} color={PRIMARY} /></View>
                  <Text style={styles.cockpitLabel}>{label}</Text>
                  <Text style={styles.cockpitSub}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Recent Decks */}
        {recentDecks.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <View style={styles.recentTitleRow}>
                <History size={16} color={PRIMARY} />
                <Text style={styles.recentTitle}>Recent Decks</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Decks' as any)}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            {recentDecks.map(deck => (
              <TouchableOpacity
                key={deck.id}
                style={styles.deckItem}
                onPress={() => navigation.navigate('DeckDetail', { deckId: deck.id })}
              >
                <View style={styles.deckIconBox}>
                  <LayoutGrid size={20} color={PRIMARY} />
                </View>
                <View style={styles.deckInfo}>
                  <Text style={styles.deckTitle}>{deck.title}</Text>
                  <Text style={styles.deckMeta}>{deck.subject} • {(deck as any).slide_count ?? 0} Cards</Text>
                </View>
                <MoreVertical size={18} color="#475569" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
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
    backgroundColor: 'rgba(16,31,34,0.9)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#f1f5f9', fontSize: 18, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 8, borderWidth: 1,
    borderColor: BORDER, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center',
  },
  iconBtnNotif: {
    width: 38, height: 38, borderRadius: 8, borderWidth: 1,
    borderColor: BORDER, backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8, width: 7, height: 7,
    borderRadius: 3.5, backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: DARK_BG,
  },
  scroll: { paddingTop: 4 },
  profileSection: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 20,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarOuter: { position: 'relative' },
  avatar: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: DARK_BG, fontSize: 28, fontWeight: '700' },
  onlineDot: {
    position: 'absolute', bottom: -2, right: -2, width: 20, height: 20,
    borderRadius: 10, backgroundColor: '#22c55e', borderWidth: 3, borderColor: DARK_BG,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  greeting: { color: '#f1f5f9', fontSize: 20, fontWeight: '700' },
  proBadge: {
    backgroundColor: 'rgba(19,200,236,0.15)', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  proBadgeText: { color: PRIMARY, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleBadge: {
    backgroundColor: 'rgba(19,200,236,0.1)', borderWidth: 1, borderColor: BORDER,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  roleBadgeText: { color: PRIMARY, fontSize: 12, fontWeight: '600' },
  deptText: { color: '#64748b', fontSize: 12 },
  editProfileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: PRIMARY, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  editProfileText: { color: DARK_BG, fontSize: 12, fontWeight: '700' },
  cockpitSection: { paddingHorizontal: 20, paddingBottom: 8 },
  cockpitTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  cockpitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cockpitCard: {
    width: '47%', padding: 18, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, backgroundColor: CARD_BG, gap: 8,
  },
  cockpitIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(19,200,236,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  cockpitLabel: { color: '#f1f5f9', fontWeight: '700', fontSize: 14 },
  cockpitSub: { color: '#64748b', fontSize: 11 },
  recentSection: { paddingHorizontal: 20, paddingTop: 16 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  recentTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recentTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  viewAll: { color: PRIMARY, fontSize: 13, fontWeight: '700' },
  deckItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 16, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD_BG, marginBottom: 10,
  },
  deckIconBox: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: DARK_BG, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },
  deckInfo: { flex: 1 },
  deckTitle: { color: '#f1f5f9', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  deckMeta: { color: '#64748b', fontSize: 11 },
  errorText: { color: '#f87171', paddingHorizontal: 20, marginTop: 8 },
});

export default TeacherDashboardScreen;
