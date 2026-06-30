import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Animated, Modal, TextInput, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const DAYS_UZ = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
const MONTHS_UZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

const HABIT_COLORS = ['#10B981', '#6366F1', '#3B82F6', '#EC4899', '#F59E0B', '#EF4444', '#8B5CF6'];
const HABIT_ICONS = ['🎯', '📚', '💪', '🧘', '💧', '🏃', '✍️', '🎵', '🌿', '⏱️'];


// ── Progress bar ──────────────────────────────────────────────
function ProgressBar({ progress, color }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: progress, duration: 800, useNativeDriver: false }).start();
  }, [progress]);

  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width, backgroundColor: color }]} />
    </View>
  );
}

// ── Odat kartasi ──────────────────────────────────────────────
function HabitCard({ item, onPress, onLongPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => onPress(item));
  };

  return (
    <Animated.View style={[styles.habitCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} onLongPress={() => onLongPress(item)} activeOpacity={0.9}>
        <View style={styles.habitHeader}>
          <View style={[styles.habitIconBox, { backgroundColor: item.color + '20' }]}>
            <Text style={styles.habitIcon}>{item.icon}</Text>
          </View>
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{item.name}</Text>
            <Text style={styles.habitTime}>⏱ {item.time}</Text>
          </View>
          <View style={styles.habitRight}>
            <Text style={styles.habitPercent}>{item.progress}%</Text>
            {item.streak > 0 && (
              <Text style={styles.habitStreak}>🔥 {item.streak}</Text>
            )}
          </View>
        </View>
        <ProgressBar progress={item.progress} color={item.color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Odat qo'shish modal ───────────────────────────────────────
function AddHabitModal({ visible, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [time, setTime] = useState('');

  const handleAdd = () => {
    if (!name.trim()) { Alert.alert('Xato', 'Odat nomini kiriting'); return; }
    if (!time.trim()) { Alert.alert('Xato', 'Vaqtni kiriting'); return; }
    onAdd({ name: name.trim(), icon: selectedIcon, color: selectedColor, time: time.trim() });
    setName(''); setTime(''); setSelectedIcon(HABIT_ICONS[0]); setSelectedColor(HABIT_COLORS[0]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Yangi odat</Text>

          <Text style={styles.modalLabel}>Odat nomi</Text>
          <View style={styles.modalInput}>
            <TextInput
              style={styles.modalInputText}
              placeholder="Masalan: Kitob o'qish"
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={styles.modalLabel}>Vaqt</Text>
          <View style={styles.modalInput}>
            <TextInput
              style={styles.modalInputText}
              placeholder="Masalan: 30 daqiqa"
              placeholderTextColor="#475569"
              value={time}
              onChangeText={setTime}
            />
          </View>

          <Text style={styles.modalLabel}>Ikonka</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconRow}>
            {HABIT_ICONS.map(icon => (
              <TouchableOpacity
                key={icon}
                style={[styles.iconOption, selectedIcon === icon && { backgroundColor: selectedColor + '40', borderColor: selectedColor }]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.iconOptionText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.modalLabel}>Rang</Text>
          <View style={styles.colorRow}>
            {HABIT_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.colorOptionSelected]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.modalAddBtn} onPress={handleAdd}>
            <Text style={styles.modalAddText}>Qo'shish</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
            <Text style={styles.modalCancelText}>Bekor qilish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Asosiy Dashboard ──────────────────────────────────────────
export default function DashboardScreen({ navigation, route }) {
  const user = route?.params?.user;
  const { colors } = useTheme();
  const [habits, setHabits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const now = new Date();
  const dateStr = `${DAYS_UZ[now.getDay()]}, ${now.getDate()} ${MONTHS_UZ[now.getMonth()]}`;
  const totalStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  const userName = user?.email?.split('@')[0] || 'Foydalanuvchi';

  useEffect(() => {
    loadHabits();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  const loadHabits = async () => {
    try {
      const saved = await AsyncStorage.getItem('habits');
      setHabits(saved ? JSON.parse(saved) : []);
    } catch {
      setHabits([]);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  };

  const saveHabits = async (updated) => {
    setHabits(updated);
    await AsyncStorage.setItem('habits', JSON.stringify(updated));
  };

  const addHabit = async ({ name, icon, color, time }) => {
    const newHabit = {
      id: Date.now().toString(),
      name, icon, color, time,
      progress: 0,
      streak: 0,
    };
    const updated = [...habits, newHabit];
    await saveHabits(updated);
    setShowModal(false);
  };

  const deleteHabit = (item) => {
    Alert.alert(
      'Odatni o\'chirish',
      `"${item.name}" odatini o'chirmoqchimisiz?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish", style: 'destructive',
          onPress: async () => {
            const updated = habits.filter(h => h.id !== item.id);
            await saveHabits(updated);
          },
        },
      ]
    );
  };

  const completedCount = habits.filter(h => h.progress === 100).length;

  const renderHeader = () => (
    <View>
      <View style={styles.greetingRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Salom, {userName}! 👋</Text>
          <Text style={[styles.date, { color: colors.sub }]}>{dateStr}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakNum}>{totalStreak}</Text>
          <Text style={styles.streakLabel}>kun</Text>
        </View>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{habits.length}</Text>
          <Text style={styles.summaryLabel}>Jami odat</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#10B981' }]}>{completedCount}</Text>
          <Text style={styles.summaryLabel}>Bajarildi</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#6366F1' }]}>{habits.length - completedCount}</Text>
          <Text style={styles.summaryLabel}>Qoldi</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.sub }]}>Bugungi odatlar</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🎯</Text>
      <Text style={styles.emptyTitle}>Hozircha odatlar yo'q</Text>
      <Text style={styles.emptySubtitle}>
        Birinchi odatingizni qo'shing!{'\n'}Har kuni kichik qadamlar katta o'zgarishlarga olib keladi.
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
        <Text style={styles.emptyBtnText}>＋  Odat qo'shish</Text>
      </TouchableOpacity>
      <Text style={styles.emptyHint}>yoki pastdagi + tugmasini bosing</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <FlatList
          data={habits}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <HabitCard
              item={item}
              onPress={(h) => navigation.navigate('Session', { habit: h })}
              onLongPress={deleteHabit}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={!loading ? renderEmpty : null}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddHabitModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addHabit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  listContent: { padding: 20, paddingBottom: 80 },

  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#F1F5F9', marginBottom: 4 },
  date: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  streakBadge: { alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#F59E0B40' },
  streakFire: { fontSize: 20 },
  streakNum: { fontSize: 20, fontWeight: '900', color: '#F59E0B' },
  streakLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },

  summaryCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: '#334155' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 26, fontWeight: '900', color: '#F1F5F9', marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  summaryDivider: { width: 1, backgroundColor: '#334155', marginVertical: 4 },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#94A3B8', marginBottom: 14 },

  habitCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  habitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  habitIconBox: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  habitIcon: { fontSize: 22 },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 15, fontWeight: '700', color: '#F1F5F9', marginBottom: 3 },
  habitTime: { fontSize: 12, color: '#64748B' },
  habitRight: { alignItems: 'flex-end' },
  habitPercent: { fontSize: 16, fontWeight: '800', color: '#F1F5F9', marginBottom: 2 },
  habitStreak: { fontSize: 12, color: '#F59E0B' },

  progressTrack: { height: 6, backgroundColor: '#0F172A', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#F1F5F9', marginBottom: 10 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  emptyBtn: { backgroundColor: '#10B981', paddingVertical: 15, paddingHorizontal: 36, borderRadius: 16, shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  emptyBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 16 },
  emptyHint: { fontSize: 12, color: '#334155', marginTop: 16, fontWeight: '500' },

  fab: {
    position: 'absolute', right: 24, bottom: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  fabIcon: { fontSize: 28, color: '#0F172A', fontWeight: '300', marginTop: -2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#1E293B', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#F1F5F9', marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8, marginTop: 12 },
  modalInput: { backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 14 },
  modalInputText: { color: '#F1F5F9', fontSize: 15, paddingVertical: 13 },
  iconRow: { marginBottom: 4 },
  iconOption: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: 'transparent', backgroundColor: '#0F172A' },
  iconOptionText: { fontSize: 22 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  colorOption: { width: 32, height: 32, borderRadius: 16 },
  colorOptionSelected: { borderWidth: 3, borderColor: '#F1F5F9' },
  modalAddBtn: { backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  modalAddText: { color: '#0F172A', fontWeight: '800', fontSize: 16 },
  modalCancelBtn: { alignItems: 'center', paddingVertical: 14 },
  modalCancelText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
});
