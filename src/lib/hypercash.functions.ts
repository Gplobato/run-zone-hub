// ─── Hypercash payment gateway — server functions ────────────────────────
// Docs: https://docs.hypercash.com.br/docs/api/user-transaction-controller-create-transaction
// Auth: Basic base64("x:" + SECRET_KEY). Prod URL: https://api.hypercashbrasil.com.br
// All amounts in centavos (BRL). Never expose the secret key to the browser.
// ─────────────────────────────────────────────────────────────────────────

import { createServerFn } from "@tanstack/react-start";

const HYPERCASH_URL = "https://api.hypercashbrasil.com.br";

function authHeader() {
  const secret = process.env.HYPERCASH_SECRET_KEY;
  if (!secret) throw new Error("HYPERCASH_SECRET_KEY not configured");
  const token = Buffer.from(`x:${secret}`).toString("base64");
  return `Basic ${token}`;
}

async function hcFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${HYPERCASH_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = body?.message || body?.error || `Hypercash ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

// ─── Types ──────────────────────────────────────────────────────────────
export type CartItemInput = {
  slug: string;
  title: string;
  unitPriceCents: number;
  quantity: number;
};

export type CustomerInput = {
  name: string;
  email: string;
  document: string; // CPF only digits
  phone: string;
};

export type AddressInput = {
  street: string;
  streetNumber: string;
  complement?: string;
  zipCode: string; // digits only
  neighborhood: string;
  city: string;
  state: string;
};

export type CardInput = {
  number: string;
  holderName: string;
  expirationMonth: number;
  expirationYear: number;
  cvv: string;
  installments: number;
};

export type CreateTransactionInput = {
  paymentMethod: "PIX" | "BOLETO" | "CREDIT_CARD";
  items: CartItemInput[];
  shippingFeeCents: number;
  customer: CustomerInput;
  address: AddressInput;
  card?: CardInput;
  externalRef?: string;
};

// Digits only utility for CPF, phone, CEP.
const onlyDigits = (v: string) => (v || "").replace(/\D+/g, "");

// ─── Ping / balance — quick auth check used by /admin ───────────────────
export const hypercashPing = createServerFn({ method: "GET" }).handler(async () => {
  const body = await hcFetch("/api/user/wallet/balance");
  return {
    ok: true as const,
    balanceCents: body?.data?.balance ?? 0,
    withheldCents: body?.data?.withheldBalance ?? 0,
  };
});

// ─── Create transaction ─────────────────────────────────────────────────
export const createHypercashTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: CreateTransactionInput) => {
    if (!data?.items?.length) throw new Error("Sem itens no pedido.");
    if (!data.customer?.email) throw new Error("E-mail obrigatório.");
    if (!data.customer?.name) throw new Error("Nome obrigatório.");
    if (!onlyDigits(data.customer.document)) throw new Error("CPF obrigatório.");
    if (!data.address?.zipCode) throw new Error("CEP obrigatório.");
    if (data.paymentMethod === "CREDIT_CARD" && !data.card)
      throw new Error("Dados do cartão obrigatórios.");
    return data;
  })
  .handler(async ({ data }) => {
    const itemsTotal = data.items.reduce(
      (acc, i) => acc + i.unitPriceCents * i.quantity,
      0,
    );
    const amount = itemsTotal + data.shippingFeeCents;

    const payload: Record<string, unknown> = {
      amount,
      currency: "BRL",
      paymentMethod: data.paymentMethod,
      customer: {
        name: data.customer.name,
        email: data.customer.email,
        phone: onlyDigits(data.customer.phone),
        document: {
          number: onlyDigits(data.customer.document),
          type: onlyDigits(data.customer.document).length === 14 ? "CNPJ" : "CPF",
        },
      },
      shipping: {
        fee: data.shippingFeeCents,
        address: {
          street: data.address.street,
          streetNumber: data.address.streetNumber,
          complement: data.address.complement || undefined,
          zipCode: onlyDigits(data.address.zipCode),
          neighborhood: data.address.neighborhood,
          city: data.address.city,
          state: data.address.state,
          country: "br",
        },
      },
      items: data.items.map((i) => ({
        title: i.title,
        unitPrice: i.unitPriceCents,
        quantity: i.quantity,
        tangible: true,
        externalRef: i.slug,
      })),
      traceable: true,
      externalRef: data.externalRef,
    };

    if (data.paymentMethod === "PIX") {
      payload.pix = { expiresInDays: 1 };
    } else if (data.paymentMethod === "BOLETO") {
      payload.boleto = { expiresInDays: 3 };
    } else if (data.paymentMethod === "CREDIT_CARD" && data.card) {
      payload.card = {
        number: onlyDigits(data.card.number),
        holderName: data.card.holderName,
        expirationMonth: data.card.expirationMonth,
        expirationYear: data.card.expirationYear,
        cvv: data.card.cvv,
        installments: Math.max(1, Math.min(12, data.card.installments || 1)),
      };
    }

    const body = await hcFetch("/api/user/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const tx = body?.data ?? body;
    return {
      id: tx.id as string,
      status: tx.status as string,
      amount: tx.amount as number,
      paymentMethod: tx.paymentMethod as string,
      pix: tx.pix ?? null,
      boleto: tx.boleto ?? null,
      card: tx.card ?? null,
    };
  });

// ─── Get transaction status (polling for PIX) ───────────────────────────
export const getHypercashTransaction = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => {
    if (!data?.id) throw new Error("id obrigatório");
    return data;
  })
  .handler(async ({ data }) => {
    const body = await hcFetch(`/api/user/transactions/${data.id}`);
    const tx = body?.data ?? body;
    return { id: tx.id, status: tx.status, amount: tx.amount };
  });
