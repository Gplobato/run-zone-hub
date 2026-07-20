import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Minus, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { formatBRL } from "@/lib/products";
import { fbqTrack } from "@/lib/pixel";
import { createZedyCheckout } from "@/lib/zedy.functions";

const PRICE_CENTS = 7990;
const PIXEL_CONTENT_ID = "nb-9060";
const SIZES = ["34/35", "36/37", "38/39", "40/41", "42/43", "43/44"] as const;

const COLORS = [
  {
    key: "branco",
    label: "Branco / Clássico",
    variantId: 250703130,
    image: "https://assetsglobalbr.com/u/testimony/fe6916cd.png",
    secondaryImage: "https://assetsglobalbr.com/u/testimony/27038a4a.webp",
  },
  {
    key: "preto",
    label: "Preto / Creme",
    variantId: 250703640,
    image: "https://assetsglobalbr.com/u/testimony/8cbd4aab.png",
    secondaryImage: "https://assetsglobalbr.com/u/testimony/5620e758.webp",
  },
] as const;

export const Route = createFileRoute("/nb-9060")({
  head: () => ({
    meta: [
      { title: "Tênis NB 9060 Running — Paze" },
      {
        name: "description",
        content:
          "Tênis NB 9060 Running unissex, visual robusto, confortável para o dia a dia e disponível nas cores Branco / Clássico e Preto / Creme.",
      },
      { property: "og:type", content: "product" },
      { property: "og:title", content: "Tênis NB 9060 Running" },
      {
        property: "og:description",
        content:
          "Escolha sua cor do NB 9060 e finalize direto no checkout seguro.",
      },
      { property: "og:image", content: COLORS[0].image },
      { property: "product:price:amount", content: "79.90" },
      { property: "product:price:currency", content: "BRL" },
      { property: "product:availability", content: "in stock" },
      { property: "product:retailer_item_id", content: PIXEL_CONTENT_ID },
    ],
  }),
  component: Nb9060Page,
});

