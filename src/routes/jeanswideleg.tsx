import { createFileRoute } from "@tanstack/react-router";
import { MercadoPromoPage } from "./mercadopromo";

const TITLE = "Mercado Livre";
const PRODUCT_TITLE = "Calça Jeans Wide Leg Feminina – Cintura Alta";
const DESCRIPTION =
  "Calça Jeans Wide Leg Feminina Cintura Alta. Caimento moderno, pernas amplas, disponível em lavagem clara e escura. Frete grátis e devolução garantida.";
const OG_IMAGE = "/src/assets/mercadopromo/wideleg-clara-1.png";

export const Route = createFileRoute("/jeanswideleg")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:title", content: PRODUCT_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "product:price:amount", content: "79.90" },
      { property: "product:price:currency", content: "BRL" },
      { property: "product:brand", content: "Mercado Livre" },
      { property: "product:availability", content: "in stock" },
      { property: "product:condition", content: "new" },
      { property: "product:retailer_item_id", content: "mercadopromo-jeans-wide-leg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PRODUCT_TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: JeansWideLegPage,
});

function JeansWideLegPage() {
  return <MercadoPromoPage forcedSlug="jeanswideleg" />;
}
