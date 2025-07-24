export interface StashItem {
  id: string;
  name: string;
  strainType: string;
  imageUrl?: string;
  purchaseDate: string;
  status: 'in_stock' | 'consumed';
}

export interface JournalEntry {
  id: string;
  productId: string;
  notes: string;
  effects: {
    relaxation: number;
    focus: number;
    painRelief: number;
    creativity: number;
    sleepQuality: number;
  };
  activities: string[];
  createdAt: string;
}
