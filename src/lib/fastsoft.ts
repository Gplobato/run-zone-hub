/**
 * Helper do SDK oficial FastSoft/HyperCash (tokenização no navegador).
 * Nenhum dado sensível do cartão sai daqui: o SDK devolve apenas um token.
 */

export type ThreeDSResult = {
  status?: string;
  [key: string]: unknown;
};

export type FastSoftSdk = {
  setPublicKey: (key: string) => void | Promise<void>;
  encrypt: (card: {
    number: string;
    holderName: string;
    expMonth: string;
    expYear: string;
    cvv: string;
  }) => Promise<string>;
  isThreeDSEnabled?: () => boolean | Promise<boolean>;
  initializeThreeDS?: (input: unknown) => Promise<unknown>;
  authenticateThreeDS?: (input: unknown) => Promise<ThreeDSResult>;
  finalizeThreeDS?: () => Promise<unknown>;
};

declare global {
  interface Window {
    FastSoft?: FastSoftSdk;
  }
}

const SDK_URL = "https://js.fastsoftbrasil.com/security.js";
const SDK_TIMEOUT = 15000;

let sdkPromise: Promise<FastSoftSdk> | null = null;

export function getPublicKey(): string | undefined {
  const key = import.meta.env.VITE_HYPERCASH_PUBLIC_KEY as string | undefined;
  return key && key.trim() ? key.trim() : undefined;
}

/**
 * Carrega o SDK. A chave pública pode vir do env do build (VITE_) ou ser
 * entregue pelo servidor em runtime (secret HYPERCASH_PUBLIC_KEY).
 */
export function loadFastSoftSdk(publicKeyOverride?: string): Promise<FastSoftSdk> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<FastSoftSdk>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("SDK indisponível fora do navegador."));
      return;
    }

    const publicKey = (publicKeyOverride && publicKeyOverride.trim()) || getPublicKey();
    if (!publicKey) {
      reject(
        new Error(
          "Pagamento com cartão indisponível no momento. Use o PIX para finalizar.",
        ),
      );
      return;
    }

    const finish = async () => {
      const sdk = window.FastSoft;
      if (!sdk) {
        reject(
          new Error(
            "Não foi possível carregar o módulo seguro de pagamento. Atualize a página e tente novamente.",
          ),
        );
        return;
      }
      try {
        await sdk.setPublicKey(publicKey);
        resolve(sdk);
      } catch {
        reject(
          new Error(
            "Não foi possível carregar o módulo seguro de pagamento. Atualize a página e tente novamente.",
          ),
        );
      }
    };

    if (window.FastSoft) {
      void finish();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_URL}"]`,
    );
    const script = existing ?? document.createElement("script");
    const timer = setTimeout(() => {
      reject(
        new Error(
          "Não foi possível carregar o módulo seguro de pagamento. Atualize a página e tente novamente.",
        ),
      );
    }, SDK_TIMEOUT);

    script.addEventListener("load", () => {
      clearTimeout(timer);
      void finish();
    });
    script.addEventListener("error", () => {
      clearTimeout(timer);
      reject(
        new Error(
          "Não foi possível carregar o módulo seguro de pagamento. Atualize a página e tente novamente.",
        ),
      );
    });

    if (!existing) {
      script.src = SDK_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  }).catch((err) => {
    sdkPromise = null;
    throw err;
  });

  return sdkPromise;
}

export const onlyDigits = (v: string) => (v || "").replace(/\D+/g, "");

export function luhn(number: string) {
  let sum = 0;
  let alt = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let n = Number(number[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return number.length > 0 && sum % 10 === 0;
}

export function normalizeFourDigitYear(year: string) {
  const digits = onlyDigits(year);
  if (digits.length === 4) return digits;
  if (digits.length === 2) return `20${digits}`;
  return digits;
}

export function maskCardNumber(v: string) {
  return onlyDigits(v)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function maskExpiry(v: string) {
  const d = onlyDigits(v).slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

/** Validação apenas de UX — a decisão final é sempre da HyperCash. */
export function validateCard(input: {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
}): string | null {
  const number = onlyDigits(input.number);
  if (number.length < 13 || number.length > 19) return "Número do cartão inválido.";
  if (!luhn(number)) return "Número do cartão inválido.";
  if (input.holderName.trim().split(/\s+/).filter(Boolean).length < 2)
    return "Informe o nome impresso no cartão (nome e sobrenome).";

  const exp = onlyDigits(input.expiry);
  if (exp.length !== 4) return "Validade inválida (MM/AA).";
  const month = Number(exp.slice(0, 2));
  if (month < 1 || month > 12) return "Mês de validade inválido.";
  const year = Number(normalizeFourDigitYear(exp.slice(2)));
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
    return "Cartão expirado.";

  const cvv = onlyDigits(input.cvv);
  if (cvv.length < 3 || cvv.length > 4) return "CVV inválido.";
  return null;
}
