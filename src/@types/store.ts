export type StoreAmenity =
  | 'curbside'
  | 'atm'
  | 'accessible'
  | 'parking'
  | 'wifi'
  | 'pet_friendly'
  | 'delivery'
  | 'online_ordering';

export interface StoreData {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  _state?: string;
  zip?: string;
  phone?: string;
  websiteUrl?: string;
  openNow?: boolean;
  todayHours?: string;
  weeklyHours?: { day: string; open: string; close: string; note?: string }[];
  amenities?: StoreAmenity[];
  dealsActive?: boolean;
  inventorySummary?: string;
  rating?: number;
  reviewCount?: number;
  heroImageUrl?: string;
  promo?: string;
}

export interface StoreReview {
  id: string;
  storeId: string;
  user: { id: string; name: string; avatarUrl?: string };
  rating: number;
  comment: string;
  createdAt: string;
}
