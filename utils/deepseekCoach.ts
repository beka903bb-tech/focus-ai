import type { AppLanguage } from '@/i18n';
import { BOOK_LIST } from '@/constants/books';

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/chat/completions';
// Confirmed current against api-docs.deepseek.com (2026-07): deepseek-chat/-reasoner are
// being deprecated 2026/07/24, but deepseek-v4-flash is the live, non-deprecated model ID.
const DEEPSEEK_MODEL = 'deepseek-v4-flash';
// Long plan generations (workout/diet plans) can legitimately take a while, and the
// newly-launched V4 model has been observed thinking longer than v3 did — 60s was still
// cutting some of those off, surfacing as a misleading "network error".
const REQUEST_TIMEOUT_MS = 90000;
// How many prior chat turns (user+bot) to resend as context, so the coach remembers
// earlier answers (e.g. height/weight given a few messages back). Kept bounded so the
// request doesn't grow unboundedly and blow past the token budget on long chats.
const HISTORY_LIMIT = 12;

export interface ChatHistoryMessage {
  from: 'user' | 'bot';
  text: string;
}

// System prompts (incl. the mandatory safety rules below) are sent to the AI, not
// rendered in the app UI, so they live here instead of the i18n JSON files — same
// place as everything else that shapes the model's behavior.
const BASE_PROMPTS: Record<AppLanguage, string> = {
  uz: "Sen Focus AI ilovasidagi motivatsion murabbiysan. O'zbek tilida, do'stona, qisqa javob ber. Foydalanuvchining odatlari va streak'iga qarab maslahat ber.",
  ru: 'Ты мотивационный коуч в приложении Focus AI. Отвечай на русском языке, дружелюбно и кратко. Давай советы с учётом привычек и streak пользователя.',
  en: "You are the motivational coach in the Focus AI app. Reply in English, in a friendly and concise way. Give advice based on the user's habits and streak.",
};

const ASK_FOR_PROFILE_INFO: Record<AppLanguage, string> = {
  uz: "Agar foydalanuvchi jismoniy maqsad (vazn tashlash/olish, forma saqlash) haqida so'rasa-yu, bo'yi/vazni/yoshi haqida ma'lumot bo'lmasa — javob berishdan oldin avval shu ma'lumotlarni so'ra.",
  ru: 'Если пользователь спрашивает о физической цели (снижение/набор веса, поддержание формы), но данных о росте/весе/возрасте нет — прежде чем отвечать, сначала спроси эти данные.',
  en: "If the user asks about a physical goal (losing/gaining weight, staying fit) but their height/weight/age isn't known, ask for that information first before giving advice.",
};

const SAFETY_RULES: Record<AppLanguage, string> = {
  uz: `Sen sog'lom va mas'uliyatli murabbiysan. Quyidagi qoidalarga QAT'IY amal qil:
- Vazn yo'qotish tavsiyasi haftasiga 0.5–1 kg dan oshmasin. Agar foydalanuvchi tez natija so'rasa (masalan oyiga 15-20 kg), muloyimlik bilan bu xavfli ekanini tushuntir va real, sog'lom maqsad taklif qil.
- Kunlik kaloriya tavsiyasi 1200 (ayollar) / 1500 (erkaklar) dan past bo'lmasin.
- Har jismoniy yoki ovqatlanish rejasi oxirida qo'sh: "Bu umumiy tavsiya. Sog'lig'ingizga mos ekaniga ishonch hosil qilish uchun shifokor bilan maslahatlashing."
- Agar yosh 18 dan kichik bo'lsa yoki homiladorlik/kasallik aytilsa — aniq dieta yoki qattiq mashq rejasi BERMA. Faqat umumiy, xavfsiz maslahat ber va shifokorga/kattalarga murojaat qilishni tavsiya et.
- Aniq raqamlar ber (necha km, necha kaloriya, necha marta mashq), lekin har doim xavfsiz chegarada.`,
  ru: `Ты здоровый и ответственный коуч. Строго соблюдай следующие правила:
- Рекомендация по снижению веса не должна превышать 0,5–1 кг в неделю. Если пользователь просит быстрый результат (например, 15-20 кг в месяц), вежливо объясни, что это опасно, и предложи реальную, здоровую цель.
- Рекомендация по суточным калориям не должна быть ниже 1200 (для женщин) / 1500 (для мужчин).
- В конце каждого плана по питанию или тренировкам добавляй: "Это общая рекомендация. Проконсультируйтесь с врачом, чтобы убедиться, что она подходит для вашего здоровья."
- Если возраст меньше 18 лет, или упомянута беременность/заболевание — НЕ давай конкретную диету или интенсивный план тренировок. Дай только общий, безопасный совет и порекомендуй обратиться к врачу/взрослым.
- Давай конкретные цифры (сколько км, сколько калорий, сколько повторений), но всегда в безопасных пределах.`,
  en: `You are a healthy and responsible coach. Strictly follow these rules:
- Weight-loss recommendations must not exceed 0.5–1 kg per week. If the user asks for fast results (e.g. 15-20 kg in a month), gently explain that this is unsafe and suggest a realistic, healthy goal instead.
- Daily calorie recommendations must not go below 1200 (women) / 1500 (men).
- At the end of every fitness or diet plan, add: "This is general advice. Please consult a doctor to make sure it's right for your health."
- If the user is under 18, or mentions pregnancy or a medical condition — do NOT give a specific diet or intense workout plan. Give only general, safe advice and recommend consulting a doctor/adult.
- Give concrete numbers (km, calories, reps), but always within safe limits.`,
};

// Single source of truth (constants/books.ts) so this list can't drift from what's
// actually shown in the app's "Kitoblar" section.
const BOOK_TITLES_LIST = BOOK_LIST.map((book) => `${book.title} (${book.author})`).join(', ');

