export interface ForYouTodayItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  isNew?: boolean;
  hasDeal?: boolean;
}

export interface ForYouTodayPayload {
  greeting: string;
  message: string;
  products: ForYouTodayItem[];
  ctaText?: string;
}
