import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, Dimensions,
  TouchableOpacity, Animated,
} from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  { id: '1', title: 'Fokusni Boshqar', description: "Sun'iy intellekt yordamida diqqatingizni to'g'ri yo'naltiring va har kuni maqsadlaringizga yaqinlashing.", color: '#10B981', icon: null, lottie: require('../../assets/RTI0oWy71a.json') },
  { id: '2', title: 'Pomodoro Taymer', description: '25 daqiqa ish + 5 daqiqa dam — ilmiy asoslangan bu usul bilan samaradorligingizni 2 baravar oshiring.', color: '#6366F1', icon: null, lottie: require('../../assets/animation - edge.json') },
  { id: '3', title: 'Natijalaringizni Kuzat', description: "Har kunlik va haftalik statistikangizni ko'ring. O'zingizning o'sishingizni kuzatib boring.", color: '#3B82F6', icon: null, lottie: require('../../assets/animation1.json') },
  { id: '4', title: 'AI Yordamchi', description: 'Shaxsiy AI yordamchingiz sizning ishingizni tahlil qilib, eng yaxshi rejani taklif etadi.', color: '#EC4899', icon: null, lottie: require('../../assets/Live chatbot.json') },
];

// ── SLIDE 1: Spinning rings ───────────────────────────────────
function SpinRingsAnim({ color }) {
  const rot1 = useRef(new Animated.Value(0)).current;
  const rot2 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(rot1, { toValue: 1, duration: 4500, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(rot2, { toValue: -1, duration: 7000, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ])).start();
  }, []);

  const spin1 = rot1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin2 = rot2.interpolate({ inputRange: [-1, 0], outputRange: ['-360deg', '0deg'] });

  return (
    <>
      <Animated.View style={[styles.spinRing1, { borderColor: color, transform: [{ rotate: spin1 }] }]} />
      <Animated.View style={[styles.spinRing2, { borderColor: color, transform: [{ rotate: spin2 }] }]} />
      <Animated.View style={[styles.spinCore, { backgroundColor: color, transform: [{ scale: pulse }] }]} />
    </>
  );
}

// ── SLIDE 2: Heartbeat ────────────────────────────────────────
function HeartbeatAnim({ color }) {
  const scale = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(0.3)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const beat = () => {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.45, duration: 110, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.1, duration: 110, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.3, duration: 90, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.delay(850),
      ]).start(() => beat());
    };
    const ripple = () => {
      rippleScale.setValue(0.3);
      rippleOpacity.setValue(0.9);
      Animated.parallel([
        Animated.timing(rippleScale, { toValue: 2.8, duration: 1300, useNativeDriver: true }),
        Animated.timing(rippleOpacity, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ]).start(() => setTimeout(ripple, 350));
    };
    beat();
    setTimeout(ripple, 400);
  }, []);

  return (
    <>
      <Animated.View style={[styles.heartRipple, { borderColor: color, transform: [{ scale: rippleScale }], opacity: rippleOpacity }]} />
      <Animated.View style={[styles.heartCore, { backgroundColor: color, transform: [{ scale }] }]} />
    </>
  );
}

// ── SLIDE 4: Orbit ────────────────────────────────────────────
function OrbitAnim({ color }) {
  const rot1 = useRef(new Animated.Value(0)).current;
  const rot2 = useRef(new Animated.Value(0)).current;
  const rot3 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(rot1, { toValue: 1, duration: 2800, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(rot2, { toValue: -1, duration: 4500, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(rot3, { toValue: 1, duration: 7000, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.2, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
    ])).start();
  }, []);

  const spin1 = rot1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin2 = rot2.interpolate({ inputRange: [-1, 0], outputRange: ['-360deg', '0deg'] });
  const spin3 = rot3.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <>
      <View style={[styles.orbitPath, { width: 140, height: 140, borderRadius: 70, borderColor: color + '30' }]} />
      <View style={[styles.orbitPath, { width: 190, height: 190, borderRadius: 95, borderColor: color + '15' }]} />
      <Animated.View style={[styles.orbitArm, { transform: [{ rotate: spin1 }] }]}>
        <View style={[styles.orbitDot, { backgroundColor: color, width: 12, height: 12, borderRadius: 6, right: -6, top: 63 }]} />
      </Animated.View>
      <Animated.View style={[styles.orbitArm, { transform: [{ rotate: spin2 }] }]}>
        <View style={[styles.orbitDot, { backgroundColor: '#F8FAFC', width: 8, height: 8, borderRadius: 4, right: -4, top: 87 }]} />
      </Animated.View>
      <Animated.View style={[styles.orbitArm, { transform: [{ rotate: spin3 }] }]}>
        <View style={[styles.orbitDot, { backgroundColor: color, width: 7, height: 7, borderRadius: 3.5, opacity: 0.7, right: -3.5, top: 46 }]} />
      </Animated.View>
      <Animated.View style={[styles.orbitCore, { backgroundColor: color, transform: [{ scale: pulse }] }]} />
    </>
  );
}

