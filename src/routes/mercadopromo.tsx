import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  MapPin,
  Heart,
  ChevronDown,
  Zap,
  ShieldCheck,
  Gift,
  Star,
  ChevronRight,
} from "lucide-react";
import { fbqTrack } from "@/lib/pixel";
import mlLogo from "@/assets/mercadopromo/ml-logo.png.asset.json";
import review1 from "@/assets/mercadopromo/review-1.jpg.asset.json";
import review2 from "@/assets/mercadopromo/review-2.jpg.asset.json";
import review3 from "@/assets/mercadopromo/review-3.jpg.asset.json";

// -----------------------------------------------------------------------------
// /mercadopromo — página standalone estilo Mercado Livre (produto único).
// Template baseado em modamolecapromos.lovable.app + PDP real do ML.
// Não usa StoreLayout da Paze pra ficar 100% isolado. Pixel continua ativo
// pelo __root.tsx global.
// -----------------------------------------------------------------------------

const PRODUCT = {
  title: "Jaqueta Feminina Courino Slim Casaco Frio Zíper Motoqueiro",
  brand: "SKATHI",
  seller: "Skathi Wear",
  sold: "+50 vendidos",
  rating: 5.0,
  reviewsCount: 9,
  price: 20479, // centavos
  compareAt: null as number | null,
  installments: { count: 6, valueCents: 3413 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Agasalhos", "Casacos e Jaquetas"],
};

const COLORS: {
  key: string;
  label: string;
  thumb: string;
  gallery: string[];
}[] = [
  {
    key: "marrom",
    label: "Marrom-escuro",
    thumb: "https://http2.mlstatic.com/D_NQ_NP_2X_810204-MLB110339498152_052026-F.webp",
    gallery: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_810204-MLB110339498152_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_662783-MLB111271156807_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_683019-MLB111271096821_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_811888-MLB111272942717_052026-F.webp",
    ],
  },
  {
    key: "preto",
    label: "Preto",
    thumb: "https://http2.mlstatic.com/D_NQ_NP_2X_866958-MLB111273807557_052026-F.webp",
    gallery: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_866958-MLB111273807557_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_698571-MLB111273241677_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_789158-MLB111273927385_052026-F.webp",
    ],
  },
  {
    key: "bege",
    label: "Bege",
    thumb: "https://http2.mlstatic.com/D_NQ_NP_2X_958620-MLB110339498344_052026-F.webp",
    gallery: [
      "https://http2.mlstatic.com/D_NQ_NP_2X_958620-MLB110339498344_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_695488-MLB111273241551_052026-F.webp",
      "https://http2.mlstatic.com/D_NQ_NP_2X_992725-MLB110339498342_052026-F.webp",
    ],
  },
];

const SIZES = ["M", "G", "EXG", "GG"];

const RELATED = [
  {
    img: "https://http2.mlstatic.com/D_NQ_NP_2X_970240-MLA112330527416_062026-O.webp",
    title: "Jaqueta Feminina Ecológica Courino Fake Impermeável Off-White",
    priceCents: 7485,
    installments: "3x R$ 24,95 sem juros",
    freeShip: true,
  },
  {
    img: "https://http2.mlstatic.com/D_NQ_NP_2X_913340-MLA112678655910_062026-O.webp",
    title: "Jaqueta Feminina Slim Couro Pu Detalhes Dourado Facinelli",
    priceCents: 23673,
    compareCents: 25690,
    installments: "ou R$ 249,19 em 6x R$ 41,53 sem juros",
    freeShip: true,
    discount: "7% OFF no Pix",
  },
  {
    img: "https://http2.mlstatic.com/D_NQ_NP_2X_740782-MLA113206222295_062026-O.webp",
    title: "Jaqueta Feminina Couro Pixie Slim Casaco Blusa Impermeável",
    priceCents: 20499,
    installments: "6x R$ 34,16 sem juros",
    freeShip: true,
  },
];

