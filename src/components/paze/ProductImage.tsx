import type { Product } from "@/lib/products";
import { PRODUCT_IMAGES } from "@/lib/products";

export function ProductImage({
  product,
  className = "",
  eager = false,
  fit = "cover",
}: {
  product: Product;
  className?: string;
  eager?: boolean;
  fit?: "cover" | "contain";
}) {
  const src = PRODUCT_IMAGES[product.slug];
  if (src) {
    return (
      <img
        src={src}
        alt={product.name}
        loading={eager ? "eager" : "lazy"}
        className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
        draggable={false}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-[color:var(--bone)] font-mono text-xs uppercase tracking-widest text-[color:var(--graphite)]/50 ${className}`}
    >
      {product.shortName}
    </div>
  );
}
