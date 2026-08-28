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
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="logo">
            <span className="logo-mark" />
            The Vault
          </div>
          <button className="cart-toggle" onClick={() => setDrawerOpen(true)}>
            Cart
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </button>
        </div>
      </header>

      <section className="hero wrap">
        <div>
          <div className="eyebrow">Zynga Poker Chips Transfer · 24/7 Fast Processing</div>
          <h1>Zynga Chips Direct Transfer</h1>
          <p>
            Safe and instant transfer directly to your Zynga Poker account. Select your desired package below to checkout.
          </p>
          <a className="hero-cta" href="#shop">
            View Price List ↓
          </a>
          <div className="hero-note">FPX · DuitNow · Cards accepted at checkout</div>
        </div>
        <div className="chip-stack" aria-hidden="true">
          <div className="chip chip-1" />
          <div className="chip chip-2" />
          <div className="chip chip-3" />
          <div className="chip chip-4" />
        </div>
      </section>

      <div id="shop" className="section-head wrap">
        <h2>Chip Packages</h2>
        <span>{products.length} options</span>
      </div>

      <div className="wrap flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {products.map((p) => (
          <article 
            className="card" 
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              gridTemplateColumns: 'none',
              border: p.badge?.includes('JIMAT') || p.badge?.includes('HOT') ? '1px solid #C9A227' : undefined,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                className="chip-badge"
                style={{
                  position: 'static',
                  width: '42px',
                  height: '42px',
                  minWidth: '42px',
                  fontSize: '0.75rem',
                  background: `conic-gradient(${p.stripeColor} 0 25%, var(--cream) 0 50%, ${p.stripeColor} 0 75%, var(--cream) 0 100%)`,
                }}
              >
                <b>{p.pieces}</b>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{p.name}</h3>
                  {p.badge && (
                    <span 
                      className="card-tag"
                      style={{ 
                        position: 'static', 
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.4rem',
                        backgroundColor: p.badge.includes('JIMAT') ? '#B33A3A' : '#C9A227',
                        color: '#fff'
                      }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>{p.description}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
              <div className="price" style={{ fontSize: '1.2rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                RM {p.price.toFixed(2)}
              </div>
              <button className="add-btn" onClick={() => addToCart(p.id)} style={{ whiteSpace: 'nowrap' }}>
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>

      <footer className="foot wrap" style={{ marginTop: '3rem' }}>
        <span>© {new Date().getFullYear()} The Vault</span>
        <span>Instant Zynga Poker Chip Delivery</span>
      </footer>

      {drawerOpen && (
        <>
          <div className="overlay" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close cart">
              ✕
            </button>
            <h2>Your cart</h2>

            {lines.length === 0 ? (
              <div className="cart-empty">Nothing in here yet. Add a chip package to get started.</div>
            ) : (
              <div>
                {lines.map((l) => (
                  <div className="line-item" key={l.product.id}>
                    <div>
                      <div className="line-item-name">{l.product.name}</div>
                      <div className="line-item-meta">RM {l.product.price.toFixed(2)} each</div>
                    </div>
                    <div className="qty-controls">
                      <button onClick={() => setQty(l.product.id, l.qty - 1)}>−</button>
                      {l.qty}
                      <button onClick={() => setQty(l.product.id, l.qty + 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span>RM {total.toFixed(2)}</span>
              </div>
              <button
                className="checkout-btn"
                disabled={lines.length === 0 || placing}
                onClick={checkout}
              >
                {placing ? 'Redirecting to payment…' : 'Checkout with FPX'}
              </button>
              {error && <div className="checkout-note" style={{ color: 'var(--red)' }}>{error}</div>}
              <div className="checkout-note">Secure payment via HitPay · FPX, DuitNow, cards</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
