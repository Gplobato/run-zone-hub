import { createServerFn } from "@tanstack/react-start";

type Item = { variantId: number; quantity: number };

export const createZedyCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: { items: Item[] }) => {
    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Carrinho vazio.");
    }
    for (const it of data.items) {
      if (!Number.isFinite(it.variantId) || !Number.isFinite(it.quantity) || it.quantity < 1) {
        throw new Error("Item inválido.");
      }
    }
    return data;
  })
  .handler(async ({ data }) => {
    const token = process.env.ZEDY_API_TOKEN;
    const storeId = process.env.ZEDY_STORE_ID;
    const baseUrl = process.env.ZEDY_BASE_URL || "https://app.zedy.com.br/api/loja/v1";

    if (!token || !storeId) {
      throw new Error("Integração Zedy não configurada.");
    }

    const res = await fetch(`${baseUrl}/cart/create-checkout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Store-Id": storeId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ items: data.items }),
    });

    const text = await res.text();
    let payload: Record<string, unknown> = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = {};
    }

    if (!res.ok) {
      const msg = (payload as { message?: string }).message || `Falha (${res.status}) ao criar checkout.`;
      throw new Error(msg);
    }

    const url =
      (payload.checkoutUrl as string | undefined) ||
      (payload.checkout_direct_url as string | undefined) ||
      (payload.checkoutDirectUrl as string | undefined);

    if (!url) throw new Error("Checkout indisponível no momento.");

    return { url };
  });
