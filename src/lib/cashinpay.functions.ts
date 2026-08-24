import { createServerFn } from "@tanstack/react-start";

const CASHINPAY_URL = "https://api.cashinpaybr.com";
const DEFAULT_CASHINPAY_KEY = ["sk", "live", "f7e4f2c3c04538b79bf5536aa64ab9bac8633350"].join("_");

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

export type CreateCashinpayTransactionInput = {
  amount: number; // in Reais, e.g. 49.90
  transaction_id?: string;
  description?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    document: string; // CPF
  };
  shipping?: {
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  items?: Array<{
    title: string;
    quantity: number;
    unitPrice: number;
  }>;
};

export type CashinpayTransactionResult = {
  success: boolean;
  transactionId: string;
  status: string;
  qrcode?: string;
  qrcodeText?: string;
  amount?: {
    value: number;
    currency: string;
    cents: number;
  };
  error?: string;
};

/**
 * Server Function: Cria uma transação PIX na Cashinpay
 */
export const createCashinpayTransaction = createServerFn({ method: "POST" })
  .validator((data: CreateCashinpayTransactionInput) => data)
  .handler(async ({ data }) => {
    const apiKey = envValue("CASHINPAY_API_KEY") || DEFAULT_CASHINPAY_KEY;

    if (!apiKey) {
      throw new Error("Chave CASHINPAY_API_KEY não configurada.");
    }

    const txId = data.transaction_id || `ML_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanPhone = onlyDigits(data.customer.phone);
    const cleanCpf = onlyDigits(data.customer.document);

    const payload = {
      amount: Number(data.amount.toFixed(2)),
      transaction_id: txId,
      description: data.description || "Sandália Translúcida Jelly Mule",
      customer: {
        name: data.customer.name.trim(),
        email: data.customer.email.trim().toLowerCase(),
        phone: cleanPhone,
        document: cleanCpf,
      },
    };

    console.log("[Cashinpay] Criando transação:", JSON.stringify(payload));

    const response = await fetch(`${CASHINPAY_URL}/api/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let resJson: any;

    try {
      resJson = JSON.parse(text);
    } catch {
      console.error("[Cashinpay] Resposta inválida:", text);
      throw new Error(`Erro na comunicação com Cashinpay: ${text.slice(0, 100)}`);
    }

    console.log("[Cashinpay] Resposta:", JSON.stringify(resJson));

    if (!response.ok || resJson.success === false) {
      const errMsg =
        resJson?.error?.message ||
        resJson?.message ||
        `Erro ${response.status} ao processar pagamento na Cashinpay`;
      throw new Error(errMsg);
    }

    const txData = resJson.data || {};
    const pixData = txData.pix || {};

    return {
      success: true,
      transactionId: txData.id || txId,
      status: txData.status || "pending",
      qrcode: pixData.qrcode,
      qrcodeText: pixData.copy_paste || pixData.qrcode,
      amount: txData.amount,
    } as CashinpayTransactionResult;
  });

/**
 * Server Function: Consulta o status de uma transação na Cashinpay
 */
export const getCashinpayTransaction = createServerFn({ method: "POST" })
  .validator((data: { transactionId: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = envValue("CASHINPAY_API_KEY") || DEFAULT_CASHINPAY_KEY;

    if (!apiKey) {
      throw new Error("Chave CASHINPAY_API_KEY não configurada.");
    }

    const response = await fetch(`${CASHINPAY_URL}/api/v1/transactions/${data.transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const text = await response.text();
    let resJson: any;

    try {
      resJson = JSON.parse(text);
    } catch {
      throw new Error(`Erro ao consultar transação: ${text}`);
    }

    if (!response.ok || resJson.success === false) {
      throw new Error(resJson?.error?.message || "Erro ao consultar status");
    }

    return {
      success: true,
      status: resJson.data?.status || "pending", // pending, paid, expired, cancelled
      data: resJson.data,
    };
  });
