// ─── Hypercash webhook (postbackUrl) ─────────────────────────────────────
// Público — Hypercash dispara POST aqui quando o status da transação muda.
// Docs: https://docs.hypercash.com.br/docs/webhook/transaction
// ─────────────────────────────────────────────────────────────────────────

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/webhooks/hypercash")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null);
          const tx = body?.data ?? body ?? {};
          const id = tx.id ?? tx.transactionId ?? "unknown";
          const status = tx.status ?? tx.paymentStatus ?? "unknown";

          // Log estruturado para futura integração com banco de pedidos.
          console.log("[hypercash-webhook]", { id, status, raw: tx });

          // TODO: persistir status em banco quando houver tabela orders.
          // paid | approved  → marcar pedido pago, disparar email/nota
          // refused          → marcar recusado
          // refunded         → marcar reembolsado
          // waiting_payment  → nenhum estado adicional

          return Response.json({ ok: true, id, status });
        } catch (err) {
          console.error("[hypercash-webhook] erro", err);
          return new Response("error", { status: 500 });
        }
      },
      GET: async () =>
        new Response("Hypercash webhook up", {
          headers: { "content-type": "text/plain" },
        }),
    },
  },
});
