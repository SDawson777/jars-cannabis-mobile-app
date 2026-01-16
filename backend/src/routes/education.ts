// backend/src/routes/education.ts
// Educational content routes - articles, recipes, wellness routines, pairings

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// Article Routes
// ============================================

router.get('/articles', async (req: Request, res: Response) => {
  try {
    const { category: _category, tags: _tags, effects: _effects, difficulty: _difficulty, search: _search, cursor: _cursor } = req.query;
    
    res.json({
      articles: [
        {
          id: 'article-1',
          title: 'Understanding Terpenes',
          slug: 'understanding-terpenes',
          excerpt: 'Learn about the aromatic compounds that give cannabis its unique flavors and effects.',
          content: 'Full article content here...',
          author: { id: 'author-1', name: 'Dr. Jane Smith', bio: 'Cannabis researcher' },
          category: 'education',
          tags: ['terpenes', 'science', 'beginner'],
          readingTime: 8,
          featuredImage: 'https://example.com/terpenes.jpg',
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likeCount: 150,
          saveCount: 45,
          viewCount: 2500,
          isLiked: false,
          isSaved: false,
        },
      ],
      nextCursor: undefined,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.get('/articles/featured', async (req: Request, res: Response) => {
  try {
    res.json({ articles: [] });
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    res.status(500).json({ error: 'Failed to fetch featured articles' });
  }
});

router.get('/articles/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    res.json({
      id: 'article-1',
      title: 'Understanding Terpenes',
      slug,
      excerpt: 'Learn about terpenes',
      content: 'Full content...',
      author: { id: 'author-1', name: 'Dr. Jane Smith' },
      category: 'education',
      tags: ['terpenes'],
      readingTime: 8,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likeCount: 150,
      saveCount: 45,
      viewCount: 2500,
      isLiked: false,
      isSaved: false,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

router.post('/articles/:articleId/like', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ error: 'Failed to like article' });
  }
});

router.post('/articles/:articleId/save', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error saving article:', error);
    res.status(500).json({ error: 'Failed to save article' });
  }
});

router.get('/saved/articles', async (req: Request, res: Response) => {
  try {
    res.json({ articles: [] });
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    res.status(500).json({ error: 'Failed to fetch saved articles' });
  }
});

// ============================================
// Recipe Routes
// ============================================

