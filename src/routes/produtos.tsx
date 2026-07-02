import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductCard } from "@/components/paze/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { useMemo, useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().optional(),
  cat: z.string().optional(),
  sort: z.enum(["relevance", "price-asc", "price-desc"]).optional(),
});

export const Route = createFileRoute("/produtos")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Todos os produtos — Paze" },
      { name: "description", content: "Catálogo completo Paze: fones, LEDs, coletes, cintos, kits." },
      { property: "og:title", content: "Todos os produtos — Paze" },
      { property: "og:description", content: "Catálogo completo de acessórios técnicos para corrida urbana." },
    ],
  }),
  component: AllProducts,
});

function AllProducts() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [sort, setSort] = useState(search.sort ?? "relevance");

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (search.cat) list = list.filter((p) => p.category === search.cat);
    if (sort === "price-asc") list.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === "price-desc") list.sort((a, b) => b.priceCents - a.priceCents);
    return list;
  }, [search.q, search.cat, sort]);

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
          / Loja
        </div>
        <h1 className="font-display text-5xl tracking-wide md:text-6xl">
          {search.q ? `Buscar: "${search.q}"` : "Todos os produtos"}
        </h1>

        <div className="mt-8 flex flex-wrap items-center gap-2 border-y border-[color:var(--graphite)]/10 py-4">
          <button
            onClick={() => navigate({ search: (s) => ({ ...s, cat: undefined }) })}
            className={`rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider ${
              !search.cat ? "bg-[color:var(--graphite)] text-[color:var(--bone)]" : "border border-[color:var(--graphite)]/20"
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => navigate({ search: (s) => ({ ...s, cat: c.slug }) })}
              className={`rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider ${
                search.cat === c.slug ? "bg-[color:var(--graphite)] text-[color:var(--bone)]" : "border border-[color:var(--graphite)]/20"
              }`}
            >
              {c.label}
            </button>
          ))}
          <div className="ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider outline-none"
            >
              <option value="relevance">Relevância</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              Nenhum produto encontrado.
            </p>
            <Link
              to="/produtos"
              className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-[color:var(--terracotta)]"
            >
              Ver catálogo completo
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
