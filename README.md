# Focus AI ⏱ — a time-based habit tracker (React Native + Expo)

Most habit apps only ask "did you do it, yes or no?" **Focus AI measures how much
real focused time you actually spent** — with a timestamp-accurate timer, a
personal AI coach, and a phone-free focus mode that rewards you for putting the
device down.

Built with Expo Router, TypeScript, and Zustand, running on Android/iOS from a
single codebase, fully localized in three languages.

## Core idea

- Every habit has a **target duration**, not just a checkbox.
- Starting a habit opens a **focus session**: a live timer, phone-free
  detection, and pause/resume — all backed by real timestamps, so the time
  is accurate even if the app is backgrounded, the phone sleeps, or the
  screen locks.
- Progress accumulates per day and feeds streaks, XP, levels, and
  achievements.
- An AI coach with a saved personal profile gives grounded, safety-checked
  advice instead of generic tips.

## Key features

| Area | What it does |
|---|---|
| **Onboarding & auth** | Multi-slide onboarding, mock email/Google/guest login flows |
| **Habit CRUD** | Add/edit habits with name, icon, color, optional photo, custom duration (presets or any custom minute value), and repeat days |
| **Focus sessions** | Multiple habits can run **in parallel**, each with its own independent, timestamp-based timer (pause/resume-safe) |
| **Celebrations** | Strong haptics + in-app toast + notification sound when a habit is completed, both from the foreground and from a background timer completion |
| **Statistics** | GitHub-style streak heatmap, weekly progress chart, monthly calendar, completion stats |
| **Gamification** | XP, levels with titles, unlockable achievements |
| **Localization** | Full UI in **Uzbek, Russian, and English** (pluralization-aware) |
| **Theming** | Light / Dark, defaults to Light |
| **Offline-first** | All data persisted locally via AsyncStorage — no backend, no login wall |

## Creative solutions

**Personal AI Coach (DeepSeek)**
A short profile questionnaire (goal, height, weight, age, activity level) lets
the coach give advice tailored to the actual user instead of generic
boilerplate. Conversations keep the **last 12 messages** of context, so the
coach remembers what you told it two messages ago. Every response is
constrained by hard-coded safety rules: weight-loss pace is capped at
0.5–1 kg/week, daily calorie suggestions never go below 1200/1500 kcal,
every physical plan ends with a doctor-consultation disclaimer, and
under-18/pregnancy/medical-condition mentions fall back to general, safe
advice only — the model can't be prompted around these limits.

**Phone-free focus mode**
The accelerometer detects when the phone is placed face-down. Sessions where
the phone stayed untouched for 80%+ of the time earn a "Phone-Free Hero"
badge and a +10 XP bonus.

**Lock-screen live timer**
A running session shows an ongoing Android notification with the live
countdown and **Pause / Finish** actions — usable straight from the lock
screen, without opening the app.

**Streak heatmap & gamification**
A GitHub-contributions-style heatmap visualizes daily consistency at a
glance, backed by an XP/level/achievement system that rewards both
completion and phone-free discipline.

## Tech stack

| Category | Technology |
|---|---|
| Framework | Expo `^54.0.0`, React Native `0.81.5`, React `19.1.0` |
| Routing | Expo Router `~6.0.24` (typed routes) |
| Language | TypeScript `~5.9.2` |
| State | Zustand `^5.0.14` (persisted to AsyncStorage) |
| Localization | i18next `^26.3.4` + react-i18next `^17.0.8` |
| Charts | react-native-chart-kit `^7.0.1`, react-native-svg `15.12.1` |
| Native APIs | expo-haptics, expo-notifications, expo-sensors, expo-image-picker, expo-file-system |
| AI | DeepSeek Chat Completions API (`deepseek-v4-flash`) |

## Getting started

```bash
git clone https://github.com/beka903bb-tech/focus-ai.git
cd focus-ai
npm install

# Add your DeepSeek API key
cp .env.example .env
# then edit .env and set EXPO_PUBLIC_DEEPSEEK_API_KEY

npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for an Android/iOS
simulator. Some features (haptics, notifications, sensors) require a real
device or a development build — they're not available in Expo Go on iOS.

## Technical highlights

- **Timestamp-based timer accuracy** — elapsed time is never a naive
  `setInterval` counter. It's computed as
  `bankedSeconds + accumulatedActiveMs + (now - runningSince)`, clamped to
  the goal. `setInterval` only drives the UI re-render; the actual value is
  re-derived from real timestamps every time, so backgrounding, OS timer
  throttling, or a locked screen never cause drift or lost time.
- **Parallel sessions** — active timers live in a single
  `activeTimers: Record<habitId, TimerState>` map in the session store, so
  any number of habits can run simultaneously without interfering with each
  other.
- **Daily progress banking** — completed minutes are banked per
  `habitId + dateKey`, so progress survives app restarts and a habit is
  marked done automatically once its banked minutes reach its target
  duration — whether that happened via a live session or a background
  timer completing while the app was closed.

## Project structure

```
app/                    # Expo Router screens
  (tabs)/                 # Home, Statistics, AI Coach, Profile
  focus-session.tsx        # Live timer screen
  add-habit.tsx             # Add/edit habit
  coach-profile.tsx          # AI coach questionnaire
  onboarding.tsx / login.tsx
components/
  ui/                      # Design-system primitives (Button, Card, Toggle, …)
  habit/ charts/ coach/ achievements/ auth/ onboarding/ timer/
store/                  # Zustand stores (habits, sessions, user, theme, locale, coach profile, toast)
hooks/                  # useGlobalTimerWatcher, useSessionNotifications, useFaceDownDetector
utils/                  # timer math, streaks, level/XP, DeepSeek client, celebration, haptics, sound
i18n/locales/           # uz.json, ru.json, en.json
constants/              # theme tokens, icon registry
types/                  # shared TypeScript types
```
