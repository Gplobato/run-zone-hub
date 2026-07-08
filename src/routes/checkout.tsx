import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductImage } from "@/components/paze/ProductImage";
import { formatBRL, getProduct } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { CircleAlert, Loader2, Lock, ShieldCheck, Truck } from "lucide-react";
import { createZedyCheckout } from "@/lib/zedy.functions";
import { fbqTrack } from "@/lib/pixel";

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

function Checkout() {
  const { items, subtotalCents } = useCart();
  const createCheckout = useServerFn(createZedyCheckout);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Promoção: frete grátis.
  const shippingCents = 0;
  const totalCents = subtotalCents + shippingCents;

  async function goToPayment() {
    if (items.length === 0 || loading) return;
    setLoading(true);
    setError(null);
    fbqTrack("InitiateCheckout", {
      value: totalCents / 100,
      currency: "BRL",
      num_items: items.length,
      content_ids: items.map((i) => i.slug),
    });
    try {
      const { url } = await createCheckout({
        data: {
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
        },
      });
      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Falha ao abrir o checkout. Tente novamente.",
      );
      setLoading(false);
    }
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
          <h1 className="font-display text-4xl tracking-wide">
            Seu carrinho está vazio
          </h1>
          <p className="mt-4 text-muted-foreground">
            Adicione produtos para finalizar sua compra.
          </p>
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
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
          / Checkout
        </div>
        <h1 className="font-display text-4xl tracking-wide md:text-5xl">
          Finalize sua compra
        </h1>
        <p className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-[color:var(--sage)]" />
          Pagamento 100% seguro · Pix, cartão ou boleto
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT — resumo dos itens */}
          <div className="rounded-md border border-[color:var(--graphite)]/10 bg-white p-6">
            <h2 className="font-display text-2xl tracking-wide">
              Seu pedido
            </h2>
            <ul className="mt-4 divide-y divide-[color:var(--graphite)]/10">
              {items.map((it) => {
                const p = getProduct(it.slug);
                if (!p) return null;
                return (
                  <li
                    key={it.slug + (it.variant ?? "")}
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[color:var(--bone)]">
                      <ProductImage product={p} fit="contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-base tracking-wide">
                        {p.shortName.toUpperCase()}
                      </div>
                      <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        Qtd. {it.quantity}
                      </div>
                    </div>
                    <div className="font-mono text-sm text-[color:var(--terracotta)]">
                      {formatBRL(p.priceCents * it.quantity)}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex items-center gap-3 rounded-sm border border-[color:var(--sage)]/30 bg-[color:var(--sage)]/[0.06] px-4 py-3">
              <Truck className="h-5 w-5 text-[color:var(--sage)]" />
              <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--graphite)]">
                Frete grátis · entrega em 1 dia útil
              </div>
            </div>
          </div>

          {/* RIGHT — totais + CTA */}
          <div className="rounded-md border border-[color:var(--graphite)]/10 bg-white p-6">
            <h2 className="font-display text-2xl tracking-wide">Total</h2>
            <dl className="mt-4 space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatBRL(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Frete</dt>
                <dd className="text-[color:var(--sage)]">Grátis</dd>
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-[color:var(--graphite)]/10 pt-3">
                <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Total
                </dt>
                <dd className="font-display text-3xl text-[color:var(--terracotta)]">
                  {formatBRL(totalCents)}
                </dd>
              </div>
            </dl>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-sm bg-[color:var(--terracotta)]/10 px-3 py-2 font-mono text-xs text-[color:var(--terracotta)]">
                <CircleAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={goToPayment}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--terracotta)] px-6 py-4 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)] transition-opacity disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Abrindo pagamento…
                </>
              ) : (
                <>Ir para pagamento</>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--sage)]" />
              Ambiente seguro · dados criptografados
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
