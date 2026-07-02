import { Link } from "@tanstack/react-router";
import { Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-[color:var(--graphite)] text-[color:var(--bone)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-3xl tracking-widest">PAZE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--terracotta)]" />
          </div>
          <p className="mt-4 max-w-xs text-sm text-[color:var(--bone)]/60">
            Acessórios técnicos para quem treina em ambiente urbano. Segurança
            e performance em cada passada.
          </p>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]/50">
            Loja
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/produtos" className="hover:text-[color:var(--sage)]">Todos os produtos</Link></li>
            <li><Link to="/categoria/audio" className="hover:text-[color:var(--sage)]">Áudio</Link></li>
            <li><Link to="/categoria/seguranca" className="hover:text-[color:var(--sage)]">Segurança</Link></li>
            <li><Link to="/categoria/kits" className="hover:text-[color:var(--sage)]">Kits</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]/50">
            Ajuda
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#" className="hover:text-[color:var(--sage)]">Política de trocas</a></li>
            <li><a href="#" className="hover:text-[color:var(--sage)]">Prazos de entrega</a></li>
            <li><a href="#" className="hover:text-[color:var(--sage)]">Rastrear pedido</a></li>
            <li><a href="#" className="hover:text-[color:var(--sage)]">Contato</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]/50">
            Newsletter
          </h4>
          <p className="mt-4 text-sm text-[color:var(--bone)]/60">
            Treinos, novidades e primeiros lançamentos.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-4 flex gap-2"
          >
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full rounded-sm border border-[color:var(--bone)]/20 bg-transparent px-3 py-2 font-mono text-xs text-[color:var(--bone)] placeholder:text-[color:var(--bone)]/40 outline-none focus:border-[color:var(--sage)]"
            />
            <button className="rounded-sm bg-[color:var(--terracotta)] px-4 font-mono text-xs uppercase tracking-wider text-[color:var(--bone)]">
              OK
            </button>
          </form>
          <div className="mt-6 flex gap-3">
            <a href="#" aria-label="Instagram" className="text-[color:var(--bone)]/60 hover:text-[color:var(--bone)]"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="YouTube" className="text-[color:var(--bone)]/60 hover:text-[color:var(--bone)]"><Youtube className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-[color:var(--bone)]/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 font-mono text-[11px] uppercase tracking-wider text-[color:var(--bone)]/40 md:flex-row md:items-center md:justify-between md:px-8">
          <div>© {new Date().getFullYear()} Paze · Todos os direitos reservados</div>
          <div>CNPJ 00.000.000/0001-00 · São Paulo, Brasil</div>
        </div>
      </div>
    </footer>
  );
}
