import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductImage } from "@/components/paze/ProductImage";
import { formatBRL, getProduct, PRODUCTS } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Check, CircleCheck } from "lucide-react";

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

function Checkout() {
  const { items, subtotalCents, addItem, clear } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [orderId] = useState(() => "PZ" + Math.random().toString(36).slice(2, 8).toUpperCase());

  const shipping = subtotalCents >= 9990 ? 0 : 1990;
  const total = subtotalCents + shipping;

  if (items.length === 0 && step !== 4) {
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

  return (
    <StoreLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        {step !== 4 && (
          <>
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
              / Checkout
            </div>
            <h1 className="font-display text-4xl tracking-wide md:text-5xl">
              Finalizar compra
            </h1>
            <Stepper current={step} />
          </>
        )}

        {step === 1 && <ShippingStep onNext={() => setStep(2)} />}
        {step === 2 && (
          <SummaryStep
            subtotal={subtotalCents}
            shipping={shipping}
            total={total}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            onAddUpsell={(slug) => addItem(slug, 1)}
          />
        )}
        {step === 3 && (
          <PaymentStep
            total={total}
            onConfirm={() => {
              // TODO: fbq('track','Purchase',{value:total/100,currency:'BRL'});
              // TODO: gtag('event','purchase',{transaction_id:orderId,value:total/100,currency:'BRL'});
              // TODO: ttq.track('CompletePayment',{value:total/100,currency:'BRL'});
              clear();
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && <ConfirmedStep orderId={orderId} onHome={() => navigate({ to: "/" })} />}
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
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                done
                  ? "bg-[color:var(--sage)] text-[color:var(--bone)]"
                  : active
                  ? "bg-[color:var(--terracotta)] text-[color:var(--bone)]"
                  : "bg-[color:var(--graphite)]/10 text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3 w-3" /> : n}
            </span>
            <span className={active || done ? "text-[color:var(--graphite)]" : "text-muted-foreground"}>
              {s}
            </span>
            {i < steps.length - 1 && <span className="mx-2 h-px w-8 bg-[color:var(--graphite)]/10" />}
          </li>
        );
      })}
    </ol>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-3 font-sans text-sm outline-none focus:border-[color:var(--sage)]"
      />
    </label>
  );
}

function ShippingStep({ onNext }: { onNext: () => void }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onNext(); }}
      className="mt-8 grid gap-4 md:grid-cols-2"
    >
      <Field label="Nome completo" required autoFocus />
      <Field label="E-mail" type="email" required />
      <Field label="CPF" required />
      <Field label="Telefone" required />
      <Field label="CEP" required />
      <div className="md:col-span-2 grid gap-4 md:grid-cols-[1fr_120px]">
        <Field label="Endereço" required />
        <Field label="Número" required />
      </div>
      <Field label="Complemento" />
      <Field label="Bairro" required />
      <Field label="Cidade" required />
      <Field label="Estado" required />
      <div className="md:col-span-2 mt-4 flex justify-end">
        <button className="rounded-sm bg-[color:var(--terracotta)] px-8 py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)]">
          Continuar
        </button>
      </div>
    </form>
  );
}

