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
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import {useAuth} from '../../context/AuthContext';
import {
  getDoubtById,
  submitFollowUp,
  getSimilarProblems,
  type Doubt,
  type FollowUp,
} from '../../api/studentApi';
import type {StudentStackParamList} from '../../navigation/StudentNavigator';

type DoubtDetailRoute = RouteProp<StudentStackParamList, 'DoubtDetail'>;

const DoubtDetailScreen: React.FC = () => {
  const route = useRoute<DoubtDetailRoute>();
  const {token, user} = useAuth();
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [similar, setSimilar] = useState<Doubt[]>([]);
  const [followUpText, setFollowUpText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const {doubtId} = route.params;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detail, similarProblems] = await Promise.all([
          getDoubtById(token, doubtId),
          getSimilarProblems(token, doubtId),
        ]);
        if (!cancelled) {
          const {followUps: fu, ...rest} = detail;
          setDoubt(rest);
          setFollowUps(fu || []);
          setSimilar(similarProblems || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load doubt details');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token, route.params]);

  const handleSubmitFollowUp = async () => {
    if (!token || !doubt) return;
    if (!followUpText.trim()) {
      setError('Please type a follow-up question first.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fu = await submitFollowUp(token, doubt.id, followUpText.trim());
      setFollowUps(current => [...current, fu]);
      setFollowUpText('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || user?.role !== 'student') {
    return (
      <GlassScreen>
        <View style={styles.centerMessage}>
          <Text style={styles.title}>Student access required</Text>
          <Text style={styles.subtitle}>
            Please log in with a student account to view doubt details.
          </Text>
        </View>
      </GlassScreen>
    );
  }

  return (
    <GlassScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading && !doubt ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#e5e7eb" />
          </View>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {doubt && (
          <>
            <Text style={styles.heading}>Doubt detail</Text>
            <Text style={styles.subtitle}>
              {doubt.subject || 'General'} •{' '}
              {doubt.status === 'resolved' ? 'Resolved' : 'Pending'}
            </Text>

            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>Your question</Text>
              <Text style={styles.question}>{doubt.question}</Text>
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>AI explanation</Text>
              {doubt.solution ? (
                <Text style={styles.body}>{doubt.solution}</Text>
              ) : (
                <Text style={styles.emptyText}>
                  We&apos;re still working on this one. Check back in a bit.
                </Text>
              )}
            </GlassCard>

            <GlassCard style={styles.card}>
              <Text style={styles.sectionTitle}>Follow-up questions</Text>
              {followUps.length === 0 ? (
                <Text style={styles.emptyText}>
                  You haven&apos;t asked any follow-ups yet.
                </Text>
              ) : (
                followUps.map(fu => (
                  <View key={fu.id} style={styles.followUpItem}>
                    <Text style={styles.followUpLabel}>You</Text>
                    <Text style={styles.followUpText}>{fu.question}</Text>
                    <Text style={[styles.followUpLabel, {marginTop: 6}]}>AI</Text>
                    <Text style={styles.followUpAnswer}>{fu.answer}</Text>
                  </View>
                ))
              )}

              <View style={styles.followUpComposer}>
                <Text style={styles.label}>Ask a follow-up</Text>
                <TextInput
                  placeholder="Ask for clarification or a different example..."
                  placeholderTextColor="rgba(148,163,184,0.8)"
                  style={[styles.input, styles.textArea]}
                  value={followUpText}
                  onChangeText={setFollowUpText}
                  multiline
                />
                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.9}
                  onPress={handleSubmitFollowUp}
                  disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator color="#e5e7eb" />
                  ) : (
                    <Text style={styles.buttonText}>Send follow-up</Text>
                  )}
                </TouchableOpacity>
              </View>
            </GlassCard>

            <GlassCard style={styles.cardList}>
              <Text style={styles.sectionTitle}>Similar problems</Text>
              {similar.length === 0 ? (
                <Text style={styles.emptyText}>
                  Once the system has enough data, we&apos;ll suggest similar doubts here.
                </Text>
              ) : (
                similar.map(s => (
                  <View key={s.id} style={styles.listItem}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {s.question}
                    </Text>
                    <Text style={styles.itemMeta}>{s.subject || 'General'}</Text>
                  </View>
                ))
              )}
            </GlassCard>
          </>
        )}
      </ScrollView>
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  scroll: {paddingVertical: 16, paddingHorizontal: 4},
  loader: {marginTop: 40},
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
  question: {
    fontSize: 15,
    color: '#f9fafb',
  },
  body: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  followUpItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,64,175,0.5)',
    paddingTop: 8,
    marginTop: 8,
  },
  followUpLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
  },
  followUpText: {
    fontSize: 14,
    color: '#f9fafb',
  },
  followUpAnswer: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  followUpComposer: {
    marginTop: 12,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(129,140,248,0.95)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b1120',
  },
  cardList: {marginBottom: 24},
  listItem: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,64,175,0.5)',
  },
  itemTitle: {fontSize: 14, color: '#f9fafb'},
  itemMeta: {fontSize: 12, color: '#9ca3af', marginTop: 2},
  emptyText: {fontSize: 13, color: '#9ca3af'},
  error: {color: '#fca5a5', marginBottom: 8, paddingHorizontal: 4},
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

export default DoubtDetailScreen;
