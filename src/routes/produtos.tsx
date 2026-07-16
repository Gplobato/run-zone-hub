import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, ShoppingCart } from "lucide-react";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { fbqTrack } from "@/lib/pixel";
import {
  createZedyCheckout,
  listZedyProducts,
  type ZedyPagination,
  type ZedyProduct,
  type ZedyVariant,
} from "@/lib/zedy.functions";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().optional(),
  sort: z.enum(["created-desc", "price-asc", "price-desc", "title-asc"]).optional(),
  page: z.coerce.number().optional(),
});

const sortMap = {
  "created-desc": { sortBy: "created_at", sortOrder: "desc", label: "Mais recentes" },
  "price-asc": { sortBy: "price", sortOrder: "asc", label: "Menor preco" },
  "price-desc": { sortBy: "price", sortOrder: "desc", label: "Maior preco" },
  "title-asc": { sortBy: "title", sortOrder: "asc", label: "A-Z" },
} as const;

export const Route = createFileRoute("/produtos")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Produtos Mercado Livre" },
      { name: "description", content: "Catalogo de produtos carregado direto da Zedy." },
      { property: "og:title", content: "Produtos Mercado Livre" },
      { property: "og:description", content: "Produtos, variantes e checkout direto pela Zedy." },
    ],
  }),
  component: ZedyProductsPage,
});

function formatZedyPrice(value?: number | null, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(Number(value ?? 0));
}

