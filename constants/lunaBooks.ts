// Luna the Fox — license-free, original children's picture-book series (2 books),
// written for this app. imagePrompt is kept as the original spec used to generate
// each page's illustration; `image` is the resulting asset actually shown in the reader.
export interface LunaPage {
  page: number;
  type: 'cover' | 'story';
  tag?: string;
  textUz: string;
  imagePrompt: string;
  image?: number;
}

export interface LunaBook {
  id: string;
  number: number;
  titleUz: string;
  titleEn: string;
  ageRange: string;
  theme: string;
  backCoverUz: string;
  coverColor: string;
  pages: LunaPage[];
}

export const LUNA_CHARACTER = {
  name: "Luna",
  descriptionUz: "Kichkina, yoqimtoy tulkicha. Yumshoq to'q sariq junli, oq yonoq, ko'krak va qorin, katta yumaloq qahrabo ko'zli, kichik qora burun, uchi to'q rangli dumaloq quloqlar, uchi oq popuk dum. Doim kichkina moviy (turkuaz) sharf taqib yuradi. Quvnoq, mayin, hissiyotli yuz.",
  imageStyleTokens: "children's picture book illustration, soft watercolor with clean vector shapes, warm cozy color palette, gentle soft lighting, rounded shapes, cute and wholesome, storybook art, flat 2D, high detail character --ar 1:1 --style raw",
};

