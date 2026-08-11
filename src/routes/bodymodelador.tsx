import { createFileRoute } from "@tanstack/react-router";
import { MercadoPromoPage } from "./mercadopromo";

const TITLE = "Mercado Livre";
const PRODUCT_TITLE = "Body Modelador Feminino Alta Compressão — Pague 1 e Leve 2";
const DESCRIPTION =
  "Body Modelador Feminino Alta Compressão Pague 1 e Leve 2. Modela a cintura, alinha o abdômen e valoriza as curvas. Compra segura e frete grátis.";
const OG_IMAGE =
  "/src/assets/mercadopromo/bodymodelador-1.png";

export const Route = createFileRoute("/bodymodelador")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:title", content: PRODUCT_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "product:price:amount", content: "59.90" },
      { property: "product:price:currency", content: "BRL" },
      { property: "product:brand", content: "Mercado Livre" },
      { property: "product:availability", content: "in stock" },
      { property: "product:condition", content: "new" },
      { property: "product:retailer_item_id", content: "mercadopromo-body-modelador" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PRODUCT_TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: BodyModeladorPage,
});

function BodyModeladorPage() {
  return <MercadoPromoPage forcedSlug="bodymodelador" />;
}
