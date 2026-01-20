import { Router } from 'express';
import { prisma } from '../prismaClient';
import { env } from '../env';

// Router will be mounted at `/api/ai` and `/api/v1/ai` in app.ts. Keep handlers
// relative (e.g. `/recommend-products`) so mounting controls the base path.
const router = Router();

// Helper to get suggested products for context
async function getSuggestedProducts(
  criteria: { strainType?: string; category?: string[]; thcMax?: number; cbdMin?: number },
  limit = 3
): Promise<Array<{ id: string; name: string; brand: string; thcPercent?: number | null }>> {
  const where: any = {};
  if (criteria.strainType) where.strainType = criteria.strainType;
  if (criteria.category?.length) where.category = { in: criteria.category };
  if (criteria.thcMax) where.thcPercent = { lt: criteria.thcMax };
  if (criteria.cbdMin) where.cbdPercent = { gt: criteria.cbdMin };

  return prisma.product.findMany({
    where,
    take: limit,
    select: { id: true, name: true, brand: true, thcPercent: true },
  });
}

// Types for AI requests and responses
interface RecommendProductsRequest {
  desiredEffects: string[];
  experienceLevel: 'new' | 'regular' | 'heavy';
  budgetLevel: 'low' | 'medium' | 'high';
  preferredCategories?: string[];
}

interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  thcPercent?: number;
  cbdPercent?: number;
  score: number;
  reasoning: string;
}

interface BudtenderRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * POST /ai/recommend-products
 * AI-powered product recommendations based on user preferences
 */
