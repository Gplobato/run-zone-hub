import { useNavigate } from "@tanstack/react-router";
import { useCart } from "@/context/CartContext";
import { formatBRL, getProduct, PRODUCTS } from "@/lib/products";
import { ProductImage } from "./ProductImage";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useState } from "react";

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotalCents, setQuantity, removeItem, addItem } = useCart();
  const [coupon, setCoupon] = useState("");
  const [cep, setCep] = useState("");
  const navigate = useNavigate();

  // Cross-sell logic:
  // - If cart has no bundle → suggest the Kit
  // - Else if cart only has the fone → suggest impulso (fita)
  // - Else → suggest fita anti-atrito
  const hasKit = items.some((i) => i.slug === "kit-seguranca-urbana");
  const suggestion = !hasKit
    ? getProduct("kit-seguranca-urbana")!
    : getProduct("fita-anti-atrito")!;
  const suggestionInCart = items.some((i) => i.slug === suggestion.slug);
  const displaySuggestion = !suggestionInCart ? suggestion : PRODUCTS.find((p) => !items.some((i) => i.slug === p.slug));

  const shipping = cep.length >= 8 ? 1990 : 0;

  return (
    <>
      {/* backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-[color:var(--graphite)]/60 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* drawer */}
      <aside
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[color:var(--bone)] shadow-2xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--graphite)]/10 px-6 py-4">
          <h2 className="font-display text-2xl tracking-widest">SEU CARRINHO</h2>
          <button
            aria-label="Fechar"
            onClick={closeCart}
            className="rounded-sm p-2 hover:bg-[color:var(--graphite)]/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <ShoppingBag className="h-10 w-10 text-[color:var(--sage)]" />
              <p className="font-mono text-sm text-muted-foreground">
                Seu carrinho está vazio
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[color:var(--graphite)]/10">
              {items.map((it) => {
                const p = getProduct(it.slug);
                if (!p) return null;
                return (
                  <li key={it.slug + it.variant} className="flex gap-4 px-6 py-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm">
                      <ProductImage product={p} className="h-full w-full" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="font-display text-lg leading-tight tracking-wide">
                          {p.shortName.toUpperCase()}
                        </div>
                        {it.variant && (
                          <div className="font-mono text-[11px] uppercase text-muted-foreground">
                            {it.variant}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center rounded-sm border border-[color:var(--graphite)]/20">
                          <button
                            aria-label="Diminuir"
                            className="p-1.5 hover:bg-[color:var(--graphite)]/5"
                            onClick={() => setQuantity(it.slug, it.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-mono text-sm">
                            {it.quantity}
                          </span>
                          <button
                            aria-label="Aumentar"
                            className="p-1.5 hover:bg-[color:var(--graphite)]/5"
                            onClick={() => setQuantity(it.slug, it.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="font-mono text-sm text-[color:var(--terracotta)]">
                          {formatBRL(p.priceCents * it.quantity)}
                        </div>
                      </div>
                    </div>
                    <button
                      aria-label="Remover"
                      className="self-start text-muted-foreground hover:text-[color:var(--terracotta)]"
                      onClick={() => removeItem(it.slug)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 && displaySuggestion && (
            <div className="border-t border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/5 px-6 py-4">
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Complete sua compra
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm">
                  <ProductImage product={displaySuggestion} className="h-full w-full" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-base tracking-wide">
                    {displaySuggestion.shortName.toUpperCase()}
                  </div>
                  <div className="font-mono text-xs text-[color:var(--terracotta)]">
                    {formatBRL(displaySuggestion.priceCents)}
                  </div>
                </div>
                <button
                  onClick={() => addItem(displaySuggestion.slug, 1)}
                  className="rounded-sm border border-[color:var(--graphite)] px-3 py-2 font-mono text-[11px] uppercase tracking-wider hover:bg-[color:var(--graphite)] hover:text-[color:var(--bone)]"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[color:var(--graphite)]/10 bg-[color:var(--bone)] px-6 py-5">
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Cupom"
                className="flex-1 rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-2 font-mono text-xs uppercase outline-none focus:border-[color:var(--sage)]"
              />
              <input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="CEP"
                className="w-24 rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-2 font-mono text-xs outline-none focus:border-[color:var(--sage)]"
              />
            </div>
            <div className="mt-4 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatBRL(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span>{shipping === 0 ? "—" : formatBRL(shipping)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-[color:var(--graphite)]/10 pt-2 text-base">
                <span className="font-sans">Total</span>
                <span className="text-[color:var(--terracotta)]">
                  {formatBRL(subtotalCents + shipping)}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                closeCart();
                // TODO: fbq('track','InitiateCheckout'); gtag('event','begin_checkout'); ttq.track('InitiateCheckout')
                navigate({ to: "/checkout" });
              }}
              className="mt-5 w-full rounded-sm bg-[color:var(--terracotta)] py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)] transition-opacity hover:opacity-90"
            >
              Finalizar compra
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
