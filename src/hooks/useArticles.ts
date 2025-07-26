import type { CMSArticle } from '../types/cms';
import { useCMSContent } from './useCMSContent';

export function useArticles() {
  return useCMSContent<CMSArticle[]>(['articles'], '/api/greenhouse/articles');
}
