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
    id: 'clay-300',
    name: 'Monte Carlo Clay 300',
    description:
      '300-piece 14g clay composite set, 11.5g weighted, dual-tone denomination stripes. Includes aluminium case and 2 decks.',
    price: 389,
    pieces: '300pc set',
    stripeColor: '#C9A227',
    badge: 'CASH GAME',
  },
  {
    id: 'ceramic-500',
    name: 'Bellagio Ceramic 500',
    description:
      'Full-color ceramic chips, casino-grade texture, custom denomination printing available on request.',
    price: 649,
    pieces: '500pc set',
    stripeColor: '#B33A3A',
    badge: 'TOURNAMENT',
  },
  {
    id: 'travel-200',
    name: 'Rounders Travel 200',
    description:
      '11.5g composite chips in a compact travel case. Built for home games and weekend trips.',
    price: 219,
    pieces: '200pc set',
    stripeColor: '#4E7C63',
    badge: 'HOME GAME',
  },
  {
    id: 'highroller-1000',
    name: 'High Roller Vault 1000',
    description:
      'The full spread. 1000 pieces, 14g clay, deluxe walnut case with brass fittings. For serious rooms.',
    price: 1290,
    pieces: '1000pc set',
    stripeColor: '#C9A227',
    badge: 'LIMITED',
  },
  {
    id: 'deck-pair',
    name: 'Marked-Free Deck Pair',
    description:
      'Cambric-finish plastic playing cards, tournament-grade, 2 decks with cut card.',
    price: 45,
    pieces: '2 decks',
    stripeColor: '#4E7C63',
    badge: 'ACCESSORY',
  },
  {
    id: 'dealer-button',
    name: 'Solid Brass Dealer Button',
    description:
      'Heavyweight brass dealer button, engraved. The kind that stays on the table.',
    price: 35,
    pieces: '1 piece',
    stripeColor: '#B33A3A',
    badge: 'ACCESSORY',
  },
];

export function findProduct(id: string) {
  return products.find((p) => p.id === id);
}
