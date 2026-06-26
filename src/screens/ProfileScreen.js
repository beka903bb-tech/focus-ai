import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MENU_ITEMS = [
  { icon: '🔔', label: 'Bildirishnomalar', sub: 'Kundalik eslatmalar' },
  { icon: '🎨', label: 'Mavzu', sub: "Qorong'u rejim" },
  { icon: '📊', label: "Ma'lumotlarni eksport qilish", sub: 'CSV formatda' },
  { icon: '🔒', label: 'Maxfiylik', sub: "Ma'lumotlarim himoyada" },
  { icon: '⭐', label: 'Ilovani baholang', sub: "App Store'da baholash" },
  { icon: '💬', label: "Fikr-mulohaza", sub: 'Muammo yoki taklif' },
];

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) setUser(JSON.parse(data));
    }).catch(() => {});
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Chiqish',
      'Hisobdan chiqmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Chiqish', style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          },
        },
      ]
    );
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '👤';

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Profil 👤</Text>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.emailText}>{user?.isGuest ? 'Mehmon' : (user?.email || 'Foydalanuvchi')}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.isGuest ? '👤 Mehmon' : '✅ Tasdiqlangan'}</Text>
          </View>
        </View>
      </View>

      {/* Menyu */}
      <View style={styles.menuSection}>
        {MENU_ITEMS.map(item => (
          <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.7}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chiqish */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪  Chiqish</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Focus AI v1.0.0</Text>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '900', color: '#F1F5F9', marginBottom: 28, marginTop: 8 },

  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  emailText: { fontSize: 16, fontWeight: '600', color: '#F1F5F9', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: '#1E293B', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#334155' },
  badgeText: { fontSize: 12, color: '#10B981', fontWeight: '600' },

  menuSection: { backgroundColor: '#1E293B', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#334155', marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  menuIcon: { fontSize: 22, marginRight: 14 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#F1F5F9', marginBottom: 2 },
  menuSub: { fontSize: 12, color: '#64748B' },
  menuArrow: { fontSize: 22, color: '#475569' },

  logoutBtn: { backgroundColor: '#1E293B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#EF444440', marginBottom: 20 },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },

  version: { textAlign: 'center', fontSize: 12, color: '#334155', fontWeight: '500' },
});
