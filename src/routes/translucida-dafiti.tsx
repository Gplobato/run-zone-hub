import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { fbqTrackSingle, fbqTrackPageViewOnce, META_PIXEL_ID } from "@/lib/pixel";
import {
  Sparkles,
  Check,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Star,
  Lock,
  Heart,
  Search,
  ShoppingBag,
  Info,
  Droplets,
  Layers,
  Feather,
  MapPin,
  Loader2,
  RefreshCw,
  Award,
} from "lucide-react";

// Assets
import dafitiLogo from "@/assets/dafiti-logo.png";
import translucidaBranca1 from "@/assets/mercadopromo/translucida-branca-1.jpg";
import translucidaBranca2 from "@/assets/mercadopromo/translucida-branca-2.jpg";
import translucidaBranca3 from "@/assets/mercadopromo/translucida-branca-3.jpg";
import translucidaMarrom1 from "@/assets/mercadopromo/translucida-marrom-1.jpg";
import translucidaMarrom2 from "@/assets/mercadopromo/translucida-marrom-2.jpg";
import translucidaMarrom3 from "@/assets/mercadopromo/translucida-marrom-3.jpg";
import translucidaRosa1 from "@/assets/mercadopromo/translucida-rosa-1.jpg";
import translucidaRosa2 from "@/assets/mercadopromo/translucida-rosa-2.jpg";
import translucidaRosa3 from "@/assets/mercadopromo/translucida-rosa-3.jpg";
import translucidaPreta1 from "@/assets/mercadopromo/translucida-preta-1.jpg";
import translucidaPreta2 from "@/assets/mercadopromo/translucida-preta-2.jpg";
import translucidaPreta3 from "@/assets/mercadopromo/translucida-preta-3.png";
import translucidaPromoBanner from "@/assets/mercadopromo/translucida-promo-banner.jpg";

const PRODUCT_NAME = "Sandália Translúcida Jelly Mule Feminina";
const BRAND_NAME = "DAFITI SHOES";
const PRICE_PIX = 49.9;
const PRICE_CARD = 49.9;
const PRICE_OLD = 189.9;
const SHIPPING_FEE = 9.9;

const COLORS = [
  {
    id: "cristal",
    name: "Cristal Translúcida",
    hex: "#e2e8f0",
    images: [translucidaBranca1, translucidaBranca2, translucidaBranca3],
  },
  {
    id: "marrom",
    name: "Âmbar / Marrom Translúcido",
    hex: "#78350f",
    images: [translucidaMarrom1, translucidaMarrom2, translucidaMarrom3],
  },
  {
    id: "rosa",
    name: "Quartzo Rosa Translúcido",
    hex: "#f472b6",
    images: [translucidaRosa1, translucidaRosa2, translucidaRosa3],
  },
  {
    id: "preta",
    name: "Fumê / Preto Translúcido",
    hex: "#18181b",
    images: [translucidaPreta1, translucidaPreta2, translucidaPreta3],
  },
];

const SIZES = ["33", "34", "35", "36", "37", "38", "39", "40", "41", "42"];

const maskCEP = (v: string) =>
  (v || "")
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");

const REVIEWS = [
  {
    name: "Fernanda Lima",
    city: "São Paulo, SP",
    rating: 5,
    when: "há 2 dias",
    text: "Simplesmente deslumbrante! O material translúcido é super macio e flexível, não machuca nada o calcanhar nem aperta os dedos. O salto bloco de 5cm dá uma estabilidade maravilhosa para passar o dia inteiro em pé. Chegou super rápido pelos Correios.",
  },
  {
    name: "Juliana Mendes",
    city: "Rio de Janeiro, RJ",
    rating: 5,
    when: "há 4 dias",
    text: "Comprei a Âmbar (marrom) e a Cristal. Elas são absurdamente sofisticadas pessoalmente! As tramas vazadas deixam o pé fresco no calor e combinam com tudo, desde alfaiataria até vestidos longos fluidos. O acabamento é impecável.",
  },
  {
    name: "Camila Rodrigues",
    city: "Belo Horizonte, MG",
    rating: 5,
    when: "há 1 semana",
    text: "Amei o conforto da palmilha acolchoada. A sensação é de leveza absoluta. A transparência dá uma alongada incrível nas pernas e o calce é super prático. Vale cada centavo, recomendo de olhos fechados!",
  },
];

