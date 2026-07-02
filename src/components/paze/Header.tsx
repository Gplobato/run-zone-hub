import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const NAV = [
  { to: "/produtos", label: "Todos" },
  { to: "/categoria/seguranca", label: "Segurança" },
  { to: "/categoria/audio", label: "Áudio" },
  { to: "/categoria/acessorios", label: "Acessórios" },
  { to: "/categoria/kits", label: "Kits" },
] as const;

export function Header() {
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--graphite)]/10 bg-[color:var(--bone)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-baseline gap-1">
            <span className="font-display text-2xl tracking-widest">PAZE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--terracotta)]" />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="font-mono text-xs uppercase tracking-wider text-[color:var(--graphite)]/70 transition-colors hover:text-[color:var(--terracotta)]"
                activeProps={{ className: "text-[color:var(--terracotta)]" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Buscar"
            onClick={() => setSearchOpen((s) => !s)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-[color:var(--graphite)] hover:bg-[color:var(--graphite)]/5"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            aria-label="Abrir carrinho"
            onClick={openCart}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-sm text-[color:var(--graphite)] hover:bg-[color:var(--graphite)]/5"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--terracotta)] px-1 font-mono text-[10px] font-medium text-[color:var(--bone)]">
                {itemCount}
              </span>
            )}
          </button>
          <button
            aria-label="Menu"
            onClick={() => setMobileOpen((s) => !s)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-[color:var(--graphite)] hover:bg-[color:var(--graphite)]/5 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-[color:var(--graphite)]/10 bg-[color:var(--bone)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchOpen(false);
              navigate({ to: "/produtos", search: { q } });
            }}
            className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 md:px-8"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produtos…"
              className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>
        </div>
      )}

      {mobileOpen && (
        <nav className="border-t border-[color:var(--graphite)]/10 bg-[color:var(--bone)] md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className="py-3 font-mono text-sm uppercase tracking-wider text-[color:var(--graphite)]/80"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
