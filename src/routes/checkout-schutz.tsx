import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  createSchutzCard,
  createSchutzPix,
  getSchutzOrderStatus,
} from "@/lib/schutz.functions";
import { fbqTrackSingle } from "@/lib/pixel";
import {
  loadFastSoftSdk,
  maskCardNumber,
  maskExpiry,
  normalizeFourDigitYear,
  onlyDigits,
  validateCard,
} from "@/lib/fastsoft";

const PIXEL_ID = "1577403850715282";
const PRODUCT_SLUG = "sandalia-meia-pata-riviera";
const PRODUCT_NAME = "Sandália Meia Pata Couro Preta";
const PIX_PRICE_CENTS = 9990;
const CARD_PRICE_CENTS = 11753;
const MAX_INSTALLMENTS = 12;
const SHIPPING_FROM_CENTS = 3490;
const PRODUCT_IMAGE =
  "https://secure-static.schutz.com.br/medias/sys_master/schutz/schutz/hfb/h63/h00/h00/13436215230494/Midres-Headless-S2272300080004-01.jpg";
const SIZES = ["33", "34", "35", "36", "37", "38", "39", "40", "41"];

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
    tam: typeof search.tam === "string" ? search.tam : undefined,
    color: typeof search.color === "string" ? search.color : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Pagamento seguro | SCHUTZ" },
      {
        name: "description",
        content:
          "Finalize sua compra da Sandália Meia Pata Riviera com PIX ou cartão de crédito. Pagamento 100% seguro.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Pagamento seguro | SCHUTZ" },
      {
        property: "og:description",
        content: "Checkout seguro Schutz com PIX e cartão de crédito.",
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

type CardResult = {
  transactionId: string;
  orderRef: string;
  amountCents: number;
  installments: number;
  brand: string | null;
  lastDigits: string | null;
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

const initialCard = { number: "", holderName: "", expiry: "", cvv: "" };

const STATUS_LABEL: Record<string, string> = {
  processing: "Processando seu pagamento...",
  pending: "Aguardando pagamento",
  analysis: "Pagamento em análise.",
  authorized: "Pagamento autorizado. Aguardando confirmação.",
  paid: "Pagamento confirmado!",
  refused: "O pagamento não foi aprovado pelo emissor do cartão.",
  canceled: "O pagamento foi cancelado.",
  refunded: "Pagamento reembolsado.",
  disputed: "Pagamento em contestação.",
  chargeback: "Pagamento em chargeback.",
  expired: "Este pagamento expirou.",
};

function SchutzCheckout() {
  const { tam: searchSize } = Route.useSearch();
  const navigate = useNavigate();
  const createPix = useServerFn(createSchutzPix);
  const createCard = useServerFn(createSchutzCard);
  const getStatus = useServerFn(getSchutzOrderStatus);

  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [size, setSize] = useState<string>(
    searchSize && SIZES.includes(searchSize) ? searchSize : "",
  );
  const [form, setForm] = useState(initialForm);
  const [card, setCard] = useState(initialCard);
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<Pix | null>(null);
  const [cardResult, setCardResult] = useState<CardResult | null>(null);
  const [status, setStatus] = useState<string>("pending");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [sessionId, setSessionId] = useState("");
  const [shippingState, setShippingState] = useState<"idle" | "loading" | "done">("idle");
  const purchaseFired = useRef(false);

  const total = method === "pix" ? PIX_PRICE_CENTS : CARD_PRICE_CENTS;
  const done = pix ?? cardResult;

  const set = (key: keyof typeof initialForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    setSessionId(
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
  }, []);

  useEffect(() => {
    fbqTrackSingle(PIXEL_ID, "InitiateCheckout", {
      content_ids: [PRODUCT_SLUG],
      content_name: PRODUCT_NAME,
      content_type: "product",
      value: PIX_PRICE_CENTS / 100,
      currency: "BRL",
    });
  }, []);

  // Busca de endereço pelo CEP + simulação do frete
  useEffect(() => {
    const cep = onlyDigits(form.zipCode);
    if (cep.length !== 8) {
      setShippingState("idle");
      return;
    }
    let cancelled = false;
    setShippingState("loading");
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
    const timer = setTimeout(() => {
      if (!cancelled) setShippingState("done");
    }, 2000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.zipCode]);

  // Polling do status
  useEffect(() => {
    const transactionId = pix?.transactionId ?? cardResult?.transactionId;
    if (!transactionId) return;
    if (["paid", "refused", "canceled", "expired", "refunded"].includes(status)) return;
    const id = setInterval(async () => {
      try {
        const res = await getStatus({ data: { transactionId } });
        setStatus(res.status);
      } catch {
        // silencioso — nova tentativa no próximo ciclo
      }
    }, 5000);
    return () => clearInterval(id);
  }, [pix, cardResult, status, getStatus]);

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
        value: (done?.amountCents ?? total) / 100,
        currency: "BRL",
      });
    }
  }, [status, done, total]);

  const countdown = useMemo(() => {
    if (!pix?.expirationDate) return null;
    const diff = new Date(pix.expirationDate).getTime() - now;
    if (Number.isNaN(diff) || diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [pix, now]);

  const installmentOptions = useMemo(
    () =>
      Array.from({ length: MAX_INSTALLMENTS }, (_, i) => {
        const n = i + 1;
        return { n, label: `${n}x de ${brl(Math.round(CARD_PRICE_CENTS / n))} sem juros` };
      }),
    [],
  );

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
      if (method === "pix") {
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
      } else {
        await payWithCard();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível concluir o pagamento.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function payWithCard() {
    const localError = validateCard(card);
    if (localError) throw new Error(localError);

    const sdk = await loadFastSoftSdk();

    const exp = onlyDigits(card.expiry);
    const cardData = {
      number: onlyDigits(card.number),
      holderName: card.holderName.trim().toUpperCase(),
      expMonth: exp.slice(0, 2).padStart(2, "0"),
      expYear: normalizeFourDigitYear(exp.slice(2)),
      cvv: onlyDigits(card.cvv),
    };

    let threeDsStatus = "disabled";
    let threeDsInitialized = false;
    try {
      const enabled = await Promise.resolve(sdk.isThreeDSEnabled?.() ?? false);
      if (enabled && sdk.initializeThreeDS && sdk.authenticateThreeDS) {
        await sdk.initializeThreeDS({
          amount: CARD_PRICE_CENTS,
          currency: "BRL",
          installments,
          card: {
            number: cardData.number,
            holderName: cardData.holderName,
            expMonth: cardData.expMonth,
            expYear: cardData.expYear,
          },
        });
        threeDsInitialized = true;
        const result = await sdk.authenticateThreeDS({
          customer: {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            phoneNumber: onlyDigits(form.phone),
          },
          address: {
            street: form.street.trim(),
            streetNumber: form.streetNumber.trim(),
            complement: form.complement?.trim() || "",
            zipCode: onlyDigits(form.zipCode),
            neighborhood: form.neighborhood.trim(),
            city: form.city.trim(),
            state: form.state.trim().toUpperCase(),
            country: "BR",
          },
        });
        threeDsStatus = String(result?.status ?? "success");
      }
    } catch {
      throw new Error("Não foi possível concluir a autenticação do cartão.");
    }

    let cardToken: string;
    try {
      cardToken = await sdk.encrypt(cardData);
    } catch {
      throw new Error("Não foi possível validar os dados do cartão. Confira as informações.");
    }
    if (typeof cardToken !== "string" || cardToken.trim().length < 8) {
      throw new Error("Não foi possível validar os dados do cartão. Confira as informações.");
    }

    if (threeDsInitialized) {
      try {
        await sdk.finalizeThreeDS?.();
      } catch {
        // o SDK cuida do fluxo de desafio; seguimos com a cobrança
      }
    }

    fbqTrackSingle(PIXEL_ID, "AddPaymentInfo", {
      content_ids: [PRODUCT_SLUG],
      content_type: "product",
      value: CARD_PRICE_CENTS / 100,
      currency: "BRL",
      payment_method: "credit_card",
      installments,
    });

    const res = await createCard({
      data: {
        productSlug: PRODUCT_SLUG,
        size,
        quantity: 1,
        ...form,
        cardToken,
        installments,
        sessionId,
        threeDsStatus,
      },
    });

    // Limpa imediatamente os dados sensíveis do state.
    setCard(initialCard);

    setCardResult({
      transactionId: res.transactionId,
      orderRef: res.orderRef,
      amountCents: res.amountCents,
      installments: res.installments,
      brand: res.card.brand,
      lastDigits: res.card.lastDigits,
    });
    setStatus(res.status);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  function retryCard() {
    setCardResult(null);
    setStatus("pending");
    setError(null);
    purchaseFired.current = false;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#111]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <Link to="/kit-sandalias" className="text-xl font-extrabold tracking-tight sm:text-2xl">
            SCHUTZ
          </Link>
          <span className="text-[10px] font-semibold tracking-[0.18em] text-black/50 sm:text-[11px]">
            PAGAMENTO SEGURO
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-10">
        <input type="hidden" id="sessionId" value={sessionId} readOnly />

        {status === "paid" && done ? (
          <div className="mx-auto max-w-[520px] py-8 text-center sm:py-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#1a7f37] text-[24px] text-[#1a7f37]">
              ✓
            </div>
            <h1 className="mt-5 text-[20px] font-semibold sm:text-[22px]">
              Pagamento confirmado!
            </h1>
            <p className="mt-2 text-[13px] text-black/60">
              Recebemos seu pagamento de {brl(done.amountCents)}. Você receberá os detalhes
              da entrega por e-mail.
            </p>
            <p className="mt-4 text-[12px] tracking-wide text-black/45">
              Pedido {done.orderRef}
            </p>
            <Link
              to="/kit-sandalias"
              className="mt-8 inline-block h-[52px] border border-[#111] px-8 text-[13px] font-semibold leading-[52px] tracking-[0.12em]"
            >
              VOLTAR À LOJA
            </Link>
          </div>
        ) : cardResult ? (
          <div className="mx-auto max-w-[560px]">
            <div className="border border-black/10 p-5 text-center sm:p-6">
              <p className="text-[16px] font-semibold sm:text-[18px]">
                {STATUS_LABEL[status] ?? "Processando seu pagamento..."}
              </p>
              <p className="mt-2 text-[13px] text-black/60">
                {brl(cardResult.amountCents)} em {cardResult.installments}x
                {cardResult.brand ? ` · ${cardResult.brand}` : ""}
                {cardResult.lastDigits ? ` •••• ${cardResult.lastDigits}` : ""}
              </p>

              {["processing", "analysis", "authorized", "pending"].includes(status) && (
                <div className="mt-5 flex items-center justify-center gap-2 text-[13px] text-black/60">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#d9a441]" />
                  Esta tela atualiza automaticamente
                </div>
              )}

              {["refused", "canceled"].includes(status) && (
                <div className="mt-6 space-y-3">
                  <p className="text-[13px] text-red-700">
                    Tente outro cartão ou pague com PIX.
                  </p>
                  <button
                    type="button"
                    onClick={retryCard}
                    className="h-[52px] w-full border border-[#111] text-[13px] font-semibold tracking-[0.12em]"
                  >
                    TENTAR OUTRO CARTÃO
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      retryCard();
                      setMethod("pix");
                    }}
                    className="h-[52px] w-full bg-[#0d1b2a] text-[13px] font-semibold tracking-[0.12em] text-white"
                  >
                    PAGAR COM PIX (15% OFF)
                  </button>
                </div>
              )}
              <p className="mt-4 text-[12px] text-black/45">Pedido {cardResult.orderRef}</p>
            </div>
          </div>
        ) : pix ? (
          <div className="mx-auto max-w-[560px]">
            <h1 className="text-center text-[18px] font-semibold sm:text-[20px]">
              PIX gerado com sucesso
            </h1>
            <p className="mt-1 text-center text-[13px] text-black/55">
              Escaneie o QR Code ou use o código copia e cola para pagar.
            </p>

            <div className="mt-6 border border-black/10 p-4 text-center sm:mt-7 sm:p-6">
              <div className="mx-auto w-fit bg-white p-2 sm:p-3">
                <QRCodeSVG value={pix.pixCode} size={200} level="M" />
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
                <p className="mt-1 text-[12px] text-black/45">Expira em {countdown}</p>
              )}
            </div>

            {(status === "refused" || status === "canceled" || status === "expired") && (
              <div className="mt-5 border border-black/10 p-4 text-center">
                <p className="text-[13px] text-red-700">
                  Este PIX não pôde ser concluído.
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
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-10">
            <form onSubmit={submit} className="order-2 lg:order-1">
              <h1 className="text-[18px] font-semibold tracking-tight sm:text-[20px]">
                Finalizar compra
              </h1>

              <Section title="Forma de pagamento">
                <div className="grid grid-cols-2 gap-2">
                  <MethodTab
                    active={method === "pix"}
                    onClick={() => setMethod("pix")}
                    title="PIX"
                    subtitle="15% OFF à vista"
                  />
                  <MethodTab
                    active={method === "card"}
                    onClick={() => setMethod("card")}
                    title="Cartão"
                    subtitle={`até ${MAX_INSTALLMENTS}x sem juros`}
                  />
                </div>
                <p className="mt-3 border border-[#1a7f37]/30 bg-[#1a7f37]/10 px-3 py-2 text-[12px] font-medium text-[#1a7f37] sm:text-[13px]">
                  ✓ O desconto de 15% é exclusivo no PIX — o valor de {brl(PIX_PRICE_CENTS)}{" "}
                  já está com o desconto aplicado. No cartão o valor é{" "}
                  {brl(CARD_PRICE_CENTS)}.
                </p>
              </Section>

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
                          search: { tam: s, color: undefined },
                        });
                      }}
                      className={`h-[44px] min-w-[52px] flex-1 border text-[13px] transition-colors sm:flex-none ${
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
                    autoComplete="postal-code"
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

                {shippingState === "loading" && (
                  <div className="mt-4 flex items-center gap-3 border border-black/10 bg-[#f7f7f7] px-3 py-3 text-[13px] text-black/60">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-[#111]" />
                    Calculando frete e prazo de entrega...
                  </div>
                )}
                {shippingState === "done" && (
                  <div className="mt-4 border border-[#1a7f37]/30 bg-[#1a7f37]/10 px-3 py-3">
                    <p className="text-[13px] font-medium text-[#111]">
                      Prazo de entrega: 1 a 3 dias úteis
                    </p>
                    <p className="mt-1 text-[13px]">
                      <span className="text-black/45 line-through">
                        {brl(SHIPPING_FROM_CENTS)}
                      </span>{" "}
                      <strong className="text-[#1a7f37]">
                        R$ 0,00 — FRETE GRÁTIS
                      </strong>
                    </p>
                  </div>
                )}
              </Section>

              {method === "card" && (
                <Section title="Dados do cartão">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Número do cartão"
                      value={card.number}
                      onChange={(v) => setCard((c) => ({ ...c, number: maskCardNumber(v) }))}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className="sm:col-span-2"
                      required
                    />
                    <Field
                      label="Nome impresso no cartão"
                      value={card.holderName}
                      onChange={(v) =>
                        setCard((c) => ({ ...c, holderName: v.toUpperCase() }))
                      }
                      autoComplete="cc-name"
                      className="sm:col-span-2"
                      required
                    />
                    <Field
                      label="Validade (MM/AA)"
                      value={card.expiry}
                      onChange={(v) => setCard((c) => ({ ...c, expiry: maskExpiry(v) }))}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      required
                    />
                    <Field
                      label="CVV"
                      value={card.cvv}
                      onChange={(v) =>
                        setCard((c) => ({ ...c, cvv: onlyDigits(v).slice(0, 4) }))
                      }
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      required
                    />
                    <label className="block sm:col-span-2">
                      <span className="text-[12px] text-black/55">Parcelas</span>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="mt-1 h-[48px] w-full border border-black/25 bg-white px-3 text-[13px] outline-none focus:border-[#111]"
                      >
                        {installmentOptions.map((o) => (
                          <option key={o.n} value={o.n}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="mt-3 text-[12px] text-black/50">
                    Seus dados são criptografados no navegador e não trafegam pelos nossos
                    servidores.
                  </p>
                </Section>
              )}

              {error && (
                <p className="mt-5 border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 h-[54px] w-full bg-[#0d1b2a] text-[13px] font-semibold tracking-[0.12em] text-white transition-opacity disabled:opacity-60"
              >
                {loading
                  ? "PROCESSANDO..."
                  : method === "pix"
                    ? `PAGAR COM PIX · ${brl(PIX_PRICE_CENTS)}`
                    : `PAGAR COM CARTÃO · ${brl(CARD_PRICE_CENTS)}`}
              </button>
              <p className="mt-3 text-center text-[12px] text-black/50">
                Ambiente seguro · seus dados são criptografados
              </p>
            </form>

            <aside className="order-1 h-fit border border-black/10 p-4 sm:p-5 lg:order-2 lg:sticky lg:top-6">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-black/50">
                RESUMO DO PEDIDO
              </p>
              <div className="mt-4 flex gap-4">
                <img
                  src={PRODUCT_IMAGE}
                  alt={PRODUCT_NAME}
                  className="h-[92px] w-[76px] shrink-0 bg-[#f5f5f5] object-cover"
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
                  <dd>{brl(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-black/55">Frete</dt>
                  <dd className="text-[#1a7f37]">Grátis</dd>
                </div>
                {method === "pix" && (
                  <div className="flex justify-between text-[#1a7f37]">
                    <dt>Desconto PIX</dt>
                    <dd>15% aplicado</dd>
                  </div>
                )}
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
        )}
      </main>

      <footer className="mt-12 border-t border-black/10 px-4 py-8 text-center text-[12px] text-black/45 sm:px-6">
        © SCHUTZ. Todos os direitos reservados.
      </footer>
    </div>
  );
}

function MethodTab({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[60px] flex-col items-center justify-center border text-[13px] transition-colors ${
        active ? "border-[#111] bg-[#111] text-white" : "border-black/25 hover:border-[#111]"
      }`}
    >
      <span className="font-semibold tracking-[0.08em]">{title}</span>
      <span className={`text-[11px] ${active ? "text-white/70" : "text-black/50"}`}>
        {subtitle}
      </span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-7 border-t border-black/10 pt-6 sm:mt-8">
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
        className="mt-1 h-[48px] w-full border border-black/25 px-3 text-[16px] outline-none focus:border-[#111] sm:text-[13px]"
      />
    </label>
  );
}
