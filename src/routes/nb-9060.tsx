import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  CreditCard,
  Edit3,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { formatBRL } from "@/lib/products";
import { fbqInit, fbqTrackPageViewOnce, fbqTrackSingle } from "@/lib/pixel";
import { createHypercashTransaction, getHypercashTransaction } from "@/lib/hypercash.functions";
import nb9060Rose from "@/assets/products/nb-9060-rose.png";
import payAmex from "@/assets/mercadopromo/pay-amex.png";
import payElo from "@/assets/mercadopromo/pay-elo.png";
import payMastercard from "@/assets/mercadopromo/pay-mastercard.png";
import payPix from "@/assets/mercadopromo/pay-pix.png";
import payVisa from "@/assets/mercadopromo/pay-visa.png";
import pixLogo from "@/assets/mercadopromo/pix-logo.png";

const PRICE_CENTS = 7990;
const SHIPPING_CENTS = 0;
const PIXEL_CONTENT_ID = "nb-9060";
const NB9060_PIXEL_ID = "1040492725582996";
const SIZES = ["34/35", "36/37", "38/39", "40/41", "42/43", "43/44"] as const;

function trackNb9060Event(event: string, params?: Record<string, unknown>) {
  fbqTrackSingle(NB9060_PIXEL_ID, event, params);
}

const COLORS = [
  {
    key: "branco",
    label: "Branco / Clássico",
    variantId: 250703130,
    image: "https://assetsglobalbr.com/u/testimony/fe6916cd.png",
    secondaryImage: "https://assetsglobalbr.com/u/testimony/27038a4a.webp",
    soldOut: false,
  },
  {
    key: "preto",
    label: "Preto / Creme",
    variantId: 250703640,
    image: "https://assetsglobalbr.com/u/testimony/8cbd4aab.png",
    secondaryImage: "https://assetsglobalbr.com/u/testimony/5620e758.webp",
    soldOut: false,
  },
  {
    key: "rose",
    label: "Rosé / Bege",
    variantId: null,
    image: nb9060Rose,
    secondaryImage: nb9060Rose,
    soldOut: true,
  },
] as const;

type AvailableColor = Extract<(typeof COLORS)[number], { soldOut: false }>;
type PixData = {
  qrcode?: string;
  qrCode?: string;
  copyPaste?: string;
  code?: string;
  qrcodeBase64?: string;
  qrCodeBase64?: string;
  qrcodeUrl?: string;
  qrCodeUrl?: string;
  expiresAt?: string;
};

type CheckoutStep = 1 | 2 | 3;
type ShippingState = "idle" | "calculating" | "ready";
type PaymentMethod = "PIX" | "CREDIT_CARD";
type CheckoutTransaction = {
  id: string;
  status: string;
  paymentMethod: PaymentMethod;
  pix: PixData | null;
};

