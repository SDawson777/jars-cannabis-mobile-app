// src/hooks/useCopy.ts
// Fetches localized app copy from CMS /content/copy endpoint
import { useQuery } from '@tanstack/react-query';
import { cmsClient } from '../api/cmsClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export type CopyContext = 
  | 'onboarding' 
  | 'emptyStates' 
  | 'awards' 
  | 'accessibility' 
  | 'dataTransparency'
  | 'ageGate'
  | 'checkout'
  | 'errors';

export interface CopyItem {
  key: string;
  text: string;
}

export type CopyMap = Record<string, string>;

/**
 * Transform copy items array to a key-value map for easy lookup
 */
function toCopyMap(items: CopyItem[]): CopyMap {
  const map: CopyMap = {};
  items.forEach(item => {
    map[item.key] = item.text;
  });
  return map;
}

/**
 * Fetch copy for a specific context from CMS
 */
async function fetchCopy(context: CopyContext): Promise<CopyMap> {
  const cacheKey = `cms:copy:${context}`;
  const netState = await NetInfo.fetch();

  if (!netState.isConnected) {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    // Return empty map if offline and no cache
    return {};
  }

  try {
    const res = await cmsClient.get<CopyItem[]>('/content/copy', {
      params: { context },
    });
    const copyMap = toCopyMap(res.data || []);
    
    // Cache for offline use
    await AsyncStorage.setItem(cacheKey, JSON.stringify(copyMap));
    return copyMap;
  } catch (err) {
    // Try cache on network error
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    return {};
  }
}

/**
 * Hook to fetch copy for a specific context
 * Use this to populate onboarding, empty states, awards screens, etc.
 */
export function useCopy(context: CopyContext) {
  return useQuery<CopyMap, Error>({
    queryKey: ['copy', context],
    queryFn: () => fetchCopy(context),
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Hook to get a specific copy string with fallback
 */
export function useCopyString(context: CopyContext, key: string, fallback: string = '') {
  const { data: copyMap } = useCopy(context);
  return copyMap?.[key] ?? fallback;
}

/**
 * Default fallback copy for when CMS is unavailable
 */
export const defaultCopy: Record<CopyContext, CopyMap> = {
  onboarding: {
    'welcome.title': 'Welcome to Nimbus',
    'welcome.subtitle': 'Your premium cannabis shopping experience',
    'step1.title': 'Browse Products',
    'step1.description': 'Explore our curated selection of cannabis products',
    'step2.title': 'Add to Cart',
    'step2.description': 'Select your favorites and add them to your cart',
    'step3.title': 'Checkout',
    'step3.description': 'Complete your order for pickup or delivery',
  },
  emptyStates: {
    'cart.empty': 'Your cart is empty',
    'cart.emptyAction': 'Start shopping',
    'orders.empty': 'No orders yet',
    'favorites.empty': 'No favorites saved',
    'search.noResults': 'No products found',
  },
  awards: {
    'badge.earned': 'Congratulations!',
    'badge.earnedDescription': 'You\'ve earned a new badge',
    'points.earned': 'Points earned!',
    'tier.upgraded': 'Level up!',
  },
  accessibility: {
    'statement.title': 'Accessibility Statement',
    'statement.body': 'We are committed to ensuring digital accessibility for people with disabilities.',
  },
  dataTransparency: {
    'privacy.title': 'Your Data',
    'privacy.description': 'Learn how we collect and use your data',
    'preferences.title': 'Data Preferences',
  },
  ageGate: {
    'title': 'Age Verification Required',
    'description': 'You must be 21 or older to enter',
    'confirm': 'I am 21 or older',
    'deny': 'I am under 21',
  },
  checkout: {
    'processing': 'Processing your order...',
    'success': 'Order placed successfully!',
    'error': 'There was an issue with your order',
  },
  errors: {
    'network': 'Unable to connect. Please check your connection.',
    'generic': 'Something went wrong. Please try again.',
    'notFound': 'The requested content was not found.',
  },
};
