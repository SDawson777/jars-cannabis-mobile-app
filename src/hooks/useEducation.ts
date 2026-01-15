// src/hooks/useEducation.ts
// Educational content - articles, recipes, wellness routines, pairing suggestions

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  category: ArticleCategory;
  tags: string[];
  effects?: string[];
  occasion?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  readingTime: number; // minutes
  featuredImage?: string;
  images?: string[];
  videoUrl?: string;
  publishedAt: string;
  updatedAt: string;
  likeCount: number;
  saveCount: number;
  viewCount: number;
  isLiked: boolean;
  isSaved: boolean;
  relatedArticles?: string[];
}

export type ArticleCategory = 
  | 'education'
  | 'recipes'
  | 'wellness'
  | 'strain-guides'
  | 'consumption-methods'
  | 'news'
  | 'lifestyle'
  | 'pairings'
  | 'beginner-guides';

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  featuredImage?: string;
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dosagePerServing: string;
  effects: string[];
  ingredients: {
    item: string;
    amount: string;
    unit: string;
    cannabisProduct?: string;
  }[];
  instructions: {
    step: number;
    instruction: string;
    tip?: string;
    image?: string;
  }[];
  tips: string[];
  warnings: string[];
  nutritionFacts?: {
    calories?: number;
    thcMg?: number;
    cbdMg?: number;
  };
  pairings?: string[];
  tags: string[];
  author: {
    id: string;
    name: string;
  };
  publishedAt: string;
  likeCount: number;
  isSaved: boolean;
}

export interface WellnessRoutine {
  id: string;
  title: string;
  slug: string;
  description: string;
  featuredImage?: string;
  duration: string; // e.g., "7 days", "ongoing"
  goal: string;
  targetEffects: string[];
  schedule: {
    time: 'morning' | 'afternoon' | 'evening' | 'night';
    activity: string;
    suggestedProducts?: string[];
    dosageGuideline?: string;
    duration?: string;
  }[];
  tips: string[];
  precautions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  likeCount: number;
  isSaved: boolean;
}

export interface PairingSuggestion {
  id: string;
  title: string;
  description: string;
  featuredImage?: string;
  strainType: 'indica' | 'sativa' | 'hybrid';
  occasion: string;
  pairings: {
    category: 'food' | 'drink' | 'activity' | 'music' | 'movie';
    suggestions: {
      name: string;
      description: string;
      image?: string;
    }[];
  }[];
  effects: string[];
  mood: string[];
  tags: string[];
}

export interface LearningProgress {
  userId: string;
  articlesRead: number;
  recipesViewed: number;
  routinesStarted: number;
  minutesSpent: number;
  completedModules: string[];
  currentStreak: number;
  longestStreak: number;
  badges: string[];
}

// ============================================
// Article Hooks
// ============================================

/**
 * Hook to fetch articles
 */
