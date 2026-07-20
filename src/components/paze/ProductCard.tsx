import { formatBRL, type Product } from "@/lib/products";
import { ProductImage } from "./ProductImage";
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const productHref = product.slug === "nb-9060" ? "/nb-9060" : `/produto/${product.slug}`;
  const isDirectProduct = product.slug === "nb-9060";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-[color:var(--sage)]">
      <a
        href={productHref}
        className="relative block aspect-square overflow-hidden bg-[color:var(--bone)]"
      >
        <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
          <ProductImage
            product={product}
            fit="contain"
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-sm bg-[color:var(--terracotta)] px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[color:var(--bone)]">
            {product.badge}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-sm bg-[color:var(--graphite)]/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[color:var(--bone)]">
          {product.categoryLabel}
        </span>
      </a>
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div>
          <a href={productHref}>
            <h3 className="font-display text-2xl leading-tight tracking-wide">
              {product.shortName.toUpperCase()}
            </h3>
          </a>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.tagline}
          </p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            {product.compareAtCents && (
              <div className="font-mono text-xs text-muted-foreground line-through">
                {formatBRL(product.compareAtCents)}
              </div>
            )}
            <div className="font-mono text-lg font-medium text-[color:var(--terracotta)]">
              {formatBRL(product.priceCents)}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {product.installments.count}× {formatBRL(product.installments.valueCents)}
            </div>
          </div>
          <button
            aria-label={`Adicionar ${product.name} ao carrinho`}
            onClick={(e) => {
              e.preventDefault();
              if (isDirectProduct) {
                window.location.href = productHref;
                return;
              }
              addItem(product.slug, 1);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-[color:var(--graphite)] text-[color:var(--bone)] transition-colors hover:bg-[color:var(--terracotta)]"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
