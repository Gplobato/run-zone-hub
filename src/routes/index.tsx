import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/paze-hero.jpg";
import productImg from "@/assets/paze-product.jpg";
import closingImg from "@/assets/paze-closing.jpg";

// ─── Analytics placeholders ──────────────────────────────────────────────
// TODO: Meta Pixel — inserir script no <head> via __root.tsx head().scripts
// TODO: Google Analytics (GA4) — inserir gtag script no <head> via __root.tsx
// TODO: TikTok Pixel — inserir snippet no <head> via __root.tsx
// Eventos recomendados nos handlers de CTA: fbq('track','AddToCart'),
// gtag('event','add_to_cart'), ttq.track('AddToCart')
// ─────────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paze — Ouça sua música sem deixar de ouvir o mundo" },
      {
        name: "description",
        content:
          "Fone de condução óssea premium da Paze — criado para corredores, ciclistas e praticantes de atividades ao ar livre. Segurança, conforto e liberdade em cada treino.",
      },
      { property: "og:title", content: "Paze — Fone de condução óssea" },
      {
        property: "og:description",
        content:
          "Ouça sua música E o ambiente ao mesmo tempo. Tecnologia de condução óssea para corrida, ciclismo e treinos ao ar livre.",
      },
    ],
  }),
  component: PazeLanding,
});

/* ═══════════════════════ Signature bone-conduction line ══════════════════
   A thin vertical SVG "trail" that runs down the right edge of the page.
   In key sections it splits into two waves (your music / the world) and
   recombines. Purely decorative but conceptually consistent.
   ═══════════════════════════════════════════════════════════════════════ */
function SignatureTrail() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-0 hidden h-full w-8 md:right-8 md:block lg:right-12"
      viewBox="0 0 32 1000"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M16 0 L16 220 C16 240, 6 250, 6 280 C 6 320, 26 330, 26 370 C 26 400, 16 410, 16 440 L 16 640 C 16 670, 4 680, 4 710 C 4 750, 28 760, 28 800 C 28 830, 16 840, 16 870 L 16 1000"
        stroke="var(--sage)"
        strokeWidth="1"
        strokeDasharray="1 3"
        opacity="0.55"
      />
    </svg>
  );
}

/* ═════════════════ Bone-conduction "how it works" SVG ═══════════════════ */
function BoneConductionDiagram() {
  return (
    <svg
      viewBox="0 0 600 400"
      className="w-full h-auto"
      role="img"
      aria-label="Ilustração do som percorrendo os ossos da face com os ouvidos livres"
    >
      {/* stylized head */}
      <ellipse cx="300" cy="200" rx="110" ry="140" stroke="var(--bone)" strokeWidth="1.2" fill="none" opacity="0.7" />
      <circle cx="340" cy="180" r="2" fill="var(--bone)" />
      {/* ear */}
      <path d="M395 180 q20 -10 15 20 q-5 30 -25 25" stroke="var(--sage)" strokeWidth="1.5" fill="none" />
      {/* device */}
      <rect x="400" y="150" width="60" height="18" rx="9" fill="var(--terracotta)" opacity="0.9" />
      {/* your sound wave */}
      <path
        d="M440 165 C 380 165, 340 190, 310 210"
        stroke="var(--sage)"
        strokeWidth="1.2"
        strokeDasharray="2 3"
        fill="none"
      />
      <text x="455" y="140" fontFamily="IBM Plex Mono" fontSize="11" fill="var(--bone)" opacity="0.8">
        SEU SOM
      </text>
      {/* ambient wave */}
      <path
        d="M100 100 Q 200 130 260 200"
        stroke="var(--bone)"
        strokeWidth="1"
        strokeDasharray="1 3"
        fill="none"
        opacity="0.7"
      />
      <text x="60" y="90" fontFamily="IBM Plex Mono" fontSize="11" fill="var(--bone)" opacity="0.8">
        AMBIENTE
      </text>
      {/* vibration points on bone */}
      {[220, 240, 260, 280].map((y) => (
        <circle key={y} cx="395" cy={y - 40} r="2" fill="var(--terracotta)" opacity="0.7" />
      ))}
    </svg>
  );
}

