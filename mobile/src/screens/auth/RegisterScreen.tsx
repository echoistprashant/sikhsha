import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const RegisterScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>Placeholder screen for /api/auth/register</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: {fontSize: 24, fontWeight: '600', marginBottom: 8},
  subtitle: {fontSize: 14, color: '#666'},
});

export default RegisterScreen;
