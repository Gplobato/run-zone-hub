import type { Product } from "@/lib/products";

// Deterministic placeholder art for each product using brand tokens.
// Replace with real product photography by swapping this component.

const BG_MAP: Record<string, string> = {
  graphite: "#14171A",
  bone: "#F5F1E8",
  sage: "#8FA398",
  terracotta: "#C4441E",
};

export function ProductImage({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const bg = BG_MAP[product.hero.bg] ?? BG_MAP.bone;
  const accent = BG_MAP[product.hero.accent] ?? BG_MAP.sage;
  const isDark = product.hero.bg === "graphite";
  const fg = isDark ? "#F5F1E8" : "#14171A";

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label={product.name}
    >
      <rect width="400" height="400" fill={bg} />
      {/* diagonal grain lines */}
      <g stroke={fg} strokeOpacity={0.06}>
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={i} x1={-100 + i * 30} y1={0} x2={-100 + i * 30 + 400} y2={400} />
        ))}
      </g>
      {/* signature wave */}
      <path
        d="M 30 200 Q 100 140, 200 200 T 370 200"
        stroke={accent}
        strokeWidth={1.5}
        fill="none"
        strokeDasharray="4 4"
      />
      <path
        d="M 30 200 Q 100 260, 200 200 T 370 200"
        stroke={accent}
        strokeWidth={1.5}
        fill="none"
        strokeDasharray="4 4"
      />
      {/* product code */}
      <text
        x="30"
        y="360"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="11"
        fill={fg}
        fillOpacity={0.5}
      >
        PAZE / {product.slug.toUpperCase().slice(0, 14)}
      </text>
      <text
        x="30"
        y="60"
        fontFamily="'Bebas Neue', sans-serif"
        fontSize="34"
        fill={fg}
        letterSpacing="1"
      >
        {product.shortName.toUpperCase()}
      </text>
    </svg>
  );
}
