// ─── Zedy Checkout — server functions ───────────────────────────────────
// Docs: https://app.zedy.com.br/docs#post-create-checkout
// Auth: Bearer <ZEDY_API_TOKEN> + header X-Store-Id: <ZEDY_STORE_ID>
// Fluxo: cria checkout via POST /cart/create-checkout e devolve a URL de
// redirecionamento hospedada pela Zedy. Nunca expor o token pro browser.
// ─────────────────────────────────────────────────────────────────────────

import { createServerFn } from "@tanstack/react-start";

// Store usada pela vitrine Mercado Promo quando o ambiente não define ZEDY_STORE_ID.
const DEFAULT_STORE_ID = "33937";

// Mapeamento slug do catálogo local → variantId cadastrado na Zedy.
// Atualize aqui conforme cadastrar mais produtos no painel Zedy.
const VARIANT_IDS: Record<string, number> = {
  "fone-conducao-ossea": 247100935,
  "fita-anti-atrito": 247101041,
  "mercadopromo-jaqueta-courino": 248867337,
  "mercadopromo-bota-montaria": 248867624,
};

function variantIdFor(slug: string): number {
  const variantId = VARIANT_IDS[slug];
  if (!variantId) throw new Error(`Produto sem variantId Zedy configurado: ${slug}`);
  return variantId;
}

export type ZedyCheckoutItem = {
  slug: string;
  quantity: number;
};

async function zFetch(path: string, init: RequestInit) {
  const token = process.env.ZEDY_API_TOKEN;
  const storeId = process.env.ZEDY_STORE_ID || DEFAULT_STORE_ID;
  const baseUrl =
    process.env.ZEDY_BASE_URL || "https://app.zedy.com.br/api/loja/v1";
  if (!token) throw new Error("ZEDY_API_TOKEN não configurado");
  if (!storeId) throw new Error("ZEDY_STORE_ID não configurado");

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Store-Id": storeId,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg =
      body?.message || body?.error || `Zedy ${res.status}: falha na requisição`;
    throw new Error(msg);
  }
  return body;
}

// ─── Create checkout ────────────────────────────────────────────────────
export const createZedyCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: { items: ZedyCheckoutItem[] }) => {
    if (!data?.items?.length) throw new Error("Carrinho vazio.");
    for (const it of data.items) {
      if (!it.slug) throw new Error("Item sem slug.");
      if (!it.quantity || it.quantity < 1)
        throw new Error("Quantidade inválida.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const payload = {
      items: data.items.map((i) => ({
        variantId: variantIdFor(i.slug),
        quantity: i.quantity,
      })),
    };

    const body = await zFetch("/cart/create-checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const url: string | null =
      body?.checkoutUrl || body?.checkout_direct_url || null;
    if (!url) throw new Error("Zedy não retornou URL de checkout.");

    return { url };
  });
