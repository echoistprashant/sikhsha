import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import {
  ArrowLeft, Bell, Sparkles, Send, ChevronRight,
  MessageCircle, FlaskConical, Users,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TeacherStackParamList } from '../../navigation/TeacherNavigator';
import { useAuth } from '../../context/AuthContext';
import { getActivities, generateActivity, type Activity } from '../../api/teacherApi';

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const CARD_BG = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';

const FILTERS = ['All', 'Discussion', 'Lab', 'Group Work'];

const ICON_MAP: Record<string, any> = {
  Discussion: MessageCircle,
  Lab: FlaskConical,
  Group: Users,
};

const getIcon = (type: string) => {
  const key = Object.keys(ICON_MAP).find(k => type?.toLowerCase().includes(k.toLowerCase()));
  return key ? ICON_MAP[key] : Sparkles;
};

const ActivitiesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const { token } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const load = async () => {
    if (!token) { return; }
    setLoading(true);
    try { setActivities(await getActivities(token)); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !token) { return; }
    setGenerating(true);
    try {
      const a = await generateActivity(token, { topic: prompt.trim(), subject: 'General', duration: 45, activityType: 'Mixed', gradeLevel: 'Grade 10' });
      setActivities([a, ...activities]);
      setPrompt('');
    } catch { /* ignore */ } finally { setGenerating(false); }
  };

  const filtered = activeFilter === 'All'
    ? activities
    : activities.filter(a => a.activity_type?.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#f1f5f9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activities</Text>
        <TouchableOpacity style={styles.notifBtn}><Bell size={20} color="#f1f5f9" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextArea}>
            <Text style={styles.heroTitle}>Create New Activity</Text>
            <Text style={styles.heroSubtitle}>Harness AI to design engaging lessons in seconds</Text>
            <TouchableOpacity style={styles.getStartedBtn}>
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI POWERED</Text>
          </View>
        </View>

        {/* AI Input */}
        <View style={styles.inputRow}>
          <Sparkles size={20} color={PRIMARY} />
          <TextInput
            style={styles.inputField}
            placeholder="Describe your activity idea..."
            placeholderTextColor="#475569"
            value={prompt}
            onChangeText={setPrompt}
            onSubmitEditing={handleGenerate}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleGenerate}>
            {generating ? <ActivityIndicator size="small" color={DARK_BG} /> : <Send size={16} color={DARK_BG} />}
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <Text style={styles.listHeader}>Recent Activities</Text>
        {loading ? <ActivityIndicator color={PRIMARY} style={{ marginTop: 20 }} /> : (
          filtered.map(a => {
            const Icon = getIcon(a.activity_type || '');
            return (
              <TouchableOpacity
                key={a.id}
                style={styles.activityItem}
                onPress={() => navigation.navigate('ActivityDetail', { activityId: a.id })}
              >
                <View style={styles.activityIcon}><Icon size={20} color={PRIMARY} /></View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{a.title}</Text>
                  <Text style={styles.activityMeta}>{a.activity_type} • {a.duration} mins</Text>
                </View>
                <ChevronRight size={18} color="#475569" />
              </TouchableOpacity>
            );
          })
        )}
        {!loading && filtered.length === 0 && (
          <Text style={styles.emptyText}>No activities yet. Generate one above!</Text>
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
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#f1f5f9', fontSize: 17, fontWeight: '700' },
  notifBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 40 },
  heroCard: {
    margin: 16, borderRadius: 16, overflow: 'hidden', aspectRatio: 16 / 9,
    backgroundColor: '#0f1f24',
    borderWidth: 1, borderColor: BORDER,
    justifyContent: 'flex-end', padding: 20, position: 'relative',
  },
  heroTextArea: { gap: 6 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  heroSubtitle: { color: '#94a3b8', fontSize: 13, maxWidth: 260 },
  getStartedBtn: {
    marginTop: 10, backgroundColor: PRIMARY, borderRadius: 8,
    paddingHorizontal: 18, paddingVertical: 8, alignSelf: 'flex-start',
  },
  getStartedText: { color: DARK_BG, fontWeight: '700', fontSize: 13 },
  aiBadge: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: 'rgba(19,200,236,0.15)', borderWidth: 1, borderColor: 'rgba(19,200,236,0.3)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  aiBadgeText: { color: PRIMARY, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: 'transparent',
    borderRadius: 14, height: 52,
  },
  inputField: { flex: 1, color: '#f1f5f9', fontSize: 14 },
  sendBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  filterScroll: { marginTop: 12, maxHeight: 50 },
  filterContent: { paddingHorizontal: 16, gap: 10, flexDirection: 'row', alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  filterChipActive: { backgroundColor: PRIMARY },
  filterChipText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
  filterChipTextActive: { color: DARK_BG, fontWeight: '700' },
  listHeader: {
    paddingHorizontal: 16, marginTop: 20, marginBottom: 10,
    color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase',
  },
  activityItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 14,
  },
  activityIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: 'rgba(19,200,236,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  activityInfo: { flex: 1 },
  activityName: { color: '#f1f5f9', fontWeight: '700', fontSize: 14 },
  activityMeta: { color: '#64748b', fontSize: 11, marginTop: 3 },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 32, fontSize: 13 },
});

export default ActivitiesScreen;
