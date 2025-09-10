const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.E2E_MOCK_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockProducts = [
  {
    id: '1',
    name: 'Blue Dream',
    slug: 'blue-dream',
    category: 'flower',
    price: 35.00,
    description: 'A popular hybrid strain',
    imageUrl: 'https://example.com/blue-dream.jpg',
    featured: true,
    thcContent: 18.5,
    cbdContent: 0.2,
  },
  {
    id: '2', 
    name: 'OG Kush',
    slug: 'og-kush',
    category: 'flower',
    price: 40.00,
    description: 'Classic indica-dominant strain',
    imageUrl: 'https://example.com/og-kush.jpg',
    featured: false,
    thcContent: 24.0,
    cbdContent: 0.1,
  },
];

const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890',
};

let mockCart = [];
let mockOrders = [];

// Auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    token: 'mock-jwt-token',
    user: mockUser,
  });
});

app.post('/api/v1/auth/register', (req, res) => {
  res.status(201).json({
    token: 'mock-jwt-token',
    user: { ...mockUser, ...req.body },
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  res.json({ user: mockUser });
});

// Products endpoints
app.get('/api/v1/products', (req, res) => {
  const { search, category, page = 1, limit = 20 } = req.query;
  let products = [...mockProducts];
  
  if (search) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (category) {
    products = products.filter(p => p.category === category);
  }
  
  res.json({
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: products.length,
      pages: Math.ceil(products.length / limit),
    },
  });
});

app.get('/api/v1/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json({
    product,
    relatedProducts: mockProducts.filter(p => 
      p.category === product.category && p.id !== product.id
    ).slice(0, 3),
  });
});

// Cart endpoints
app.get('/api/v1/cart', (req, res) => {
  const total = mockCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  res.json({
    cart: {
      items: mockCart,
      total,
      itemCount: mockCart.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
});

app.post('/api/v1/cart/items', (req, res) => {
  const { productId, quantity, variant } = req.body;
  const product = mockProducts.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const cartItem = {
    id: `cart-${Date.now()}`,
    productId,
    quantity,
    variant,
    price: product.price,
    product,
  };
  
  mockCart.push(cartItem);
  
  const total = mockCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  res.status(201).json({
    item: cartItem,
    cart: {
      items: mockCart,
      total,
      itemCount: mockCart.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
});

app.delete('/api/v1/cart', (req, res) => {
  mockCart = [];
  res.json({
    message: 'Cart cleared',
    cart: { items: [], total: 0, itemCount: 0 },
  });
});

// Orders endpoints
app.post('/api/v1/orders', (req, res) => {
  const order = {
    id: `order-${Date.now()}`,
    status: 'pending',
    items: [...mockCart],
    total: mockCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    deliveryMethod: req.body.deliveryMethod,
    deliveryAddress: req.body.deliveryAddress,
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
  };
  
  mockOrders.push(order);
  mockCart = []; // Clear cart after order
  
  res.status(201).json({ order });
});

app.get('/api/v1/orders', (req, res) => {
  res.json({
    orders: mockOrders,
    pagination: {
      page: 1,
      limit: 20,
      total: mockOrders.length,
      pages: 1,
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Mock server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎭 E2E Mock Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;