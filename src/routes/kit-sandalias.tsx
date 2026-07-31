import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createZedyCheckout } from "@/lib/zedy.functions";
import { fbqTrackSingle } from "@/lib/pixel";
import review1 from "@/assets/mercadopromo/kitsandalias-review-1.png";
import review2 from "@/assets/mercadopromo/kitsandalias-review-2.png";
import review3 from "@/assets/mercadopromo/kitsandalias-review-3.png";

const PIXEL_ID = "1577403850715282";

const PRODUCT_ID = "mercadopromo-kit-sandalias";
const PRODUCT_NAME = "Sandália Meia Pata Couro Preta";
const PRICE = 890;
const DESCRIPTION =
  "Sandália Meia Pata Riviera em couro preto, formato tamanco (mule) com tira larga sobre o peito do pé, salto agulha de 14 cm e plataforma meia pata.";
const OG_IMAGE =
  "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/hfb/h63/h00/h00/13436215230494/Midres-Headless-S2272300080004-01.jpg";

const GALLERY = [
  "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/hfb/h63/h00/h00/13436215230494/Midres-Headless-S2272300080004-01.jpg",
  "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/h79/h82/h00/h00/13436215885854/Midres-Headless-S2272300080004-02.jpg",
  "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/h08/h2d/h00/h00/13436216672286/Midres-Headless-S2272300080004-03.jpg",
  "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/h91/hde/h00/h00/13436217524254/Midres-Headless-S2272300080004-04.jpg",
  "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/h39/h8f/h00/h00/13446810566686/Midres-Headless-S2272300080004-05.jpg",
  "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/h01/h13/h00/h00/13436218441758/Midres-Headless-S2272300080004-06.jpg",
  "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/hde/h5a/h00/h00/13436219228190/Midres-Headless-S2272300080004-07.jpg",
];

const COLORS = [
  {
    label: "Preto",
    thumb:
      "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/hf6/hb1/h00/h00/13436214968350/Thumbnail-Headless-S2272300080004-01.jpg?w=1920&q=100",
  },
  {
    label: "Marrom",
    thumb:
      "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/h52/hca/h00/h00/13436188885022/Thumbnail-Headless-S2272300080002-01.jpg?w=1920&q=100",
  },
  {
    label: "Prata",
    thumb:
      "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/hcd/hf2/h00/h00/13436183642142/Thumbnail-Headless-S2272300080001-01.jpg?w=1920&q=100",
  },
];

// Todas as numerações disponíveis.
const SIZES = ["33", "34", "35", "36", "37", "38", "39", "40", "41"];
const SOLD_OUT_SIZES: string[] = [];

const VARIANT_IDS: Record<string, number> = {
  "33": 252579869,
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
    text: "Eu fiquei apaixonada! A sandália é ainda mais bonita pessoalmente, super confortável e veio muito bem embalada. O couro é macio e o acabamento é impecável. Foi uma das melhores compras que já fiz.",
    photo: review1,
  },
  {
    name: "mariana.s",
    rating: 5,
    when: "há 3 semanas",
    text: "Maravilhosa e o tamanho ficou certinho no pé. Já usei duas vezes e recebi elogios. Mesmo com o salto alto, a plataforma deixa o calce bem confortável. Vale muito a pena!",
    photo: review2,
  },
  {
    name: "camila.r",
    rating: 5,
    when: "há 1 mês",
    text: "Chegou rápido e é linda demais! Consigo usar tanto para trabalhar quanto para sair. Leve, confortável e o acabamento me surpreendeu. Recomendo de olhos fechados.",
    photo: review3,
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
      { property: "product:price:amount", content: "890.00" },
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
  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [descOpen, setDescOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = useServerFn(createZedyCheckout);

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
    try {
      const { url } = await createCheckout({
        data: { items: [{ variantId: variantId!, quantity: 1 }] },
      });
      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao abrir o pagamento. Tente novamente.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#111]">
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
          <p className="mt-3 text-[22px] font-medium">R$ 890</p>
          <p className="mt-1 text-[13px] text-black/60">ou 6x de R$148,33 sem juros</p>
          <p className="mt-2 text-[13px] text-black/70">
            Receba até <strong>R$ 89,00</strong> de cashback
          </p>

          {/* Cor */}
          <p className="mt-7 text-[13px]">
            <strong>Cor:</strong> {COLORS[colorIdx].label}
          </p>
          <div className="mt-2 flex gap-2">
            {COLORS.map((c, i) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setColorIdx(i)}
                aria-label={c.label}
                className={`h-[108px] w-[86px] border bg-[#f7f7f7] p-1 ${
                  i === colorIdx ? "border-[#111]" : "border-black/15"
                }`}
              >
                <img src={c.thumb} alt={c.label} className="h-full w-full object-contain" />
              </button>
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
            <p className="text-[13px] font-semibold">
              Verificar disponibilidade nas lojas próximas a você
            </p>
            <div className="mt-3 flex">
              <input
                placeholder="_____-___"
                className="h-[46px] flex-1 border border-black/25 px-3 text-[13px] outline-none"
              />
              <button
                type="button"
                className="h-[46px] border border-l-0 border-black/25 px-4 text-[12px] font-semibold tracking-wide"
              >
                CONSULTAR
              </button>
            </div>
            <p className="mt-3 text-[13px] underline">Compartilhar minha localização</p>
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
                  Para quem não tem medo de se destacar, a Sandália Meia Pata Riviera
                  representa o equilíbrio perfeito entre a ousadia máxima e a sofisticação
                  urbana. No formato tamanco (mule), ela traz uma tira larga sobre o peito do
                  pé que garante o calce fácil e um visual incrivelmente limpo e moderno.
                </p>
                <p>
                  A combinação do salto agulha vertiginoso com a imponente plataforma meia
                  pata cria uma silhueta ultra-alongada, poderosa e cheia de atitude. Com
                  acabamento premium e design ergonômico, esse modelo é a escolha definitiva
                  para transformar qualquer produção minimalista em um look de passarela.
                </p>
                <div>
                  <p className="font-semibold text-[#111]">Características</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Material: Couro</li>
                    <li>Cor: {COLORS[colorIdx].label}</li>
                    <li>Tamanho do salto: 14 cm</li>
                    <li>Referência: S2272300080004</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <footer className="mt-16 border-t border-black/10 px-6 py-10 text-[12px] text-black/50">
        © SCHUTZ. Todos os direitos reservados.
      </footer>
    </div>
  );
}
