import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Check,
  CircleAlert,
  Copy,
  CreditCard,
  Edit3,
  Search,
  ShoppingCart,
  MapPin,
  Heart,
  ChevronDown,
  Info,
  Loader2,
  Lock,
  Zap,
  ShieldCheck,
  Gift,
  Star,
  ChevronRight,
  ZoomIn,
  X,
  Ruler,
  Ticket,
} from "lucide-react";
import { fbqTrack } from "@/lib/pixel";
import { createHypercashTransaction } from "@/lib/hypercash.functions";
import mlLogo from "@/assets/mercadopromo/ml-logo.png";
import pixLogo from "@/assets/mercadopromo/pix-logo.png";
import payAmex from "@/assets/mercadopromo/pay-amex.png";
import payElo from "@/assets/mercadopromo/pay-elo.png";
import payVisa from "@/assets/mercadopromo/pay-visa.png";
import payMastercard from "@/assets/mercadopromo/pay-mastercard.png";
import payPix from "@/assets/mercadopromo/pay-pix.png";
import jacketMarromVideo from "@/assets/mercadopromo/jaqueta-marrom-video.mp4";
import boots1 from "@/assets/mercadopromo/boots-1.jpg";
import boots2 from "@/assets/mercadopromo/boots-2.jpg";
import boots3 from "@/assets/mercadopromo/boots-3.jpg";
import pants1 from "@/assets/mercadopromo/pants-1.jpg";
import pants2 from "@/assets/mercadopromo/pants-2.jpg";
import pants3 from "@/assets/mercadopromo/pants-3.jpg";
import review1 from "@/assets/mercadopromo/review-1.jpg";
import review2 from "@/assets/mercadopromo/review-2.jpg";
import review3 from "@/assets/mercadopromo/review-3.jpg";

// -----------------------------------------------------------------------------
// /mercadopromo "” página standalone estilo Mercado Livre (produto único).
// Template baseado em modamolecapromos.lovable.app + PDP real do ML.
// Não usa StoreLayout da Paze pra ficar 100% isolado. Pixel continua ativo
// pelo __root.tsx global.
// -----------------------------------------------------------------------------

type GalleryMedia = {
  src: string;
  kind: "image" | "video";
};

type Product = {
  id: string;
  title: string;
  brand: string;
  seller: string;
  sold: string;
  rating: number;
  reviewsCount: number;
  price: number;
  compareAt: number | null;
  installments: { count: number; valueCents: number };
  categoryTrail: string[];
  colors: {
    key: string;
    label: string;
    thumb: string;
    gallery: GalleryMedia[];
  }[];
  sizes: string[];
  description?: {
    heading: string;
    intro: string[];
    steps: string[];
    benefits: { title: string; result: string; feeling: string }[];
    quotes: string[];
    specs: string[];
    tip: string;
    closing: string[];
    warranty: string;
  };
};

