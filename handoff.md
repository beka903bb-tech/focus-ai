# Focus AI — Loyiha Handoff Hujjati

## Loyiha haqida

**Focus AI** — vaqtga asoslangan odatlar kuzatuvchisi. Foydalanuvchi odatlarini "bajarildi/bajarilmadi" emas, balki real sarflangan vaqt bo'yicha kuzatadi.

- **GitHub:** https://github.com/beka903bb-tech/focus-ai
- **Expo:** https://expo.dev/accounts/bekzod1984/projects/focus-ai
- **So'nggi APK:** https://expo.dev/artifacts/eas/hzqbA-hV-qx-WqP8ioeNRVU25WFqAXA9OMaWPy18A1M.apk
- **Versiya:** 1.0.0
- **Android package:** com.focusai.app

---

## Texnologik Stak

- React Native + Expo SDK 54
- React Navigation v6 (Stack + Bottom Tabs)
- AsyncStorage (offline saqlash)
- DeepSeek V3 API (AI Murabbiy)
- react-native-svg (progress ring)
- expo-haptics (taktil aks sado)
- EAS Build (APK/AAB)

---

## Fayl Tuzilmasi

```
focus-ai/
├── App.js                          # Root navigator (Stack + Tabs)
├── app.json                        # Expo konfiguratsiya
├── eas.json                        # EAS Build profillari
├── index.js                        # Entry point
├── assets/                         # Lottie animatsiyalar, ikonkalar
└── src/
    └── screens/
        ├── Onboarding.js           # 4 slayd, Lottie
        ├── AuthScreen.js           # Email/parol, mehmon kirish
        ├── DashboardScreen.js      # Odatlar ro'yxati, FAB
        ├── SessionScreen.js        # Taymer, SVG ring, modal
        ├── StatsScreen.js          # Haftalik grafik
        ├── AICoachScreen.js        # DeepSeek V3 chat
        └── ProfileScreen.js        # Sozlamalar, chiqish
```

---

## Muhim Kalitlar

| Xizmat | Kalit | Fayl |
|--------|-------|------|
| DeepSeek V3 | `sk-fd34a10cd8054cfbb7229233bff13c5a` | `AICoachScreen.js` (9-qator) |
| Expo Project ID | `d12516c1-3696-472d-9bbc-6d63907ffb3b` | `app.json` |
| EAS Keystore | `eqcyVgl8CB` | Expo serverida saqlangan |

> ⚠️ DeepSeek API kalitini `.env` fayliga ko'chirish tavsiya etiladi

---

## Navigation Tuzilmasi

```
Stack Navigator
├── Onboarding
├── Auth
├── Main (Bottom Tabs)
│   ├── Dashboard → Session (Stack da)
│   ├── Stats
│   ├── AICoach
│   └── Profile
└── Session
```

---

## AsyncStorage Kalitlari

| Kalit | Ma'lumot |
|-------|----------|
| `habits` | Odatlar ro'yxati (JSON array) |
| `user` | Foydalanuvchi ma'lumoti |
| `theme` | Mavzu (dark/light) |
| `daily_motivation` | Kunlik AI motivatsiya cache |
| `motivation_date` | Cache sanasi |

---

## EAS Build

```bash
# APK (test uchun)
eas build --platform android --profile preview

# AAB (Play Store uchun)
eas build --platform android --profile production
```

---

## Qo'shilishi mumkin bo'lgan xususiyatlar

- [ ] Push notifications (expo-notifications)
- [ ] Google/Apple login (expo-auth-session)
- [ ] Haqiqiy backend (Supabase yoki Firebase)
- [ ] Widget (expo-widgets)
- [ ] Dark/Light mode to'liq implementatsiya
- [ ] Play Store publikatsiyasi ($25 Google Developer akkaunt)
- [ ] DeepSeek API kalitini .env ga ko'chirish

---

## Muallif

**bekzod1984** | beka903bb-tech | 2026
