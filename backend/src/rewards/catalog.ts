// backend/src/rewards/catalog.ts
// Simple in-memory rewards catalog. In production this could move to a DB table.
// Each reward has: id, title, description, iconUrl, cost (points required)

export interface RewardCatalogItem {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  cost: number;
  active?: boolean;
}

export const rewardsCatalog: RewardCatalogItem[] = [
  {
    id: 'R1',
    title: '10% Off Coupon',
    description: 'Save 10% on your next purchase.',
    iconUrl: 'https://cdn.example.com/rewards/discount10.png',
    cost: 100,
    active: true,
  },
  {
    id: 'R2',
    title: 'Free Pre-roll',
    description: 'Enjoy a complimentary pre-roll on us.',
    iconUrl: 'https://cdn.example.com/rewards/preroll.png',
    cost: 250,
    active: true,
  },
  {
    id: 'R3',
    title: 'VIP Event Access',
    description: 'Exclusive access to an upcoming VIP community event.',
    iconUrl: 'https://cdn.example.com/rewards/vip.png',
    cost: 500,
    active: true,
  },
];

export function findRewardInCatalog(id: string) {
  return rewardsCatalog.find(r => r.id === id && r.active !== false) || null;
}
