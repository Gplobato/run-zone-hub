import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createSchutzPix, getSchutzOrderStatus } from "@/lib/schutz.functions";
import { fbqTrackSingle } from "@/lib/pixel";

const PIXEL_ID = "1577403850715282";
const PRODUCT_SLUG = "sandalia-meia-pata-riviera";
const PRODUCT_NAME = "Sandália Meia Pata Couro Preta";
const PRICE_CENTS = 89000;
const PRODUCT_IMAGE =
  "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/hfb/h63/h00/h00/13436215230494/Midres-Headless-S2272300080004-01.jpg";
const SIZES = ["33", "34", "35", "36", "37", "38", "39", "40", "41"];

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const onlyDigits = (v: string) => v.replace(/\D+/g, "");
const maskCPF = (v: string) =>
  onlyDigits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return d.length <= 10
    ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim()
    : d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};
const maskCEP = (v: string) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export const Route = createFileRoute("/checkout-schutz")({
  validateSearch: (search: Record<string, unknown>) => ({
    size: typeof search.size === "string" ? search.size : undefined,
    color: typeof search.color === "string" ? search.color : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pagamento seguro | SCHUTZ" },
      {
        name: "description",
        content:
          "Finalize sua compra da Sandália Meia Pata Riviera com PIX. Pagamento seguro e confirmação imediata.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Pagamento seguro | SCHUTZ" },
      {
        property: "og:description",
        content: "Checkout seguro Schutz com pagamento via PIX.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SchutzCheckout,
});

type Pix = {
  transactionId: string;
  pixCode: string;
  expirationDate: string | null;
  amountCents: number;
  orderRef: string;
  size: string;
};

const initialForm = {
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
};

function SchutzCheckout() {
  const { size: searchSize } = Route.useSearch();
  const navigate = useNavigate();
  const createPix = useServerFn(createSchutzPix);
  const getStatus = useServerFn(getSchutzOrderStatus);

  const [size, setSize] = useState<string>(
    searchSize && SIZES.includes(searchSize) ? searchSize : "",
  );
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<Pix | null>(null);
  const [status, setStatus] = useState<string>("pending");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const purchaseFired = useRef(false);

  const total = PRICE_CENTS;

  const set = (key: keyof typeof initialForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    fbqTrackSingle(PIXEL_ID, "InitiateCheckout", {
      content_ids: [PRODUCT_SLUG],
      content_name: PRODUCT_NAME,
      content_type: "product",
      value: total / 100,
      currency: "BRL",
    });
  }, [total]);

  // Busca de endereço pelo CEP
  useEffect(() => {
    const cep = onlyDigits(form.zipCode);
    if (cep.length !== 8) return;
    let cancelled = false;
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || d?.erro) return;
        setForm((prev) => ({
          ...prev,
          street: prev.street || d.logradouro || "",
          neighborhood: prev.neighborhood || d.bairro || "",
          city: prev.city || d.localidade || "",
          state: prev.state || d.uf || "",
        }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [form.zipCode]);

  // Polling do status
  useEffect(() => {
    if (!pix || status === "paid") return;
    const id = setInterval(async () => {
      try {
        const res = await getStatus({ data: { transactionId: pix.transactionId } });
        setStatus(res.status);
      } catch {
        // silencioso — tentamos novamente no próximo ciclo
      }
    }, 5000);
    return () => clearInterval(id);
  }, [pix, status, getStatus]);

  useEffect(() => {
    if (!pix) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [pix]);

  useEffect(() => {
    if (status === "paid" && !purchaseFired.current) {
      purchaseFired.current = true;
      fbqTrackSingle(PIXEL_ID, "Purchase", {
        content_ids: [PRODUCT_SLUG],
        content_name: PRODUCT_NAME,
        content_type: "product",
        value: total / 100,
        currency: "BRL",
      });
    }
  }, [status, total]);

  const countdown = useMemo(() => {
    if (!pix?.expirationDate) return null;
    const diff = new Date(pix.expirationDate).getTime() - now;
    if (Number.isNaN(diff) || diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [pix, now]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!size) {
      setError("Selecione o tamanho.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await createPix({
        data: { productSlug: PRODUCT_SLUG, size, quantity: 1, ...form },
      });
      setPix({
        transactionId: res.transactionId,
        pixCode: res.pixCode,
        expirationDate: res.expirationDate,
        amountCents: res.amountCents,
        orderRef: res.orderRef,
        size: res.size,
      });
      setStatus(res.status === "paid" ? "paid" : "pending");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível gerar o PIX. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyPix() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Não foi possível copiar. Selecione o código manualmente.");
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#111]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5">
          <Link to="/kit-sandalias" className="text-2xl font-extrabold tracking-tight">
            SCHUTZ
          </Link>
          <span className="text-[11px] font-semibold tracking-[0.18em] text-black/50">
            PAGAMENTO SEGURO
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-10">
        {!pix ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <form onSubmit={submit} className="order-2 lg:order-1">
              <h1 className="text-[20px] font-semibold tracking-tight">Finalizar compra</h1>
              <p className="mt-1 text-[13px] text-black/55">
                Pagamento via PIX. Confirmação em poucos segundos.
              </p>

              <Section title="Tamanho">
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSize(s);
                        setError(null);
                        navigate({
                          to: "/checkout-schutz",
                          search: { size: s, color: undefined },
                        });
                      }}
                      className={`h-[42px] w-[52px] border text-[13px] transition-colors ${
                        size === s
                          ? "border-[#111] bg-[#111] text-white"
                          : "border-black/25 hover:border-[#111]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Seus dados">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Nome completo"
                    value={form.name}
                    onChange={set("name")}
                    className="sm:col-span-2"
                    autoComplete="name"
                    required
                  />
                  <Field
                    label="E-mail"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                    required
                  />
                  <Field
                    label="CPF"
                    value={form.document}
                    onChange={(v) => set("document")(maskCPF(v))}
                    inputMode="numeric"
                    required
                  />
                  <Field
                    label="Telefone"
                    value={form.phone}
                    onChange={(v) => set("phone")(maskPhone(v))}
                    inputMode="tel"
                    required
                  />
                </div>
              </Section>

              <Section title="Entrega">
                <div className="grid gap-3 sm:grid-cols-6">
                  <Field
                    label="CEP"
                    value={form.zipCode}
                    onChange={(v) => set("zipCode")(maskCEP(v))}
                    inputMode="numeric"
                    className="sm:col-span-2"
                    required
                  />
                  <Field
                    label="Rua"
                    value={form.street}
                    onChange={set("street")}
                    className="sm:col-span-4"
                    required
                  />
                  <Field
                    label="Número"
                    value={form.streetNumber}
                    onChange={set("streetNumber")}
                    className="sm:col-span-2"
                    required
                  />
                  <Field
                    label="Complemento (opcional)"
                    value={form.complement}
                    onChange={set("complement")}
                    className="sm:col-span-4"
                  />
                  <Field
                    label="Bairro"
                    value={form.neighborhood}
                    onChange={set("neighborhood")}
                    className="sm:col-span-3"
                    required
                  />
                  <Field
                    label="Cidade"
                    value={form.city}
                    onChange={set("city")}
                    className="sm:col-span-2"
                    required
                  />
                  <Field
                    label="UF"
                    value={form.state}
                    onChange={(v) => set("state")(v.toUpperCase().slice(0, 2))}
                    className="sm:col-span-1"
                    required
                  />
                </div>
              </Section>

              {error && (
                <p className="mt-5 border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 h-[52px] w-full bg-[#0d1b2a] text-[13px] font-semibold tracking-[0.12em] text-white transition-opacity disabled:opacity-60"
              >
                {loading ? "GERANDO SEU PIX..." : "PAGAR COM PIX"}
              </button>
              <p className="mt-3 text-center text-[12px] text-black/50">
                Ambiente seguro · seus dados são criptografados
              </p>
            </form>

            <aside className="order-1 h-fit border border-black/10 p-5 lg:order-2 lg:sticky lg:top-6">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-black/50">
                RESUMO DO PEDIDO
              </p>
              <div className="mt-4 flex gap-4">
                <img
                  src={PRODUCT_IMAGE}
                  alt={PRODUCT_NAME}
                  className="h-[92px] w-[76px] bg-[#f5f5f5] object-cover"
                />
                <div className="text-[13px]">
                  <p className="font-semibold leading-snug">{PRODUCT_NAME}</p>
                  <p className="mt-1 text-black/55">Tamanho: {size || "—"}</p>
                  <p className="text-black/55">Qtd: 1</p>
                </div>
              </div>
              <dl className="mt-5 space-y-2 border-t border-black/10 pt-4 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-black/55">Subtotal</dt>
                  <dd>{brl(PRICE_CENTS)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-black/55">Frete</dt>
                  <dd className="text-[#1a7f37]">R$ 0,00</dd>
                </div>
                <div className="flex items-end justify-between border-t border-black/10 pt-3">
                  <dt className="text-[11px] font-semibold tracking-[0.16em] text-black/55">
                    TOTAL
                  </dt>
                  <dd className="text-[20px] font-medium">{brl(total)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-[12px] text-black/50">Limitado a 1 por CPF.</p>
            </aside>
          </div>
        ) : status === "paid" ? (
          <div className="mx-auto max-w-[520px] py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#1a7f37] text-[24px] text-[#1a7f37]">
              ✓
            </div>
            <h1 className="mt-5 text-[22px] font-semibold">Pagamento confirmado!</h1>
            <p className="mt-2 text-[13px] text-black/60">
              Recebemos seu pagamento de {brl(pix.amountCents)}. Você receberá os detalhes
              da entrega por e-mail.
            </p>
            <p className="mt-4 text-[12px] tracking-wide text-black/45">
              Pedido {pix.orderRef}
            </p>
            <Link
              to="/kit-sandalias"
              className="mt-8 inline-block h-[52px] border border-[#111] px-8 text-[13px] font-semibold leading-[52px] tracking-[0.12em]"
            >
              VOLTAR À LOJA
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-[560px]">
            <h1 className="text-center text-[20px] font-semibold">
              PIX gerado com sucesso
            </h1>
            <p className="mt-1 text-center text-[13px] text-black/55">
              Escaneie o QR Code ou use o código copia e cola para pagar.
            </p>

            <div className="mt-7 border border-black/10 p-6 text-center">
              <div className="mx-auto w-fit bg-white p-3">
                <QRCodeSVG value={pix.pixCode} size={220} level="M" />
              </div>
              <p className="mt-5 text-[22px] font-medium">{brl(pix.amountCents)}</p>
              <p className="text-[13px] text-black/55">
                {PRODUCT_NAME} · Tam. {pix.size}
              </p>

              <div className="mt-5 break-all border border-black/10 bg-[#f7f7f7] p-3 text-left font-mono text-[11px] leading-relaxed text-black/70">
                {pix.pixCode}
              </div>
              <button
                type="button"
                onClick={copyPix}
                className="mt-3 h-[52px] w-full bg-[#0d1b2a] text-[13px] font-semibold tracking-[0.12em] text-white"
              >
                {copied ? "✓ CÓDIGO PIX COPIADO" : "COPIAR CÓDIGO PIX"}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-[13px] text-black/60">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#d9a441]" />
                Aguardando pagamento
              </div>
              {countdown && (
                <p className="mt-1 text-[12px] text-black/45">
                  Expira em {countdown}
                </p>
              )}
              <p className="mt-3 text-[12px] text-black/45">
                A confirmação pode levar alguns segundos após o pagamento.
              </p>
            </div>

            {(status === "refused" || status === "canceled" || status === "expired") && (
              <div className="mt-5 border border-black/10 p-4 text-center">
                <p className="text-[13px] text-red-700">
                  Este PIX não pôde ser concluído ({status}).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPix(null);
                    setStatus("pending");
                  }}
                  className="mt-3 h-[46px] border border-[#111] px-6 text-[13px] font-semibold tracking-[0.12em]"
                >
                  GERAR NOVO PIX
                </button>
              </div>
            )}

            <ol className="mt-7 space-y-2 text-[13px] text-black/60">
              <li>1. Abra o app do seu banco e escolha pagar via PIX.</li>
              <li>2. Escaneie o QR Code ou cole o código copia e cola.</li>
              <li>3. Confirme o pagamento — esta tela atualiza automaticamente.</li>
            </ol>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-black/10 px-6 py-8 text-center text-[12px] text-black/45">
        © SCHUTZ. Todos os direitos reservados.
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-t border-black/10 pt-6">
      <p className="mb-3 text-[11px] font-semibold tracking-[0.16em] text-black/50">
        {title.toUpperCase()}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
  type = "text",
  required,
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  type?: string;
  required?: boolean;
  inputMode?: "text" | "numeric" | "tel";
  autoComplete?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[12px] text-black/55">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-[46px] w-full border border-black/25 px-3 text-[13px] outline-none focus:border-[#111]"
      />
    </label>
  );
}
