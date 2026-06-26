import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Ya'];

function MiniBar({ value, max, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value / (max || 1), duration: 900, useNativeDriver: false }).start();
  }, [value, max]);
  const height = anim.interpolate({ inputRange: [0, 1], outputRange: [4, 80] });
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ height: 80, justifyContent: 'flex-end' }}>
        <Animated.View style={{ width: 22, borderRadius: 6, backgroundColor: color, height }} />
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const [habits, setHabits] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('habits').then(data => {
      if (data) setHabits(JSON.parse(data));
    }).catch(() => {});
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.progress === 100).length;
  const avgProgress = totalHabits > 0
    ? Math.round(habits.reduce((s, h) => s + (h.progress || 0), 0) / totalHabits)
    : 0;
  const maxStreak = habits.reduce((m, h) => Math.max(m, h.streak || 0), 0);

  // Har bir hafta kuni uchun taxminiy qiymat (mock)
  const weekData = DAYS.map((_, i) => ({
    label: DAYS[i],
    value: Math.round(avgProgress * (0.6 + Math.random() * 0.4)),
  }));
  const maxVal = Math.max(...weekData.map(d => d.value), 1);

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Statistika 📊</Text>

      {/* Karta qatori */}
      <View style={styles.statGrid}>
        {[
          { label: 'Jami odat', value: totalHabits, color: '#10B981', icon: '🎯' },
          { label: 'Bajarildi', value: completedHabits, color: '#6366F1', icon: '✅' },
          { label: "O'rt. progress", value: `${avgProgress}%`, color: '#3B82F6', icon: '📈' },
          { label: 'Maks streak', value: `${maxStreak} kun`, color: '#F59E0B', icon: '🔥' },
        ].map(item => (
          <View key={item.label} style={[styles.statCard, { borderColor: item.color + '30' }]}>
            <Text style={styles.statIcon}>{item.icon}</Text>
            <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Haftalik grafik */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Haftalik faollik</Text>
        <View style={styles.barChart}>
          {weekData.map((d, i) => (
            <View key={i} style={styles.barCol}>
              <MiniBar value={d.value} max={maxVal} color="#10B981" />
              <Text style={styles.barLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top odatlar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top odatlar</Text>
        {habits.length === 0 ? (
          <Text style={styles.emptyText}>Hozircha odat yo'q</Text>
        ) : (
          habits
            .sort((a, b) => (b.streak || 0) - (a.streak || 0))
            .slice(0, 3)
            .map((h, i) => (
              <View key={h.id} style={styles.topHabitRow}>
                <Text style={styles.topRank}>#{i + 1}</Text>
                <View style={[styles.topIcon, { backgroundColor: h.color + '20' }]}>
                  <Text>{h.icon}</Text>
                </View>
                <Text style={styles.topName}>{h.name}</Text>
                <Text style={[styles.topStreak, { color: h.color }]}>🔥 {h.streak || 0}</Text>
              </View>
            ))
        )}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '900', color: '#F1F5F9', marginBottom: 24, marginTop: 8 },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, minWidth: '44%', backgroundColor: '#1E293B', borderRadius: 16,
    padding: 18, alignItems: 'center', borderWidth: 1,
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '500', textAlign: 'center' },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#94A3B8', marginBottom: 16 },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#1E293B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' },
  barCol: { flex: 1, alignItems: 'center' },
  barLabel: { fontSize: 11, color: '#64748B', marginTop: 8, fontWeight: '600' },

  topHabitRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#334155', gap: 10 },
  topRank: { fontSize: 14, fontWeight: '800', color: '#64748B', width: 24 },
  topIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  topName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#F1F5F9' },
  topStreak: { fontSize: 13, fontWeight: '700' },

  emptyText: { color: '#475569', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
});
