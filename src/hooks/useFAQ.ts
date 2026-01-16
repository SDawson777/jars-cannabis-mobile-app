import type { FAQItem } from '../types/cmsExtra';

import { useCMSContent } from './useCMSContent';

interface FAQResponse {
  items: FAQItem[];
}

export function useFAQQuery() {
  const query = useCMSContent<FAQResponse>(['faq'], '/content/faq');

  // Transform the response to extract items array
  return {
    ...query,
    data:
      query.data?.items?.map((item: any, index: number) => ({
        id: item.id || item.slug || `faq-${index}`,
        question: item.question || item.title || '',
        answer: item.answer || item.body || '',
      })) ?? [],
  };
}
