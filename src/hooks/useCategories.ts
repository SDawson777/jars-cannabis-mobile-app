// src/hooks/useCategories.ts
// Fetches categories from /content/filters (CMS) instead of stubbed /home/categories
import { useQuery } from '@tanstack/react-query';
import { cmsClient } from '../api/cmsClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface Category {
  id: string;
  label: string;
  slug?: string;
  iconRef?: string;
  emoji?: string;
  weight?: number;
}

// Category icon mapping for emojis (can be overridden by iconRef from CMS)
const categoryEmojis: Record<string, string> = {
  flower: '🌿',
  vapes: '💨',
  edibles: '🍪',
  'pre-rolls': '🚬',
  concentrates: '🛢️',
  gear: '🧰',
  topicals: '🧴',
  tinctures: '💧',
  accessories: '🔧',
  cbd: '💚',
};

/**
 * Transform raw filter data into Category objects with emojis
 */
function transformCategories(filters: any[]): Category[] {
  return filters.map(f => ({
    id: f.id || f.slug,
    label: f.label || f.name,
    slug: f.slug || f.id,
    iconRef: f.iconRef,
    emoji: f.emoji || categoryEmojis[f.id] || categoryEmojis[f.slug] || '📦',
    weight: f.weight ?? 0,
  }));
}

/**
 * Fetch categories from CMS /content/filters endpoint
 * Falls back to cached data when offline
 */
async function fetchCategories(): Promise<Category[]> {
  const cacheKey = 'cms:categories';
  const netState = await NetInfo.fetch();

  if (!netState.isConnected) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    throw new Error('Offline and no cached categories available');
  }

  try {
    const res = await cmsClient.get<any[]>('/content/filters');
    const categories = transformCategories(res.data || []);
    
    // Sort by weight descending
    categories.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    
    // Cache for offline use
    await AsyncStorage.setItem(cacheKey, JSON.stringify(categories));
    return categories;
  } catch (err) {
    // Try cache on network error
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    throw err;
  }
}

/**
 * Hook to fetch categories from CMS
 * Replaces stubbed /home/categories endpoint
 */
export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to get a single category by ID
 */
export function useCategoryById(categoryId: string) {
  const { data: categories, ...rest } = useCategories();
  const category = categories?.find((c: Category) => c.id === categoryId);
  return { data: category, ...rest };
}
