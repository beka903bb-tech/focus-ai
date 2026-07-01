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
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
    setEmail('');
    Animated.timing(tabAnim, { toValue: tab === 'signin' ? 0 : 1, duration: 250, useNativeDriver: false }).start();
  };

  const validateEmail = () => {
    if (!email.trim()) {
      Alert.alert('Xato', 'Iltimos email kiriting');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Xato', "To'g'ri email kiriting");
      return false;
    }
    return true;
  };

  const handleAuth = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      const userData = { email: email.trim(), isGuest: false, authType: activeTab };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('userEmail', email.trim());
      await AsyncStorage.setItem('isLoggedIn', 'true');
      onComplete(userData);
    } catch {
      Alert.alert('Xato', "Nimadir noto'g'ri ketdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      const googleEmail = 'google.user@gmail.com';
      const userData = { email: googleEmail, name: 'Google User', isGuest: false, authType: 'google', isLoggedIn: true };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('userEmail', googleEmail);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      onComplete(userData);
    } catch {
      Alert.alert('Xato', "Google orqali kirib bo'lmadi.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGuest = async () => {
    try {
      const userData = { email: 'guest', isGuest: true };
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('userEmail', 'Mehmon');
      await AsyncStorage.setItem('isLoggedIn', 'true');
      onComplete(userData);
    } catch {
      Alert.alert('Xato', "Mehmon rejimida kirib bo'lmadi.");
    }
  };

  const tabIndicatorLeft = tabAnim.interpolate({ inputRange: [0, 1], outputRange: ['2%', '50%'] });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
              <Text style={[styles.tabText, activeTab === 'signin' && styles.tabTextActive]}>Kirish</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => switchTab('signup')}>
              <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>Ro'yxatdan o'tish</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputRow}>
                <Text style={styles.icon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

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
              style={[styles.googleBtn, googleLoading && styles.submitBtnDisabled]}
              disabled={googleLoading}
              onPress={handleGoogleLogin}
            >
              {googleLoading ? (
                <ActivityIndicator color="#0F172A" size="small" />
              ) : (
                <>
                  <View style={styles.googleIconCircle}>
                    <Text style={styles.googleLetter}>G</Text>
                  </View>
                  <Text style={styles.googleText}>Google orqali kirish</Text>
                </>
              )}
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

  header: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 32, fontWeight: '900', color: '#10B981', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', fontWeight: '500' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 14, padding: 4, marginBottom: 32, position: 'relative' },
  tabIndicator: { position: 'absolute', width: '48%', top: 4, bottom: 4, backgroundColor: '#10B981', borderRadius: 10 },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#0F172A' },

  form: { gap: 4 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8, marginLeft: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 14 },
  icon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#F1F5F9', fontSize: 15, paddingVertical: 14 },

  submitBtn: { backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1E293B' },
  dividerText: { color: '#475569', fontSize: 13, marginHorizontal: 12 },

  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#334155', gap: 10 },
  googleIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  googleLetter: { fontSize: 14, fontWeight: '800', color: '#EA4335' },
  googleText: { fontSize: 15, fontWeight: '600', color: '#F1F5F9' },

  guestBtn: { alignItems: 'center', paddingVertical: 16, marginTop: 4 },
  guestText: { fontSize: 14, color: '#475569', fontWeight: '500' },
});
