import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductImage } from "@/components/paze/ProductImage";
import { formatBRL, getProduct, PRODUCTS } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { CircleAlert, ShieldCheck, ArrowRight } from "lucide-react";
import { createZedyCheckout, ZEDY_VARIANT_IDS } from "@/lib/zedy.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Paze" },
      { name: "description", content: "Revise seu pedido e finalize com segurança." },
    ],
  }),
  component: Checkout,
});

// Meta Pixel helper — safe no-op sem VITE_META_PIXEL_ID.
declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}
function pixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

function Checkout() {
  const { items, subtotalCents, addItem } = useCart();
  const createCheckout = useServerFn(createZedyCheckout);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingCents = subtotalCents >= 9990 ? 0 : 1990;
  const total = subtotalCents + shippingCents;

  const unmappedItems = items.filter((i) => !ZEDY_VARIANT_IDS[i.slug]);
  const canCheckout = items.length > 0 && unmappedItems.length === 0;

  const hasKit = items.some((i) => i.slug === "kit-seguranca-urbana");
  const upsell = !hasKit
    ? getProduct("kit-seguranca-urbana")
    : PRODUCTS.find((p) => !items.some((i) => i.slug === p.slug));

  async function goToZedy() {
    setError(null);
    setBusy(true);
    try {
      pixel("InitiateCheckout", { value: total / 100, currency: "BRL", num_items: items.length });
      const { checkoutUrl } = await createCheckout({
        data: { items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })) },
      });
      // Redireciona para o checkout hospedado da Zedy — pagamento roda lá.
      window.location.href = checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível iniciar o checkout.");
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
          <h1 className="font-display text-4xl tracking-wide">Seu carrinho está vazio</h1>
          <p className="mt-4 text-muted-foreground">Adicione produtos para finalizar sua compra.</p>
          <Link
            to="/produtos"
            className="mt-8 inline-block rounded-sm bg-[color:var(--terracotta)] px-6 py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]"
          >
            Ver produtos
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
          / Checkout
        </div>
        <h1 className="font-display text-4xl tracking-wide md:text-5xl">Revise seu pedido</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Pagamento processado com segurança pela Zedy
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl tracking-wide">Seu pedido</h2>
            <ul className="mt-4 divide-y divide-[color:var(--graphite)]/10 rounded-md border border-[color:var(--graphite)]/10">
              {items.map((it) => {
                const p = getProduct(it.slug)!;
                const missing = !ZEDY_VARIANT_IDS[it.slug];
                return (
                  <li key={it.slug + it.variant} className="flex gap-4 p-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm bg-[color:var(--bone)] p-1">
                      <ProductImage product={p} fit="contain" className="h-full w-full" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-lg tracking-wide">{p.shortName.toUpperCase()}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        Qtd. {it.quantity} {it.variant && `· ${it.variant}`}
                      </div>
                      {missing && (
                        <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[color:var(--terracotta)]">
                          Indisponível para compra online
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-sm text-[color:var(--terracotta)]">
                      {formatBRL(p.priceCents * it.quantity)}
                    </div>
                  </li>
                );
              })}
            </ul>

            {upsell && ZEDY_VARIANT_IDS[upsell.slug] && (
              <div className="mt-6 rounded-md border border-dashed border-[color:var(--sage)] bg-[color:var(--sage)]/10 p-5">
                <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
                  Última chance
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-sm bg-[color:var(--bone)] p-1">
                    <ProductImage product={upsell} fit="contain" className="h-full w-full" />
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-lg tracking-wide">Adicione {upsell.shortName}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      por +{formatBRL(upsell.priceCents)}
                    </div>
                  </div>
                  <button
                    onClick={() => addItem(upsell.slug, 1)}
                    className="rounded-sm border border-[color:var(--graphite)] px-3 py-2 font-mono text-[11px] uppercase tracking-wider hover:bg-[color:var(--graphite)] hover:text-[color:var(--bone)]"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] p-6">
            <h3 className="font-display text-xl tracking-wide">Resumo</h3>
            <dl className="mt-4 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt>
                <dd>{formatBRL(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Frete</dt>
                <dd>{shippingCents === 0 ? "Grátis" : "Calculado na Zedy"}</dd>
              </div>
              <div className="flex justify-between border-t border-[color:var(--graphite)]/10 pt-2 text-base">
                <dt className="font-sans">Total estimado</dt>
                <dd className="text-[color:var(--terracotta)]">{formatBRL(total)}</dd>
              </div>
            </dl>

            {!canCheckout && unmappedItems.length > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-sm bg-[color:var(--terracotta)]/10 p-3 font-mono text-[11px] text-[color:var(--terracotta)]">
                <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Remova os itens marcados como indisponíveis para prosseguir.
                </span>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-sm bg-[color:var(--terracotta)]/10 p-3 font-mono text-[11px] text-[color:var(--terracotta)]">
                <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={goToZedy}
              disabled={!canCheckout || busy}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--terracotta)] py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Redirecionando…" : (
                <>
                  Finalizar na Zedy <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <Link
              to="/produtos"
              className="mt-2 block w-full rounded-sm border border-[color:var(--graphite)]/20 py-3 text-center font-mono text-xs uppercase tracking-widest"
            >
              Continuar comprando
            </Link>

            <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--sage)]" />
              Pagamento seguro · Pix, cartão e boleto
            </div>
          </aside>
        </div>
      </div>
    </StoreLayout>
  );
}