router.post('/ai/recommend-products', async (req, res) => {
  try {
    const { desiredEffects, experienceLevel, budgetLevel, preferredCategories } =
      req.body as RecommendProductsRequest;

    // Input validation
    if (!desiredEffects || !Array.isArray(desiredEffects) || desiredEffects.length === 0) {
      return res
        .status(400)
        .json({ error: 'desiredEffects is required and must be a non-empty array' });
    }

    if (!['new', 'regular', 'heavy'].includes(experienceLevel)) {
      return res.status(400).json({ error: 'experienceLevel must be new, regular, or heavy' });
    }

    if (!['low', 'medium', 'high'].includes(budgetLevel)) {
      return res.status(400).json({ error: 'budgetLevel must be low, medium, or high' });
    }

    // Get products from database with store pricing
    const products = await prisma.product.findMany({
      include: {
        brandRef: true,
        variants: {
          where: { active: true },
          select: { id: true, name: true, price: true, active: true },
        },
        stores: {
          where: {
            store: { isActive: true },
          },
          select: { price: true },
        },
      },
      take: 50, // Limit for performance
    });

    // Score products based on preferences
    const recommendations: ProductRecommendation[] = products
      .map(product => {
        let score = 0;
        let reasoning = [];

        // Category preference scoring
        if (preferredCategories?.includes(product.category)) {
          score += 20;
          reasoning.push(`Matches your preferred ${product.category} category`);
        }

        // Effect-based scoring (simplified - in production, use proper terpene/effect data)
        const effectsMatch = desiredEffects.some(
          effect =>
            product.name.toLowerCase().includes(effect.toLowerCase()) ||
            product.description?.toLowerCase().includes(effect.toLowerCase())
        );
        if (effectsMatch) {
          score += 30;
          reasoning.push('Matches your desired effects');
        }

        // Experience level scoring
        if (experienceLevel === 'new' && product.thcPercent && product.thcPercent < 15) {
          score += 25;
          reasoning.push('Beginner-friendly THC level');
        } else if (
          experienceLevel === 'regular' &&
          product.thcPercent &&
          product.thcPercent >= 15 &&
          product.thcPercent <= 25
        ) {
          score += 25;
          reasoning.push('Perfect for regular users');
        } else if (experienceLevel === 'heavy' && product.thcPercent && product.thcPercent > 25) {
          score += 25;
          reasoning.push('High potency for experienced users');
        }

        // Budget level scoring - use store pricing if available, otherwise variant pricing
        const storePrice = product.stores[0]?.price || product.defaultPrice || 0;
        const variantPrice = product.variants[0]?.price || 0;
        const avgPrice = storePrice || variantPrice;

        if (budgetLevel === 'low' && avgPrice < 25) {
          score += 15;
          reasoning.push('Budget-friendly option');
        } else if (budgetLevel === 'medium' && avgPrice >= 25 && avgPrice <= 50) {
          score += 15;
          reasoning.push('Good value for money');
        } else if (budgetLevel === 'high' && avgPrice > 50) {
          score += 15;
          reasoning.push('Premium quality');
        }

        // Strain type preferences for effects
        if (
          desiredEffects.some(effect =>
            ['energetic', 'focus', 'creative'].includes(effect.toLowerCase())
          ) &&
          product.strainType === 'Sativa'
        ) {
          score += 20;
          reasoning.push('Sativa strain for energizing effects');
        } else if (
          desiredEffects.some(effect =>
            ['relaxed', 'sleep', 'calm'].includes(effect.toLowerCase())
          ) &&
          product.strainType === 'Indica'
        ) {
          score += 20;
          reasoning.push('Indica strain for relaxing effects');
        } else if (product.strainType === 'Hybrid') {
          score += 10;
          reasoning.push('Balanced hybrid effects');
        }

        return {
          id: product.id,
          name: product.name,
          brand: product.brand || 'Unknown',
          category: product.category,
          price: avgPrice,
          thcPercent: product.thcPercent || undefined,
          cbdPercent: product.cbdPercent || undefined,
          score,
          reasoning: reasoning.join(', ') || 'General recommendation',
        };
      })
      .filter(rec => rec.score > 0) // Only return products with some score
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 10); // Return top 10 recommendations

    res.json({
      recommendations,
      totalFound: recommendations.length,
      preferences: {
        desiredEffects,
        experienceLevel,
        budgetLevel,
        preferredCategories,
      },
    });
  } catch (error) {
    console.error('Error in AI product recommendations:', error);
    res.status(500).json({
      error: 'Failed to generate product recommendations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /ai/budtender
 * AI budtender chat assistant with real OpenAI LLM integration
 */
router.post('/ai/budtender', async (req, res) => {
  try {
    const { message, history = [] } = req.body as BudtenderRequest;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required and must be a string' });
    }

    const apiKey = env.OPENAI_API_KEY;

    // If OpenAI key not configured, use enhanced fallback
    if (!apiKey) {
      return handleBudtenderFallback(message, res);
    }

    // Fetch relevant products for context
    const lowerMessage = message.toLowerCase();
    let productContext = '';
    let suggestedProducts: string[] = [];

    // Determine product search criteria based on message
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('relax')) {
      const products = await getSuggestedProducts({ strainType: 'Indica', category: ['Flower', 'Edibles'] });
      suggestedProducts = products.map(p => `${p.brand} ${p.name}`);
      productContext = `Relevant Indica products for relaxation: ${suggestedProducts.join(', ')}`;
    } else if (lowerMessage.includes('energy') || lowerMessage.includes('focus') || lowerMessage.includes('creative')) {
      const products = await getSuggestedProducts({ strainType: 'Sativa', category: ['Flower', 'Vape'] });
      suggestedProducts = products.map(p => `${p.brand} ${p.name}`);
      productContext = `Relevant Sativa products for energy: ${suggestedProducts.join(', ')}`;
    } else if (lowerMessage.includes('beginner') || lowerMessage.includes('new') || lowerMessage.includes('first time')) {
      const products = await getSuggestedProducts({ thcMax: 15, category: ['Flower', 'Edibles'] });
      suggestedProducts = products.map(p => `${p.brand} ${p.name} (${p.thcPercent}% THC)`);
      productContext = `Beginner-friendly low-THC products: ${suggestedProducts.join(', ')}`;
    } else if (lowerMessage.includes('pain') || lowerMessage.includes('inflammation')) {
      const products = await getSuggestedProducts({ cbdMin: 5, category: ['Flower', 'Topicals', 'Tincture'] });
      suggestedProducts = products.map(p => `${p.brand} ${p.name}`);
      productContext = `CBD-rich products for pain relief: ${suggestedProducts.join(', ')}`;
    }

    try {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey });

      const systemPrompt = `You are a knowledgeable and friendly cannabis budtender assistant for Nimbus Cannabis.
Your role is to help customers find the right products for their needs while providing accurate, safety-focused information.

Guidelines:
- Be warm, professional, and helpful
- Always prioritize safety, especially for beginners
- Recommend starting with low doses
- Never make medical claims - suggest consulting healthcare providers for medical issues
- Keep responses concise but informative (2-3 paragraphs max)
- If product suggestions are available, incorporate them naturally

${productContext ? `Available products to suggest: ${productContext}` : ''}`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        { role: 'user' as const, content: message },
      ];

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 300,
      });

      const response = completion.choices?.[0]?.message?.content || 
        "I apologize, but I couldn't generate a response. Please try rephrasing your question.";

      res.json({
        response,
        timestamp: new Date().toISOString(),
        context: {
          userMessage: message,
          suggestedProducts,
        },
        conversationLength: history.length + 1,
        usage: {
          tokens: completion.usage?.total_tokens || 0,
        },
      });
    } catch (llmError: any) {
      console.error('OpenAI API error:', llmError);
      // Fallback to pattern-based response on LLM failure
      return handleBudtenderFallback(message, res);
    }
  } catch (error: any) {
    console.error('Error in AI budtender:', error);
    res.status(500).json({
      error: 'Failed to generate budtender response',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Fallback handler for budtender when OpenAI is unavailable
 */
async function handleBudtenderFallback(message: string, res: any) {
  const lowerMessage = message.toLowerCase();
  let response = '';
  let suggestedProducts: string[] = [];

  if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
    response = "For sleep and relaxation, I'd recommend looking at Indica strains with higher CBD content. These tend to have sedating effects that can help with rest.";
    const products = await getSuggestedProducts({ strainType: 'Indica', category: ['Flower', 'Edibles'] });
    suggestedProducts = products.map(p => `${p.brand} ${p.name}`);
  } else if (lowerMessage.includes('energy') || lowerMessage.includes('focus') || lowerMessage.includes('creative')) {
    response = 'For energy and focus, Sativa strains are typically your best bet. They tend to provide uplifting, cerebral effects that can enhance creativity and productivity.';
    const products = await getSuggestedProducts({ strainType: 'Sativa', category: ['Flower', 'Vape'] });
    suggestedProducts = products.map(p => `${p.brand} ${p.name}`);
  } else if (lowerMessage.includes('beginner') || lowerMessage.includes('new') || lowerMessage.includes('first time')) {
    response = 'Welcome to cannabis! For beginners, I recommend starting with products that have lower THC content (under 15%) and higher CBD ratios. Start with a small dose and wait to see how you feel.';
    const products = await getSuggestedProducts({ thcMax: 15, category: ['Flower', 'Edibles'] });
    suggestedProducts = products.map(p => `${p.brand} ${p.name} (${p.thcPercent}% THC)`);
  } else if (lowerMessage.includes('pain') || lowerMessage.includes('inflammation')) {
    response = "For pain relief, look at strains with good CBD content, as CBD has anti-inflammatory properties. Both Indica and balanced Hybrid strains can be effective.";
    const products = await getSuggestedProducts({ cbdMin: 5 });
    suggestedProducts = products.map(p => `${p.brand} ${p.name}`);
  } else {
    response = "I'm here to help you find the right cannabis products! Feel free to ask about specific effects, your experience level, or any concerns you might have.";
  }

  if (suggestedProducts.length > 0) {
    response += `\n\nHere are some products you might like: ${suggestedProducts.join(', ')}.`;
  }

  res.json({
    response,
    timestamp: new Date().toISOString(),
    context: { userMessage: message, suggestedProducts },
    conversationLength: 1,
    fallback: true,
  });
}

export default router;