const MAIN_PRODUCT: Product = {
  id: "mercadopromo-jaqueta-courino",
  title: "Jaqueta Feminina Courino Slim Casaco Frio Zíper Motoqueiro",
  brand: "SKATHI",
  seller: "Skhati Wear",
  sold: "+800 vendidos",
  rating: 5.0,
  reviewsCount: 9,
  price: 7990,
  compareAt: null,
  installments: { count: 6, valueCents: 1332 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Agasalhos", "Casacos e Jaquetas"],
  colors: [
    {
      key: "marrom",
      label: "Marrom",
      thumb: "https://http2.mlstatic.com/D_NQ_NP_2X_810204-MLB110339498152_052026-F.webp",
      gallery: [
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_810204-MLB110339498152_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_662783-MLB111271156807_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_683019-MLB111271096821_052026-F.webp", kind: "image" },
        { src: jacketMarromVideo, kind: "video" },
      ],
    },
    {
      key: "preto",
      label: "Branco",
      thumb: "https://http2.mlstatic.com/D_NQ_NP_2X_866958-MLB111273807557_052026-F.webp",
      gallery: [
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_866958-MLB111273807557_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_698571-MLB111273241677_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_789158-MLB111273927385_052026-F.webp", kind: "image" },
      ],
    },
    {
      key: "bege",
      label: "Preto",
      thumb: "https://http2.mlstatic.com/D_NQ_NP_2X_958620-MLB110339498344_052026-F.webp",
      gallery: [
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_958620-MLB110339498344_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_695488-MLB111273241551_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_992725-MLB110339498342_052026-F.webp", kind: "image" },
      ],
    },
  ],
  sizes: ["P", "M", "G", "GG", "EXG"],
};

const BOOT_PRODUCT: Product = {
  id: "mercadopromo-bota-montaria",
  title: "Montaria Feminina Cano Longo Coturno Cadarço Atrás",
  brand: "SKATHI",
  seller: "Skhati Wear",
  sold: "+300 vendidos",
  rating: 4.9,
  reviewsCount: 12,
  price: 4990,
  compareAt: null,
  installments: { count: 6, valueCents: 832 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Calçados", "Botas"],
  colors: [
    {
      key: "preto",
      label: "Preto",
      thumb: boots1,
      gallery: [
        { src: boots1, kind: "image" },
        { src: boots2, kind: "image" },
        { src: boots3, kind: "image" },
      ],
    },
  ],
  sizes: ["34", "35", "36", "37", "38", "39"],
};

const PANTS_PRODUCT: Product = {
  id: "mercadopromo-calca-hiperlipo",
  title: "Calça Hiperlipo Modeladora Chapa Barriga Suplex e Poliam Leg",
  brand: "SKATHI",
  seller: "Skhati Wear",
  sold: "+500 vendidos",
  rating: 4.8,
  reviewsCount: 21,
  price: 5990,
  compareAt: null,
  installments: { count: 6, valueCents: 998 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Roupas", "Calças"],
  colors: [
    {
      key: "preto",
      label: "Preto",
      thumb: pants1,
      gallery: [
        { src: pants1, kind: "image" },
        { src: pants2, kind: "image" },
        { src: pants3, kind: "image" },
      ],
    },
  ],
  sizes: ["P", "M", "G", "GG"],
};

const PRODUCTS: Product[] = [MAIN_PRODUCT, BOOT_PRODUCT, PANTS_PRODUCT];

const SIZE_GUIDE = [
  { label: "P", equivalent: "P", chest: 88, height: 55, shoulders: 37 },
  { label: "M", equivalent: "M", chest: 95, height: 56, shoulders: 40 },
  { label: "G", equivalent: "G", chest: 100, height: 57, shoulders: 41 },
  { label: "GG", equivalent: "GG", chest: 102, height: 58, shoulders: 42 },
  { label: "EXG", equivalent: "XG", chest: 104, height: 59, shoulders: 43 },
];

const PAYMENT_METHODS = {
  credit: [
    { name: "American Express", src: payAmex },
    { name: "Elo", src: payElo },
    { name: "Visa", src: payVisa },
    { name: "Mastercard", src: payMastercard },
  ],
  pix: { name: "Pix", src: payPix },
};

const SELLER = {
  name: "Skhati Wear",
  image: "https://http2.mlstatic.com/D_NQ_NP_624580-MLA91707854636_092025-F.jpg",
  medal: "https://http2.mlstatic.com/frontend-assets/vpp-frontend/medal.svg",
};

const RELATED = [
  {
    productIdx: 1,
    img: boots1,
    gallery: [boots1, boots2, boots3],
    title: BOOT_PRODUCT.title,
    description:
      "Bota montaria de cano longo com acabamento liso, fechamento por cadarço atrás e sola firme para uso diário. Visual elegante para compor looks urbanos e de inverno.",
    priceCents: BOOT_PRODUCT.price,
    installments: "até 6x sem juros",
    freeShip: true,
  },
  {
    productIdx: 2,
    img: pants1,
    gallery: [pants1, pants2, pants3],
    title: PANTS_PRODUCT.title,
    description:
      "Calça modeladora com cintura alta, tecido encorpado e elasticidade confortável, pensada para valorizar a silhueta com firmeza e conforto no uso diário.",
    priceCents: PANTS_PRODUCT.price,
    installments: "até 6x sem juros",
    freeShip: true,
  },
];

type RelatedProduct = (typeof RELATED)[number];

const REVIEWS = [
  {
    name: "juliana.m",
    verified: true,
    rating: 5,
    text: "Chegou super rápido, o couro sintético é firme e o caimento slim ficou perfeito. Comprei M e serviu certinho.",
    when: "há 1 mês",
    photo: review1,
  },
  {
    name: "carol.s",
    verified: true,
    rating: 5,
    text: "Linda! Igual à foto, cor marrom-escuro exatamente como aparece. Quente sem ser pesada.",
    when: "há 2 meses",
    photo: review2,
  },
  {
    name: "priscila.f",
    verified: true,
    rating: 5,
    text: "Recomendo demais. Zíper de qualidade, costura reforçada. Já é a segunda que compro.",
    when: "há 2 meses",
    photo: review3,
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

const onlyDigits = (value: string) => value.replace(/\D+/g, "");
const maskCPF = (value: string) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};
const maskCEP = (value: string) =>
  onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const maskCardNumber = (value: string) =>
  onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
const maskCardExpiry = (value: string) =>
  onlyDigits(value).slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");

type CheckoutForm = {
  name: string;
  email: string;
  document: string;
  phone: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type PixData = {
  qrcode?: string;
  qrcodeBase64?: string;
  qrcodeUrl?: string;
};

type CardForm = {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
  installments: number;
};

export const Route = createFileRoute("/mercadopromo")({
  head: () => ({
    meta: [
      { title: `${MAIN_PRODUCT.title} | Mercado Livre` },
      {
        name: "description",
        content:
          "Jaqueta feminina slim em courino com zíper estilo motoqueiro. Frete grátis, 6x sem juros e devolução grátis em até 30 dias.",
      },
      { property: "og:title", content: MAIN_PRODUCT.title },
      {
        property: "og:description",
        content: "Frete grátis e 6x sem juros no Mercado Livre.",
      },
      { property: "og:image", content: MAIN_PRODUCT.colors[0].gallery[0].src },
    ],
  }),
  component: MercadoPromoPage,
});

function MercadoPromoPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const PRODUCT = PRODUCTS[activeIdx];
  const COLORS = PRODUCT.colors;
  const SIZES = PRODUCT.sizes;

  const [colorKey, setColorKey] = useState(COLORS[0].key);
  const color = useMemo(
    () => COLORS.find((c) => c.key === colorKey) ?? COLORS[0],
    [colorKey, COLORS],
  );
  const [activeImg, setActiveImg] = useState(color.gallery[0].src);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const priceSplit = formatBRLSplit(PRODUCT.price);

  useEffect(() => {
    setActiveImg(color.gallery[0].src);
  }, [color]);

  // Reset selection when switching products via sub-tabs
  useEffect(() => {
    setColorKey(PRODUCTS[activeIdx].colors[0].key);
    setSize(null);
    setQty(1);
  }, [activeIdx]);

  // Pixel: ViewContent fires per active product
  useEffect(() => {
    fbqTrack("ViewContent", {
      content_ids: [PRODUCT.id],
      content_name: PRODUCT.title,
      content_type: "product",
      value: PRODUCT.price / 100,
      currency: "BRL",
    });
  }, [PRODUCT.id, PRODUCT.price, PRODUCT.title]);

  const selectProduct = (idx: number) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onBuy = () => {
    fbqTrack("InitiateCheckout", {
      content_ids: [PRODUCT.id],
      content_name: PRODUCT.title,
      value: PRODUCT.price / 100,
      currency: "BRL",
      num_items: qty,
      contents: [{ id: colorKey, size: size ?? "-", quantity: qty }],
    });
    setCheckoutOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onAddToCart = () => {
    fbqTrack("AddToCart", {
      content_ids: [PRODUCT.id],
      content_name: PRODUCT.title,
      value: PRODUCT.price / 100,
      currency: "BRL",
    });
    fbqTrack("InitiateCheckout", {
      content_ids: [PRODUCT.id],
      content_name: PRODUCT.title,
      value: PRODUCT.price / 100,
      currency: "BRL",
      num_items: qty,
      contents: [{ id: colorKey, size: size ?? "-", quantity: qty }],
    });
    setCheckoutOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (checkoutOpen) {
    return (
      <MercadoCheckout
        product={PRODUCT}
        colorLabel={color.label}
        productImage={activeImg}
        quantity={qty}
        selectedSize={size}
        onBack={() => setCheckoutOpen(false)}
      />
    );
  }

  return (
    <div className="mercado-promo-page min-h-screen bg-[#ededed] text-[#333]">
      <style>{`
        .mercado-promo-page,
          .mercado-promo-page h1,
          .mercado-promo-page h2,
          .mercado-promo-page h3 {
          font-family: "Proxima Nova", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
          letter-spacing: 0 !important;
          text-transform: none !important;
        }
      `}</style>
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

      {/* Sub-tabs: navegação entre produtos dentro da mercadopromo */}
      <div className="mx-auto max-w-[1200px] px-3 pt-3 md:px-4">
        <div className="flex gap-2 overflow-x-auto border-b border-[#e6e6e6]">
          {PRODUCTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectProduct(i)}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-[13px] transition ${
                activeIdx === i
                  ? "border-[#3483fa] text-[#3483fa]"
                  : "border-transparent text-[#666] hover:text-[#333]"
              }`}
            >
              {p.title.split(" ").slice(0, 3).join(" ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main card */}
      <div className="mx-auto max-w-[1200px] bg-white md:my-2 md:rounded-md md:shadow-sm">
        <div className="grid gap-4 p-3 md:grid-cols-[minmax(0,1fr)_320px] md:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_320px]">
          {/* Gallery column (image + mobile thumbnails) */}
          <div className="min-w-0">
            <div className="flex gap-3">
              <div className="hidden w-14 flex-col gap-2 lg:flex">
                {color.gallery.map((media) => (
                  <button
                    key={media.src}
                    onMouseEnter={() => setActiveImg(media.src)}
                    onClick={() => setActiveImg(media.src)}
                    className={`aspect-square overflow-hidden rounded border bg-white ${
                      activeImg === media.src ? "border-[#3483fa]" : "border-[#e0e0e0]"
                    }`}
                  >
                    {media.kind === "video" ? (
                      <video src={media.src} muted playsInline className="h-full w-full object-cover" />
                    ) : (
                      <img src={media.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </button>
                ))}
              </div>
              <div className="relative min-w-0 flex-1 overflow-hidden rounded bg-white">
                {activeImg === jacketMarromVideo ? (
                  <video
                    src={activeImg}
                    className="mx-auto aspect-[3/4] w-full max-w-[520px] object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={activeImg}
                    alt={PRODUCT.title}
                    className="mx-auto aspect-[3/4] w-full max-w-[520px] object-cover"
                  />
                )}
                <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white">
                  <Heart className="h-5 w-5 text-[#3483fa]" />
                </button>
              </div>
            </div>
            {/* Mobile thumbnails row */}
            <div className="mt-2 flex gap-2 overflow-x-auto lg:hidden">
              {color.gallery.map((media) => (
                <button
                  key={media.src}
                  onClick={() => setActiveImg(media.src)}
                  className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded border ${
                    activeImg === media.src ? "border-[#3483fa]" : "border-[#e0e0e0]"
                  }`}
                >
                  {media.kind === "video" ? (
                    <video src={media.src} muted playsInline className="h-full w-full object-cover" />
                  ) : (
                    <img src={media.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  )}
                </button>
              ))}
            </div>
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
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="mt-3 inline-flex items-center gap-1 text-[13px] text-[#3483fa] hover:underline"
              >
                <Ruler className="h-3.5 w-3.5" /> Guia de tamanhos
              </button>
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
                <RelatedCard
                  key={p.title}
                  {...p}
                  onSelect={() => selectProduct(p.productIdx)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <SellerCard />
            <PaymentMethodsCard />
          </div>
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
                    <button
                      type="button"
                      onClick={() => setZoomPhoto(r.photo)}
                      className="group relative inline-block overflow-hidden rounded border border-[#eee]"
                    >
                      <img
                        src={r.photo}
                        alt={`Foto enviada por ${r.name}`}
                        loading="lazy"
                        className="h-40 w-40 object-cover"
                      />
                      <span className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#3483fa] shadow transition-transform group-hover:scale-105">
                        <ZoomIn className="h-4 w-4" />
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}
      {zoomPhoto && <ZoomModal src={zoomPhoto} onClose={() => setZoomPhoto(null)} />}
      <div className="h-10" />
    </div>
  );
}

function MercadoCheckout({
  product,
  colorLabel,
  productImage,
  quantity,
  selectedSize,
  onBack,
}: {
  product: Product;
  colorLabel: string;
  productImage: string;
  quantity: number;
  selectedSize: string | null;
  onBack: () => void;
}) {
  const PRODUCT = product;
  const createTx = useServerFn(createHypercashTransaction);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [tx, setTx] = useState<{ id: string; status: string; pix: PixData | null; method: "PIX" | "CREDIT_CARD" } | null>(null);
  const [card, setCard] = useState<CardForm>({
    holderName: "",
    number: "",
    expiry: "",
    cvv: "",
    installments: 1,
  });
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    document: "",
    phone: "",
    zipCode: "",
    street: "",
    streetNumber: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const itemTitle = `${PRODUCT.title}${selectedSize ? ` - Tam. ${selectedSize}` : ""}`;
  const subtotalCents = PRODUCT.price * quantity;
  const shippingCents = 0;
  const totalCents = subtotalCents + shippingCents;

  const identityComplete =
    form.name.trim().length > 2 &&
    /.+@.+\..+/.test(form.email) &&
    onlyDigits(form.document).length === 11 &&
    onlyDigits(form.phone).length >= 10;

  const addressComplete =
    onlyDigits(form.zipCode).length === 8 &&
    form.street.trim().length > 0 &&
    form.streetNumber.trim().length > 0 &&
    form.neighborhood.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.state.trim().length === 2;

  const [expiryMonth, expiryYear] = card.expiry.split("/");
  const cardComplete =
    card.holderName.trim().length > 3 &&
    onlyDigits(card.number).length >= 13 &&
    Number(expiryMonth) >= 1 &&
    Number(expiryMonth) <= 12 &&
    onlyDigits(expiryYear || "").length === 2 &&
    onlyDigits(card.cvv).length >= 3;

  useEffect(() => {
    const cep = onlyDigits(form.zipCode);
    if (cep.length !== 8) return;
    let cancelled = false;
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((response) => response.json())
      .then((data: {
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
        erro?: boolean;
      }) => {
        if (cancelled || data.erro) return;
        setForm((current) => ({
          ...current,
          street: data.logradouro || current.street,
          neighborhood: data.bairro || current.neighborhood,
          city: data.localidade || current.city,
          state: data.uf || current.state,
        }));
      })
      .catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [form.zipCode]);

  function goToDelivery(event: FormEvent) {
    event.preventDefault();
    if (!identityComplete) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToPayment(event: FormEvent) {
    event.preventDefault();
    if (!addressComplete) return;
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const baseTransactionData = {
    items: [
      {
        slug: PRODUCT.id,
        title: itemTitle,
        unitPriceCents: PRODUCT.price,
        quantity,
      },
    ],
    shippingFeeCents: shippingCents,
    customer: {
      name: form.name.trim(),
      email: form.email.trim(),
      document: form.document,
      phone: form.phone,
    },
    address: {
      street: form.street.trim(),
      streetNumber: form.streetNumber.trim(),
      complement: form.complement.trim() || undefined,
      zipCode: form.zipCode,
      neighborhood: form.neighborhood.trim(),
      city: form.city.trim(),
      state: form.state.toUpperCase(),
    },
  };

  async function finishPixPurchase() {
    if (!identityComplete || !addressComplete || loading) return;
    setLoading(true);
    setError(null);
    fbqTrack("AddPaymentInfo", {
      content_ids: [PRODUCT.id],
      content_name: PRODUCT.title,
      value: totalCents / 100,
      currency: "BRL",
      payment_method: "pix",
    });
    try {
      const result = await createTx({
        data: {
          ...baseTransactionData,
          paymentMethod: "PIX",
          externalRef: `mercadopromo-${Date.now()}`,
        },
      });
      setTx({
        id: result.id,
        status: result.status,
        pix: (result.pix as PixData) ?? null,
        method: "PIX",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar o Pix. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function finishCardPurchase() {
    if (!identityComplete || !addressComplete || !cardComplete || loading) return;
    setLoading(true);
    setError(null);
    fbqTrack("AddPaymentInfo", {
      content_ids: [PRODUCT.id],
      content_name: PRODUCT.title,
      value: totalCents / 100,
      currency: "BRL",
      payment_method: "credit_card",
    });
    try {
      const year = 2000 + Number(expiryYear);
      const result = await createTx({
        data: {
          ...baseTransactionData,
          paymentMethod: "CREDIT_CARD",
          card: {
            number: card.number,
            holderName: card.holderName.trim(),
            expirationMonth: Number(expiryMonth),
            expirationYear: year,
            cvv: card.cvv,
            installments: card.installments,
          },
          externalRef: `mercadopromo-card-${Date.now()}`,
        },
      });
      setTx({
        id: result.id,
        status: result.status,
        pix: null,
        method: "CREDIT_CARD",
      });
      fbqTrack("Purchase", {
        content_ids: [PRODUCT.id],
        content_name: PRODUCT.title,
        value: totalCents / 100,
        currency: "BRL",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar o cartão. Confira os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const pixCode = tx?.pix?.qrcode || "";
  const pixImage =
    tx?.pix?.qrcodeBase64
      ? tx.pix.qrcodeBase64.startsWith("data:")
        ? tx.pix.qrcodeBase64
        : `data:image/png;base64,${tx.pix.qrcodeBase64}`
      : tx?.pix?.qrcodeUrl
        ? tx.pix.qrcodeUrl
        : pixCode
          ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixCode)}`
          : null;

  async function copyPix() {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Não foi possível copiar automaticamente. Selecione o código Pix na tela.");
    }
  }
  const promoStyle = (
    <style>{`
      .mercado-promo-page,
      .mercado-promo-page h1,
      .mercado-promo-page h2,
      .mercado-promo-page h3 {
        font-family: "Proxima Nova", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
        letter-spacing: 0 !important;
        text-transform: none !important;
      }
    `}</style>
  );

  // Pix gerado → tela dedicada, sem sidebar/summary, só header ML + painel PIX
  if (tx?.method === "PIX") {
    return (
      <div className="mercado-promo-page min-h-screen bg-white text-[#001133]">
        {promoStyle}
        <CheckoutHeader onBack={onBack} />
        <main className="mx-auto w-full max-w-[640px] px-4 py-6 md:py-10">
          <div className="rounded-md border border-[#d9e0ea] bg-white p-6 shadow-sm md:p-8">
            <PixPaymentPanel
              pixCode={pixCode}
              pixImage={pixImage}
              copied={copied}
              onCopy={copyPix}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mercado-promo-page min-h-screen bg-white text-[#001133]">
      {promoStyle}
      <CheckoutHeader onBack={onBack} />
      <main className="mx-auto grid w-full max-w-[1040px] gap-4 px-3 py-4 md:grid-cols-[minmax(0,1fr)_340px] md:gap-6 md:px-4 md:py-6 lg:max-w-[1120px] lg:grid-cols-[338px_minmax(0,1fr)_340px]">
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-md border border-[#d9e0ea] bg-white px-4 py-3 text-left shadow-sm"
          >
            <span className="font-semibold">Resumo do pedido</span>
            <span className="inline-flex items-center gap-2 font-semibold text-[#111]">
              {formatBRL(totalCents)}
              <ChevronDown className={`h-4 w-4 transition-transform ${summaryOpen ? "rotate-180" : ""}`} />
            </span>
          </button>
          {summaryOpen && (
            <div className="mt-2">
              <OrderSummary
                productImage={productImage}
                itemTitle={itemTitle}
                colorLabel={colorLabel}
                quantity={quantity}
                subtotalCents={subtotalCents}
                shippingCents={shippingCents}
                totalCents={totalCents}
                compact
              />
            </div>
          )}
        </div>

        <section className="space-y-4 lg:col-start-1">
          {step > 1 && (
            <CompletedCard title="Identificação" onEdit={() => setStep(1)}>
              <strong>{form.name}</strong>
              <span>{form.email}</span>
              <span>{form.phone}</span>
            </CompletedCard>
          )}
          {step > 2 && (
            <CompletedCard title="Enviar para" onEdit={() => setStep(2)}>
              <span>
                {form.street}, {form.streetNumber}
                {form.complement ? ` - ${form.complement}` : ""}
              </span>
              <span>
                {form.neighborhood}, {form.city}/{form.state.toUpperCase()} {form.zipCode}
              </span>
              <span className="mt-3 font-semibold">Frete selecionado</span>
              <span>Envio - Grátis</span>
            </CompletedCard>
          )}
        </section>

        <section className="md:col-start-1 lg:col-start-2">
          {step === 1 && (
            <form onSubmit={goToDelivery} className="rounded-md border border-[#d9e0ea] bg-white p-6 shadow-sm">
              <StepTitle title="Identificação" step="1 de 3" subtitle="Preencha seus dados para envio do pedido." />
              <div className="mt-8 space-y-5">
                <CheckoutField label="Nome completo">
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Digite seu nome completo"
                    className={checkoutInputClass}
                  />
                </CheckoutField>
                <CheckoutField label="E-mail">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="Digite seu e-mail"
                    className={checkoutInputClass}
                  />
                </CheckoutField>
                <CheckoutField
                  label={
                    <span className="inline-flex items-center gap-1">
                      CPF <Info className="h-4 w-4" />
                    </span>
                  }
                >
                  <input
                    value={form.document}
                    onChange={(event) => setForm({ ...form, document: maskCPF(event.target.value) })}
                    placeholder="000.000.000-00"
                    className={`${checkoutInputClass} max-w-[242px]`}
                  />
                </CheckoutField>
                <CheckoutField label="Celular/Whatsapp">
                  <input
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: maskPhone(event.target.value) })}
                    placeholder="+55   (00) 00000-0000"
                    className={`${checkoutInputClass} max-w-[242px]`}
                  />
                </CheckoutField>
                <button
                  type="submit"
                  disabled={!identityComplete}
                  className="w-full rounded-md bg-[#1675f8] py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0b63d8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ir Para Entrega
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={goToPayment} className="rounded-md border border-[#d9e0ea] bg-white p-6 shadow-sm">
              <StepTitle title="Entrega" step="2 de 3" subtitle="Informe o endereço de entrega" />
              <div className="mt-6 space-y-5">
                <CheckoutField label="CEP">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative max-w-[180px] flex-1">
                      <input
                        value={form.zipCode}
                        onChange={(event) => setForm({ ...form, zipCode: maskCEP(event.target.value) })}
                        placeholder="00000-000"
                        className={`${checkoutInputClass} bg-[#eef4ff] pr-10`}
                      />
                      {onlyDigits(form.zipCode).length === 8 && <Check className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00a650]" />}
                    </div>
                    {form.city && form.state && (
                      <span className="text-[12px] font-semibold text-[#333]">{form.state}/{form.city}</span>
                    )}
                  </div>
                </CheckoutField>

                <CheckoutField label="Endereço">
                  <div className="relative">
                    <input
                      value={form.street}
                      onChange={(event) => setForm({ ...form, street: event.target.value })}
                      placeholder="Rua, avenida ou travessa"
                      className={`${checkoutInputClass} bg-[#eef4ff] pr-10`}
                    />
                    {form.street && <Check className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00a650]" />}
                  </div>
                </CheckoutField>

                <div className="grid grid-cols-[68px_minmax(0,1fr)] gap-3">
                  <CheckoutField label="N°">
                    <input
                      value={form.streetNumber}
                      onChange={(event) => setForm({ ...form, streetNumber: event.target.value })}
                      placeholder="Número"
                      className={`${checkoutInputClass} ${form.streetNumber ? "bg-[#eef4ff]" : "border-[#ff8ba1] bg-[#ffe9ee] text-[#d62850]"}`}
                    />
                    {!form.streetNumber && <div className="mt-1 text-[11px] text-[#d62850]">Número é obrigatório</div>}
                  </CheckoutField>
                  <CheckoutField label="Bairro">
                    <div className="relative">
                      <input
                        value={form.neighborhood}
                        onChange={(event) => setForm({ ...form, neighborhood: event.target.value })}
                        placeholder="Bairro"
                        className={`${checkoutInputClass} bg-[#eef4ff] pr-10`}
                      />
                      {form.neighborhood && <Check className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00a650]" />}
                    </div>
                  </CheckoutField>
                </div>

                <CheckoutField label={<span>Complemento <span className="text-[11px] font-normal text-[#777]">(Opcional)</span></span>}>
                  <input
                    value={form.complement}
                    onChange={(event) => setForm({ ...form, complement: event.target.value })}
                    className={checkoutInputClass}
                  />
                </CheckoutField>

                <div>
                  <h3 className="text-[16px] font-semibold text-[#001133]">Escolha o frete:</h3>
                  <button
                    type="button"
                    className="mt-3 flex w-full items-center justify-between rounded-md border border-[#1675f8] px-4 py-3 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#1675f8]">
                        <span className="h-2 w-2 rounded-full bg-[#1675f8]" />
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold">Envio</span>
                        <span className="text-[11px] text-[#667085]">2 a 5 dias <b className="text-[#00a650]">FULL</b></span>
                      </span>
                    </span>
                    <span className="text-[13px] font-semibold">Grátis</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!addressComplete}
                  className="w-full rounded-md bg-[#1675f8] py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0b63d8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ir Para Pagamento
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="rounded-md border border-[#d9e0ea] bg-white p-6 shadow-sm">
              <StepTitle title="Pagamento" step="3 de 3" subtitle="Todas as transações são seguras e criptografadas." />
              {tx?.method === "CREDIT_CARD" ? (
                <CardApprovedPanel status={tx.status} totalCents={totalCents} installments={card.installments} />
              ) : (
                <div className="mt-6 space-y-5">
                  <PaymentChoice
                    selected={paymentMethod === "PIX"}
                    onClick={() => setPaymentMethod("PIX")}
                    icon={<img src={pixLogo} alt="" className="h-5 w-5" />}
                    title="PIX"
                  />
                  {paymentMethod === "PIX" && (
                    <div className="rounded-md border border-[#1675f8] p-4">
                      <div className="text-[14px] leading-relaxed text-[#667085]">
                        <p>O código Pix expira em 30 minutos após finalizar a compra.</p>
                        <p className="mt-4">Valor no Pix: <b>{formatBRL(totalCents)}</b></p>
                      </div>
                      <button
                        type="button"
                        onClick={finishPixPurchase}
                        disabled={loading}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#1675f8] py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0b63d8] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Finalizar Compra
                      </button>
                    </div>
                  )}

                  <PaymentChoice
                    selected={paymentMethod === "CREDIT_CARD"}
                    onClick={() => setPaymentMethod("CREDIT_CARD")}
                    icon={<CreditCard className="h-4 w-4 text-[#667085]" />}
                    title="Cartão de crédito"
                  />
                  {paymentMethod === "CREDIT_CARD" && (
                    <div className="rounded-md border border-[#1675f8] p-4">
                      <div className="grid gap-4">
                        <CheckoutField label="Nome impresso no cartão">
                          <input
                            value={card.holderName}
                            onChange={(event) => setCard({ ...card, holderName: event.target.value.toUpperCase() })}
                            placeholder="NOME COMPLETO"
                            className={checkoutInputClass}
                          />
                        </CheckoutField>
                        <CheckoutField label="Número do cartão">
                          <input
                            inputMode="numeric"
                            value={card.number}
                            onChange={(event) => setCard({ ...card, number: maskCardNumber(event.target.value) })}
                            placeholder="0000 0000 0000 0000"
                            className={checkoutInputClass}
                          />
                        </CheckoutField>
                        <div className="grid grid-cols-2 gap-3">
                          <CheckoutField label="Validade">
                            <input
                              inputMode="numeric"
                              value={card.expiry}
                              onChange={(event) => setCard({ ...card, expiry: maskCardExpiry(event.target.value) })}
                              placeholder="MM/AA"
                              className={checkoutInputClass}
                            />
                          </CheckoutField>
                          <CheckoutField label="CVV">
                            <input
                              inputMode="numeric"
                              value={card.cvv}
                              onChange={(event) => setCard({ ...card, cvv: onlyDigits(event.target.value).slice(0, 4) })}
                              placeholder="000"
                              className={checkoutInputClass}
                            />
                          </CheckoutField>
                        </div>
                        <CheckoutField label="Parcelas">
                          <select
                            value={card.installments}
                            onChange={(event) => setCard({ ...card, installments: Number(event.target.value) })}
                            className={checkoutInputClass}
                          >
                            {Array.from({ length: 12 }).map((_, index) => {
                              const installments = index + 1;
                              const installmentValue = Math.ceil(totalCents / installments);
                              return (
                                <option key={installments} value={installments}>
                                  {installments}x de {formatBRL(installmentValue)}
                                </option>
                              );
                            })}
                          </select>
                        </CheckoutField>
                      </div>
                      <button
                        type="button"
                        onClick={finishCardPurchase}
                        disabled={!cardComplete || loading}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#1675f8] py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0b63d8] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Pagar com cartão
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 rounded-md bg-[#fff1f0] p-3 text-[13px] text-[#d93025]">
                      <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="hidden md:block lg:col-start-3">
          <OrderSummary
            productImage={productImage}
            itemTitle={itemTitle}
            colorLabel={colorLabel}
            quantity={quantity}
            subtotalCents={subtotalCents}
            shippingCents={shippingCents}
            totalCents={totalCents}
          />
        </aside>
      </main>
    </div>
  );
}

function PaymentChoice({
  selected,
  onClick,
  icon,
  title,
}: {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md border p-4 text-left text-[14px] font-semibold transition ${
        selected ? "border-[#1675f8] bg-white" : "border-[#d9e0ea] bg-white hover:border-[#9dbcf7]"
      }`}
    >
      <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${selected ? "border-[#1675f8]" : "border-[#667085]"}`}>
        {selected && <span className="h-2 w-2 rounded-full bg-[#1675f8]" />}
      </span>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f7fb]">{icon}</span>
      {title}
    </button>
  );
}



function PixPaymentPanel({
  pixCode,
  pixImage,
  copied,
  onCopy,
}: {
  pixCode: string;
  pixImage: string | null;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-6 text-center">
      <h2 className="text-[28px] font-semibold text-[#333]">Quase lá...</h2>
      <p className="mt-3 text-[14px] text-[#526173]">
        Pague via pix em até <b>05:52</b> para confirmar seu pedido.
      </p>
      <div className="mx-auto mt-4 inline-flex rounded-full bg-[#fff3cd] px-6 py-2 text-[13px] font-semibold text-[#a36b00]">
        Aguardando pagamento
      </div>
      <div className="mx-auto mt-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#f5f5f5]">
        <div className="relative h-20 w-12 rounded-[16px] border-[5px] border-[#111] bg-white shadow-sm">
          <img src={pixLogo} alt="Pix" className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2" />
          <span className="absolute -left-8 top-7 h-8 w-8 rounded-full bg-[#ff977d]" />
          <span className="absolute -right-7 top-10 h-5 w-8 rounded-full bg-[#ff977d]" />
        </div>
      </div>
      <p className="mt-7 text-[14px] text-[#526173]">Aponte a câmera do seu celular</p>
      {pixImage && (
        <img src={pixImage} alt="QR Code Pix" className="mx-auto mt-3 h-56 w-56 bg-white object-contain md:h-64 md:w-64" />
      )}
      {pixCode && (
        <>
          <div className="mx-auto mt-5 max-h-14 max-w-[356px] overflow-hidden rounded-md border border-[#e1e6ef] bg-[#fafafa] px-3 py-3 text-left text-[12px] text-[#a0a8b8]">
            {pixCode}
          </div>
          <button
            type="button"
            onClick={onCopy}
            className="mx-auto mt-3 flex w-full max-w-[356px] items-center justify-center gap-2 rounded-md border border-[#d9e0ea] bg-white py-3 text-[14px] font-semibold text-[#111] shadow-sm"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Código copiado" : "Copiar código"}
          </button>
        </>
      )}
      <div className="mx-auto mt-8 max-w-[356px] text-left">
        <h3 className="text-[18px] font-semibold text-[#1d2733]">Como pagar o pix</h3>
        {[
          "Clique em copiar o código, logo acima",
          "Abra o aplicativo do seu banco",
          "Selecione a opção PIX",
          'Toque em "Pix Copia e Cola"',
          "Insira o código copiado e finalize seu pagamento",
        ].map((step, index) => (
          <div key={step} className="mt-4 flex items-start gap-3 text-[13px] text-[#526173]">
            <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#16bf8f] text-[12px] font-semibold text-white">{index + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
      <div className="-mx-6 mt-10 border-t border-[#eef1f6] bg-[#f7f8fb] px-4 py-8">
        <PaymentFooter />
      </div>
    </div>
  );
}

function CardApprovedPanel({
  status,
  totalCents,
  installments,
}: {
  status: string;
  totalCents: number;
  installments: number;
}) {
  return (
    <div className="mt-6 rounded-md border border-[#00a650] bg-[#f8fff9] p-6 text-center">
      <Check className="mx-auto h-12 w-12 rounded-full bg-[#00a650] p-2 text-white" />
      <h2 className="mt-4 text-[22px] font-semibold text-[#001133]">Pagamento enviado!</h2>
      <p className="mt-2 text-[14px] text-[#526173]">
        Recebemos sua solicitação no cartão em {installments}x de {formatBRL(Math.ceil(totalCents / installments))}.
      </p>
      <p className="mt-1 text-[12px] text-[#667085]">Status da transação: {status}</p>
      <div className="mt-6 border-t border-[#d8efdf] pt-5">
        <PaymentFooter />
      </div>
    </div>
  );
}

function PaymentFooter({ light = false }: { light?: boolean }) {
  const textClass = light ? "text-white/85" : "text-[#9aa3b5]";
  const boxClass = light ? "border-white/25 bg-white/15 text-white" : "border-[#e1e6ef] bg-white text-[#111]";
  return (
    <footer className={`text-center text-[12px] leading-relaxed ${textClass}`}>
      <p>Mercado Livre | Todos os direitos reservados</p>
      <p className="mt-2">Rua Elson Costa, 173 C - Bairro das indústrias Belo Horizonte - Minas Gerais</p>
      <p>© 2026 Mercado Livre - CNPJ: 47.130.874/0001-05</p>
      <p>Telefone: +55 (11) 3368-5599</p>
      <p className="mt-3 text-[14px]">Formas de pagamento:</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {[ { name: "American Express", src: payAmex }, { name: "Elo", src: payElo }, { name: "Visa", src: payVisa }, { name: "Mastercard", src: payMastercard }, { name: "Pix", src: payPix } ].map((method) => (
          <span key={method.name} className={`inline-flex h-6 min-w-10 items-center justify-center rounded border px-2 ${boxClass}`}>
            <img src={method.src} alt={method.name} className="h-4 w-auto" />
          </span>
        ))}
      </div>
      <div className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold">
        <Lock className="h-4 w-4" />
        <span>
          PAGAMENTO
          <br />
          100% SEGURO
        </span>
      </div>
    </footer>
  );
}

function CheckoutHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="bg-[#fff159]">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-4 py-3 md:py-4">
        <button type="button" onClick={onBack} className="flex items-center">
          <img src={mlLogo} alt="Mercado Livre" className="h-9 w-auto md:h-11" draggable={false} />
        </button>
        <div className="flex items-center gap-2 text-right text-[11px] font-semibold leading-tight text-[#111]">
          <Lock className="h-4 w-4" />
          <span>
            PAGAMENTO
            <br />
            <span className="font-normal">100% SEGURO</span>
          </span>
        </div>
      </div>
    </header>
  );
}

function StepTitle({ title, step, subtitle }: { title: string; step: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-[20px] font-semibold text-[#001133]">{title}</h1>
        <p className="mt-1 text-[14px] text-[#001133]">{subtitle}</p>
      </div>
      <span className="mt-1 whitespace-nowrap text-[13px] font-semibold text-[#001133]">{step}</span>
    </div>
  );
}

function CheckoutField({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-semibold text-[#001133]">{label}</span>
      {children}
    </label>
  );
}

const checkoutInputClass =
  "h-[46px] w-full rounded-md border border-[#d4d9e2] bg-white px-3 text-[14px] text-[#001133] outline-none transition placeholder:text-[#667085] focus:border-[#1675f8]";

function CompletedCard({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-md border border-[#00a650] bg-[#f8fff9] p-6 text-[13px] text-[#001133] shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold">{title}</h2>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-[12px] text-[#667085]">
          Editar <Edit3 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function OrderSummary({
  productImage,
  itemTitle,
  colorLabel,
  quantity,
  subtotalCents,
  shippingCents,
  totalCents,
  compact = false,
}: {
  productImage: string;
  itemTitle: string;
  colorLabel: string;
  quantity: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-md border border-[#d9e0ea] bg-white p-5 shadow-sm ${compact ? "" : "sticky top-4"}`}>
      <h2 className="text-[16px] font-semibold text-[#001133]">Resumo do pedido</h2>
      <button type="button" className="mt-5 inline-flex items-center gap-2 text-[14px] text-[#00a650]">
        <Ticket className="h-4 w-4" />
        Inserir cupom de desconto
      </button>
      <div className="mt-4 space-y-2 border-b border-[#e5e9f0] pb-4 text-[14px]">
        <div className="flex justify-between">
          <span>Produtos</span>
          <span>{formatBRL(subtotalCents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Frete</span>
          <span className="text-[#00a650]">{shippingCents ? formatBRL(shippingCents) : "Grátis"}</span>
        </div>
        <div className="flex justify-between pt-1 text-[16px] font-semibold">
          <span>Total</span>
          <span>{formatBRL(totalCents)}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <img src={productImage} alt={itemTitle} className="h-12 w-12 rounded-md border border-[#e5e9f0] object-cover" />
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-[13px] leading-tight">{itemTitle}</div>
          <div className="mt-1 text-[12px] text-[#667085]">Cor {colorLabel}</div>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-semibold">{formatBRL(totalCents)}</div>
          <div className="mt-2 grid h-8 grid-cols-3 overflow-hidden rounded border border-[#d9e0ea] text-[13px] text-[#667085]">
            <button type="button" className="px-2">-</button>
            <span className="grid place-items-center px-2 text-[#001133]">{quantity}</span>
            <button type="button" className="px-2">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Header ----------------
function MLHeader() {
  const [destination, setDestination] = useState("Casa");

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentLocation() {
      if (!("geolocation" in navigator)) return;

      const permissions = navigator.permissions;
      if (permissions?.query) {
        try {
          const status = await permissions.query({ name: "geolocation" as PermissionName });
          if (status.state !== "granted") return;
        } catch {
          return;
        }
      }

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=pt-BR`,
            );
            const data = (await response.json()) as {
              city?: string;
              locality?: string;
              principalSubdivision?: string;
              postcode?: string;
            };
            if (cancelled) return;
            const city = data.city || data.locality || data.principalSubdivision;
            const postcode = data.postcode ? ` ${data.postcode}` : "";
            if (city) setDestination(`${city}${postcode}`);
          } catch {
            if (!cancelled) setDestination("Casa");
          }
        },
        () => {
          if (!cancelled) setDestination("Casa");
        },
        { maximumAge: 30 * 60 * 1000, timeout: 3500 },
      );
    }

    loadCurrentLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="bg-[#fff159]">
      <div className="mx-auto max-w-[1200px] px-3 pb-3 pt-3 md:px-4 md:pb-0">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:flex md:gap-6">
          {/* Logo */}
          <a href="/mercadopromo" className="flex-shrink-0">
            <img
              src={mlLogo}
              alt="Mercado Livre"
              className="h-8 w-auto md:h-10"
              draggable={false}
            />
          </a>

          {/* Search */}
          <div className="order-3 col-span-3 mt-1 flex min-w-0 flex-1 items-center rounded bg-white shadow-sm md:order-none md:col-span-1 md:mt-0">
            <input
              type="search"
              placeholder="Buscar produtos, marcas e muito mais..."
              className="min-w-0 flex-1 rounded-l bg-transparent px-3 py-3 text-[14px] text-[#333] outline-none placeholder:text-[#999] md:py-2.5"
            />
            <button className="p-2 pr-3 text-[#999]">
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* CTA + cart */}
          <div className="contents md:flex md:items-center md:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-[#3483fa] bg-white px-3 py-1 text-[12px] text-[#333] lg:flex">
              <span className="font-semibold text-[#3483fa]">ASSINE AGORA</span>
              <span className="rounded-full bg-[#00c58f] px-1.5 text-[10px] font-bold text-white">GRÁTIS</span>
              <span className="font-semibold">MELI+</span>
              <span className="text-[10px] text-[#666]">
                A PARTIR DE <b className="text-[#333]">R$ 9,90/MÊS</b>
              </span>
            </div>
            <button className="justify-self-end text-[#333]">
              <ShoppingCart className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Row 2 */}
        <div className="mt-2 hidden items-center gap-4 pb-2 text-[13px] text-[#333] md:flex">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="text-[#666]">
              Enviar para{" "}
              {destination === "Casa" ? (
                "Casa"
              ) : (
                <b className="text-[#333]">{destination}</b>
              )}
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
        </div>
      </div>
    </header>
  );
}

// ---------------- Related product cards ----------------
function RelatedCard(p: RelatedProduct & { onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={p.onSelect}
      className="flex flex-col overflow-hidden rounded border border-[#eee] bg-white p-3 text-left transition hover:border-[#3483fa] hover:shadow-sm"
    >
      <div className="aspect-square overflow-hidden rounded">
        <img src={p.img} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {p.gallery.slice(1).map((src) => (
          <div key={src} className="aspect-square overflow-hidden rounded border border-[#eee]">
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      <p className="mt-3 line-clamp-2 text-[13px] text-[#333]">{p.title}</p>
      <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-[#666]">{p.description}</p>
      <div className="mt-2 text-[18px] text-[#333]">{formatBRL(p.priceCents)}</div>
      <div className="text-[12px] text-[#00a650]">{p.installments}</div>
      {p.freeShip && <div className="mt-1 text-[12px] font-semibold text-[#00a650]">Frete grátis</div>}
    </button>
  );
}


function SizeGuideModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 px-3 py-8 md:py-12">
      <div className="w-full max-w-[760px] rounded-md bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eee] px-6 py-4">
          <h2 className="text-[26px] font-semibold text-[#111]">Guia de tamanhos</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia de tamanhos"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#3483fa] hover:bg-[#f2f6ff]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-6 grid grid-cols-2 border-b border-[#e6e6e6] text-center text-[14px]">
            <div className="pb-2 text-[#bbb]">
              Do corpo
              <div className="mx-auto mt-1 w-fit rounded-full bg-[#eee] px-3 py-0.5 text-[10px] text-[#777]">
                Guia não disponível
              </div>
            </div>
            <div className="border-b-2 border-[#3483fa] pb-3 font-medium text-[#3483fa]">Da peça</div>
          </div>

          <h3 className="text-[16px] font-semibold text-[#333]">Tabela de medidas para peças</h3>
          <p className="mt-2 text-[13px] text-[#777]">
            As medidas estão em centímetros e podem variar conforme o modelo.
          </p>

          <div className="mt-4 overflow-hidden rounded-md border border-[#ddd]">
            <table className="w-full border-collapse text-center text-[12px] text-[#333]">
              <thead>
                <tr className="bg-[#f5f5f5]">
                  <th className="bg-[#dce9fb] px-3 py-4 font-semibold">Tamanho na etiqueta</th>
                  <th className="px-3 py-4 font-semibold">Equivalências</th>
                  <th className="px-3 py-4 font-semibold">Largura do peito</th>
                  <th className="px-3 py-4 font-semibold">Altura da peça</th>
                  <th className="px-3 py-4 font-semibold">Largura dos ombros</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row) => (
                  <tr key={row.label} className="border-t border-[#ddd]">
                    <td className="bg-[#dce9fb] px-3 py-4 font-medium text-[#0b1f3f]">{row.label}</td>
                    <td className="px-3 py-4">{row.equivalent}</td>
                    <td className="px-3 py-4">{row.chest}</td>
                    <td className="px-3 py-4">{row.height}</td>
                    <td className="px-3 py-4">{row.shoulders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-7">
            <h3 className="text-[16px] font-semibold text-[#333]">Como medir suas peças</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#777]">
              Coloque a peça sobre uma superfície plana. Meça a largura do peito de axila a axila,
              a altura da peça do ombro até a barra e a largura dos ombros de ponta a ponta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoomModal({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div className="relative max-h-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar imagem ampliada"
          className="absolute -right-2 -top-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#3483fa] shadow-lg hover:bg-[#f5f5f5]"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src={src}
          alt="Foto ampliada do comprador"
          className="max-h-[86vh] max-w-full rounded-md bg-white object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}

function SellerCard() {
  return (
    <aside className="rounded-md border border-[#e6e6e6] p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-[#eee]">
          <img
            src={SELLER.image}
            alt={SELLER.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold text-[#333]">{SELLER.name}</div>
          <div className="text-[12px] text-[#666]">+1000 Seguidores &nbsp; +500 Produtos</div>
        </div>
        <button className="rounded border border-[#3483fa] px-3 py-1 text-[12px] text-[#3483fa] hover:bg-[#e6f0ff]">
          Seguir
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[13px] text-[#00a650]">
        <img src={SELLER.medal} alt="" className="h-5 w-5" loading="lazy" />
        MercadoLíder Platinum
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
          <div className="font-semibold text-[#333]">ðŸ‘</div>
          Bom atendimento
        </div>
        <div>
          <div className="font-semibold text-[#333]">â±</div>
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
        {PAYMENT_METHODS.credit.map((method) => (
          <span key={method.name} className="inline-flex h-8 items-center justify-center rounded border border-[#eee] bg-white px-2">
            <img src={method.src} alt={method.name} className="h-5 max-w-[48px]" loading="lazy" />
          </span>
        ))}
      </div>
      <div className="mt-4 text-[13px] text-[#333]">Pix</div>
      <div className="mt-2">
        <span className="inline-flex h-8 items-center justify-center rounded border border-[#eee] bg-white px-2">
          <img src={PAYMENT_METHODS.pix.src} alt={PAYMENT_METHODS.pix.name} className="h-5 max-w-[48px]" loading="lazy" />
        </span>
      </div>
      <a href="#" className="mt-4 inline-block text-[13px] text-[#3483fa] hover:underline">
        Confira outros meios de pagamento
      </a>
    </aside>
  );
}

