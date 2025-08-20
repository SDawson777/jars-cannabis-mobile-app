const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ ok: true });
});

// Categories endpoint
app.get('/api/v1/home/categories', (req, res) => {
  res.json([
    { id: '1', label: 'Flower', emoji: '🌸' },
    { id: '2', label: 'Edibles', emoji: '🍪' },
    { id: '3', label: 'Concentrates', emoji: '💎' },
    { id: '4', label: 'Topicals', emoji: '🧴' },
    { id: '5', label: 'Accessories', emoji: '🔧' },
    { id: '6', label: 'CBD', emoji: '🌿' }
  ]);
});

// Featured products endpoint
app.get('/api/v1/home/featured', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Premium OG Kush',
      price: 45.00,
      image: 'https://images.unsplash.com/photo-1603094977208-0b5b0b5b5b5b?w=400&h=400&fit=crop',
      description: 'Premium indoor grown cannabis with high THC content'
    },
    {
      id: '2',
      name: 'CBD Gummies',
      price: 25.00,
      image: 'https://images.unsplash.com/photo-1603094977208-0b5b0b5b5b5b?w=400&h=400&fit=crop',
      description: 'Delicious CBD gummies for relaxation and wellness'
    },
    {
      id: '3',
      name: 'Live Resin Cartridge',
      price: 60.00,
      image: 'https://images.unsplash.com/photo-1603094977208-0b5b0b5b5b5b?w=400&h=400&fit=crop',
      description: 'Premium live resin vape cartridge with terpene profile'
    },
    {
      id: '4',
      name: 'Topical Relief Cream',
      price: 35.00,
      image: 'https://images.unsplash.com/photo-1603094977208-0b5b0b5b5b5b?w=400&h=400&fit=crop',
      description: 'CBD-infused topical cream for pain relief'
    }
  ]);
});

// Ways to shop endpoint
app.get('/api/v1/home/ways', (req, res) => {
  res.json([
    { id: '1', label: 'Pickup' },
    { id: '2', label: 'Delivery' },
    { id: '3', label: 'Curbside' },
    { id: '4', label: 'In-Store' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1`);
});