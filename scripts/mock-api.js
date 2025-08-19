/* Simple mock API for demo purposes */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));

// Profile prefs
let preferences = {
  highContrast: false,
  textSize: 'medium',
  language: 'en',
};
app.get('/api/v1/profile/preferences', (_req, res) => res.json(preferences));
app.put('/api/v1/profile/preferences', (req, res) => {
  preferences = { ...preferences, ...(req.body || {}) };
  res.json({ ok: true });
});

// Loyalty
app.get('/api/v1/loyalty/status', (_req, res) =>
  res.json({ tier: 'Bronze', points: 120, nextTierAt: 500 })
);
app.get('/api/v1/loyalty/badges', (_req, res) =>
  res.json([
    { id: 'first-purchase', title: 'First Purchase', earnedDate: '2025-01-01' },
  ])
);

// Awards
app.get('/api/v1/awards/status', (_req, res) =>
  res.json({ earned: ['first-purchase'], available: ['loyal-customer'] })
);

// Journal
let journal = [];
app.get('/api/v1/journal/entries', (_req, res) => res.json(journal));
app.post('/api/v1/journal/entries', (req, res) => {
  const entry = { id: String(Date.now()), ...(req.body || {}), createdAt: new Date().toISOString() };
  journal.push(entry);
  res.json(entry);
});
app.put('/api/v1/journal/entries/:id', (req, res) => {
  const { id } = req.params;
  journal = journal.map(j => (j.id === id ? { ...j, ...(req.body || {}) } : j));
  res.json({ ok: true });
});

// Recommendations
app.get('/api/v1/recommendations/for-you', (_req, res) =>
  res.json([
    { id: 'p1', name: 'Indica Dream', category: 'Flower', thcPercent: 22 },
    { id: 'p2', name: 'Citrus Cart', category: 'Vape', thcPercent: 85 },
  ])
);
app.get('/api/v1/recommendations/related/:productId', (req, res) =>
  res.json([{ id: 'p3', name: `Related to ${req.params.productId}`, category: 'Edibles' }])
);

// Products / Reviews
app.post('/api/v1/products/:id/reviews', (_req, res) => res.json({ ok: true }));

// Push token
app.post('/api/v1/profile/push-token', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Mock API running at http://localhost:${port}`);
});