router.get('/recipes', async (req: Request, res: Response) => {
  try {
    res.json({
      recipes: [
        {
          id: 'recipe-1',
          title: 'Cannabis-Infused Butter',
          slug: 'cannabis-infused-butter',
          description: 'The foundation for many cannabis edibles',
          prepTime: 30,
          cookTime: 240,
          totalTime: 270,
          servings: 16,
          difficulty: 'easy',
          dosagePerServing: '10mg THC',
          effects: ['relaxed', 'happy'],
          ingredients: [
            { item: 'Unsalted butter', amount: '1', unit: 'cup' },
            { item: 'Cannabis flower', amount: '7', unit: 'g', cannabisProduct: 'decarbed' },
          ],
          instructions: [
            { step: 1, instruction: 'Decarb your cannabis at 240°F for 40 minutes' },
            { step: 2, instruction: 'Melt butter in a saucepan' },
            { step: 3, instruction: 'Add cannabis and simmer for 2-3 hours' },
          ],
          tips: ['Strain well', 'Store in refrigerator'],
          warnings: ['Start with low doses'],
          nutritionFacts: { calories: 100, thcMg: 10, cbdMg: 2 },
          tags: ['butter', 'base-recipe', 'edibles'],
          author: { id: 'chef-1', name: 'Chef Cannabis' },
          publishedAt: new Date().toISOString(),
          likeCount: 500,
          isSaved: false,
        },
      ],
      nextCursor: undefined,
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

router.get('/recipes/featured', async (req: Request, res: Response) => {
  try {
    res.json({ recipes: [] });
  } catch (error) {
    console.error('Error fetching featured recipes:', error);
    res.status(500).json({ error: 'Failed to fetch featured recipes' });
  }
});

router.get('/recipes/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    res.json({
      id: 'recipe-1',
      title: 'Cannabis-Infused Butter',
      slug,
      description: 'The foundation for many cannabis edibles',
      prepTime: 30,
      cookTime: 240,
      totalTime: 270,
      servings: 16,
      difficulty: 'easy',
      dosagePerServing: '10mg THC',
      effects: ['relaxed'],
      ingredients: [],
      instructions: [],
      tips: [],
      warnings: [],
      tags: [],
      author: { id: 'chef-1', name: 'Chef Cannabis' },
      publishedAt: new Date().toISOString(),
      likeCount: 500,
      isSaved: false,
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

router.post('/recipes/:recipeId/save', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error saving recipe:', error);
    res.status(500).json({ error: 'Failed to save recipe' });
  }
});

// ============================================
// Wellness Routine Routes
// ============================================

router.get('/wellness', async (req: Request, res: Response) => {
  try {
    res.json({
      routines: [
        {
          id: 'routine-1',
          title: 'Morning Mindfulness Routine',
          slug: 'morning-mindfulness',
          description: 'Start your day with intention and clarity',
          duration: '7 days',
          goal: 'Reduce morning anxiety',
          targetEffects: ['calm', 'focused'],
          schedule: [
            {
              time: 'morning',
              activity: 'Meditation with microdose',
              suggestedProducts: ['Blue Dream', 'Harlequin'],
              dosageGuideline: '2.5mg THC',
              duration: '15 minutes',
            },
          ],
          tips: ['Start with low dose', 'Journal your experience'],
          precautions: ['Not for heavy equipment operators'],
          difficulty: 'beginner',
          tags: ['mindfulness', 'anxiety', 'morning'],
          likeCount: 200,
          isSaved: false,
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching wellness routines:', error);
    res.status(500).json({ error: 'Failed to fetch routines' });
  }
});

router.get('/wellness/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    res.json({
      id: 'routine-1',
      title: 'Morning Mindfulness Routine',
      slug,
      description: 'Start your day with intention',
      duration: '7 days',
      goal: 'Reduce anxiety',
      targetEffects: ['calm'],
      schedule: [],
      tips: [],
      precautions: [],
      difficulty: 'beginner',
      tags: [],
      likeCount: 200,
      isSaved: false,
    });
  } catch (error) {
    console.error('Error fetching routine:', error);
    res.status(500).json({ error: 'Failed to fetch routine' });
  }
});

router.post('/wellness/start', async (req: Request, res: Response) => {
  try {
    const { routineId: _routineId } = req.body;
    res.json({ trackingId: `track-${Date.now()}` });
  } catch (error) {
    console.error('Error starting routine:', error);
    res.status(500).json({ error: 'Failed to start routine' });
  }
});

// ============================================
// Pairing Routes
// ============================================

router.get('/pairings', async (req: Request, res: Response) => {
  try {
    res.json({
      pairings: [
        {
          id: 'pairing-1',
          title: 'Movie Night Pairings',
          description: 'Perfect combinations for movie watching',
          strainType: 'indica',
          occasion: 'movie night',
          pairings: [
            {
              category: 'food',
              suggestions: [
                { name: 'Popcorn', description: 'Classic snack' },
                { name: 'Chocolate', description: 'Enhances the experience' },
              ],
            },
          ],
          effects: ['relaxed', 'happy'],
          mood: ['cozy', 'entertained'],
          tags: ['movies', 'snacks', 'evening'],
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching pairings:', error);
    res.status(500).json({ error: 'Failed to fetch pairings' });
  }
});

router.get('/pairings/product/:productId', async (req: Request, res: Response) => {
  try {
    const { productId: _productId } = req.params;
    res.json({
      id: 'pairing-prod-1',
      title: 'Pairings for Blue Dream',
      description: 'Best enjoyed with...',
      strainType: 'hybrid',
      occasion: 'daytime',
      pairings: [],
      effects: [],
      mood: [],
      tags: [],
    });
  } catch (error) {
    console.error('Error fetching product pairings:', error);
    res.status(500).json({ error: 'Failed to fetch pairings' });
  }
});

// ============================================
// Progress & Categories
// ============================================

router.get('/progress', async (req: Request, res: Response) => {
  try {
    res.json({
      userId: 'user-123',
      articlesRead: 15,
      recipesViewed: 8,
      routinesStarted: 2,
      minutesSpent: 180,
      completedModules: ['terpenes-101', 'edibles-basics'],
      currentStreak: 5,
      longestStreak: 12,
      badges: ['reader', 'learner'],
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

router.post('/progress/track', async (req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error tracking progress:', error);
    res.status(500).json({ error: 'Failed to track progress' });
  }
});

router.get('/categories', async (req: Request, res: Response) => {
  try {
    res.json({
      categories: [
        { category: 'education', name: 'Education', description: 'Learn the basics', articleCount: 50, icon: 'book' },
        { category: 'recipes', name: 'Recipes', description: 'Cannabis cooking', articleCount: 30, icon: 'utensils' },
        { category: 'wellness', name: 'Wellness', description: 'Health routines', articleCount: 20, icon: 'heart' },
      ],
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/tags/popular', async (req: Request, res: Response) => {
  try {
    res.json({
      tags: [
        { tag: 'beginner', count: 100 },
        { tag: 'edibles', count: 75 },
        { tag: 'wellness', count: 60 },
      ],
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    res.json({
      articles: [],
      recipes: [],
      routines: [],
    });
  } catch (error) {
    console.error('Error searching education:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

export default router;