function SummaryStep({
  subtotal,
  shipping,
  total,
  onNext,
  onBack,
  onAddUpsell,
}: {
  subtotal: number;
  shipping: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
  onAddUpsell: (slug: string) => void;
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
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm">
                  <ProductImage product={p} className="h-full w-full" />
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
              <div className="h-14 w-14 overflow-hidden rounded-sm">
                <ProductImage product={upsell} className="h-full w-full" />
              </div>
              <div className="flex-1">
                <div className="font-display text-lg tracking-wide">
                  Adicione {upsell.shortName}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  por +{formatBRL(upsell.priceCents)}
                </div>
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
          <div className="flex justify-between text-muted-foreground">
            <dt>Subtotal</dt><dd>{formatBRL(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <dt>Frete</dt><dd>{shipping === 0 ? "Grátis" : formatBRL(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-[color:var(--graphite)]/10 pt-2 text-base">
            <dt className="font-sans">Total</dt>
            <dd className="text-[color:var(--terracotta)]">{formatBRL(total)}</dd>
          </div>
        </dl>
        <button
          onClick={onNext}
          className="mt-6 w-full rounded-sm bg-[color:var(--terracotta)] py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)]"
        >
          Ir para pagamento
        </button>
        <button
          onClick={onBack}
          className="mt-2 w-full rounded-sm border border-[color:var(--graphite)]/20 py-3 font-mono text-xs uppercase tracking-widest"
        >
          Voltar
        </button>
      </aside>
    </div>
  );
}

function PaymentStep({
  total,
  onConfirm,
  onBack,
}: {
  total: number;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const [method, setMethod] = useState<"card" | "pix" | "boleto">("card");

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr]">
      <div>
        <h2 className="font-display text-2xl tracking-wide">Forma de pagamento</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["card", "pix", "boleto"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded-sm border px-3 py-4 font-mono text-xs uppercase tracking-widest ${
                method === m
                  ? "border-[color:var(--terracotta)] bg-[color:var(--terracotta)] text-[color:var(--bone)]"
                  : "border-[color:var(--graphite)]/20"
              }`}
            >
              {m === "card" ? "Cartão" : m === "pix" ? "Pix" : "Boleto"}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-[color:var(--graphite)]/10 p-6">
          {method === "card" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Field label="Número do cartão" placeholder="0000 0000 0000 0000" /></div>
              <Field label="Nome no cartão" />
              <Field label="CPF do titular" />
              <Field label="Validade" placeholder="MM/AA" />
              <Field label="CVV" placeholder="000" />
              <div className="md:col-span-2">
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Parcelas
                </label>
                <select className="w-full rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-3 font-sans text-sm outline-none">
                  <option>1× {formatBRL(total)} sem juros</option>
                  <option>3× {formatBRL(Math.round(total / 3))} sem juros</option>
                  <option>10× {formatBRL(Math.round(total / 10))} sem juros</option>
                </select>
              </div>
            </div>
          )}
          {method === "pix" && (
            <div className="text-center">
              <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-md border border-dashed border-[color:var(--graphite)]/30 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                QR Code Pix
              </div>
              <p className="mt-4 font-mono text-xs text-muted-foreground">
                Ao confirmar, você receberá o QR Code para pagamento imediato.
              </p>
            </div>
          )}
          {method === "boleto" && (
            <p className="font-mono text-xs text-muted-foreground">
              O boleto será gerado na tela seguinte e enviado por e-mail. Vencimento em 3 dias úteis.
            </p>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] p-6">
        <h3 className="font-display text-xl tracking-wide">Total do pedido</h3>
        <div className="mt-4 font-mono text-3xl text-[color:var(--terracotta)]">
          {formatBRL(total)}
        </div>
        <button
          onClick={onConfirm}
          className="mt-6 w-full rounded-sm bg-[color:var(--terracotta)] py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)]"
        >
          Confirmar pedido
        </button>
        <button
          onClick={onBack}
          className="mt-2 w-full rounded-sm border border-[color:var(--graphite)]/20 py-3 font-mono text-xs uppercase tracking-widest"
        >
          Voltar
        </button>
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Nenhum valor será cobrado — checkout de demonstração
        </p>
      </aside>
    </div>
  );
}

function ConfirmedStep({ orderId, onHome }: { orderId: string; onHome: () => void }) {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <CircleCheck className="mx-auto h-16 w-16 text-[color:var(--sage)]" strokeWidth={1.2} />
      <div className="mt-6 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
        Pedido confirmado
      </div>
      <h1 className="mt-3 font-display text-5xl tracking-wide md:text-6xl">
        Bora treinar.
      </h1>
      <p className="mt-4 text-muted-foreground">
        Enviamos os detalhes por e-mail. Você pode acompanhar a entrega pelo código abaixo.
      </p>
      <div className="mt-8 inline-flex items-center gap-3 rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03] px-6 py-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Pedido
        </span>
        <span className="font-mono text-lg text-[color:var(--graphite)]">{orderId}</span>
      </div>
      <div className="mt-10">
        <button
          onClick={onHome}
          className="rounded-sm bg-[color:var(--terracotta)] px-8 py-4 font-mono text-sm uppercase tracking-widest text-[color:var(--bone)]"
        >
          Voltar para a loja
        </button>
      </div>
    </div>
  );
}
