import { Router } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { env, externalApiTimeoutMs } from '../env';
import { cacheService, CacheKeys } from '../services/cacheService';

const rateLimitMap = new Map<string, { count: number; reset: number }>();
const conciergeBackoffMemory = { until: 0 };
const CONCIERGE_DEGRADE_SECONDS = 90;
const fallbackReplies = [
  'I am syncing with our budtenders. Give me a moment and try again shortly.',
  'My upstream helper is unavailable right now. Please retry in a minute.',
  'Still gathering recommendations. Ping me again soon if this persists.',
];
export const conciergeRouter = Router();

// Knowledge base mock data
const knowledgeBase = {
  strains: {
    'blue-dream': {
      name: 'Blue Dream',
      type: 'Sativa-dominant Hybrid',
      thc: '17-24%',
      cbd: '<1%',
      effects: ['Relaxed', 'Happy', 'Euphoric', 'Creative', 'Uplifted'],
      terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
      description: 'A sweet berry aroma with full-body relaxation and gentle cerebral invigoration.',
      medicalUses: ['Stress', 'Depression', 'Pain', 'Fatigue'],
    },
    'og-kush': {
      name: 'OG Kush',
      type: 'Hybrid',
      thc: '20-25%',
      effects: ['Relaxed', 'Happy', 'Euphoric', 'Hungry'],
      terpenes: ['Limonene', 'Myrcene', 'Caryophyllene'],
      description: 'A complex aroma with notes of fuel, skunk, and spice.',
      medicalUses: ['Stress', 'Anxiety', 'Depression', 'Pain'],
    },
  },
  guidelines: {
    dosing: {
      title: 'Dosing Guidelines',
      content: 'Start low, go slow. For edibles, begin with 2.5-5mg THC and wait 2 hours before taking more.',
    },
    storage: {
      title: 'Storage Tips',
      content: 'Store cannabis in a cool, dark place in an airtight container. Keep away from children and pets.',
    },
  },
};

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

function fallbackReply(message: string) {
  const hash =
    Array.from(message || '').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    fallbackReplies.length;
  return fallbackReplies[hash];
}

async function isConciergeDegraded() {
  if (cacheService.isAvailable()) {
    const until = await cacheService.get<number>(CacheKeys.conciergeDegraded());
    return typeof until === 'number' && until > Date.now();
  }
  return conciergeBackoffMemory.until > Date.now();
}

async function setConciergeDegraded(seconds: number) {
  const until = Date.now() + seconds * 1000;
  if (cacheService.isAvailable()) {
    await cacheService.set(CacheKeys.conciergeDegraded(), until, seconds);
  } else {
    conciergeBackoffMemory.until = until;
  }
}

conciergeRouter.post('/concierge/chat', async (req, res) => {
  const apiKey = env.OPENAI_API_KEY;
  const { message, history = [] } = req.body || {};
  // Accept user id from req.user (if present), x-user-id header, or fallback to IP
  const userId = (req as any).user?.id || req.headers['x-user-id'] || req.ip;
  const reqId = uuidv4();
  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not set' });
  if (!message) return res.status(400).json({ error: 'message required' });

  if (await isConciergeDegraded()) {
    return res.json({ reply: fallbackReply(message), usage: { degraded: true } });
  }

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
          Math.min(externalApiTimeoutMs, 15000)
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
    await setConciergeDegraded(CONCIERGE_DEGRADE_SECONDS);
    res.status(status).json({
      reply: fallbackReply(String(message)),
      error: { code, message: msg },
      usage: { latency, degraded: true },
    });
  }
});

// ============================================
// Streaming Chat Endpoint (SSE)
// ============================================

/**
 * POST /concierge/chat/stream
 * Stream chat responses using Server-Sent Events
 */
conciergeRouter.post('/concierge/chat/stream', async (req, res) => {
  const apiKey = env.OPENAI_API_KEY;
  const { message, history = [], sessionId } = req.body || {};
  const userId = (req as any).user?.id || req.headers['x-user-id'] || req.ip;
  const reqId = uuidv4();

  if (!apiKey) return res.status(503).json({ error: 'OPENAI_API_KEY not set' });
  if (!message) return res.status(400).json({ error: 'message required' });

  if (await isConciergeDegraded()) {
    return res.json({ reply: fallbackReply(message), usage: { degraded: true } });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey });
    const msgs = [
      { role: 'system', content: 'You are a helpful budtender. Keep answers concise and safe.' },
      ...history,
      { role: 'user', content: String(message) },
    ] as any[];

    sendEvent('start', { sessionId, messageId: reqId });

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: msgs,
      temperature: 0.2,
      max_tokens: 256,
      stream: true,
    });

    let fullContent = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        sendEvent('chunk', { content, messageId: reqId });
      }
    }

    sendEvent('done', { 
      messageId: reqId, 
      fullContent,
      usage: { tokens: fullContent.length / 4 } // Approximate
    });
    res.end();

  } catch (e: any) {
    const code = e?.code || 'stream_error';
    const msg = e?.message || 'Streaming error';
    logger.debug('[concierge] stream error', { reqId, userId, code, message: msg });
    sendEvent('error', { code, message: msg });
    res.end();
  }
});

