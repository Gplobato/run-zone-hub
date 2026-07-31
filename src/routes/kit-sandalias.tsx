import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { fbqTrackSingle, fbqTrackPageViewOnce } from "@/lib/pixel";
import gallery1 from "@/assets/kit-sandalias/kit-sandalia-1.jpg.asset.json";
import gallery2 from "@/assets/kit-sandalias/kit-sandalia-2.jpg.asset.json";
import gallery3 from "@/assets/kit-sandalias/kit-sandalia-3.jpg.asset.json";

const PIXEL_ID = "1577403850715282";

const PRODUCT_ID = "mercadopromo-kit-sandalias";
const PRODUCT_NAME = "Kit com 3 Sandálias Femininas — Branca, Preta e Rosé";
const PRICE = 99.9;
const CARD_PRICE = 117.53;
const DESCRIPTION =
  "Kit com 3 sandálias femininas de salto bloco: branca com detalhes trançados, preta com tiras cruzadas e rosé com acabamento metalizado. Três pares por R$ 99,90 — apenas R$ 33,30 cada. Numerações do 34 ao 41.";
const OG_IMAGE = `https://run-zone-hub.lovable.app${gallery1.url}`;

const GALLERY = [gallery1.url, gallery2.url, gallery3.url];



// O kit já vem com as três cores — não há escolha de cor.
const KIT_COLOR = "Branca + Preta + Rosé";

const KIT_ITEMS = [
  { label: "Branca", detail: "Detalhes trançados", swatch: "#f2efe9" },
  { label: "Preta", detail: "Tiras cruzadas", swatch: "#141414" },
  { label: "Rosé", detail: "Acabamento metalizado", swatch: "#c98a68" },
];

// Numerações disponíveis: do 34 ao 41.
const SIZES = ["34", "35", "36", "37", "38", "39", "40", "41"];
const SOLD_OUT_SIZES: string[] = [];

const VARIANT_IDS: Record<string, number> = {
  "34": 252579869,
  "35": 252579869,
  "36": 252579914,
  "37": 252579914,
  "38": 252579922,
  "39": 252579922,
  "40": 252579930,
  "41": 252579930,
};

const REVIEWS = [
  {
    name: "ana.clara",
    rating: 5,
    when: "há 2 semanas",
    text: "Eu fiquei apaixonada! Chegaram os três pares certinhos e cada um é mais bonito que o outro. A preta de tiras cruzadas virou minha favorita. Confortáveis e muito bem embaladas.",
  },
  {
    name: "mariana.s",
    rating: 5,
    when: "há 3 semanas",
    text: "Melhor custo-benefício que já achei. Três sandálias por esse preço é surreal. O salto bloco é firme e dá pra usar o dia todo sem machucar. A numeração ficou perfeita no pé.",
  },
  {
    name: "camila.r",
    rating: 5,
    when: "há 1 mês",
    text: "Chegou rápido e combina com tudo. A branca eu uso no trabalho, a preta pra sair e a rosé em festa. Acabamento muito melhor do que eu esperava. Recomendo de olhos fechados.",
  },
];


const NAV = ["NEW IN", "SAPATOS", "BOLSAS", "RESORT 27", "BOTAS", "FALL SALE", "BLOG"];

