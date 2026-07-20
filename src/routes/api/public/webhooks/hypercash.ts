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

          console.log("[hypercash-webhook]", { id, status });

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
