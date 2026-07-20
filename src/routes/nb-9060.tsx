import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  CreditCard,
  Loader2,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { formatBRL } from "@/lib/products";
import { fbqTrack } from "@/lib/pixel";
import {
  createHypercashTransaction,
  getHypercashTransaction,
} from "@/lib/hypercash.functions";
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
const SIZES = ["34/35", "36/37", "38/39", "40/41", "42/43", "43/44"] as const;

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
  qrcodeBase64?: string;
  qrcodeUrl?: string;
  expiresAt?: string;
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

  const [selectedColor, setSelectedColor] = useState<AvailableColor>(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<(typeof SIZES)[number]>(SIZES[0]);
  const [activeImage, setActiveImage] = useState(COLORS[0].image);
  const [qty, setQty] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [form, setForm] = useState(emptyForm);
  const [card, setCard] = useState(emptyCard);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<{ id: string; status: string; pix: PixData | null } | null>(null);
  const [paid, setPaid] = useState(false);

  const totalCents = PRICE_CENTS * qty + SHIPPING_CENTS;
  const gallery = useMemo(
    () => [selectedColor.image, selectedColor.secondaryImage],
    [selectedColor],
  );

  useEffect(() => {
    setActiveImage(selectedColor.image);
  }, [selectedColor]);

  useEffect(() => {
    fbqTrack("ViewContent", pixelPayload(selectedColor, qty, selectedSize));
  }, [selectedColor, qty, selectedSize]);

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
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [form.zipCode]);

  useEffect(() => {
    if (!tx?.id || paid) return;
    pollRef.current = setInterval(async () => {
      try {
        const response = await getTx({ data: { id: tx.id } });
        if (isPaidStatus(response.status)) {
          setPaid(true);
          fbqTrack("Purchase", pixelPayload(selectedColor, qty, selectedSize));
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Polling silencioso para nao atrapalhar quem esta pagando.
      }
    }, 4500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [getTx, paid, qty, selectedColor, selectedSize, tx?.id]);

  const canSubmit = useMemo(() => {
    const hasAddress =
      onlyDigits(form.zipCode).length === 8 &&
      form.street.trim() &&
      form.streetNumber.trim() &&
      form.neighborhood.trim() &&
      form.city.trim() &&
      form.state.trim().length === 2;

    const hasCustomer =
      form.name.trim().length > 2 &&
      /.+@.+\..+/.test(form.email) &&
      onlyDigits(form.document).length === 11 &&
      onlyDigits(form.phone).length >= 10;

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
  }, [card, form, paymentMethod]);

  function openInternalCheckout(source: "buy_now" | "add_to_cart") {
    const payload = pixelPayload(selectedColor, qty, selectedSize);
    if (source === "add_to_cart") fbqTrack("AddToCart", payload);
    fbqTrack("InitiateCheckout", payload);
    setCheckoutOpen(true);
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

    fbqTrack("AddPaymentInfo", {
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
          externalRef: `nb9060-${selectedColor.key}-${selectedSize}-${Date.now()}`,
        },
      });

      if (paymentMethod === "CREDIT_CARD" && isPaidStatus(response.status)) {
        setPaid(true);
        fbqTrack("Purchase", pixelPayload(selectedColor, qty, selectedSize));
      } else {
        setTx({
          id: response.id,
          status: response.status,
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
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" draggable={false} />
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
                      <img src={color.image} alt="" className="h-14 w-14 rounded-sm object-cover" loading="lazy" draggable={false} />
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
                <button aria-label="Diminuir" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-[color:var(--graphite)]/5">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-mono text-sm">{qty}</span>
                <button aria-label="Aumentar" onClick={() => setQty((q) => q + 1)} className="p-3 hover:bg-[color:var(--graphite)]/5">
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
          <section ref={checkoutRef} className="mt-16 rounded-md border border-[color:var(--graphite)]/10 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-6 flex flex-col gap-3 border-b border-[color:var(--graphite)]/10 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
                  / Checkout seguro
                </div>
                <h2 className="mt-1 font-display text-3xl tracking-wide">Finalize sua compra</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-[color:var(--sage)]" />
                  Pagamento criptografado, Pix instantâneo e cartão em até 12x.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[payAmex, payElo, payVisa, payMastercard, payPix].map((src) => (
                  <span key={src} className="flex h-8 w-12 items-center justify-center rounded-sm border border-[color:var(--graphite)]/10 bg-white p-1">
                    <img src={src} alt="" className="max-h-5 max-w-full" />
                  </span>
                ))}
              </div>
            </div>

            {paid ? (
              <SuccessPanel />
            ) : tx ? (
              <PixPanel tx={tx} totalCents={totalCents} />
            ) : (
              <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
                <form onSubmit={submitPayment} className="space-y-6">
                  <section>
                    <h3 className="font-display text-2xl tracking-wide">Identificação</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Field label="Nome completo" className="sm:col-span-2">
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
                      </Field>
                      <Field label="E-mail">
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} required />
                      </Field>
                      <Field label="Celular / WhatsApp">
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} placeholder="(11) 99999-9999" className={inputCls} required />
                      </Field>
                      <Field label="CPF">
                        <input value={form.document} onChange={(e) => setForm({ ...form, document: maskCPF(e.target.value) })} placeholder="000.000.000-00" className={inputCls} required />
                      </Field>
                    </div>
                  </section>

                  <section>
                    <h3 className="font-display text-2xl tracking-wide">Entrega</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-6">
                      <Field label="CEP" className="sm:col-span-2">
                        <input value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: maskCEP(e.target.value) })} placeholder="00000-000" className={inputCls} required />
                      </Field>
                      <Field label="Rua" className="sm:col-span-4">
                        <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className={inputCls} required />
                      </Field>
                      <Field label="Número" className="sm:col-span-2">
                        <input value={form.streetNumber} onChange={(e) => setForm({ ...form, streetNumber: e.target.value })} className={inputCls} required />
                      </Field>
                      <Field label="Complemento" className="sm:col-span-4">
                        <input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label="Bairro" className="sm:col-span-3">
                        <input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className={inputCls} required />
                      </Field>
                      <Field label="Cidade" className="sm:col-span-2">
                        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} required />
                      </Field>
                      <Field label="UF" className="sm:col-span-1">
                        <input maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })} className={inputCls} required />
                      </Field>
                    </div>
                  </section>

                  <section>
                    <h3 className="font-display text-2xl tracking-wide">Pagamento</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <PaymentButton active={paymentMethod === "PIX"} onClick={() => setPaymentMethod("PIX")}>
                        <img src={pixLogo} alt="" className="h-6 w-6" />
                        Pix
                      </PaymentButton>
                      <PaymentButton active={paymentMethod === "CREDIT_CARD"} onClick={() => setPaymentMethod("CREDIT_CARD")}>
                        <CreditCard className="h-5 w-5" />
                        Cartão de crédito
                      </PaymentButton>
                    </div>

                    {paymentMethod === "CREDIT_CARD" && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-6">
                        <Field label="Número do cartão" className="sm:col-span-6">
                          <input value={card.number} onChange={(e) => setCard({ ...card, number: maskCardNumber(e.target.value) })} placeholder="0000 0000 0000 0000" className={inputCls} />
                        </Field>
                        <Field label="Nome impresso" className="sm:col-span-6">
                          <input value={card.holderName} onChange={(e) => setCard({ ...card, holderName: e.target.value.toUpperCase() })} className={inputCls} />
                        </Field>
                        <Field label="Validade" className="sm:col-span-2">
                          <input value={card.expiration} onChange={(e) => setCard({ ...card, expiration: maskExpiration(e.target.value) })} placeholder="MM/AA" className={inputCls} />
                        </Field>
                        <Field label="CVV" className="sm:col-span-2">
                          <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: onlyDigits(e.target.value).slice(0, 4) })} placeholder="123" className={inputCls} />
                        </Field>
                        <Field label="Parcelas" className="sm:col-span-2">
                          <select value={card.installments} onChange={(e) => setCard({ ...card, installments: e.target.value })} className={inputCls}>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((installment) => (
                              <option key={installment} value={installment}>
                                {installment}x de {formatBRL(Math.ceil(totalCents / installment))}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    )}
                  </section>

                  {error && (
                    <div className="flex items-start gap-2 rounded-sm bg-[color:var(--terracotta)]/10 p-3">
                      <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--terracotta)]" />
                      <p className="font-mono text-xs text-[color:var(--terracotta)]">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="flex w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--terracotta)] px-6 py-4 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : paymentMethod === "PIX" ? (
                      <>Gerar Pix · {formatBRL(totalCents)}</>
                    ) : (
                      <>Pagar com cartão · {formatBRL(totalCents)}</>
                    )}
                  </button>
                </form>

                <OrderSummary color={selectedColor.label} size={selectedSize} qty={qty} totalCents={totalCents} />
              </div>
            )}
          </section>
        )}

        <ProductDescription />
      </div>

      {!checkoutOpen && (
        <>
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[color:var(--graphite)]/10 bg-[color:var(--bone)] p-3 md:hidden">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="font-mono text-sm text-[color:var(--terracotta)]">{formatBRL(PRICE_CENTS)}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{selectedColor.label} · {selectedSize}</div>
              </div>
              <button onClick={() => openInternalCheckout("buy_now")} className="flex-1 rounded-sm bg-[color:var(--terracotta)] py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]">
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

function OrderSummary({ color, size, qty, totalCents }: { color: string; size: string; qty: number; totalCents: number }) {
  return (
    <aside className="h-fit rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--bone)] p-5">
      <h3 className="font-display text-2xl tracking-wide">Resumo do pedido</h3>
      <div className="mt-4 flex gap-3 border-b border-[color:var(--graphite)]/10 pb-4">
        <img src={COLORS.find((c) => c.label === color)?.image ?? COLORS[0].image} alt="" className="h-20 w-20 rounded-sm object-cover" />
        <div className="flex-1">
          <div className="font-display text-lg leading-tight tracking-wide">NB 9060 RUNNING</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {color} · Tam {size} · Qtd {qty}
          </div>
          <div className="mt-2 font-mono text-sm text-[color:var(--terracotta)]">{formatBRL(PRICE_CENTS * qty)}</div>
        </div>
      </div>
      <div className="mt-4 space-y-1 font-mono text-xs">
        <div className="flex justify-between text-muted-foreground"><span>Produtos</span><span>{formatBRL(PRICE_CENTS * qty)}</span></div>
        <div className="flex justify-between text-muted-foreground"><span>Frete</span><span>Grátis</span></div>
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
    </aside>
  );
}

function PixPanel({ tx, totalCents }: { tx: { id: string; status: string; pix: PixData | null }; totalCents: number }) {
  const [copied, setCopied] = useState(false);
  const code = tx.pix?.qrcode || "";
  const imgSrc = tx.pix?.qrcodeBase64
    ? tx.pix.qrcodeBase64.startsWith("data:")
      ? tx.pix.qrcodeBase64
      : `data:image/png;base64,${tx.pix.qrcodeBase64}`
    : tx.pix?.qrcodeUrl
      ? tx.pix.qrcodeUrl
      : code
        ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(code)}`
        : null;

  async function copyCode() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
        Pix gerado · {formatBRL(totalCents)}
      </div>
      <h3 className="mt-1 font-display text-3xl tracking-wide">Quase lá...</h3>
      <p className="mt-2 text-sm text-muted-foreground">Pague via Pix para confirmar seu pedido. A aprovação é instantânea.</p>
      {imgSrc && <img src={imgSrc} alt="QR Code Pix" className="mx-auto mt-6 h-64 w-64 rounded-md border border-[color:var(--graphite)]/10 bg-white p-2" />}
      {code && (
        <div className="mt-6">
          <div className="break-all rounded-sm border border-[color:var(--graphite)]/15 bg-[color:var(--bone)] p-3 text-left font-mono text-[11px] leading-relaxed">{code}</div>
          <button onClick={copyCode} className="mt-3 inline-flex items-center gap-2 rounded-sm bg-[color:var(--graphite)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]">
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copiado!" : "Copiar código Pix"}
          </button>
        </div>
      )}
      <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Aguardando pagamento...
      </div>
    </div>
  );
}

function SuccessPanel() {
  return (
    <div className="mx-auto max-w-xl py-8 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-[color:var(--sage)]" />
      <h3 className="mt-4 font-display text-4xl tracking-wide">Pagamento confirmado!</h3>
      <p className="mt-3 text-muted-foreground">Seu pedido foi recebido e já está em processamento.</p>
    </div>
  );
}

function ProductDescription() {
  return (
    <section className="mt-20 grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div>
        <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">/ Descrição</div>
        <h2 className="font-display text-3xl tracking-wide md:text-4xl">NB 9060 Running</h2>
      </div>
      <div className="space-y-5 text-sm leading-relaxed text-[color:var(--graphite)]/85">
        <p>O NB 9060 combina um visual robusto e moderno com conforto para o uso diário. Seu design apresenta linhas onduladas, proporções ampliadas e uma entressola escultural, criando uma estética urbana e retrô-futurista inspirada nos modelos esportivos dos anos 2000.</p>
        <p>A construção conta com cabedal respirável, sobreposições estruturadas e solado reforçado, proporcionando melhor ajuste, estabilidade e conforto durante as passadas. É uma opção versátil para combinar com jeans, calças cargo, bermudas, conjuntos e roupas esportivas.</p>
        <DescriptionBlock title="Principais características" items={["Modelo unissex", "Produto 1L", "Estilo casual e lifestyle", "Design robusto e moderno", "Cabedal respirável em tecido mesh", "Sobreposições em material sintético e suede", "Entressola de dupla densidade", "Sistema de amortecimento ABZORB e SBS", "Solado em borracha e EVA", "Fechamento tradicional por cadarços", "Interior acolchoado", "Bico arredondado", "Lingueta macia e estruturada", "Palmilha confortável e removível", "Tamanhos disponíveis do 35 ao 44"]} />
        <DescriptionParagraph title="Cabedal">O cabedal combina tecido mesh respirável com sobreposições em material sintético e suede. Essa construção auxilia na ventilação dos pés, ao mesmo tempo que oferece sustentação e reforço nas áreas de maior contato. Os diferentes painéis e texturas destacam o visual robusto característico do modelo.</DescriptionParagraph>
        <DescriptionParagraph title="Entressola e amortecimento">A entressola possui construção de dupla densidade, desenvolvida para proporcionar conforto e absorção de impactos durante as passadas. O sistema ABZORB auxilia na absorção dos impactos e o SBS reforça o amortecimento na região do calcanhar.</DescriptionParagraph>
        <DescriptionParagraph title="Solado">O solado é produzido em uma combinação de borracha e EVA, oferecendo aderência, resistência e flexibilidade para o uso diário.</DescriptionParagraph>
        <DescriptionBlock title="Ficha técnica" items={["Marca utilizada no anúncio: NB", "Modelo: 9060", "Gênero: Unissex", "Categoria: Casual e lifestyle", "Estilo: Chunky, urbano e retrô-futurista", "Tecnologias: ABZORB e SBS", "Cabedal: Mesh com sobreposições sintéticas", "Entressola: Dupla densidade", "Solado: Borracha e EVA", "Palmilha: Macia e removível", "Fechamento: Cadarço", "Tamanhos: 35 ao 44", "Indicação de uso: Dia a dia, passeios e looks casuais"]} />
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

function PaymentButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-sm border px-4 py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
        active
          ? "border-[color:var(--graphite)] bg-[color:var(--graphite)] text-[color:var(--bone)]"
          : "border-[color:var(--graphite)]/15 bg-white hover:border-[color:var(--sage)]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
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
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

const inputCls =
  "w-full rounded-sm border border-[color:var(--graphite)]/20 bg-white px-3 py-2.5 font-sans text-sm outline-none focus:border-[color:var(--terracotta)]";

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
const maskCEP = (value: string) => onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const maskCardNumber = (value: string) => onlyDigits(value).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
const maskExpiration = (value: string) => onlyDigits(value).slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");

function parseExpiration(value: string): [number, number] {
  const digits = onlyDigits(value);
  const month = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2, 4));
  if (!month || month < 1 || month > 12 || !year) return [0, 0];
  return [month, 2000 + year];
}

function isPaidStatus(status?: string) {
  return ["paid", "approved", "PAID", "APPROVED", "AUTHORIZED", "authorized"].includes(status || "");
}
