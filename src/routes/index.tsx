import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/paze-hero.jpg";
import productImg from "@/assets/paze-product.jpg";
import closingImg from "@/assets/paze-closing.jpg";
import { StoreLayout } from "@/components/paze/StoreLayout";
import { ProductCard } from "@/components/paze/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

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
        content: "Segurança e performance para corredores, ciclistas e outdoor.",
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
  "cinto-corrida",
  "colete-refletivo",
];

function Home() {
  const featured = FEATURED_SLUGS.map((s) => PRODUCTS.find((p) => p.slug === s)!).filter(Boolean);
  const spotlight = PRODUCTS.find((p) => p.slug === "fone-conducao-ossea")!;

  return (
    <StoreLayout>
      {/* ────────────────────────────────────────── HERO */}
      <section className="relative overflow-hidden bg-[color:var(--graphite)] text-[color:var(--bone)]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(20,23,26,0.85) 0%, rgba(20,23,26,0.55) 55%, rgba(20,23,26,0.15) 100%), url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center right",
          }}
        />
        <div className="relative mx-auto grid min-h-[78vh] max-w-7xl grid-cols-1 items-end gap-10 px-4 pb-16 pt-24 md:grid-cols-12 md:px-8 md:pb-24 md:pt-32">
          <div className="md:col-span-7 lg:col-span-6">
            <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--sage)]">
              <span className="h-px w-8 bg-[color:var(--sage)]" />
              Coleção 01 · Urbano
            </div>
            <h1 className="font-display text-[52px] leading-[0.92] tracking-wide md:text-[88px] lg:text-[108px]">
              CORRA
              <br />
              <span className="text-[color:var(--sage)]">CONECTADO</span>
              <br />
              AO MUNDO.
            </h1>
            <p className="mt-8 max-w-md text-base text-[color:var(--bone)]/70 md:text-lg">
              Fones de condução óssea, iluminação LED e acessórios técnicos
              projetados para quem treina em ambiente urbano.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/produtos"
                className="group inline-flex items-center gap-3 rounded-sm bg-[color:var(--bone)] px-7 py-4 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--graphite)] transition-colors hover:bg-[color:var(--sage)]"
              >
                Comprar coleção
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/produto/$slug"
                params={{ slug: "fone-conducao-ossea" }}
                className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--bone)]/70 underline decoration-[color:var(--sage)] decoration-1 underline-offset-8 hover:text-[color:var(--bone)]"
              >
                Conheça o fone Paze
              </Link>
            </div>
          </div>
        </div>

        {/* bottom strip */}
        <div className="relative border-t border-[color:var(--bone)]/10 bg-[color:var(--graphite)]/60 backdrop-blur">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--bone)]/60 md:grid-cols-4 md:px-8">
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-[color:var(--sage)]" strokeWidth={1.4} />
              Frete grátis &gt; R$ 299
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-[color:var(--sage)]" strokeWidth={1.4} />
              Garantia de 1 ano
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 text-[color:var(--sage)]" strokeWidth={1.4} />
              30 dias para trocar
            </div>
            <div className="flex items-center gap-3">
              <Headphones className="h-4 w-4 text-[color:var(--sage)]" strokeWidth={1.4} />
              Suporte por corredor
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────── SHOP THE COLLECTION */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--sage)]">
              / 01 · Coleção
            </div>
            <h2 className="font-display text-4xl tracking-wide md:text-5xl">
              Um sistema, quatro pilares
            </h2>
          </div>
          <Link
            to="/produtos"
            className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--graphite)]/70 hover:text-[color:var(--terracotta)] md:inline-flex"
          >
            Ver todos os produtos →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              to="/categoria/$slug"
              params={{ slug: c.slug }}
              className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-md border border-[color:var(--graphite)]/10 bg-[color:var(--graphite)]/[0.04] p-6 transition-all hover:border-[color:var(--graphite)] hover:bg-[color:var(--graphite)] hover:text-[color:var(--bone)]"
            >
              <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-[color:var(--sage)]">
                <span>0{i + 1}</span>
                <span>{PRODUCTS.filter((p) => p.category === c.slug).length} itens</span>
              </div>
              <div>
                <h3 className="font-display text-4xl tracking-wide">{c.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground group-hover:text-[color:var(--bone)]/70">
                  {c.description}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--terracotta)] transition-transform group-hover:translate-x-1">
                  Explorar <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────── SPOTLIGHT: FONE */}
      <section className="bg-[color:var(--graphite)] text-[color:var(--bone)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch lg:grid-cols-2">
          <div
            className="relative min-h-[420px] lg:min-h-[640px]"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(20,23,26,0.15), rgba(20,23,26,0.55)), url(${productImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute left-6 top-6 rounded-sm border border-[color:var(--bone)]/30 bg-[color:var(--graphite)]/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--bone)]/80 backdrop-blur">
              Destaque · Áudio
            </div>
            <div className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--bone)]/60">
              PAZE / BONE-01
            </div>
          </div>
          <div className="flex flex-col justify-center px-6 py-16 md:px-16 md:py-24">
            <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--sage)]">
              / 02 · Produto em destaque
            </div>
            <h2 className="font-display text-4xl leading-none tracking-wide md:text-6xl">
              {spotlight.shortName.toUpperCase()}
            </h2>
            <p className="mt-6 max-w-md text-lg text-[color:var(--bone)]/70">
              {spotlight.tagline}
            </p>
            <p className="mt-4 max-w-md text-sm text-[color:var(--bone)]/60">
              {spotlight.description}
            </p>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-[color:var(--bone)]/10 pt-8">
              {spotlight.specs.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--bone)]/50">
                    {s.label}
                  </dt>
                  <dd className="mt-1 font-display text-2xl text-[color:var(--sage)]">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/produto/$slug"
                params={{ slug: spotlight.slug }}
                className="inline-flex items-center gap-3 rounded-sm bg-[color:var(--terracotta)] px-7 py-4 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--bone)] hover:opacity-90"
              >
                Comprar por R$ {(spotlight.priceCents / 100).toFixed(0)}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--bone)]/50">
                {spotlight.installments.count}× sem juros
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────── PRODUCT GRID */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--sage)]">
              / 03 · Mais vendidos
            </div>
            <h2 className="font-display text-4xl tracking-wide md:text-5xl">
              Equipamento validado na rua
            </h2>
          </div>
          <Link
            to="/produtos"
            className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--graphite)]/70 hover:text-[color:var(--terracotta)] md:inline-flex"
          >
            Ver catálogo →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────── MANIFESTO */}
      <section
        className="relative overflow-hidden bg-[color:var(--graphite)] text-[color:var(--bone)]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(20,23,26,0.75), rgba(20,23,26,0.92)), url(${closingImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-28 md:grid-cols-12 md:px-8">
          <div className="md:col-span-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--sage)]">
              / 04 · Manifesto
            </div>
          </div>
          <div className="md:col-span-8">
            <p className="font-display text-3xl leading-tight tracking-wide md:text-5xl">
              A rua não é uma esteira. Ela tem carros, buzinas, ciclistas e
              pessoas. <span className="text-[color:var(--sage)]">Paze</span>{" "}
              existe para você treinar de olhos abertos — e ouvidos livres.
            </p>
            <p className="mt-8 max-w-2xl text-[color:var(--bone)]/60">
              Cada peça é projetada com corredores, ciclistas e triatletas
              brasileiros. Testamos em asfalto quente, chuva, longões noturnos e
              treinos de série. Se não sobreviveu à rua, não vira produto Paze.
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────── SOCIAL PROOF */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              q: "Nunca mais corri sem o fone. Ouço meu ritmo e o carro chegando na esquina.",
              a: "Marina R. · Pace 5:20 · São Paulo",
            },
            {
              q: "Uso a braçadeira LED nos longões antes do sol nascer. Faz uma diferença absurda.",
              a: "Rafael T. · Ultramaratonista · Curitiba",
            },
            {
              q: "Kit Segurança Urbana virou minha checklist obrigatória antes de sair pra pedalar.",
              a: "Camila S. · Ciclista · Rio de Janeiro",
            },
          ].map((t) => (
            <figure key={t.a} className="border-t border-[color:var(--graphite)]/20 pt-6">
              <blockquote className="font-display text-2xl leading-snug tracking-wide">
                “{t.q}”
              </blockquote>
              <figcaption className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {t.a}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </StoreLayout>
  );
}