export const Route = createFileRoute("/nb-9060")({
  head: () => ({
    meta: [
      { title: "Tênis NB 9060 Running — Paze" },
      {
        name: "description",
        content:
          "Tênis NB 9060 Running unissex, visual robusto, cabedal respirável, solado reforçado e checkout seguro na própria página.",
      },
      { property: "og:type", content: "product" },
      { property: "og:title", content: "Tênis NB 9060 Running" },
      {
        property: "og:description",
        content:
          "Escolha cor e tamanho do NB 9060 e finalize com Pix ou cartão no checkout seguro.",
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

const emptyForm = {
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

const emptyCard = {
  number: "",
  holderName: "",
  expiration: "",
  cvv: "",
  installments: "1",
};

function Nb9060Page() {
  const createTx = useServerFn(createHypercashTransaction);
  const getTx = useServerFn(getHypercashTransaction);
  const checkoutRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackedPurchaseIdsRef = useRef(new Set<string>());

  const [selectedColor, setSelectedColor] = useState<AvailableColor>(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<(typeof SIZES)[number]>(SIZES[0]);
  const [activeImage, setActiveImage] = useState(COLORS[0].image);
  const [qty, setQty] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [form, setForm] = useState(emptyForm);
  const [card, setCard] = useState(emptyCard);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [shippingState, setShippingState] = useState<ShippingState>("idle");
  const [shippingSelected, setShippingSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<CheckoutTransaction | null>(null);
  const [paid, setPaid] = useState(false);

  const totalCents = PRICE_CENTS * qty + SHIPPING_CENTS;
  const gallery = useMemo(
    () => [selectedColor.image, selectedColor.secondaryImage],
    [selectedColor],
  );

  useEffect(() => {
    fbqInit(NB9060_PIXEL_ID);
    fbqTrackPageViewOnce(NB9060_PIXEL_ID);
  }, []);

  const trackPurchaseOnce = useCallback(
    (transactionId: string, method: PaymentMethod, status: string) => {
      if (!transactionId || trackedPurchaseIdsRef.current.has(transactionId)) return;
      trackedPurchaseIdsRef.current.add(transactionId);
      trackNb9060Event("Purchase", {
        ...pixelPayload(selectedColor, qty, selectedSize),
        order_id: transactionId,
        payment_method: method,
        payment_status: status,
      });
    },
    [qty, selectedColor, selectedSize],
  );

  useEffect(() => {
    setActiveImage(selectedColor.image);
  }, [selectedColor]);

  useEffect(() => {
    trackNb9060Event("ViewContent", pixelPayload(selectedColor, qty, selectedSize));
  }, [selectedColor, qty, selectedSize]);

  useEffect(() => {
    const cep = onlyDigits(form.zipCode);
    if (cep.length !== 8) {
      setCepLoading(false);
      setCepError(null);
      setShippingState("idle");
      setShippingSelected(false);
      return;
    }
    let cancelled = false;
    setCepLoading(true);
    setCepError(null);
    setShippingState("idle");
    setShippingSelected(false);
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((response) => response.json())
      .then(
        (data: {
          logradouro?: string;
          bairro?: string;
          localidade?: string;
          uf?: string;
          erro?: boolean;
        }) => {
          if (cancelled) return;
          if (data.erro) {
            setCepError("CEP não encontrado. Confira os números e tente novamente.");
            return;
          }
          setForm((current) => ({
            ...current,
            street: data.logradouro || current.street,
            neighborhood: data.bairro || current.neighborhood,
            city: data.localidade || current.city,
            state: data.uf || current.state,
          }));
          setShippingState("calculating");
          window.setTimeout(() => {
            if (!cancelled) setShippingState("ready");
          }, 1900);
        },
      )
      .catch(() => {
        if (!cancelled)
          setCepError("Não foi possível consultar o CEP agora. Preencha o endereço manualmente.");
      })
      .finally(() => {
        if (!cancelled) setCepLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.zipCode]);

  useEffect(() => {
    if (!tx) return;
    window.setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, [tx]);

  useEffect(() => {
    if (!tx?.id || paid) return;
    pollRef.current = setInterval(async () => {
      try {
        const response = await getTx({ data: { id: tx.id } });
        if (isPaidStatus(response.status)) {
          setPaid(true);
          trackPurchaseOnce(tx.id, tx.paymentMethod, response.status);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Polling silencioso para nao atrapalhar quem esta pagando.
      }
    }, 4500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [getTx, paid, trackPurchaseOnce, tx?.id, tx?.paymentMethod]);

  const hasCustomer = useMemo(
    () =>
      form.name.trim().length > 2 &&
      /.+@.+\..+/.test(form.email) &&
      onlyDigits(form.document).length === 11 &&
      onlyDigits(form.phone).length >= 10,
    [form.document, form.email, form.name, form.phone],
  );

  const hasAddress = useMemo(
    () =>
      onlyDigits(form.zipCode).length === 8 &&
      form.street.trim() &&
      form.streetNumber.trim() &&
      form.neighborhood.trim() &&
      form.city.trim() &&
      form.state.trim().length === 2,
    [form.city, form.neighborhood, form.state, form.street, form.streetNumber, form.zipCode],
  );

  const canSubmit = useMemo(() => {
    if (!shippingSelected) return false;
    if (paymentMethod === "PIX") return Boolean(hasCustomer && hasAddress);

    const [month, year] = parseExpiration(card.expiration);
    return Boolean(
      hasCustomer &&
      hasAddress &&
      onlyDigits(card.number).length >= 13 &&
      card.holderName.trim().length > 2 &&
      month &&
      year &&
      onlyDigits(card.cvv).length >= 3,
    );
  }, [card, hasAddress, hasCustomer, paymentMethod, shippingSelected]);

  function openInternalCheckout(source: "buy_now" | "add_to_cart") {
    const payload = pixelPayload(selectedColor, qty, selectedSize);
    if (source === "add_to_cart") trackNb9060Event("AddToCart", payload);
    trackNb9060Event("InitiateCheckout", payload);
    setCheckoutOpen(true);
    setCheckoutStep(1);
    setTx(null);
    setPaid(false);
    window.setTimeout(() => {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    setTx(null);
    setPaid(false);

    trackNb9060Event("AddPaymentInfo", {
      ...pixelPayload(selectedColor, qty, selectedSize),
      payment_method: paymentMethod,
    });

    try {
      const [expirationMonth, expirationYear] = parseExpiration(card.expiration);
      const response = await createTx({
        data: {
          paymentMethod,
          items: [
            {
              slug: `${PIXEL_CONTENT_ID}-${selectedColor.key}-${selectedSize}`,
              title: `Tênis NB 9060 Running - ${selectedColor.label} - Tam ${selectedSize}`,
              unitPriceCents: PRICE_CENTS,
              quantity: qty,
            },
          ],
          shippingFeeCents: SHIPPING_CENTS,
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            document: form.document,
            phone: form.phone,
          },
          address: {
            street: form.street,
            streetNumber: form.streetNumber,
            complement: form.complement || undefined,
            zipCode: form.zipCode,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state.toUpperCase(),
          },
          card:
            paymentMethod === "CREDIT_CARD"
              ? {
                  number: card.number,
                  holderName: card.holderName,
                  expirationMonth,
                  expirationYear,
                  cvv: card.cvv,
                  installments: Number(card.installments),
                }
              : undefined,
        },
      });

      if (isFailedStatus(response.status)) {
        setError(
          paymentMethod === "CREDIT_CARD"
            ? "O cartão não foi aprovado. Confira os dados ou tente outro cartão."
            : "Não foi possível gerar o Pix. Tente novamente em instantes.",
        );
        return;
      }

      const transactionId = response.id ? String(response.id) : "";
      if (!transactionId) throw new Error("A Hypercash não retornou o código da transação.");

      trackPurchaseOnce(transactionId, paymentMethod, response.status);

      if (paymentMethod === "CREDIT_CARD" && isPaidStatus(response.status)) {
        setPaid(true);
      } else {
        setTx({
          id: transactionId,
          status: response.status,
          paymentMethod,
          pix: (response.pix as PixData) ?? null,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar o pagamento.");
    } finally {
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
              Visual robusto, conforto para o dia a dia e estética urbana retrô-futurista.
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
              O NB 9060 combina cabedal respirável, sobreposições estruturadas e solado reforçado,
              proporcionando melhor ajuste, estabilidade e conforto durante as passadas.
            </p>

            <div className="mt-6">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Cor: <span className="text-[color:var(--graphite)]">{selectedColor.label}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {COLORS.map((color) => {
                  const selected = selectedColor.key === color.key;
                  return (
                    <button
                      key={color.key}
                      type="button"
                      disabled={color.soldOut}
                      onClick={() => {
                        if (!color.soldOut) setSelectedColor(color);
                      }}
                      className={`relative flex items-center gap-3 rounded-sm border p-2 text-left transition-colors ${
                        selected
                          ? "border-[color:var(--graphite)] bg-[color:var(--graphite)] text-[color:var(--bone)]"
                          : "border-[color:var(--graphite)]/15 bg-white hover:border-[color:var(--sage)]"
                      } ${color.soldOut ? "cursor-not-allowed opacity-55" : ""}`}
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
                        {color.soldOut && (
                          <span className="mt-1 block text-[10px] text-[color:var(--terracotta)]">
                            Esgotado
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
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
                onClick={() => openInternalCheckout("add_to_cart")}
                className="flex-1 rounded-sm border border-[color:var(--graphite)] px-4 py-4 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-[color:var(--graphite)] hover:text-[color:var(--bone)]"
              >
                Adicionar ao carrinho
              </button>
            </div>

            <button
              onClick={() => openInternalCheckout("buy_now")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--terracotta)] py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)] transition-opacity hover:opacity-90"
            >
              Comprar agora
            </button>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[color:var(--graphite)]/10 pt-6 text-xs">
              <InfoIcon icon={<Truck />} label="Entrega em todo o Brasil" />
              <InfoIcon icon={<RotateCcw />} label="Troca em 30 dias" />
              <InfoIcon icon={<ShieldCheck />} label="Pagamento protegido" />
            </div>
          </section>
        </div>

        {checkoutOpen && (
          <section
            ref={checkoutRef}
            className="mt-12 scroll-mt-4 rounded-md border border-[color:var(--graphite)]/10 bg-[#f7f7f5] p-3 shadow-sm md:mt-16 md:p-6"
          >
            <div className="mb-5 flex flex-col gap-4 border-b border-[color:var(--graphite)]/10 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
                  / Checkout seguro
                </div>
                <h2 className="mt-1 font-display text-3xl tracking-wide">Finalize sua compra</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-[color:var(--sage)]" />
                  Seus dados são criptografados do início ao fim.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[payAmex, payElo, payVisa, payMastercard, payPix].map((src) => (
                  <span
                    key={src}
                    className="flex h-8 w-12 items-center justify-center rounded-sm border border-[color:var(--graphite)]/10 bg-white p-1"
                  >
                    <img src={src} alt="" className="max-h-5 max-w-full" />
                  </span>
                ))}
              </div>
            </div>

            <CheckoutProgress current={tx || paid ? 3 : checkoutStep} />

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
              <div className="min-w-0">
                {paid ? (
                  <div className="rounded-md border border-[color:var(--sage)]/40 bg-white p-5 md:p-8">
                    <SuccessPanel />
                  </div>
                ) : tx ? (
                  <div className="rounded-md border border-[color:var(--graphite)]/10 bg-white p-5 md:p-8">
                    {tx.paymentMethod === "PIX" ? (
                      <PixPanel tx={tx} totalCents={totalCents} />
                    ) : (
                      <CardProcessingPanel status={tx.status} />
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {checkoutStep > 1 && (
                      <CompletedCheckoutBlock
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        title="Identificação"
                        onEdit={() => setCheckoutStep(1)}
                      >
                        <div className="font-medium text-[color:var(--graphite)]">{form.name}</div>
                        <div>
                          {form.email} · {form.phone}
                        </div>
                      </CompletedCheckoutBlock>
                    )}

                    {checkoutStep === 1 && (
                      <div className="rounded-md border border-[color:var(--graphite)]/10 bg-white p-4 md:p-6">
                        <CheckoutStepHeading
                          step={1}
                          title="Identificação"
                          description="Preencha seus dados para acompanhar e receber o pedido."
                        />
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <Field label="Nome completo" className="sm:col-span-2">
                            <input
                              autoComplete="name"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              placeholder="Digite seu nome completo"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="E-mail">
                            <input
                              type="email"
                              autoComplete="email"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              placeholder="voce@email.com"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Celular / WhatsApp">
                            <input
                              inputMode="tel"
                              autoComplete="tel"
                              value={form.phone}
                              onChange={(e) =>
                                setForm({ ...form, phone: maskPhone(e.target.value) })
                              }
                              placeholder="(11) 99999-9999"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="CPF" className="sm:col-span-2">
                            <input
                              inputMode="numeric"
                              autoComplete="off"
                              value={form.document}
                              onChange={(e) =>
                                setForm({ ...form, document: maskCPF(e.target.value) })
                              }
                              placeholder="000.000.000-00"
                              className={inputCls}
                            />
                          </Field>
                        </div>
                        <button
                          type="button"
                          disabled={!hasCustomer}
                          onClick={() => setCheckoutStep(2)}
                          className={primaryButtonCls}
                        >
                          Continuar para entrega
                          <Truck className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {checkoutStep > 2 && (
                      <CompletedCheckoutBlock
                        icon={<MapPin className="h-5 w-5" />}
                        title="Entrega"
                        onEdit={() => setCheckoutStep(2)}
                      >
                        <div className="font-medium text-[color:var(--graphite)]">
                          {form.street}, {form.streetNumber}
                          {form.complement ? ` · ${form.complement}` : ""}
                        </div>
                        <div>
                          {form.neighborhood} · {form.city}/{form.state} · {form.zipCode}
                        </div>
                        <div className="mt-1 font-medium text-[color:var(--sage)]">
                          SEDEX grátis · 1 a 3 dias úteis
                        </div>
                      </CompletedCheckoutBlock>
                    )}

                    {checkoutStep === 2 && (
                      <div className="rounded-md border border-[color:var(--graphite)]/10 bg-white p-4 md:p-6">
                        <CheckoutStepHeading
                          step={2}
                          title="Entrega"
                          description="Informe onde você quer receber seu NB 9060."
                        />
                        <div className="mt-5 grid gap-4 sm:grid-cols-6">
                          <Field label="CEP" className="sm:col-span-2">
                            <div className="relative">
                              <input
                                inputMode="numeric"
                                autoComplete="postal-code"
                                value={form.zipCode}
                                onChange={(e) =>
                                  setForm({ ...form, zipCode: maskCEP(e.target.value) })
                                }
                                placeholder="00000-000"
                                className={`${inputCls} pr-10`}
                              />
                              {cepLoading && (
                                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-[color:var(--sage)]" />
                              )}
                              {!cepLoading &&
                                onlyDigits(form.zipCode).length === 8 &&
                                !cepError && (
                                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-[color:var(--sage)]" />
                                )}
                            </div>
                          </Field>
                          <div className="flex items-end sm:col-span-4">
                            <p className="pb-3 text-xs text-muted-foreground">
                              O endereço é preenchido automaticamente pelo CEP.
                            </p>
                          </div>
                          {cepError && (
                            <div className="sm:col-span-6 flex items-start gap-2 rounded-sm bg-[color:var(--terracotta)]/10 p-3 text-xs text-[color:var(--terracotta)]">
                              <CircleAlert className="h-4 w-4 flex-shrink-0" />
                              {cepError}
                            </div>
                          )}
                          <Field label="Rua / Avenida" className="sm:col-span-4">
                            <input
                              autoComplete="address-line1"
                              value={form.street}
                              onChange={(e) => setForm({ ...form, street: e.target.value })}
                              placeholder="Nome da rua"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Número" className="sm:col-span-2">
                            <input
                              inputMode="numeric"
                              value={form.streetNumber}
                              onChange={(e) => setForm({ ...form, streetNumber: e.target.value })}
                              placeholder="123"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Complemento (opcional)" className="sm:col-span-3">
                            <input
                              autoComplete="address-line2"
                              value={form.complement}
                              onChange={(e) => setForm({ ...form, complement: e.target.value })}
                              placeholder="Apto, bloco, referência"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Bairro" className="sm:col-span-3">
                            <input
                              value={form.neighborhood}
                              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                              placeholder="Bairro"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Cidade" className="sm:col-span-4">
                            <input
                              autoComplete="address-level2"
                              value={form.city}
                              onChange={(e) => setForm({ ...form, city: e.target.value })}
                              placeholder="Cidade"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="UF" className="sm:col-span-2">
                            <input
                              autoComplete="address-level1"
                              maxLength={2}
                              value={form.state}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  state: e.target.value.toUpperCase().slice(0, 2),
                                })
                              }
                              placeholder="UF"
                              className={inputCls}
                            />
                          </Field>
                        </div>

                        <div className="mt-6">
                          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Método de entrega
                          </div>
                          {shippingState === "idle" && (
                            <div className="rounded-md border border-dashed border-[color:var(--graphite)]/20 bg-[#fafafa] p-4 text-sm text-muted-foreground">
                              Digite seu CEP para calcular a entrega.
                            </div>
                          )}
                          {shippingState === "calculating" && (
                            <div className="flex items-center gap-3 rounded-md border border-[color:var(--graphite)]/10 bg-[#fafafa] p-4">
                              <Loader2 className="h-5 w-5 animate-spin text-[color:var(--sage)]" />
                              <div>
                                <div className="font-medium">Calculando o melhor envio...</div>
                                <div className="text-xs text-muted-foreground">
                                  Consultando prazo e condição promocional
                                </div>
                              </div>
                            </div>
                          )}
                          {shippingState === "ready" && (
                            <button
                              type="button"
                              onClick={() => setShippingSelected(true)}
                              className={`flex w-full items-center gap-4 rounded-md border p-4 text-left transition-colors ${shippingSelected ? "border-[color:var(--sage)] bg-[color:var(--sage)]/10" : "border-[color:var(--graphite)]/15 bg-white hover:border-[color:var(--sage)]"}`}
                            >
                              <span
                                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${shippingSelected ? "border-[color:var(--sage)] bg-[color:var(--sage)]" : "border-[color:var(--graphite)]/30"}`}
                              >
                                {shippingSelected && <Check className="h-3 w-3 text-white" />}
                              </span>
                              <Truck className="h-6 w-6 flex-shrink-0 text-[color:var(--sage)]" />
                              <span className="min-w-0 flex-1">
                                <span className="block font-medium">SEDEX</span>
                                <span className="block text-xs text-muted-foreground">
                                  Receba em 1 a 3 dias úteis
                                </span>
                              </span>
                              <span className="text-right">
                                <span className="block text-xs text-muted-foreground line-through">
                                  R$ 19,90
                                </span>
                                <span className="block font-semibold text-[color:var(--sage)]">
                                  Grátis
                                </span>
                              </span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={!hasAddress || !shippingSelected}
                          onClick={() => setCheckoutStep(3)}
                          className={primaryButtonCls}
                        >
                          Continuar para pagamento
                          <CreditCard className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {checkoutStep === 3 && (
                      <form
                        onSubmit={submitPayment}
                        className="rounded-md border border-[color:var(--graphite)]/10 bg-white p-4 md:p-6"
                      >
                        <CheckoutStepHeading
                          step={3}
                          title="Pagamento"
                          description="Escolha como pagar. A confirmação é automática e segura."
                        />
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <PaymentButton
                            active={paymentMethod === "PIX"}
                            onClick={() => setPaymentMethod("PIX")}
                          >
                            <img src={pixLogo} alt="" className="h-7 w-7" />
                            <span>
                              <strong className="block font-sans text-sm normal-case">Pix</strong>
                              <small className="font-sans text-xs normal-case opacity-70">
                                Aprovação imediata
                              </small>
                            </span>
                          </PaymentButton>
                          <PaymentButton
                            active={paymentMethod === "CREDIT_CARD"}
                            onClick={() => setPaymentMethod("CREDIT_CARD")}
                          >
                            <CreditCard className="h-6 w-6" />
                            <span>
                              <strong className="block font-sans text-sm normal-case">
                                Cartão de crédito
                              </strong>
                              <small className="font-sans text-xs normal-case opacity-70">
                                Até 12x
                              </small>
                            </span>
                          </PaymentButton>
                        </div>

                        {paymentMethod === "PIX" && (
                          <div className="mt-4 flex items-start gap-3 rounded-md bg-[#eef8f4] p-4 text-sm">
                            <Smartphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--sage)]" />
                            <div>
                              <strong>Pagamento rápido pelo app do seu banco.</strong>
                              <p className="mt-1 text-xs text-muted-foreground">
                                O QR Code fica disponível por 30 minutos e o pedido é confirmado
                                assim que o pagamento for identificado.
                              </p>
                            </div>
                          </div>
                        )}

                        {paymentMethod === "CREDIT_CARD" && (
                          <div className="mt-4 grid gap-4 sm:grid-cols-6">
                            <Field label="Número do cartão" className="sm:col-span-6">
                              <input
                                inputMode="numeric"
                                autoComplete="cc-number"
                                value={card.number}
                                onChange={(e) =>
                                  setCard({ ...card, number: maskCardNumber(e.target.value) })
                                }
                                placeholder="0000 0000 0000 0000"
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Nome impresso" className="sm:col-span-6">
                              <input
                                autoComplete="cc-name"
                                value={card.holderName}
                                onChange={(e) =>
                                  setCard({ ...card, holderName: e.target.value.toUpperCase() })
                                }
                                placeholder="COMO ESTÁ NO CARTÃO"
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Validade" className="sm:col-span-2">
                              <input
                                inputMode="numeric"
                                autoComplete="cc-exp"
                                value={card.expiration}
                                onChange={(e) =>
                                  setCard({ ...card, expiration: maskExpiration(e.target.value) })
                                }
                                placeholder="MM/AA"
                                className={inputCls}
                              />
                            </Field>
                            <Field label="CVV" className="sm:col-span-2">
                              <input
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                value={card.cvv}
                                onChange={(e) =>
                                  setCard({ ...card, cvv: onlyDigits(e.target.value).slice(0, 4) })
                                }
                                placeholder="123"
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Parcelas" className="sm:col-span-2">
                              <select
                                value={card.installments}
                                onChange={(e) => setCard({ ...card, installments: e.target.value })}
                                className={inputCls}
                              >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((installment) => (
                                  <option key={installment} value={installment}>
                                    {installment}x de{" "}
                                    {formatBRL(Math.ceil(totalCents / installment))}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          </div>
                        )}

                        {error && (
                          <div className="mt-4 flex items-start gap-2 rounded-sm bg-[color:var(--terracotta)]/10 p-3">
                            <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--terracotta)]" />
                            <p className="text-xs text-[color:var(--terracotta)]">{error}</p>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={!canSubmit || loading}
                          className={primaryButtonCls}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processando pagamento...
                            </>
                          ) : paymentMethod === "PIX" ? (
                            <>
                              <img src={pixLogo} alt="" className="h-5 w-5 brightness-0 invert" />
                              Gerar Pix · {formatBRL(totalCents)}
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4" />
                              Pagar com cartão · {formatBRL(totalCents)}
                            </>
                          )}
                        </button>
                        <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-muted-foreground">
                          <ShieldCheck className="h-4 w-4 text-[color:var(--sage)]" />
                          Ambiente seguro · dados criptografados · compra protegida
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

              <OrderSummary
                color={selectedColor.label}
                size={selectedSize}
                qty={qty}
                totalCents={totalCents}
              />
            </div>
          </section>
        )}

        <ProductDescription />
      </div>

      {!checkoutOpen && (
        <>
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
                onClick={() => openInternalCheckout("buy_now")}
                className="flex-1 rounded-sm bg-[color:var(--terracotta)] py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]"
              >
                Comprar
              </button>
            </div>
          </div>
          <div className="h-20 md:hidden" />
        </>
      )}
    </StoreLayout>
  );
}

function CheckoutProgress({ current }: { current: CheckoutStep }) {
  const labels = ["Identificação", "Entrega", "Pagamento"];
  return (
    <div className="rounded-md border border-[color:var(--graphite)]/10 bg-white px-3 py-4 md:px-5">
      <div className="grid grid-cols-3">
        {labels.map((label, index) => {
          const step = (index + 1) as CheckoutStep;
          const complete = current > step;
          const active = current === step;
          return (
            <div key={label} className="relative flex flex-col items-center text-center">
              {index > 0 && (
                <span
                  className={`absolute right-1/2 top-4 h-px w-full ${current >= step ? "bg-[color:var(--sage)]" : "bg-[color:var(--graphite)]/15"}`}
                />
              )}
              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${complete || active ? "border-[color:var(--sage)] bg-[color:var(--sage)] text-white" : "border-[color:var(--graphite)]/20 bg-white text-muted-foreground"}`}
              >
                {complete ? <Check className="h-4 w-4" /> : step}
              </span>
              <span
                className={`mt-2 text-[10px] uppercase tracking-wide ${active ? "font-semibold text-[color:var(--graphite)]" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckoutStepHeading({
  step,
  title,
  description,
}: {
  step: CheckoutStep;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-display text-2xl tracking-wide md:text-3xl">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {step} de 3
      </span>
    </div>
  );
}

function CompletedCheckoutBlock({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: ReactNode;
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-[color:var(--sage)]/40 bg-[#f4faf6] p-4 md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 font-display text-xl tracking-wide text-[color:var(--graphite)]">
          <span className="text-[color:var(--sage)]">{icon}</span>
          {title}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[color:var(--graphite)]"
        >
          Editar <Edit3 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function OrderSummary({
  color,
  size,
  qty,
  totalCents,
}: {
  color: string;
  size: string;
  qty: number;
  totalCents: number;
}) {
  return (
    <aside className="h-fit rounded-md border border-[color:var(--graphite)]/10 bg-white p-5 lg:sticky lg:top-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl tracking-wide">Resumo do pedido</h3>
        <span className="font-mono text-sm text-[color:var(--terracotta)]">
          {formatBRL(totalCents)}
        </span>
      </div>
      <div className="mt-4 flex gap-3 border-b border-[color:var(--graphite)]/10 pb-4">
        <img
          src={COLORS.find((c) => c.label === color)?.image ?? COLORS[0].image}
          alt=""
          className="h-20 w-20 rounded-sm object-cover"
        />
        <div className="flex-1">
          <div className="font-display text-lg leading-tight tracking-wide">NB 9060 RUNNING</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {color} · Tam {size} · Qtd {qty}
          </div>
          <div className="mt-2 font-mono text-sm text-[color:var(--terracotta)]">
            {formatBRL(PRICE_CENTS * qty)}
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-1 font-mono text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Produtos</span>
          <span>{formatBRL(PRICE_CENTS * qty)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>SEDEX · 1 a 3 dias</span>
          <span>
            <span className="mr-2 line-through">R$ 19,90</span>
            <strong className="text-[color:var(--sage)]">Grátis</strong>
          </span>
        </div>
        <div className="mt-2 flex justify-between border-t border-[color:var(--graphite)]/10 pt-2 text-base">
          <span className="font-sans">Total</span>
          <span className="text-[color:var(--terracotta)]">{formatBRL(totalCents)}</span>
        </div>
      </div>
      <div className="mt-5 flex items-start gap-2 rounded-sm bg-[color:var(--sage)]/10 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--sage)]" />
        <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
          Compra protegida. Seus dados são criptografados e o pagamento é processado com segurança.
        </p>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> Pagamento 100% seguro
      </div>
    </aside>
  );
}

function PixPanel({ tx, totalCents }: { tx: CheckoutTransaction; totalCents: number }) {
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!tx.pix?.expiresAt) return 30 * 60;
    return Math.max(0, Math.floor((new Date(tx.pix.expiresAt).getTime() - Date.now()) / 1000));
  });
  const code = tx.pix?.qrcode || tx.pix?.qrCode || tx.pix?.copyPaste || tx.pix?.code || "";
  const base64 = tx.pix?.qrcodeBase64 || tx.pix?.qrCodeBase64;
  const qrUrl = tx.pix?.qrcodeUrl || tx.pix?.qrCodeUrl;
  const imgSrc = base64
    ? base64.startsWith("data:")
      ? base64
      : `data:image/png;base64,${base64}`
    : qrUrl
      ? qrUrl
      : code
        ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(code)}`
        : null;

  useEffect(() => {
    const timer = window.setInterval(
      () => setSecondsLeft((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  async function copyCode() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef8f4]">
          <img src={pixLogo} alt="Pix" className="h-8 w-8" />
        </div>
        <h3 className="mt-3 font-display text-3xl tracking-wide md:text-4xl">Quase lá...</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Pague via Pix para confirmar seu pedido.
        </p>
        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff5d8] px-4 py-2 text-sm font-medium text-[#8a6500]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Aguardando pagamento · {formatCountdown(secondsLeft)}
        </div>
      </div>
      {imgSrc && (
        <img
          src={imgSrc}
          alt="QR Code Pix"
          className="mx-auto mt-6 h-64 w-64 rounded-md border border-[color:var(--graphite)]/10 bg-white p-2 shadow-sm"
        />
      )}
      {code && (
        <div className="mt-5">
          <div className="line-clamp-2 break-all rounded-sm border border-[color:var(--graphite)]/15 bg-[#fafafa] p-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
            {code}
          </div>
          <button
            onClick={copyCode}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--graphite)] px-5 py-3.5 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copiado!" : "Copiar código Pix"}
          </button>
        </div>
      )}
      {!imgSrc && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-md bg-[color:var(--terracotta)]/10 p-4 text-sm text-[color:var(--terracotta)]">
          <CircleAlert className="h-4 w-4" /> O Pix foi criado, mas o QR Code não veio na resposta.
          Atualize a página e tente novamente.
        </div>
      )}
      <div className="mt-7 border-t border-[color:var(--graphite)]/10 pt-6">
        <h4 className="font-display text-2xl tracking-wide">Como pagar</h4>
        <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
          {[
            "Clique em copiar o código Pix acima",
            "Abra o aplicativo do seu banco",
            "Escolha Pix e depois Pix Copia e Cola",
            "Cole o código e confirme o valor",
            "Finalize o pagamento para confirmar o pedido",
          ].map((instruction, index) => (
            <li key={instruction} className="flex items-center gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--sage)] text-xs font-semibold text-white">
                {index + 1}
              </span>
              {instruction}
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 rounded-md bg-[#eef8f4] p-3 text-center text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-[color:var(--sage)]" />
        Pagamento identificado automaticamente. Não feche esta página.
      </div>
    </div>
  );
}

function CardProcessingPanel({ status }: { status: string }) {
  return (
    <div className="mx-auto max-w-xl py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef8f4]">
        <CreditCard className="h-7 w-7 text-[color:var(--sage)]" />
      </div>
      <h3 className="mt-4 font-display text-3xl tracking-wide">Pagamento em análise</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        A operadora recebeu os dados do cartão. Estamos aguardando a confirmação, que normalmente
        leva poucos segundos.
      </p>
      <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-[#fff5d8] px-4 py-2 text-sm font-medium text-[#8a6500]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Processando · {status || "pendente"}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 rounded-md bg-[#eef8f4] p-3 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-[color:var(--sage)]" />
        Não atualize a página enquanto confirmamos o pagamento.
      </div>
    </div>
  );
}

function SuccessPanel() {
  return (
    <div className="mx-auto max-w-xl py-8 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-[color:var(--sage)]" />
      <h3 className="mt-4 font-display text-4xl tracking-wide">Pagamento confirmado!</h3>
      <p className="mt-3 text-muted-foreground">
        Seu pedido foi recebido e já está em processamento.
      </p>
    </div>
  );
}

function ProductDescription() {
  return (
    <section className="mt-20 grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div>
        <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
          / Descrição
        </div>
        <h2 className="font-display text-3xl tracking-wide md:text-4xl">NB 9060 Running</h2>
      </div>
      <div className="space-y-5 text-sm leading-relaxed text-[color:var(--graphite)]/85">
        <p>
          O NB 9060 combina um visual robusto e moderno com conforto para o uso diário. Seu design
          apresenta linhas onduladas, proporções ampliadas e uma entressola escultural, criando uma
          estética urbana e retrô-futurista inspirada nos modelos esportivos dos anos 2000.
        </p>
        <p>
          A construção conta com cabedal respirável, sobreposições estruturadas e solado reforçado,
          proporcionando melhor ajuste, estabilidade e conforto durante as passadas. É uma opção
          versátil para combinar com jeans, calças cargo, bermudas, conjuntos e roupas esportivas.
        </p>
        <DescriptionBlock
          title="Principais características"
          items={[
            "Modelo unissex",
            "Produto 1L",
            "Estilo casual e lifestyle",
            "Design robusto e moderno",
            "Cabedal respirável em tecido mesh",
            "Sobreposições em material sintético e suede",
            "Entressola de dupla densidade",
            "Sistema de amortecimento ABZORB e SBS",
            "Solado em borracha e EVA",
            "Fechamento tradicional por cadarços",
            "Interior acolchoado",
            "Bico arredondado",
            "Lingueta macia e estruturada",
            "Palmilha confortável e removível",
            "Tamanhos disponíveis do 35 ao 44",
          ]}
        />
        <DescriptionParagraph title="Cabedal">
          O cabedal combina tecido mesh respirável com sobreposições em material sintético e suede.
          Essa construção auxilia na ventilação dos pés, ao mesmo tempo que oferece sustentação e
          reforço nas áreas de maior contato. Os diferentes painéis e texturas destacam o visual
          robusto característico do modelo.
        </DescriptionParagraph>
        <DescriptionParagraph title="Entressola e amortecimento">
          A entressola possui construção de dupla densidade, desenvolvida para proporcionar conforto
          e absorção de impactos durante as passadas. O sistema ABZORB auxilia na absorção dos
          impactos e o SBS reforça o amortecimento na região do calcanhar.
        </DescriptionParagraph>
        <DescriptionParagraph title="Solado">
          O solado é produzido em uma combinação de borracha e EVA, oferecendo aderência,
          resistência e flexibilidade para o uso diário.
        </DescriptionParagraph>
        <DescriptionBlock
          title="Ficha técnica"
          items={[
            "Marca utilizada no anúncio: NB",
            "Modelo: 9060",
            "Gênero: Unissex",
            "Categoria: Casual e lifestyle",
            "Estilo: Chunky, urbano e retrô-futurista",
            "Tecnologias: ABZORB e SBS",
            "Cabedal: Mesh com sobreposições sintéticas",
            "Entressola: Dupla densidade",
            "Solado: Borracha e EVA",
            "Palmilha: Macia e removível",
            "Fechamento: Cadarço",
            "Tamanhos: 35 ao 44",
            "Indicação de uso: Dia a dia, passeios e looks casuais",
          ]}
        />
      </div>
    </section>
  );
}

function DescriptionBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-display text-2xl tracking-wide">{title}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--sage)]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DescriptionParagraph({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-2xl tracking-wide">{title}</h3>
      <p className="mt-2">{children}</p>
    </div>
  );
}

function PaymentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 w-full items-center gap-3 rounded-sm border px-4 py-3 text-left font-mono text-xs uppercase tracking-wider transition-colors ${
        active
          ? "border-[color:var(--graphite)] bg-[color:var(--graphite)] text-[color:var(--bone)]"
          : "border-[color:var(--graphite)]/15 bg-white hover:border-[color:var(--sage)]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function pixelPayload(color: AvailableColor, quantity: number, size: (typeof SIZES)[number]) {
  return {
    content_ids: [PIXEL_CONTENT_ID, String(color.variantId)],
    content_name: `Tênis NB 9060 Running - ${color.label} - Tam ${size}`,
    content_type: "product",
    content_category: "Calçados",
    size,
    color: color.label,
    contents: [{ id: String(color.variantId), quantity, item_price: PRICE_CENTS / 100 }],
    value: (PRICE_CENTS * quantity + SHIPPING_CENTS) / 100,
    currency: "BRL",
  };
}

function InfoIcon({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-[color:var(--sage)]">{icon}</span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-sm border border-[color:var(--graphite)]/20 bg-white px-3 font-sans text-sm outline-none transition-colors placeholder:text-[color:var(--graphite)]/35 focus:border-[color:var(--terracotta)] focus:ring-2 focus:ring-[color:var(--terracotta)]/10";
const primaryButtonCls =
  "mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--terracotta)] px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

const onlyDigits = (value: string) => value.replace(/\D+/g, "");
const maskCPF = (value: string) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};
const maskCEP = (value: string) =>
  onlyDigits(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
const maskCardNumber = (value: string) =>
  onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
const maskExpiration = (value: string) =>
  onlyDigits(value)
    .slice(0, 4)
    .replace(/(\d{2})(\d)/, "$1/$2");

function parseExpiration(value: string): [number, number] {
  const digits = onlyDigits(value);
  const month = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2, 4));
  if (!month || month < 1 || month > 12 || !year) return [0, 0];
  return [month, 2000 + year];
}

function isPaidStatus(status?: string) {
  return [
    "paid",
    "approved",
    "authorized",
    "completed",
    "complete",
    "success",
    "succeeded",
    "confirmed",
  ].includes((status || "").toLowerCase());
}

function isFailedStatus(status?: string) {
  return [
    "failed",
    "declined",
    "refused",
    "canceled",
    "cancelled",
    "expired",
    "chargeback",
  ].includes((status || "").toLowerCase());
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}