export const Route = createFileRoute("/kit-sandalias")({
  head: () => ({
    meta: [
      { title: `${PRODUCT_NAME} | SCHUTZ` },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:title", content: PRODUCT_NAME },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "product:price:amount", content: "99.90" },
      { property: "product:price:currency", content: "BRL" },
      { property: "product:brand", content: "Schutz" },
      { property: "product:availability", content: "in stock" },
      { property: "product:condition", content: "new" },
      { property: "product:retailer_item_id", content: PRODUCT_ID },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PRODUCT_NAME },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: KitSandaliasSchutzPage,
});

function KitSandaliasSchutzPage() {
  const [size, setSize] = useState<string | null>(null);

  const [descOpen, setDescOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cep, setCep] = useState("");
  const [shippingChecked, setShippingChecked] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);

  const navigate = useNavigate();

  const baseParams = useMemo(
    () => ({
      content_ids: [PRODUCT_ID],
      content_name: PRODUCT_NAME,
      content_type: "product",
      value: PRICE,
      currency: "BRL",
    }),
    [],
  );

  useEffect(() => {
    fbqTrackPageViewOnce(PIXEL_ID);
    fbqTrackSingle(PIXEL_ID, "ViewContent", baseParams);
  }, [baseParams]);

  const variantId = size ? VARIANT_IDS[size] : undefined;

  function validate() {
    if (!size) {
      setError("Selecione um tamanho.");
      return false;
    }
    if (!variantId) {
      setError("Este tamanho está indisponível.");
      return false;
    }
    setError(null);
    return true;
  }

  async function goToCheckout(event: "InitiateCheckout" | "AddToCart") {
    if (loading) return;
    if (!validate()) return;
    fbqTrackSingle(PIXEL_ID, event, baseParams);
    setLoading(true);
    navigate({
      to: "/checkout-schutz",
      search: { tam: size!, color: KIT_COLOR },
    });
  }


  return (
    <div className="min-h-screen bg-white font-sans text-[#111]">
      {welcomeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setWelcomeOpen(false)}
        >
          <div
            className="w-full max-w-[420px] animate-in bg-white p-6 shadow-xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-semibold tracking-[0.18em] text-black/50">
              SCHUTZ · CONDIÇÃO ESPECIAL
            </p>
            <h2 className="mt-3 text-[20px] font-semibold leading-snug">
              Apenas 1 compra por CPF
            </h2>
            <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-black/70">
              <li className="flex gap-2">
                <span className="text-[#1a7f37]">✓</span>
                <span>
                  <strong className="text-[#111]">15% OFF no PIX</strong> — já aplicado no
                  valor de R$ 99,90.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1a7f37]">✓</span>
                <span>
                  <strong className="text-[#111]">Frete grátis</strong> para todo o Brasil,
                  entrega em 1 a 3 dias úteis.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1a7f37]">✓</span>
                <span>Limitado a 1 unidade por CPF enquanto durar o estoque.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#1a7f37]">✓</span>
                <span>Pagamento no PIX ou cartão em até 12x sem juros.</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setWelcomeOpen(false)}
              className="mt-6 h-[52px] w-full bg-[#0d1b2a] text-[13px] font-semibold tracking-[0.12em] text-white"
            >
              QUERO APROVEITAR
            </button>
            <button
              type="button"
              onClick={() => setWelcomeOpen(false)}
              className="mt-2 h-[40px] w-full text-[12px] text-black/50"
            >
              Continuar navegando
            </button>
          </div>
        </div>
      )}


      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white">
        <div className="flex items-center gap-8 px-6 py-4">
          <span className="text-2xl font-extrabold tracking-tight">SCHUTZ</span>
          <nav className="hidden items-center gap-7 text-[13px] font-medium tracking-wide lg:flex">
            {NAV.map((item) => (
              <span key={item} className="cursor-pointer hover:opacity-60">
                {item}
              </span>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-5 text-[13px] font-medium tracking-wide">
            <span className="hidden sm:inline">BUSCAR</span>
            <span className="hidden sm:inline">♡</span>
            <span>0</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px]">
        {/* Galeria */}
        <div>
          <div className="px-6 pt-4 text-[12px] text-black/50">
            Home / Sapatos / Sandálias
          </div>
          <div className="mt-3 grid grid-cols-1 gap-[2px] sm:grid-cols-2">
            {GALLERY.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={PRODUCT_NAME}
                loading={i < 2 ? "eager" : "lazy"}
                className="aspect-square w-full bg-[#f5f5f5] object-cover"
              />
            ))}
          </div>
        </div>

        {/* Painel de compra */}
        <aside className="px-6 py-8 lg:sticky lg:top-[73px] lg:h-fit">
          <span className="inline-block bg-[#111] px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-white">
            PRÉ-VENDA
          </span>
          <h1 className="mt-3 text-[17px] font-semibold">{PRODUCT_NAME}</h1>
          <p className="mt-1 text-[14px] text-black/45 line-through">R$ 117,53</p>
          <p className="mt-1 text-[26px] font-medium sm:text-[22px]">R$ 99,90</p>
          <p className="mt-1 text-[13px] text-black/60">
            ou 12x de R$ 9,79 sem juros no cartão
          </p>
          <p className="mt-2 border border-[#1a7f37]/30 bg-[#1a7f37]/10 px-3 py-2 text-[13px] font-medium text-[#1a7f37]">
            ✓ 15% de desconto exclusivo no PIX — já aplicado neste valor
          </p>


          {/* O que vem no kit */}
          <p className="mt-7 text-[13px]">
            <strong>O kit contém:</strong> 3 pares — {KIT_COLOR}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {KIT_ITEMS.map((c) => (
              <div
                key={c.label}
                className="border border-black/15 bg-[#fafafa] px-2 py-3 text-center"
              >
                <span
                  className="mx-auto block h-7 w-7 rounded-full border border-black/10"
                  style={{ background: c.swatch }}
                />
                <p className="mt-2 text-[12px] font-semibold">{c.label}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-black/55">{c.detail}</p>
              </div>
            ))}
          </div>


          {/* Tamanho */}
          <div className="mt-7 flex items-center justify-between">
            <p className="text-[13px] font-semibold">Tamanho:</p>
            <span className="cursor-pointer text-[13px] underline">Guia de tamanho</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIZES.map((s) => {
              const soldOut = SOLD_OUT_SIZES.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={soldOut}
                  onClick={() => {
                    setSize(s);
                    setError(null);
                  }}
                  className={`h-[42px] w-[52px] border text-[13px] ${
                    soldOut
                      ? "cursor-not-allowed border-black/10 text-black/25 line-through"
                      : size === s
                        ? "border-[#111] bg-[#111] text-white"
                        : "border-black/25 hover:border-[#111]"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}

          <button
            type="button"
            disabled={loading}
            onClick={() => goToCheckout("InitiateCheckout")}
            className="mt-5 h-[52px] w-full bg-[#0d1b2a] text-[13px] font-semibold tracking-[0.12em] text-white disabled:opacity-60"
          >
            {loading ? "PROCESSANDO..." : "COMPRAR"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => goToCheckout("AddToCart")}
            className="mt-3 h-[52px] w-full border border-[#111] text-[13px] font-semibold tracking-[0.12em] disabled:opacity-60"
          >
            ADICIONAR À SACOLA
          </button>
          <p className="mt-4 text-center text-[13px] underline">Quero de presente</p>

          <div className="mt-8 border-t border-black/10 pt-6">
            <p className="text-[13px] font-semibold">Verificar o valor do frete</p>
            <div className="mt-3 flex">
              <input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="_____-___"
                className="h-[46px] flex-1 border border-black/25 px-3 text-[13px] outline-none"
              />
              <button
                type="button"
                onClick={() => setShippingChecked(true)}
                className="h-[46px] border border-l-0 border-black/25 px-4 text-[12px] font-semibold tracking-wide"
              >
                CONSULTAR
              </button>
            </div>
            {shippingChecked && (
              <div className="mt-3 border border-black/10 bg-[#f7f7f7] p-3">
                <p className="text-[13px]">
                  Frete: <strong className="text-[#1a7f37]">R$ 0,00</strong>
                </p>
                <p className="mt-1 text-[12px] text-black/60">
                  Limitado a 1 por CPF.
                </p>
              </div>
            )}
          </div>


          {/* Descrição */}
          <div className="mt-8 border-t border-black/10 pt-5">
            <button
              type="button"
              onClick={() => setDescOpen((v) => !v)}
              className="flex w-full items-center justify-between text-[14px] font-semibold"
            >
              Descrição <span>{descOpen ? "⌃" : "⌄"}</span>
            </button>
            {descOpen && (
              <div className="mt-3 space-y-4 text-[13px] leading-relaxed text-black/75">
                <p>
                  Um kit completo com <strong className="text-[#111]">3 sandálias
                  femininas</strong> de salto bloco: uma branca, uma preta e uma rosé. Três
                  acabamentos diferentes para montar looks distintos sem precisar comprar
                  pares avulsos.
                </p>
                <p>
                  O salto bloco baixo garante firmeza e conforto para usar o dia inteiro, e a
                  palmilha acolchoada acompanha o formato do pé. São cores neutras e fáceis de
                  combinar, do trabalho ao fim de semana.
                </p>
                <div>
                  <p className="font-semibold text-[#111]">Características</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      <strong className="text-[#111]">Três modelos em um único kit:</strong> 1
                      sandália branca, 1 preta e 1 rosé
                    </li>
                    <li>
                      <strong className="text-[#111]">Acabamentos diferentes:</strong> detalhes
                      trançados, tiras cruzadas e acabamento metalizado
                    </li>
                    <li>
                      <strong className="text-[#111]">Somente R$ 33,30 por par:</strong> três
                      sandálias por apenas R$ 99,90
                    </li>
                    <li>
                      <strong className="text-[#111]">Cores fáceis de combinar:</strong> branco,
                      preto e rosé para acompanhar todo o guarda-roupa
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-[#111]">Especificações</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>O kit contém: 1 sandália branca</li>
                    <li>O kit contém: 1 sandália preta</li>
                    <li>O kit contém: 1 sandália rosé</li>
                    <li>Numerações disponíveis: do 34 ao 41</li>
                    <li>Sandália branca: detalhes trançados</li>
                    <li>Sandália preta: tiras cruzadas</li>
                    <li>Sandália rosé: acabamento metalizado elegante</li>
                    <li>Salto: bloco baixo</li>
                    <li>Palmilha: acolchoada</li>
                  </ul>
                </div>
                <p className="text-[12px] text-black/55">
                  Garantia do vendedor: 30 dias. Limitado a 1 kit por CPF.
                </p>
              </div>
            )}

          </div>
        </aside>
      </div>

      {/* Avaliações */}
      <section className="mt-14 border-t border-black/10 px-6 py-10">
        <h2 className="text-[18px] font-semibold">Avaliações do produto</h2>
        <div className="mt-1 flex items-center gap-2 text-[13px] text-black/60">
          <span className="text-[#111]">★★★★★</span> 5,0 · 127 avaliações
        </div>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <div key={r.name}>
              <div className="flex items-center gap-2 text-[13px]">
                <strong>{r.name}</strong>
                <span className="text-[11px] text-[#1a7f37]">✓ Compra verificada</span>
              </div>
              <div className="mt-1 text-[12px] text-black/50">
                <span className="text-[#111]">★★★★★</span> · {r.when}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-black/75">{r.text}</p>

            </div>
          ))}
        </div>
      </section>


      <footer className="mt-16 border-t border-black/10 px-6 py-10 text-[12px] text-black/50">
        © SCHUTZ. Todos os direitos reservados.
      </footer>
    </div>
  );
}
