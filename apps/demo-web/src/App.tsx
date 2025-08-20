import React, { useState } from 'react';

type Category = { id: string; label: string; emoji: string };
type Featured = { id: string; name: string; price: number; image: string; description: string };
type Way = { id: string; label: string };

// Mock data
const mockCategories: Category[] = [
  { id: '1', label: 'Flower', emoji: '🌸' },
  { id: '2', label: 'Edibles', emoji: '🍪' },
  { id: '3', label: 'Concentrates', emoji: '💎' },
  { id: '4', label: 'Topicals', emoji: '🧴' },
  { id: '5', label: 'Accessories', emoji: '🔧' },
  { id: '6', label: 'CBD', emoji: '🌿' }
];

const mockFeatured: Featured[] = [
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
];

const mockWays: Way[] = [
  { id: '1', label: 'Pickup' },
  { id: '2', label: 'Delivery' },
  { id: '3', label: 'Curbside' },
  { id: '4', label: 'In-Store' }
];

export default function App() {
  const [healthOk] = useState<boolean>(true); // Mock successful connection
  const [categories] = useState<Category[]>(mockCategories);
  const [featured] = useState<Featured[]>(mockFeatured);
  const [ways] = useState<Way[]>(mockWays);

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 20,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16,
        padding: '20px 0',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: 32
      }}>
        <div style={{ 
          width: 48, 
          height: 48, 
          borderRadius: 12, 
          background: 'linear-gradient(135deg, #2E5D46 0%, #4A7C59 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          🌿
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a202c' }}>
            JARS Cannabis Demo
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Premium Cannabis Retail Experience
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ 
            padding: '6px 12px', 
            borderRadius: 20, 
            fontSize: 12, 
            fontWeight: '500',
            backgroundColor: '#dcfce7',
            color: '#166534'
          }}>
            Demo Mode
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #2E5D46 0%, #4A7C59 100%)',
        borderRadius: 16,
        padding: 40,
        marginBottom: 32,
        color: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '32px', fontWeight: '700' }}>
          Welcome to JARS Cannabis
        </h2>
        <p style={{ 
          margin: 0, 
          fontSize: '18px', 
          opacity: 0.9,
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Experience premium cannabis retail with our award-winning mobile app. 
          Browse products, place orders, and enjoy seamless pickup or delivery.
        </p>
      </section>

      {/* Features Grid */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: 20, color: '#1a202c' }}>
          App Features
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 20 
        }}>
          <div style={{ 
            padding: 24, 
            borderRadius: 12, 
            background: 'white', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Age Verification</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Secure 21+ age verification with legal compliance
            </p>
          </div>
          <div style={{ 
            padding: 24, 
            borderRadius: 12, 
            background: 'white', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📍</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Store Locator</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Find nearby locations with real-time inventory
            </p>
          </div>
          <div style={{ 
            padding: 24, 
            borderRadius: 12, 
            background: 'white', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🛒</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Smart Shopping</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Personalized recommendations and filters
            </p>
          </div>
          <div style={{ 
            padding: 24, 
            borderRadius: 12, 
            background: 'white', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Secure Checkout</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Pay at pickup with secure payment options
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: 20, color: '#1a202c' }}>
          Product Categories
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
          gap: 16 
        }}>
          {categories.map(c => (
            <div key={c.id} style={{ 
              padding: 20, 
              borderRadius: 12, 
              background: 'white', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{c.emoji}</div>
              <div style={{ fontWeight: '600', color: '#1a202c' }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: 20, color: '#1a202c' }}>
          Featured Products
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: 20 
        }}>
          {featured.map(f => (
            <div key={f.id} style={{ 
              padding: 20, 
              borderRadius: 12, 
              background: 'white', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <img 
                src={f.image} 
                alt={f.name} 
                style={{ 
                  width: '100%', 
                  borderRadius: 8, 
                  aspectRatio: '1 / 1', 
                  objectFit: 'cover',
                  marginBottom: 12
                }} 
              />
              <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: 4, color: '#1a202c' }}>
                {f.name}
              </div>
              <div style={{ 
                color: '#2E5D46', 
                fontSize: '18px', 
                fontWeight: '700', 
                marginBottom: 8 
              }}>
                ${f.price.toFixed(2)}
              </div>
              <div style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.4' }}>
                {f.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ways to Shop */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: 20, color: '#1a202c' }}>
          Ways to Shop
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {ways.map(w => (
            <span key={w.id} style={{ 
              padding: '12px 20px', 
              borderRadius: 25, 
              background: '#2E5D46', 
              color: 'white',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              {w.label}
            </span>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: 20, color: '#1a202c' }}>
          Technology Stack
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 16 
        }}>
          {[
            { name: 'React Native', desc: 'Cross-platform mobile development' },
            { name: 'Expo', desc: 'Development platform & tools' },
            { name: 'TypeScript', desc: 'Type-safe JavaScript' },
            { name: 'Firebase', desc: 'Backend & authentication' },
            { name: 'Tailwind CSS', desc: 'Utility-first styling' },
            { name: 'Prisma', desc: 'Database ORM' }
          ].map((tech, i) => (
            <div key={i} style={{ 
              padding: 16, 
              borderRadius: 8, 
              background: '#f1f5f9', 
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontWeight: '600', marginBottom: 4, color: '#1a202c' }}>
                {tech.name}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {tech.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '32px 0', 
        borderTop: '1px solid #e2e8f0',
        color: '#64748b',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          JARS Cannabis Mobile App Demo
        </p>
        <p style={{ margin: 0 }}>
          Built with React Native, Expo, and modern web technologies
        </p>
      </footer>
    </div>
  );
}

