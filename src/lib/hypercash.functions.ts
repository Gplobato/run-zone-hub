import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";

const HYPERCASH_URL = "https://api.hypercashbrasil.com.br";

const onlyDigits = (value: string) => (value || "").replace(/\D+/g, "");

function envValue(name: string): string | undefined {
  const nodeValue = process.env[name];
  if (nodeValue) return nodeValue;

  const cloudflareEnv = (
    globalThis as typeof globalThis & {
      __env__?: Record<string, string | undefined>;
    }
  ).__env__;

  return cloudflareEnv?.[name];
}

function toBase64(value: string) {
  if (typeof btoa === "function") return btoa(value);
  return Buffer.from(value).toString("base64");
}

function authHeader() {
  const secret = envValue("HYPERCASH_SECRET_KEY");
  if (!secret) throw new Error("HYPERCASH_SECRET_KEY nao configurado");
  return `Basic ${toBase64(`x:${secret}`)}`;
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

export type HypercashCartItemInput = {
  slug: string;
  title: string;
  unitPriceCents: number;
  quantity: number;
};

export type HypercashCustomerInput = {
  name: string;
  email: string;
  document: string;
  phone: string;
};

export type HypercashAddressInput = {
  street: string;
  streetNumber: string;
  complement?: string;
  zipCode: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type HypercashCardInput = {
  number: string;
  holderName: string;
  expirationMonth: number;
  expirationYear: number;
  cvv: string;
  installments: number;
};

export type CreateHypercashTransactionInput = {
  paymentMethod: "PIX" | "CREDIT_CARD";
  items: HypercashCartItemInput[];
  shippingFeeCents: number;
  customer: HypercashCustomerInput;
  address: HypercashAddressInput;
  card?: HypercashCardInput;
};

export const createHypercashTransaction = createServerFn({ method: "POST" })
  .inputValidator((data: CreateHypercashTransactionInput) => {
    if (!data?.items?.length) throw new Error("Sem itens no pedido.");
    if (!data.customer?.name?.trim()) throw new Error("Nome obrigatorio.");
    if (!/.+@.+\..+/.test(data.customer?.email || "")) throw new Error("E-mail obrigatorio.");
    if (onlyDigits(data.customer.document).length !== 11) throw new Error("CPF obrigatorio.");
    if (onlyDigits(data.customer.phone).length < 10) throw new Error("Telefone obrigatorio.");
    if (onlyDigits(data.address.zipCode).length !== 8) throw new Error("CEP obrigatorio.");
    if (!data.address.street?.trim()) throw new Error("Endereco obrigatorio.");
    if (!data.address.streetNumber?.trim()) throw new Error("Numero obrigatorio.");
    if (!data.address.neighborhood?.trim()) throw new Error("Bairro obrigatorio.");
    if (!data.address.city?.trim()) throw new Error("Cidade obrigatoria.");
    if (data.address.state?.trim().length !== 2) throw new Error("UF obrigatoria.");
    if (data.paymentMethod === "CREDIT_CARD" && !data.card)
      throw new Error("Dados do cartao obrigatorios.");
    return data;
  })
  .handler(async ({ data }) => {
    const itemsTotal = data.items.reduce(
      (acc, item) => acc + item.unitPriceCents * item.quantity,
      0,
    );
    const amount = itemsTotal + data.shippingFeeCents;

    let clientIp: string | undefined;
    let postbackUrl: string | undefined;
    try {
      const forwarded = getRequestHeader("x-forwarded-for");
      clientIp = forwarded?.split(",")[0]?.trim() || undefined;
      const request = getRequest();
      postbackUrl = `${new URL(request.url).origin}/api/public/webhooks/hypercash`;
    } catch {
      // Server functions can run outside a request context during local tooling.
    }

    const payload: Record<string, unknown> = {
      amount,
      currency: "BRL",
      paymentMethod: data.paymentMethod,
      customer: {
        name: data.customer.name.trim(),
        email: data.customer.email.trim(),
        phone: onlyDigits(data.customer.phone),
        document: {
          number: onlyDigits(data.customer.document),
          type: "CPF",
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
          state: data.address.state.toUpperCase(),
          country: "br",
        },
      },
      items: data.items.map((item) => ({
        title: item.title,
        unitPrice: item.unitPriceCents,
        quantity: item.quantity,
        tangible: true,
      })),
      traceable: true,
      ip: clientIp,
      postbackUrl,
    };

    if (data.paymentMethod === "PIX") {
      payload.pix = { expiresInDays: 1 };
    }

    if (data.paymentMethod === "CREDIT_CARD" && data.card) {
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
      card: tx.card ?? null,
    };
  });

export const getHypercashTransaction = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => {
    if (!data?.id) throw new Error("id obrigatorio");
    return data;
  })
  .handler(async ({ data }) => {
    const body = await hcFetch(`/api/user/transactions/${data.id}`);
    const tx = body?.data ?? body;
    return {
      id: tx.id as string,
      status: tx.status as string,
      amount: tx.amount as number,
    };
  });
