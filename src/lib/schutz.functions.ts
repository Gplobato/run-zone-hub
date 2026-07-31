import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";

const HYPERCASH_URL = "https://api.hypercashbrasil.com.br";

const onlyDigits = (value: string) => (value || "").replace(/\D+/g, "");

/** Catálogo autoritativo — preços em centavos, nunca vindos do navegador. */
const SCHUTZ_CATALOG: Record<
  string,
  { title: string; unitPriceCents: number; externalRef: string; sizes: string[] }
> = {
  "sandalia-meia-pata-riviera": {
    title: "Sandália Meia Pata Couro Preta",
    unitPriceCents: 89000,
    externalRef: "S2272300080004",
    sizes: ["33", "34", "35", "36", "37", "38", "39", "40", "41"],
  },
};

const SHIPPING_FEE_CENTS = 0;
const MAX_QTY = 5;

const UFS = new Set([
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
]);

function envValue(name: string): string | undefined {
  const nodeValue = process.env[name];
  if (nodeValue) return nodeValue;
  const cf = (
    globalThis as typeof globalThis & { __env__?: Record<string, string | undefined> }
  ).__env__;
  return cf?.[name];
}

function toBase64(value: string) {
  if (typeof btoa === "function") return btoa(value);
  return Buffer.from(value).toString("base64");
}

function authHeader() {
  const secret = envValue("HYPERCASH_SECRET_KEY");
  if (!secret) throw new Error("Serviço de pagamento indisponível no momento.");
  return `Basic ${toBase64(`x:${secret}`)}`;
}

function friendlyError(status: number) {
  if (status === 400) return "Não foi possível gerar o PIX. Confira seus dados e tente novamente.";
  if (status === 401 || status === 403) return "Falha de autenticação com o provedor de pagamento.";
  if (status === 404) return "Recurso de pagamento não encontrado.";
  if (status === 429) return "Muitas tentativas. Aguarde alguns instantes.";
  return "O serviço de pagamento está temporariamente indisponível. Tente novamente.";
}

