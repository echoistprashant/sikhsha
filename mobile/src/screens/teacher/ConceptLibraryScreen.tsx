import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import {useAuth} from '../../context/AuthContext';
import {
  getConcepts,
  searchConcepts,
  type Concept,
} from '../../api/teacherApi';
import type {TeacherStackParamList} from '../../navigation/TeacherNavigator';

type ConceptNav = NativeStackNavigationProp<TeacherStackParamList, 'ConceptDetail'>;

const ConceptLibraryScreen: React.FC = () => {
  const {token} = useAuth();
  const navigation = useNavigation<ConceptNav>();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadConcepts = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let data: Concept[];
      if (searchTerm.trim()) {
        data = await searchConcepts(token, searchTerm.trim());
      } else {
        data = await getConcepts(token, {
          subject: subject.trim() || undefined,
          gradeLevel: gradeLevel.trim() || undefined,
        });
      }
      setConcepts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load concepts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    loadConcepts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleOpenConcept = (concept: Concept) => {
    navigation.navigate('ConceptDetail', {concept});
  };

  if (!token) {
    return (
      <GlassScreen>
        <View style={styles.centerMessage}>
          <Text style={styles.title}>Sign in required</Text>
          <Text style={styles.subtitle}>
            Please log in as a teacher or admin to browse the concept library.
          </Text>
        </View>
      </GlassScreen>
    );
  }

  return (
    <GlassScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Concept library</Text>
        <Text style={styles.subtitle}>
          Explore concepts by subject, grade, or keyword.
        </Text>

        <GlassCard style={styles.card}>
          <View style={styles.fieldRow}>
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
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Grade level</Text>
              <TextInput
                placeholder="Grade 6"
                placeholderTextColor="rgba(148,163,184,0.8)"
                style={styles.input}
                value={gradeLevel}
                onChangeText={setGradeLevel}
              />
            </View>
          </View>

          <Text style={styles.label}>Search term</Text>
          <TextInput
            placeholder="fractions, kinetic energy, democracy..."
            placeholderTextColor="rgba(148,163,184,0.8)"
            style={styles.input}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPress={loadConcepts}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#e5e7eb" />
            ) : (
              <Text style={styles.buttonText}>Apply filters</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.cardList}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Concepts</Text>
            {loading && <ActivityIndicator size="small" color="#e5e7eb" />}
          </View>

          {concepts.length === 0 && !loading ? (
            <Text style={styles.emptyText}>
              No concepts found. Try broadening your filters.
            </Text>
          ) : (
            concepts.map(concept => (
              <TouchableOpacity
                key={concept.id}
                style={styles.listItem}
                activeOpacity={0.85}
                onPress={() => handleOpenConcept(concept)}>
                <Text style={styles.itemTitle}>{concept.name}</Text>
                <Text style={styles.itemMeta}>
                  {concept.subject} • {concept.grade_level}
                </Text>
              </TouchableOpacity>
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
    marginBottom: 8,
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
    backgroundColor: 'rgba(59,130,246,0.9)',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
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

export default ConceptLibraryScreen;