const CATEGORIES = [
  "FEMININO",
  "CALÇADOS",
  "SANDÁLIAS",
  "ROUPAS",
  "BOLSAS",
  "MARCAS",
  "PREMIUM",
  "OUTLET",
];

export const Route = createFileRoute("/translucida-dafiti")({
  head: () => ({
    meta: [
      { title: `${PRODUCT_NAME} | DAFITI Brasil` },
      {
        name: "description",
        content: "Compre Sandália Translúcida Jelly Mule Feminina na Dafiti Brasil. 5% de desconto no PIX e Entrega Express Correios.",
      },
    ],
  }),
  component: DafitiTranslúcidaPDP,
});

function DafitiTranslúcidaPDP() {
  const navigate = useNavigate();

  const [selectedColorId, setSelectedColorId] = useState("cristal");
  const [selectedSize, setSelectedSize] = useState<string | null>("36");
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [descOpen, setDescOpen] = useState(true);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);

  // CEP Calculator State
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [shippingChecked, setShippingChecked] = useState(false);
  const [cepAddress, setCepAddress] = useState<{
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  } | null>(null);
  const [cepError, setCepError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const currentColor = useMemo(
    () => COLORS.find((c) => c.id === selectedColorId) || COLORS[0],
    [selectedColorId]
  );

  useEffect(() => {
    try {
      fbqTrackPageViewOnce(META_PIXEL_ID);
      fbqTrackSingle(META_PIXEL_ID, "ViewContent", {
        content_name: PRODUCT_NAME,
        value: PRICE_PIX,
        currency: "BRL",
      });
    } catch {}
  }, []);

  const handleCalculateCep = async () => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      setCepError("Informe um CEP válido com 8 dígitos.");
      return;
    }
    setCepError(null);
    setCepLoading(true);
    setShippingChecked(false);

    try {
      // Pequeno delay realista
      await new Promise((resolve) => setTimeout(resolve, 800));

      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado. Verifique os números digitados.");
        setCepAddress(null);
      } else {
        setCepAddress({
          street: data.logradouro || "Endereço principal",
          neighborhood: data.bairro || "Bairro atendido",
          city: data.localidade || "",
          state: data.uf || "",
        });
        setShippingChecked(true);
      }
    } catch {
      setCepError("Erro ao calcular o frete. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleBuy = () => {
    if (!selectedSize) {
      setError("Por favor, selecione seu tamanho.");
      return;
    }
    setError(null);

    try {
      fbqTrackSingle(META_PIXEL_ID, "InitiateCheckout", {
        content_name: PRODUCT_NAME,
        value: PRICE_PIX,
        currency: "BRL",
      });
    } catch {}

    navigate({
      to: "/checkout-dafiti",
      search: { cor: selectedColorId, tam: selectedSize },
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans text-[#222] antialiased">
      {/* POPUP DE CONDIÇÃO ESPECIAL (DAFITI) */}
      {welcomeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setWelcomeOpen(false)}
        >
          <div
            className="w-full max-w-[430px] bg-white p-6 shadow-2xl sm:p-7 animate-in slide-in-from-bottom-5 duration-300 rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="bg-black px-3 py-1 rounded-md inline-block">
                <img src={dafitiLogo} alt="Dafiti" className="h-4 w-auto object-contain" />
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                OFERTA EXCLUSIVA
              </span>
            </div>

            <h2 className="mt-3 text-[19px] font-black leading-snug text-gray-900">
              Condição Especial no App &amp; Site
            </h2>

            <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-gray-700">
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>
                  <strong className="text-gray-900">5% OFF no PIX</strong> — já aplicado no valor à vista de R$ 49,90.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>
                  <strong className="text-gray-900">Frete por apenas R$ 9,90</strong> com código de rastreamento oficial.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Primeira troca grátis em até 30 dias após o recebimento.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Parcele em até 6x sem juros no cartão de crédito.</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => setWelcomeOpen(false)}
              className="mt-6 h-[50px] w-full bg-black text-[12px] font-black tracking-[0.15em] text-white uppercase rounded-xl transition-transform active:scale-95 shadow-md"
            >
              QUERO APROVEITAR A OFERTA
            </button>
            <button
              type="button"
              onClick={() => setWelcomeOpen(false)}
              className="mt-2 h-[34px] w-full text-[12px] text-gray-400 hover:text-black font-medium"
            >
              Continuar navegando
            </button>
          </div>
        </div>
      )}

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold py-2 px-4 text-center tracking-[0.15em] uppercase flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-amber-400 shrink-0" />
        <span>5% DE DESCONTO EXCLUSIVO NO PIX</span>
      </div>

      {/* DAFITI MAIN HEADER */}
      <header className="sticky top-0 z-40 bg-black text-white border-b border-neutral-800 shadow-md">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* DAFITI WHITE PILL LOGO IN BLACK HEADER */}
          <div className="flex items-center gap-6">
            <div className="cursor-pointer flex items-center">
              <img
                src={dafitiLogo}
                alt="Dafiti"
                className="h-7 sm:h-8 w-auto object-contain brightness-110"
              />
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar sandálias, marcas, roupas..."
                className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-full py-2 pl-4 pr-10 text-xs outline-none focus:border-white focus:bg-neutral-800 placeholder-neutral-400 transition-all"
              />
              <Search
                size={16}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 cursor-pointer hover:text-white"
              />
            </div>
          </div>

          {/* USER ACTIONS */}
          <div className="flex items-center gap-5 text-xs font-bold tracking-wide">
            <span className="hidden lg:inline text-neutral-300 hover:text-white cursor-pointer transition-colors">
              MINHA CONTA
            </span>
            <span className="text-neutral-300 hover:text-white cursor-pointer transition-colors flex items-center gap-1">
              <Heart size={16} />
              <span className="hidden sm:inline">FAVORITOS</span>
            </span>
            <span className="text-neutral-300 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-700">
              <ShoppingBag size={15} />
              <span>0</span>
            </span>
          </div>
        </div>

        {/* CATEGORY NAV SUB-HEADER */}
        <nav className="hidden lg:flex items-center justify-center gap-8 py-2 bg-neutral-950 border-t border-neutral-800 text-[11px] font-black tracking-wider text-neutral-300">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="cursor-pointer hover:text-white transition-colors"
            >
              {cat}
            </span>
          ))}
        </nav>
      </header>

      {/* BREADCRUMB & MAIN PRODUCT GRID */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-4">
        {/* BREADCRUMB */}
        <div className="text-[11px] text-gray-500 font-medium mb-4 flex items-center gap-1.5 flex-wrap">
          <span className="hover:text-black cursor-pointer">Dafiti</span>
          <span>/</span>
          <span className="hover:text-black cursor-pointer">Feminino</span>
          <span>/</span>
          <span className="hover:text-black cursor-pointer">Calçados</span>
          <span>/</span>
          <span className="hover:text-black cursor-pointer">Sandálias</span>
          <span>/</span>
          <span className="text-black font-bold truncate">Sandália Translúcida Jelly Mule</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: GALLERY (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentColor.images.map((src, i) => (
                <div
                  key={i}
                  className="aspect-square bg-white overflow-hidden rounded-2xl border border-gray-200 shadow-xs group"
                >
                  <img
                    src={src}
                    alt={`${PRODUCT_NAME} - ${currentColor.name}`}
                    loading={i < 2 ? "eager" : "lazy"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>

            {/* HIGHLIGHTS / BENEFÍCIOS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1.5 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <Feather size={16} />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Soft Touch Gel</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Silicone polímero flexível que não aperta nem machuca os pés.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1.5 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <Layers size={16} />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Salto Bloco 5cm</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Altura anatômica que garante equilíbrio e postura sem fadiga.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-1.5 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <Droplets size={16} />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Respirável 360°</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Tramas abertas que evitam calor e suor nos dias mais quentes.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: BUY PANEL (5 cols) */}
          <aside className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-sm lg:sticky lg:top-24 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                  {BRAND_NAME}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">Cód: DF-98234-BR</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
                {PRODUCT_NAME}
              </h1>

              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <div className="text-amber-400 font-black text-sm flex">★★★★★</div>
                <span className="font-bold text-gray-900">5.0</span>
                <span>(148 avaliações)</span>
              </div>
            </div>

            {/* PREÇO */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex items-baseline gap-2.5">
                <span className="text-xs text-gray-400 line-through">
                  R$ {PRICE_OLD.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900">
                  R$ {PRICE_PIX.toFixed(2).replace(".", ",")}
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  5% OFF PIX
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium">
                ou até <strong>6x de R$ 8,31</strong> sem juros no cartão
              </p>
            </div>

            {/* COLOR SELECTOR */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-gray-700">Cor Selecionada:</span>
                <span className="font-black text-black">{currentColor.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COLORS.map((c) => {
                  const isSel = c.id === selectedColorId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColorId(c.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        isSel
                          ? "border-black bg-gray-50 ring-2 ring-black shadow-2xs"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300 shrink-0 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] font-bold text-gray-900 truncate">
                        {c.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">Tamanho (BR):</span>
                <span className="text-[11px] text-gray-500 underline cursor-pointer hover:text-black">
                  Guia de medidas
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => {
                  const isSel = selectedSize === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSelectedSize(s);
                        setError(null);
                      }}
                      className={`h-11 w-12 rounded-xl border text-xs font-bold transition-all ${
                        isSel
                          ? "border-black bg-black text-white shadow-md scale-105"
                          : "border-gray-200 hover:border-black text-gray-900 bg-white"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-xs font-bold text-red-600">{error}</p>}

            {/* CTA BUTTONS */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleBuy}
                className="h-[52px] w-full bg-black hover:bg-neutral-900 active:scale-[0.99] text-xs font-black tracking-widest text-white uppercase rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Lock size={15} />
                <span>COMPRAR AGORA</span>
              </button>

              <button
                type="button"
                onClick={handleBuy}
                className="h-[48px] w-full border border-gray-300 text-xs font-bold tracking-wider text-gray-900 uppercase rounded-2xl hover:border-black transition-all"
              >
                ADICIONAR À SACOLA
              </button>
            </div>

            {/* CEP CALCULATOR COM DELAY E ENDEREÇO VINCULADO */}
            <div className="border-t border-gray-100 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Calcular Frete e Prazo</span>
                <span className="text-[10px] text-gray-400">Correios Oficial</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={cep}
                  onChange={(e) => {
                    const val = maskCEP(e.target.value);
                    setCep(val);
                    if (val.replace(/\D/g, "").length === 8) {
                      setCepError(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCalculateCep();
                  }}
                  maxLength={9}
                  placeholder="00000-000"
                  className="h-11 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black font-mono"
                />
                <button
                  type="button"
                  onClick={handleCalculateCep}
                  disabled={cepLoading}
                  className="h-11 px-5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all min-w-[95px] flex items-center justify-center"
                >
                  {cepLoading ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    "Calcular"
                  )}
                </button>
              </div>

              {cepError && (
                <p className="text-xs font-bold text-red-600 animate-in fade-in">
                  {cepError}
                </p>
              )}

              {shippingChecked && cepAddress && (
                <div className="border border-gray-200 bg-gray-50/80 p-3.5 rounded-xl text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2 text-gray-700">
                    <MapPin size={15} className="text-black shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-black">Entrega para:</span>{" "}
                      {cepAddress.street}, {cepAddress.neighborhood} — {cepAddress.city}/{cepAddress.state}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <Truck size={15} className="text-amber-600" />
                      <span>Entrega Express (Correios)</span>
                    </div>
                    <span className="font-black text-black text-xs">
                      R$ {SHIPPING_FEE.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Prazo estimado de 2 a 5 dias úteis com código de rastreamento oficial.
                  </p>
                </div>
              )}
            </div>

            {/* DAFITI TRUST BADGES */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Compra 100% Segura Dafiti Garantida</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-blue-600" />
                <span>Troca Grátis e Fácil em até 30 dias</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={15} className="text-amber-600" />
                <span>Produto Original com Nota Fiscal</span>
              </div>
            </div>

            {/* ACCORDION (DETALHES, ESPECIFICAÇÕES, CUIDADOS) */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div>
                <button
                  type="button"
                  onClick={() => setDescOpen((v) => !v)}
                  className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-gray-900 pb-1"
                >
                  <span>Detalhes do Produto</span>
                  {descOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {descOpen && (
                  <div className="mt-2 space-y-2 text-xs leading-relaxed text-gray-600">
                    <p>
                      Inspirada no estilo clássico das Jelly Mules de luxo, a <strong className="text-black">Sandália Translúcida Dafiti Shoes</strong> une tecnologia Soft Touch e estética contemporânea.
                    </p>
                    <p>
                      Sua trama geométrica vazada proporciona máxima ventilação para o dia a dia, mantendo os pés arejados com extremo conforto. O salto bloco de 5cm garante postura elegante com excelente absorção de impacto.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSpecsOpen((v) => !v)}
                  className="flex w-full items-center justify-between text-xs font-black uppercase tracking-wider text-gray-900 pb-1"
                >
                  <span>Ficha Técnica</span>
                  {specsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {specsOpen && (
                  <div className="mt-2 text-xs space-y-1.5 text-gray-600">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span>Material:</span>
                      <strong className="text-gray-900">PVC Siliconado Monobloco</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span>Salto:</span>
                      <strong className="text-gray-900">5,0 cm Bloco Ergonômico</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span>Solado:</span>
                      <strong className="text-gray-900">Antiderrapante TR</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Forma:</span>
                      <strong className="text-gray-900">Padrão Brasileiro</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* PROMOTIONAL MARKETING BANNER (DAFITI STYLE) */}
        <section className="mt-14 mb-8">
          <div className="bg-gradient-to-br from-neutral-900 to-black text-white rounded-3xl p-6 sm:p-10 border border-neutral-800 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="inline-block bg-white/10 text-white text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-full uppercase border border-white/20">
                  DESTAQUE DAFITI
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  Leveza, Flexibilidade &amp; Estilo Para Todos os Momentos
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Desenvolvida com a tecnologia de injeção Soft Touch, a Sandália Jelly Translúcida combina ventilação natural contínua, palmilha anatômica e visual minimalista que combina com qualquer look — do trabalho ao fim de semana.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleBuy}
                    className="bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    GARANTA JÁ A SUA
                  </button>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-700 aspect-square max-w-md mx-auto">
                <img
                  src={translucidaPromoBanner}
                  alt="Propaganda Sandália Jelly Feminina"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS SECTION */}
        <section className="mt-14 border-t border-gray-200 pt-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
                Opinião de Quem Comprou
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 font-medium">
                <span className="text-amber-400 font-bold">★★★★★</span> 5.0 de 5 estrelas • 148 avaliações na Dafiti
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <div key={i} className="border border-gray-200 p-5 rounded-2xl bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-gray-900">{r.name}</strong>
                    <div className="text-[10px] text-gray-400">{r.city}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Comprador Verificado
                  </span>
                </div>
                <div className="text-amber-400 text-xs">★★★★★</div>
                <p className="text-xs text-gray-600 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* DAFITI FOOTER */}
      <footer className="mt-20 bg-black text-neutral-400 border-t border-neutral-800">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div>
            <div className="mb-4">
              <img src={dafitiLogo} alt="Dafiti" className="h-6 w-auto object-contain brightness-110" />
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-500">
              A maior loja online de moda e lifestyle da América Latina.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Ajuda e Suporte</h4>
            <ul className="space-y-2 text-[11px]">
              <li>Central de Atendimento</li>
              <li>Trocas e Devoluções</li>
              <li>Prazos e Entregas</li>
              <li>Política de Privacidade</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Formas de Pagamento</h4>
            <ul className="space-y-2 text-[11px]">
              <li>PIX (Aprovação Imediata)</li>
              <li>Cartão de Crédito em até 6x</li>
              <li>Bandeiras: Visa, Master, Elo, Hiper</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Segurança e Certificação</h4>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Ambiente 100% criptografado com tecnologia SSL de 256 bits para pagamentos seguros.
            </p>
          </div>
        </div>
        <div className="border-t border-neutral-900 py-6 text-center text-[10px] text-neutral-600 uppercase tracking-widest">
          © DAFITI GROUP BRASIL. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