async function hcFetch(path: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let res: Response;
  try {
    res = await fetch(`${HYPERCASH_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader(),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new Error("O serviço de pagamento está temporariamente indisponível. Tente novamente.");
  } finally {
    clearTimeout(timeout);
  }

  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    console.error("[schutz-pix] gateway error", { status: res.status, path });
    throw new Error(friendlyError(res.status));
  }
  return body;
}

const STATUS_MAP: Record<string, string> = {
  PROCESSING: "processing",
  WAITING_PAYMENT: "pending",
  IN_ANALYSIS: "analysis",
  AUTHORIZED: "authorized",
  PAID: "paid",
  APPROVED: "paid",
  IN_PROTEST: "disputed",
  REFUNDED: "refunded",
  CHARGEDBACK: "chargeback",
  REFUSED: "refused",
  CANCELED: "canceled",
  EXPIRED: "expired",
};

function normalizeStatus(raw: unknown) {
  const upper = String(raw ?? "").trim().toUpperCase();
  return STATUS_MAP[upper] ?? (upper ? upper.toLowerCase() : "pending");
}

export type SchutzPixInput = {
  productSlug: string;
  size: string;
  quantity: number;
  name: string;
  email: string;
  document: string;
  phone: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
};

function isValidCPF(cpf: string) {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === Number(cpf[10]);
}

const trim = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export const createSchutzPix = createServerFn({ method: "POST" })
  .inputValidator((data: SchutzPixInput) => {
    const product = SCHUTZ_CATALOG[data?.productSlug];
    if (!product) throw new Error("Produto indisponível.");
    if (!product.sizes.includes(String(data.size))) throw new Error("Selecione um tamanho válido.");

    const quantity = Math.max(1, Math.min(MAX_QTY, Math.floor(Number(data.quantity) || 1)));
    const name = trim(data.name, 120);
    if (name.split(" ").filter(Boolean).length < 2) throw new Error("Informe seu nome completo.");
    const email = trim(data.email, 160).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("E-mail inválido.");
    const document = onlyDigits(data.document);
    if (!isValidCPF(document)) throw new Error("CPF inválido.");
    const phone = onlyDigits(data.phone);
    if (phone.length < 10 || phone.length > 11) throw new Error("Telefone inválido.");
    const zipCode = onlyDigits(data.zipCode);
    if (zipCode.length !== 8) throw new Error("CEP inválido.");
    const street = trim(data.street, 120);
    if (!street) throw new Error("Informe a rua.");
    const streetNumber = trim(data.streetNumber, 12);
    if (!streetNumber) throw new Error("Informe o número.");
    const neighborhood = trim(data.neighborhood, 80);
    if (!neighborhood) throw new Error("Informe o bairro.");
    const city = trim(data.city, 80);
    if (!city) throw new Error("Informe a cidade.");
    const state = trim(data.state, 2).toUpperCase();
    if (!UFS.has(state)) throw new Error("UF inválida.");

    return {
      productSlug: data.productSlug,
      size: String(data.size),
      quantity,
      name,
      email,
      document,
      phone,
      zipCode,
      street,
      streetNumber,
      complement: trim(data.complement, 80),
      neighborhood,
      city,
      state,
    };
  })
  .handler(async ({ data }) => {
    const product = SCHUTZ_CATALOG[data.productSlug];
    const amount = product.unitPriceCents * data.quantity + SHIPPING_FEE_CENTS;

    let clientIp: string | undefined;
    let postbackUrl: string | undefined;
    try {
      clientIp =
        getRequestHeader("cf-connecting-ip") ||
        getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
        undefined;
      postbackUrl = `${new URL(getRequest().url).origin}/api/public/webhooks/hypercash`;
    } catch {
      // fora de um contexto de request (tooling local)
    }

    const orderRef = `schutz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const payload = {
      amount,
      paymentMethod: "PIX",
      customer: {
        name: data.name,
        email: data.email,
        document: { number: data.document, type: "CPF" },
        phone: data.phone,
        externaRef: `cliente-${data.document.slice(0, 3)}${data.document.slice(-2)}`,
      },
      shipping: {
        fee: SHIPPING_FEE_CENTS,
        address: {
          street: data.street,
          streetNumber: data.streetNumber,
          complement: data.complement || "",
          zipCode: data.zipCode,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          country: "br",
        },
      },
      items: [
        {
          title: `${product.title} — Tam. ${data.size}`,
          unitPrice: product.unitPriceCents,
          quantity: data.quantity,
          tangible: true,
          externalRef: `${product.externalRef}-${data.size}`,
        },
      ],
      traceable: true,
      ip: clientIp,
      postbackUrl,
      metadata: { pedido_ref: orderRef, produto: data.productSlug, tamanho: data.size },
      pix: { expiresInDays: 1 },
    };

    const body = await hcFetch("/api/user/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const tx = body?.data ?? body;
    const pix = tx?.pix ?? null;
    const transactionId = tx?.id ?? tx?.transactionId ?? null;
    const pixCode = pix?.qrcode ?? null;

    if (!transactionId || !pixCode) {
      console.error("[schutz-pix] resposta sem código PIX", {
        transactionId,
        at: new Date().toISOString(),
      });
      throw new Error("Não foi possível gerar o PIX agora. Tente novamente em instantes.");
    }

    return {
      success: true as const,
      orderRef,
      transactionId: String(transactionId),
      status: normalizeStatus(tx?.status),
      amountCents: amount,
      pixCode: String(pixCode),
      expirationDate: (pix?.expirationDate as string | undefined) ?? null,
      productTitle: product.title,
      size: data.size,
      quantity: data.quantity,
    };
  });

export const getSchutzOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { transactionId: string }) => {
    const id = trim(data?.transactionId, 64);
    if (!id) throw new Error("Transação inválida.");
    return { transactionId: id };
  })
  .handler(async ({ data }) => {
    const body = await hcFetch(`/api/user/transactions/${encodeURIComponent(data.transactionId)}`);
    const tx = body?.data ?? body;
    return {
      transactionId: String(tx?.id ?? data.transactionId),
      status: normalizeStatus(tx?.status),
    };
  });
