import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import logoAsset from "@/assets/paze-logo.png.asset.json";

const NAV = [
  { to: "/produtos", label: "Todos" },
  { to: "/categoria/audio", label: "Áudio" },
  { to: "/categoria/seguranca", label: "Segurança" },
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
    <header className="sticky top-0 z-40 bg-[color:var(--graphite)] text-[color:var(--bone)]">
      {/* announcement bar */}
      <div className="border-b border-[color:var(--bone)]/10 bg-[color:var(--graphite)]">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-center px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--bone)]/60 md:px-8">
          Frete grátis acima de R$ 299 · Entrega em todo o Brasil
        </div>
      </div>

      <div className="relative border-b border-[color:var(--bone)]/10">
        <div className="mx-auto grid h-14 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:h-16 md:px-8">
          {/* left: logo — allowed to overflow the thin bar */}
          <Link to="/" aria-label="Paze — início" className="relative flex items-center">
            <img
              src={logoAsset.url}
              alt="Paze"
              className="block h-20 w-auto md:h-28"
              style={{ maxHeight: "none" }}
              draggable={false}
            />
          </Link>


          {/* center: nav */}
          <nav className="hidden items-center justify-center gap-8 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--bone)]/70 transition-colors hover:text-[color:var(--bone)]"
                activeProps={{ className: "text-[color:var(--sage)]" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* right: actions */}
          <div className="flex items-center justify-end gap-1">
            <button
              aria-label="Buscar"
              onClick={() => setSearchOpen((s) => !s)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-[color:var(--bone)]/80 hover:bg-[color:var(--bone)]/10 hover:text-[color:var(--bone)]"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button
              aria-label="Abrir carrinho"
              onClick={openCart}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-sm text-[color:var(--bone)]/80 hover:bg-[color:var(--bone)]/10 hover:text-[color:var(--bone)]"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--terracotta)] px-1 font-mono text-[10px] font-medium text-[color:var(--bone)]">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              aria-label="Menu"
              onClick={() => setMobileOpen((s) => !s)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-[color:var(--bone)]/80 hover:bg-[color:var(--bone)]/10 md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-[color:var(--bone)]/10 bg-[color:var(--graphite)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchOpen(false);
              navigate({ to: "/produtos", search: { q } });
            }}
            className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 md:px-8"
          >
            <Search className="h-4 w-4 text-[color:var(--bone)]/50" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produtos…"
              className="w-full bg-transparent font-mono text-sm text-[color:var(--bone)] outline-none placeholder:text-[color:var(--bone)]/40"
            />
          </form>
        </div>
      )}

      {mobileOpen && (
        <nav className="border-b border-[color:var(--bone)]/10 bg-[color:var(--graphite)] md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className="border-b border-[color:var(--bone)]/5 py-3 font-mono text-sm uppercase tracking-[0.18em] text-[color:var(--bone)]/80"
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
