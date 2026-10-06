# Focus AI — reviewer guide

This page is for whoever grades the project (a teacher, or an AI model comparing several
submissions). Every claim points to **the file that implements it** and **a way to check it**,
so nothing here has to be taken on trust. Limitations are listed honestly at the end.

**What it is:** a habit tracker that measures *real focused time* instead of yes/no ticks —
timestamp-accurate timer, phone-free focus mode, streaks/XP/achievements, a safety-bounded AI
coach, an in-app library with original illustrated children's books, 3 languages, offline-first.
One Expo/React Native codebase ships as an **Android APK** and a **web app**
(https://focus-ai-stitch.expo.app).

## 5-minute review path

1. Open the APK (or the web app → "Ilovani brauzerda ochish").
2. Profile → **Demo data** — fills a realistic 75-day history (5 habits, 16-day streak).
3. Statistics → *Overview*: heatmap, weekly chart, monthly calendar, **Week / Month** comparison.
4. Profile → **Share my results** → branded streak card → system share sheet.
5. Profile → Daily reminder → pick **07:00** preset → **Test it** (notification in 10 s).
6. Home → start a habit → put the phone **face down** → phone-free bonus.
7. Books → *Luna* → swipe or use ‹ › (keyboard arrows on web).
8. Switch language UZ / RU / EN in Profile — every screen is translated.

## Verify in the code (one command)

```bash
npm ci && npx tsc --noEmit && npx jest && npx expo export --platform android
```
197 tests, TypeScript strict, Android bundle — the same three gates run in GitHub Actions on
every push (`.github/workflows/ci.yml`).

## Claims → evidence

| Area | Claim | Where | How to check |
|---|---|---|---|
| Timer accuracy | Elapsed time is derived from timestamps (`banked + active + (now − runningSince)`), not a `setInterval` counter, so backgrounding / screen lock never drift | `utils/timer.ts` | `__tests__/timer.test.ts` |
| Honesty | One unattended stretch counts for at most **3 h** — a timer left on overnight is not "9 hours of focus" | `utils/timer.ts` (`MAX_UNATTENDED_MS`), `app/focus-session.tsx` | `timer.test.ts` |
| Parallel sessions | Any number of habits can run at once, each with its own timer | `store/sessionStore.ts` (`activeTimers`) | run two habits |
| Phone-free mode | Accelerometer detects face-down; ≥ 80 % face-down → badge + XP | `hooks/useFaceDownDetector.ts`, `utils/timer.ts` (`PHONE_FREE_THRESHOLD_PERCENT`) | on a device |
| Lock-screen timer | Ongoing notification with live countdown and Pause / Finish actions | `hooks/useSessionNotifications.ts` | on Android |
| XP never shrinks | Lifetime totals are stored separately, so XP/levels survive the 1 000-session history cap and deleted habits; persisted-state migration v0→v1 | `utils/sessionTotals.ts`, `store/sessionStore.ts` (`migrate`), `store/habitStore.ts` (`archivedCompletions`) | `__tests__/xp.test.ts` |
| Statistics | Week vs last week; month-to-date vs the **same days** of last month (31 Mar vs 28 Feb is capped, no overflow); `null` instead of a fake "+∞ %" when there is no baseline | `utils/streak.ts` (`weeklyFocusComparison`, `monthlyFocusComparison`) | `__tests__/streak.test.ts` |
| Share card | 1080×1350 PNG of the streak card via the system share sheet; text fallback on web | `components/profile/ShareResultModal.tsx`, `utils/shareCard.ts` | `__tests__/shareCard.test.ts` (also checks all 3 real translations) |
| Outcome tracking | After every session: *Did you reach your goal?* (Yes / Partly / No) is stored on the session record; statistics shows the goal-reached share (Partly = half) | `components/timer/SessionResultModal.tsx`, `store/sessionStore.ts` (`setSessionOutcome`), `utils/sessionOutcome.ts` | `__tests__/sessionOutcome.test.ts` |
| Thought notepad | Park a distracting thought mid-session without stopping the timer; list in Profile (done / delete), persisted, capped | `components/timer/ThoughtPadModal.tsx`, `store/thoughtStore.ts`, `utils/thoughts.ts` | `__tests__/thoughts.test.ts` |
| Research basis | Each core feature is mapped to a peer-reviewed study with DOI, with honest limits (no trial of the app itself) | `docs/SCIENCE.md`, landing *Science* section | follow the DOI links |
| Reminders | Exact-alarm daily reminder on its own channel; presets; 10-second test notification | `hooks/useDailyReminder.ts`, `utils/reminderPresets.ts` | `__tests__/reminderPresets.test.ts`, on a device |
| AI key security | The DeepSeek key is **not** in the app. The app calls `/api/coach`, which adds the key server-side, pins the model, validates input (≤ 16 messages, ≤ 6 000 chars each, ≤ 24 000 total) and rate-limits (10/min per IP) | `api/coach.ts`, `app/api/coach+api.ts`, `utils/deepseekCoach.ts` | `__tests__/coachProxy.test.ts`; `unzip -p FocusAI.apk assets/index.android.bundle \| grep -c "sk-"` → 0 |
| AI safety | Coach system prompt (3 languages): weight loss ≤ 0.5–1 kg/week, calories never below 1 200 / 1 500 kcal, doctor disclaimer, children / pregnancy / medical conditions → general safe advice only, books only from the in-app catalog | `utils/deepseekCoach.ts` | read the prompt |
| Personalization | Coach profile: goal, body data, activity, **profession** (or a child's interest) → advice and level-badge icon match the person | `app/coach-profile.tsx`, `utils/levelTheme.ts` | fill the questionnaire |
| Localization | Full UI in Uzbek, Russian, English with Russian plural forms; a test fails if any key or `{{placeholder}}` is missing in any language | `i18n/locales/*.json` | `__tests__/i18n.test.ts` |
| Original content | 2 original illustrated *Luna* books (22 pages, prompts stored with each page) + 6 license-free readable titles + 10 recommendations | `constants/lunaBooks.ts`, `constants/books.ts`, `assets/luna/` | `__tests__/books.test.ts` |
| Offline-first | All data in AsyncStorage (Zustand persist); no account required; only the coach needs internet | `store/*.ts` | airplane mode |
| Web parity | Same codebase runs in the browser; native-only parts degrade gracefully (notifications no-op, `Alert` → `window.confirm`, single-slide onboarding) | `utils/alert.ts`, `hooks/useDailyReminder.ts`, `app/onboarding.tsx` | web app |

## Design decisions worth noting

- **No fake numbers.** Percent changes are `null` (shown as "no comparison yet") when the
  previous period is empty; the share card hides the badge instead of printing "+∞ %".
- **Honest copy.** The landing page and FAQ only claim what the code does (e.g. iOS is listed as
  a later stage, not as supported).
- **Separation of concerns.** All calculations are pure functions in `utils/` (no React, no
  native modules) — that is why 197 tests run in ~2 s without a device.

## Known limitations (honest)

- **iOS** is not built or tested yet (Android APK + web only).
- **AI coach** requires the owner to set `DEEPSEEK_API_KEY` on the server; without it the coach
  shows a friendly "not configured" message and everything else works.
- The coach's safety rules live in the system prompt — strong guidance, not a formal guarantee.
- **No cloud sync / accounts** (by design for privacy); data stays on the device.
- The APK is signed with the debug key (fine for review/sideloading, not for Play Store).

---

## O'zbekcha qisqacha (ustoz uchun)

**Focus AI** — odatni «qildim» belgisi bilan emas, **haqiqiy sarflangan vaqt** bilan o'lchaydi.
Taymer vaqt belgilariga asoslangan (telefon uxlasa ham aniq), 3 soatdan ortiq qarovsiz vaqt
hisoblanmaydi, telefon yuztuban qo'yilsa bonus beradi. Statistika (hafta/oy taqqoslash),
natijani rasm qilib ulashish, eslatma (sinov tugmasi bilan), xavfsiz AI murabbiy (kalit serverda),
Luna rasmli kitoblari, 3 til, internetsiz ishlaydi. **197 ta avtomatik test**, har push'da
GitHub Actions tekshiradi. Ko'rish uchun: Profil → «Demo ma'lumot».
