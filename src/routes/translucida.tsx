import { MercadoPromoPage } from "./mercadopromo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/translucida")({
  component: () => <MercadoPromoPage forcedSlug="translucida" />,
});
