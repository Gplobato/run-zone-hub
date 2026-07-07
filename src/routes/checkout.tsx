import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductImage } from "@/components/paze/ProductImage";
import { formatBRL, getProduct } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleAlert,
  CheckCircle2,
  Copy,
  Loader2,
  Lock,
  ShieldCheck,
  Truck,
  Package,
  Zap,
  QrCode,
  CreditCard,
  Ban,
} from "lucide-react";
import {
  createHypercashTransaction,
  getHypercashTransaction,
} from "@/lib/hypercash.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Paze" },
      { name: "description", content: "Finalize sua compra com segurança." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Checkout,
});

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}
function pixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

// ── Máscaras utilitárias ────────────────────────────────────────────────
const onlyDigits = (v: string) => v.replace(/\D+/g, "");
const maskCPF = (v: string) =>
  onlyDigits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};
const maskCEP = (v: string) =>
  onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

type PixData = {
  qrcode?: string;
  qrcodeBase64?: string;
  qrcodeUrl?: string;
  expiresAt?: string;
};

function Checkout() {
  const { items, subtotalCents, clear } = useCart();
  const createTx = useServerFn(createHypercashTransaction);
  const getTx = useServerFn(getHypercashTransaction);

  const [form, setForm] = useState({
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
  const [shippingMethod, setShippingMethod] = useState<"sedex" | "pac">("sedex");
  const [paymentMethod, setPaymentMethod] = useState<"pix">("pix");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingReady, setShippingReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<{
    id: string;
    status: string;
    pix: PixData | null;
  } | null>(null);
  const [paid, setPaid] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Promoção: frete grátis na 1ª compra por CPF (SEDEX e PAC).
  const shippingCents = 0;
  const totalCents = subtotalCents + shippingCents;


  // Busca CEP automática via ViaCEP
  useEffect(() => {
    const cep = onlyDigits(form.zipCode);
    if (cep.length !== 8) return;
    let cancelled = false;
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((r) => r.json())
      .then((d: {
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
        erro?: boolean;
      }) => {
        if (cancelled || d.erro) return;
        setForm((f) => ({
          ...f,
          street: d.logradouro || f.street,
          neighborhood: d.bairro || f.neighborhood,
          city: d.localidade || f.city,
          state: d.uf || f.state,
        }));
      })
      .catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [form.zipCode]);

  // Só calcula frete depois que o endereço estiver preenchido
  const addressComplete =
    onlyDigits(form.zipCode).length === 8 &&
    form.street.trim().length > 0 &&
    form.streetNumber.trim().length > 0 &&
    form.neighborhood.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.state.trim().length === 2;

  useEffect(() => {
    if (!addressComplete) {
      setShippingReady(false);
      setShippingLoading(false);
      return;
    }
    setShippingLoading(true);
    setShippingReady(false);
    const t = setTimeout(() => {
      setShippingLoading(false);
      setShippingReady(true);
    }, 900);
    return () => clearTimeout(t);
  }, [addressComplete, form.zipCode, form.streetNumber, form.city, form.state]);


  useEffect(() => {
    if (!tx?.id || paid) return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await getTx({ data: { id: tx.id } });
        if (["paid", "approved", "PAID", "APPROVED"].includes(r.status)) {
          setPaid(true);
          pixel("Purchase", {
            value: totalCents / 100,
            currency: "BRL",
            content_ids: items.map((i) => i.slug),
          });
          clear();
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // silencioso
      }
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx?.id, paid]);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length > 2 &&
      /.+@.+\..+/.test(form.email) &&
      onlyDigits(form.document).length === 11 &&
      onlyDigits(form.phone).length >= 10 &&
      onlyDigits(form.zipCode).length === 8 &&
      form.street.trim() &&
      form.streetNumber.trim() &&
      form.neighborhood.trim() &&
      form.city.trim() &&
      form.state.trim().length === 2 &&
      items.length > 0
    );
  }, [form, items.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    pixel("InitiateCheckout", {
      value: totalCents / 100,
      currency: "BRL",
      num_items: items.length,
    });
    try {
      const r = await createTx({
        data: {
          paymentMethod: "PIX",
          items: items.map((i) => {
            const p = getProduct(i.slug)!;
            return {
              slug: i.slug,
              title: p.name,
              unitPriceCents: p.priceCents,
              quantity: i.quantity,
            };
          }),
          shippingFeeCents: shippingCents,
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
          externalRef: `paze-${Date.now()}`,
        },
      });
      setTx({ id: r.id, status: r.status, pix: (r.pix as PixData) ?? null });
      pixel("AddPaymentInfo", { value: totalCents / 100, currency: "BRL" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar Pix.");
    } finally {
      setLoading(false);
    }
  }

  // Empty cart
  if (items.length === 0 && !tx) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
          <h1 className="font-display text-4xl tracking-wide">
            Seu carrinho está vazio
          </h1>
          <p className="mt-4 text-muted-foreground">
            Adicione produtos para finalizar sua compra.
          </p>
          <Link
            to="/produtos"
            className="mt-8 inline-block rounded-sm bg-[color:var(--terracotta)] px-6 py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]"
          >
            Ver produtos
          </Link>
        </div>
      </StoreLayout>
    );
  }

  // Paid confirmation
  if (paid) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[color:var(--sage)]" />
          <h1 className="mt-4 font-display text-4xl tracking-wide">
            Pagamento confirmado!
          </h1>
          <p className="mt-3 text-muted-foreground">
            Obrigado pela sua compra. Enviamos a confirmação para{" "}
            <strong>{form.email}</strong>.
          </p>
          <Link
            to="/produtos"
            className="mt-8 inline-block rounded-sm bg-[color:var(--terracotta)] px-6 py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]"
          >
            Continuar comprando
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
          / Checkout
        </div>
        <h1 className="font-display text-4xl tracking-wide md:text-5xl">
          Finalize sua compra
        </h1>
        <p className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-[color:var(--sage)]" />
          Pagamento 100% seguro · Pix instantâneo
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT — form ou PIX */}
          <div className="rounded-md border border-[color:var(--graphite)]/10 bg-white p-6">
            {!tx ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <section>
                  <h2 className="font-display text-2xl tracking-wide">
                    Seus dados
                  </h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Nome completo" className="sm:col-span-2">
                      <input
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="E-mail">
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Telefone / WhatsApp">
                      <input
                        required
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: maskPhone(e.target.value) })
                        }
                        placeholder="(11) 99999-9999"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="CPF">
                      <input
                        required
                        value={form.document}
                        onChange={(e) =>
                          setForm({ ...form, document: maskCPF(e.target.value) })
                        }
                        placeholder="000.000.000-00"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </section>

                <section>
                  <h2 className="font-display text-2xl tracking-wide">
                    Endereço de entrega
                  </h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-6">
                    <Field label="CEP" className="sm:col-span-2">
                      <input
                        required
                        value={form.zipCode}
                        onChange={(e) =>
                          setForm({ ...form, zipCode: maskCEP(e.target.value) })
                        }
                        placeholder="00000-000"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Rua" className="sm:col-span-4">
                      <input
                        required
                        value={form.street}
                        onChange={(e) =>
                          setForm({ ...form, street: e.target.value })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Número" className="sm:col-span-2">
                      <input
                        required
                        value={form.streetNumber}
                        onChange={(e) =>
                          setForm({ ...form, streetNumber: e.target.value })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Complemento" className="sm:col-span-4">
                      <input
                        value={form.complement}
                        onChange={(e) =>
                          setForm({ ...form, complement: e.target.value })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Bairro" className="sm:col-span-3">
                      <input
                        required
                        value={form.neighborhood}
                        onChange={(e) =>
                          setForm({ ...form, neighborhood: e.target.value })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Cidade" className="sm:col-span-2">
                      <input
                        required
                        value={form.city}
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="UF" className="sm:col-span-1">
                      <input
                        required
                        maxLength={2}
                        value={form.state}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            state: e.target.value.toUpperCase().slice(0, 2),
                          })
                        }
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </section>

                <section>
                  <h2 className="font-display text-2xl tracking-wide">
                    Forma de envio
                  </h2>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Promoção: frete grátis — 1 compra por CPF
                  </p>
                  {!addressComplete ? (
                    <div className="mt-3 flex items-center gap-3 rounded-sm border border-dashed border-[color:var(--graphite)]/20 bg-[color:var(--graphite)]/[0.03] px-4 py-6 text-sm text-muted-foreground">
                      <Truck className="h-5 w-5 text-[color:var(--graphite)]/40" />
                      <span className="font-mono text-[11px] uppercase tracking-widest">
                        Preencha o endereço para ver as opções de frete
                      </span>
                    </div>
                  ) : shippingLoading || !shippingReady ? (
                    <div className="mt-3 flex items-center gap-3 rounded-sm border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] px-4 py-6 text-sm text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin text-[color:var(--sage)]" />
                      <span className="font-mono text-[11px] uppercase tracking-widest">
                        Calculando frete para seu CEP…
                      </span>
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <ShippingOption
                        selected={shippingMethod === "sedex"}
                        onClick={() => setShippingMethod("sedex")}
                        icon={<Zap className="h-5 w-5 text-[color:var(--terracotta)]" />}
                        title="SEDEX"
                        subtitle="Entrega em 1 a 3 dias úteis"
                        badge="Recomendado"
                        strikePrice="R$ 39,90"
                        price="Grátis"
                      />
                      <ShippingOption
                        selected={shippingMethod === "pac"}
                        onClick={() => setShippingMethod("pac")}
                        icon={<Package className="h-5 w-5 text-[color:var(--sage)]" />}
                        title="PAC"
                        subtitle="Entrega em 3 a 7 dias úteis"
                        strikePrice="R$ 19,90"
                        price="Grátis"
                      />
                    </div>
                  )}
                </section>

                <section>
                  <h2 className="font-display text-2xl tracking-wide">
                    Forma de pagamento
                  </h2>
                  <div className="mt-3 grid gap-3">
                    <PaymentOption
                      selected={paymentMethod === "pix"}
                      onClick={() => setPaymentMethod("pix")}
                      icon={<QrCode className="h-5 w-5 text-[color:var(--terracotta)]" />}
                      title="Pix"
                      subtitle="Aprovação instantânea · sem taxas"
                      badge="Mais rápido"
                    />
                    <PaymentOption
                      disabled
                      icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
                      title="Cartão de crédito"
                      subtitle="Temporariamente indisponível"
                      badge={
                        <span className="inline-flex items-center gap-1">
                          <Ban className="h-3 w-3" />
                          Indisponível
                        </span>
                      }
                    />
                  </div>
                </section>

                <div className="flex items-start gap-2 rounded-sm border border-[color:var(--sage)]/30 bg-[color:var(--sage)]/10 p-3">
                  <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--sage)]" />
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
                      Checkout 100% seguro
                    </div>
                    <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
                      Seus dados são criptografados (SSL/TLS) e processados em ambiente
                      protegido. Nenhuma informação de pagamento é armazenada em nossos
                      servidores.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-sm bg-[color:var(--terracotta)]/10 p-3">
                    <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--terracotta)]" />
                    <p className="font-mono text-xs text-[color:var(--terracotta)]">
                      {error}
                    </p>
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
                      Gerando QR Code Pix…
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      Gerar QR Code Pix · {formatBRL(totalCents)}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <PixPanel tx={tx} totalCents={totalCents} />
            )}
          </div>

          {/* RIGHT — Order summary */}
          <aside className="h-fit rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--bone)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-wide">Seu pedido</h2>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </span>
            </div>

            <div className="mb-4 flex items-start gap-2 rounded-sm border border-[color:var(--sage)]/30 bg-[color:var(--sage)]/10 p-3">
              <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--sage)]" />
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
                  🎉 Frete SEDEX grátis desbloqueado
                </div>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  Você ganhou envio gratuito via SEDEX — promoção 1 compra por CPF, entrega em 3–7 dias úteis para todo o Brasil.
                </p>
              </div>
            </div>



            <ul className="divide-y divide-[color:var(--graphite)]/10">
              {items.map((it) => {
                const p = getProduct(it.slug);
                if (!p) return null;
                return (
                  <li
                    key={it.slug + (it.variant ?? "")}
                    className="flex gap-3 py-3"
                  >
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-white">
                      <ProductImage product={p} className="h-full w-full" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="font-display text-sm tracking-wide">
                        {p.shortName.toUpperCase()}
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                        <span>
                          Qtd {it.quantity}
                          {it.variant ? ` · ${it.variant}` : ""}
                        </span>
                        <span className="text-[color:var(--terracotta)]">
                          {formatBRL(p.priceCents * it.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 space-y-1 border-t border-[color:var(--graphite)]/10 pt-4 font-mono text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatBRL(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete {shippingMethod === "sedex" ? "SEDEX" : "PAC"}</span>
                <span className="text-[color:var(--sage)]">
                  <span className="mr-1 line-through opacity-60">
                    {shippingMethod === "sedex" ? "R$ 39,90" : "R$ 19,90"}
                  </span>
                  Grátis
                </span>
              </div>

              <div className="mt-2 flex justify-between border-t border-[color:var(--graphite)]/10 pt-2 text-base">
                <span className="font-sans">Total</span>
                <span className="text-[color:var(--terracotta)]">
                  {formatBRL(totalCents)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-sm bg-[color:var(--sage)]/10 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--sage)]" />
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                Compra protegida. Seus dados são criptografados e o pagamento é
                processado com segurança.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </StoreLayout>
  );
}

const inputCls =
  "w-full rounded-sm border border-[color:var(--graphite)]/20 bg-white px-3 py-2.5 font-sans text-sm outline-none focus:border-[color:var(--terracotta)]";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
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

function PixPanel({
  tx,
  totalCents,
}: {
  tx: { id: string; status: string; pix: PixData | null };
  totalCents: number;
}) {
  const [copied, setCopied] = useState(false);
  const code = tx.pix?.qrcode || "";
  const imgSrc =
    tx.pix?.qrcodeBase64
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
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="text-center">
      <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
        Pix gerado · {formatBRL(totalCents)}
      </div>
      <h2 className="mt-1 font-display text-3xl tracking-wide">
        Escaneie ou copie o código
      </h2>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        Abra o app do seu banco, escolha Pix e escaneie o QR. Aprovação
        instantânea.
      </p>

      {imgSrc && (
        <div className="mt-6 flex justify-center">
          <img
            src={imgSrc}
            alt="QR Code Pix"
            className="h-64 w-64 rounded-md border border-[color:var(--graphite)]/10 bg-white p-2"
          />
        </div>
      )}

      {code && (
        <div className="mt-6">
          <div className="mx-auto max-w-md break-all rounded-sm border border-[color:var(--graphite)]/15 bg-[color:var(--bone)] p-3 text-left font-mono text-[11px] leading-relaxed">
            {code}
          </div>
          <button
            onClick={copyCode}
            className="mt-3 inline-flex items-center gap-2 rounded-sm bg-[color:var(--graphite)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copiado!" : "Copiar código Pix"}
          </button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Aguardando pagamento…
      </div>
    </div>
  );
}

function ShippingOption({
  selected,
  onClick,
  icon,
  title,
  subtitle,
  badge,
  strikePrice,
  price,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  strikePrice?: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-sm border p-4 text-left transition ${
        selected
          ? "border-[color:var(--terracotta)] bg-[color:var(--terracotta)]/5"
          : "border-[color:var(--graphite)]/15 bg-white hover:border-[color:var(--graphite)]/30"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-[color:var(--terracotta)]"
            : "border-[color:var(--graphite)]/30"
        }`}
      >
        {selected && (
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--terracotta)]" />
        )}
      </span>
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-display text-base tracking-wide">{title}</span>
          {badge && (
            <span className="rounded-sm bg-[color:var(--terracotta)]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[color:var(--terracotta)]">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
          {subtitle}
        </span>
        <span className="mt-1 flex items-baseline gap-1.5">
          {strikePrice && (
            <span className="font-mono text-[11px] text-muted-foreground line-through opacity-60">
              {strikePrice}
            </span>
          )}
          <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
            {price}
          </span>
        </span>
      </span>
    </button>
  );
}

function PaymentOption({
  selected,
  onClick,
  disabled,
  icon,
  title,
  subtitle,
  badge,
}: {
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 rounded-sm border p-4 text-left transition ${
        disabled
          ? "cursor-not-allowed border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/5 opacity-60"
          : selected
            ? "border-[color:var(--terracotta)] bg-[color:var(--terracotta)]/5"
            : "border-[color:var(--graphite)]/15 bg-white hover:border-[color:var(--graphite)]/30"
      }`}
    >
      <span
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          selected && !disabled
            ? "border-[color:var(--terracotta)]"
            : "border-[color:var(--graphite)]/30"
        }`}
      >
        {selected && !disabled && (
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--terracotta)]" />
        )}
      </span>
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">
        <span className="font-display text-base tracking-wide">{title}</span>
        <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
          {subtitle}
        </span>
      </span>
      {badge && (
        <span
          className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
            disabled
              ? "bg-[color:var(--graphite)]/10 text-muted-foreground"
              : "bg-[color:var(--sage)]/15 text-[color:var(--sage)]"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