// ── Har bir slayd ─────────────────────────────────────────────
function SlideItem({ item }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -15, duration: 2000, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ])).start();
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const renderVisual = () => {
    // Lottie animatsiyasi bor bo'lsa
    if (item.lottie) {
      return (
        <View style={styles.lottieWrapper}>
          <LottieView
            source={item.lottie}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      );
    }

    // Emoji + custom animatsiya
    const renderAnim = () => {
      if (item.id === '1') return <SpinRingsAnim color={item.color} />;
      if (item.id === '2') return <HeartbeatAnim color={item.color} />;
      return <OrbitAnim color={item.color} />;
    };

    return (
      <View style={styles.iconWrapper}>
        {renderAnim()}
        <Animated.View style={[styles.iconContainer, { transform: [{ translateY: floatAnim }] }]}>
          <Text style={styles.slideIcon}>{item.icon}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.slide}>
      {renderVisual()}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[styles.title, { color: '#F8FAFC' }]}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
}

// ── Asosiy komponent ──────────────────────────────────────────
export default function Onboarding({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length > 0) setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={onComplete}>
        <Text style={styles.skipText}>O'tkazib yuborish</Text>
      </TouchableOpacity>

      <FlatList
        data={SLIDES}
        renderItem={({ item }) => <SlideItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [10, 28, 10], extrapolate: 'clamp' });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
            return (
              <Animated.View
                key={index.toString()}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: SLIDES[currentIndex]?.color || '#10B981' }]}
              />
            );
          })}
        </View>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: SLIDES[currentIndex]?.color || '#10B981' }]}
          onPress={scrollToNext}
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? '🚀 Boshladik!' : 'Keyingisi ➔'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  skipBtn: { position: 'absolute', top: 60, right: 25, zIndex: 10 },
  skipText: { color: '#64748B', fontSize: 15, fontWeight: '600' },

  slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35, paddingBottom: 90 },

  // Lottie uchun
  lottieWrapper: { width: width * 0.85, height: height * 0.38, marginBottom: 36 },
  lottie: { width: '100%', height: '100%' },

  // Emoji animatsiya uchun
  iconWrapper: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 48 },
  iconContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: 26, borderRadius: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55, shadowRadius: 20, elevation: 12,
  },
  slideIcon: { fontSize: 62 },

  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', marginBottom: 14, letterSpacing: -0.5 },
  description: { fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 26, paddingHorizontal: 10 },

  footer: { position: 'absolute', bottom: 55, width: '100%', paddingHorizontal: 35, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  indicatorContainer: { flexDirection: 'row', alignItems: 'center' },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  nextBtn: { paddingVertical: 15, paddingHorizontal: 28, borderRadius: 18, elevation: 4 },
  nextBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 16 },

  // Spin rings
  spinRing1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderTopColor: 'transparent', borderLeftColor: 'transparent' },
  spinRing2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 1.5, borderBottomColor: 'transparent', borderRightColor: 'transparent' },
  spinCore: { position: 'absolute', width: 70, height: 70, borderRadius: 35, opacity: 0.2 },

  // Heartbeat
  heartRipple: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2 },
  heartCore: { position: 'absolute', width: 80, height: 80, borderRadius: 40, opacity: 0.3 },

  // Orbit
  orbitPath: { position: 'absolute', borderWidth: 1 },
  orbitArm: { position: 'absolute', width: 200, height: 200, alignItems: 'flex-end', justifyContent: 'center' },
  orbitDot: { position: 'absolute' },
  orbitCore: { position: 'absolute', width: 60, height: 60, borderRadius: 30, opacity: 0.25 },
});
