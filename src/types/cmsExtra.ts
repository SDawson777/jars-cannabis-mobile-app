export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface LegalContent {
  title: string;
  body: string;
}

export interface ShopFilter {
  id: string;
  label: string;
}

/** CMS Theme tokens fetched from /content/theme */
export interface CMSTheme {
  brandSlug: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  accentColor?: string;
  cornerRadius?: number;
  logoUrl?: string;
  darkModeEnabled?: boolean;
  elevation?: 'flat' | 'soft' | 'prominent';
  fontFamily?: string;
}

/** CMS Deal/Promotion from /content/deals */
export interface CMSDeal {
  id: string;
  title: string;
  description: string;
  discountType?: 'percent' | 'fixed' | 'bogo';
  discountValue?: number;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  productIds?: string[];
  categoryIds?: string[];
  isActive?: boolean;
}

/** Personalization apply request */
export interface PersonalizationRequest {
  slugs: string[];
  userId?: string;
  sessionId?: string;
  channel: 'mobile' | 'web';
  locationState?: string;
  preferences?: Record<string, any>;
}

/** Personalization apply response */
export interface PersonalizationResponse {
  rankedSlugs: string[];
  boosts?: Record<string, number>;
  fallback?: boolean;
}
