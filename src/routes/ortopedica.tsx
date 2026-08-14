import { createFileRoute } from "@tanstack/react-router";
import { MercadoPromoPage } from "./mercadopromo";

export const Route = createFileRoute("/ortopedica")({
  head: () => ({
    meta: [
      { title: "Tênis Feminino Ortopédico Respirável – Mercado Livre" },
      {
        name: "description",
        content:
          "Tênis Feminino Ortopédico Respirável Slip On leve e super confortável. Frete grátis e parcelamento sem juros.",
      },
    ],
  }),
  component: () => <MercadoPromoPage forcedSlug="ortopedica" />,
});
