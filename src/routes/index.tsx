import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/paze-hero.jpg";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductCard } from "@/components/paze/ProductCard";
import { SignatureTrail } from "@/components/paze/SignatureTrail";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { Ear, Eye, Wind, Route as RouteIcon, ArrowRight } from "lucide-react";

// TODO: Meta Pixel PageView, GA4 page_view, TikTok Pixel Pageview

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paze — Acessórios técnicos de corrida e segurança urbana" },
      {
        name: "description",
        content:
          "Fone de condução óssea, LEDs, coletes refletivos e acessórios técnicos para quem treina em ambiente urbano. Segurança e performance em cada passada.",
      },
      { property: "og:title", content: "Paze — Loja oficial" },
      {
        property: "og:description",
        content:
          "Segurança e performance para corredores, ciclistas e outdoor.",
      },
    ],
  }),
  component: Home,
});

const FEATURED_SLUGS = [
  "fone-conducao-ossea",
  "kit-seguranca-urbana",
  "bracadeira-led",
  "fita-anti-atrito",
];

function Home() {
  const featured = FEATURED_SLUGS.map((s) => PRODUCTS.find((p) => p.slug === s)!).filter(Boolean);

  return (
    <StoreLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[color:var(--graphite)] text-[color:var(--bone)]">
        <SignatureTrail />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(20,23,26,0.4) 0%, rgba(20,23,26,0.95) 100%), url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-24 md:px-8 md:py-36">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-[color:var(--sage)]">
              <span className="h-px w-6 bg-[color:var(--sage)]" />
              Paze / Coleção 01 / Urbano
            </div>
            <h1 className="font-display text-5xl leading-[0.95] tracking-wide md:text-7xl lg:text-8xl">
              OUÇA SUA MÚSICA<br />
              <span className="text-[color:var(--sage)]">SEM DEIXAR</span> DE OUVIR<br />
              O MUNDO.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[color:var(--bone)]/70">
              Tecnologia de condução óssea, LEDs de alta visibilidade e
              acessórios técnicos para quem corre, pedala e treina em
              ambiente urbano.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/produtos"
                className="inline-flex items-center gap-2 rounded-sm bg-[color:var(--terracotta)] px-6 py-4 font-mono text-sm uppercase tracking-widest hover:opacity-90"
              >
                Ver produtos <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/produto/$slug"
                params={{ slug: "fone-conducao-ossea" }}
                className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--bone)]/30 px-6 py-4 font-mono text-sm uppercase tracking-widest hover:border-[color:var(--sage)] hover:text-[color:var(--sage)]"
              >
                Conheça o fone
              </Link>
            </div>
          </div>
          <div className="grid max-w-2xl grid-cols-3 gap-6 border-t border-[color:var(--bone)]/10 pt-6 font-mono text-xs">
            <div>
              <div className="text-[color:var(--sage)]">01</div>
              <div className="mt-1 text-[color:var(--bone)]/60">Ouvidos livres</div>
            </div>
            <div>
              <div className="text-[color:var(--sage)]">400m</div>
              <div className="mt-1 text-[color:var(--bone)]/60">Visibilidade LED</div>
            </div>
            <div>
              <div className="text-[color:var(--sage)]">IPX5</div>
              <div className="mt-1 text-[color:var(--bone)]/60">Suor e chuva</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="mb-16 max-w-2xl">
          <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
            / 01 · O problema
          </div>
          <h2 className="font-display text-4xl tracking-wide md:text-5xl">
            Fones tradicionais foram feitos para o silêncio.
            <span className="text-[color:var(--sage)]"> Não para a rua.</span>
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-4">
          {[
            { icon: Ear, title: "Isolam o ambiente", copy: "Você não escuta carros, buzinas ou ciclistas." },
            { icon: Eye, title: "Reduzem sua atenção", copy: "Menos consciência periférica em cruzamentos." },
            { icon: Wind, title: "Incomodam no treino", copy: "Escorregam com o suor, doem em longões." },
            { icon: RouteIcon, title: "Cortam o mundo", copy: "Você deixa de ouvir seu grupo, sua cidade, seu ritmo." },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="border-t border-[color:var(--graphite)]/20 pt-6">
              <Icon className="h-6 w-6 text-[color:var(--sage)]" strokeWidth={1.2} />
              <h3 className="mt-4 font-display text-2xl tracking-wide">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="bg-[color:var(--graphite)]/[0.03] py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
                / 02 · Coleção
              </div>
              <h2 className="font-display text-4xl tracking-wide md:text-5xl">
                Sistema completo de treino urbano
              </h2>
            </div>
            <Link
              to="/produtos"
              className="hidden font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-[color:var(--terracotta)] md:inline-flex"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Link
                key={c.slug}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--bone)] p-6 transition-colors hover:border-[color:var(--sage)]"
              >
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  0{i + 1}
                </div>
                <div>
                  <h3 className="font-display text-3xl tracking-wide">{c.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-[color:var(--terracotta)] transition-transform group-hover:translate-x-1">
                    Explorar <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
              / 03 · Em destaque
            </div>
            <h2 className="font-display text-4xl tracking-wide md:text-5xl">
              O que os corredores estão usando
            </h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* CONDUÇÃO ÓSSEA */}
      <section className="relative overflow-hidden bg-[color:var(--graphite)] py-24 text-[color:var(--bone)]">
        <SignatureTrail />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:px-8">
          <div>
            <div className="mb-4 font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
              / 04 · Tecnologia
            </div>
            <h2 className="font-display text-4xl tracking-wide md:text-5xl">
              Como funciona a<br />condução óssea
            </h2>
            <p className="mt-6 max-w-md text-[color:var(--bone)]/70">
              O som é transmitido através dos ossos do crânio direto para o
              ouvido interno, contornando o canal auditivo. Suas orelhas ficam
              livres — você ouve música <em>e</em> o ambiente ao mesmo tempo.
            </p>
            <Link
              to="/produto/$slug"
              params={{ slug: "fone-conducao-ossea" }}
              className="mt-8 inline-flex items-center gap-2 rounded-sm border border-[color:var(--bone)]/30 px-6 py-4 font-mono text-sm uppercase tracking-widest hover:border-[color:var(--sage)] hover:text-[color:var(--sage)]"
            >
              Ver o fone <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 400 300" className="w-full max-w-md">
              <circle cx="200" cy="150" r="80" fill="none" stroke="var(--sage)" strokeWidth="1" strokeDasharray="3 4" />
              <path d="M 60 150 Q 130 100, 200 150 T 340 150" stroke="var(--sage)" strokeWidth="1.5" fill="none" />
              <path d="M 60 150 Q 130 200, 200 150 T 340 150" stroke="var(--terracotta)" strokeWidth="1.5" fill="none" />
              <text x="60" y="240" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fill="var(--sage)">SEU SOM</text>
              <text x="280" y="240" fontFamily="'IBM Plex Mono', monospace" fontSize="10" fill="var(--terracotta)">O AMBIENTE</text>
              <text x="180" y="155" fontFamily="'IBM Plex Mono', monospace" fontSize="9" fill="var(--bone)" opacity="0.5">OUVIDO</text>
            </svg>
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center md:px-8">
        <div className="font-mono text-xs uppercase tracking-widest text-[color:var(--sage)]">
          / 05 · Comunidade
        </div>
        <h2 className="mt-4 font-display text-4xl tracking-wide md:text-5xl">
          Usado por milhares de corredores<br />e ciclistas em todo o Brasil
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            { n: "12k+", l: "Corredores equipados" },
            { n: "4.8", l: "Avaliação média (reviews reais)" },
            { n: "97%", l: "Recomendariam a um amigo" },
          ].map((s) => (
            <div key={s.l} className="border-t border-[color:var(--graphite)]/20 pt-6">
              <div className="font-mono text-4xl text-[color:var(--terracotta)]">{s.n}</div>
              <div className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>
    </StoreLayout>
  );
}