function textFromHtml(html?: string | null) {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function variantLabel(variant: ZedyVariant) {
  const options = variant.selectedOptions
    ?.map((o) => [o.name, o.value].filter(Boolean).join(": "))
    .filter(Boolean);
  return options?.length ? options.join(" / ") : variant.title || "Padrao";
}

function ZedyProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetchProducts = useServerFn(listZedyProducts);
  const [products, setProducts] = useState<ZedyProduct[]>([]);
  const [pagination, setPagination] = useState<ZedyPagination | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sortKey = search.sort ?? "created-desc";
  const page = search.page && search.page > 0 ? search.page : 1;

  useEffect(() => {
    let active = true;
    const sort = sortMap[sortKey];
    setIsLoading(true);
    setError(null);

    void fetchProducts({
      data: {
        q: search.q,
        page,
        perPage: 24,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      },
    })
      .then((payload) => {
        if (!active) return;
        setProducts(payload.products ?? []);
        setPagination(payload.pagination);
      })
      .catch((err) => {
        if (!active) return;
        setProducts([]);
        setPagination(undefined);
        setError(err instanceof Error ? err.message : "Falha ao carregar produtos da Zedy.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchProducts, page, search.q, sortKey]);

  const totalText = useMemo(() => {
    if (!pagination) return `${products.length} produtos`;
    return `${pagination.total} produtos`;
  }, [pagination, products.length]);

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-3 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
          / Zedy catalog
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-5xl tracking-wide md:text-6xl">
              {search.q ? `Busca: "${search.q}"` : "Produtos"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Catalogo carregado direto da Zedy. Cada card usa a variante real do produto para
              criar o checkout.
            </p>
          </div>
          <div className="rounded-md border border-[color:var(--graphite)]/10 bg-card px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {isLoading ? "Sincronizando..." : totalText}
          </div>
        </div>

        <div className="mt-8 grid gap-3 border-y border-[color:var(--graphite)]/10 py-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <form
            className="flex min-w-0 items-center gap-2 rounded-md border border-[color:var(--graphite)]/15 bg-card px-3"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const q = String(form.get("q") ?? "").trim() || undefined;
              navigate({ search: (s) => ({ ...s, q, page: 1 }) });
            }}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              name="q"
              defaultValue={search.q ?? ""}
              placeholder="Buscar no catalogo Zedy"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--terracotta)]">
              Buscar
            </button>
          </form>
          <select
            value={sortKey}
            onChange={(e) =>
              navigate({
                search: (s) => ({
                  ...s,
                  sort: e.target.value as keyof typeof sortMap,
                  page: 1,
                }),
              })
            }
            className="h-11 rounded-md border border-[color:var(--graphite)]/15 bg-card px-3 font-mono text-[11px] uppercase tracking-wider outline-none"
          >
            {Object.entries(sortMap).map(([key, sort]) => (
              <option key={key} value={key}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[color:var(--terracotta)]" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              Nenhum produto retornado pela Zedy.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ZedyProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-widest">
            <button
              disabled={page <= 1}
              onClick={() => navigate({ search: (s) => ({ ...s, page: page - 1 }) })}
              className="rounded-sm border border-[color:var(--graphite)]/20 px-3 py-2 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-muted-foreground">
              {page} / {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => navigate({ search: (s) => ({ ...s, page: page + 1 }) })}
              className="rounded-sm border border-[color:var(--graphite)]/20 px-3 py-2 disabled:opacity-40"
            >
              Proxima
            </button>
          </div>
        ) : null}
      </div>
    </StoreLayout>
  );
}

function ZedyProductCard({ product }: { product: ZedyProduct }) {
  const createCheckout = useServerFn(createZedyCheckout);
  const variants = product.variants ?? [];
  const availableVariants = variants.filter((v) => v.availableForSale !== false);
  const initialVariant = availableVariants[0] ?? variants[0];
  const [variantId, setVariantId] = useState(initialVariant?.id ?? "");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedVariant = variants.find((v) => v.id === variantId) ?? initialVariant;
  const image = selectedVariant?.image?.url || product.featuredImage?.url || product.images?.[0]?.url;
  const price = selectedVariant?.price ?? product.price ?? 0;
  const compareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const description = product.description || textFromHtml(product.descriptionHtml);
  const currency = product.currency || "BRL";

  useEffect(() => {
    setVariantId(initialVariant?.id ?? "");
    setError(null);
  }, [initialVariant?.id, product.id]);

  async function buyNow() {
    if (!selectedVariant || isCheckingOut) return;
    setIsCheckingOut(true);
    setError(null);
    fbqTrack("AddToCart", {
      content_ids: [product.id],
      content_name: product.title,
      value: Number(price),
      currency,
    });
    fbqTrack("InitiateCheckout", {
      content_ids: [product.id],
      content_name: product.title,
      value: Number(price),
      currency,
      contents: [{ id: selectedVariant.id, quantity: 1 }],
      num_items: 1,
    });

    try {
      const { url } = await createCheckout({
        data: { items: [{ variantId: selectedVariant.id, quantity: 1 }] },
      });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao abrir checkout Zedy.");
      setIsCheckingOut(false);
    }
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-[color:var(--sage)]">
      <div className="relative aspect-[4/5] bg-[color:var(--bone)]">
        {image ? (
          <img
            src={image}
            alt={product.featuredImage?.altText || product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Sem imagem
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-sm bg-[color:var(--graphite)]/75 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[color:var(--bone)]">
          Zedy
        </div>
        {product.status ? (
          <div className="absolute right-3 top-3 rounded-sm bg-white/90 px-2 py-1 font-mono text-[10px] uppercase tracking-wider">
            {product.status}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <h2 className="font-display text-2xl leading-tight tracking-wide">
            {product.title.toUpperCase()}
          </h2>
          {description ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Variante Zedy
          </div>
          {variants.length > 1 ? (
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="h-10 w-full rounded-sm border border-[color:var(--graphite)]/15 bg-transparent px-3 text-sm outline-none"
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id} disabled={variant.availableForSale === false}>
                  {variantLabel(variant)} - ID {variant.id}
                </option>
              ))}
            </select>
          ) : selectedVariant ? (
            <div className="rounded-sm border border-[color:var(--graphite)]/15 px-3 py-2 text-sm">
              {variantLabel(selectedVariant)} - ID {selectedVariant.id}
            </div>
          ) : (
            <div className="rounded-sm border border-[color:var(--graphite)]/15 px-3 py-2 text-sm text-muted-foreground">
              Sem variante disponivel
            </div>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            {compareAt ? (
              <div className="font-mono text-xs text-muted-foreground line-through">
                {formatZedyPrice(compareAt, currency)}
              </div>
            ) : null}
            <div className="font-mono text-xl font-semibold text-[color:var(--terracotta)]">
              {formatZedyPrice(price, currency)}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              Estoque: {product.totalInventory ?? selectedVariant?.inventoryQuantity ?? "Zedy"}
            </div>
          </div>
          <button
            type="button"
            disabled={!selectedVariant || selectedVariant.availableForSale === false || isCheckingOut}
            onClick={buyNow}
            className="inline-flex h-11 items-center gap-2 rounded-sm bg-[color:var(--graphite)] px-4 font-mono text-[11px] uppercase tracking-widest text-[color:var(--bone)] transition-colors hover:bg-[color:var(--terracotta)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCheckingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            Comprar
          </button>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </article>
  );
}
