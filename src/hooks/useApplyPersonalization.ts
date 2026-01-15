import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

import { clientPost } from '../api/http';
import { phase4Client } from '../api/phase4Client';
import type { PersonalizationRequest, PersonalizationResponse } from '../types/cmsExtra';
import logger from '../lib/logger';

// Store session ID for the app lifecycle
let sessionId: string | null = null;

async function getSessionId(): Promise<string> {
  if (sessionId) return sessionId;
  
  try {
    const stored = await AsyncStorage.getItem('personalization_session_id');
    if (stored) {
      sessionId = stored;
      return sessionId;
    }
  } catch {
    // ignore storage errors
  }
  
  // Generate new session ID
  sessionId = uuidv4();
  try {
    await AsyncStorage.setItem('personalization_session_id', sessionId);
  } catch {
    // ignore storage errors
  }
  return sessionId;
}

/**
 * Apply personalization rules to a list of content slugs
 * Returns ranked slugs based on user context and CMS rules
 */
async function applyPersonalization(
  slugs: string[],
  userId?: string,
  locationState?: string,
  preferences?: Record<string, any>
): Promise<PersonalizationResponse> {
  const session = await getSessionId();
  
  const payload: PersonalizationRequest = {
    slugs,
    userId,
    sessionId: session,
    channel: 'mobile',
    locationState,
    preferences,
  };

  try {
    const response = await clientPost<PersonalizationRequest, PersonalizationResponse>(
      phase4Client,
      '/personalization/apply',
      payload
    );
    return response;
  } catch (err) {
    // Fallback to deterministic ordering on error
    logger.warn('Personalization apply failed, using fallback ordering', { err });
    return {
      rankedSlugs: slugs, // Return original order
      fallback: true,
    };
  }
}

/**
 * Hook to apply personalization to content slugs
 */
export function useApplyPersonalization() {
  return useMutation<
    PersonalizationResponse,
    Error,
    {
      slugs: string[];
      userId?: string;
      locationState?: string;
      preferences?: Record<string, any>;
    }
  >({
    mutationFn: (params: {
      slugs: string[];
      userId?: string;
      locationState?: string;
      preferences?: Record<string, any>;
    }) => applyPersonalization(params.slugs, params.userId, params.locationState, params.preferences),
  });
}

/**
 * Utility to reorder items based on personalization response
 */
export function reorderByPersonalization<T extends { slug?: string; id?: string; __id?: string }>(
  items: T[],
  rankedSlugs: string[]
): T[] {
  if (!rankedSlugs.length) return items;
  
  const slugMap = new Map<string, T>();
  items.forEach(item => {
    const key = item.slug || item.id || item.__id;
    if (key) slugMap.set(key, item);
  });
  
  const ordered: T[] = [];
  rankedSlugs.forEach(slug => {
    const item = slugMap.get(slug);
    if (item) {
      ordered.push(item);
      slugMap.delete(slug);
    }
  });
  
  // Add any remaining items not in ranked list
  slugMap.forEach(item => ordered.push(item));
  
  return ordered;
}
