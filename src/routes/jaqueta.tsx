import { createFileRoute } from "@tanstack/react-router";
import { MercadoPromoPage } from "./mercadopromo";

const TITLE = "Jaqueta Feminina Slim Courino — Mercado Livre";
const DESCRIPTION =
  "Jaqueta feminina slim em courino com zíper estilo motoqueiro. Frete grátis, 6x sem juros e devolução grátis em até 30 dias.";
const OG_IMAGE =
  "https://run-zone-hub.lovable.app/og/jaqueta-courino.jpg";

export const Route = createFileRoute("/jaqueta")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:image", content: OG_IMAGE },
      { property: "product:price:amount", content: "58.00" },
      { property: "product:price:currency", content: "BRL" },
      { property: "product:brand", content: "Mercado Livre" },
      { property: "product:availability", content: "in stock" },
      { property: "product:condition", content: "new" },
      { property: "product:retailer_item_id", content: "mercadopromo-jaqueta-courino" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: JaquetaPage,
});

function JaquetaPage() {
  return <MercadoPromoPage forcedSlug="jaquetafem" />;
}
