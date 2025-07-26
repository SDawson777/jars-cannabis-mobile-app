import type { PersonalizedCardData } from '../types/personalization';

export function isValidPersonalizedCardData(data: any): data is PersonalizedCardData {
  if (!data || typeof data !== 'object' || typeof data.type !== 'string') {
    return false;
  }
  switch (data.type) {
    case 'product_carousel':
      return Array.isArray(data.products) && typeof data.ctaText === 'string';
    case 'message_only':
      return typeof data.title === 'string';
    case 'loyalty_reminder':
      return typeof data.pointsNeeded === 'number';
    case 'educational_link':
      return typeof data.articleId === 'string' && typeof data.ctaText === 'string';
    default:
      return false;
  }
}
