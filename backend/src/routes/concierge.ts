import { Router } from 'express';
export const conciergeRouter = Router();

// Add a hard timeout so platforms never see "application failed to respond"
function withTimeout<T>(p: Promise<T>, ms = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'timeout' })), ms);
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

conciergeRouter.post('/concierge/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const { message, history = [] } = req.body || {};
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not set' });
  if (!message) return res.status(400).json({ error: 'message required' });
  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });
    const msgs = [
      { role: 'system', content: 'You are a helpful budtender. Keep answers concise and safe.' },
      ...history,
      { role: 'user', content: String(message) },
    ] as any[];
    const r = await withTimeout(
      client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: msgs,
        temperature: 0.2,
        max_tokens: 64,
      }),
      12000
    );
    const reply = (r as any).choices?.[0]?.message?.content ?? 'Sorry, I had trouble answering that.';
    res.json({ reply });
  } catch (e: any) {
    const status = e?.status || 502;
    const code = e?.code || e?.error?.type || 'openai_error';
    const msg = e?.message || 'Upstream OpenAI error';
    res.status(502).json({ error: 'OpenAI request failed', status, code, message: msg });
  }
});
