import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Modal, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width: SW } = Dimensions.get('window');
const RING_SIZE = SW * 0.74;
const STROKE = 18;

// ── Yordamchi funksiyalar ─────────────────────────────────────
const parseTargetMs = (timeStr) => {
  if (!timeStr) return 25 * 60 * 1000;
  const m = timeStr.match(/(\d+)\s*(soat|daqiqa|minut|min)/i);
  if (!m) return 25 * 60 * 1000;
  const n = parseInt(m[1]);
  return m[2].toLowerCase() === 'soat' ? n * 3600000 : n * 60000;
};

const formatTime = (ms) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${String(h).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
};

// Odat turiga qarab yutuq matnini aniqlash
const getAchievement = (habit) => {
  const name = (habit?.name || '').toLowerCase();
  const icon = habit?.icon || '';

  const isPhysical = /sport|yugur|gym|jismoniy|trening|mashq/.test(name) || ['💪', '🏃', '⚽', '🏋️', '🚴'].includes(icon);
  const isLearning = /kitob|o'qi|kurs|o'rgan|bilim|dars/.test(name) || ['📚', '📖', '🎓', '✏️'].includes(icon);
  const isMeditation = /meditatsiya|yoga|nafas|dam ol|relaks/.test(name) || ['🧘', '🌿', '☮️'].includes(icon);
  const isHealth = /suv|vitamin|uyqu|sog'l|oziq/.test(name) || ['💧', '💊', '🥗', '😴'].includes(icon);
  const isCreative = /musiqa|rasm|yozish|san'at|ijod|kod/.test(name) || ['🎵', '🎨', '✍️', '🎶', '💻'].includes(icon);

  if (isPhysical) return {
    title: 'BEAST MODE!', emojis: '🔥💪',
    subtitle: 'Sen bugun o\'zingni yengding, chempion!',
  };
  if (isLearning) return {
    title: 'SUPER AQLDON!', emojis: '🧠⚡',
    subtitle: 'Bilim — eng kuchli qurol!',
  };
  if (isMeditation) return {
    title: 'ZEN MASTER!', emojis: '🌸✨',
    subtitle: 'Ruhingiz tindi, qalbingiz ozod!',
  };
  if (isHealth) return {
    title: 'HEALTH HERO!', emojis: '💧🌿',
    subtitle: 'Tanangiz rahmat aytmoqda!',
  };
  if (isCreative) return {
    title: 'CREATIVE GENIUS!', emojis: '🎨🚀',
    subtitle: 'San\'at — sizning superguching!',
  };
  return {
    title: 'MAQSAD ZABT ETILDI!', emojis: '🏆🎯',
    subtitle: 'Vaqtingizni to\'g\'ri sarfladingiz!',
  };
};

// ── SVG Progress Ring ─────────────────────────────────────────
function ProgressRing({ progress, color, children }) {
  const r = (RING_SIZE - STROKE) / 2;
  const cx = RING_SIZE / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress / 100)));

  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={RING_SIZE} height={RING_SIZE}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={cx} cy={cx} r={r} stroke="#1E293B" strokeWidth={STROKE} fill="none" />
        <Circle cx={cx} cy={cx} r={r} stroke={color} strokeWidth={STROKE + 8} fill="none"
          strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset}
          strokeLinecap="round" opacity={0.15} />
        <Circle cx={cx} cy={cx} r={r} stroke={color} strokeWidth={STROKE} fill="none"
          strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset}
          strokeLinecap="round" />
      </Svg>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}

// ── Konfetti ──────────────────────────────────────────────────
const C_COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6', '#EF4444', '#F8FAFC'];
const CONFETTI = Array.from({ length: 32 }, (_, i) => ({
  id: i, color: C_COLORS[i % C_COLORS.length],
  x: (Math.random() - 0.5) * 380, y: -(80 + Math.random() * 540),
  rot: Math.random() * 720 - 360, delay: Math.floor(Math.random() * 500),
  size: 6 + Math.random() * 10, isCircle: Math.random() > 0.5,
}));

