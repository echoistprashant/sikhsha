import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useRoute} from '@react-navigation/native';
import GlassScreen from '../../components/GlassScreen';
import GlassCard from '../../components/GlassCard';
import type {TeacherStackParamList} from '../../navigation/TeacherNavigator';
import type {RouteProp} from '@react-navigation/native';

type ConceptDetailRoute = RouteProp<TeacherStackParamList, 'ConceptDetail'>;

const ConceptDetailScreen: React.FC = () => {
  const route = useRoute<ConceptDetailRoute>();
  const concept = route.params.concept;

  return (
    <GlassScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>{concept.name}</Text>
        <Text style={styles.meta}>
          {concept.subject} • {concept.grade_level}
        </Text>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {concept.description || 'No description available.'}
          </Text>
        </GlassCard>
      </ScrollView>
    </GlassScreen>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 16,
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
  description: {
    fontSize: 14,
    color: '#e5e7eb',
  },
});

export default ConceptDetailScreen;
