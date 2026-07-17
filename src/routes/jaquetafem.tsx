import { createFileRoute } from "@tanstack/react-router";
import { MercadoPromoPage } from "./mercadopromo";

const TITLE = "Mercado Livre";
const PRODUCT_TITLE = "Jaqueta Feminina Courino Slim";
const DESCRIPTION =
  "Jaqueta feminina slim em courino com ziper estilo motoqueiro. Compra segura, frete gratis, 6x sem juros e devolucao gratis em ate 30 dias.";
const OG_IMAGE =
  "https://http2.mlstatic.com/D_NQ_NP_2X_810204-MLB110339498152_052026-F.webp";

export const Route = createFileRoute("/jaquetafem")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:title", content: PRODUCT_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "product:price:amount", content: "69.90" },
      { property: "product:price:currency", content: "BRL" },
      { property: "product:brand", content: "Mercado Livre" },
      { property: "product:availability", content: "in stock" },
      { property: "product:condition", content: "new" },
      { property: "product:retailer_item_id", content: "mercadopromo-jaqueta-courino" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PRODUCT_TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: JaquetaFemPage,
});

function JaquetaFemPage() {
  return <MercadoPromoPage forcedSlug="jaquetafem" />;
}
