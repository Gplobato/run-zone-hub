import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "@/lib/products";

// ─── Analytics hooks (placeholders) ──────────────────────────────────────
// TODO: Meta Pixel — fbq('track','AddToCart', {content_ids:[slug], value, currency:'BRL'})
// TODO: GA4 — gtag('event','add_to_cart', { items:[{item_id:slug, price, quantity}] })
// TODO: TikTok Pixel — ttq.track('AddToCart', { content_id:slug, value, currency:'BRL' })
// ─────────────────────────────────────────────────────────────────────────

export type CartItem = {
  slug: string;
  quantity: number;
  variant?: string;
};

type CartCtx = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (slug: string, quantity?: number, variant?: string) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  getProductFor: (slug: string) => Product | undefined;
};

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<CartCtx>(() => {
    const subtotalCents = items.reduce((acc, it) => {
      const p = getProduct(it.slug);
      return acc + (p?.priceCents ?? 0) * it.quantity;
    }, 0);
    const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);

    return {
      items,
      itemCount,
      subtotalCents,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (slug, quantity = 1, variant) => {
        setItems((prev) => {
          const existing = prev.find((i) => i.slug === slug && i.variant === variant);
          if (existing) {
            return prev.map((i) =>
              i === existing ? { ...i, quantity: i.quantity + quantity } : i
            );
          }
          return [...prev, { slug, quantity, variant }];
        });
        setIsOpen(true);
      },
      removeItem: (slug) => setItems((prev) => prev.filter((i) => i.slug !== slug)),
      setQuantity: (slug, quantity) =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.slug !== slug)
            : prev.map((i) => (i.slug === slug ? { ...i, quantity } : i))
        ),
      clear: () => setItems([]),
      getProductFor: (slug) => getProduct(slug),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
