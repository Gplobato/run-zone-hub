import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductImage } from "@/components/paze/ProductImage";
import { formatBRL, getProduct } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { CircleAlert, Loader2, Lock, ShieldCheck, ExternalLink } from "lucide-react";
import { createZedyCheckout } from "@/lib/zedy.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Paze" },
      { name: "description", content: "Finalize sua compra com segurança." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Checkout,
});

// Variant ID configurado na Zedy. Toda linha do carrinho usa este ID.
const DEFAULT_VARIANT_ID = 33937;

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}
function pixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

function Checkout() {
  const { items, subtotalCents } = useCart();
  const navigate = useNavigate();
  const createCheckout = useServerFn(createZedyCheckout);

  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingCents = subtotalCents >= 9990 ? 0 : 1990;
  const totalCents = subtotalCents + shippingCents;

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    pixel("InitiateCheckout", { value: totalCents / 100, currency: "BRL", num_items: items.length });

    createCheckout({
      data: {
        items: items.map((i) => ({
          variantId: DEFAULT_VARIANT_ID,
          quantity: i.quantity,
        })),
      },
    })
      .then((r) => {
        if (!cancelled) setUrl(r.url);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Falha ao iniciar o checkout.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Empty cart
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
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">/ Checkout</div>
        <h1 className="font-display text-4xl tracking-wide md:text-5xl">Finalize sua compra</h1>
        <p className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-[color:var(--sage)]" />
          Pagamento 100% seguro · criptografia SSL
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT — Checkout frame */}
          <div className="min-h-[720px] overflow-hidden rounded-md border border-[color:var(--graphite)]/10 bg-white">
            {loading && (
              <div className="flex h-[720px] flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[color:var(--sage)]" />
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Preparando pagamento seguro…
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="flex h-[720px] flex-col items-center justify-center gap-4 px-6 text-center">
                <CircleAlert className="h-10 w-10 text-[color:var(--terracotta)]" />
                <div>
                  <div className="font-display text-2xl tracking-wide">Não foi possível iniciar o pagamento</div>
                  <div className="mt-2 font-mono text-xs text-muted-foreground">{error}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate({ to: "/produtos" })}
                    className="rounded-sm border border-[color:var(--graphite)]/20 px-5 py-2.5 font-mono text-xs uppercase tracking-widest"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-sm bg-[color:var(--terracotta)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && url && (
              <>
                <iframe
                  src={url}
                  title="Checkout seguro"
                  className="h-[820px] w-full border-0"
                  allow="payment *; clipboard-write; camera; geolocation"
                />
                {/* Fallback caso o gateway bloqueie iframe */}
                <div className="border-t border-[color:var(--graphite)]/10 px-4 py-3 text-center">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-[color:var(--terracotta)]"
                  >
                    Problemas para carregar? Abrir em nova janela
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </>
            )}
          </div>

          {/* RIGHT — Order summary */}
          <aside className="h-fit rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--bone)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-wide">Seu pedido</h2>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </span>
            </div>

            <ul className="divide-y divide-[color:var(--graphite)]/10">
              {items.map((it) => {
                const p = getProduct(it.slug);
                if (!p) return null;
                return (
                  <li key={it.slug + (it.variant ?? "")} className="flex gap-3 py-3">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-white">
                      <ProductImage product={p} className="h-full w-full" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="font-display text-sm tracking-wide">
                        {p.shortName.toUpperCase()}
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                        <span>Qtd {it.quantity}{it.variant ? ` · ${it.variant}` : ""}</span>
                        <span className="text-[color:var(--terracotta)]">
                          {formatBRL(p.priceCents * it.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 space-y-1 border-t border-[color:var(--graphite)]/10 pt-4 font-mono text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatBRL(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span>{shippingCents === 0 ? "Grátis" : formatBRL(shippingCents)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-[color:var(--graphite)]/10 pt-2 text-base">
                <span className="font-sans">Total</span>
                <span className="text-[color:var(--terracotta)]">{formatBRL(totalCents)}</span>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-sm bg-[color:var(--sage)]/10 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--sage)]" />
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                Compra protegida. Seus dados são criptografados e nenhum dado de cartão trafega pelo Paze.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </StoreLayout>
  );
}