/* ═══════════════════ Thin-line icon primitives ══════════════════════════ */
const iconStroke = {
  stroke: "currentColor",
  strokeWidth: 1.2,
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const Icon = {
  Truck: () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...iconStroke}>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...iconStroke}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" {...iconStroke}>
      <rect x="5" y="11" width="14" height="9" rx="1" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  ),
  Ear: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconStroke}>
      <path d="M8 20c-2 0-3-2-3-4 0-3 2-4 2-7a5 5 0 1110 0c0 3-3 3-4 5s0 4-2 4" />
    </svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconStroke}>
      <path d="M12 20s-7-4.5-7-10a4 4 0 017-2 4 4 0 017 2c0 5.5-7 10-7 10z" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconStroke}>
      <path d="M12 4L2 20h20z" />
      <path d="M12 10v5M12 18v.5" />
    </svg>
  ),
  Drop: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconStroke}>
      <path d="M12 3s6 7 6 12a6 6 0 01-12 0c0-5 6-12 6-12z" />
    </svg>
  ),
};

/* ═══════════════════════════════ Page ═══════════════════════════════════ */
function PazeLanding() {
  const [cartOpen, setCartOpen] = useState(false);
  const openCart = () => {
    // TODO: fire analytics AddToCart events here
    setCartOpen(true);
  };

  return (
    <div className="relative bg-[color:var(--bone)] text-[color:var(--graphite)] pb-24 md:pb-0">
      <Header onCta={openCart} />
      <Hero onCta={openCart} />
      <Problem />
      <Solution />
      <Benefits />
      <Demo />
      <Comparison />
      <SocialProof />
      <Faq />
      <Offer onCta={openCart} />
      <Closing onCta={openCart} />
      <Footer />

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--graphite)]/10 bg-[color:var(--bone)]/95 backdrop-blur px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--neutral)]">
              Paze / Bone Conduction
            </p>
            <p className="truncate font-semibold text-[color:var(--graphite)]">
              R$ 749 <span className="text-xs font-normal text-[color:var(--neutral)]">ou 12x R$ 62,42</span>
            </p>
          </div>
          <button
            onClick={openCart}
            className="shrink-0 rounded-sm bg-[color:var(--terracotta)] px-4 py-3 text-sm font-semibold uppercase tracking-wider text-[color:var(--bone)]"
          >
            Comprar
          </button>
        </div>
      </div>

      <CartMock open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

/* ═══════════════════════════════ Header ═════════════════════════════════ */
function Header({ onCta }: { onCta: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--graphite)]/10 bg-[color:var(--bone)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-display text-3xl leading-none tracking-widest text-[color:var(--graphite)]">
            PAZE
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--sage)]">
            /bone.audio
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <a href="#como-funciona" className="text-[color:var(--neutral)] hover:text-[color:var(--graphite)]">
            Tecnologia
          </a>
          <a href="#beneficios" className="text-[color:var(--neutral)] hover:text-[color:var(--graphite)]">
            Benefícios
          </a>
          <a href="#faq" className="text-[color:var(--neutral)] hover:text-[color:var(--graphite)]">
            FAQ
          </a>
        </nav>
        <button
          onClick={onCta}
          className="hidden rounded-sm border border-[color:var(--graphite)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--graphite)] hover:bg-[color:var(--graphite)] hover:text-[color:var(--bone)] md:inline-block"
        >
          Comprar
        </button>
      </div>
    </header>
  );
}

/* ═══════════════════════════════ Hero ═══════════════════════════════════ */
function Hero({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--graphite)] text-[color:var(--bone)]">
      <SignatureTrail />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:gap-14 md:px-10 md:py-24 lg:py-32">
        <div className="relative z-10">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--sage)]">
            001 / Paze Open-Ear · Bone Conduction
          </p>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-[color:var(--bone)] md:text-7xl lg:text-8xl">
            Ouça sua música
            <br />
            sem deixar
            <br />
            de ouvir o mundo.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[color:var(--bone)]/75 md:text-lg">
            Tecnologia de condução óssea criada para quem corre, pedala e treina com mais liberdade
            e segurança.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              onClick={onCta}
              className="group inline-flex items-center justify-center gap-3 rounded-sm bg-[color:var(--terracotta)] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[color:var(--bone)] transition hover:brightness-110"
            >
              Quero experimentar
              <span className="transition group-hover:translate-x-1">→</span>
            </button>
            <span className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--bone)]/50">
              R$ 749 · 12x sem juros
            </span>
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-3 border-t border-[color:var(--bone)]/10 pt-6 text-[color:var(--bone)]/70 sm:grid-cols-3">
            <li className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
              <Icon.Truck /> Frete todo Brasil
            </li>
            <li className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
              <Icon.Shield /> Garantia satisfação
            </li>
            <li className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
              <Icon.Lock /> Pagamento seguro
            </li>
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-[color:var(--terracotta)]/10 blur-3xl" />
          <img
            src={heroImg}
            alt="Corredor em ambiente urbano usando fone de condução óssea Paze ao pôr do sol"
            className="relative z-10 h-auto w-full rounded-sm object-cover shadow-2xl"
            width={1600}
            height={1280}
          />
          <div className="absolute bottom-4 left-4 z-20 border border-[color:var(--bone)]/30 bg-[color:var(--graphite)]/70 px-3 py-2 backdrop-blur">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--bone)]/80">
              lat -23.55 · pace 5'12"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ Problem ════════════════════════════════ */