function Nb9060Page() {
  const createCheckout = useServerFn(createZedyCheckout);
  const [selectedColor, setSelectedColor] = useState<(typeof COLORS)[number]>(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<(typeof SIZES)[number]>(SIZES[0]);
  const [activeImage, setActiveImage] = useState(COLORS[0].image);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gallery = useMemo(
    () => [selectedColor.image, selectedColor.secondaryImage],
    [selectedColor],
  );

  useEffect(() => {
    setActiveImage(selectedColor.image);
  }, [selectedColor]);

  useEffect(() => {
    fbqTrack("ViewContent", pixelPayload(selectedColor, qty, selectedSize));
  }, [selectedColor, qty, selectedSize]);

  async function openCheckout(source: "buy_now" | "add_to_cart") {
    if (loading) return;
    setLoading(true);
    setError(null);

    const payload = pixelPayload(selectedColor, qty, selectedSize);
    if (source === "add_to_cart") fbqTrack("AddToCart", payload);
    fbqTrack("InitiateCheckout", payload);

    try {
      const { url } = await createCheckout({
        data: {
          items: [{ variantId: selectedColor.variantId, quantity: qty }],
        },
      });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao abrir o checkout.");
      setLoading(false);
    }
  }

  return (
    <StoreLayout>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1040492725582996&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <nav className="mb-6 flex gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/produtos">Produtos</Link>
          <span>/</span>
          <span className="text-[color:var(--graphite)]">NB 9060</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-3">
            <div className="aspect-[4/5] overflow-hidden rounded-md border border-[color:var(--graphite)]/10 bg-white">
              <img
                src={activeImage}
                alt={`Tênis NB 9060 Running ${selectedColor.label}`}
                className="h-full w-full object-cover"
                loading="eager"
                draggable={false}
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(src)}
                  className={`aspect-square overflow-hidden rounded-sm border bg-white ${
                    activeImage === src
                      ? "border-[color:var(--terracotta)]"
                      : "border-[color:var(--graphite)]/10"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </section>

          <section>
            <span className="mb-4 inline-block rounded-sm bg-[color:var(--terracotta)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[color:var(--bone)]">
              Novo
            </span>
            <div className="font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
              Calçados
            </div>
            <h1 className="mt-2 font-display text-4xl leading-none tracking-wide md:text-6xl">
              TÊNIS NB 9060 RUNNING
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Visual robusto, conforto para o dia a dia e duas cores prontas para escolher.
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-mono text-4xl font-medium text-[color:var(--terracotta)]">
                {formatBRL(PRICE_CENTS)}
              </span>
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              ou 10x de {formatBRL(799)} sem juros
            </div>

            <p className="mt-6 text-sm leading-relaxed">
              O NB 9060 combina cabedal respirável, sobreposições estruturadas e
              solado reforçado em borracha e EVA. A proposta é um tênis casual
              unissex, marcante no visual e confortável para usar com jeans,
              cargo, bermuda ou peças esportivas.
            </p>

            <div className="mt-6">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Cor: <span className="text-[color:var(--graphite)]">{selectedColor.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.key}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-3 rounded-sm border p-2 text-left transition-colors ${
                      selectedColor.key === color.key
                        ? "border-[color:var(--graphite)] bg-[color:var(--graphite)] text-[color:var(--bone)]"
                        : "border-[color:var(--graphite)]/15 bg-white hover:border-[color:var(--sage)]"
                    }`}
                  >
                    <img
                      src={color.image}
                      alt=""
                      className="h-14 w-14 rounded-sm object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                    <span className="font-mono text-xs uppercase tracking-wider">
                      {color.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Tamanho: <span className="text-[color:var(--graphite)]">{selectedSize}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-sm border px-3 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                      selectedSize === size
                        ? "border-[color:var(--graphite)] bg-[color:var(--graphite)] text-[color:var(--bone)]"
                        : "border-[color:var(--graphite)]/20 bg-white hover:border-[color:var(--sage)]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

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
                onClick={() => openCheckout("add_to_cart")}
                disabled={loading}
                className="flex-1 rounded-sm border border-[color:var(--graphite)] px-4 py-4 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-[color:var(--graphite)] hover:text-[color:var(--bone)] disabled:opacity-60"
              >
                Adicionar ao carrinho
              </button>
            </div>

            <button
              onClick={() => openCheckout("buy_now")}
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--terracotta)] py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Comprar agora
            </button>

            {error && (
              <div className="mt-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[color:var(--graphite)]/10 pt-6 text-xs">
              <InfoIcon icon={<Truck />} label="Entrega em todo o Brasil" />
              <InfoIcon icon={<RotateCcw />} label="Troca em 30 dias" />
              <InfoIcon icon={<ShieldCheck />} label="Checkout seguro" />
            </div>
          </section>
        </div>

        <section className="mt-20 grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
              / Destaques
            </div>
            <h2 className="font-display text-3xl tracking-wide md:text-4xl">
              Conforto com presença.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Cabedal em mesh respirável",
              "Sobreposições estruturadas",
              "Entressola de dupla densidade",
              "Solado em borracha e EVA",
              "Interior acolchoado",
              "Tamanhos do 35 ao 44",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-sm border border-[color:var(--graphite)]/10 bg-white/60 px-4 py-3 text-sm"
              >
                <Check className="h-4 w-4 text-[color:var(--sage)]" />
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[color:var(--graphite)]/10 bg-[color:var(--bone)] p-3 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="font-mono text-sm text-[color:var(--terracotta)]">
              {formatBRL(PRICE_CENTS)}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {selectedColor.label} · {selectedSize}
            </div>
          </div>
          <button
            onClick={() => openCheckout("buy_now")}
            disabled={loading}
            className="flex-1 rounded-sm bg-[color:var(--terracotta)] py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)] disabled:opacity-60"
          >
            Comprar
          </button>
        </div>
      </div>
      <div className="h-20 md:hidden" />
    </StoreLayout>
  );
}

function pixelPayload(
  color: (typeof COLORS)[number],
  quantity: number,
  size: (typeof SIZES)[number],
) {
  return {
    content_ids: [PIXEL_CONTENT_ID, String(color.variantId)],
    content_name: `Tênis NB 9060 Running - ${color.label}`,
    content_type: "product",
    content_category: "Calçados",
    size,
    color: color.label,
    contents: [
      {
        id: String(color.variantId),
        quantity,
        item_price: PRICE_CENTS / 100,
      },
    ],
    value: (PRICE_CENTS * quantity) / 100,
    currency: "BRL",
  };
}

function InfoIcon({ icon, label }: { icon: React.ReactElement; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-[color:var(--sage)]">
        {icon}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
