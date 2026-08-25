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
} from "lucide-react";

// Assets
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

const PRODUCT_NAME = "Sandália Translúcida Jelly Mule Schutz";
const PRICE_PIX = 49.9;
const PRICE_CARD = 49.9;
const PRICE_OLD = 189.9;
const SHIPPING_FEE = 10.9;

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

const SIZES = ["34", "35", "36", "37", "38", "39", "40"];

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

const NAV = ["NEW IN", "SAPATOS", "BOLSAS", "RESORT 27", "BOTAS", "FALL SALE", "BLOG"];

export const Route = createFileRoute("/translucida-schutz")({
  head: () => ({
    meta: [
      { title: `${PRODUCT_NAME} | SCHUTZ Oficial` },
      {
        name: "description",
        content: "Sandália Translúcida Jelly Mule Schutz. Design icônico respirável com palmilha anatômica e 5% de desconto no PIX.",
      },
    ],
  }),
  component: SchutzTranslúcidaPDP,
});

function SchutzTranslúcidaPDP() {
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
      // Simulação com pequeno delay realista
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
      to: "/checkout-schutz",
      search: { cor: selectedColorId, tam: selectedSize },
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#111] antialiased">
      {/* POPUP DE CONDIÇÃO ESPECIAL */}
      {welcomeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setWelcomeOpen(false)}
        >
          <div
            className="w-full max-w-[430px] bg-white p-6 shadow-2xl sm:p-7 animate-in slide-in-from-bottom-5 duration-300 rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-bold tracking-[0.2em] text-black/50 uppercase">
              SCHUTZ • CONDIÇÃO ESPECIAL
            </p>
            <h2 className="mt-2 text-[20px] font-bold leading-snug">
              Edição Exclusiva Limitada
            </h2>
            <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-black/75">
              <li className="flex gap-2">
                <span className="text-[#1a7f37] font-bold">✓</span>
                <span>
                  <strong className="text-[#111]">5% OFF no PIX</strong> — já aplicado no valor à vista de R$ 49,90.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1a7f37] font-bold">✓</span>
                <span>
                  <strong className="text-[#111]">Entrega Express (Correios)</strong> por apenas R$ 10,90 com código de rastreamento oficial.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1a7f37] font-bold">✓</span>
                <span>Garantia incondicional de 30 dias com primeira troca sem custos.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1a7f37] font-bold">✓</span>
                <span>Pagamento facilitado em até 6x sem juros no cartão de crédito.</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setWelcomeOpen(false)}
              className="mt-6 h-[52px] w-full bg-black text-[12px] font-bold tracking-[0.15em] text-white uppercase transition-transform active:scale-95"
            >
              QUERO APROVEITAR A OFERTA
            </button>
            <button
              type="button"
              onClick={() => setWelcomeOpen(false)}
              className="mt-2 h-[36px] w-full text-[12px] text-black/40 hover:text-black font-medium"
            >
              Continuar navegando
            </button>
          </div>
        </div>
      )}

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold py-2 px-4 text-center tracking-[0.2em] uppercase flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-amber-400 shrink-0" />
        <span>5% OFF NO PIX • ENTREGA EXPRESS (CORREIOS)</span>
      </div>

      {/* LUXURY SCHUTZ HEADER */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white">
        <div className="flex items-center gap-8 px-4 sm:px-8 py-4">
          <span className="text-2xl font-black tracking-tighter">SCHUTZ</span>
          <nav className="hidden items-center gap-7 text-[12px] font-bold tracking-wider lg:flex">
            {NAV.map((item) => (
              <span key={item} className="cursor-pointer hover:opacity-60 transition-opacity">
                {item}
              </span>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-5 text-[13px] font-medium tracking-wide">
            <span className="hidden sm:inline text-xs font-bold tracking-wider cursor-pointer">
              BUSCAR
            </span>
            <span className="cursor-pointer text-base">♡</span>
            <span className="cursor-pointer flex items-center gap-1 font-bold text-xs">
              <ShoppingBag size={16} /> 0
            </span>
          </div>
        </div>
      </header>

      {/* PRODUCT DETAIL CONTAINER */}
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_480px]">
        {/* LEFT: HIGH QUALITY IMAGE GALLERY */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="text-[11px] font-bold uppercase tracking-wider text-black/40 mb-4">
            Home / Sapatos / Sandálias / Translúcida Jelly Mule
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentColor.images.map((src, i) => (
              <div key={i} className="aspect-square bg-[#f8f8f8] overflow-hidden rounded-xl border border-gray-100 group">
                <img
                  src={src}
                  alt={`${PRODUCT_NAME} - ${currentColor.name}`}
                  loading={i < 2 ? "eager" : "lazy"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* HIGHLIGHTS CARDS UNDER GALLERY */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-black/10 pt-8">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                <Feather size={16} />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Soft Jelly Comfort</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Silicone polímero de alta flexibilidade que se molda aos pés sem atrito ou calos.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                <Layers size={16} />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Salto Bloco 5cm</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Altura ergonômica ideal para distribuição de peso com base antiderrapante de alta aderência.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                <Droplets size={16} />
              </div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">Respirabilidade 360°</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Tramas tridimensionais geométricas que mantêm a circulação de ar contínua o dia todo.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: BUY PANEL */}
        <aside className="px-6 py-6 lg:py-8 lg:sticky lg:top-[73px] lg:h-fit border-t lg:border-t-0 lg:border-l border-black/10">
          <span className="inline-block bg-black px-2.5 py-1 text-[10px] font-black tracking-[0.15em] text-white uppercase">
            EDIÇÃO EXCLUSIVA
          </span>

          <h1 className="mt-3 text-[20px] sm:text-[22px] font-black tracking-tight leading-tight">
            {PRODUCT_NAME}
          </h1>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-[14px] text-black/40 line-through">
              R$ {PRICE_OLD.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-[28px] font-black text-black">
              R$ {PRICE_PIX.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <p className="text-[13px] text-black/60 font-medium">
            ou até 6x de R$ 8,31 sem juros no cartão
          </p>

          <div className="mt-3 border border-[#1a7f37]/30 bg-[#1a7f37]/10 px-3 py-2 text-[12px] font-bold text-[#1a7f37]">
            ✓ 5% de desconto exclusivo no PIX — já aplicado neste valor
          </div>

          {/* COLOR SELECTOR */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-[13px] mb-2">
              <span className="font-bold">Cor:</span>
              <span className="font-extrabold text-black">{currentColor.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {COLORS.map((c) => {
                const isSel = c.id === selectedColorId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColorId(c.id)}
                    className={`p-2.5 border text-left flex items-center gap-2.5 transition-all rounded-sm ${
                      isSel
                        ? "border-black bg-gray-50 ring-1 ring-black"
                        : "border-black/15 hover:border-black/40 bg-white"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-black/20 shrink-0 shadow-xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[11px] font-bold text-black truncate">{c.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold">Tamanho (BR):</span>
              <span className="text-[11px] text-black/50 underline cursor-pointer">Guia de medidas</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
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
                    className={`h-[44px] w-[54px] border text-[13px] font-bold transition-all ${
                      isSel
                        ? "border-black bg-black text-white shadow-xs"
                        : "border-black/25 hover:border-black text-black"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="mt-3 text-[12px] font-bold text-red-600">{error}</p>}

          {/* CTA BUTTONS */}
          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={handleBuy}
              className="h-[52px] w-full bg-black hover:bg-neutral-900 active:scale-[0.99] text-[13px] font-bold tracking-[0.15em] text-white uppercase transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>COMPRAR AGORA</span>
            </button>

            <button
              type="button"
              onClick={handleBuy}
              className="h-[52px] w-full border border-black text-[13px] font-bold tracking-[0.15em] text-black uppercase hover:bg-black hover:text-white transition-all"
            >
              ADICIONAR À SACOLA
            </button>
          </div>

          {/* CEP & FRETE CALCULATOR COM DELAY E ENDEREÇO VINCULADO */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[13px] font-bold">Calcular prazo de entrega</p>
            <div className="mt-2 flex">
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
                className="h-[46px] flex-1 border border-black/25 px-3 text-[13px] outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleCalculateCep}
                disabled={cepLoading}
                className="h-[46px] border border-l-0 border-black/25 px-5 text-[11px] font-bold tracking-wider uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center min-w-[100px]"
              >
                {cepLoading ? (
                  <Loader2 size={16} className="animate-spin text-black" />
                ) : (
                  "Calcular"
                )}
              </button>
            </div>

            {cepError && (
              <p className="mt-2 text-xs font-bold text-red-600 animate-in fade-in">
                {cepError}
              </p>
            )}

            {shippingChecked && cepAddress && (
              <div className="mt-3 border border-gray-200 bg-gray-50/80 p-3.5 rounded-lg text-xs space-y-2 animate-in fade-in">
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
                  <span className="font-black text-black text-[13px]">
                    R$ {SHIPPING_FEE.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Prazo estimado de 2 a 5 dias úteis com código de rastreamento oficial.
                </p>
              </div>
            )}
          </div>

          {/* DETALHADA DESCRIÇÃO, ESPECIFICAÇÕES E CUIDADOS (ACCORDION) */}
          <div className="mt-8 border-t border-black/10 pt-5 space-y-4">
            {/* 1. DESCRIÇÃO COMPLETA */}
            <div>
              <button
                type="button"
                onClick={() => setDescOpen((v) => !v)}
                className="flex w-full items-center justify-between text-[13px] font-black uppercase tracking-wider text-black pb-2"
              >
                <span>Descrição &amp; Design</span>
                {descOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {descOpen && (
                <div className="mt-2 space-y-3 text-[13px] leading-relaxed text-black/75">
                  <p>
                    Inspirada nas maiores passarelas internacionais e na alta tendência dos calçados transparentes de luxo (*Jelly Mules*), a <strong className="text-black">Sandália Translúcida Jelly Mule Schutz</strong> redefine o equilíbrio entre modernidade futurista e ergonomia atemporal.
                  </p>
                  <p>
                    Produzida em polímero monobloco siliconado com tecnologia <em className="font-semibold text-black">Soft Touch</em>, ela abraça o pé com extrema leveza e maciez. Sua estrutura em grade geométrica tridimensional permite uma ventilação contínua e natural, mantendo os pés sempre frescos e confortáveis, mesmo após horas de uso contínuo em dias quentes.
                  </p>
                  <p>
                    O salto bloco estruturado de 5cm oferece elevação com base ampla e estável, reduzindo o impacto articular e distribuindo a pressão plantar de forma homogênea entre o calcanhar e a planta do pé.
                  </p>
                  <div>
                    <p className="font-bold text-black uppercase text-[11px] tracking-wider mb-1.5">
                      Como Usar (Dicas de Estilo)
                    </p>
                    <ul className="list-disc space-y-1.5 pl-4 text-xs">
                      <li><strong>Look Alfaiataria:</strong> Combine com calças de linho retas ou blazers oversized para um visual cosmopolita elegante.</li>
                      <li><strong>Look Casual Chic:</strong> Perfeita com jeans wide leg, croppeds e saias midi plissadas.</li>
                      <li><strong>Resort &amp; Sunset:</strong> Acompanha vestidos fluidos e batas para passeios praianos ou encontros de fim de tarde.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 2. ESPECIFICAÇÕES TÉCNICAS */}
            <div className="border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setSpecsOpen((v) => !v)}
                className="flex w-full items-center justify-between text-[13px] font-black uppercase tracking-wider text-black pb-2"
              >
                <span>Ficha Técnica &amp; Dimensões</span>
                {specsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {specsOpen && (
                <div className="mt-2 space-y-2 text-xs text-black/75">
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Material Superior</span>
                      <strong className="text-gray-900">PVC Gel Siliconado Soft Touch</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Altura do Salto</span>
                      <strong className="text-gray-900">5,0 cm (Bloco Ergonômico)</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Tipo de Bico</span>
                      <strong className="text-gray-900">Arredondado com Abertura Frontal</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Solado</span>
                      <strong className="text-gray-900">TR Antiderrapante Anti-Impacto</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Forma</span>
                      <strong className="text-gray-900">Normal (Recomendamos seu número habitual)</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Origem</span>
                      <strong className="text-gray-900">Nacional com Garantia 100%</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. GUIA DE LIMPEZA E CUIDADOS */}
            <div className="border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setCareOpen((v) => !v)}
                className="flex w-full items-center justify-between text-[13px] font-black uppercase tracking-wider text-black pb-2"
              >
                <span>Cuidados &amp; Conservação</span>
                {careOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {careOpen && (
                <div className="mt-2 space-y-2 text-xs text-black/75 leading-relaxed">
                  <p>• Limpe facilmente utilizando apenas um pano macio umedecido com água e sabão neutro.</p>
                  <p>• Deixe secar sempre à sombra em local arejado (evite exposição prolongada ao sol intenso quando guardada).</p>
                  <p>• O material é 100% à prova d'água, ideal para dias chuvosos ou ambientes à beira-mar.</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* PROMOTIONAL MARKETING BANNER */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-8 mt-12 mb-4">
        <div className="bg-gradient-to-br from-neutral-50 via-stone-50 to-stone-100 rounded-3xl p-6 sm:p-10 border border-gray-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-block bg-black text-white text-[10px] font-black tracking-[0.2em] px-3 py-1 rounded-full uppercase">
                Design &amp; Conforto
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 leading-tight">
                Leveza, Flexibilidade &amp; Estilo Para Todos os Momentos
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Desenvolvida com a tecnologia de injeção Soft Touch, a Sandália Jelly Translúcida combina ventilação natural contínua, palmilha anatômica e visual minimalista que combina com qualquer look — do trabalho ao fim de semana.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleBuy}
                  className="bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  GARANTA JÁ A SUA
                </button>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200 aspect-square max-w-md mx-auto">
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
      <section className="mt-16 border-t border-black/10 max-w-[1320px] mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-[20px] font-black uppercase tracking-tight">
              Avaliações de Clientes
            </h2>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-black/60 font-medium">
              <span className="text-amber-500 font-bold">★★★★★</span> 5.0 de 5 estrelas • 142 avaliações verificadas
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <div key={i} className="border border-black/10 p-5 rounded-lg bg-[#fafafa] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-sm text-black">{r.name}</strong>
                  <div className="text-[11px] text-black/50">{r.city}</div>
                </div>
                <span className="text-[10px] font-bold text-[#1a7f37] bg-emerald-50 px-2 py-0.5 rounded">
                  ✓ Verificada
                </span>
              </div>
              <div className="text-amber-500 text-xs tracking-wider">★★★★★</div>
              <p className="text-xs text-black/75 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-black/10 px-6 py-10 text-center text-[11px] text-black/50 uppercase tracking-wider">
        © SCHUTZ. Todos os direitos reservados.
      </footer>
    </div>
  );
}
