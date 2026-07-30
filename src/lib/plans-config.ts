/**
 * Shared plans configuration used by both the website and the extension.
 * This is the single source of truth for pricing and feature tiers.
 */

export const FREE_CHAT_LIMIT_SITE = 50;

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  id: 'free' | 'pro' | 'team';
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  badge?: string;
  features: PlanFeature[];
  ctaLabel: string;
  ctaHref: string;
  highlighted: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Per iniziare',
    price: '€0',
    priceNote: 'per sempre',
    features: [
      { label: `Fino a ${FREE_CHAT_LIMIT_SITE} chat nelle cartelle`, included: true },
      { label: 'Cartelle e sottocartelle', included: true },
      { label: 'Bookmark illimitati', included: true },
      { label: 'Drag & Drop', included: true },
      { label: 'Ricerca globale', included: true },
      { label: 'Sincronizzazione cloud', included: false },
      { label: 'Libreria Prompt illimitata', included: false },
      { label: 'Profili Istruzioni', included: false },
      { label: 'Supporto prioritario', included: false },
    ],
    ctaLabel: 'Inizia gratis',
    ctaHref: 'https://chromewebstore.google.com',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Pagamento unico',
    price: '€9,99',
    priceNote: 'una tantum / vita',
    badge: 'Più popolare',
    features: [
      { label: 'Chat illimitate nelle cartelle', included: true },
      { label: 'Cartelle e sottocartelle illimitate', included: true },
      { label: 'Bookmark illimitati', included: true },
      { label: 'Drag & Drop', included: true },
      { label: 'Ricerca globale', included: true },
      { label: 'Sincronizzazione cloud multi-dispositivo', included: true },
      { label: 'Libreria Prompt illimitata', included: true },
      { label: 'Profili Istruzioni personalizzati', included: true },
      { label: 'Supporto prioritario', included: false },
    ],
    ctaLabel: 'Acquista Pro — €9,99',
    ctaHref: '/premium/success',
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    tagline: 'Per team e aziende',
    price: '€29,99',
    priceNote: 'per utente / anno',
    features: [
      { label: 'Chat illimitate nelle cartelle', included: true },
      { label: 'Cartelle e sottocartelle illimitate', included: true },
      { label: 'Bookmark illimitati', included: true },
      { label: 'Drag & Drop', included: true },
      { label: 'Ricerca globale', included: true },
      { label: 'Sincronizzazione cloud multi-dispositivo', included: true },
      { label: 'Libreria Prompt condivisa del team', included: true },
      { label: 'Profili Istruzioni condivisi', included: true },
      { label: 'Supporto prioritario dedicato', included: true },
    ],
    ctaLabel: 'Contatta il team',
    ctaHref: 'mailto:support@infolders.app',
    highlighted: false,
  },
];

export const PLATFORM_COLORS: Record<string, { color: string; accent: string }> = {
  ChatGPT:        { color: '#a855f7', accent: '#7c3aed' },
  'Google Gemini':{ color: '#60a5fa', accent: '#3b82f6' },
  Claude:         { color: '#fb923c', accent: '#ea580c' },
  Perplexity:     { color: '#06b6d4', accent: '#0891b2' },
};
