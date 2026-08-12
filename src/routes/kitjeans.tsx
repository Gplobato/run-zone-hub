import { createFileRoute } from "@tanstack/react-router";
import { MercadoPromoPage } from "./mercadopromo";

export const Route = createFileRoute("/kitjeans")({
  component: KitJeansPage,
});

function KitJeansPage() {
  return <MercadoPromoPage forcedSlug="kitjeans" />;
}
