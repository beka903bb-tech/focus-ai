# Focus AI ⏱ — a time-based habit tracker (React Native + Expo)

Most habit apps only ask "did you do it, yes or no?" **Focus AI measures how much
real focused time you actually spent** — with a timestamp-accurate timer, a
personal AI coach, and a phone-free focus mode that rewards you for putting the
device down.

Built with Expo Router, TypeScript, and Zustand, running on Android/iOS from a
single codebase, fully localized in three languages.

## By the numbers

| | |
|---|---|
| **12** screens | Onboarding, login, home, focus session, add/edit habit, AI coach + questionnaire, statistics, profile, books list, book reader |
| **10** achievements | Unlockable, streak- and session-based |
| **16** books | 10 curated recommendations + 6 in-app readable (license-free) titles across **13** genres |
| **3** languages | Uzbek, Russian, English — full UI coverage |
| **2** themes | Light / Dark |
| **4** onboarding slides | Focus tracking, results tracking, AI assistant, phone-free focus |

## Screenshots

| Home | Focus session |
|---|---|
| ![Home screen](docs/screenshots/home.png) | ![Focus session screen](docs/screenshots/focus-session.png) |

| AI Coach | Statistics |
|---|---|
| ![AI Coach screen](docs/screenshots/ai-coach.png) | ![Statistics screen](docs/screenshots/statistics.png) |

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
| **Onboarding & auth** | 4-slide onboarding, mock email/Google/guest login flows — guest can set their own display name |
| **Habit CRUD** | Add/edit/delete habits with name, icon, color, optional photo, custom duration (presets or any custom minute value), and repeat days |
| **Focus sessions** | Multiple habits can run **in parallel**, each with its own independent, timestamp-based timer (pause/resume-safe) |
| **Celebrations** | Strong haptics + in-app toast + notification sound when a habit is completed, both from the foreground and from a background timer completion; a creative, tiered streak display (🔥 → 🔥🔥 → 🔥🔥🔥 → 👑🔥, with milestone copy at 1/7/30/100 days) |
| **Daily reminder** | User-scheduled daily notification, on its own notification channel (fully independent from the session timer's channel), using exact-alarm scheduling for on-time delivery |
| **Books** | 10 curated non-fiction recommendations (create a reading habit in one tap) + 6 in-app readable, license-free titles (Uzbek folklore, Aesop's fables, Nasreddin Afandi anecdotes, proverb collections, a habit-science explainer, original short stories) across 13 genres, with a swipeable in-app reader |
| **Profile** | Avatar photo, a profession field (feeds a profession-matched level-badge icon, e.g. driver → car → sports car as you level up) |
| **Statistics** | GitHub-style streak heatmap, weekly progress chart, monthly calendar, completion stats, this-week-vs-last-week focus minutes with a percent-change indicator |
| **Focus audio** | Optional looping background sound during a session (soft/pink noise, rain, nature) via expo-av, respects the app's sound setting, pauses/resumes/stops with the session, continues in background |
| **Gamification** | XP, levels with titles, 10 unlockable achievements |
| **Localization** | Full UI in **Uzbek, Russian, and English** (pluralization-aware) |
| **Theming** | Light / Dark, defaults to Light |
| **Offline-first** | All data persisted locally via AsyncStorage — no backend, no login wall |

## Creative solutions

**Personal AI Coach (DeepSeek)**
A short profile questionnaire (goal, height, weight, age, activity level,
**profession** — or, for students/children, their interest area) lets the
coach give advice tailored to the actual user instead of generic
boilerplate: a driver gets reminded to move every 2 hours, a developer gets
eye-strain/posture tips, a child gets age-appropriate, safe suggestions only.
Conversations keep the **last 12 messages** of context, so the coach
remembers what you told it two messages ago. Every response is constrained
by hard-coded safety rules: weight-loss pace is capped at 0.5–1 kg/week,
daily calorie suggestions never go below 1200/1500 kcal, every physical plan
ends with a doctor-consultation disclaimer, and under-18/pregnancy/medical-
condition mentions (including a "child" profession) fall back to general,
safe advice only — the model can't be prompted around these limits. If asked
for a book, it recommends one from the app's own Books section instead of
inventing or reproducing copyrighted text.

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
| Native APIs | expo-haptics, expo-notifications, expo-sensors, expo-image-picker, expo-file-system, expo-av |
| AI | DeepSeek Chat Completions API (`deepseek-v4-flash`) |

## Getting started

```bash
git clone https://github.com/beka903bb-tech/focus-ai.git
cd focus-ai
npm install

# Point the app at the AI coach proxy (not a secret — see "AI coach proxy" below)
cp .env.example .env
# then edit .env and set EXPO_PUBLIC_COACH_API_URL

npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for an Android/iOS
simulator. Some features (haptics, notifications, sensors) require a real
device or a development build — they're not available in Expo Go on iOS.

### Building an Android APK

```bash
cd android
./gradlew assembleRelease   # Windows: gradlew.bat assembleRelease
```

The signed APK is written to
`android/app/build/outputs/apk/release/app-release.apk`. Install it on a
device with `adb install -r app-release.apk`.

### AI coach proxy (the API key never ships in the app)

The app does **not** contain the DeepSeek key. It calls `api/coach.ts`, a small Vercel
serverless function that adds the key on the server, pins the model, and limits request
size and rate.

1. Import this repo into Vercel (it uses `vercel.json` — no build step needed).
2. Vercel → Project → Settings → Environment Variables → add `DEEPSEEK_API_KEY`.
3. Put the deployed URL in `.env`: `EXPO_PUBLIC_COACH_API_URL=https://<project>.vercel.app/api/coach`.

### Running without the AI coach

`.env` (the proxy URL) is only needed for the **AI Coach** tab. Every other part of the app —
habit tracking, focus sessions with the live timer and phone-free detection,
background focus audio, statistics, achievements, books, notifications,
localization — works fully offline with no key at all. Without a key, the AI
Coach screen shows a friendly error instead of a response; nothing else is
affected.

## Luna the Fox — illustrated children's books

Two original, license-free picture books written for this app (22 illustrated pages):
*Luna and Her Big Feelings* (ages 3–6, naming emotions) and *Luna and the Lost Little Star*
(courage and helping a friend). Each page has a full illustration and short read-aloud text,
shown in a swipeable page-flip reader (`app/luna-reader.tsx`, content in
`constants/lunaBooks.ts`, art in `assets/luna/`). Every illustration's generation prompt is
kept next to its page so new pages stay in the same style.

## Testing

```
npm test            # Jest — 160 tests: timer, streak, XP/levels, achievements, demo data,
                    # 3-language translation completeness, book catalog, AI proxy validation
npm run typecheck   # TypeScript
```

Every push runs TypeScript, the full test suite and an Android bundle build in GitHub Actions.

**Demo for judges:** Profile → *Demo data* fills a realistic 75-day history (5 habits, a 16-day
streak, unlocked achievements) so statistics can be reviewed without using the app for weeks.

**Honesty gates:** a single uninterrupted timer stretch counts for at most 3 hours, so a timer
left running overnight never becomes "9 hours of focus"; habits can only be completed by real
timed sessions.

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
app/                    # Expo Router screens (12 total)
  (tabs)/                 # Home, Statistics, AI Coach, Profile
  focus-session.tsx        # Live timer screen
  add-habit.tsx             # Add/edit/delete habit
  coach-profile.tsx          # AI coach questionnaire (incl. profession)
  books.tsx / book-reader.tsx # Book recommendations + in-app swipeable reader
  onboarding.tsx / login.tsx
components/
  ui/                      # Design-system primitives (Button, Card, Toggle, PieProgress, …)
  habit/ charts/ coach/ achievements/ auth/ onboarding/ timer/ profile/
store/                  # Zustand stores (habits, sessions, user, theme, locale, coach profile, toast)
hooks/                  # useGlobalTimerWatcher, useSessionNotifications, useDailyReminder, useTodayKey, useFaceDownDetector
utils/                  # timer math, streaks, level/XP + profession-icon theme, DeepSeek client, celebration, haptics, sound
i18n/locales/           # uz.json, ru.json, en.json
constants/              # theme tokens, icon registry, book catalog
types/                  # shared TypeScript types
```

## Roadmap

- **Sport & exercise habit templates** — guided workout categories (not just
  a free-text habit name), with profession/goal-aware suggestions from the
  AI coach.
- **A larger book catalog** — more curated recommendations and more in-app
  readable, license-free titles across additional genres.
- **Author-submitted books** — let independent/consenting authors add their
  own text for in-app reading, with proper attribution and rights
  confirmation.
- **Per-habit custom reminders** — today's daily reminder is one
  app-wide notification; the plan is a separate, independently timed
  reminder per habit.
