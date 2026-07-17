import { createFileRoute } from "@tanstack/react-router";
import { MercadoPromoPage } from "./mercadopromo";

const TITLE = "Mercado Livre";
const PRODUCT_TITLE = "Jaqueta Bobojaco Impermeavel Unissex";
const DESCRIPTION =
  "Jaqueta bobojaco impermeavel unissex com capuz, forro quente e compra segura pelo Mercado Livre.";
const OG_IMAGE =
  "https://http2.mlstatic.com/D_NQ_NP_2X_689424-MLB110989110035_052026-F.webp";

export const Route = createFileRoute("/bobojaco")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:title", content: PRODUCT_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "product:price:amount", content: "58.00" },
      { property: "product:price:currency", content: "BRL" },
      { property: "product:brand", content: "Mercado Livre" },
      { property: "product:availability", content: "in stock" },
      { property: "product:condition", content: "new" },
      { property: "product:retailer_item_id", content: "mercadopromo-jaqueta-bobojaco-puffer" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PRODUCT_TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: BobojacoPage,
});

function BobojacoPage() {
  return <MercadoPromoPage forcedSlug="bobojaco" />;
}
