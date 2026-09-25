import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, GraduationCap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#13c8ec';
const DARK_BG = '#101f22';
const CARD_BG = 'rgba(19, 200, 236, 0.05)';
const BORDER = 'rgba(19, 200, 236, 0.2)';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      setError(e?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
      {/* Background glow blobs */}
      <View style={styles.blobTR} />
      <View style={styles.blobBL} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={22} color="#f1f5f9" />
            </TouchableOpacity>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <GraduationCap size={18} color={DARK_BG} strokeWidth={2.5} />
              </View>
              <Text style={styles.logoText}>Sikhsha AI</Text>
            </View>
            <View style={styles.spacer} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Please sign in to continue your learning journey with our intelligent tutors.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputRow}>
                <Mail size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <Lock size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="Enter your password"
                  placeholderTextColor="#475569"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn} activeOpacity={0.7}>
                  {showPass
                    ? <EyeOff size={18} color="#64748b" />
                    : <Eye size={18} color="#64748b" />
                  }
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember me */}
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.rememberText}>Keep me signed in</Text>
            </TouchableOpacity>

            {/* Error */}
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            {/* Submit */}
            <TouchableOpacity style={styles.signInBtn} onPress={handleLogin} activeOpacity={0.85}>
              <LinearGradient
                colors={[PRIMARY, '#0db8d9']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.btnText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_BG },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  blobTR: {
    position: 'absolute', top: -80, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(19, 200, 236, 0.08)',
  },
  blobBL: {
    position: 'absolute', bottom: -60, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(19, 200, 236, 0.04)',
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#f1f5f9', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  spacer: { width: 44 },
  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  title: { color: '#f1f5f9', fontSize: 34, fontWeight: '700', letterSpacing: -0.5, marginBottom: 10 },
  subtitle: { color: '#94a3b8', fontSize: 15, lineHeight: 24 },
  form: { paddingHorizontal: 24, gap: 20 },
  fieldGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#f1f5f9', fontSize: 13, fontWeight: '600' },
  forgotText: { color: PRIMARY, fontSize: 12, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, height: 54, paddingHorizontal: 14, gap: 10,
  },
  inputIcon: {},
  input: { flex: 1, color: '#f1f5f9', fontSize: 15 },
  inputFlex: { flex: 1 },
  eyeBtn: { padding: 4 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
    borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { borderColor: PRIMARY, backgroundColor: PRIMARY },
  checkboxInner: { width: 10, height: 10, borderRadius: 2, backgroundColor: DARK_BG },
  rememberText: { color: '#94a3b8', fontSize: 14 },
  errorText: { color: '#f87171', fontSize: 13, textAlign: 'center' },
  signInBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  btnGradient: { height: 54, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: DARK_BG, fontSize: 16, fontWeight: '700' },
});

export default LoginScreen;
