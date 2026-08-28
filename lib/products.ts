export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in MYR
  pieces: string; // e.g. "300pc set"
  stripeColor: string; // accent color used on the chip-card edge
  badge: string; // short label e.g. "CASH GAME"
  image?: string;
};

export const products: Product[] = [
  {
    id: 'zynga-100b',
    name: 'Zynga Chip 100B',
    description: 'Instant transfer to your Zynga Poker account, 24/7 support available.',
    price: 10,
    pieces: '100B',
    stripeColor: '#4E7C63',
    badge: 'STARTER',
  },
  {
    id: 'zynga-500b',
    name: 'Zynga Chip 500B',
    description: 'Instant transfer to your Zynga Poker account, 24/7 support available.',
    price: 15,
    pieces: '500B',
    stripeColor: '#4E7C63',
    badge: 'POPULAR',
  },
  {
    id: 'zynga-1t',
    name: 'Zynga Chip 1T',
    description: '1 Trillion chips fast transfer. Top choice for active players.',
    price: 20,
    pieces: '1T',
    stripeColor: '#B33A3A',
    badge: '🔥 HOT',
  },
  {
    id: 'zynga-2t',
    name: 'Zynga Chip 2T',
    description: '2 Trillion chips fast transfer, 24/7 support available.',
    price: 30,
    pieces: '2T',
    stripeColor: '#C9A227',
    badge: 'STANDARD',
  },
  {
    id: 'zynga-3t',
    name: 'Zynga Chip 3T',
    description: '3 Trillion chips fast transfer, 24/7 support available.',
    price: 40,
    pieces: '3T',
    stripeColor: '#C9A227',
    badge: 'STANDARD',
  },
  {
    id: 'zynga-4t',
    name: 'Zynga Chip 4T',
    description: '4 Trillion chips fast transfer, 24/7 support available.',
    price: 45,
    pieces: '4T',
    stripeColor: '#C9A227',
    badge: 'STANDARD',
  },
  {
    id: 'zynga-5t',
    name: 'Zynga Chip 5T',
    description: '5 Trillion package deal. Maximum value per Ringgit spent.',
    price: 50,
    pieces: '5T',
    stripeColor: '#B33A3A',
    badge: 'LAGI JIMAT',
  },
  {
    id: 'zynga-6t',
    name: 'Zynga Chip 6T',
    description: '6 Trillion chips fast transfer, 24/7 support available.',
    price: 55,
    pieces: '6T',
    stripeColor: '#4E7C63',
    badge: 'VALUE',
  },
  {
    id: 'zynga-7t',
    name: 'Zynga Chip 7T',
    description: '7 Trillion chips fast transfer, 24/7 support available.',
    price: 60,
    pieces: '7T',
    stripeColor: '#4E7C63',
    badge: 'VALUE',
  },
  {
    id: 'zynga-8t',
    name: 'Zynga Chip 8T',
    description: '8 Trillion chips fast transfer, 24/7 support available.',
    price: 65,
    pieces: '8T',
    stripeColor: '#4E7C63',
    badge: 'VALUE',
  },
  {
    id: 'zynga-9t',
    name: 'Zynga Chip 9T',
    description: '9 Trillion chips fast transfer, 24/7 support available.',
    price: 70,
    pieces: '9T',
    stripeColor: '#4E7C63',
    badge: 'VALUE',
  },
  {
    id: 'zynga-10t',
    name: 'Zynga Chip 10T',
    description: '10 Trillion milestone stack. Fast transfer guaranteed.',
    price: 75,
    pieces: '10T',
    stripeColor: '#C9A227',
    badge: 'HIGH STAKES',
  },
  {
    id: 'zynga-20t',
    name: 'Zynga Chip 20T',
    description: '20 Trillion bulk deal. Dedicated agent transfer.',
    price: 145,
    pieces: '20T',
    stripeColor: '#C9A227',
    badge: 'BULK',
  },
  {
    id: 'zynga-30t',
    name: 'Zynga Chip 30T',
    description: '30 Trillion bulk deal. Dedicated agent transfer.',
    price: 210,
    pieces: '30T',
    stripeColor: '#C9A227',
    badge: 'BULK',
  },
  {
    id: 'zynga-40t',
    name: 'Zynga Chip 40T',
    description: '40 Trillion bulk deal. Dedicated agent transfer.',
    price: 280,
    pieces: '40T',
    stripeColor: '#C9A227',
    badge: 'BULK',
  },
  {
    id: 'zynga-50t',
    name: 'Zynga Chip 50T',
    description: '50 Trillion mega stack deal. Dedicated agent transfer.',
    price: 340,
    pieces: '50T',
    stripeColor: '#B33A3A',
    badge: 'MEGA',
  },
  {
    id: 'zynga-100t',
    name: 'Zynga Chip 100T',
    description: '100 Trillion VIP stack package with priority delivery.',
    price: 660,
    pieces: '100T',
    stripeColor: '#B33A3A',
    badge: 'VIP PACK',
  },
  {
    id: 'zynga-200t',
    name: 'Zynga Chip 200T',
    description: '200 Trillion ultimate whale package. Maximum transfer volume.',
    price: 1300,
    pieces: '200T',
    stripeColor: '#B33A3A',
    badge: 'ULTIMATE',
  },
];

export function findProduct(id: string) {
  return products.find((p) => p.id === id);
}
