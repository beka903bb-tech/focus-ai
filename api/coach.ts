// Vercel serverless function — the ONLY place that knows the DeepSeek API key.
// Deploy: set DEEPSEEK_API_KEY in Vercel → Project → Settings → Environment Variables.
// The app sends { messages } and gets back { reply } or { error, status }.

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/chat/completions';
// Pinned server-side so a modified client can't switch to a more expensive model.
const DEEPSEEK_MODEL = 'deepseek-v4-flash';
const MAX_TOKENS = 2000;

// Abuse limits: the proxy is public, so it must not become a free general-purpose LLM.
const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 6000;
const MAX_TOTAL_CHARS = 24000;
const RATE_LIMIT_PER_MINUTE = 10;

type Role = 'system' | 'user' | 'assistant';
interface ChatMessage {
  role: Role;
  content: string;
}

// Best-effort, per-instance limiter (serverless instances are short-lived; this stops
// simple loops/scripts, not a determined attacker — add Upstash/KV later if needed).
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT_PER_MINUTE;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

export function validateMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_MESSAGES) return null;
  let total = 0;
  const messages: ChatMessage[] = [];
  for (const item of input) {
    const role = (item as ChatMessage)?.role;
    const content = (item as ChatMessage)?.content;
    if (role !== 'system' && role !== 'user' && role !== 'assistant') return null;
    if (typeof content !== 'string' || content.length === 0 || content.length > MAX_MESSAGE_CHARS) return null;
    total += content.length;
    messages.push({ role, content });
  }
  if (total > MAX_TOTAL_CHARS) return null;
  if (messages[messages.length - 1].role !== 'user') return null;
  return messages;
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: 'notConfigured' }, 500);

  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) return json({ error: 'rateLimited', status: 429 }, 429);

  const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
  const messages = validateMessages(body?.messages);
  if (!messages) return json({ error: 'badRequest', status: 400 }, 400);

  let upstream: Response;
  try {
    upstream = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: DEEPSEEK_MODEL, messages, temperature: 1.0, max_tokens: MAX_TOKENS }),
    });
  } catch {
    return json({ error: 'upstreamUnreachable', status: 502 }, 502);
  }

  if (!upstream.ok) {
    if (upstream.status === 401 || upstream.status === 403) return json({ error: 'invalidKey', status: upstream.status }, 502);
    if (upstream.status === 429) return json({ error: 'rateLimited', status: 429 }, 429);
    return json({ error: 'apiError', status: upstream.status }, 502);
  }

  const data = (await upstream.json().catch(() => null)) as
    | { choices?: { finish_reason?: string; message?: { content?: string } }[] }
    | null;
  const choice = data?.choices?.[0];
  const reply = choice?.message?.content?.trim();
  if (!reply) {
    // finish_reason "length" with no content = the token budget went to internal reasoning.
    return json({ error: choice?.finish_reason === 'length' ? 'tooLong' : 'apiError', status: 200 }, 502);
  }
  return json({ reply });
}