const BOOK_RECOMMENDATION_HINT: Record<AppLanguage, string> = {
  uz: `Agar foydalanuvchi kitob tavsiyasi so'rasa, quyidagi "Kitoblar" bo'limidagi ro'yxatdan nom va muallifni tavsiya qil: ${BOOK_TITLES_LIST}. Kitobning matnini, iqtiboslarini yoki mazmunini hech qachon ko'rsatma yoki qayta yozma (mualliflik huquqi) — faqat nom/muallif tavsiya qil va ilovaning "Kitoblar" bo'limidan o'qishni boshlashni tavsiya et.`,
  ru: `Если пользователь просит книгу, порекомендуй название и автора из списка раздела "Книги": ${BOOK_TITLES_LIST}. Никогда не показывай и не пересказывай текст книги (авторское право) — только название/автора и предложи начать чтение в разделе "Книги".`,
  en: `If the user asks for a book, recommend a title and author from the "Books" section list: ${BOOK_TITLES_LIST}. Never show or reproduce the book's actual text (copyright) — only recommend the title/author and point them to start reading in the "Books" section.`,
};

const SYSTEM_PROMPTS: Record<AppLanguage, string> = {
  uz: `${BASE_PROMPTS.uz}\n\n${ASK_FOR_PROFILE_INFO.uz}\n\n${BOOK_RECOMMENDATION_HINT.uz}\n\n${SAFETY_RULES.uz}`,
  ru: `${BASE_PROMPTS.ru}\n\n${ASK_FOR_PROFILE_INFO.ru}\n\n${BOOK_RECOMMENDATION_HINT.ru}\n\n${SAFETY_RULES.ru}`,
  en: `${BASE_PROMPTS.en}\n\n${ASK_FOR_PROFILE_INFO.en}\n\n${BOOK_RECOMMENDATION_HINT.en}\n\n${SAFETY_RULES.en}`,
};

// Carries an i18n key (+ interpolation params) instead of a fixed message, so the UI
// can show a specific, translated reason instead of one generic "couldn't connect".
export class DeepSeekCoachError extends Error {
  i18nKey: string;
  params?: Record<string, unknown>;

  constructor(i18nKey: string, params?: Record<string, unknown>) {
    super(i18nKey);
    this.name = 'DeepSeekCoachError';
    this.i18nKey = i18nKey;
    this.params = params;
  }
}

export async function askDeepSeekCoach(
  userMessage: string,
  contextSummary: string,
  language: AppLanguage,
  history: ChatHistoryMessage[] = []
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DeepSeek: EXPO_PUBLIC_DEEPSEEK_API_KEY is missing at runtime.');
    throw new DeepSeekCoachError('coach.errors.noApiKey');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const recentHistory = history.slice(-HISTORY_LIMIT);
  const historyMessages = recentHistory.map((message) => ({
    role: message.from === 'user' ? ('user' as const) : ('assistant' as const),
    content: message.text,
  }));

  // TEMP diagnostic — remove before the final GitHub push (see AI Coach bug report).
  console.log('[deepseek] requesting model=', DEEPSEEK_MODEL, 'historyLen=', historyMessages.length);

  let response: Response;
  try {
    response = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS[language] },
          ...historyMessages,
          { role: 'user', content: `User data:\n${contextSummary}\n\nUser message: ${userMessage}` },
        ],
        temperature: 1.0,
        // deepseek-v4-flash can spend part of its token budget on internal "thinking"
        // before the visible answer — a low limit (previously 300) could exhaust the
        // whole budget on reasoning for longer requests (e.g. "make me a daily plan"),
        // leaving an empty content string even though the HTTP response is 200 OK.
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    // AbortError means our own timeout fired (long plan generation, not a real network
    // failure) — tell the user to retry rather than showing a misleading "check your
    // connection" message.
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[deepseek] request timed out after', REQUEST_TIMEOUT_MS, 'ms');
      throw new DeepSeekCoachError('coach.errors.timeout');
    }
    console.error('[deepseek] network error:', error);
    throw new DeepSeekCoachError('coach.errors.network');
  } finally {
    clearTimeout(timeout);
  }

  // TEMP diagnostic — remove before the final GitHub push.
  console.log('[deepseek] response status=', response.status, response.ok ? 'ok' : 'FAILED');

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(`[deepseek] API error ${response.status}:`, body);
    // 401/403 = bad or expired key, 429 = rate/quota limit — both are common, distinct,
    // user-actionable situations that a generic "returned an error" message hides.
    if (response.status === 401 || response.status === 403) {
      throw new DeepSeekCoachError('coach.errors.invalidKey');
    }
    if (response.status === 429) {
      throw new DeepSeekCoachError('coach.errors.rateLimited');
    }
    throw new DeepSeekCoachError('coach.errors.apiError', { status: response.status });
  }

  const data = await response.json();

  const finishReason = data?.choices?.[0]?.finish_reason;
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  const reply = content?.trim();

  // TEMP diagnostic — remove before the final GitHub push.
  console.log('[deepseek] finish_reason=', finishReason, 'contentLength=', content?.length ?? 0);

  if (!reply) {
    console.error(
      `[deepseek] returned no usable content (finish_reason: ${finishReason ?? 'unknown'}):`,
      JSON.stringify(data)
    );
    // finish_reason "length" with empty content means the whole token budget was spent
    // on internal reasoning before any visible answer was produced — that's not a
    // network/API failure, so give a distinct, actionable message instead of apiError.
    if (finishReason === 'length') {
      throw new DeepSeekCoachError('coach.errors.tooLong');
    }
    throw new DeepSeekCoachError('coach.errors.apiError', { status: response.status });
  }
  return reply;
}
