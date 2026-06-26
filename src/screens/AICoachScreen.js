import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GROQ_API_KEY = 'sk-fd34a10cd8054cfbb7229233bff13c5a';
const GROQ_URL = 'https://api.deepseek.com/chat/completions';
const GROQ_MODEL = 'deepseek-chat';

const QUICK_SUGGESTIONS = [
  { label: '📊 Odatlarimni tahlil qil', prompt: "Mening odatlarim va statistikamni batafsil tahlil qilib, kuchli va zaif tomonlarimni ayt." },
  { label: '💪 Bugungi maslahat', prompt: "Bugun uchun eng muhim bir maslahat ber — qisqa va kuchli." },
  { label: '🔥 Motivatsiya ber', prompt: "Meni ilhomlantir! Maqsadlarimga erishishim uchun kuch va ishonch ber." },
  { label: '🎯 Streak oshirish', prompt: "Kundalik seriamni qanday uzmasam bo'ladi? Amaliy maslahat ber." },
];

// Habitsdan AI ga kontekst yasash
const buildSystemPrompt = (habits) => {
  const habitsText = habits.length > 0
    ? habits.map(h =>
        `• ${h.icon} ${h.name}: ${h.progress}% bajarilgan, ${h.streak || 0} kunlik seria, maqsad: ${h.time}`
      ).join('\n')
    : '• Hozircha odatlar yo\'q';

  return `Sen "Focus AI" ilovasining AI murabbiyisan. Foydalanuvchining shaxsiy produktivlik va odatlar bo'yicha yordamchisan.

Foydalanuvchining joriy odatlari va statistikasi:
${habitsText}

Qoidalar:
- DOIM o'zbek tilida javob ber
- Qisqa va konkret javob ber (4-6 jumladan oshirma)
- Ilhomlantiruvchi, ijobiy va do'stona ohangda gapir
- Foydalanuvchining aniq statistikasiga tayanib maslahat ber
- Emojidan o'rinli foydalanib xabarni jonli qil`;
};

// Gemini API chaqiruvi
const PLACEHOLDER_REPLIES = [
  "Ajoyib savol! 🌟 Odatlaringiz statistikasiga qarasam, 48% o'rtacha progress — bu yaxshi boshlanish! Har kuni bir qadam oldinga boring.",
  "Seriangiz 7 kun — bu juda kuchli! 🔥 Maqsad — har hafta shu ko'rsatkichni oshirib borish. Eng muhim odat — izchillik!",
  "Bugun eng muhim maslahat: 🎯 Bitta odatni mukammal bajaring, qolganlar o'z-o'zidan yaxshilanadi. Sifat miqdordan muhimroq!",
  "Motivatsiya vaqtincha bo'ladi, odat esa abadiy! 💪 Siz allaqachon 4 ta odat belgilagansiz — bu katta qadam. Davom eting!",
  "Streak uzilmasligi uchun 🔑: har kuni bir xil vaqtda bajarish. Miyangiz odatni avtomatik bajara boshlaydi. 21 kun sabr qiling!",
];

const askGroq = async (chatHistory, habits) => {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_KEY_HERE') {
    await new Promise(r => setTimeout(r, 900));
    return PLACEHOLDER_REPLIES[Math.floor(Math.random() * PLACEHOLDER_REPLIES.length)];
  }

  const systemPrompt = buildSystemPrompt(habits);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 400,
      temperature: 0.75,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`[${res.status}] ${data?.error?.message || JSON.stringify(data).slice(0, 150)}`);
  return data.choices[0].message.content;
};

const nowTime = () =>
  new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

// ── Typing indicator ──────────────────────────────────────────
function TypingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(Animated.sequence([
        Animated.delay(i * 180),
        Animated.timing(dot, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(540 - i * 180),
      ])).start();
    });
  }, []);

  return (
    <View style={styles.typingRow}>
      <Text style={styles.aiAvatar}>🤖</Text>
      <View style={styles.typingBubble}>
        {dots.map((d, i) => (
          <Animated.View key={i} style={[styles.typingDot, {
            opacity: d,
            transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
          }]} />
        ))}
      </View>
    </View>
  );
}

