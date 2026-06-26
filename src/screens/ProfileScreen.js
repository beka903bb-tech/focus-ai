import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, Linking, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('user').then(d => { if (d) setUser(JSON.parse(d)); }).catch(() => {});
    AsyncStorage.getItem('theme').then(t => { if (t) setIsDark(t === 'dark'); }).catch(() => {});
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // 1. Bildirishnomalar
  const handleNotifications = () => {
    Alert.alert('🔔 Bildirishnomalar', "Bildirishnomalar tez orada qo'shiladi!");
  };

  // 2. Mavzu toggle
  const handleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    await AsyncStorage.setItem('theme', newTheme);
    Alert.alert('🎨 Mavzu', `${newTheme === 'dark' ? "Qorong'u" : 'Yorug\''} rejim aktiv`);
  };

  // 3. Eksport
  const handleExport = async () => {
    try {
      const saved = await AsyncStorage.getItem('habits');
      const habits = saved ? JSON.parse(saved) : [];
      Alert.alert(
        '📊 Eksport',
        `${habits.length} ta odat eksport qilindi!\n\n` +
        habits.map(h => `${h.icon} ${h.name} — ${h.progress}%`).join('\n'),
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert('Xato', 'Eksport qilib bo\'lmadi');
    }
  };

  // 4. Maxfiylik
  const handlePrivacy = () => {
    Alert.alert(
      '🔒 Maxfiylik',
      "Barcha ma'lumotlaringiz faqat qurilmangizda saqlanadi. Hech qanday serverga yuborilmaydi.",
      [{ text: 'Tushunarli' }]
    );
  };

  // 5. Baholash
  const handleRate = () => {
    Linking.openURL('market://details?id=com.focusai.app').catch(() => {
      Alert.alert('', 'Ilova hali do\'konda mavjud emas');
    });
  };

  // 6. Fikr-mulohaza
  const handleFeedback = () => {
    Linking.openURL('mailto:bekzod@gmail.com?subject=Focus AI - Fikr mulohaza').catch(() => {
      Alert.alert('', 'Email ilova topilmadi');
    });
  };

  // 7. Chiqish
  const handleLogout = () => {
    Alert.alert(
      '🚪 Chiqish',
      'Hisobdan chiqmoqchimisiz?',
      [
        { text: "Yo'q", style: 'cancel' },
        {
          text: 'Ha', style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          },
        },
      ]
    );
  };

  const MENU_ITEMS = [
    { icon: '🔔', label: 'Bildirishnomalar', sub: 'Kundalik eslatmalar', onPress: handleNotifications },
    { icon: '🎨', label: 'Mavzu', sub: isDark ? "Qorong'u rejim" : "Yorug' rejim", onPress: handleTheme,
      right: <Switch value={isDark} onValueChange={handleTheme} trackColor={{ false: '#334155', true: '#10B981' }} thumbColor="#F1F5F9" /> },
    { icon: '📊', label: "Ma'lumotlarni eksport qilish", sub: 'Odatlar ro\'yxati', onPress: handleExport },
    { icon: '🔒', label: 'Maxfiylik', sub: "Ma'lumotlarim himoyada", onPress: handlePrivacy },
    { icon: '⭐', label: 'Ilovani baholang', sub: "Play Store da baholash", onPress: handleRate },
    { icon: '💬', label: "Fikr-mulohaza", sub: 'Muammo yoki taklif', onPress: handleFeedback },
  ];

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '👤';

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
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, i === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            {item.right || <Text style={styles.menuArrow}>›</Text>}
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
  avatarCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
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
