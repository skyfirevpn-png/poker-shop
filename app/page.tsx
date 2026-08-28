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
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty })),
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
          <div className="eyebrow">Casino-grade chip sets · MY · SG · BN · ID</div>
          <h1>Chips that feel like the real table.</h1>
          <p>
            Clay and ceramic poker sets built for players who notice the weight in their hand and
            the snap of a good shuffle. Ordered today, on your table this week.
          </p>
          <a className="hero-cta" href="#shop">
            Shop chip sets ↓
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
        <h2>The catalog</h2>
        <span>{products.length} items</span>
      </div>

      <div className="grid wrap">
        {products.map((p) => (
          <article className="card" key={p.id}>
            <div
              className="chip-badge"
              style={{
                background: `conic-gradient(${p.stripeColor} 0 25%, var(--cream) 0 50%, ${p.stripeColor} 0 75%, var(--cream) 0 100%)`,
              }}
            >
              <b>{p.pieces.split('pc')[0].split(' ')[0]}</b>
              <span>{p.pieces.includes('pc') ? 'PCS' : ''}</span>
            </div>
            <div className="card-tag">{p.badge}</div>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div className="card-foot">
              <div className="price">RM {p.price.toFixed(2)}</div>
              <button className="add-btn" onClick={() => addToCart(p.id)}>
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>

      <footer className="foot wrap">
        <span>© {new Date().getFullYear()} The Vault</span>
        <span>Shipping to Malaysia, Singapore, Brunei & Indonesia</span>
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
              <div className="cart-empty">Nothing in here yet. Add a set to get started.</div>
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
