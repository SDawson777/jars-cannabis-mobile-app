import { Router } from 'express';

export const homeRouter = Router();

homeRouter.get('/home/categories', (_req, res) => {
  res.json([
    { id: 'flower', label: 'Flower', emoji: '🌿' },
    { id: 'vapes', label: 'Vapes', emoji: '💨' },
    { id: 'edibles', label: 'Edibles', emoji: '🍪' },
    { id: 'pre-rolls', label: 'Pre-rolls', emoji: '🚬' },
    { id: 'concentrates', label: 'Concentrates', emoji: '🛢️' },
    { id: 'gear', label: 'Gear', emoji: '🧰' },
  ]);
});

homeRouter.get('/home/featured', (_req, res) => {
  res.json([
    {
      id: '1',
      name: 'Rainbow Rozay',
      price: 79.0,
      image: 'https://via.placeholder.com/200',
      description: 'A flavorful hybrid with fruity notes.',
    },
    {
      id: '2',
      name: 'Moonwalker OG',
      price: 65.0,
      image: 'https://via.placeholder.com/200',
      description: 'Potent indica leaning strain for relaxation.',
    },
  ]);
});

homeRouter.get('/home/ways', (_req, res) => {
  res.json([
    { id: 'deals', label: 'Shop Deals' },
    { id: 'popular', label: 'Shop Popular' },
    { id: 'effects', label: 'Shop Effects' },
    { id: 'deli', label: 'Shop The Deli' },
  ]);
});
