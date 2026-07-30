import { createFileRoute } from "@tanstack/react-router";
import { MercadoPromoPage } from "./mercadopromo";

const TITLE = "Mercado Livre";
const PRODUCT_TITLE = "Kit 3 Sandálias Femininas Branca, Preta e Rosé";
const DESCRIPTION =
  "Kit Paze com três sandálias femininas nas cores branca, preta e rosé. Numerações do 34 ao 41 por R$ 99,90.";
const OG_IMAGE = "https://assetsglobalbr.com/u/testimony/72ad024d.png";

export const Route = createFileRoute("/kitsandalias")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { property: "og:title", content: PRODUCT_TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "product:price:amount", content: "99.90" },
      { property: "product:price:currency", content: "BRL" },
      { property: "product:brand", content: "Paze" },
      { property: "product:availability", content: "in stock" },
      { property: "product:condition", content: "new" },
      {
        property: "product:retailer_item_id",
        content: "mercadopromo-kit-sandalias",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PRODUCT_TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: KitSandaliasPage,
});

function KitSandaliasPage() {
  return (
    <>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1577403850715282&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      <MercadoPromoPage forcedSlug="kitsandalias" />
    </>
  );
}
