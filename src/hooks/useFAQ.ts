import type { FAQItem } from '../types/cmsExtra';
import { useCMSContent } from './useCMSContent';

export function useFAQQuery() {
  return useCMSContent<FAQItem[]>(['faq'], '/content/faq');
}