const BRANDS = [
  {
    img: "https://http2.mlstatic.com/D_NQ_NP_2X_769606-MLA113777566597_062026-O.webp",
    tag: "ROVITEX",
    title: "Blusão Feminino Com Bordado E Aplique Rovitex Marrom",
    priceCents: 11304,
    compareCents: 16999,
    discount: "33% OFF no Pix",
    installments: "ou R$ 118,99 em 4x R$ 29,75 sem juros",
    coupon: "Cupom 5% OFF",
    freeShip: true,
  },
  {
    img: "https://http2.mlstatic.com/D_NQ_NP_2X_628670-MLA113778124669_062026-O.webp",
    tag: "",
    title: "Jaqueta Bomber Em Material Sintético Com Detalhes Metálicos",
    priceCents: 236000,
    installments: "10x R$ 236,04 sem juros",
    freeShip: true,
  },
  {
    img: "https://http2.mlstatic.com/D_NQ_NP_2X_952201-MLA113837087325_062026-O.webp",
    tag: "HERING",
    title: "Jaqueta Puffer Hering Feminina Inverno Casaco Frio Original",
    priceCents: 26820,
    compareCents: 29999,
    discount: "10% OFF",
    installments: "12x R$ 26,24",
    freeShip: true,
  },
];

const REVIEWS = [
  {
    name: "juliana.m",
    verified: true,
    rating: 5,
    text: "Chegou super rápido, o couro sintético é firme e o caimento slim ficou perfeito. Comprei M e serviu certinho.",
    when: "há 1 mês",
    photo: review1.url,
  },
  {
    name: "carol.s",
    verified: true,
    rating: 5,
    text: "Linda! Igual à foto, cor marrom-escuro exatamente como aparece. Quente sem ser pesada.",
    when: "há 2 meses",
    photo: review2.url,
  },
  {
    name: "priscila.f",
    verified: true,
    rating: 5,
    text: "Recomendo demais. Zíper de qualidade, costura reforçada. Já é a segunda que compro.",
    when: "há 2 meses",
    photo: review3.url,
  },
];

