import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductImage } from "@/components/paze/ProductImage";
import { formatBRL, getProduct, PRODUCTS } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Check, CircleCheck, Copy, CircleAlert, ShieldCheck } from "lucide-react";
import { createHypercashTransaction, type CreateTransactionInput } from "@/lib/hypercash.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Paze" },
      { name: "description", content: "Finalize seu pedido Paze com segurança." },
    ],
  }),
  component: Checkout,
});

type Step = 1 | 2 | 3 | 4;

type ShippingData = {
  name: string; email: string; document: string; phone: string;
  zipCode: string; street: string; streetNumber: string; complement: string;
  neighborhood: string; city: string; state: string;
};

type TxResult = {
  id: string; status: string; amount: number; paymentMethod: string;
  pix: { qrcode?: string | null; url?: string | null; expirationDate?: string | null } | null;
  boleto: { url?: string | null; barcode?: string | null; digitableLine?: string | null } | null;
  card: unknown | null;
};

// ─── Meta Pixel helpers (safe no-ops when pixel not installed) ───────────
// To ativar: adicionar VITE_META_PIXEL_ID no .env e o snippet base no __root.
declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}
function pixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

function Checkout() {
  const { items, subtotalCents, addItem, clear } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [shipping, setShipping] = useState<ShippingData | null>(null);
  const [tx, setTx] = useState<TxResult | null>(null);
  const [orderRef] = useState(() => "PZ" + Math.random().toString(36).slice(2, 8).toUpperCase());

  const shippingCents = subtotalCents >= 9990 ? 0 : 1990;
  const total = subtotalCents + shippingCents;

  if (items.length === 0 && step !== 4) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
          <h1 className="font-display text-4xl tracking-wide">Seu carrinho está vazio</h1>
          <p className="mt-4 text-muted-foreground">Adicione produtos para finalizar sua compra.</p>
          <Link to="/produtos" className="mt-8 inline-block rounded-sm bg-[color:var(--terracotta)] px-6 py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]">
            Ver produtos
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        {step !== 4 && (
          <>
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">/ Checkout</div>
            <h1 className="font-display text-4xl tracking-wide md:text-5xl">Finalizar compra</h1>
            <Stepper current={step} />
          </>
        )}

        {step === 1 && (
          <ShippingStep
            onNext={(data) => {
              setShipping(data);
              pixel("AddPaymentInfo");
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <SummaryStep
            subtotal={subtotalCents}
            shipping={shippingCents}
            total={total}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            onAddUpsell={(slug) => addItem(slug, 1)}
          />
        )}
        {step === 3 && shipping && (
          <PaymentStep
            shipping={shipping}
            shippingCents={shippingCents}
            total={total}
            orderRef={orderRef}
            onSuccess={(result) => {
              setTx(result);
              pixel("Purchase", { value: total / 100, currency: "BRL" });
              clear();
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && tx && (
          <ConfirmedStep tx={tx} orderRef={orderRef} onHome={() => navigate({ to: "/" })} />
        )}
      </div>
    </StoreLayout>
  );
}

function Stepper({ current }: { current: Step }) {
  const steps = ["Entrega", "Resumo", "Pagamento"];
  return (
    <ol className="mt-8 flex items-center gap-4 border-y border-[color:var(--graphite)]/10 py-4">
      {steps.map((s, i) => {
        const n = (i + 1) as Step;
        const active = current === n;
        const done = current > n;
        return (
          <li key={s} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${done ? "bg-[color:var(--sage)] text-[color:var(--bone)]" : active ? "bg-[color:var(--terracotta)] text-[color:var(--bone)]" : "bg-[color:var(--graphite)]/10 text-muted-foreground"}`}>
              {done ? <Check className="h-3 w-3" /> : n}
            </span>
            <span className={active || done ? "text-[color:var(--graphite)]" : "text-muted-foreground"}>{s}</span>
            {i < steps.length - 1 && <span className="mx-2 h-px w-8 bg-[color:var(--graphite)]/10" />}
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input {...props} className="w-full rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-3 font-sans text-sm outline-none focus:border-[color:var(--sage)]" />
    </label>
  );
}

function ShippingStep({ onNext }: { onNext: (data: ShippingData) => void }) {
  const [data, setData] = useState<ShippingData>({
    name: "", email: "", document: "", phone: "", zipCode: "",
    street: "", streetNumber: "", complement: "", neighborhood: "", city: "", state: "",
  });
  const set = <K extends keyof ShippingData>(k: K, v: string) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onNext(data); }}
      className="mt-8 grid gap-4 md:grid-cols-2"
    >
      <Field label="Nome completo" required value={data.name} onChange={(e) => set("name", e.target.value)} autoFocus />
      <Field label="E-mail" type="email" required value={data.email} onChange={(e) => set("email", e.target.value)} />
      <Field label="CPF" required placeholder="000.000.000-00" value={data.document} onChange={(e) => set("document", e.target.value)} />
      <Field label="Telefone" required placeholder="(11) 99999-9999" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
      <Field label="CEP" required value={data.zipCode} onChange={(e) => set("zipCode", e.target.value)} />
      <div className="md:col-span-2 grid gap-4 md:grid-cols-[1fr_120px]">
        <Field label="Endereço" required value={data.street} onChange={(e) => set("street", e.target.value)} />
        <Field label="Número" required value={data.streetNumber} onChange={(e) => set("streetNumber", e.target.value)} />
      </div>
      <Field label="Complemento" value={data.complement} onChange={(e) => set("complement", e.target.value)} />
      <Field label="Bairro" required value={data.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
      <Field label="Cidade" required value={data.city} onChange={(e) => set("city", e.target.value)} />
      <Field label="Estado (UF)" required maxLength={2} value={data.state} onChange={(e) => set("state", e.target.value.toUpperCase())} />
      <div className="md:col-span-2 mt-4 flex justify-end">
        <button className="rounded-sm bg-[color:var(--terracotta)] px-8 py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)]">
          Continuar
        </button>
      </div>
    </form>
  );
}

function SummaryStep({
  subtotal, shipping, total, onNext, onBack, onAddUpsell,
}: {
  subtotal: number; shipping: number; total: number;
  onNext: () => void; onBack: () => void; onAddUpsell: (slug: string) => void;
}) {
  const { items } = useCart();
  const hasKit = items.some((i) => i.slug === "kit-seguranca-urbana");
  const upsell = !hasKit ? getProduct("kit-seguranca-urbana") : PRODUCTS.find((p) => !items.some((i) => i.slug === p.slug));

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="font-display text-2xl tracking-wide">Seu pedido</h2>
        <ul className="mt-4 divide-y divide-[color:var(--graphite)]/10 rounded-md border border-[color:var(--graphite)]/10">
          {items.map((it) => {
            const p = getProduct(it.slug)!;
            return (
              <li key={it.slug + it.variant} className="flex gap-4 p-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm bg-[color:var(--bone)] p-1">
                  <ProductImage product={p} fit="contain" className="h-full w-full" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-lg tracking-wide">{p.shortName.toUpperCase()}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    Qtd. {it.quantity} {it.variant && `· ${it.variant}`}
                  </div>
                </div>
                <div className="font-mono text-sm text-[color:var(--terracotta)]">
                  {formatBRL(p.priceCents * it.quantity)}
                </div>
              </li>
            );
          })}
        </ul>

        {upsell && (
          <div className="mt-6 rounded-md border border-dashed border-[color:var(--sage)] bg-[color:var(--sage)]/10 p-5">
            <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
              Última chance
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-sm bg-[color:var(--bone)] p-1">
                <ProductImage product={upsell} fit="contain" className="h-full w-full" />
              </div>
              <div className="flex-1">
                <div className="font-display text-lg tracking-wide">Adicione {upsell.shortName}</div>
                <div className="font-mono text-xs text-muted-foreground">por +{formatBRL(upsell.priceCents)}</div>
              </div>
              <button
                onClick={() => onAddUpsell(upsell.slug)}
                className="rounded-sm border border-[color:var(--graphite)] px-3 py-2 font-mono text-[11px] uppercase tracking-wider hover:bg-[color:var(--graphite)] hover:text-[color:var(--bone)]"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] p-6">
        <h3 className="font-display text-xl tracking-wide">Resumo</h3>
        <dl className="mt-4 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-muted-foreground"><dt>Subtotal</dt><dd>{formatBRL(subtotal)}</dd></div>
          <div className="flex justify-between text-muted-foreground"><dt>Frete</dt><dd>{shipping === 0 ? "Grátis" : formatBRL(shipping)}</dd></div>
          <div className="flex justify-between border-t border-[color:var(--graphite)]/10 pt-2 text-base">
            <dt className="font-sans">Total</dt>
            <dd className="text-[color:var(--terracotta)]">{formatBRL(total)}</dd>
          </div>
        </dl>
        <button onClick={onNext} className="mt-6 w-full rounded-sm bg-[color:var(--terracotta)] py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)]">
          Ir para pagamento
        </button>
        <button onClick={onBack} className="mt-2 w-full rounded-sm border border-[color:var(--graphite)]/20 py-3 font-mono text-xs uppercase tracking-widest">
          Voltar
        </button>
      </aside>
    </div>
  );
}

function PaymentStep({
  shipping, shippingCents, total, orderRef, onSuccess, onBack,
}: {
  shipping: ShippingData;
  shippingCents: number;
  total: number;
  orderRef: string;
  onSuccess: (r: TxResult) => void;
  onBack: () => void;
}) {
  const { items } = useCart();
  const create = useServerFn(createHypercashTransaction);
  const [method, setMethod] = useState<"CREDIT_CARD" | "PIX" | "BOLETO">("PIX");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cartão
  const [card, setCard] = useState({ number: "", holderName: "", exp: "", cvv: "", installments: 1 });

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const input: CreateTransactionInput = {
        paymentMethod: method,
        shippingFeeCents: shippingCents,
        externalRef: orderRef,
        items: items.map((i) => {
          const p = getProduct(i.slug)!;
          return { slug: i.slug, title: p.name, unitPriceCents: p.priceCents, quantity: i.quantity };
        }),
        customer: {
          name: shipping.name,
          email: shipping.email,
          document: shipping.document,
          phone: shipping.phone,
        },
        address: {
          street: shipping.street,
          streetNumber: shipping.streetNumber,
          complement: shipping.complement || undefined,
          zipCode: shipping.zipCode,
          neighborhood: shipping.neighborhood,
          city: shipping.city,
          state: shipping.state,
        },
      };
      if (method === "CREDIT_CARD") {
        const [m, y] = card.exp.split("/").map((s) => s.trim());
        input.card = {
          number: card.number,
          holderName: card.holderName,
          expirationMonth: Number(m),
          expirationYear: Number(y?.length === 2 ? "20" + y : y),
          cvv: card.cvv,
          installments: card.installments,
        };
      }
      const res = await create({ data: input });
      onSuccess(res as TxResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao processar pagamento");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="font-display text-2xl tracking-wide">Forma de pagamento</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {([
            ["PIX", "Pix"], ["CREDIT_CARD", "Cartão"], ["BOLETO", "Boleto"],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded-sm border px-3 py-4 font-mono text-xs uppercase tracking-widest ${
                method === m ? "border-[color:var(--terracotta)] bg-[color:var(--terracotta)] text-[color:var(--bone)]" : "border-[color:var(--graphite)]/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-[color:var(--graphite)]/10 p-6">
          {method === "CREDIT_CARD" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Número do cartão" placeholder="0000 0000 0000 0000" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
              </div>
              <Field label="Nome no cartão" value={card.holderName} onChange={(e) => setCard({ ...card, holderName: e.target.value })} />
              <Field label="Validade" placeholder="MM/AAAA" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
              <Field label="CVV" placeholder="000" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
              <label className="block">
                <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Parcelas</span>
                <select
                  value={card.installments}
                  onChange={(e) => setCard({ ...card, installments: Number(e.target.value) })}
                  className="w-full rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-3 font-sans text-sm outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 10, 12].map((n) => (
                    <option key={n} value={n}>{n}× {formatBRL(Math.round(total / n))} sem juros</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {method === "PIX" && (
            <div className="text-center">
              <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-md border border-dashed border-[color:var(--graphite)]/30 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                QR Code Pix
              </div>
              <p className="mt-4 font-mono text-xs text-muted-foreground">
                Ao confirmar, geramos o QR Code Pix instantâneo via Hypercash.
              </p>
            </div>
          )}
          {method === "BOLETO" && (
            <p className="font-mono text-xs text-muted-foreground">
              Boleto emitido pela Hypercash. Vencimento em 3 dias úteis, código enviado por e-mail.
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-sm bg-[color:var(--terracotta)]/10 px-3 py-2 font-mono text-xs text-[color:var(--terracotta)]">
            <CircleAlert className="h-4 w-4" /> {error}
          </div>
        )}
      </div>

      <aside className="h-fit rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] p-6">
        <h3 className="font-display text-xl tracking-wide">Total do pedido</h3>
        <div className="mt-4 font-mono text-3xl text-[color:var(--terracotta)]">{formatBRL(total)}</div>
        <button
          onClick={submit}
          disabled={busy}
          className="mt-6 w-full rounded-sm bg-[color:var(--terracotta)] py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)] disabled:opacity-60"
        >
          {busy ? "Processando…" : "Confirmar pedido"}
        </button>
        <button onClick={onBack} disabled={busy} className="mt-2 w-full rounded-sm border border-[color:var(--graphite)]/20 py-3 font-mono text-xs uppercase tracking-widest">
          Voltar
        </button>
        <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--sage)]" /> Pagamento via Hypercash
        </div>
      </aside>
    </div>
  );
}

function ConfirmedStep({ tx, orderRef, onHome }: { tx: TxResult; orderRef: string; onHome: () => void }) {
  const [copied, setCopied] = useState(false);
  const isPix = tx.paymentMethod === "PIX" && tx.pix;
  const isBoleto = tx.paymentMethod === "BOLETO" && tx.boleto;
  const pixCode = tx.pix?.qrcode || tx.pix?.url || "";

  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <CircleCheck className="mx-auto h-16 w-16 text-[color:var(--sage)]" strokeWidth={1.2} />
      <div className="mt-6 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">Pedido confirmado</div>
      <h1 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">Bora treinar.</h1>
      <p className="mt-4 text-muted-foreground">
        {tx.status === "PAID"
          ? "Pagamento aprovado. Enviamos os detalhes por e-mail."
          : "Recebemos seu pedido. Assim que o pagamento for confirmado, ele entra em separação."}
      </p>

      {isPix && pixCode && (
        <div className="mt-8 rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] p-6 text-left">
          <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">Pague com Pix</div>
          <p className="mt-2 text-sm text-muted-foreground">Copie o código abaixo e cole no seu app do banco:</p>
          <div className="mt-3 flex gap-2">
            <code className="flex-1 truncate rounded-sm border border-[color:var(--graphite)]/20 bg-[color:var(--bone)] px-3 py-3 font-mono text-xs">
              {pixCode}
            </code>
            <button
              onClick={() => { navigator.clipboard.writeText(pixCode); setCopied(true); }}
              className="inline-flex items-center gap-2 rounded-sm bg-[color:var(--graphite)] px-3 font-mono text-[11px] uppercase tracking-widest text-[color:var(--bone)]"
            >
              <Copy className="h-3.5 w-3.5" /> {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      {isBoleto && (tx.boleto?.url || tx.boleto?.digitableLine) && (
        <div className="mt-8 rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] p-6 text-left">
          <div className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">Boleto gerado</div>
          {tx.boleto?.digitableLine && (
            <code className="mt-3 block break-all rounded-sm border border-[color:var(--graphite)]/20 bg-[color:var(--bone)] px-3 py-3 font-mono text-xs">
              {tx.boleto.digitableLine}
            </code>
          )}
          {tx.boleto?.url && (
            <a href={tx.boleto.url} target="_blank" rel="noreferrer" className="mt-3 inline-block rounded-sm bg-[color:var(--terracotta)] px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-[color:var(--bone)]">
              Abrir boleto
            </a>
          )}
        </div>
      )}

      <div className="mt-8 inline-flex items-center gap-3 rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] px-6 py-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Pedido</span>
        <span className="font-mono text-lg text-[color:var(--graphite)]">{orderRef}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">· TX {tx.id.slice(0, 8)}</span>
      </div>

      <div className="mt-10">
        <button onClick={onHome} className="rounded-sm bg-[color:var(--terracotta)] px-8 py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)]">
          Voltar para a loja
        </button>
      </div>
    </div>
  );
}