export function useArticles(options?: {
  category?: ArticleCategory;
  tags?: string[];
  effects?: string[];
  difficulty?: string;
  search?: string;
}) {
  return useInfiniteQuery<{ articles: Article[]; nextCursor?: string }, Error>({
    queryKey: ['education', 'articles', options],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ articles: Article[]; nextCursor?: string }>(
        phase4Client,
        '/education/articles',
        { params: { ...options, cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { articles: Article[]; nextCursor?: string }) => lastPage.nextCursor,
  });
}

/**
 * Hook to fetch a single article
 */
export function useArticle(slug: string) {
  return useQuery<Article, Error>({
    queryKey: ['education', 'article', slug],
    queryFn: async () => {
      const article = await clientGet<Article>(
        phase4Client,
        `/education/articles/${slug}`
      );
      logEvent('article_viewed', { articleId: article.id, category: article.category });
      return article;
    },
    enabled: !!slug,
  });
}

/**
 * Hook to fetch featured articles
 */
export function useFeaturedArticles() {
  return useQuery<Article[], Error>({
    queryKey: ['education', 'articles', 'featured'],
    queryFn: async () => {
      const res = await clientGet<{ articles: Article[] }>(
        phase4Client,
        '/education/articles/featured'
      );
      return res.articles;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to like an article
 */
export function useLikeArticle() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { articleId: string; like: boolean }>({
    mutationFn: async ({ articleId, like }: { articleId: string; like: boolean }) => {
      await clientPost<{ like: boolean }, void>(
        phase4Client,
        `/education/articles/${articleId}/like`,
        { like }
      );
      logEvent(like ? 'article_liked' : 'article_unliked', { articleId });
    },
    onSuccess: (_: void, { articleId }: { articleId: string; like: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['education', 'article', articleId] });
    },
  });
}

/**
 * Hook to save an article
 */
export function useSaveArticle() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { articleId: string; save: boolean }>({
    mutationFn: async ({ articleId, save }: { articleId: string; save: boolean }) => {
      await clientPost<{ save: boolean }, void>(
        phase4Client,
        `/education/articles/${articleId}/save`,
        { save }
      );
      logEvent(save ? 'article_saved' : 'article_unsaved', { articleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'saved'] });
    },
  });
}

/**
 * Hook to fetch saved articles
 */
export function useSavedArticles() {
  return useQuery<Article[], Error>({
    queryKey: ['education', 'saved', 'articles'],
    queryFn: async () => {
      const res = await clientGet<{ articles: Article[] }>(
        phase4Client,
        '/education/saved/articles'
      );
      return res.articles;
    },
  });
}

// ============================================
// Recipe Hooks
// ============================================

/**
 * Hook to fetch recipes
 */
export function useRecipes(options?: {
  difficulty?: 'easy' | 'medium' | 'hard';
  effects?: string[];
  maxTime?: number;
  search?: string;
}) {
  return useInfiniteQuery<{ recipes: Recipe[]; nextCursor?: string }, Error>({
    queryKey: ['education', 'recipes', options],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ recipes: Recipe[]; nextCursor?: string }>(
        phase4Client,
        '/education/recipes',
        { params: { ...options, cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { recipes: Recipe[]; nextCursor?: string }) => lastPage.nextCursor,
  });
}

/**
 * Hook to fetch a single recipe
 */
export function useRecipe(slug: string) {
  return useQuery<Recipe, Error>({
    queryKey: ['education', 'recipe', slug],
    queryFn: async () => {
      const recipe = await clientGet<Recipe>(
        phase4Client,
        `/education/recipes/${slug}`
      );
      logEvent('recipe_viewed', { recipeId: recipe.id, difficulty: recipe.difficulty });
      return recipe;
    },
    enabled: !!slug,
  });
}

/**
 * Hook to fetch featured recipes
 */
export function useFeaturedRecipes() {
  return useQuery<Recipe[], Error>({
    queryKey: ['education', 'recipes', 'featured'],
    queryFn: async () => {
      const res = await clientGet<{ recipes: Recipe[] }>(
        phase4Client,
        '/education/recipes/featured'
      );
      return res.recipes;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to save a recipe
 */
export function useSaveRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { recipeId: string; save: boolean }>({
    mutationFn: async ({ recipeId, save }: { recipeId: string; save: boolean }) => {
      await clientPost<{ save: boolean }, void>(
        phase4Client,
        `/education/recipes/${recipeId}/save`,
        { save }
      );
      logEvent(save ? 'recipe_saved' : 'recipe_unsaved', { recipeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'saved', 'recipes'] });
    },
  });
}

// ============================================
// Wellness Routine Hooks
// ============================================

/**
 * Hook to fetch wellness routines
 */
export function useWellnessRoutines(options?: {
  goal?: string;
  effects?: string[];
  difficulty?: string;
}) {
  return useQuery<WellnessRoutine[], Error>({
    queryKey: ['education', 'wellness', options],
    queryFn: async () => {
      const res = await clientGet<{ routines: WellnessRoutine[] }>(
        phase4Client,
        '/education/wellness',
        { params: options }
      );
      return res.routines;
    },
  });
}

/**
 * Hook to fetch a single wellness routine
 */
export function useWellnessRoutine(slug: string) {
  return useQuery<WellnessRoutine, Error>({
    queryKey: ['education', 'wellness', slug],
    queryFn: async () => {
      return await clientGet<WellnessRoutine>(
        phase4Client,
        `/education/wellness/${slug}`
      );
    },
    enabled: !!slug,
  });
}

/**
 * Hook to start a wellness routine
 */
export function useStartRoutine() {
  const queryClient = useQueryClient();
  
  return useMutation<{ trackingId: string }, Error, string>({
    mutationFn: async (routineId: string) => {
      const result = await clientPost<{ routineId: string }, { trackingId: string }>(
        phase4Client,
        '/education/wellness/start',
        { routineId }
      );
      logEvent('routine_started', { routineId });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'progress'] });
    },
  });
}

// ============================================
// Pairing Suggestion Hooks
// ============================================

/**
 * Hook to fetch pairing suggestions
 */
export function usePairingSuggestions(options?: {
  strainType?: 'indica' | 'sativa' | 'hybrid';
  occasion?: string;
  mood?: string;
}) {
  return useQuery<PairingSuggestion[], Error>({
    queryKey: ['education', 'pairings', options],
    queryFn: async () => {
      const res = await clientGet<{ pairings: PairingSuggestion[] }>(
        phase4Client,
        '/education/pairings',
        { params: options }
      );
      return res.pairings;
    },
  });
}

/**
 * Hook to get product-specific pairings
 */
export function useProductPairings(productId: string) {
  return useQuery<PairingSuggestion, Error>({
    queryKey: ['education', 'pairings', 'product', productId],
    queryFn: async () => {
      return await clientGet<PairingSuggestion>(
        phase4Client,
        `/education/pairings/product/${productId}`
      );
    },
    enabled: !!productId,
  });
}

// ============================================
// Learning Progress Hooks
// ============================================

/**
 * Hook to fetch learning progress
 */
export function useLearningProgress() {
  return useQuery<LearningProgress, Error>({
    queryKey: ['education', 'progress'],
    queryFn: async () => {
      return await clientGet<LearningProgress>(
        phase4Client,
        '/education/progress'
      );
    },
  });
}

/**
 * Hook to track reading progress
 */
export function useTrackProgress() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, {
    contentType: 'article' | 'recipe' | 'routine';
    contentId: string;
    timeSpent: number; // seconds
    completed: boolean;
  }>({
    mutationFn: async (progress: {
      contentType: 'article' | 'recipe' | 'routine';
      contentId: string;
      timeSpent: number;
      completed: boolean;
    }) => {
      await clientPost<typeof progress, void>(
        phase4Client,
        '/education/progress/track',
        progress
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education', 'progress'] });
    },
  });
}

// ============================================
// Content Categories & Tags Hooks
// ============================================

/**
 * Hook to fetch content categories
 */
export function useContentCategories() {
  return useQuery<{
    category: ArticleCategory;
    name: string;
    description: string;
    articleCount: number;
    icon: string;
  }[], Error>({
    queryKey: ['education', 'categories'],
    queryFn: async () => {
      const res = await clientGet<{ categories: {
        category: ArticleCategory;
        name: string;
        description: string;
        articleCount: number;
        icon: string;
      }[] }>(phase4Client, '/education/categories');
      return res.categories;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to fetch popular tags
 */
export function usePopularTags() {
  return useQuery<{ tag: string; count: number }[], Error>({
    queryKey: ['education', 'tags', 'popular'],
    queryFn: async () => {
      const res = await clientGet<{ tags: { tag: string; count: number }[] }>(
        phase4Client,
        '/education/tags/popular'
      );
      return res.tags;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// ============================================
// Search Hook
// ============================================

/**
 * Hook to search educational content
 */
export function useSearchEducation(query: string) {
  return useQuery<{
    articles: Article[];
    recipes: Recipe[];
    routines: WellnessRoutine[];
  }, Error>({
    queryKey: ['education', 'search', query],
    queryFn: async () => {
      return await clientGet(
        phase4Client,
        '/education/search',
        { params: { q: query } }
      );
    },
    enabled: query.length >= 2,
  });
}