function Problem() {
  const items = [
    { icon: <Icon.Ear />, text: "Isolam completamente o ambiente" },
    { icon: <Icon.Heart />, text: "Desconforto após longos treinos" },
    { icon: <Icon.Alert />, text: "Sensação de insegurança em ruas e avenidas" },
    { icon: <Icon.Drop />, text: "Suor e desconforto durante a corrida" },
  ];
  return (
    <section className="relative bg-[color:var(--bone)] py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--sage)]">
          002 / O problema
        </p>
        <h2 className="max-w-3xl font-display text-4xl leading-[1] md:text-6xl">
          Fones tradicionais não foram feitos para quem está em movimento.
        </h2>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={i} className="border-t border-[color:var(--graphite)]/15 pt-5">
              <div className="text-[color:var(--terracotta)]">{it.icon}</div>
              <p className="mt-4 text-base leading-relaxed text-[color:var(--graphite)]">{it.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-14 max-w-2xl text-lg leading-relaxed text-[color:var(--neutral)]">
          Correr, pedalar ou treinar na rua exige atenção total — você precisa ouvir sua música{" "}
          <span className="text-[color:var(--graphite)]">e</span> o ambiente ao mesmo tempo. É aí que
          entra a condução óssea.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ Solution ═══════════════════════════════ */
function Solution() {
  const specs = [
    "Ouvidos livres",
    "Mais percepção do ambiente",
    "Conforto prolongado",
    "Resistente ao suor",
    "Ideal para corrida e ciclismo",
  ];
  return (
    <section id="como-funciona" className="relative overflow-hidden bg-[color:var(--graphite)] py-20 text-[color:var(--bone)] md:py-32">
      <SignatureTrail />
      <div className="mx-auto grid max-w-6xl gap-14 px-5 md:grid-cols-2 md:items-center md:px-10">
        <div>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--sage)]">
            003 / A solução
          </p>
          <h2 className="font-display text-4xl leading-[1] text-[color:var(--bone)] md:text-6xl">
            Como funciona a<br />
            condução óssea
          </h2>
          <p className="mt-6 max-w-md text-[color:var(--bone)]/70">
            O som viaja como vibração pelos ossos da face até o ouvido interno, sem tampar o canal
            auditivo. Sua trilha sonora e o mundo — juntos, o tempo todo.
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {specs.map((s) => (
              <li
                key={s}
                className="flex items-center gap-3 border-l border-[color:var(--sage)]/40 pl-3 font-mono text-[11px] uppercase tracking-widest text-[color:var(--bone)]/80"
              >
                <span className="text-[color:var(--sage)]">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-sm border border-[color:var(--bone)]/10 bg-[color:var(--graphite)]/40 p-6">
          <BoneConductionDiagram />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ Benefits ═══════════════════════════════ */
function Benefits() {
  const items = [
    { id: "B/01", title: "Consciência ambiental total", desc: "Ouça trânsito, bicicletas e pessoas ao seu redor sem tirar o fone." },
    { id: "B/02", title: "Conforto para horas de treino", desc: "Sem nada dentro do ouvido. Sem pressão, sem fadiga auditiva." },
    { id: "B/03", title: "Estabilidade em movimento", desc: "Arco anatômico atrás da cabeça que não sai — nem no sprint." },
    { id: "B/04", title: "Resistente a suor e chuva", desc: "Certificação IP67. Treine na chuva, treine forte, treine longe." },
    { id: "B/05", title: "Bluetooth 5.3 estável", desc: "Conexão instantânea, sem cortes, alcance de até 10 metros." },
    { id: "B/06", title: "Bateria para treinos longos", desc: "Até 10 horas contínuas. Carga rápida: 10 min = 2 horas." },
  ];
  return (
    <section id="beneficios" className="bg-[color:var(--bone)] py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--sage)]">
          004 / Benefícios reais
        </p>
        <h2 className="max-w-3xl font-display text-4xl leading-[1] md:text-6xl">
          Feito para o corpo em movimento.
        </h2>
        <div className="mt-14 grid gap-px bg-[color:var(--graphite)]/15 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <div key={b.id} className="group flex flex-col justify-between bg-[color:var(--bone)] p-8 transition hover:bg-[color:var(--graphite)] hover:text-[color:var(--bone)]">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--sage)]">
                  {b.id}
                </p>
                <h3 className="mt-6 font-display text-2xl leading-tight md:text-3xl">
                  {b.title}
                </h3>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-[color:var(--neutral)] group-hover:text-[color:var(--bone)]/70">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ Demo ═══════════════════════════════════ */
function Demo() {
  const scenes = ["Corrida urbana", "Corrida em parque", "Ciclismo", "Academia", "Caminhada"];
  return (
    <section className="bg-[color:var(--graphite)] py-20 text-[color:var(--bone)] md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--sage)]">
          005 / Em campo
        </p>
        <h2 className="max-w-3xl font-display text-4xl leading-[1] md:text-6xl">
          O Paze acompanha cada movimento.
        </h2>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map((label, i) => (
            <div
              key={label}
              className={`group relative aspect-[4/5] overflow-hidden border border-[color:var(--bone)]/10 bg-[color:var(--graphite)] ${
                i === 0 ? "lg:col-span-2 lg:row-span-2 lg:aspect-auto" : ""
              }`}
            >
              {/* Video placeholder — swap for <video> when files ready */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[color:var(--graphite)] via-[color:var(--graphite)]/70 to-[color:var(--sage)]/20">
                <svg viewBox="0 0 24 24" className="h-14 w-14 text-[color:var(--bone)]/40 transition group-hover:scale-110 group-hover:text-[color:var(--bone)]" {...iconStroke}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M10 8l6 4-6 4z" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute bottom-4 left-4 z-10">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--sage)]">
                  reel / 0{i + 1}
                </p>
                <p className="font-display text-2xl text-[color:var(--bone)]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ Comparison ═════════════════════════════ */
function Comparison() {
  const rows = [
    ["Percepção do ambiente", true, false],
    ["Conforto prolongado", true, false],
    ["Segurança ao correr", true, false],
    ["Estabilidade em movimento", true, false],
    ["Uso confortável com suor", true, false],
  ];
  const Mark = ({ ok }: { ok: boolean }) =>
    ok ? (
      <span className="font-mono text-sm text-[color:var(--terracotta)]">●</span>
    ) : (
      <span className="font-mono text-sm text-[color:var(--neutral)]/50">—</span>
    );
  return (
    <section className="bg-[color:var(--bone)] py-20 md:py-32">
      <div className="mx-auto max-w-5xl px-5 md:px-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--sage)]">
          006 / Comparação
        </p>
        <h2 className="max-w-3xl font-display text-4xl leading-[1] md:text-6xl">
          Paze vs. fone intra-auricular comum.
        </h2>
        <div className="mt-14 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="border-b border-[color:var(--graphite)]/20 text-left">
                <th className="py-4 font-mono text-[11px] font-normal uppercase tracking-widest text-[color:var(--neutral)]">
                  Critério
                </th>
                <th className="py-4 font-display text-lg tracking-wider">Paze</th>
                <th className="py-4 font-mono text-[11px] font-normal uppercase tracking-widest text-[color:var(--neutral)]">
                  Intra-auricular
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, a, b]) => (
                <tr key={label as string} className="border-b border-[color:var(--graphite)]/10">
                  <td className="py-5 pr-4 text-sm text-[color:var(--graphite)]">{label}</td>
                  <td className="py-5"><Mark ok={a as boolean} /></td>
                  <td className="py-5"><Mark ok={b as boolean} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ Social proof ═══════════════════════════ */
function SocialProof() {
  const reviews = [
    {
      name: "Marina R.",
      role: "Corredora · 42km",
      text: "Consigo ouvir carros vindo de trás enquanto ouço meu podcast. Mudou meus treinos matinais.",
    },
    {
      name: "Diego A.",
      role: "Ciclista urbano",
      text: "Uso todos os dias no trajeto pro trabalho. Nada de fone caindo, nada de perder o barulho da rua.",
    },
    {
      name: "Julia S.",
      role: "Triatleta amadora",
      text: "Mais leve que qualquer fone que já usei. 3h de treino e esqueço que está na cabeça.",
    },
  ];
  return (
    <section className="bg-[color:var(--graphite)] py-20 text-[color:var(--bone)] md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--sage)]">
          007 / Prova social
        </p>
        <h2 className="max-w-3xl font-display text-4xl leading-[1] md:text-6xl">
          Por que corredores estão migrando para essa tecnologia.
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="flex flex-col justify-between border border-[color:var(--bone)]/10 bg-[color:var(--graphite)]/40 p-7"
            >
              <div>
                <div className="mb-4 flex gap-0.5 text-[color:var(--terracotta)]">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                </div>
                <blockquote className="text-[color:var(--bone)]/85 leading-relaxed">
                  "{r.text}"
                </blockquote>
              </div>
              <figcaption className="mt-8 flex items-center gap-3 border-t border-[color:var(--bone)]/10 pt-5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--sage)]/20 font-mono text-xs text-[color:var(--sage)]">
                  {r.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--bone)]">{r.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--bone)]/50">
                    {r.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-12 font-mono text-xs uppercase tracking-widest text-[color:var(--bone)]/50">
          — Utilizado por milhares de corredores e ciclistas pelo Brasil.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ FAQ ════════════════════════════════════ */
function Faq() {
  const items = [
    { q: "Consigo ouvir carros e pessoas ao redor?", a: "Sim. Como os ouvidos ficam completamente livres, você mantém total percepção do ambiente enquanto ouve sua música." },
    { q: "Funciona com iPhone e Android?", a: "Funciona em qualquer aparelho com Bluetooth 4.0 ou superior — iPhone, Android, notebook, smartwatch." },
    { q: "É resistente ao suor?", a: "Certificação IP67 contra suor, chuva e respingos. Não é recomendado para submersão em piscina." },
    { q: "Posso usar de óculos?", a: "Sim. O arco passa por trás da cabeça e não conflita com hastes de óculos ou boné." },
    { q: "Quanto dura a bateria?", a: "Até 10 horas de reprodução contínua. Carga rápida: 10 minutos rendem cerca de 2 horas de uso." },
    { q: "A qualidade do som é boa?", a: "Excelente para música, podcasts e chamadas. O grave é mais suave que um in-ear — é a natureza da tecnologia — mas a clareza é impressionante." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="bg-[color:var(--bone)] py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-10">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--sage)]">
          008 / Perguntas frequentes
        </p>
        <h2 className="font-display text-4xl leading-[1] md:text-6xl">
          Tudo que você quer saber antes de correr com Paze.
        </h2>
        <div className="mt-12 border-t border-[color:var(--graphite)]/15">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={it.q} className="border-b border-[color:var(--graphite)]/15">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-4 min-w-0">
                    <span className="font-mono text-[11px] text-[color:var(--sage)] shrink-0">
                      0{i + 1}
                    </span>
                    <span className="text-base font-medium text-[color:var(--graphite)] md:text-lg">
                      {it.q}
                    </span>
                  </span>
                  <span className={`shrink-0 font-mono text-lg text-[color:var(--terracotta)] transition-transform ${isOpen ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pl-9 pr-10 text-sm leading-relaxed text-[color:var(--neutral)]">
                      {it.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ Offer ══════════════════════════════════ */
function Offer({ onCta }: { onCta: () => void }) {
  return (
    <section className="bg-[color:var(--bone)] py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-10">
        <div className="grid gap-10 border border-[color:var(--graphite)]/15 bg-[color:var(--bone)] p-8 md:grid-cols-2 md:items-center md:p-14">
          <div className="relative">
            <img
              src={productImg}
              alt="Fone de condução óssea Paze — arco anatômico com detalhe verde-sálvia"
              className="mx-auto h-auto w-full max-w-sm"
              loading="lazy"
              width={1200}
              height={1200}
            />
          </div>
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--sage)]">
              009 / A oferta
            </p>
            <h2 className="font-display text-4xl leading-[1] md:text-5xl">
              Paze Open-Ear
              <br />
              Bone Conduction
            </h2>
            <p className="mt-4 text-[color:var(--neutral)]">
              O fone que acompanha corredores e ciclistas que não querem se isolar do mundo.
            </p>

            <div className="mt-8 flex items-baseline gap-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--neutral)] line-through">
                R$ 999
              </span>
              <span className="font-display text-5xl tracking-tight text-[color:var(--graphite)] md:text-6xl">
                R$ 749
              </span>
            </div>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[color:var(--neutral)]">
              ou 12x de R$ 62,42 sem juros
            </p>

            <ul className="mt-8 grid gap-2 font-mono text-[11px] uppercase tracking-widest text-[color:var(--neutral)]">
              <li>· Frete grátis para todo o Brasil</li>
              <li>· Garantia de 30 dias — dinheiro de volta</li>
              <li>· Envio em até 2 dias úteis</li>
            </ul>

            <button
              onClick={onCta}
              className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-[color:var(--terracotta)] px-8 py-5 text-sm font-semibold uppercase tracking-widest text-[color:var(--bone)] transition hover:brightness-110 md:w-auto"
            >
              Adicionar ao carrinho
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ Closing ════════════════════════════════ */
function Closing({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--graphite)] text-[color:var(--bone)]">
      <img
        src={closingImg}
        alt="Corredor solitário em estrada ao amanhecer"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        loading="lazy"
        width={1600}
        height={900}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--graphite)] via-[color:var(--graphite)]/70 to-transparent" />
      <div className="relative mx-auto max-w-4xl px-5 py-32 text-center md:px-10 md:py-40">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--sage)]">
          010 / Sua vez
        </p>
        <h2 className="font-display text-5xl leading-[0.95] md:text-8xl">
          Corra ouvindo
          <br />o que importa.
        </h2>
        <p className="mt-6 text-lg text-[color:var(--bone)]/75 md:text-xl">
          Sua música. Seu treino. Seu ambiente.
        </p>
        <button
          onClick={onCta}
          className="mt-12 inline-flex items-center justify-center gap-3 rounded-sm bg-[color:var(--terracotta)] px-10 py-5 text-sm font-semibold uppercase tracking-widest text-[color:var(--bone)] transition hover:brightness-110"
        >
          Comprar agora <span>→</span>
        </button>
      </div>
    </section>
  );
}

/* ═══════════════════════════════ Footer ═════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-[color:var(--graphite)] py-12 text-[color:var(--bone)]/60">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-3 md:px-10">
        <div>
          <p className="font-display text-3xl tracking-widest text-[color:var(--bone)]">PAZE</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--sage)]">
            Acessórios técnicos para corrida
          </p>
        </div>
        <div className="text-sm">
          <p>Atendimento: seg-sex, 9h-18h</p>
          <p>contato@paze.run</p>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest md:text-right">
          © {new Date().getFullYear()} Paze · CNPJ 00.000.000/0001-00
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════ Cart mock ══════════════════════════════ */
function CartMock({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end bg-[color:var(--graphite)]/60 backdrop-blur-sm md:items-start"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-[color:var(--bone)] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--graphite)]/15 pb-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
            001 / Seu carrinho
          </p>
          <button
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="text-[color:var(--graphite)]"
          >
            ✕
          </button>
        </div>

        <div className="mt-8 flex gap-4 border-b border-[color:var(--graphite)]/10 pb-6">
          <img src={productImg} alt="" className="h-24 w-24 rounded-sm object-cover" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--sage)]">
              Paze / Open-Ear
            </p>
            <p className="mt-1 font-display text-xl leading-tight">Bone Conduction</p>
            <p className="mt-2 text-sm text-[color:var(--neutral)]">Quantidade: 1</p>
            <p className="mt-2 font-semibold text-[color:var(--graphite)]">R$ 749,00</p>
          </div>
        </div>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between text-[color:var(--neutral)]">
            <dt>Subtotal</dt><dd>R$ 749,00</dd>
          </div>
          <div className="flex justify-between text-[color:var(--neutral)]">
            <dt>Frete</dt><dd className="text-[color:var(--sage)]">Grátis</dd>
          </div>
          <div className="flex justify-between border-t border-[color:var(--graphite)]/15 pt-3 font-semibold text-[color:var(--graphite)]">
            <dt>Total</dt><dd>R$ 749,00</dd>
          </div>
        </dl>

        <button className="mt-8 w-full rounded-sm bg-[color:var(--terracotta)] px-6 py-4 text-sm font-semibold uppercase tracking-widest text-[color:var(--bone)]">
          Finalizar compra
        </button>
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-[color:var(--neutral)]">
          checkout em breve · integração de pagamento pendente
        </p>
      </aside>
    </div>
  );
}
