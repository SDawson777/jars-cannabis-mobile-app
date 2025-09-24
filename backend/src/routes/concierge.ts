import { Router } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
const rateLimitMap = new Map<string, { count: number; reset: number }>();
export const conciergeRouter = Router();

// Timeout helper
function withTimeout<T>(p: Promise<T>, ms = 15000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(Object.assign(new Error('timeout'), { code: 'timeout' })),
      ms
    );
    p.then(
      v => {
        clearTimeout(t);
        resolve(v);
      },
      e => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

// Exponential backoff helper
async function withBackoff<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  let lastErr;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (attempt === maxRetries) throw e;
      const delay = Math.pow(2, attempt) * 500 + Math.random() * 250;
      await new Promise(r => setTimeout(r, delay));
      attempt++;
    }
  }
  throw lastErr;
}

conciergeRouter.post('/concierge/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const { message, history = [] } = req.body || {};
  // Accept user id from req.user (if present), x-user-id header, or fallback to IP
  const userId = (req as any).user?.id || req.headers['x-user-id'] || req.ip;
  const reqId = uuidv4();
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not set' });
  if (!message) return res.status(400).json({ error: 'message required' });

  // --- Rate limiting ---
  const now = Date.now();
  const rlKey = String(userId);
  const rl = rateLimitMap.get(rlKey) || { count: 0, reset: now + 60_000 };
  if (now > rl.reset) {
    rl.count = 0;
    rl.reset = now + 60_000;
  }
  rl.count++;
  rateLimitMap.set(rlKey, rl);
  if (rl.count > 10) {
    const retryAfter = Math.ceil((rl.reset - now) / 1000);
    logger.debug('[concierge] rate limit hit', { reqId, userId, retryAfter });
    return res
      .status(429)
      .set('Retry-After', String(retryAfter))
      .json({ error: 'Too many requests', code: 'rate_limit', retryAfter });
  }

  const start = Date.now();
  let openaiTokens = 0;
  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });
    const msgs = [
      { role: 'system', content: 'You are a helpful budtender. Keep answers concise and safe.' },
      ...history,
      { role: 'user', content: String(message) },
    ] as any[];

    const r = await withBackoff(
      () =>
        withTimeout(
          client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: msgs,
            temperature: 0.2,
            max_tokens: 64,
          }),
          15000
        ),
      2
    );
    const reply =
      (r as any).choices?.[0]?.message?.content ?? 'Sorry, I had trouble answering that.';
    openaiTokens = (r as any).usage?.total_tokens || 0;
    const latency = Date.now() - start;
    logger.debug('[concierge] chat', { reqId, userId, latency, openaiTokens });
    res.json({ reply, usage: { tokens: openaiTokens, latency } });
  } catch (e: any) {
    const latency = Date.now() - start;
    const status = e?.status || 502;
    const code = e?.code || e?.error?.type || 'openai_error';
    const msg = e?.message || 'Upstream OpenAI error';
    logger.debug('[concierge] error', { reqId, userId, latency, code, message: msg });
    res.status(status).json({ error: { code, message: msg }, usage: { latency } });
  }
});
