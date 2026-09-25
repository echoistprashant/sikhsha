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
import {getSchools, createSchool, type School} from '../../api/adminApi';

const SchoolsScreen: React.FC = () => {
  const {token, user} = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadSchools = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSchools(token);
      setSchools(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async () => {
    if (!token) return;
    if (!name.trim()) {
      setError('School name is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const school = await createSchool(token, {
        name: name.trim(),
        address: address.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      });
      setSchools(current => [school, ...current]);
      setName('');
      setAddress('');
      setContactEmail('');
      setContactPhone('');
    } catch (err: any) {
      setError(err.message || 'Failed to create school');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || user?.role !== 'admin') {
    return (
      <GlassScreen>
        <View style={styles.centerMessage}>
          <Text style={styles.title}>Admin access required</Text>
          <Text style={styles.subtitle}>
            Please log in with an admin account to manage schools.
          </Text>
        </View>
      </GlassScreen>
    );
  }

  return (
    <GlassScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Schools</Text>
        <Text style={styles.subtitle}>
          Maintain institutions connected to your platform.
        </Text>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Create school</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Springfield High"
            placeholderTextColor="rgba(148,163,184,0.8)"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.label}>Address</Text>
          <TextInput
            placeholder="Street, city, country"
            placeholderTextColor="rgba(148,163,184,0.8)"
            style={styles.input}
            value={address}
            onChangeText={setAddress}
          />
          <Text style={styles.label}>Contact email</Text>
          <TextInput
            placeholder="admin@school.com"
            placeholderTextColor="rgba(148,163,184,0.8)"
            style={styles.input}
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Contact phone</Text>
          <TextInput
            placeholder="+1 555 123 4567"
            placeholderTextColor="rgba(148,163,184,0.8)"
            style={styles.input}
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPress={handleCreate}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#e5e7eb" />
            ) : (
              <Text style={styles.buttonText}>Create school</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.cardList}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Existing schools</Text>
            {loading && <ActivityIndicator size="small" color="#e5e7eb" />}
          </View>
          {schools.length === 0 && !loading ? (
            <Text style={styles.emptyText}>No schools created yet.</Text>
          ) : (
            schools.map(school => (
              <View key={school.id} style={styles.listItem}>
                <Text style={styles.itemTitle}>{school.name}</Text>
                {school.address ? (
                  <Text style={styles.itemMeta}>{school.address}</Text>
                ) : null}
                {(school.contact_email || school.contact_phone) && (
                  <Text style={styles.itemMeta}>
                    {school.contact_email || '—'} • {school.contact_phone || '—'}
                  </Text>
                )}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 8,
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
    backgroundColor: 'rgba(244,114,182,0.9)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
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
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,64,175,0.5)',
  },
  itemTitle: {
    fontSize: 14,
    color: '#f9fafb',
  },
  itemMeta: {
    fontSize: 12,
    color: '#9ca3af',
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

export default SchoolsScreen;
