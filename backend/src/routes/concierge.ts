import { Router } from 'express';

export const conciergeRouter = Router();

// Simple chat endpoint backed by OpenAI
// eslint-disable-next-line @typescript-eslint/no-misused-promises
conciergeRouter.post('/concierge/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const { message, history = [] } = req.body || {};
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not set' });
  if (!message) return res.status(400).json({ error: 'message required' });

  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey });

  const msgs = [
    { role: 'system', content: 'You are a helpful budtender. Keep answers concise and safe.' },
    ...history,
    { role: 'user', content: String(message) },
  ] as any[];

  const r = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: msgs,
    temperature: 0.4,
  });

  const reply = (r as any).choices?.[0]?.message?.content ?? 'Sorry, I had trouble answering that.';
  res.json({ reply });
});
