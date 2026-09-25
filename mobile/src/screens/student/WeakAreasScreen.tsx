import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const WeakAreasScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weak Areas</Text>
      <Text style={styles.subtitle}>Placeholder for /api/student/weak-areas</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: {fontSize: 24, fontWeight: '600', marginBottom: 8},
  subtitle: {fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 16},
});

export default WeakAreasScreen;
