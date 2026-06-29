# Focus AI Mobile — Vaqtga Asoslangan Odatlar Kuzatuvchisi 🚀

Focus AI — foydalanuvchining odat shakllantirish jarayonini quruq "bajarildi/bajarilmadi" so'rovlari orqali emas, balki sarflangan **real vaqt o'lchovi** bilan hisoblaydigan mobil ilovadir. Ilova "Focus AI Mobile Konkurs" uchun maxsus tayyorlandi.

## 🛠 Texnologik Stak

| Texnologiya | Maqsad |
|-------------|--------|
| React Native (Expo SDK 54) | UI va animatsiyalar |
| React Hooks (useState, useEffect) | State boshqaruv |
| AsyncStorage | Offline-First saqlash |
| DeepSeek V3 API | AI Murabbiy chat |
| React Navigation v6 | Ekranlar orasida navigatsiya |
| react-native-svg | SVG progress ring |
| expo-haptics | Taktil aks sado |

## 📱 Ekranlar

- **Onboarding** — 4 slayd, Lottie animatsiyalar, skip tugmasi
- **Auth** — Email/parol, mehmon kirish, o'zbek tilida xato xabarlari
- **Dashboard** — Odatlar ro'yxati, streak, FAB, bo'sh holat
- **Session** — Timestamp taymer, pause/resume, 100% modal, konfetti, haptic
- **Statistika** — Haftalik grafik, top odatlar, foiz
- **AI Murabbiy** — DeepSeek V3 chat, motivatsiya, tahlil
- **Profil** — 7 funksiya, mavzu, eksport, chiqish

## 🧠 Taymer Algoritmi

Vaqt `setInterval` sanog'iga emas, **timestamplar farqiga** asoslangan:

```
O'tgan Vaqt = accumulatedMs + (Hozirgi Timestamp - runningSince)
```

Ilova yopilsa, telefon uxlash rejimiga o'tsa ham vaqt mutlaqo aniq hisoblanadi.

## 🚀 O'rnatish

```bash
git clone https://github.com/beka903bb-tech/focus-ai.git
cd focus-ai
npm install
npx expo start
```

Telefoningizdagi **Expo Go** ilovasi orqali QR-kodni skaner qiling.

## 🎯 Kreativ Xususiyatlar

- **BEAST MODE / ZEN MASTER / SUPER AQLDON** — odat turiga qarab maxsus yutuq modali
- **Konfetti effekti** — 32 ta animatsiya qismi
- **AI Murabbiy** — odatlarni tahlil qilib o'zbek tilida maslahat beradi
- **Streak tizimi** — ketma-ket kunlar hisobi
- **Haptic feedback** — taktil aks sado

## 📦 APK

Android APK [EAS Build](https://expo.dev/accounts/bekzod1984/projects/focus-ai) orqali yaratilgan.

---

**Muallif:** bekzod1984 | **Versiya:** 1.0.0 | **Expo SDK:** 54
