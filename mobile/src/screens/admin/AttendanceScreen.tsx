import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import {useAuth} from '../../context/AuthContext';
import {
  getAttendanceByDate,
  updateAttendance,
  type AttendanceRecord,
} from '../../api/adminApi';

const AttendanceScreen: React.FC = () => {
  const {token, user} = useAuth();
  const [date, setDate] = useState<string>('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Default to today
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
  }, []);

  const handleLoad = async () => {
    if (!token || !date) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getAttendanceByDate(token, date);
      setRecords(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    record: AttendanceRecord,
    status: 'present' | 'absent' | 'late',
  ) => {
    if (!token || record.status === status) {
      return;
    }

    setUpdatingId(record.id);
    setError(null);
    try {
      const updated = await updateAttendance(token, record.id, status);
      setRecords(current =>
        current.map(r => (r.id === record.id ? {...r, ...updated} : r)),
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update attendance');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!token || user?.role !== 'admin') {
    return (
      <GlassScreen>
        <View style={styles.centerMessage}>
          <Text style={styles.title}>Admin access required</Text>
          <Text style={styles.subtitle}>
            Please log in with an admin account to manage attendance.
          </Text>
        </View>
      </GlassScreen>
    );
  }

  return (
    <GlassScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Attendance</Text>
        <Text style={styles.subtitle}>
          Review and adjust attendance for a specific date.
        </Text>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            placeholder="2025-01-15"
            placeholderTextColor="rgba(148,163,184,0.8)"
            style={styles.input}
            value={date}
            onChangeText={setDate}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPress={handleLoad}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#e5e7eb" />
            ) : (
              <Text style={styles.buttonText}>Load attendance</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.cardList}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Records</Text>
            {loading && <ActivityIndicator size="small" color="#e5e7eb" />}
          </View>

          {records.length === 0 && !loading ? (
            <Text style={styles.emptyText}>
              No attendance records for this date yet.
            </Text>
          ) : (
            records.map(record => (
              <View key={record.id} style={styles.listItem}>
                <View style={styles.listMain}>
                  <Text style={styles.itemTitle}>
                    {record.student_name || record.student_email || record.student_id}
                  </Text>
                  <Text style={styles.itemMeta}>
                    Status: {record.status} • Class: {record.class_id || 'N/A'}
                  </Text>
                </View>
                <View style={styles.statusRow}>
                  {(['present', 'absent', 'late'] as const).map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusBadge,
                        record.status === s && styles.statusBadgeActive,
                      ]}
                      disabled={updatingId === record.id}
                      onPress={() => handleUpdateStatus(record, s)}>
                      <Text style={styles.statusBadgeText}>{s[0].toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
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
    fontSize: 20,
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
  card: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(15,23,42,0.85)',
    color: '#e5e7eb',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    marginBottom: 8,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(52,211,153,0.9)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#022c22',
  },
  cardList: {
    marginBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  listItem: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,64,175,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listMain: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    color: '#f9fafb',
  },
  itemMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(52,211,153,0.25)',
    borderColor: 'rgba(52,211,153,0.9)',
  },
  statusBadgeText: {
    fontSize: 11,
    color: '#e5e7eb',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  error: {
    color: '#fca5a5',
    marginBottom: 8,
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

export default AttendanceScreen;
