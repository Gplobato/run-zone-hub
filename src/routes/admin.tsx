import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminLogin, clearAdminSession, isAdminLoggedIn, setAdminLoggedIn } from "@/lib/admin-auth";
import { hypercashPing } from "@/lib/hypercash.functions";
import { PRODUCTS, formatBRL } from "@/lib/products";
import logoUrl from "@/assets/paze-logo.png";
import { Lock, LogOut, RefreshCcw, ShieldCheck, CircleAlert } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Paze" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAdminLoggedIn());
    setReady(true);
  }, []);

  if (!ready) return null;
  return authed ? <Dashboard onLogout={() => setAuthed(false)} /> : <LoginForm onLogin={() => setAuthed(true)} />;
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const login = useServerFn(adminLogin);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ data: { user, password } });
      setAdminLoggedIn();
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--graphite)] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-md bg-[color:var(--bone)] p-8 shadow-2xl"
      >
        <img src={logoUrl} alt="Paze" className="mx-auto h-20 w-auto" />
        <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> Área restrita
        </div>
        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Usuário</span>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoFocus
              autoComplete="username"
              className="w-full rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-3 font-sans text-sm outline-none focus:border-[color:var(--sage)]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-sm border border-[color:var(--graphite)]/20 bg-transparent px-3 py-3 font-sans text-sm outline-none focus:border-[color:var(--sage)]"
            />
          </label>
        </div>
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-sm bg-[color:var(--terracotta)]/10 px-3 py-2 font-mono text-xs text-[color:var(--terracotta)]">
            <CircleAlert className="h-4 w-4" /> {error}
          </div>
        )}
        <button
          disabled={busy}
          className="mt-6 w-full rounded-sm bg-[color:var(--graphite)] py-3 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)] disabled:opacity-50"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const ping = useServerFn(hypercashPing);
  const [status, setStatus] = useState<
    | { state: "loading" }
    | { state: "ok"; balanceCents: number; withheldCents: number }
    | { state: "error"; message: string }
  >({ state: "loading" });

  async function refresh() {
    setStatus({ state: "loading" });
    try {
      const r = await ping();
      setStatus({ state: "ok", balanceCents: r.balanceCents, withheldCents: r.withheldCents });
    } catch (e) {
      setStatus({ state: "error", message: e instanceof Error ? e.message : "Erro" });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const totalSku = PRODUCTS.length;
  const catalogValue = PRODUCTS.reduce((a, p) => a + p.priceCents, 0);

  return (
    <div className="min-h-screen bg-[color:var(--bone)]">
      <header className="border-b border-[color:var(--graphite)]/10 bg-[color:var(--graphite)] text-[color:var(--bone)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Paze" className="h-12 w-auto" />
            <span className="rounded-sm bg-[color:var(--terracotta)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest">
              admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ to: "/" })}
              className="rounded-sm border border-[color:var(--bone)]/20 px-3 py-2 font-mono text-[11px] uppercase tracking-widest hover:bg-[color:var(--bone)]/10"
            >
              Ver loja
            </button>
            <button
              onClick={() => {
                clearAdminSession();
                onLogout();
              }}
              className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--bone)]/20 px-3 py-2 font-mono text-[11px] uppercase tracking-widest hover:bg-[color:var(--bone)]/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
          / painel
        </div>
        <h1 className="font-display text-4xl tracking-wide">Operação Paze</h1>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)] p-6 text-[color:var(--bone)]">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-[color:var(--bone)]/60">
              Gateway Hypercash
              <button
                onClick={refresh}
                aria-label="Atualizar saldo"
                className="rounded-sm border border-[color:var(--bone)]/20 p-1.5 hover:bg-[color:var(--bone)]/10"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
              </button>
            </div>
            {status.state === "loading" && (
              <div className="mt-4 font-mono text-sm text-[color:var(--bone)]/60">Verificando…</div>
            )}
            {status.state === "error" && (
              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-[color:var(--terracotta)]">
                <CircleAlert className="h-4 w-4" /> {status.message}
              </div>
            )}
            {status.state === "ok" && (
              <>
                <div className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
                  <ShieldCheck className="h-4 w-4" /> Conectado
                </div>
                <div className="mt-3 font-display text-4xl">{formatBRL(status.balanceCents)}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-[color:var(--bone)]/50">
                  Retido: {formatBRL(status.withheldCents)}
                </div>
              </>
            )}
          </div>

          <div className="rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--bone)] p-6">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">SKUs ativos</div>
            <div className="mt-4 font-display text-4xl">{totalSku}</div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Valor total catálogo: {formatBRL(catalogValue)}
            </div>
          </div>

          <div className="rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--bone)] p-6">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Pixels</div>
            <div className="mt-4 space-y-1 font-mono text-xs">
              <div>Meta Pixel: <span className="text-muted-foreground">defina VITE_META_PIXEL_ID</span></div>
              <div>GA4: <span className="text-muted-foreground">TODO</span></div>
              <div>TikTok: <span className="text-muted-foreground">TODO</span></div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl tracking-wide">Catálogo</h2>
          <div className="mt-4 overflow-hidden rounded-md border border-[color:var(--graphite)]/10">
            <table className="w-full text-left">
              <thead className="bg-[color:var(--graphite)]/[0.04] font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Slug</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                {PRODUCTS.map((p) => (
                  <tr key={p.slug} className="border-t border-[color:var(--graphite)]/10">
                    <td className="px-4 py-3">{p.shortName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.categoryLabel}</td>
                    <td className="px-4 py-3 text-[color:var(--terracotta)]">{formatBRL(p.priceCents)}</td>
                    <td className="px-4 py-3 text-[10px] text-muted-foreground">{p.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Credenciais Hypercash e admin ficam no cofre de secrets do servidor.
          Nunca aparecem no bundle do navegador.
        </p>
      </main>
    </div>
  );
}
