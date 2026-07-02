import type { Product } from "@/lib/products";
import { PRODUCT_IMAGES } from "@/lib/products";

export function ProductImage({
  product,
  className = "",
  eager = false,
}: {
  product: Product;
  className?: string;
  eager?: boolean;
}) {
  const src = PRODUCT_IMAGES[product.slug];
  if (src) {
    return (
      <img
        src={src}
        alt={product.name}
        loading={eager ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${className}`}
        draggable={false}
      />
    );
  }
  // Fallback (should not happen — every product has an image mapped).
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-[color:var(--bone)] font-mono text-xs uppercase tracking-widest text-[color:var(--graphite)]/50 ${className}`}
    >
      {product.shortName}
    </div>
  );
}
