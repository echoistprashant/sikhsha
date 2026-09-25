import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TeacherStackParamList } from '../../navigation/TeacherNavigator';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import { useAuth } from '../../context/AuthContext';
import {
  getDecks,
  generateDeck,
  updateDeck,
  deleteDeck,
  type Deck,
} from '../../api/teacherApi';

const DecksScreen: React.FC = () => {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [numSlides, setNumSlides] = useState('10');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDecks(token);
        if (!cancelled) {
          setDecks(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load decks');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleGenerate = async () => {
    if (!token) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        topic: topic.trim(),
        subject: subject.trim(),
        gradeLevel: gradeLevel.trim(),
        numSlides: Number(numSlides) || undefined,
      };

      const deck = await generateDeck(token, payload);
      setDecks(current => [deck, ...current]);
      setTopic('');
      setSubject('');
      setGradeLevel('');
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to generate deck');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (deck: Deck) => {
    setEditingId(deck.id);
    setTopic(deck.title);
    setSubject(deck.subject);
    setGradeLevel(deck.grade_level);
    setNumSlides('');
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTopic('');
    setSubject('');
    setGradeLevel('');
    setNumSlides('10');
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!token || !editingId) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateDeck(token, editingId, {
        title: topic.trim() || undefined,
        subject: subject.trim() || undefined,
        grade_level: gradeLevel.trim() || undefined,
      });

      setDecks(current =>
        current.map(d => (d.id === updated.id ? { ...d, ...updated } : d)),
      );
      cancelEdit();
    } catch (err: any) {
      setError(err.message || 'Failed to update deck');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (deck: Deck) => {
    if (!token) {
      return;
    }

    setError(null);
    try {
      await deleteDeck(token, deck.id);
      setDecks(current => current.filter(d => d.id !== deck.id));
      if (editingId === deck.id) {
        cancelEdit();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete deck');
    }
  };

  if (!token) {
    return (
      <GlassScreen>
        <View style={styles.centerMessage}>
          <Text style={styles.title}>Sign in required</Text>
          <Text style={styles.subtitle}>
            Please log in as a teacher or admin to manage decks.
          </Text>
        </View>
      </GlassScreen>
    );
  }

  return (
    <GlassScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Deck generator</Text>
        <Text style={styles.subtitle}>
          Generate structured slide decks from a topic using your AI service.
        </Text>

        <GlassCard style={styles.card}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Topic</Text>
              <TextInput
                placeholder="Intro to fractions"
                placeholderTextColor="rgba(148,163,184,0.8)"
                style={styles.input}
                value={topic}
                onChangeText={setTopic}
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                placeholder="Mathematics"
                placeholderTextColor="rgba(148,163,184,0.8)"
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
              />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Grade level</Text>
              <TextInput
                placeholder="Grade 5"
                placeholderTextColor="rgba(148,163,184,0.8)"
                style={styles.input}
                value={gradeLevel}
                onChangeText={setGradeLevel}
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Slides</Text>
              <TextInput
                placeholder="10"
                keyboardType="number-pad"
                placeholderTextColor="rgba(148,163,184,0.8)"
                style={styles.input}
                value={numSlides}
                onChangeText={setNumSlides}
              />
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {editingId ? (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                activeOpacity={0.9}
                disabled={submitting}
                onPress={cancelEdit}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.9}
                disabled={submitting}
                onPress={handleSaveEdit}>
                {submitting ? (
                  <ActivityIndicator color="#e5e7eb" />
                ) : (
                  <Text style={styles.buttonText}>Save changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.9}
              disabled={submitting}
              onPress={handleGenerate}>
              {submitting ? (
                <ActivityIndicator color="#e5e7eb" />
              ) : (
                <Text style={styles.buttonText}>Generate deck</Text>
              )}
            </TouchableOpacity>
          )}
        </GlassCard>

        <GlassCard style={styles.cardList}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Your decks</Text>
            {loading && <ActivityIndicator size="small" color="#e5e7eb" />}
          </View>

          {decks.length === 0 && !loading ? (
            <Text style={styles.emptyText}>
              No decks yet. Generate your first deck with the form above.
            </Text>
          ) : (
            decks.map(deck => (
              <View key={deck.id} style={styles.listItem}>
                <TouchableOpacity
                  style={styles.listItemMain}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('DeckDetail', { deckId: deck.id })}>
                  <Text style={styles.itemTitle}>{deck.title}</Text>
                  <Text style={styles.itemMeta}>
                    {deck.subject} • {deck.grade_level}
                  </Text>
                  <Text style={styles.viewHint}>Tap to view →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBadge}
                  activeOpacity={0.8}
                  onPress={() => handleDelete(deck)}>
                  <Text style={styles.deleteBadgeText}>Delete</Text>
                </TouchableOpacity>
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
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  fieldHalf: {
    flex: 1,
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
  },
  error: {
    color: '#fca5a5',
    marginBottom: 8,
  },
  button: {
    marginTop: 4,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(129,140,248,0.9)',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e5e7eb',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemMain: {
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
  deleteBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.6)',
  },
  deleteBadgeText: {
    fontSize: 12,
    color: '#fca5a5',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
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
  viewHint: {
    fontSize: 12,
    color: '#38bdf8',
    marginTop: 4,
  },
});

export default DecksScreen;
