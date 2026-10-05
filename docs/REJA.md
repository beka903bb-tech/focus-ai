# Focus AI — 2-versiya reja (5-okt-2026)

Maqsad: raqiblardan (Firdavs — `Will-Marco/focus.ai-mobile`, Nazokat — `focus-ai-final.vercel.app`)
**muhandislikda teng, mazmunda ustun** bo'lish. Bitta kod — **ilova (Android/iOS) + sayt (web)**.

## 1. Bozor va raqiblar (qisqa)

| | Biz (hozir) | Firdavs | Nazokat | Forest / ReaderZ va b. |
|---|---|---|---|---|
| AI kaliti | ❌ ilovada | ✅ server (Gemini) | ✅ server (Groq Llama) | — |
| Hisob + bulut | ❌ soxta login | ✅ Supabase | ✅ bulut + fayl eksport | ✅ |
| Testlar | ❌ 0 | ✅ 186 | ➖ audit | — |
| Sayt + ilova | ❌ faqat APK | ❌ (iOS+Android) | ✅ | — |
| Telefon holati | yuztuban +10 XP | 3 holat (Away 2×, yon soat+DND) | +10% vaqt | Forest: ilovadan chiqsang daraxt quriydi |
| Ijtimoiy | ❌ | Focus Rooms | ustoz-shogird, reyting, chat | Focusmate: jonli hamkor |
| Mukofot | XP, 10 yutuq | XP, 12 nishon | tanga, olmos, mukofot do'koni | Forest: haqiqiy daraxt ekish |
| Kitob / o'qish | ✅ **16 kitob + Luna (rasmli)** | ❌ | ❌ | ReaderZ/KidsRead: bolalar o'qish taymeri, ota-ona paneli, ovoz chiqarib o'qish |
| AI xavfsizligi | ✅ **qoidalar, kasbga moslash** | ➖ | ➖ | — |
| Tillar | **3** | 2 | 3 | — |

**Bizning yo'nalish (ustunlik):** «Fokus + O'qish» — butun oila uchun. Hech bir raqibda yo'q:
rasmli bolalar kitoblari, o'qish vaqti taymerga yoziladi, ota-ona paneli, xavfsiz AI murabbiy.

## 2. Bosqichlar

