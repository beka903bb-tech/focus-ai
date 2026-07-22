// Recommendation metadata only — title/author/genre, never the book's actual text
// (copyright) FOR MOST ENTRIES. Selecting one in app/books.tsx creates a "reading"
// habit; it never displays or generates content for entries without `content`.
//
// `content` is an OPT-IN, in-app readable text — only ever license-free (public
// domain folklore/classics, or original text written for this app) — never a
// copyrighted modern book. It must stay empty/undefined for anything still under
// copyright (every "tavsiya" book below, e.g. Atomic Habits). When set, it's an
// array of pages (each a few paragraphs) and app/books.tsx shows a "Read" button.
// `amazonUrl`, if set, links out to buy/read the full book externally.
export interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  genreKey: string;
  estimatedHours: number;
  coverColor: string;
  content?: string[];
  amazonUrl?: string;
}

export const BOOK_LIST: BookRecommendation[] = [
  { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', genreKey: 'habits', estimatedHours: 5, coverColor: '#10B981' },
  { id: 'seven-habits', title: 'The 7 Habits of Highly Effective People', author: 'Stephen R. Covey', genreKey: 'selfHelp', estimatedHours: 7, coverColor: '#8B5CF6' },
  { id: 'deep-work', title: 'Deep Work', author: 'Cal Newport', genreKey: 'productivity', estimatedHours: 5, coverColor: '#38BDF8' },
  { id: 'think-grow-rich', title: 'Think and Grow Rich', author: 'Napoleon Hill', genreKey: 'motivation', estimatedHours: 6, coverColor: '#F472B6' },
  { id: 'power-of-now', title: 'The Power of Now', author: 'Eckhart Tolle', genreKey: 'mindfulness', estimatedHours: 5, coverColor: '#FBBF24' },
  { id: 'mans-search-meaning', title: "Man's Search for Meaning", author: 'Viktor Frankl', genreKey: 'psychology', estimatedHours: 3, coverColor: '#10B981' },
  { id: 'the-alchemist', title: 'The Alchemist', author: 'Paulo Coelho', genreKey: 'fiction', estimatedHours: 4, coverColor: '#8B5CF6' },
  { id: 'rich-dad-poor-dad', title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', genreKey: 'finance', estimatedHours: 4, coverColor: '#38BDF8' },
  { id: 'five-am-club', title: 'The 5 AM Club', author: 'Robin Sharma', genreKey: 'productivity', estimatedHours: 5, coverColor: '#F472B6' },
  { id: 'grit', title: 'Grit', author: 'Angela Duckworth', genreKey: 'psychology', estimatedHours: 5, coverColor: '#FBBF24' },

  // Readable-in-app titles — license-free only (folklore / public-domain classics /
  // original text written for this app). See BookRecommendation.content note above.
  {
    id: 'zumrad-qimmat',
    title: 'Zumrad va Qimmat',
    author: "O'zbek xalq ijodi",
    genreKey: 'folklore',
    estimatedHours: 0.15,
    coverColor: '#F472B6',
    content: [
      `Qadim zamonda bir kambag'al kishi yashab, uning Zumrad ismli mehribon va tirishqoq qizi bor edi. Xotini vafot etgach, u boshqa bir ayolga uylandi. Bu ayolning ham Qimmat ismli o'z qizi bor edi — erka va dangasa. Yangi ona o'z qiziga mehr qo'yib, Zumradni har doim og'ir ishlarga solar, kamsitardi.

Bir kuni Zumrad daryo bo'yida kiyim yuvayotganda, sovun qo'lidan sirg'alib, oqim bilan olib ketildi. Qo'rqib ketgan Zumrad sovunni izlab, daryo bo'ylab yura boshladi.`,
      `Yo'lda unga bir tandir uchradi: — Meni tozalab ber, ichimda non bor, seni to'ydiraman, — dedi tandir. Zumrad rozi bo'lib, tandirni tozaladi va yo'lida davom etdi.

Keyin unga bir olma daraxti uchradi: — Shoxlarimni silkitib, mevalarimni yerga tushir, keyin meva ber, — dedi daraxt. Zumrad shu ishni ham bajardi.

Nihoyat, u bir kampirning uyiga yetib bordi. Kampir uni mehmon qilib, uch kun davomida uy yumushlarida yordam so'radi. Zumrad hech qachon shikoyat qilmay, sidqidildan ishladi — supurdi, yuvdi, ovqat pishirdi.

Uch kundan so'ng kampir Zumradga rahmat aytib, sandiqni ochib, «qaysi sandiqni xohlasang, tanla» dedi. Zumrad eng kichik, oddiy sandiqni tanladi — hech qachon ochko'z bo'lmagan edi.`,
      `Uyga qaytib, sandiqni ochganda, ichidan oltin va qimmatbaho toshlar sochilib chiqdi! Zumradning oilasi hayratda qoldi. Buni ko'rgan o'gay ona o'z qizi Qimmatni ham xuddi shu yo'ldan yubordi — u ham oltin topib kelishini xohlardi.

Lekin Qimmat yo'lda tandirni tozalashdan bosh tortdi, daraxtga esa haqorat qildi. Kampirning uyiga yetib borgach ham, ishlashni istamadi, faqat noz-karashma qildi. Shunga qaramay, ochko'zligi tufayli u eng katta sandiqni tanladi.`,
      `Uyga qaytib sandiqni ochganda, ichidan oltin o'rniga ilonlar va chayonlar chiqib, Qimmatni qo'rqitib yubordi. Bu voqeadan keyin oila mehnat va mehribonlikning haqiqiy boylik ekanini anglab yetdi.

Saboq: Mehnat, kamtarlik va boshqalarga yordam qo'lini cho'zish — eng katta boylikdir. Ochko'zlik va dangasalik esa, oxir-oqibat o'z egasiga zarar keltiradi.`,
    ],
  },
  {
    id: 'ezop-masallari',
    title: 'Ezop masallari',
    author: 'Ezop (qadimgi yunon)',
    genreKey: 'fables',
    estimatedHours: 0.15,
    coverColor: '#10B981',
    content: [
      `Ezop — qadim yunon donishmandi, uning qissalari mingyilliklar osha avloddan avlodga o'tib kelmoqda. Har bir masal qisqa, lekin ortida chuqur hayotiy saboq yashiringan.

Chumoli va Chigirtka
Yozning issiq kunlarida chumoli tinimsiz g'alla tashib, qishga oziq-ovqat g'amlardi. Uning yonida chigirtka kuylab-o'ynab yurar, chumolini mazax qilardi: — Nega bunchalik charchayapsan? Yoz — dam olish uchun! Chumoli javob bermay, ishini davom ettiraverdi.

Qish kelganda, chigirtkaning yeyishga hech narsasi qolmadi. Sovuqdan qaltirab, chumolining uyi eshigini taqillatdi. Chumoli eshikni ochib: — Yozda kuylagansan, endi qishda o'ylab ko'r, — dedi.`,
      `Toshbaqa va Quyon
Quyon o'zining tezligiga mahliyo bo'lib, sekin yuruvchi toshbaqani doim mazax qilardi. Bir kuni toshbaqa unga poyga taklif qildi. Quyon kulib rozi bo'ldi.

Poyga boshlangach, quyon shu qadar oldinga chiqib ketdiki, ishonch bilan yo'l chetida uxlab qoldi — «Toshbaqa hech qachon meni quvib yeta olmaydi», deb o'yladi.

Toshbaqa esa sekin-asta, lekin to'xtamay yurishda davom etdi. Quyon uyg'onganda, toshbaqa allaqachon chiziqqa yetib bo'lgan edi.`,
      `Bo'ri kelyapti!
Cho'pon bola qo'ylarni boqib, zerikkanidan qishloq aholisini aldashga qaror qildi: — Bo'ri kelyapti, yordam bering! — deb qichqirdi. Qishloq odamlari yugurib kelishdi, lekin bo'ri yo'q edi. Bola kulib, hazil qilganini aytdi.

Bu hazilni u yana bir necha marta takrorladi. Nihoyat, chindan ham bo'ri kelganda, bola qanchalik qichqirmasin, hech kim unga ishonmadi va yordamga kelmadi.`,
      `Shamol va Quyosh
Shamol va Quyosh kim kuchliroq ekanini bahslashdi. Yo'lovchining ustidan kamzulini yechdiruvchi g'olib bo'ladi, deb kelishishdi.

Shamol bor kuchi bilan esdi, lekin yo'lovchi kamzulini yanada qattiqroq o'radi. Navbat Quyoshga kelganda, u yumshoqqina isita boshladi. Yo'lovchi issiqdan kamzulini o'zi yechib tashladi.

Saboq: Kuch bilan emas, mehr va sabr bilan ko'proq narsaga erishish mumkin.`,
    ],
  },
  {
    id: 'afandi-latifalari',
    title: 'Afandi latifalari',
    author: "Xalq ijodi (Nasriddin Afandi)",
    genreKey: 'humor',
    estimatedHours: 0.1,
    coverColor: '#FBBF24',
    content: [
      `Nasriddin Afandi — Sharq xalqlari orasida asrlar osha sevib aytilib kelinayotgan donishmand va hazilkash qahramon. Uning latifalari kulgili bo'lsa-da, ichida chuqur hikmat yashiringan.

Qozon tug'dimi?
Afandi qo'shnisidan bir kunga qozon so'rab oldi. Ertasiga qozon bilan birga kichkina bir tovoqchani ham qaytarib berdi. — Bu nima? — so'radi qo'shni hayron bo'lib. — Sizning qozoningiz kecha bola tug'di, — dedi Afandi jiddiy qiyofada. Qo'shni xursand bo'lib, tovoqchani oldi.

Orada bir necha kun o'tib, Afandi yana qozon so'rab keldi. Qo'shni mamnuniyat bilan berdi. Lekin bu safar Afandi qozonni qaytarib bermadi. Qo'shni so'raganda, Afandi xo'rsinib dedi: — Qozoningiz vafot etdi. — Qozon o'larmi?! — deb hayqirdi qo'shni. — Tug'ishiga ishongan ekansiz, o'lishiga nega ishonmaysiz? — dedi Afandi.`,
      `Bu ham o'tadi
Podshoh Afandidan: — Menga shunday bir gap ayt, quvonganimda kamtar bo'lay, g'amginlanganimda taskin topay, — deb so'radi.

Afandi bir necha kun o'ylab, keyin bir uzuk yasatib, unga besh so'z yozdirdi: «Bu ham o'tadi». Podshoh bu so'zlarni har doim uzugida ko'rib, quvonch damlarida mag'rurlanib ketmadi, qayg'u kunlarida esa umidini yo'qotmadi.`,
      `Eshakni kim minadi?
Afandi va o'g'li bozorga eshak yetaklab borishayotgan edi. Yo'lovchilar: — Qarang, ikkovi ham piyoda ketyapti-yu, eshakni yetaklab boryapti, ahmoqlar! — deyishdi. Afandi o'g'lini eshakka mindirdi.

Boshqa yo'lovchilar: — Voy, bola otasini piyoda qoldirib, o'zi minib olibdi! — deyishdi. Endi Afandi minib, o'g'lini piyoda yubordi.

Yana odamlar: — Katta odam bolani piyoda qoldiribdi-ya! — deyishdi. Oxiri ikkovlari ham eshakka minishdi. Bu safar: — Bechora hayvonni ikkovlashib ezib yuborishibdi! — deyishdi.

Afandi o'g'liga qarab kuldi: — Hammani rozi qilib bo'lmas ekan, o'g'lim. O'z yo'limizdan borganimiz ma'qul.`,
      `Ko'rpa masalasi
Qishning sovuq kechasi Afandi tomga chiqib, yulduzlarga tikilib o'tirardi. Xotini derazadan qichqirdi: — Sovuqdan qotib qolasan, ko'rpa opke deysizmi? Afandi javob berdi: — Yo'q, menga sizning issiq gapingiz kifoya!

Bir muddatdan so'ng, sovuqqa chidolmay, Afandi pastga tushib, ko'rpani o'ziga o'rab, yana tomga chiqdi. Xotini so'radi: — Gapim endi issiq emasmi? — Gapingiz issiq, — dedi Afandi, — lekin ko'rpa ham zarar qilmas ekan.`,
    ],
  },
  {
    id: 'hikmatlar-toplami',
    title: 'Hikmatlar va maqollar to\'plami',
    author: 'Xalq donoligi',
    genreKey: 'wisdom',
    estimatedHours: 0.1,
    coverColor: '#8B5CF6',
    content: [
      `Ota-bobolarimizdan bizga meros bo'lib qolgan maqol va hikmatlar — asrlar davomida sinalgan hayotiy dono so'zlardir. Ular qisqa, ammo mazmunga boy.

Vaqt haqida
«Vaqt — oltin, uni behuda sarflama.» Vaqt qaytmas ne'mat — o'tgan daqiqani hech qanday boylik bilan sotib olib bo'lmaydi.

«Bugungi ishni ertaga qo'yma.» Kechiktirish odati eng katta ishlarni ham amalga oshmay qoldiradi.

«Soat chiqillab turibdi — sen nima qilyapsan?» Har lahza — imkoniyat. Uni qanday ishlatishimiz — bizning tanlovimiz.`,
      `Mehnat haqida
«Mehnatsiz — rohat yo'q.» Har qanday muvaffaqiyat orqasida sabr va mehnat yotadi.

«Tomchi-tomchi — ko'l bo'lur.» Kichik, muntazam harakatlar vaqt o'tishi bilan katta natijaga aylanadi — xuddi odatlar kabi.

«Ishlagan tishlaydi.» Faqat harakat qilgan inson natijaga erishadi, kutib o'tirgan emas.`,
      `Odat haqida
«Yoshlikda o'rgangan — tosh ustiga naqsh.» Odatlar qanchalik erta shakllansa, shunchalik chuqur ildiz otadi.

«Odam odatining quli.» Har kim o'z odatlari bilan yashaydi — yaxshi odat insonni yuksaltiradi, yomon odat esa pastga tortadi.

«Bir kun bilan bahor bo'lmaydi.» Katta o'zgarish uchun bitta kun yetarli emas — muntazamlik kerak.`,
      `Sabr haqida
«Sabr — achchiq, mevasi shirin.» Qiyinchilikka bardosh berish oxir-oqibat yaxshi natija beradi.

«Shoshilgan qiz erga yetolmas.» Shoshilinch qilingan ishlar ko'pincha nuqsonli chiqadi.

«Chumolidek sabrli bo'l, tomchidek muntazam bo'l.» — bu hikmatlar bizga eslatadi: kichik, sabrli qadamlar bilan katta maqsadlarga erishish mumkin.`,
    ],
  },
  {
    id: 'odat-shakllanadi',
    title: 'Odat qanday shakllanadi?',
    author: 'Focus AI jamoasi',
    genreKey: 'popscience',
    estimatedHours: 0.15,
    coverColor: '#38BDF8',
    content: [
      `Har birimiz kunlik hayotimizda ko'plab odatlarga amal qilamiz — tish yuvish, choy ichish, telefonni tekshirish. Lekin odat aslida qanday paydo bo'ladi?

Olimlar odatni uch bosqichli halqa sifatida tushuntirishadi: signal (trigger), harakat (rutina) va mukofot (reward). Signal — miyaga «harakat vaqti keldi» degan ishora beradi (masalan, uyg'onish). Harakat — bajarilgan ish (masalan, sport mashg'uloti). Mukofot esa miyaga yoqimli tuyg'u beradi (masalan, energiya hissi), va bu miyani «buni yana takrorla» deb o'rgatadi.`,
      `Vaqt o'tishi bilan bu halqa shunchalik mustahkamlanadiki, harakat deyarli avtomatik tarzda bajariladi — ong buning uchun kam kuch sarflaydi. Aynan shu sababli yangi odat hosil qilish boshida qiyin, keyinchalik esa oson bo'lib qoladi.

Tadqiqotlarga ko'ra, yangi odat o'rtacha bir necha haftadan ikki oygacha vaqt ichida shakllanadi — bu odam va odatning murakkabligiga bog'liq. Muhimi — muntazamlik: har kuni bir xil vaqtda, bir xil tarzda bajarish, halqani mustahkamlaydi.`,
      `Odatni shakllantirishning eng samarali yo'li — uni kichik qadamlardan boshlash. Katta maqsad (masalan, «har kuni 1 soat sport qilish») boshida qo'rqinchli tuyulishi mumkin. Buning o'rniga «har kuni 5 daqiqa harakat qilish» kabi kichik qadam bilan boshlash, keyin asta-sekin oshirib borish — muvaffaqiyat ehtimolini oshiradi.

Yana bir muhim omil — izchillik uzilishidan qo'rqmaslik. Agar bir kun odatni bajarmay qoldirsangiz, bu hammasi barbod bo'ldi degani emas. Asosiysi — ertasi kuni yana davom ettirish.`,
      `Xulosa qilib aytganda, odat — bu miyaning kuch tejash usuli. U bizga har safar qaytadan o'ylab o'tirmasdan, muhim ishlarni avtomatik bajarishga yordam beradi.

Shu sababli, Focus AI kabi ilovalar orqali odatlaringizni kuzatib borish, ularni vaqt bilan bog'lash va muntazamlikni saqlash — yangi, foydali odatlar shakllantirishning eng ishonchli yo'lidir. Har bir kichik qadam, vaqt o'tishi bilan katta o'zgarishga aylanadi.`,
    ],
  },
  {
    id: 'motivatsion-hikoyalar',
    title: 'Motivatsion qisqa hikoyalar',
    author: 'Focus AI jamoasi',
    genreKey: 'motivation',
    estimatedHours: 0.15,
    coverColor: '#FB923C',
    content: [
      `Bog'bon va daraxt
Bir bog'bon yosh ko'chat ekdi va har kuni unga suv berib, parvarish qildi. Bir hafta o'tib, ko'chatda hech qanday o'zgarish ko'rinmadi. Qo'shnisi kulib: — Nega behuda vaqt sarflaysan, bu daraxt hech qachon o'smaydi, — dedi.

Bog'bon javob bermay, ishini davom ettiraverdi. Oy o'tdi, yil o'tdi — ko'chat asta-sekin ildiz otib, novda chiqara boshladi. Besh yildan so'ng, o'sha joyda katta, soyabon daraxt qad rostlagan edi, uning mevalaridan butun mahalla bahramand bo'lardi.

Qo'shnisi hayron bo'lib so'radi: — Qanday qilib bunga erishding? Bog'bon jilmayib javob berdi: — Men faqat har kuni bitta ishni qildim — suv berdim. Qolganini vaqt va tabiat o'zi hal qildi.`,
      `Tosh yo'nuvchi
Uch tosh yo'nuvchidan so'rashibdi: — Nima qilyapsiz? Birinchisi xafa qiyofada: — Tosh yo'nyapman, — debdi. Ikkinchisi charchagan ohangda: — Non pulini topyapman, — debdi.

Uchinchisi esa ko'zlari yonib: — Men ma'bad quryapman! — debdi.

Uchalasi ham bir xil ishni qilishardi, lekin faqat uchinchisi o'z mehnatining katta maqsad — go'zal ma'bad — qismi ekanini ko'ra olardi. Shu sababli u charchamas, ishidan zavq olardi.`,
      `Kichik qadamlar
Uzoq safarga chiqqan sayohatchi tog' etagida to'xtab, cho'qqiga qarab xo'rsindi: — Bu naqadar uzoq va baland, men hech qachon yetolmayman.

Yo'l ko'rsatuvchi chol unga javob berdi: — Cho'qqiga qarama, faqat oldingdagi bitta qadamga qara. Har bir qadam — o'zi bir maqsad.

Sayohatchi shu maslahatga amal qildi — har safar faqat keyingi qadamga e'tibor qaratdi. Kunlar o'tib, u sezmasdan cho'qqiga yaqinlashib qoldi. Orqaga qarab, bosib o'tgan yo'lining naqadar uzoq ekanini ko'rib, o'zi ham hayratda qoldi.`,
      `Bu uchta hikoya bir narsani o'rgatadi: katta natijalar kichik, muntazam harakatlardan tug'iladi. Bog'bonning har kungi bir chelak suvi, tosh yo'nuvchining har bir zarbasi, sayohatchining har bir qadami — alohida olganda arzimas ko'rinishi mumkin.

Lekin vaqt bilan birlashib, ular katta o'zgarishga aylanadi. Sizning har kungi kichik odatlaringiz ham xuddi shunday — bugun arzimas tuyulsa-da, ertaga sizni kutilmagan natijalarga olib boradi.`,
    ],
  },
];