export const LUNA_BOOKS: LunaBook[] = [
  {
    id: "book-1-big-feelings",
    number: 1,
    titleUz: "Luna va Uning Katta Tuyg'ulari",
    titleEn: "Luna and Her Big Feelings",
    ageRange: "3-6",
    theme: "his-tuyg'ular / emotions",
    backCoverUz: "Kichkina tulki Luna bilan birga barcha tuyg'ular yaxshi ekanini kashf eting. Bolalarga o'z his-tuyg'ularini nomlash va tushunishga yordam beruvchi mehrli ertak.",
    coverColor: "#FB923C",
    pages: [
      {
        page: 0,
        type: "cover",
        tag: "COVER",
        textUz: "Luna va Uning Katta Tuyg'ulari",
        imagePrompt: "A cute small red fox cub named Luna [CHARACTER], sitting and smiling warmly, tiny hearts and soft stars floating around her, cozy sunrise background, title space at the top. [STYLE]",
        image: require('@/assets/luna/book1/page0.jpg'),
      },
      {
        page: 1,
        type: "story",
        tag: "INTRO",
        textUz: "Bu — Luna.\nLuna kichkina tulkicha, ammo yuragi katta —\nva tuyg'ulari ham juda ko'p.",
        imagePrompt: "Luna the fox cub [CHARACTER] standing happily in a soft green meadow, waving hello, morning light, flowers around her feet. [STYLE]",
        image: require('@/assets/luna/book1/page1.jpg'),
      },
      {
        page: 2,
        type: "story",
        tag: "XURSANDCHILIK / HAPPY",
        textUz: "Quyosh \"Xayrli tong!\" desa,\nLuna XURSAND bo'ladi.\nDumi likillaydi, mo'ylovlari o'ynaydi.\nXursandchilik ana shunday bo'ladi!",
        imagePrompt: "Luna the fox cub [CHARACTER] jumping with joy in sunshine, big happy smile, tail wagging, yellow flowers and butterflies, bright cheerful meadow. [STYLE]",
        image: require('@/assets/luna/book1/page2.jpg'),
      },
      {
        page: 3,
        type: "story",
        tag: "HAYAJON / EXCITED",
        textUz: "Kapalak! Kamalak! Yangi kun!\nLuna HAYAJONLANADI.\nYuragi \"pir-pir\" uradi,\nxuddi uchmoqchi bo'lgan qanotdek.",
        imagePrompt: "Luna the fox cub [CHARACTER] with wide sparkling eyes and open arms, reaching toward a colorful butterfly, a soft rainbow behind her, excited joyful expression. [STYLE]",
        image: require('@/assets/luna/book1/page3.jpg'),
      },
      {
        page: 4,
        type: "story",
        tag: "XAFAGARCHILIK / SAD",
        textUz: "Ammo keyin... sharchasi uchib ketadi.\nLuna XAFA bo'ladi.\nYonog'idan bir tomchi yosh oqadi —\nva bu yaxshi.\nXafalikni tashqariga chiqargan yaxshi.",
        imagePrompt: "Luna the fox cub [CHARACTER] looking up sadly at a red balloon floating into the sky, one gentle tear on her cheek, soft muted colors, tender emotional moment. [STYLE]",
        image: require('@/assets/luna/book1/page4.jpg'),
      },
      {
        page: 5,
        type: "story",
        tag: "JAHL / ANGRY",
        textUz: "Kubiklardan qurgan minorasi GUMBURLAB quladi!\nLuna JAHLI chiqadi.\nQulog'i qiziydi, panjalari mushtga aylanadi.\nShunda u to'xtaydi... nafas oladi... bir, ikki, uch.",
        imagePrompt: "Luna the fox cub [CHARACTER] with furrowed brow and puffed cheeks next to a toppled tower of colorful blocks, then taking a deep calming breath, warm indoor playroom. [STYLE]",
        image: require('@/assets/luna/book1/page5.jpg'),
      },
      {
        page: 6,
        type: "story",
        tag: "QO'RQUV / SCARED",
        textUz: "GUMBUR! deydi tunda momaqaldiroq.\nLuna QO'RQADI.\nYumshoq o'yinchog'ini mahkam quchoqlaydi.\nJasur bo'lish — quchoq so'rashdan qo'rqmaslikdir.",
        imagePrompt: "Luna the fox cub [CHARACTER] hugging a soft plush toy in a cozy bed, wide worried eyes, a rainy window with soft lightning outside, warm nightlight glow, comforting mood. [STYLE]",
        image: require('@/assets/luna/book1/page6.jpg'),
      },
      {
        page: 7,
        type: "story",
        tag: "TINCHLIK / CALM",
        textUz: "Ona Tulki Luna'ni bag'riga bosadi.\n\"Men bilan nafas ol,\" deydi u.\nIchkariga... tashqariga. Ichkariga... tashqariga.\nAsta-sekin Luna TINCHLANADI.",
        imagePrompt: "A warm mama fox hugging Luna the fox cub [CHARACTER] gently, both with closed peaceful eyes, breathing together, soft moonlight, calm blue and lavender tones, tender loving scene. [STYLE]",
        image: require('@/assets/luna/book1/page7.jpg'),
      },
      {
        page: 8,
        type: "story",
        tag: "SEVGI / LOVED",
        textUz: "Xursand, hayajon, xafa, jahl, qo'rquv —\nhar bir tuyg'u keladi va ketadi.\nVa ularning barchasida Luna biladi:\nu doimo, doimo SEVILADI.",
        imagePrompt: "Luna the fox cub [CHARACTER] cuddled happily with her fox family under a starry sky, everyone smiling, warm golden glow, hearts floating softly, feeling of safety and love. [STYLE]",
        image: require('@/assets/luna/book1/page8.jpg'),
      },
      {
        page: 9,
        type: "story",
        tag: "YAKUN / CLOSING",
        textUz: "Barcha tuyg'ularim — mening bir qismim.\nKatta yo kichik, ularning hammasi yaxshi.\nBUGUN sen nimani his qilyapsan?",
        imagePrompt: "Luna the fox cub [CHARACTER] pointing gently toward the reader with a kind smile, surrounded by small simple emotion faces (happy, sad, angry, scared, calm), inviting warm background. [STYLE]",
        image: require('@/assets/luna/book1/page9.jpg'),
      },
    ],
  },
  {
    id: "book-2-lost-star",
    number: 2,
    titleUz: "Luna va Yo'qolgan Kichkina Yulduz",
    titleEn: "Luna and the Lost Little Star",
    ageRange: "6-9",
    theme: "jasorat, mehr, do'stlik / courage, kindness, friendship",
    backCoverUz: "Osmondan kichkina yulduz tushganda, jasur tulki Luna unga uyini topishga yordam beradi. Jasorat, mehr va do'stga yordam haqidagi mayin sarguzasht.",
    coverColor: "#8B5CF6",
    pages: [
      {
        page: 0,
        type: "cover",
        tag: "COVER",
        textUz: "Luna va Yo'qolgan Kichkina Yulduz",
        imagePrompt: "Luna the fox cub [CHARACTER] at night holding a tiny glowing star in her paws, looking up at a starry sky, warm magical glow, title space at top. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page0.jpg'),
      },
      {
        page: 1,
        type: "story",
        tag: "PAGE 1",
        textUz: "Bir tinch kechada Luna uxlay olmadi.\nU derazadan yulduzlarga qarab turardi.\nBirdan — vishsh! — kichkina bir yulduz\nqorong'i o'rmonga tushib ketdi.",
        imagePrompt: "Luna the fox cub [CHARACTER] looking out a round window at night, a shooting star falling toward a dark forest, cozy bedroom, wonder on her face. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page1.jpg'),
      },
      {
        page: 2,
        type: "story",
        tag: "PAGE 2",
        textUz: "Luna oyoq uchida tashqariga chiqdi.\nKeksa daraxt ildizlari orasida\nkichkina yulduz miltillab turardi.\n\"Yiqilib tushdim,\" dedi u shivirlab. \"Uyimga qaytolmayapman.\"",
        imagePrompt: "Luna the fox cub [CHARACTER] kneeling by the roots of a big old tree, finding a tiny sad glowing star, soft magical light in a dark forest. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page2.jpg'),
      },
      {
        page: 3,
        type: "story",
        tag: "PAGE 3",
        textUz: "Kichkina yulduz qo'rquvdan titrardi.\nLuna o'zining qo'rqqan kechalarini esladi.\n\"Xavotir olma,\" dedi u mehr bilan.\n\"Men senga uyingni topishga yordam beraman.\"",
        imagePrompt: "Luna the fox cub [CHARACTER] gently cupping the small trembling star in her paws, warm reassuring expression, soft glow lighting her face, dark forest. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page3.jpg'),
      },
      {
        page: 4,
        type: "story",
        tag: "PAGE 4",
        textUz: "Ular birga o'rmon ichiga kirishdi.\nUHU-UHU! deb hayqirdi katta boyqush.\nYulduz Luna'ning qulog'i ortiga yashirindi.\n\"Jasur bo'l,\" dedi Luna. \"Men shu yerdaman.\"",
        imagePrompt: "Luna the fox cub [CHARACTER] walking through a moonlit forest, a wise owl on a branch above, the tiny star hiding by her ear, gentle suspense, soft blue light. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page4.jpg'),
      },
      {
        page: 5,
        type: "story",
        tag: "PAGE 5",
        textUz: "Boyqush katta oltin ko'zlarini pirpiratdi.\n\"Uyingga qaytish uchun, kichkina yulduz,\neng baland tepalikka chiqib, yuqoriga sakragin —\nagar urinsang, osmon seni ilib oladi.\"",
        imagePrompt: "A wise owl with big golden eyes speaking to Luna the fox cub [CHARACTER] and the tiny star, pointing a wing toward a distant tall hill, magical night forest. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page5.jpg'),
      },
      {
        page: 6,
        type: "story",
        tag: "PAGE 6",
        textUz: "Ammo yo'llarida keng daryo bor edi.\nYulduz titrab ketdi. \"Men buni kecholmayman!\"\nLuna yassi toshlarni birma-bir topdi.\n\"Sakrab o'tamiz — birga bo'lsak, uddalaymiz.\"",
        imagePrompt: "Luna the fox cub [CHARACTER] carefully hopping across stepping stones over a moonlit river, the glowing star floating beside her, brave determined mood. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page6.jpg'),
      },
      {
        page: 7,
        type: "story",
        tag: "PAGE 7",
        textUz: "Tepalik tik edi. Oyoqlari charchadi.\n\"To'xtagim kelyapti,\" dedi yulduz xo'rsinib.\n\"Bir qadamdan boshlaymiz,\" dedi Luna kulib.\nVa qadam-baqadam ular tepaga chiqishdi.",
        imagePrompt: "Luna the fox cub [CHARACTER] climbing a steep grassy hill at night with the tiny glowing star, both looking tired but determined, moon and stars above. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page7.jpg'),
      },
      {
        page: 8,
        type: "story",
        tag: "PAGE 8",
        textUz: "Eng cho'qqida osmon juda yaqin tuyuldi.\nAmmo yulduz sakrashdan qo'rqardi.\n\"Jasur bo'lish,\" dedi Luna mayin ovozda,\n\"qo'rqqaningda ham urinishdir.\"",
        imagePrompt: "Luna the fox cub [CHARACTER] standing at the top of a hill under a huge starry sky, encouraging the small hesitant star, tender emotional moment, glowing light. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page8.jpg'),
      },
      {
        page: 9,
        type: "story",
        tag: "PAGE 9",
        textUz: "Kichkina yulduz chuqur nafas oldi...\nva porloq osmonga SAKRADI!\nU tobora yorqinroq nur socha boshladi —\nso'ng miltilladi: \"Rahmat, Luna!\"",
        imagePrompt: "A tiny star leaping upward into a brilliant starry sky, trailing bright light, Luna the fox cub [CHARACTER] watching joyfully from the hilltop below. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page9.jpg'),
      },
      {
        page: 10,
        type: "story",
        tag: "PAGE 10",
        textUz: "Butun osmon yangi nur bilan chaqnadi.\nLuna g'urur va iliqlik his qildi.\nDo'stga yordam berish, u anglab yetdi,\neng katta, eng yorug' ezgulik ekan.",
        imagePrompt: "Luna the fox cub [CHARACTER] on a hilltop looking up at a sky full of bright twinkling stars, warm proud smile, gentle glow all around her. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page10.jpg'),
      },
      {
        page: 11,
        type: "story",
        tag: "PAGE 11",
        textUz: "Luna yulduzlar ostida uyiga qaytdi,\nva to'shagida mayin uxlab yotdi.\nYuqorida esa bir kichkina yulduz\nLuna uzra mehr bilan porlab turdi.",
        imagePrompt: "Luna the fox cub [CHARACTER] sleeping peacefully in her cozy bed, one bright star glowing softly through the window watching over her, warm goodnight mood. [STYLE_NIGHT]",
        image: require('@/assets/luna/book2/page11.jpg'),
      },
    ],
  },
];
