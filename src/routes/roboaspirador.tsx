import { createFileRoute } from "@tanstack/react-router";
import { MercadoPromoPage } from "./mercadopromo";

const TITLE = "Mercado Livre";
const PRODUCT_TITLE = "Robô Aspirador de Pó Inteligente Wi-Fi Varre, Aspira e Passa Pano Mop Automático";
const DESCRIPTION =
  "Robô Aspirador de Pó Inteligente Wi-Fi Varre, Aspira e Passa Pano com Sensor Anti-Queda e Mop Automático. Compra segura, frete grátis e devolução em até 30 dias.";
const OG_IMAGE =
  "/src/assets/mercadopromo/robo-aspirador-rb.webp";

export const Route = createFileRoute("/roboaspirador")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:title", content: PRODUCT_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "product:price:amount", content: "159.90" },
      { property: "product:price:currency", content: "BRL" },
      { property: "product:brand", content: "Mercado Livre" },
      { property: "product:availability", content: "in stock" },
      { property: "product:condition", content: "new" },
      { property: "product:retailer_item_id", content: "mercadopromo-robo-aspirador" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PRODUCT_TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: RoboAspiradorPage,
});

function RoboAspiradorPage() {
  return <MercadoPromoPage forcedSlug="roboaspirador" />;
}
