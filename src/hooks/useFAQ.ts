import type { FAQItem } from '../types/cmsExtra';
import { useCMSContent } from './useCMSContent';

export function useFAQ() {
  return useCMSContent<FAQItem[]>(['faq'], '/api/content/faq');
}
