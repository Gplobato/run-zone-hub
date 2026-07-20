import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductCard } from "@/components/paze/ProductCard";
import { ProductImage } from "@/components/paze/ProductImage";
import { SignatureTrail } from "@/components/paze/SignatureTrail";
import { formatBRL, getProduct, PRODUCTS } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { fbqTrack } from "@/lib/pixel";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Minus, Plus, ShieldCheck, Truck, RotateCcw, Check, Play } from "lucide-react";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => {
    if (params.slug === "nb-9060") throw redirect({ to: "/nb-9060" });
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name ?? "Produto"} — Paze` },
      { name: "description", content: loaderData?.product.description ?? "" },
      { property: "og:title", content: loaderData?.product.name ?? "Paze" },
      { property: "og:description", content: loaderData?.product.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <StoreLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center md:px-8">
        <h1 className="font-display text-5xl">Produto não encontrado</h1>
        <Link to="/produtos" className="mt-6 inline-block font-mono text-xs uppercase text-[color:var(--terracotta)]">
          Ver catálogo
        </Link>
      </div>
    </StoreLayout>
  ),
  errorComponent: ({ reset }) => (
    <StoreLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center md:px-8">
        <h1 className="font-display text-3xl">Algo deu errado</h1>
        <button onClick={reset} className="mt-4 font-mono text-xs uppercase text-[color:var(--terracotta)]">Tentar de novo</button>
      </div>
    </StoreLayout>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: import("@/lib/products").Product };
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const firstVariant = product.variants?.[0];
  const firstAvailable =
    firstVariant?.options.find((o) => !firstVariant.soldOut?.includes(o)) ??
    firstVariant?.options[0];
  const [variant, setVariant] = useState<string | undefined>(firstAvailable);

  const isFone = product.slug === "fone-conducao-ossea";
  const crossSell = product.crossSell
    .map((s) => PRODUCTS.find((p) => p.slug === s)!)
    .filter(Boolean);

  useEffect(() => {
    fbqTrack("ViewContent", {
      content_ids: [product.slug],
      content_name: product.name,
      content_type: "product",
      content_category: product.categoryLabel,
      value: product.priceCents / 100,
      currency: "BRL",
    });
  }, [product.slug, product.name, product.categoryLabel, product.priceCents]);

  const onAdd = () => {
    addItem(product.slug, qty, variant);
  };

  return (
    <StoreLayout>
      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-8">
        {isFone && <SignatureTrail />}
        {/* breadcrumbs */}
        <nav className="mb-6 flex gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/categoria/$slug" params={{ slug: product.category }}>
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-[color:var(--graphite)]">{product.shortName}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Galeria */}
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-md border border-[color:var(--graphite)]/10">
              <ProductImage product={product} variant={variant} className="h-full w-full" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-sm border border-[color:var(--graphite)]/10 opacity-70"
                >
                  <ProductImage product={product} variant={variant} className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {product.badge && (
              <span className="mb-4 inline-block rounded-sm bg-[color:var(--terracotta)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[color:var(--bone)]">
                {product.badge}
              </span>
            )}
            <div className="font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
              {product.categoryLabel}
            </div>
            <h1 className="mt-2 font-display text-4xl leading-none tracking-wide md:text-6xl">
              {product.name.toUpperCase()}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{product.tagline}</p>

            <div className="mt-6 flex items-baseline gap-3">
              {product.compareAtCents && (
                <span className="font-mono text-lg text-muted-foreground line-through">
                  {formatBRL(product.compareAtCents)}
                </span>
              )}
              <span className="font-mono text-4xl font-medium text-[color:var(--terracotta)]">
                {formatBRL(product.priceCents)}
              </span>
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              ou {product.installments.count}× de {formatBRL(product.installments.valueCents)} sem juros
            </div>

            <p className="mt-6 text-sm leading-relaxed">{product.longDescription}</p>

            <ul className="mt-6 space-y-2">
              {product.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-sm">
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[color:var(--terracotta)]" />
                  {b}
                </li>
              ))}
            </ul>

            {product.variants?.map((v) => (
              <div key={v.key} className="mt-6">
                <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {v.label}: <span className="text-[color:var(--graphite)]">{variant}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {v.options.map((opt) => {
                    const soldOut = v.soldOut?.includes(opt);
                    const selected = variant === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => !soldOut && setVariant(opt)}
                        disabled={soldOut}
                        aria-disabled={soldOut}
                        title={soldOut ? "Esgotado" : opt}
                        className={`relative rounded-sm px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                          selected && !soldOut
                            ? "bg-[color:var(--graphite)] text-[color:var(--bone)]"
                            : "border border-[color:var(--graphite)]/20"
                        } ${
                          soldOut
                            ? "cursor-not-allowed text-muted-foreground line-through opacity-60"
                            : ""
                        }`}
                      >
                        {opt}
                        {soldOut && (
                          <span className="ml-2 rounded-sm bg-[color:var(--graphite)]/10 px-1.5 py-0.5 text-[9px] tracking-widest">
                            Esgotado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-8 flex items-center gap-3">
              <div className="inline-flex items-center rounded-sm border border-[color:var(--graphite)]/20">
                <button
                  aria-label="Diminuir"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-[color:var(--graphite)]/5"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-mono text-sm">{qty}</span>
                <button
                  aria-label="Aumentar"
                  onClick={() => setQty((q) => q + 1)}
                  className="p-3 hover:bg-[color:var(--graphite)]/5"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={onAdd}
                className="flex-1 rounded-sm bg-[color:var(--terracotta)] py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)] hover:opacity-90"
              >
                Adicionar ao carrinho
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[color:var(--graphite)]/10 pt-6 text-xs">
              <div className="flex flex-col items-start gap-1">
                <Truck className="h-4 w-4 text-[color:var(--sage)]" strokeWidth={1.2} />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Frete grátis SP/RJ</span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <RotateCcw className="h-4 w-4 text-[color:var(--sage)]" strokeWidth={1.2} />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Troca em 30 dias</span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <ShieldCheck className="h-4 w-4 text-[color:var(--sage)]" strokeWidth={1.2} />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Garantia 12 meses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ficha técnica */}
        <section className="mt-24">
          <div className="mb-6 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
            / Ficha técnica
          </div>
          <h2 className="mb-8 font-display text-3xl tracking-wide md:text-4xl">
            Especificações
          </h2>
          <div className="grid gap-x-8 gap-y-3 rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] p-6 md:grid-cols-2">
            {product.specs.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-[color:var(--graphite)]/10 py-2 last:border-0">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </span>
                <span className="font-mono text-sm text-[color:var(--graphite)]">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {product.slug.startsWith("garmin") && <PartnersVideo />}

        {/* Frequentemente comprado junto — bundle upsell (padrão Amazon) */}
        {crossSell.length >= 2 && (
          <FrequentlyBoughtTogether main={product} extras={crossSell.slice(0, 2)} />
        )}

        {/* Cross-sell */}
        {crossSell.length > 0 && (
          <section className="mt-24">
            <div className="mb-6 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
              / Combina com
            </div>
            <h2 className="mb-8 font-display text-3xl tracking-wide md:text-4xl">
              Complete seu equipamento
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {crossSell.slice(0, 3).map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews (placeholder) */}
        <section className="mt-24">
          <div className="mb-6 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
            / Avaliações
          </div>
          <h2 className="mb-8 font-display text-3xl tracking-wide md:text-4xl">
            O que dizem quem usa
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: "Marina R.", role: "Corredora · SP", text: "Uso todo dia no treino de rua. Consigo ouvir carros, meu grupo e a música. Mudou meu treino." },
              { name: "Diogo P.", role: "Ciclista · RJ", text: "Não escorrega no capacete e a bateria dura toda a pedalada de fim de semana." },
            ].map((r) => (
              <div key={r.name} className="rounded-md border border-[color:var(--graphite)]/10 p-6">
                <p className="text-sm">{r.text}</p>
                <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {r.name} · {r.role}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-24 max-w-3xl">
          <div className="mb-6 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
            / FAQ
          </div>
          <h2 className="mb-8 font-display text-3xl tracking-wide md:text-4xl">
            Perguntas frequentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {product.faq.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-sans text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

      </div>


      {/* Sticky mobile buy bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[color:var(--graphite)]/10 bg-[color:var(--bone)] p-3 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="font-mono text-sm text-[color:var(--terracotta)]">
              {formatBRL(product.priceCents)}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {product.installments.count}× {formatBRL(product.installments.valueCents)}
            </div>
          </div>
          <button
            onClick={onAdd}
            className="flex-1 rounded-sm bg-[color:var(--terracotta)] py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]"
          >
            Adicionar
          </button>
        </div>
      </div>
      <div className="h-20 md:hidden" />
    </StoreLayout>
  );
}

/**
 * Frequentemente comprado junto — bundle upsell no padrão de mercado (Amazon-style).
 * Não invasivo: aparece após a ficha técnica, com o produto principal já marcado
 * e os complementares desmarcados. Usuário escolhe o que adicionar.
 */
function FrequentlyBoughtTogether({
  main,
  extras,
}: {
  main: import("@/lib/products").Product;
  extras: import("@/lib/products").Product[];
}) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries([main, ...extras].map((p) => [p.slug, p.slug === main.slug]))
  );

  const chosen = [main, ...extras].filter((p) => selected[p.slug]);
  const totalCents = chosen.reduce((acc, p) => acc + p.priceCents, 0);
  const canAdd = chosen.length >= 2;

  const onAddBundle = () => {
    // TODO: fbq('track','AddToCart', {content_ids: chosen.map(p=>p.slug), value: totalCents/100, currency:'BRL'})
    // TODO: gtag('event','add_to_cart',{ items: chosen.map(p=>({item_id:p.slug, price:p.priceCents/100})) })
    chosen.forEach((p) => addItem(p.slug, 1));
  };

  return (
    <section className="mt-24">
      <div className="mb-6 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
        / Compre junto e economize no frete
      </div>
      <h2 className="mb-8 font-display text-3xl tracking-wide md:text-4xl">
        Frequentemente comprado junto
      </h2>

      <div className="grid gap-8 rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] p-6 md:grid-cols-[1.6fr_1fr] md:items-center">
        <div className="flex flex-wrap items-center gap-4">
          {[main, ...extras].map((p, i) => (
            <div key={p.slug} className="flex items-center gap-3">
              <label className="group relative block cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!selected[p.slug]}
                  onChange={(e) =>
                    setSelected((s) => ({ ...s, [p.slug]: e.target.checked }))
                  }
                  className="peer sr-only"
                />
                <div className="h-24 w-24 overflow-hidden rounded-sm border border-[color:var(--graphite)]/15 opacity-60 transition-all peer-checked:border-[color:var(--sage)] peer-checked:opacity-100 md:h-28 md:w-28">
                  <ProductImage product={p} className="h-full w-full" />
                </div>
                <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-sm border border-[color:var(--graphite)]/30 bg-[color:var(--bone)] peer-checked:border-[color:var(--sage)] peer-checked:bg-[color:var(--sage)] peer-checked:text-[color:var(--bone)]">
                  {selected[p.slug] && <Check className="h-3 w-3" />}
                </div>
                <div className="mt-2 max-w-[7rem] font-mono text-[10px] uppercase leading-tight tracking-widest text-[color:var(--graphite)]/70">
                  {p.shortName}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-[color:var(--terracotta)]">
                  {formatBRL(p.priceCents)}
                </div>
              </label>
              {i < extras.length && (
                <span className="hidden font-mono text-2xl text-[color:var(--graphite)]/30 md:inline">
                  +
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-[color:var(--graphite)]/10 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Total dos selecionados
          </div>
          <div className="mt-1 font-mono text-3xl text-[color:var(--terracotta)]">
            {formatBRL(totalCents)}
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            {chosen.length} {chosen.length === 1 ? "item" : "itens"} · frete grátis acima de R$ 99,90
          </div>
          <button
            disabled={!canAdd}
            onClick={onAddBundle}
            className="mt-4 w-full rounded-sm bg-[color:var(--graphite)] py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Adicionar selecionados
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Vídeo de parceiros — leve, lazy, sem autoplay. Aparece bem abaixo do
 * checkout pra não competir com a conversão. Expande no clique.
 */
function PartnersVideo() {
  const [open, setOpen] = useState(false);
  const videoId = "k33UPC9vBCo";
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return (
    <section className="mt-24 max-w-3xl">
      <div className="mb-6 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
        / Comunidade
      </div>
      <h2 className="mb-6 font-display text-3xl tracking-wide md:text-4xl">
        Nossos parceiros gostaram
      </h2>
      <div className="overflow-hidden rounded-md border border-[color:var(--graphite)]/15 bg-[color:var(--graphite)]/[0.03] p-3">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-sm bg-black">
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group absolute inset-0 flex items-center justify-center"
              aria-label="Reproduzir vídeo do parceiro"
            >
              <img
                src={thumb}
                alt="Prévia do vídeo do parceiro"
                loading="lazy"
                className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
              <span className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--terracotta)] text-[color:var(--bone)] shadow-lg">
                <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
              </span>
            </button>
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="Depoimento do parceiro"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          )}
        </div>
        <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Depoimento real · sem edição
        </p>
      </div>
    </section>
  );
}

