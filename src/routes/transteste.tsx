import { MercadoPromoPage } from "./mercadopromo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transteste")({
  head: () => ({
    meta: [
      { title: "Sandália Translúcida Jelly Mule - Mercado Livre" },
      {
        name: "description",
        content: "Sandália Translúcida Jelly Mule Feminina com Frete Grátis e Envio Full.",
      },
    ],
  }),
  component: () => <MercadoPromoPage forcedSlug="transteste" />,
});
