import type { FAQItem } from '../types/cmsExtra';

import { useCMSContent } from './useCMSContent';

export function useFAQQuery() {
  return useCMSContent<FAQItem[]>(['fa_q'], '/content/fa_q');
}
