import { Router } from 'express';
import { authOptional } from '../util/auth';
import { prisma } from '../prismaClient';
import OpenAI from 'openai';

export const conciergeRouter = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

conciergeRouter.post('/concierge/chat', authOptional, async (req, res) => {
  const { message, history = [] } = req.body as { message: string; history?: any[] };
  const q = (message || '').toString().slice(0, 512);
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 5,
  });
  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { body: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 3,
  });
  const context = [
    `Approved Product Snippets:\n${products.map(p => `- ${p.name} (${p.strainType}) ${p.price}`).join('\n')}`,
    `Educational Articles:\n${articles.map(a => `- ${a.title}`).join('\n')}`,
  ].join('\n\n');
  const sys =
    "You are Jars Concierge, a friendly, compliant assistant. Do not give medical advice. Suggest products from context only. Offer to add to cart by returning {action:'add_to_cart', productId} when confident.";
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: sys },
      ...(history as any[]),
      { role: 'user', content: `User message: ${message}\n\nCONTEXT:\n${context}` },
    ],
    temperature: 0.4,
  });
  res.json({
    reply: resp.choices[0]?.message?.content ?? 'Sorry, I did not catch that.',
    grounding: { products, articles },
  });
});