function formatBRL(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatBRLSplit(cents: number) {
  const value = (cents / 100).toFixed(2);
  const [int, dec] = value.split(".");
  return { int, dec };
}

export const Route = createFileRoute("/mercadopromo")({
  head: () => ({
    meta: [
      { title: `${PRODUCT.title} | Mercado Livre` },
      {
        name: "description",
        content:
          "Jaqueta feminina slim em courino com zíper estilo motoqueiro. Frete grátis, 6x sem juros e devolução grátis em até 30 dias.",
      },
      { property: "og:title", content: PRODUCT.title },
      {
        property: "og:description",
        content: "Frete grátis e 6x sem juros no Mercado Livre.",
      },
      { property: "og:image", content: COLORS[0].gallery[0] },
    ],
  }),
  component: MercadoPromoPage,
});

function MercadoPromoPage() {
  const [colorKey, setColorKey] = useState(COLORS[0].key);
  const color = useMemo(
    () => COLORS.find((c) => c.key === colorKey) ?? COLORS[0],
    [colorKey],
  );
  const [activeImg, setActiveImg] = useState(color.gallery[0]);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const priceSplit = formatBRLSplit(PRODUCT.price);

  useEffect(() => {
    setActiveImg(color.gallery[0]);
  }, [color]);

  useEffect(() => {
    fbqTrack("ViewContent", {
      content_ids: ["mercadopromo-jaqueta-courino"],
      content_name: PRODUCT.title,
      content_type: "product",
      value: PRODUCT.price / 100,
      currency: "BRL",
    });
  }, []);

  const onBuy = () => {
    fbqTrack("InitiateCheckout", {
      content_ids: ["mercadopromo-jaqueta-courino"],
      value: PRODUCT.price / 100,
      currency: "BRL",
      num_items: qty,
      contents: [{ id: colorKey, size: size ?? "-", quantity: qty }],
    });
  };

  const onAddToCart = () => {
    fbqTrack("AddToCart", {
      content_ids: ["mercadopromo-jaqueta-courino"],
      value: PRODUCT.price / 100,
      currency: "BRL",
    });
  };

  return (
    <div className="min-h-screen bg-[#ededed] font-sans text-[#333]">
      <MLHeader />

      {/* Breadcrumbs */}
      <div className="mx-auto hidden max-w-[1200px] px-4 py-3 text-[13px] md:block">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a href="#" className="text-[#3483fa] hover:underline">
            Voltar à lista
          </a>
          <span className="text-[#999]">|</span>
          {PRODUCT.categoryTrail.map((c, i) => (
            <span key={c} className="flex items-center gap-2">
              <a href="#" className="text-[#3483fa] hover:underline">
                {c}
              </a>
              {i < PRODUCT.categoryTrail.length - 1 && (
                <ChevronRight className="h-3 w-3 text-[#999]" />
              )}
            </span>
          ))}
          <div className="ml-auto flex gap-4">
            <a href="#" className="text-[#3483fa] hover:underline">
              Vender um igual
            </a>
            <a href="#" className="text-[#3483fa] hover:underline">
              Compartilhar
            </a>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="mx-auto max-w-[1200px] bg-white md:my-2 md:rounded-md md:shadow-sm">
        <div className="grid gap-4 p-3 md:grid-cols-[minmax(0,1fr)_320px] md:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_320px]">
          {/* Gallery */}
          <div className="flex gap-3">
            <div className="hidden w-14 flex-col gap-2 lg:flex">
              {color.gallery.map((src) => (
                <button
                  key={src}
                  onMouseEnter={() => setActiveImg(src)}
                  onClick={() => setActiveImg(src)}
                  className={`aspect-square overflow-hidden rounded border bg-white ${
                    activeImg === src ? "border-[#3483fa]" : "border-[#e0e0e0]"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
            <div className="relative flex-1 overflow-hidden rounded bg-white">
              <img
                src={activeImg}
                alt={PRODUCT.title}
                className="mx-auto aspect-[3/4] w-full max-w-[520px] object-cover"
              />
              <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white">
                <Heart className="h-5 w-5 text-[#3483fa]" />
              </button>
            </div>
            {/* Mobile strip */}
            <div className="absolute" />
          </div>
          {/* Mobile thumbnails row */}
          <div className="-mt-2 flex gap-2 overflow-x-auto lg:hidden">
            {color.gallery.map((src) => (
              <button
                key={src}
                onClick={() => setActiveImg(src)}
                className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded border ${
                  activeImg === src ? "border-[#3483fa]" : "border-[#e0e0e0]"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-[13px] text-[#666]">
              <span>Novo</span>
              <span>|</span>
              <span>{PRODUCT.sold}</span>
            </div>
            <div className="mb-2 inline-block rounded-sm bg-[#ff7733] px-2 py-0.5 text-[11px] font-semibold text-white">
              MAIS VENDIDO
            </div>
            <div className="mb-1 text-[13px] text-[#666]">
              1º em <a href="#" className="text-[#3483fa] hover:underline">Casacos e Jaquetas {PRODUCT.brand}</a>
            </div>
            <h1 className="mb-2 text-[22px] font-semibold leading-tight text-[#333] md:text-[24px]">
              {PRODUCT.title}
            </h1>
            <div className="mb-4 flex items-center gap-2 text-[14px]">
              <span className="text-[#3483fa]">{PRODUCT.rating.toFixed(1)}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#3483fa] text-[#3483fa]" strokeWidth={0} />
                ))}
              </div>
              <span className="text-[#3483fa]">({PRODUCT.reviewsCount})</span>
            </div>

            <div className="mb-1 flex items-start gap-1">
              <span className="text-[36px] leading-none text-[#333]">R$&nbsp;{priceSplit.int}</span>
              <span className="mt-1 text-[14px] text-[#333]">{priceSplit.dec}</span>
            </div>
            <div className="mb-1 text-[16px] text-[#00a650]">
              {PRODUCT.installments.count}x {formatBRL(PRODUCT.installments.valueCents)} sem juros
            </div>
            <a href="#" className="mb-6 inline-block text-[13px] text-[#3483fa] hover:underline">
              Ver os meios de pagamento
            </a>

            {/* Cor */}
            <div className="mt-4">
              <div className="mb-2 text-[14px]">
                <span className="text-[#333]">Cor: </span>
                <span className="text-[#333]">{color.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setColorKey(c.key)}
                    title={c.label}
                    className={`h-11 w-11 overflow-hidden rounded border-2 bg-white ${
                      colorKey === c.key ? "border-[#3483fa]" : "border-transparent hover:border-[#999]"
                    }`}
                  >
                    <img src={c.thumb} alt={c.label} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tamanho */}
            <div className="mt-6">
              <div className="mb-2 text-[14px]">
                <span className="text-[#333]">Tamanho: </span>
                <span className="text-[#666]">{size ?? "Escolha"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[54px] rounded border px-3 py-2 text-[14px] ${
                      size === s
                        ? "border-[#3483fa] bg-[#e6f0ff] text-[#3483fa]"
                        : "border-[#c7c7c7] bg-white text-[#333] hover:border-[#3483fa]"
                    } ${size === null ? "border-dashed" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <a href="#" className="mt-3 inline-flex items-center gap-1 text-[13px] text-[#3483fa] hover:underline">
                📖 Guia de tamanhos
              </a>
              <div className="mt-2">
                <a href="#" className="inline-flex items-center gap-1 text-[13px] text-[#3483fa] hover:underline">
                  Perfeito para 100% <ChevronDown className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Buy box */}
          <div className="rounded-md border border-[#e6e6e6] p-4">
            <div className="mb-3 inline-flex items-center gap-1 rounded bg-[#00a650] px-2 py-1 text-[12px] font-semibold text-white">
              <Zap className="h-3 w-3 fill-white" strokeWidth={0} />
              FRETE GRÁTIS ACIMA DE R$ 19
            </div>
            <p className="text-[14px]">
              <span className="text-[#00a650]">Chegará grátis</span> entre{" "}
              <span className="text-[#00a650]">quinta-feira e sexta-feira</span> por ser sua primeira compra
            </p>
            <a href="#" className="mt-1 inline-block text-[13px] text-[#3483fa] hover:underline">
              Mais detalhes e formas de entrega
            </a>

            <p className="mt-4 text-[14px]">
              <span className="text-[#00a650]">Retire grátis</span> a partir de segunda-feira em uma agência Mercado Livre
            </p>
            <a href="#" className="text-[13px] text-[#3483fa] hover:underline">
              Ver no mapa
            </a>

            <p className="mt-4 text-[14px]">
              <span className="text-[#00a650]">Devolução grátis.</span> Você tem 30 dias a partir da data de recebimento.
            </p>

            <div className="mt-5 text-[14px] text-[#333]">Estoque disponível</div>
            <div className="mt-1 flex items-center gap-2 text-[14px]">
              <span>Quantidade:</span>
              <button
                onClick={() =>
                  setQty((q) => {
                    const next = Math.max(1, q - (q > 1 ? 0 : 0));
                    return next;
                  })
                }
                className="hidden"
              />
              <div className="relative">
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="appearance-none rounded border border-[#c7c7c7] bg-white py-1 pl-3 pr-8 text-[14px]"
                >
                  {[1, 2].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "unidade" : "unidades"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              </div>
              <span className="text-[#666]">(2 disponíveis)</span>
            </div>

            <button
              onClick={onBuy}
              className="mt-5 w-full rounded-md bg-[#3483fa] py-3 text-[16px] font-semibold text-white hover:bg-[#2968c8]"
            >
              Comprar agora
            </button>
            <button
              onClick={onAddToCart}
              className="mt-2 w-full rounded-md bg-[#e6f0ff] py-3 text-[16px] font-semibold text-[#3483fa] hover:bg-[#d5e4fc]"
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Adicionar ao carrinho
              </span>
            </button>

            <div className="mt-5 border-t border-[#eee] pt-4 text-[14px]">
              <div>
                Vendido por{" "}
                <a href="#" className="text-[#3483fa] hover:underline">
                  {PRODUCT.seller}
                </a>
              </div>
              <div className="text-[13px] text-[#666]">MercadoLíder | +10 mil vendas</div>
            </div>

            <ul className="mt-4 space-y-3 text-[13px]">
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3483fa]" />
                <span>
                  <a href="#" className="text-[#3483fa] hover:underline">Compra Garantida</a>. Receba o produto que está esperando ou devolvemos o dinheiro.
                </span>
              </li>
              <li className="flex gap-2">
                <Gift className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3483fa]" />
                <span>
                  <a href="#" className="text-[#3483fa] hover:underline">Vale-troca para presente</a>. A pessoa que o receber poderá trocá-lo.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Produtos relacionados + seller card */}
        <div className="grid gap-6 border-t border-[#eee] p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#333]">Produtos relacionados</h2>
              <span className="text-[12px] text-[#999]">Ad</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {RELATED.map((p) => (
                <RelatedCard key={p.title} {...p} />
              ))}
            </div>
          </div>
          <SellerCard />
        </div>

        {/* Marcas em destaque + payment methods */}
        <div className="grid gap-6 border-t border-[#eee] p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#333]">Marcas em destaque</h2>
              <span className="text-[12px] text-[#999]">Ad</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {BRANDS.map((p) => (
                <BrandCard key={p.title} {...p} />
              ))}
            </div>
          </div>
          <PaymentMethodsCard />
        </div>

        {/* Opiniões */}
        <div className="border-t border-[#eee] p-4 md:p-6">
          <h2 className="mb-4 text-[22px] font-semibold">Opiniões do produto</h2>
          <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
            <div>
              <div className="text-[48px] font-light leading-none">{PRODUCT.rating.toFixed(1)}</div>
              <div className="mt-1 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#3483fa] text-[#3483fa]" strokeWidth={0} />
                ))}
              </div>
              <div className="mt-1 text-[13px] text-[#666]">{PRODUCT.reviewsCount} avaliações</div>
              <div className="mt-4 space-y-1">
                {[
                  [5, 8],
                  [4, 1],
                  [3, 0],
                  [2, 0],
                  [1, 0],
                ].map(([star, n]) => (
                  <div key={star} className="flex items-center gap-2 text-[13px]">
                    <span className="w-3 text-[#666]">{star}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded bg-[#eee]">
                      <div
                        className="h-full bg-[#3483fa]"
                        style={{ width: `${(n / PRODUCT.reviewsCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-[#666]">{n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              {REVIEWS.map((r) => (
                <div key={r.name} className="border-b border-[#eee] pb-4 last:border-0">
                  <div className="mb-1 flex items-center gap-2 text-[13px] text-[#666]">
                    <span>{r.when}</span>
                  </div>
                  <div className="mb-1 flex items-center gap-1 text-[14px]">
                    <span className="text-[#333]">{r.name}</span>
                    {r.verified && (
                      <span className="text-[12px] text-[#00a650]">✓ Verificado</span>
                    )}
                  </div>
                  <div className="mb-2 flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating ? "fill-[#3483fa] text-[#3483fa]" : "text-[#ddd]"
                        }`}
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <p className="mb-3 text-[14px] leading-relaxed text-[#333]">{r.text}</p>
                  {r.photo && (
                    <a
                      href={r.photo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block overflow-hidden rounded border border-[#eee]"
                    >
                      <img
                        src={r.photo}
                        alt={`Foto enviada por ${r.name}`}
                        loading="lazy"
                        className="h-40 w-40 object-cover"
                      />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
}

// ---------------- Header ----------------
function MLHeader() {
  return (
    <header className="bg-[#fff159]">
      <div className="mx-auto max-w-[1200px] px-4 pt-3">
        <div className="flex items-center gap-3 md:gap-6">
          {/* Logo */}
          <a href="/mercadopromo" className="flex-shrink-0">
            <img
              src={mlLogo.url}
              alt="Mercado Livre"
              className="h-8 w-auto md:h-10"
              draggable={false}
            />
          </a>

          {/* Search */}
          <div className="flex flex-1 items-center rounded bg-white shadow-sm">
            <input
              type="search"
              placeholder="Buscar produtos, marcas e muito mais..."
              className="flex-1 rounded-l bg-transparent px-3 py-2.5 text-[14px] text-[#333] outline-none placeholder:text-[#999]"
            />
            <button className="p-2 pr-3 text-[#999]">
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* CTA + cart */}
          <div className="hidden items-center gap-4 md:flex">
            <div className="hidden items-center gap-2 rounded-full border border-[#3483fa] bg-white px-3 py-1 text-[12px] text-[#333] lg:flex">
              <span className="font-semibold text-[#3483fa]">ASSINE AGORA</span>
              <span className="rounded-full bg-[#00c58f] px-1.5 text-[10px] font-bold text-white">GRÁTIS</span>
              <span className="font-semibold">MELI+</span>
              <span className="text-[10px] text-[#666]">
                A PARTIR DE <b className="text-[#333]">R$ 9,90/MÊS</b>
              </span>
            </div>
            <button className="text-[#333]">
              <ShoppingCart className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Row 2 */}
        <div className="mt-2 hidden items-center gap-4 pb-2 text-[13px] text-[#333] md:flex">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="text-[#666]">
              Enviar para <b className="text-[#333]">Rio de Janeiro 20211...</b>
            </span>
          </div>
          <a href="#" className="hover:underline">Categorias <ChevronDown className="inline h-3 w-3" /></a>
          <a href="#" className="hover:underline">Ofertas</a>
          <a href="#" className="hover:underline">Cupons</a>
          <a href="#" className="hover:underline">Supermercado</a>
          <a href="#" className="hover:underline">Moda</a>
          <a href="#" className="relative hover:underline">
            Mercado Play
            <span className="absolute -top-3 right-0 rounded-sm bg-[#00c58f] px-1 text-[9px] font-bold text-white">GRÁTIS</span>
          </a>
          <a href="#" className="hover:underline">Vender</a>
          <a href="#" className="hover:underline">Contato</a>
          <div className="ml-auto flex items-center gap-4">
            <a href="#" className="hover:underline">Crie a sua conta</a>
            <a href="#" className="hover:underline">Entre</a>
            <a href="#" className="hover:underline">Compras</a>
          </div>
        </div>
      </div>
    </header>
  );
}

// ---------------- Related product cards ----------------
function RelatedCard(p: (typeof RELATED)[number]) {
  return (
    <div className="flex flex-col overflow-hidden rounded border border-[#eee] bg-white p-3">
      <div className="aspect-square overflow-hidden rounded">
        <img src={p.img} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <p className="mt-3 line-clamp-2 text-[13px] text-[#333]">{p.title}</p>
      {"compareCents" in p && p.compareCents && (
        <div className="mt-2 text-[11px] text-[#999] line-through">{formatBRL(p.compareCents)}</div>
      )}
      <div className="mt-0.5 flex items-center gap-2">
        <span className="text-[18px] text-[#333]">{formatBRL(p.priceCents)}</span>
        {"discount" in p && p.discount && (
          <span className="text-[12px] font-semibold text-[#00a650]">{p.discount}</span>
        )}
      </div>
      <div className="text-[12px] text-[#00a650]">{p.installments}</div>
      {p.freeShip && <div className="mt-1 text-[12px] font-semibold text-[#00a650]">Frete grátis</div>}
    </div>
  );
}

function BrandCard(p: (typeof BRANDS)[number]) {
  return (
    <div className="flex flex-col overflow-hidden rounded border border-[#eee] bg-white p-3">
      <div className="aspect-square overflow-hidden rounded">
        <img src={p.img} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
      </div>
      {p.tag && <div className="mt-3 text-[11px] font-semibold text-[#666]">{p.tag}</div>}
      <p className={`${p.tag ? "" : "mt-3"} line-clamp-2 text-[13px] text-[#333]`}>{p.title}</p>
      {"compareCents" in p && p.compareCents && (
        <div className="mt-2 text-[11px] text-[#999] line-through">{formatBRL(p.compareCents)}</div>
      )}
      <div className="mt-0.5 flex items-center gap-2">
        <span className="text-[18px] text-[#333]">{formatBRL(p.priceCents)}</span>
        {p.discount && <span className="text-[12px] font-semibold text-[#00a650]">{p.discount}</span>}
      </div>
      <div className="text-[12px] text-[#00a650]">{p.installments}</div>
      {p.coupon && (
        <div className="mt-1 inline-block w-fit rounded bg-[#e6f0ff] px-2 py-0.5 text-[11px] text-[#3483fa]">
          🎟 {p.coupon}
        </div>
      )}
      {p.freeShip && <div className="mt-1 text-[12px] font-semibold text-[#00a650]">Frete grátis</div>}
    </div>
  );
}

function SellerCard() {
  return (
    <aside className="rounded-md border border-[#e6e6e6] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eee] text-[13px] text-[#333]">
          SW
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold text-[#333]">Skathi Wear</div>
          <div className="text-[12px] text-[#666]">+1000 Seguidores &nbsp; +500 Produtos</div>
        </div>
        <button className="rounded border border-[#3483fa] px-3 py-1 text-[12px] text-[#3483fa] hover:bg-[#e6f0ff]">
          Seguir
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[13px] text-[#00a650]">
        🍃 MercadoLíder Platinum
      </div>
      <div className="mt-1 text-[12px] text-[#666]">É um dos melhores do site!</div>
      <div className="mt-3 grid grid-cols-4 gap-1">
        <div className="h-1.5 rounded bg-[#f9d0d0]" />
        <div className="h-1.5 rounded bg-[#fce9c0]" />
        <div className="h-1.5 rounded bg-[#f0e58b]" />
        <div className="h-1.5 rounded bg-[#00a650]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px] text-[#666]">
        <div>
          <div className="font-semibold text-[#333]">+10 mil</div>
          Vendas
        </div>
        <div>
          <div className="font-semibold text-[#333]">👍</div>
          Bom atendimento
        </div>
        <div>
          <div className="font-semibold text-[#333]">⏱</div>
          Entrega no prazo
        </div>
      </div>
      <button className="mt-4 w-full rounded-md bg-[#e6f0ff] py-2 text-[13px] font-semibold text-[#3483fa] hover:bg-[#d5e4fc]">
        Ir para a página do vendedor
      </button>
    </aside>
  );
}

function PaymentMethodsCard() {
  return (
    <aside className="rounded-md border border-[#e6e6e6] p-4">
      <div className="mb-3 text-[16px] font-semibold text-[#333]">Meios de pagamento</div>
      <div className="text-[13px] text-[#333]">Cartões de crédito</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {["AMEX", "ELO", "VISA", "Master"].map((b) => (
          <span
            key={b}
            className="inline-flex h-7 items-center justify-center rounded border border-[#eee] bg-white px-2 text-[11px] font-semibold text-[#333]"
          >
            {b}
          </span>
        ))}
      </div>
      <div className="mt-4 text-[13px] text-[#333]">Pix</div>
      <div className="mt-2">
        <span className="inline-flex h-7 items-center justify-center rounded border border-[#eee] bg-white px-2 text-[11px] font-semibold text-[#00a99d]">
          pix
        </span>
      </div>
      <div className="mt-4 text-[13px] text-[#333]">Boleto bancário</div>
      <div className="mt-2">
        <span className="inline-flex h-7 items-center justify-center rounded border border-[#eee] bg-white px-2 text-[11px] font-semibold text-[#333]">
          ||||
        </span>
      </div>
      <a href="#" className="mt-4 inline-block text-[13px] text-[#3483fa] hover:underline">
        Confira outros meios de pagamento
      </a>
    </aside>
  );
}
