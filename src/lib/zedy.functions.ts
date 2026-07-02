// Zedy checkout integration.
// Server function: builds the cart payload, calls Zedy's /cart/create-checkout
// and returns the URL the storefront should redirect the buyer to.
// Docs: https://app.zedy.com.br/docs
//
// Mapping slug → Zedy variantId. Update as you cadastrar produtos na Zedy.
// Slugs that are not mapped here will fail fast with a clear error before
// hitting the API.

import { createServerFn } from "@tanstack/react-start";

// Public map so the client can disable checkout for unmapped items.
export const ZEDY_VARIANT_IDS: Record<string, number> = {
  "fone-conducao-ossea": 247100935,
  "fita-anti-atrito": 247101041,
  // TODO — cadastrar na Zedy e preencher:
  // "bracadeira-led": 0,
  // "colete-refletivo": 0,
  // "case-braçadeira": 0,
  // "cinto-corrida": 0,
  // "kit-seguranca-urbana": 0,
};

export type ZedyCheckoutItem = { slug: string; quantity: number };

export const createZedyCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: { items: ZedyCheckoutItem[] }) => {
    if (!Array.isArray(data?.items) || data.items.length === 0) {
      throw new Error("Carrinho vazio.");
    }
    for (const it of data.items) {
      if (!it.slug || typeof it.quantity !== "number" || it.quantity < 1) {
        throw new Error("Item inválido no carrinho.");
      }
    }
    return data;
  })
  .handler(async ({ data }) => {
    const token = process.env.ZEDY_API_TOKEN;
    const storeId = process.env.ZEDY_STORE_ID;
    if (!token || !storeId) {
      throw new Error("Integração Zedy não configurada.");
    }

    const items = data.items.map((it) => {
      const variantId = ZEDY_VARIANT_IDS[it.slug];
      if (!variantId) {
        throw new Error(
          `Produto "${it.slug}" ainda não está cadastrado na Zedy. Cadastre-o e adicione o variantId em src/lib/zedy.functions.ts.`,
        );
      }
      return { variantId, quantity: it.quantity };
    });

    const res = await fetch(
      "https://app.zedy.com.br/api/loja/v1/cart/create-checkout",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Store-Id": storeId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      },
    );

    const body = (await res.json().catch(() => null)) as
      | {
          active?: boolean;
          skip_cart?: boolean;
          checkout_direct_url?: string | null;
          checkoutUrl?: string | null;
          message?: string;
        }
      | null;

    if (!res.ok || !body) {
      throw new Error(
        body?.message ?? `Falha ao criar checkout na Zedy (HTTP ${res.status}).`,
      );
    }

    const url = body.checkout_direct_url || body.checkoutUrl;
    if (!url) throw new Error(body.message ?? "Zedy não retornou URL de checkout.");

    return { checkoutUrl: url };
  });
