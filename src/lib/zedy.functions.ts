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
  "mercadopromo-kit-panos": 250397229,
  "nb-9060-branco": 250703130,
  "nb-9060-preto": 250703640,
};

function envValue(name: string): string | undefined {
  const nodeValue = process.env[name];
  if (nodeValue) return nodeValue;

  const cloudflareEnv = (globalThis as typeof globalThis & {
    __env__?: Record<string, string | undefined>;
  }).__env__;

  return cloudflareEnv?.[name];
}

function variantIdFor(slug: string): number {
  const variantId = VARIANT_IDS[slug];
  if (!variantId) throw new Error(`Produto sem variantId Zedy configurado: ${slug}`);
  return variantId;
}

export type ZedyCheckoutItem = {
  slug?: string;
  variantId?: string | number;
  quantity: number;
};

export type ZedyImage = {
  id?: string;
  url?: string;
  altText?: string | null;
  width?: number;
  height?: number;
  position?: number;
};

export type ZedyVariant = {
  id: string;
  title?: string | null;
  sku?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  inventoryQuantity?: number | null;
  availableForSale?: boolean;
  selectedOptions?: { name: string; value: string }[];
  image?: ZedyImage | null;
};

export type ZedyProduct = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  descriptionHtml?: string | null;
  vendor?: string | null;
  status?: string;
  price?: number | null;
  compareAtPrice?: number | null;
  currency?: string | null;
  images?: ZedyImage[];
  featuredImage?: ZedyImage | null;
  variants?: ZedyVariant[];
  totalInventory?: number | null;
  trackInventory?: boolean;
  seo?: { title?: string | null; description?: string | null } | null;
};

export type ZedyPagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type ZedyProductsPayload = {
  products: ZedyProduct[];
  pagination?: ZedyPagination;
  query?: string;
};

async function zFetch(path: string, init: RequestInit) {
  const token = envValue("ZEDY_API_TOKEN");
  const storeId = envValue("ZEDY_STORE_ID") || DEFAULT_STORE_ID;
  const baseUrl =
    envValue("ZEDY_BASE_URL") || "https://app.zedy.com.br/api/loja/v1";
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
      if (!it.slug && !it.variantId) throw new Error("Item sem produto.");
      if (!it.quantity || it.quantity < 1)
        throw new Error("Quantidade inválida.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const payload = {
      items: data.items.map((i) => ({
        variantId: i.variantId ?? variantIdFor(i.slug!),
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

export const listZedyProducts = createServerFn({ method: "GET" })
  .inputValidator(
    (data: {
      q?: string;
      page?: number;
      perPage?: number;
      sortBy?: "created_at" | "title" | "price";
      sortOrder?: "asc" | "desc";
    }) => ({
      q: typeof data?.q === "string" ? data.q.trim() : "",
      page: Number.isFinite(data?.page) && data.page! > 0 ? Math.floor(data.page!) : 1,
      perPage:
        Number.isFinite(data?.perPage) && data.perPage! > 0
          ? Math.min(Math.floor(data.perPage!), 50)
          : 24,
      sortBy: data?.sortBy ?? "created_at",
      sortOrder: data?.sortOrder ?? "desc",
    }),
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams({
      page: String(data.page),
      per_page: String(data.perPage),
    });

    if (data.q) {
      params.set("q", data.q);
      return (await zFetch(`/search?${params.toString()}`, {
        method: "GET",
      })) as ZedyProductsPayload;
    }

    params.set("sort_by", data.sortBy);
    params.set("sort_order", data.sortOrder);
    return (await zFetch(`/products?${params.toString()}`, {
      method: "GET",
    })) as ZedyProductsPayload;
  });
