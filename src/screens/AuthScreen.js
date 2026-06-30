import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthScreen({ onComplete }) {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const tabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    Animated.timing(tabAnim, {
      toValue: tab === 'signin' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const validate = () => {
    const e = {};
    if (!email.trim()) {
      e.email = 'Email kiritish shart';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = "Email noto'g'ri formatda";
    }
    if (!password) {
      e.password = 'Parol kiritish shart';
    } else if (password.length < 6) {
      e.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak";
    }
    if (activeTab === 'signup') {
      if (!confirmPassword) {
        e.confirmPassword = 'Parolni tasdiqlang';
      } else if (password !== confirmPassword) {
        e.confirmPassword = 'Parollar mos kelmadi';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAuth = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      const userData = { email: email.trim(), isGuest: false, authType: activeTab };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      onComplete(userData);
    } catch {
      Alert.alert('Xato', "Nimadir noto'g'ri ketdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    try {
      const userData = { email: 'guest', isGuest: true };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      onComplete(userData);
    } catch {
      Alert.alert('Xato', "Mehmon rejimida kirib bo'lmadi.");
    }
  };

  const tabIndicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '50%'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>⚡ Focus AI</Text>
            <Text style={styles.subtitle}>
              {activeTab === 'signin' ? 'Hisobingizga kiring' : 'Yangi hisob yarating'}
            </Text>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabContainer}>
            <Animated.View style={[styles.tabIndicator, { left: tabIndicatorLeft }]} />
            <TouchableOpacity style={styles.tab} onPress={() => switchTab('signin')}>
              <Text style={[styles.tabText, activeTab === 'signin' && styles.tabTextActive]}>
                Kirish
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => switchTab('signup')}>
              <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                Ro'yxatdan o'tish
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputRow, errors.email && styles.inputRowError]}>
                <Text style={styles.icon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: null })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Parol */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parol</Text>
              <View style={[styles.inputRow, errors.password && styles.inputRowError]}>
                <Text style={styles.icon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#475569"
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: null })); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Text style={styles.icon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Parolni tasdiqlash (faqat signup) */}
            {activeTab === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Parolni tasdiqlang</Text>
                <View style={[styles.inputRow, errors.confirmPassword && styles.inputRowError]}>
                  <Text style={styles.icon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#475569"
                    value={confirmPassword}
                    onChangeText={t => { setConfirmPassword(t); setErrors(p => ({ ...p, confirmPassword: null })); }}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                    <Text style={styles.icon}>{showConfirm ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
              </View>
            )}

            {/* Parolni unutdingizmi */}
            {activeTab === 'signin' && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Parolni unutdingizmi?</Text>
              </TouchableOpacity>
            )}

            {/* Asosiy tugma */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#0F172A" />
                : <Text style={styles.submitText}>
                    {activeTab === 'signin' ? 'Kirish' : "Ro'yxatdan o'tish"}
                  </Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>yoki</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google tugmasi */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() =>
                Alert.alert(
                  '🔒 Google kirish',
                  "Google orqali tizimga kirish hozirda test rejimida. Iltimos, Mehmon sifatida kiring! 🚀",
                  [{ text: 'Tushunarli', style: 'default' }]
                )
              }
            >
              <View style={styles.googleIconCircle}>
                <Text style={styles.googleLetter}>G</Text>
              </View>
              <Text style={styles.googleText}>Google orqali kirish</Text>
            </TouchableOpacity>

            {/* Mehmon rejimi */}
            <TouchableOpacity style={styles.guestBtn} onPress={handleGuest}>
              <Text style={styles.guestText}>👤  Mehmon sifatida kirish</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  content: { flex: 1 },

  // Header
  header: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 32, fontWeight: '900', color: '#10B981', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', fontWeight: '500' },

  // Tab
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 4,
    marginBottom: 32,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    width: '48%',
    top: 4,
    bottom: 4,
    backgroundColor: '#10B981',
    borderRadius: 10,
  },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#0F172A' },

  // Form
  form: { gap: 4 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8, marginLeft: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
  },
  inputRowError: { borderColor: '#EF4444' },
  icon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#F1F5F9', fontSize: 15, paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 6, marginLeft: 4 },

  // Forgot
  forgotBtn: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 8 },
  forgotText: { fontSize: 13, color: '#10B981', fontWeight: '500' },

  // Submit
  submitBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1E293B' },
  dividerText: { color: '#475569', fontSize: 13, marginHorizontal: 12 },

  // Google
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  googleIconCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  googleLetter: { fontSize: 14, fontWeight: '800', color: '#EA4335' },
  googleText: { fontSize: 15, fontWeight: '600', color: '#F1F5F9' },

  // Guest
  guestBtn: { alignItems: 'center', paddingVertical: 16, marginTop: 4 },
  guestText: { fontSize: 14, color: '#475569', fontWeight: '500' },
});