function ConfettiPiece({ d }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(anim, { toValue: 1, duration: 1600, useNativeDriver: true }).start();
    }, d.delay);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', width: d.size, height: d.size,
      borderRadius: d.isCircle ? d.size / 2 : 2, backgroundColor: d.color,
      opacity: anim.interpolate({ inputRange: [0, 0.65, 1], outputRange: [1, 1, 0] }),
      transform: [
        { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, d.x] }) },
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, d.y] }) },
        { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${d.rot}deg`] }) },
      ],
    }} />
  );
}

// ── Yutuq modali ──────────────────────────────────────────────
function AchievementModal({ visible, habit, elapsedMs, progress, onClose }) {
  const achievement = getAchievement(habit);
  const color = habit?.color || '#10B981';
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      Animated.spring(bounceAnim, {
        toValue: 1, tension: 40, friction: 5, useNativeDriver: true,
      }).start();
    } else {
      bounceAnim.setValue(0);
      setShowConfetti(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        {/* Konfetti */}
        {showConfetti && (
          <View style={styles.confettiCenter} pointerEvents="none">
            {CONFETTI.map(d => <ConfettiPiece key={d.id} d={d} />)}
          </View>
        )}

        <View style={[styles.modalBox, { borderColor: color + '40' }]}>
          {/* Katta emoji - bounce animatsiya */}
          <Animated.Text style={[styles.modalEmoji, {
            transform: [{ scale: bounceAnim.interpolate({ inputRange: [0, 0.5, 0.75, 1], outputRange: [0, 1.3, 0.9, 1] }) }],
          }]}>
            {achievement.emojis}
          </Animated.Text>

          <Text style={[styles.modalTitle, { color }]}>{achievement.title}</Text>
          <Text style={styles.modalSubtitle}>{achievement.subtitle}</Text>

          {/* Statistika */}
          <View style={[styles.modalStatRow, { borderColor: color + '30' }]}>
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatNum, { color }]}>{formatTime(elapsedMs)}</Text>
              <Text style={styles.modalStatLabel}>sarflangan vaqt</Text>
            </View>
            <View style={[styles.modalStatDivider, { backgroundColor: color + '30' }]} />
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatNum, { color }]}>{Math.floor(progress)}%</Text>
              <Text style={styles.modalStatLabel}>bajarildi</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.modalBtn, { backgroundColor: color, shadowColor: color }]} onPress={onClose}>
            <Text style={styles.modalBtnText}>Davom etish 🚀</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Asosiy ekran ──────────────────────────────────────────────
export default function SessionScreen({ route, navigation }) {
  const habit = route?.params?.habit || {};

  const handleBack = () => navigation?.goBack();
  const onComplete = () => navigation?.goBack();

  const targetMs = parseTargetMs(habit?.time);
  const color = habit?.color || '#10B981';

  const [status, setStatus] = useState('idle');
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const runningSince = useRef(null);
  const intervalRef = useRef(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  useEffect(() => {
    if (status === 'running') {
      pulseLoop.current = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.025, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ]));
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        const current = accumulatedMs + (Date.now() - runningSince.current);
        setElapsedMs(current);
        if (current >= targetMs) triggerComplete(current);
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [status, accumulatedMs, targetMs]);

  const saveProgress = async (elapsedMs) => {
    try {
      const raw = await AsyncStorage.getItem('habits');
      const habits = JSON.parse(raw || '[]');
      const updated = habits.map(h => {
        if (h.id !== habit?.id) return h;
        const newAccumulated = (h.accumulatedMs || 0) + elapsedMs;
        const completed = elapsedMs >= targetMs;
        return {
          ...h,
          accumulatedMs: newAccumulated,
          lastSession: Date.now(),
          progress: completed ? 100 : Math.min(99, Math.floor((newAccumulated / targetMs) * 100)),
          streak: completed ? (h.streak || 0) + 1 : h.streak || 0,
        };
      });
      await AsyncStorage.setItem('habits', JSON.stringify(updated));
    } catch {}
  };

  const triggerComplete = (finalMs) => {
    clearInterval(intervalRef.current);
    setStatus('completed');
    setElapsedMs(finalMs ?? elapsedMs);
    setShowModal(true);
    saveProgress(finalMs ?? elapsedMs);
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
  };

  const handleStart = () => {
    runningSince.current = Date.now();
    setStatus('running');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
  };

  const handlePause = () => {
    setAccumulatedMs(p => p + (Date.now() - runningSince.current));
    runningSince.current = null;
    setStatus('paused');
  };

  const handleResume = () => {
    runningSince.current = Date.now();
    setStatus('running');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  };

  const handleFinish = () => {
    const finalMs = status === 'running'
      ? accumulatedMs + (Date.now() - runningSince.current)
      : accumulatedMs;
    if (status === 'running') runningSince.current = null;
    triggerComplete(finalMs);
  };

  const progress = Math.min(100, (elapsedMs / targetMs) * 100);

  const statusLabels = {
    idle: 'Boshlashga tayyor',
    running: '🟢  Davom etmoqda...',
    paused: '⏸  Pauza',
    completed: '✅  Bajarildi!',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fokus sessiyasi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Odat chipi */}
      <View style={[styles.habitChip, { backgroundColor: color + '20', borderColor: color + '50' }]}>
        <Text style={styles.habitChipIcon}>{habit?.icon || '🎯'}</Text>
        <Text style={[styles.habitChipName, { color }]}>{habit?.name || 'Sessiya'}</Text>
      </View>

      {/* Progress ring */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <ProgressRing progress={progress} color={color}>
          <Text style={styles.timeText}>{formatTime(elapsedMs)}</Text>
          <Text style={[styles.percentText, { color }]}>{Math.floor(progress)}%</Text>
          <Text style={styles.targetText}>Maqsad: {habit?.time || '25 daqiqa'}</Text>
        </ProgressRing>
      </Animated.View>

      <Text style={styles.statusLabel}>{statusLabels[status]}</Text>

      {/* Tugmalar */}
      <View style={styles.controls}>
        {status === 'idle' && (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: color, shadowColor: color }]} onPress={handleStart}>
            <Text style={styles.primaryBtnText}>▶  Boshlash</Text>
          </TouchableOpacity>
        )}
        {status === 'running' && (
          <TouchableOpacity style={styles.pauseBtn} onPress={handlePause}>
            <Text style={styles.pauseBtnText}>⏸  Pauza</Text>
          </TouchableOpacity>
        )}
        {status === 'paused' && (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: color, shadowColor: color }]} onPress={handleResume}>
            <Text style={styles.primaryBtnText}>▶  Davom etish</Text>
          </TouchableOpacity>
        )}
        {(status === 'running' || status === 'paused') && (
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
            <Text style={styles.finishBtnText}>⏹  Yakunlash</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Yutuq modali */}
      <AchievementModal
        visible={showModal}
        habit={habit}
        elapsedMs={elapsedMs}
        progress={progress}
        onClose={() => { setShowModal(false); onComplete(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingTop: 56, marginBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: 12 },
  backIcon: { fontSize: 20, color: '#94A3B8' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#F1F5F9' },

  habitChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, borderWidth: 1, marginBottom: 28 },
  habitChipIcon: { fontSize: 20 },
  habitChipName: { fontSize: 16, fontWeight: '700' },

  timeText: { fontSize: 52, fontWeight: '900', color: '#F1F5F9', letterSpacing: -2 },
  percentText: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  targetText: { fontSize: 13, color: '#64748B', marginTop: 6 },

  statusLabel: { fontSize: 15, color: '#64748B', fontWeight: '500', marginTop: 24, marginBottom: 36 },

  controls: { width: '100%', paddingHorizontal: 28, gap: 12 },
  primaryBtn: { borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  primaryBtnText: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  pauseBtn: { borderRadius: 18, paddingVertical: 18, alignItems: 'center', backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  pauseBtnText: { fontSize: 18, fontWeight: '700', color: '#F1F5F9' },
  finishBtn: { borderRadius: 18, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  finishBtnText: { fontSize: 15, fontWeight: '600', color: '#64748B' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  confettiCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: '40%' },
  modalBox: { backgroundColor: '#1E293B', borderRadius: 28, padding: 32, alignItems: 'center', width: '100%', borderWidth: 1 },
  modalEmoji: { fontSize: 72, marginBottom: 14 },
  modalTitle: { fontSize: 26, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  modalStatRow: { flexDirection: 'row', borderWidth: 1, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, marginBottom: 24, width: '100%' },
  modalStatItem: { flex: 1, alignItems: 'center' },
  modalStatNum: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  modalStatLabel: { fontSize: 12, color: '#64748B' },
  modalStatDivider: { width: 1, marginVertical: 4 },
  modalBtn: { width: '100%', borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  modalBtnText: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
});
