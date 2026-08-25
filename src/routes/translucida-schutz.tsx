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
} from "lucide-react";

// Assets
import translucidaBranca1 from "@/assets/mercadopromo/translucida-branca-1.jpg";
import translucidaBranca2 from "@/assets/mercadopromo/translucida-branca-2.jpg";
import translucidaBranca3 from "@/assets/mercadopromo/translucida-branca-3.jpg";
import translucidaMarrom1 from "@/assets/mercadopromo/translucida-marrom-1.png";
import translucidaMarrom2 from "@/assets/mercadopromo/translucida-marrom-2.png";
import translucidaMarrom3 from "@/assets/mercadopromo/translucida-marrom-3.jpg";
import translucidaRosa1 from "@/assets/mercadopromo/translucida-rosa-1.jpg";
import translucidaRosa2 from "@/assets/mercadopromo/translucida-rosa-2.jpg";
import translucidaRosa3 from "@/assets/mercadopromo/translucida-rosa-3.jpg";
import translucidaPreta1 from "@/assets/mercadopromo/translucida-preta-1.jpg";
import translucidaPreta2 from "@/assets/mercadopromo/translucida-preta-2.jpg";
import translucidaPreta3 from "@/assets/mercadopromo/translucida-preta-3.png";

const PRODUCT_NAME = "Sandália Translúcida Jelly Mule Schutz";
const PRICE_PIX = 49.9;
const PRICE_CARD = 59.9;
const PRICE_OLD = 189.9;

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
    images: [translucidaMarrom1, translucidaMarrom3, translucidaMarrom2],
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

const REVIEWS = [
  {
    name: "Fernanda Lima",
    city: "São Paulo, SP",
    rating: 5,
    when: "há 2 dias",
    text: "Simplesmente deslumbrante! O material translúcido é super macio e não machuca nada o calcanhar. O salto bloco de 5cm é perfeito para usar o dia inteiro. Chegou em 2 dias.",
  },
  {
    name: "Juliana Mendes",
    city: "Rio de Janeiro, RJ",
    rating: 5,
    when: "há 4 dias",
    text: "Comprei a cor Cristal e a Marrom Âmbar. Elas são muito mais bonitas pessoalmente do que nas fotos! O acabamento é impecável, padrão Schutz de qualidade. Amei demais!",
  },
  {
    name: "Camila Rodrigues",
    city: "Belo Horizonte, MG",
    rating: 5,
    when: "há 1 semana",
    text: "Amei o conforto da palmilha. O pé respira bem e a transparência dá uma elegância surreal com qualquer vestido ou calça jeans. Recomendo de olhos fechados!",
  },
];

const NAV = ["NEW IN", "SAPATOS", "BOLSAS", "RESORT 27", "BOTAS", "FALL SALE", "BLOG"];

