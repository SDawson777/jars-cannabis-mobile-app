import type { CMSArticle } from '../types/cms';

import { useCMSContent } from './useCMSContent';

export function useArticlesQuery() {
  return useCMSContent<CMSArticle[]>(['articles'], '/content/articles');
}
