'use client';

import { useMemo, useState } from 'react';
import { products, Product } from '@/lib/products';

type CartLine = { product: Product; qty: number };

export default function Home() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
        .filter((l) => l.product !== undefined),
    [cart]
  );

  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const total = lines.reduce((sum, l) => sum + l.qty * l.product.price, 0);

  function addToCart(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    setDrawerOpen(true);
  }

  function setQty(id: string, qty: number) {
    setCart((c) => ({ ...c, [id]: Math.max(0, qty) }));
  }

  async function checkout() {
    setError(null);
    setPlacing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'MYR',
          items: lines.map((l) => ({ id: l.product.id, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Could not start checkout');
      }
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Try again.');
      setPlacing(false);
    }
  }

  return (
    <div style={{ backgroundColor: '#0f0505', color: '#f5f5f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Top Header */}
      <header className="topbar" style={{ backgroundColor: '#1a0808', borderBottom: '2px solid #da1f26' }}>
        <div className="topbar-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
          <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#da1f26', fontSize: '1.8rem' }}>♠</span> Sams Gamer
          </div>
          <button 
            className="cart-toggle" 
            onClick={() => setDrawerOpen(true)}
            style={{
              backgroundColor: '#da1f26',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1.2rem',
              borderRadius: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Cart
            {itemCount > 0 && (
              <span className="cart-count" style={{ backgroundColor: '#ffd700', color: '#000', borderRadius: '50%', padding: '0.1rem 0.5rem', fontSize: '0.8rem' }}>
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Zynga Style Hero */}
      <section className="hero wrap" style={{ textAlign: 'center', padding: '3rem 1rem', background: 'radial-gradient(circle, #3d0c0e 0%, #0f0505 100%)' }}>
        <div>
          <div className="eyebrow" style={{ color: '#ffd700', letterSpacing: '2px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            OFFICIAL ZYNGA POKER CHIPS STORE
          </div>
          <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#fff', textTransform: 'uppercase' }}>
            Sams Gamer Shop
          </h1>
          <p style={{ color: '#ccc', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            Safe, fast, and instant Zynga Poker chips reload directly to your account. 24/7 automated delivery support.
          </p>
          <a 
            className="hero-cta" 
            href="#shop"
            style={{
              display: 'inline-block',
              backgroundColor: '#ffd700',
              color: '#000',
              padding: '0.8rem 2rem',
              borderRadius: '25px',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
            }}
          >
            BUY CHIPS NOW ↓
          </a>
          <div className="hero-note" style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#888' }}>
            Supports DuitNow QR · FPX Online Banking · Touch 'n Go
          </div>
        </div>
      </section>

      {/* Catalog Title */}
      <div id="shop" className="section-head wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ color: '#ffd700', borderLeft: '4px solid #da1f26', paddingLeft: '0.5rem' }}>CHIP PACKAGES</h2>
        <span style={{ color: '#aaa' }}>{products.length} packages available</span>
      </div>

      {/* Product List */}
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
        {products.map((p) => (
          <article 
            className="card" 
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.2rem',
              backgroundColor: '#1c0a0b',
              borderRadius: '8px',
              border: p.badge?.includes('JIMAT') || p.badge?.includes('HOT') ? '1px solid #ffd700' : '1px solid #331214',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '45px',
                  height: '45px',
                  minWidth: '45px',
                  borderRadius: '50%',
                  backgroundColor: '#da1f26',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  border: '2px solid #ffd700',
                }}
              >
                {p.pieces}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{p.name}</h3>
                  {p.badge && (
                    <span 
                      style={{ 
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: p.badge.includes('JIMAT') ? '#da1f26' : '#ffd700',
                        color: p.badge.includes('JIMAT') ? '#fff' : '#000',
                        fontWeight: 'bold',
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa' }}>{p.description}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
              <div className="price" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffd700', whiteSpace: 'nowrap' }}>
                RM {p.price.toFixed(2)}
              </div>
              <button 
                onClick={() => addToCart(p.id)} 
                style={{
                  backgroundColor: '#da1f26',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Add
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Footer */}
      <footer className="foot wrap" style={{ marginTop: '3rem', padding: '2rem', textAlign: 'center', borderTop: '1px solid #220b0c', color: '#666' }}>
        <span>© {new Date().getFullYear()} Sams Gamer · Zynga Chip Service</span>
      </footer>

      {/* Cart Drawer Overlay */}
      {drawerOpen && (
        <>
          <div 
            className="overlay" 
            onClick={() => setDrawerOpen(false)} 
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 40 }}
          />
          <div 
            className="drawer"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '400px',
              backgroundColor: '#140607',
              borderLeft: '2px solid #da1f26',
              padding: '1.5rem',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#ffd700' }}>Your Cart</h2>
                <button 
                  onClick={() => setDrawerOpen(false)} 
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {lines.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>Your cart is empty. Add a chip package to continue.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {lines.map((l) => (
                    <div key={l.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: '1px solid #280d0f' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{l.product.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#ffd700' }}>RM {l.product.price.toFixed(2)} each</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => setQty(l.product.id, l.qty - 1)} style={{ padding: '0.2rem 0.6rem', background: '#280d0f', border: 'none', color: '#fff', borderRadius: '4px' }}>−</button>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{l.qty}</span>
                        <button onClick={() => setQty(l.product.id, l.qty + 1)} style={{ padding: '0.2rem 0.6rem', background: '#280d0f', border: 'none', color: '#fff', borderRadius: '4px' }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cart-footer" style={{ borderTop: '1px solid #280d0f', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff' }}>
                <span>Total</span>
                <span style={{ color: '#ffd700' }}>RM {total.toFixed(2)}</span>
              </div>
              <button
                disabled={lines.length === 0 || placing}
                onClick={checkout}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  backgroundColor: lines.length === 0 ? '#444' : '#da1f26',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: lines.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: lines.length > 0 ? '0 0 10px rgba(218, 31, 38, 0.5)' : 'none',
                }}
              >
                {placing ? 'Redirecting to payment…' : 'Checkout'}
              </button>
              {error && <div style={{ color: '#ff4d4d', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</div>}
              <div style={{ textAlign: 'center', marginTop: '0.8rem', fontSize: '0.75rem', color: '#777' }}>
                Secure Checkout via HitPay · DuitNow QR, FPX, Cards
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
