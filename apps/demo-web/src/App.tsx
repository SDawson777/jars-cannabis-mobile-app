import React, { useEffect, useState } from 'react';
import { getJson } from './api';

type Category = { id: string; label: string; emoji: string };
type Featured = { id: string; name: string; price: number; image: string; description: string };
type Way = { id: string; label: string };

export default function App() {
  const [healthOk, setHealthOk] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Featured[]>([]);
  const [ways, setWays] = useState<Way[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const h = await getJson<{ ok: boolean }>(`/health`);
        setHealthOk(!!h.ok);
      } catch (e: any) {
        setHealthOk(false);
        setError(e?.message || String(e));
      }
      try {
        setCategories(await getJson<Category[]>(`/home/categories`));
      } catch {}
      try {
        setFeatured(await getJson<Featured[]>(`/home/featured`));
      } catch {}
      try {
        setWays(await getJson<Way[]>(`/home/ways`));
      } catch {}
    })();
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#2E5D46' }} />
        <h1 style={{ margin: 0 }}>JARS Demo</h1>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
          Health: {healthOk == null ? '…' : healthOk ? 'OK' : 'DOWN'}
        </span>
      </header>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: '#fee2e2',
            borderRadius: 8,
            color: '#991b1b',
          }}
        >
          {error}
        </div>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Categories</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12,
          }}
        >
          {categories.map(c => (
            <div
              key={c.id}
              style={{
                padding: 12,
                borderRadius: 12,
                background: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,.05)',
              }}
            >
              <div style={{ fontSize: 28 }}>{c.emoji}</div>
              <div style={{ fontWeight: 600 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Featured</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {featured.map(f => (
            <div
              key={f.id}
              style={{
                padding: 12,
                borderRadius: 12,
                background: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,.05)',
              }}
            >
              <img
                src={f.image}
                alt={f.name}
                style={{ width: '100%', borderRadius: 8, aspectRatio: '1 / 1', objectFit: 'cover' }}
              />
              <div style={{ marginTop: 8, fontWeight: 600 }}>{f.name}</div>
              <div style={{ color: '#374151' }}>${f.price.toFixed(2)}</div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>{f.description}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 24, marginBottom: 48 }}>
        <h2>Ways to Shop</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ways.map(w => (
            <span
              key={w.id}
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                background: '#e5e7eb',
                color: '#111827',
              }}
            >
              {w.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