export const Route = createFileRoute("/translucida-schutz")({
  head: () => ({
    meta: [
      { title: `${PRODUCT_NAME} | SCHUTZ Oficial` },
      {
        name: "description",
        content: "Compre a Sandália Translúcida Jelly Mule Schutz com 15% de desconto no PIX e Frete Grátis.",
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
  const [cep, setCep] = useState("");
  const [shippingChecked, setShippingChecked] = useState(false);
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
      {/* POPUP DE CONDIÇÃO ESPECIAL (ESTILO SCHUTZ) */}
      {welcomeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setWelcomeOpen(false)}
        >
          <div
            className="w-full max-w-[420px] bg-white p-6 shadow-2xl sm:p-7 animate-in slide-in-from-bottom-5 duration-300 rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-bold tracking-[0.2em] text-black/50 uppercase">
              SCHUTZ • EDIÇÃO LIMITADA
            </p>
            <h2 className="mt-2 text-[20px] font-bold leading-snug">
              Condição Especial de Lançamento
            </h2>
            <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-black/75">
              <li className="flex gap-2">
                <span className="text-[#1a7f37] font-bold">✓</span>
                <span>
                  <strong className="text-[#111]">15% OFF no PIX</strong> — já aplicado no valor de R$ 49,90.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1a7f37] font-bold">✓</span>
                <span>
                  <strong className="text-[#111]">Frete Grátis</strong> para todo o Brasil com rastreamento.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1a7f37] font-bold">✓</span>
                <span>Garantia de 30 dias com primeira troca sem custos.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1a7f37] font-bold">✓</span>
                <span>Pagamento facilitado em até 6x sem juros no cartão.</span>
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
        <span>LANÇAMENTO SCHUTZ • 15% OFF NO PIX + FRETE GRÁTIS</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentColor.images.map((src, i) => (
              <div key={i} className="aspect-square bg-[#f8f8f8] overflow-hidden rounded-lg group">
                <img
                  src={src}
                  alt={`${PRODUCT_NAME} - ${currentColor.name}`}
                  loading={i < 2 ? "eager" : "lazy"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: BUY PANEL */}
        <aside className="px-6 py-6 lg:py-8 lg:sticky lg:top-[73px] lg:h-fit border-t lg:border-t-0 lg:border-l border-black/10">
          <span className="inline-block bg-black px-2.5 py-1 text-[10px] font-black tracking-[0.15em] text-white uppercase">
            DROP EXCLUSIVO
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
            ou até 6x de R$ 9,98 sem juros no cartão
          </p>

          <div className="mt-3 border border-[#1a7f37]/30 bg-[#1a7f37]/10 px-3 py-2 text-[12px] font-bold text-[#1a7f37]">
            ✓ 15% de desconto exclusivo no PIX — já aplicado neste valor
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

          {/* CEP & FRETE CALCULATOR */}
          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[13px] font-bold">Calcular prazo de entrega</p>
            <div className="mt-2 flex">
              <input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
                className="h-[46px] flex-1 border border-black/25 px-3 text-[13px] outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShippingChecked(true)}
                className="h-[46px] border border-l-0 border-black/25 px-5 text-[11px] font-bold tracking-wider uppercase hover:bg-black hover:text-white transition-colors"
              >
                Calcular
              </button>
            </div>
            {shippingChecked && (
              <div className="mt-3 border border-[#1a7f37]/30 bg-[#1a7f37]/10 p-3 text-[12px] text-[#1a7f37] font-medium animate-in fade-in">
                <p>
                  Frete: <strong className="font-black text-black">GRÁTIS (R$ 0,00)</strong>
                </p>
                <p className="mt-0.5 text-black/70">Prazo estimado: 1 a 3 dias úteis para seu endereço.</p>
              </div>
            )}
          </div>

          {/* COLLAPSIBLE DESCRIPTION & SPECS */}
          <div className="mt-8 border-t border-black/10 pt-5 space-y-4">
            <div>
              <button
                type="button"
                onClick={() => setDescOpen((v) => !v)}
                className="flex w-full items-center justify-between text-[13px] font-black uppercase tracking-wider text-black"
              >
                <span>Detalhes do Produto</span>
                {descOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {descOpen && (
                <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-black/75">
                  <p>
                    A <strong className="text-black">Sandália Translúcida Jelly Mule Schutz</strong> une a vanguarda do design translúcido à máxima ergonomia de uso diário. Com salto bloco de 5cm e estrutura flexível, oferece firmeza anatômica sem abrir mão da sofisticação.
                  </p>
                  <div>
                    <p className="font-bold text-black uppercase text-[11px] tracking-wider mb-1">
                      Destaques
                    </p>
                    <ul className="list-disc space-y-1 pl-4 text-xs">
                      <li>Material Soft Jelly de alta durabilidade e toque suave</li>
                      <li>Salto bloco anti-impacto (5cm) que não cansa as pernas</li>
                      <li>Palmilha acolchoada anatômica com suporte de arco</li>
                      <li>Acabamento translúcido elegante que alonga a silhueta</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

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
