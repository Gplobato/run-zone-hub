import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductImage } from "@/components/paze/ProductImage";
import { formatBRL, getProduct, PRODUCTS } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useEffect, useMemo, useState } from "react";
import { CircleAlert, ShieldCheck, ArrowRight, Copy, CheckCircle2, Loader2, Lock } from "lucide-react";
import {
  createHypercashTransaction,
  getHypercashTransaction,
} from "@/lib/hypercash.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Paze" },
      { name: "description", content: "Revise seu pedido e finalize com segurança." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Checkout,
});

// ─── Meta Pixel helper (no-op sem VITE_META_PIXEL_ID) ───────────────────
declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}
function pixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

// ─── Utilities ──────────────────────────────────────────────────────────
const onlyDigits = (v: string) => v.replace(/\D+/g, "");
const maskCPF = (v: string) =>
  onlyDigits(v).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};
const maskCEP = (v: string) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const maskCard = (v: string) => onlyDigits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
const maskExp = (v: string) => onlyDigits(v).slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");

function validCPF(cpf: string) {
  const d = onlyDigits(cpf);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (n: number) => {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += parseInt(d[i]) * (n + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === parseInt(d[9]) && calc(10) === parseInt(d[10]);
}

type Step = "form" | "pix" | "boleto" | "success";
type Method = "PIX" | "CREDIT_CARD" | "BOLETO";

function Checkout() {
  const { items, subtotalCents, clear } = useCart();
  const navigate = useNavigate();
  const createTx = useServerFn(createHypercashTransaction);
  const getTx = useServerFn(getHypercashTransaction);

  const [step, setStep] = useState<Step>("form");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [method, setMethod] = useState<Method>("PIX");

  // Customer
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  // Address
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState(1);

  // Result
  const [tx, setTx] = useState<{
    id: string;
    status: string;
    amount: number;
    pix?: { qrcode?: string; qrCode?: string; url?: string; qrcodeUrl?: string; expiresAt?: string } | null;
    boleto?: { url?: string; barcode?: string; expiresAt?: string } | null;
  } | null>(null);

  const shippingCents = subtotalCents >= 9990 ? 0 : 1990;
  const totalCents = subtotalCents + shippingCents;
  const maxInstallments = useMemo(() => Math.min(12, Math.max(1, Math.floor(totalCents / 500))), [totalCents]);

  // ─── CEP autofill (ViaCEP) ────────────────────────────────────────────
  useEffect(() => {
    const d = onlyDigits(cep);
    if (d.length !== 8) return;
    let cancelled = false;
    setCepLoading(true);
    fetch(`https://viacep.com.br/ws/${d}/json/`)
      .then((r) => r.json())
      .then((data: { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean }) => {
        if (cancelled || data?.erro) return;
        setStreet((s) => s || data.logradouro || "");
        setNeighborhood((n) => n || data.bairro || "");
        setCity((c) => c || data.localidade || "");
        setState((u) => u || data.uf || "");
      })
      .catch(() => void 0)
      .finally(() => !cancelled && setCepLoading(false));
    return () => {
      cancelled = true;
    };
  }, [cep]);

  // ─── PIX polling ──────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "pix" || !tx?.id) return;
    const int = setInterval(async () => {
      try {
        const r = await getTx({ data: { id: tx.id } });
        if (r.status === "PAID" || r.status === "APPROVED" || r.status === "paid") {
          pixel("Purchase", { value: totalCents / 100, currency: "BRL", content_ids: items.map((i) => i.slug) });
          clear();
          setStep("success");
        }
      } catch {
        // silent — keep polling
      }
    }, 4000);
    return () => clearInterval(int);
  }, [step, tx, getTx, totalCents, items, clear]);

  // ─── InitiateCheckout pixel on mount ──────────────────────────────────
  useEffect(() => {
    if (items.length > 0 && step === "form") {
      pixel("InitiateCheckout", { value: totalCents / 100, currency: "BRL", num_items: items.length });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Validate + submit ────────────────────────────────────────────────
  async function submit() {
    setError(null);
    if (!name.trim()) return setError("Informe seu nome completo.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("E-mail inválido.");
    if (!validCPF(cpf)) return setError("CPF inválido.");
    if (onlyDigits(phone).length < 10) return setError("Telefone inválido.");
    if (onlyDigits(cep).length !== 8) return setError("CEP inválido.");
    if (!street || !streetNumber || !neighborhood || !city || !state) return setError("Endereço incompleto.");
    if (method === "CREDIT_CARD") {
      if (onlyDigits(cardNumber).length < 13) return setError("Número do cartão inválido.");
      if (!cardHolder.trim()) return setError("Nome no cartão obrigatório.");
      if (onlyDigits(cardExp).length !== 4) return setError("Validade inválida.");
      if (onlyDigits(cardCvv).length < 3) return setError("CVV inválido.");
    }

    setBusy(true);
    try {
      pixel("AddPaymentInfo", { content_category: method });
      const [mm, yy] = cardExp.split("/");
      const result = await createTx({
        data: {
          paymentMethod: method,
          items: items.map((i) => {
            const p = getProduct(i.slug)!;
            return {
              slug: i.slug,
              title: p.shortName,
              unitPriceCents: p.priceCents,
              quantity: i.quantity,
            };
          }),
          shippingFeeCents: shippingCents,
          customer: { name, email, document: cpf, phone },
          address: {
            street,
            streetNumber,
            complement,
            zipCode: cep,
            neighborhood,
            city,
            state,
          },
          card: method === "CREDIT_CARD"
            ? {
                number: cardNumber,
                holderName: cardHolder,
                expirationMonth: parseInt(mm || "0"),
                expirationYear: 2000 + parseInt(yy || "0"),
                cvv: cardCvv,
                installments,
              }
            : undefined,
          externalRef: `paze_${Date.now()}`,
        },
      });
      setTx(result);
      if (method === "PIX") setStep("pix");
      else if (method === "BOLETO") setStep("boleto");
      else {
        pixel("Purchase", { value: totalCents / 100, currency: "BRL" });
        clear();
        setStep("success");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao processar pagamento.");
    } finally {
      setBusy(false);
    }
  }

  // ─── Empty state ──────────────────────────────────────────────────────
  if (items.length === 0 && step === "form") {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
          <h1 className="font-display text-4xl tracking-wide">Seu carrinho está vazio</h1>
          <p className="mt-4 text-muted-foreground">Adicione produtos para finalizar sua compra.</p>
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

  // ─── PIX screen ───────────────────────────────────────────────────────
  if (step === "pix" && tx?.pix) {
    const brcode = tx.pix.qrcode || tx.pix.qrCode || "";
    const qrImg = tx.pix.qrcodeUrl || tx.pix.url ||
      (brcode ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(brcode)}` : "");
    return (
      <StoreLayout>
        <div className="mx-auto max-w-xl px-4 py-12 md:px-8">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">/ Pagamento Pix</div>
          <h1 className="font-display text-3xl tracking-wide">Escaneie para pagar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Abra o app do seu banco, escaneie o QR Code ou copie o código Pix. A confirmação é automática.
          </p>
          <div className="mt-8 flex flex-col items-center gap-6 rounded-md border border-[color:var(--graphite)]/10 bg-white p-8">
            {qrImg ? (
              <img src={qrImg} alt="QR Code Pix" className="h-64 w-64" />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center bg-[color:var(--graphite)]/5 font-mono text-xs">
                QR indisponível
              </div>
            )}
            <div className="w-full">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Pix Copia e Cola
              </div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={brcode}
                  className="flex-1 truncate rounded-sm border border-[color:var(--graphite)]/20 bg-[color:var(--bone)] px-3 py-2 font-mono text-xs"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(brcode);
                  }}
                  className="rounded-sm bg-[color:var(--graphite)] px-3 text-[color:var(--bone)]"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-[color:var(--sage)]">
              <Loader2 className="h-4 w-4 animate-spin" /> Aguardando confirmação do pagamento…
            </div>
            <div className="text-center font-mono text-lg text-[color:var(--terracotta)]">
              {formatBRL(totalCents)}
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  // ─── Boleto screen ────────────────────────────────────────────────────
  if (step === "boleto" && tx?.boleto) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-xl px-4 py-12 md:px-8 text-center">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">/ Boleto gerado</div>
          <h1 className="font-display text-3xl tracking-wide">Seu boleto está pronto</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pague em qualquer banco, app ou lotérica. A compensação leva até 3 dias úteis.
          </p>
          {tx.boleto.url && (
            <a
              href={tx.boleto.url}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-[color:var(--terracotta)] px-6 py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]"
            >
              Abrir boleto <ArrowRight className="h-4 w-4" />
            </a>
          )}
          {tx.boleto.barcode && (
            <div className="mt-6">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Linha digitável
              </div>
              <div className="flex gap-2">
                <input readOnly value={tx.boleto.barcode} className="flex-1 truncate rounded-sm border border-[color:var(--graphite)]/20 px-3 py-2 font-mono text-xs" />
                <button
                  onClick={() => navigator.clipboard.writeText(tx.boleto?.barcode || "")}
                  className="rounded-sm bg-[color:var(--graphite)] px-3 text-[color:var(--bone)]"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </StoreLayout>
    );
  }

  // ─── Success screen ───────────────────────────────────────────────────
  if (step === "success") {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-xl px-4 py-24 text-center md:px-8">
          <CheckCircle2 className="mx-auto h-16 w-16 text-[color:var(--sage)]" />
          <h1 className="mt-6 font-display text-4xl tracking-wide">Pedido confirmado!</h1>
          <p className="mt-3 text-muted-foreground">
            Enviamos os detalhes para <span className="font-mono">{email || "seu e-mail"}</span>. Nosso time começa a preparar seu envio agora mesmo.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-8 rounded-sm bg-[color:var(--terracotta)] px-6 py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]"
          >
            Voltar para a loja
          </button>
        </div>
      </StoreLayout>
    );
  }

  // ─── Form (default) ───────────────────────────────────────────────────
  const upsell = !items.some((i) => i.slug === "kit-seguranca-urbana")
    ? getProduct("kit-seguranca-urbana")
    : PRODUCTS.find((p) => !items.some((i) => i.slug === p.slug));

  return (
    <StoreLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">/ Checkout</div>
        <h1 className="font-display text-4xl tracking-wide md:text-5xl">Finalize sua compra</h1>
        <p className="mt-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-[color:var(--sage)]" />
          Pagamento 100% seguro · criptografia SSL
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT — form */}
          <div className="space-y-8">
            <section>
              <h2 className="font-display text-2xl tracking-wide">1. Seus dados</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input placeholder="Nome completo" value={name} onChange={setName} className="sm:col-span-2" />
                <Input placeholder="E-mail" type="email" value={email} onChange={setEmail} />
                <Input placeholder="Telefone" value={phone} onChange={(v) => setPhone(maskPhone(v))} />
                <Input placeholder="CPF" value={cpf} onChange={(v) => setCpf(maskCPF(v))} />
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-wide">2. Entrega</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-6">
                <Input placeholder="CEP" value={cep} onChange={(v) => setCep(maskCEP(v))} className="sm:col-span-2" />
                {cepLoading && (
                  <div className="flex items-center font-mono text-xs text-muted-foreground sm:col-span-4">
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Buscando endereço…
                  </div>
                )}
                <Input placeholder="Rua" value={street} onChange={setStreet} className="sm:col-span-4" />
                <Input placeholder="Número" value={streetNumber} onChange={setStreetNumber} className="sm:col-span-2" />
                <Input placeholder="Complemento (opcional)" value={complement} onChange={setComplement} className="sm:col-span-3" />
                <Input placeholder="Bairro" value={neighborhood} onChange={setNeighborhood} className="sm:col-span-3" />
                <Input placeholder="Cidade" value={city} onChange={setCity} className="sm:col-span-4" />
                <Input placeholder="UF" value={state} onChange={(v) => setState(v.toUpperCase().slice(0, 2))} className="sm:col-span-2" />
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl tracking-wide">3. Pagamento</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {(["PIX", "CREDIT_CARD", "BOLETO"] as Method[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`rounded-sm border py-3 font-mono text-[11px] uppercase tracking-widest transition ${
                      method === m
                        ? "border-[color:var(--terracotta)] bg-[color:var(--terracotta)]/10 text-[color:var(--terracotta)]"
                        : "border-[color:var(--graphite)]/20 hover:border-[color:var(--graphite)]/40"
                    }`}
                  >
                    {m === "PIX" ? "Pix" : m === "CREDIT_CARD" ? "Cartão" : "Boleto"}
                  </button>
                ))}
              </div>

              {method === "PIX" && (
                <p className="mt-3 rounded-sm bg-[color:var(--sage)]/10 p-3 font-mono text-xs text-[color:var(--graphite)]/80">
                  Aprovação imediata. Você verá o QR Code na próxima tela.
                </p>
              )}
              {method === "BOLETO" && (
                <p className="mt-3 rounded-sm bg-[color:var(--sage)]/10 p-3 font-mono text-xs text-[color:var(--graphite)]/80">
                  Compensação em até 3 dias úteis. Envio após confirmação.
                </p>
              )}
              {method === "CREDIT_CARD" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-6">
                  <Input placeholder="Número do cartão" value={cardNumber} onChange={(v) => setCardNumber(maskCard(v))} className="sm:col-span-6" />
                  <Input placeholder="Nome no cartão" value={cardHolder} onChange={(v) => setCardHolder(v.toUpperCase())} className="sm:col-span-6" />
                  <Input placeholder="Validade MM/AA" value={cardExp} onChange={(v) => setCardExp(maskExp(v))} className="sm:col-span-2" />
                  <Input placeholder="CVV" value={cardCvv} onChange={(v) => setCardCvv(onlyDigits(v).slice(0, 4))} className="sm:col-span-2" />
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value))}
                    className="rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-2 font-mono text-xs sm:col-span-2"
                  >
                    {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}x de {formatBRL(Math.round(totalCents / n))}{n === 1 ? " à vista" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT — summary */}
          <aside className="h-fit rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] p-6">
            <h3 className="font-display text-xl tracking-wide">Resumo</h3>
            <ul className="mt-4 space-y-3">
              {items.map((it) => {
                const p = getProduct(it.slug)!;
                return (
                  <li key={it.slug + it.variant} className="flex gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm bg-[color:var(--bone)] p-1">
                      <ProductImage product={p} fit="contain" className="h-full w-full" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="font-display text-sm tracking-wide">{p.shortName}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">Qtd. {it.quantity}</div>
                    </div>
                    <div className="font-mono text-xs text-[color:var(--terracotta)]">
                      {formatBRL(p.priceCents * it.quantity)}
                    </div>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-[color:var(--graphite)]/10 pt-4 font-mono text-xs">
              <div className="flex justify-between text-muted-foreground">
                <dt>Subtotal</dt><dd>{formatBRL(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <dt>Frete</dt>
                <dd>{shippingCents === 0 ? "Grátis" : formatBRL(shippingCents)}</dd>
              </div>
              <div className="flex justify-between border-t border-[color:var(--graphite)]/10 pt-2 text-base">
                <dt className="font-sans">Total</dt>
                <dd className="text-[color:var(--terracotta)]">{formatBRL(totalCents)}</dd>
              </div>
            </dl>

            {upsell && (
              <div className="mt-5 rounded-sm border border-dashed border-[color:var(--sage)] bg-[color:var(--sage)]/10 p-3 font-mono text-[11px]">
                <div className="uppercase tracking-widest text-[color:var(--sage)]">Última chance</div>
                <div className="mt-1 text-[color:var(--graphite)]/80">
                  Adicione {upsell.shortName} por +{formatBRL(upsell.priceCents)} — cadastro no carrinho.
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-sm bg-[color:var(--terracotta)]/10 p-3 font-mono text-[11px] text-[color:var(--terracotta)]">
                <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={submit}
              disabled={busy}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--terracotta)] py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (<><Loader2 className="h-4 w-4 animate-spin" /> Processando…</>) : (
                <>Finalizar pedido <ArrowRight className="h-4 w-4" /></>
              )}
            </button>

            <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--sage)]" />
              Ambiente seguro · seus dados criptografados
            </div>
          </aside>
        </div>
      </div>
    </StoreLayout>
  );
}

function Input({
  placeholder, value, onChange, type = "text", className = "",
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-2.5 font-sans text-sm outline-none transition focus:border-[color:var(--sage)] ${className}`}
    />
  );
}
