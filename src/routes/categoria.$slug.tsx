import { createFileRoute, notFound } from "@tanstack/react-router";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductCard } from "@/components/paze/ProductCard";
import { CATEGORIES, productsByCategory, type ProductCategory } from "@/lib/products";

export const Route = createFileRoute("/categoria/$slug")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.cat.label ?? "Categoria"} — Paze` },
      {
        name: "description",
        content: loaderData?.cat.description ?? "Categoria Paze.",
      },
      { property: "og:title", content: `${loaderData?.cat.label} — Paze` },
      { property: "og:description", content: loaderData?.cat.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <StoreLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center md:px-8">
        <h1 className="font-display text-5xl">Categoria não encontrada</h1>
      </div>
    </StoreLayout>
  ),
  errorComponent: ({ reset }) => (
    <StoreLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center md:px-8">
        <h1 className="font-display text-3xl">Algo deu errado</h1>
        <button onClick={reset} className="mt-4 font-mono text-xs uppercase text-[color:var(--terracotta)]">Tentar de novo</button>
      </div>
    </StoreLayout>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const products = productsByCategory(cat.slug as ProductCategory);

  return (
    <StoreLayout>
      <section className="border-b border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
            / Categoria
          </div>
          <h1 className="font-display text-5xl tracking-wide md:text-7xl">
            {cat.label}
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">{cat.description}</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {products.length === 0 ? (
          <p className="font-mono text-sm text-muted-foreground">
            Em breve novos produtos nesta categoria.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