### 0-bosqich — Majburiy tuzatishlar  ✅ (Vercel'ga joylash va kalitni qo'yish — Bekzod)
- [x] DeepSeek kaliti ilovadan olib chiqiladi → server proksi (Vercel serverless `api/coach.ts` yoki Supabase Edge Function). Ilovada faqat proksi manzili. Limit: 1 qurilma — kuniga N so'rov.
- [x] XP/daraja/yutuqlar kamaymaydi: sessiyalar 200 tadan kesilmaydi (yoki jami ko'rsatkichlar alohida saqlanadi); odat o'chirilsa XP qoladi.
- [x] `deepseekCoach.ts` dagi TEMP `console.log` lar o'chiriladi.
- [x] README: Luna bo'limi, `npx expo prebuild` qadami. (skrinshotlar — telefondan, keyin)
**Qabul:** APK ichida `sk-` / API kaliti yo'q (`strings` bilan tekshiriladi); 250 sessiyada XP kamaymaydi (test).

### 1-bosqich — Sifat: testlar + demo  ✅ (160 test, CI)
- [x] Jest: taymer matematikasi, streak, XP/daraja, yutuqlar, kunlik progress — **kamida 120 test**.
- [x] ESLint + `tsc --noEmit` + test — GitHub Actions (har push'da yashil belgi).
- [x] «Hakam uchun demo» tugmasi: 60–90 kunlik tarix, 5 odat, streak, o'qilgan kitoblar.
- [x] Halollik cheklovlari: 3 soatdan uzun ochiq qolgan taymer hisoblanmaydi; o'tgan kunni qo'lda o'zgartirib bo'lmaydi.

### 2-bosqich — Sayt ham bo'lsin (bitta kod)
- [ ] `react-native-web` qo'shish, `expo export --platform web`, Vercel'ga joylash.
- [ ] Web'da ishlamaydigan modullar uchun yumshoq zaxira: sensor (yo'q → ko'rsatilmaydi), qulf ekrani bildirishnomasi (→ brauzer Notification), haptic (→ jim).
- [ ] PWA: o'rnatiladigan sayt, oflayn ishlaydi.
- [ ] Landing sahifa (3 tilda) + «Nima berilgan / nima qo'shildi» sahifasi + video.

### 3-bosqich — Ustunligimizni kuchaytirish: O'qish
- [ ] Luna va ertaklar **rus va ingliz** tilida (matn + sarlavha); til almashsa kitob ham almashadi.
- [ ] «Menga o'qib ber» — ovozli o'qish (expo-speech, qurilma TTS, uz/ru/en); so'z ajratib ko'rsatiladi.
- [ ] O'qish = fokus sessiyasi: kitob ochilganda taymer «O'qish» odatiga yoziladi, sahifa/vaqt statistikasi.
- [ ] Kitob oxirida 2–3 savollik mini-test (tushunish) → XP.
- [ ] AI murabbiy Luna va ertaklarni ham taniydi, bolaga yoshiga mos kitob tavsiya qiladi.
- [ ] Yangi Luna kitoblari uchun shablon (rasm promptlari bor) — 3- va 4-kitob.

### 4-bosqich — Telefon holati va diqqat
- [ ] Yuztuban → «Away»: ekran qorayadi, 2× XP (hold oynasi + histerezis, test bilan).
- [ ] Yon burilgan → katta stol soati, ekran o'chmaydi; Android'da «Bezovta qilmang» (ruxsat bilan).
- [ ] Forest g'oyasi o'z uslubimizda: sessiya davomida ilovadan chiqilsa Luna «xafa bo'ladi», qaytsa xursand — bolalar uchun yumshoq motivatsiya.

### 5-bosqich — Hisob, bulut, oila
- [ ] Supabase: mehmon rejimi standart; hisob ochilsa ma'lumot bulutga ko'chadi (offline-first, last-write-wins).
- [ ] Tasdiqlash kodi Telegram bot orqali (SMS'siz, bepul).
- [ ] **Oila rejimi** (asosiy ustunlik): ota-ona bolani kod bilan qo'shadi → bolaning o'qish vaqti, kitoblari, streak'i; ota-ona «mukofot» belgilaydi (masalan 5 soat o'qish = park).
- [ ] Focus Rooms (do'stlar bilan jonli fokus) — ixtiyoriy, vaqt qolsa.

### 6-bosqich — Gamifikatsiya va statistika
- [ ] Ikki xil odat: vaqtli va «qildim/qilmadim».
- [ ] Tanga + o'z mukofotlaringni yaratish do'koni.
- [ ] 7×24 eng samarali soat xaritasi; maqsadga yetish bashorati (diapazon, 14 kundan keyin).
- [ ] Bolalar uchun: Luna kiyim/aksessuar ochiladi (tanga bilan).

## 3. Ruflo agentlar taqsimoti

| Agent | Bosqich | Mas'uliyat |
|---|---|---|
| security-architect | 0, 5 | proksi server, kalitlar, Supabase RLS |
| coder (backend) | 0, 5 | `api/coach`, sync, Telegram kod |
| tester | 1 | Jest testlar, CI |
| coder (web) | 2 | react-native-web, Vercel, PWA |
| coder (books) | 3 | tarjima, TTS, o'qish sessiyasi, quiz |
| mobile-dev | 4 | sensorlar, Away/soat, DND |
| reviewer | har bosqich | kod sifati, `tsc`, lint, test yashil |

**Qoidalar (barcha agentlar):** mavjud funksiyani buzma; 3 til doim to'liq; rang hardcode qilinmaydi
(theme tokenlari); taymer faqat timestamp asosida; hech qanday kalit kodda/repoda emas; har bosqich
oxirida `tsc` + test + Android bundle + web export yashil bo'lishi shart. Bekzod va Claude har bosqichni
qabul qiladi.

## 4. Taqdimot (oxirida)
- Sayt (Vercel) + APK + 2 daqiqalik video + «Raqiblardan farqimiz» sahifasi (faqat tekshirib bo'ladigan narsalar).
