export interface MiniProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export type ScenarioType =
  | 'product_carousel'
  | 'message_only'
  | 'loyalty_reminder'
  | 'educational_link';

interface BaseScenario {
  id: string;
  type: ScenarioType;
  title: string;
  message?: string;
}

export interface ProductCarouselScenario extends BaseScenario {
  type: 'product_carousel';
  products: MiniProduct[];
  ctaText: string;
  ctaLink: string;
  effectTint?: 'relaxing' | 'uplifting' | 'hybrid';
}

export interface MessageOnlyScenario extends BaseScenario {
  type: 'message_only';
  icon?: string;
}

export interface LoyaltyReminderScenario extends BaseScenario {
  type: 'loyalty_reminder';
  pointsNeeded: number;
}

export interface EducationalLinkScenario extends BaseScenario {
  type: 'educational_link';
  articleId: string;
  ctaText: string;
}

export type PersonalizedCardData =
  | ProductCarouselScenario
  | MessageOnlyScenario
  | LoyaltyReminderScenario
  | EducationalLinkScenario;