// ============================================
// Knowledge Base Endpoints
// ============================================

/**
 * GET /concierge/knowledge/search
 * Search the knowledge base
 */
conciergeRouter.get('/concierge/knowledge/search', async (req, res) => {
  const { query, category, limit = '10' } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    const queryStr = String(query).toLowerCase();
    const results: any[] = [];

    // Search strains
    Object.values(knowledgeBase.strains).forEach((strain: any) => {
      if (strain.name.toLowerCase().includes(queryStr) ||
          strain.description.toLowerCase().includes(queryStr) ||
          strain.effects.some((e: string) => e.toLowerCase().includes(queryStr))) {
        results.push({
          type: 'strain',
          id: strain.name.toLowerCase().replace(/\s+/g, '-'),
          title: strain.name,
          snippet: strain.description.substring(0, 100),
          relevance: 0.9,
        });
      }
    });

    // Search guidelines
    Object.values(knowledgeBase.guidelines).forEach((guide: any) => {
      if (guide.title.toLowerCase().includes(queryStr) ||
          guide.content.toLowerCase().includes(queryStr)) {
        results.push({
          type: 'guide',
          id: guide.title.toLowerCase().replace(/\s+/g, '-'),
          title: guide.title,
          snippet: guide.content.substring(0, 100),
          relevance: 0.8,
        });
      }
    });

    res.json({
      results: results.slice(0, parseInt(limit as string)),
      totalResults: results.length,
    });
  } catch (error) {
    console.error('Knowledge search error:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
});

/**
 * GET /concierge/knowledge/strains/:strainId
 * Get strain information
 */
conciergeRouter.get('/concierge/knowledge/strains/:strainId', async (req, res) => {
  const { strainId } = req.params;

  try {
    const strain = (knowledgeBase.strains as any)[strainId];
    if (!strain) {
      return res.status(404).json({ error: 'Strain not found' });
    }
    res.json(strain);
  } catch (error) {
    console.error('Strain info error:', error);
    res.status(500).json({ error: 'Failed to get strain info' });
  }
});

/**
 * GET /concierge/knowledge/usage-guidelines
 * Get usage guidelines
 */
conciergeRouter.get('/concierge/knowledge/usage-guidelines', async (req, res) => {
  const { topic } = req.query;

  try {
    const topicKey = typeof topic === 'string' ? topic : undefined;
    if (topicKey && (knowledgeBase.guidelines as any)[topicKey]) {
      return res.json((knowledgeBase.guidelines as any)[topicKey]);
    }
    
    res.json({
      guidelines: Object.values(knowledgeBase.guidelines),
    });
  } catch (error) {
    console.error('Guidelines error:', error);
    res.status(500).json({ error: 'Failed to get guidelines' });
  }
});

/**
 * GET /concierge/knowledge/legal/:state
 * Get state-specific legal information
 */
conciergeRouter.get('/concierge/knowledge/legal/:state', async (req, res) => {
  const { state } = req.params;

  try {
    // Mock legal info by state
    const legalInfo: Record<string, any> = {
      CA: {
        state: 'California',
        recreational: true,
        medical: true,
        minAge: 21,
        possessionLimit: '28.5g flower, 8g concentrate',
        publicConsumption: false,
        homeCultivation: true,
        homeCultivationLimit: '6 plants per adult',
        purchaseLimit: '28.5g per transaction',
        lastUpdated: '2025-01-01',
      },
      CO: {
        state: 'Colorado',
        recreational: true,
        medical: true,
        minAge: 21,
        possessionLimit: '28g flower',
        publicConsumption: false,
        homeCultivation: true,
        homeCultivationLimit: '6 plants, 3 mature',
        purchaseLimit: '28g per transaction',
        lastUpdated: '2025-01-01',
      },
    };

    const info = legalInfo[state.toUpperCase()];
    if (!info) {
      return res.status(404).json({ error: 'State not found', availableStates: Object.keys(legalInfo) });
    }

    res.json(info);
  } catch (error) {
    console.error('Legal info error:', error);
    res.status(500).json({ error: 'Failed to get legal info' });
  }
});

/**
 * POST /concierge/feedback
 * Submit feedback for a concierge response
 */
conciergeRouter.post('/concierge/feedback', async (req, res) => {
  const { messageId, sessionId, rating, helpful, feedback } = req.body;
  const userId = (req as any).user?.id || req.headers['x-user-id'] || req.ip;

  if (!messageId) {
    return res.status(400).json({ error: 'messageId is required' });
  }

  try {
    logger.debug('[concierge] feedback', { messageId, sessionId, userId, rating, helpful });
    
    res.json({
      id: `fb-${Date.now()}`,
      messageId,
      sessionId,
      rating,
      helpful,
      feedback,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});
