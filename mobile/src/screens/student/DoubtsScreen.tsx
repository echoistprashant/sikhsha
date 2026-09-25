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
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import {useAuth} from '../../context/AuthContext';
import {
  submitTextDoubt,
  getDoubtHistory,
  type Doubt,
} from '../../api/studentApi';
import type {StudentStackParamList} from '../../navigation/StudentNavigator';

type StudentNav = NativeStackNavigationProp<StudentStackParamList, 'StudentTabs'>;

const DoubtsScreen: React.FC = () => {
  const {token, user} = useAuth();
  const navigation = useNavigation<StudentNav>();
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDoubts = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const history = await getDoubtHistory(token, {page: 1, limit: 20});
      setDoubts(history.doubts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load your doubts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadDoubts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async () => {
    if (!token) return;
    if (!question.trim()) {
      setError('Please type your doubt before submitting.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const doubt = await submitTextDoubt(token, {
        question: question.trim(),
        subject: subject.trim() || undefined,
      });
      setDoubts(current => [doubt, ...current]);
      setQuestion('');
      // keep subject as-is so they can ask multiple related doubts
    } catch (err: any) {
      setError(err.message || 'Failed to submit doubt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = (doubtId: string) => {
    navigation.navigate('DoubtDetail', {doubtId});
  };

  if (!token || user?.role !== 'student') {
    return (
      <GlassScreen>
        <View style={styles.centerMessage}>
          <Text style={styles.title}>Student access required</Text>
          <Text style={styles.subtitle}>
            Please log in with a student account to ask doubts.
          </Text>
        </View>
      </GlassScreen>
    );
  }

  return (
    <GlassScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Doubts</Text>
        <Text style={styles.subtitle}>
          Ask questions in natural language and revisit past explanations.
        </Text>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Ask a new doubt</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>Subject (optional)</Text>
          <TextInput
            placeholder="Mathematics, Physics, Chemistry..."
            placeholderTextColor="rgba(148,163,184,0.8)"
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
          />
          <Text style={styles.label}>Your question</Text>
          <TextInput
            placeholder="Type your doubt here..."
            placeholderTextColor="rgba(148,163,184,0.8)"
            style={[styles.input, styles.textArea]}
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPress={handleSubmit}
            disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#e5e7eb" />
            ) : (
              <Text style={styles.buttonText}>Ask AI</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.cardList}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Your doubts</Text>
            {loading && <ActivityIndicator size="small" color="#e5e7eb" />}
          </View>
          {doubts.length === 0 && !loading ? (
            <Text style={styles.emptyText}>
              You haven&apos;t submitted any doubts yet. Start by asking one above.
            </Text>
          ) : (
            doubts.map(d => (
              <TouchableOpacity
                key={d.id}
                style={styles.listItem}
                activeOpacity={0.85}
                onPress={() => handleOpenDetail(d.id)}>
                <View style={styles.listMain}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {d.question}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {d.subject || 'General'} •{' '}
                    {d.status === 'resolved' ? 'Resolved' : 'Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </GlassCard>
      </ScrollView>
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  scroll: {paddingVertical: 16, paddingHorizontal: 4},
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
  card: {marginBottom: 16},
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
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(96,165,250,0.95)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b1120',
  },
  cardList: {marginBottom: 24},
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
  listMain: {flex: 1, marginRight: 8},
  itemTitle: {fontSize: 14, color: '#f9fafb'},
  itemMeta: {fontSize: 12, color: '#9ca3af', marginTop: 2},
  emptyText: {fontSize: 13, color: '#9ca3af'},
  error: {color: '#fca5a5', marginBottom: 8},
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

export default DoubtsScreen;