// ── Xabar pufakchasi ──────────────────────────────────────────
function MessageBubble({ msg }) {
  const isAI = msg.role === 'ai';
  const slideAnim = useRef(new Animated.Value(isAI ? -20 : 20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.msgRow,
      isAI ? styles.msgRowAI : styles.msgRowUser,
      { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
    ]}>
      {isAI && <Text style={styles.aiAvatar}>🤖</Text>}
      <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
        <Text style={[styles.bubbleText, isAI ? styles.bubbleTextAI : styles.bubbleTextUser]}>
          {msg.text}
        </Text>
        <Text style={styles.bubbleTime}>{msg.time}</Text>
      </View>
    </Animated.View>
  );
}

// ── Asosiy ekran ──────────────────────────────────────────────
export default function AICoachScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState([]);
  const [dailyMotivation, setDailyMotivation] = useState('');
  const [motivLoading, setMotivLoading] = useState(true);

  const listRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('habits');
      const loadedHabits = saved ? JSON.parse(saved) : [];
      setHabits(loadedHabits);

      const today = new Date().toDateString();
      const cached = await AsyncStorage.getItem('daily_motiv_' + today);
      if (cached) {
        setDailyMotivation(cached);
        setMotivLoading(false);
      } else {
        await generateDailyMotivation(loadedHabits, today);
      }
    } catch {
      setDailyMotivation("Har bir qadam oldinga — bu g'alabadir! Bugun ham o'zingizni yengasiz. 💪");
      setMotivLoading(false);
    }
  };

  const generateDailyMotivation = async (loadedHabits, today) => {
    try {
      const msgs = [{ role: 'user', text: "Bugun uchun qisqa, kuchli motivatsiya xabari yoz. Maksimum 2 jumla. Oddiy va ilhomlantiruvchi bo'lsin." }];
      const text = await askGroq(msgs, loadedHabits);
      setDailyMotivation(text);
      await AsyncStorage.setItem('daily_motiv_' + today, text);
    } catch {
      setDailyMotivation("Har bir qadam oldinga — bu g'alabadir! Bugun ham o'zingizni yengasiz. 💪");
    } finally {
      setMotivLoading(false);
    }
  };

  const sendMessage = async (overrideText) => {
    const msgText = (overrideText || input).trim();
    if (!msgText || loading) return;
    setInput('');

    const userMsg = { id: Date.now().toString(), role: 'user', text: msgText, time: nowTime() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const aiText = await askGroq(updatedMessages, habits);
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'ai', text: aiText, time: nowTime() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errMsg = {
        id: (Date.now() + 1).toString(), role: 'ai',
        text: `Xato: ${e.message || 'Noma\'lum xato'} 🔌`,
        time: nowTime(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const completedCount = habits.filter(h => h.progress === 100).length;
  const avgProgress = habits.length > 0
    ? Math.round(habits.reduce((s, h) => s + (h.progress || 0), 0) / habits.length)
    : 0;
  const maxStreak = habits.reduce((m, h) => Math.max(m, h.streak || 0), 0);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>AI Murabbiy 🤖</Text>
            <Text style={styles.headerSub}>DeepSeek V3 • O'zbek tili</Text>
          </View>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Faol</Text>
          </View>
        </View>

        {/* Kunlik motivatsiya */}
        <View style={styles.motivCard}>
          <View style={styles.motivHeader}>
            <Text style={styles.motivIcon}>⚡</Text>
            <Text style={styles.motivLabel}>Bugungi motivatsiya</Text>
            <TouchableOpacity
              style={styles.motivRefresh}
              onPress={async () => {
                setMotivLoading(true);
                const today = new Date().toDateString();
                await AsyncStorage.removeItem('daily_motiv_' + today);
                await generateDailyMotivation(habits, today);
              }}
            >
              <Text style={styles.motivRefreshIcon}>↻</Text>
            </TouchableOpacity>
          </View>
          {motivLoading
            ? <ActivityIndicator color="#10B981" size="small" style={{ marginTop: 6 }} />
            : <Text style={styles.motivText}>{dailyMotivation}</Text>
          }
        </View>

        {/* Statistika chipi */}
        <View style={styles.statsRow}>
          {[
            { val: habits.length, label: 'Odat', color: '#F1F5F9' },
            { val: completedCount, label: 'Bajarildi', color: '#10B981' },
            { val: `${avgProgress}%`, label: "O'rtacha", color: '#6366F1' },
            { val: `${maxStreak}🔥`, label: 'Streak', color: '#F59E0B' },
          ].map(s => (
            <View key={s.label} style={styles.statChip}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Chat xabarlari */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble msg={item} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatIcon}>💬</Text>
              <Text style={styles.emptyChatTitle}>AI murabbiy bilan suhbat</Text>
              <Text style={styles.emptyChatSub}>Quyidagi savollardan birini tanlang yoki o'zingiz yozing</Text>
            </View>
          }
          ListFooterComponent={loading ? <TypingDots /> : null}
        />

        {/* Tezkor savollar (faqat chat bo'sh bo'lganda) */}
        {messages.length === 0 && !loading && (
          <View style={styles.suggestions}>
            {QUICK_SUGGESTIONS.map(s => (
              <TouchableOpacity key={s.label} style={styles.suggChip} onPress={() => sendMessage(s.prompt)}>
                <Text style={styles.suggText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input qatori */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Maslahat so'rang..."
            placeholderTextColor="#475569"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnOff]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading
              ? <ActivityIndicator color="#0F172A" size="small" />
              : <Text style={styles.sendIcon}>➤</Text>
            }
          </TouchableOpacity>
        </View>

      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#F1F5F9' },
  headerSub: { fontSize: 12, color: '#10B981', fontWeight: '600', marginTop: 2 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B98115', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#10B98130', gap: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  onlineText: { fontSize: 12, color: '#10B981', fontWeight: '600' },

  // Motivatsiya
  motivCard: { marginHorizontal: 16, backgroundColor: '#10B98112', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#10B98128', marginBottom: 12 },
  motivHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  motivIcon: { fontSize: 16 },
  motivLabel: { fontSize: 12, fontWeight: '700', color: '#10B981', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  motivRefresh: { padding: 4 },
  motivRefreshIcon: { fontSize: 18, color: '#10B981', fontWeight: '700' },
  motivText: { fontSize: 14, color: '#CBD5E1', lineHeight: 22, fontStyle: 'italic' },

  // Statistika
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  statChip: { flex: 1, backgroundColor: '#1E293B', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  statNum: { fontSize: 16, fontWeight: '900' },
  statLabel: { fontSize: 10, color: '#64748B', marginTop: 2, fontWeight: '500' },

  // Xabarlar
  messageList: { paddingHorizontal: 16, paddingVertical: 8, flexGrow: 1 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  msgRowAI: { justifyContent: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  aiAvatar: { fontSize: 24, marginRight: 8, marginBottom: 2 },
  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAI: { backgroundColor: '#1E293B', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#334155' },
  bubbleUser: { backgroundColor: '#10B98122', borderBottomRightRadius: 4, borderWidth: 1, borderColor: '#10B98145' },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  bubbleTextAI: { color: '#E2E8F0' },
  bubbleTextUser: { color: '#F1F5F9' },
  bubbleTime: { fontSize: 10, color: '#475569', marginTop: 6, textAlign: 'right' },

  // Typing
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  typingBubble: { flexDirection: 'row', gap: 5, backgroundColor: '#1E293B', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, borderWidth: 1, borderColor: '#334155' },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10B981' },

  // Bo'sh holat
  emptyChat: { alignItems: 'center', paddingTop: 30, paddingBottom: 16 },
  emptyChatIcon: { fontSize: 48, marginBottom: 12 },
  emptyChatTitle: { fontSize: 17, fontWeight: '700', color: '#94A3B8', marginBottom: 6 },
  emptyChatSub: { fontSize: 13, color: '#475569', textAlign: 'center', lineHeight: 20 },

  // Tezkor savollar
  suggestions: { paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggChip: { backgroundColor: '#1E293B', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#334155' },
  suggText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },

  // Input
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1E293B', gap: 10 },
  input: { flex: 1, backgroundColor: '#1E293B', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12, color: '#F1F5F9', fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: '#334155' },
  sendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  sendBtnOff: { backgroundColor: '#1E293B', shadowOpacity: 0, borderWidth: 1, borderColor: '#334155' },
  sendIcon: { fontSize: 18, color: '#0F172A', marginLeft: 2 },
});
