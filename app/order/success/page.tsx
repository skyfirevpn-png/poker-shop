export default async function OrderSuccess({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="status-page">
      <div className="status-card">
        <h1>Order received</h1>
        <p>
          Thanks — your payment is confirmed and we&apos;ve got your order queued up.
          {ref && (
            <>
              {' '}
              Reference <code>{ref}</code>.
            </>
          )}
          {' '}We&apos;ll be in touch shortly to arrange shipping.
        </p>
        <a className="hero-cta" href="/">
          Back to the shop
        </a>
      </div>
    </div>
  );
}
