import kitPanosOg from "@/assets/mercadopromo/kitpanos-1.jpeg";
import { createFileRoute } from "@tanstack/react-router";
import { MercadoPromoPage } from "./mercadopromo";

const TITLE = "Mercado Livre";
const PRODUCT_TITLE =
  "Pano de Prato Atoalhado 70x50 cm em Algodão – Alta Absorção e Durabilidade";
const DESCRIPTION =
  "Kit 10x pano de prato atoalhado 70x50 cm em algodão, macio, resistente e com excelente poder de absorção.";

export const Route = createFileRoute("/kitpanos")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:title", content: PRODUCT_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: kitPanosOg },
      { property: "product:price:amount", content: "39.90" },
      { property: "product:price:currency", content: "BRL" },
      { property: "product:brand", content: "Mercado Livre" },
      { property: "product:availability", content: "in stock" },
      { property: "product:condition", content: "new" },
      { property: "product:retailer_item_id", content: "mercadopromo-kit-panos" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PRODUCT_TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: kitPanosOg },
    ],
  }),
  component: KitPanosPage,
});

function KitPanosPage() {
  return <MercadoPromoPage forcedSlug="kitpanos" />;
}
