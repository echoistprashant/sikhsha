import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, StatusBar,
} from 'react-native';
import { Search, UserPlus, MoreVertical, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { getUsers, type AdminUser } from '../../api/adminApi';

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const CARD_BG = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.06)';

type RoleFilter = 'all' | 'teacher' | 'student' | 'admin';
type Tab = 'All Users' | 'Active' | 'Inactive';

const RoleBadge = ({ role }: { role: string }) => (
  <View style={userStyles.roleBadge}><Text style={userStyles.roleText}>{role}</Text></View>
);
const StatusBadge = ({ active }: { active: boolean }) => (
  <View style={[userStyles.statusBadge, { backgroundColor: active ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.12)' }]}>
    <Text style={[userStyles.statusText, { color: active ? '#22c55e' : '#94a3b8' }]}>
      {active ? 'Active' : 'Inactive'}
    </Text>
  </View>
);

const userStyles = StyleSheet.create({
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  roleText: { color: '#cbd5e1', fontSize: 10, fontWeight: '600' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
});

const UsersScreen: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter] = useState<RoleFilter>('all');
  const [activeTab, setActiveTab] = useState<Tab>('All Users');

  const loadUsers = async () => {
    if (!token) { return; }
    setLoading(true);
    try {
      const filters: any = {};
      if (roleFilter !== 'all') { filters.role = roleFilter; }
      const data = await getUsers(token, filters);
      setUsers(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, [token]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    if (activeTab === 'Active') { return matchesSearch && u.status !== 'inactive'; }
    if (activeTab === 'Inactive') { return matchesSearch && u.status === 'inactive'; }
    return matchesSearch;
  });

  const avatarLetter = (name: string) => name.charAt(0).toUpperCase();
  const isActive = (u: AdminUser) => u.status !== 'inactive';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backIcon}><ArrowLeft size={20} color={PRIMARY} /></TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>User Management</Text>
            <Text style={styles.headerSub}>Sikhsha AI Administration</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <UserPlus size={16} color={DARK_BG} />
          <Text style={styles.addBtnText}>Add User</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Search size={18} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name or email..."
          placeholderTextColor="#475569"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
        {['Role: All', 'Status: Active', 'Joined Date'].map(chip => (
          <TouchableOpacity key={chip} style={styles.chip}>
            <Text style={styles.chipText}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['All Users', 'Active', 'Inactive'] as Tab[]).map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color={PRIMARY} style={{ marginTop: 32 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map(u => (
            <View key={u.id} style={styles.userCard}>
              <View style={[styles.avatar, { opacity: isActive(u) ? 1 : 0.6 }]}>
                <Text style={styles.avatarText}>{avatarLetter(u.name)}</Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userTopRow}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <StatusBadge active={isActive(u)} />
                </View>
                <Text style={styles.userEmail}>{u.email}</Text>
                <View style={styles.userBottomRow}>
                  <RoleBadge role={u.role} />
                  <Text style={styles.joinedText}>Joined recently</Text>
                </View>
              </View>
              <TouchableOpacity>
                <MoreVertical size={18} color="#475569" />
              </TouchableOpacity>
            </View>
          ))}
          {filtered.length === 0 && !loading && (
            <Text style={styles.emptyText}>No users found.</Text>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
  backIcon: {
    width: 34, height: 34, borderRadius: 8, backgroundColor: 'rgba(19,200,236,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#f1f5f9', fontSize: 17, fontWeight: '700' },
  headerSub: { color: '#64748b', fontSize: 11 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: PRIMARY, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { color: DARK_BG, fontWeight: '700', fontSize: 13 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, height: 46, paddingHorizontal: 14,
  },
  searchInput: { flex: 1, color: '#f1f5f9', fontSize: 14 },
  chipScroll: { maxHeight: 52 },
  chipContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 10, flexDirection: 'row' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: BORDER,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  chipText: { color: '#94a3b8', fontSize: 13 },
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10 },
  tabActive: { backgroundColor: DARK_BG },
  tabText: { color: '#64748b', fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: PRIMARY, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
    borderRadius: 14, padding: 14, marginBottom: 8,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(19,200,236,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: PRIMARY, fontWeight: '700', fontSize: 16 },
  userInfo: { flex: 1, gap: 3 },
  userTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userName: { color: '#f1f5f9', fontWeight: '600', fontSize: 14 },
  userEmail: { color: '#64748b', fontSize: 12 },
  userBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  joinedText: { color: '#475569', fontSize: 10 },
  emptyText: { color: '#64748b', textAlign: 'center', marginTop: 32 },
});

export default UsersScreen;
