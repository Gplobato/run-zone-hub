// ─── Paze product catalog ────────────────────────────────────────────────
// Central source of truth. Every PDP, category page and cross-sell reads
// from here. Prices are in BRL cents to avoid float math.
// ─────────────────────────────────────────────────────────────────────────

import imgFone from "@/assets/products/fone-conducao-ossea.jpg";
import imgBrac from "@/assets/products/bracadeira-led.jpg";
import imgColete from "@/assets/products/colete-refletivo.jpg";
import imgFita from "@/assets/products/fita-anti-atrito.jpg";
import imgCase from "@/assets/products/case-bracadeira.jpg";
import imgCinto from "@/assets/products/cinto-corrida.jpg";
import imgKit from "@/assets/products/kit-seguranca-urbana.jpg";
import imgGarmin from "@/assets/products/garmin-forerunner-965.jpg";

export const PRODUCT_IMAGES: Record<string, string> = {
  "fone-conducao-ossea": imgFone,
  "bracadeira-led": imgBrac,
  "colete-refletivo": imgColete,
  "fita-anti-atrito": imgFita,
  "case-braçadeira": imgCase,
  "cinto-corrida": imgCinto,
  "kit-seguranca-urbana": imgKit,
  "garmin-forerunner-965": imgGarmin,
};


export type ProductCategory = "audio" | "seguranca" | "acessorios" | "kits";

export type ProductSpec = { label: string; value: string };

export type Product = {
  slug: string;
  name: string;
  shortName: string;
  category: ProductCategory;
  categoryLabel: string;
  tagline: string;
  description: string;
  longDescription: string;
  priceCents: number;
  compareAtCents?: number;
  installments: { count: number; valueCents: number };
  badge?: string;
  variants?: { key: string; label: string; options: string[]; soldOut?: string[] }[];
  specs: ProductSpec[];
  bullets: string[];
  faq: { q: string; a: string }[];
  crossSell: string[]; // slugs
  bundleOf?: string[]; // slugs (for kits)
  hero: { bg: string; accent: string }; // token colors for placeholder art
};

export const PRODUCTS: Product[] = [
  {
    slug: "fone-conducao-ossea",
    name: "Fone de Condução Óssea Paze",
    shortName: "Fone Paze",
    category: "audio",
    categoryLabel: "Áudio",
    tagline: "Ouça sua música sem deixar de ouvir o mundo.",
    description:
      "Tecnologia de condução óssea que transmite o som pelos ossos do crânio — seus ouvidos ficam livres para escutar o trânsito, outros corredores e o ambiente.",
    longDescription:
      "Projetado para quem treina em rua. O som contorna a orelha em vez de tampá-la: você escuta música, podcast ou GPS ao mesmo tempo em que percebe carros, buzinas e ciclistas se aproximando. Resistente ao suor e à chuva leve, com bateria para uma semana de treinos.",
    priceCents: 7990,
    installments: { count: 10, valueCents: 799 },
    variants: [{ key: "cor", label: "Cor", options: ["Grafite", "Osso"] }],
    specs: [
      { label: "Peso", value: "29 g" },
      { label: "Autonomia", value: "8 h" },
      { label: "Resistência", value: "IPX5" },
      { label: "Conectividade", value: "Bluetooth 5.3" },
      { label: "Carga rápida", value: "10 min = 1 h30" },
      { label: "Alcance", value: "10 m" },
    ],
    bullets: [
      "Ouvidos livres — segurança no trânsito urbano",
      "Não escorrega em treinos longos",
      "Chamadas com microfone com cancelamento de ruído",
      "Sincroniza com dois dispositivos simultaneamente",
    ],
    faq: [
      {
        q: "A qualidade do som é boa comparada a fones tradicionais?",
        a: "É diferente. O grave é mais sutil, mas voz, ritmo e clareza são excelentes — foi pensado para treino, não para audiófilo em ambiente silencioso.",
      },
      {
        q: "Funciona debaixo de chuva?",
        a: "Sim, com certificação IPX5. Suporta suor intenso e chuva. Não deve ser submerso.",
      },
      {
        q: "Usa óculos ou boné? Atrapalha?",
        a: "Não. O apoio é atrás da cabeça e as unidades ficam sobre a maçã do rosto, sem interferir com hastes de óculos ou aba de boné.",
      },
    ],
    crossSell: ["kit-seguranca-urbana", "bracadeira-led", "cinto-corrida"],
    hero: { bg: "graphite", accent: "sage" },
  },
  {
    slug: "bracadeira-led",
    name: "Braçadeira LED Recarregável",
    shortName: "Braçadeira LED",
    category: "seguranca",
    categoryLabel: "Segurança",
    tagline: "Seja visto antes de ser percebido.",
    description:
      "Braçadeira com LEDs de alta intensidade, visibilidade 360°, recarga USB-C. Para quem treina no fim da tarde, à noite ou de madrugada.",
    longDescription:
      "Feita para o corredor e ciclista urbano. A luz é vista de mais de 400 metros de distância — motoristas te enxergam com antecedência suficiente para desviar. Três modos: fixo, pulsante lento e SOS.",
    priceCents: 5900,
    installments: { count: 4, valueCents: 1475 },
    variants: [
      {
        key: "cor",
        label: "Cor",
        options: ["Verde", "Rosa", "Vermelho", "Azul", "Branco"],
        soldOut: ["Azul", "Branco"],
      },
    ],
    specs: [
      { label: "Autonomia", value: "12 h (modo fixo)" },
      { label: "Modos", value: "Fixo · Pulsante · SOS" },
      { label: "Recarga", value: "USB-C · 90 min" },
      { label: "Ajuste", value: "20 – 42 cm" },
      { label: "Peso", value: "38 g" },
      { label: "Alcance visual", value: "> 400 m" },
    ],
    bullets: [
      "Recarga USB-C — sem trocar pilha",
      "Visível a mais de 400 metros",
      "Fica no braço, tornozelo ou tirante da mochila",
      "Silicone macio, não irrita a pele",
    ],
    faq: [
      { q: "Quanto tempo dura a bateria?", a: "12h no modo fixo, até 30h no modo pulsante." },
      { q: "Pode usar na chuva?", a: "Sim, é resistente a respingos e chuva leve (IPX4)." },
    ],
    crossSell: ["colete-refletivo", "kit-seguranca-urbana", "fone-conducao-ossea"],
    hero: { bg: "sage", accent: "terracotta" },
  },
  {
    slug: "colete-refletivo",
    name: "Colete Refletivo Compacto",
    shortName: "Colete Refletivo",
    category: "seguranca",
    categoryLabel: "Segurança",
    tagline: "Alta visibilidade sem calor. Cabe no bolso.",
    description:
      "Colete leve e respirável, com faixas refletivas em 360°. Dobra do tamanho de uma carteira e cabe no cinto de corrida.",
    longDescription:
      "Pensado para quem sai antes do sol ou volta depois dele. Malha respirável, sem forro. Faixas de alta refletância cobrem frente, costas e laterais. Ajuste elástico, tamanho único que veste do PP ao GG.",
    priceCents: 7900,
    installments: { count: 4, valueCents: 1975 },
    specs: [
      { label: "Peso", value: "68 g" },
      { label: "Material", value: "Poliéster respirável" },
      { label: "Refletância", value: "ISO 20471 · 360°" },
      { label: "Ajuste", value: "Elástico · PP ao GG" },
      { label: "Compactação", value: "Cabe em bolso de corrida" },
    ],
    bullets: [
      "Vestir sobre camiseta, jaqueta ou pluma",
      "Não esquenta, não gera atrito",
      "Refletância certificada ISO 20471",
      "Dobra e cabe em qualquer cinto de corrida",
    ],
    faq: [
      { q: "Serve para andar de bike?", a: "Sim, corte solto que veste sobre jaqueta." },
      { q: "Precisa de bateria?", a: "Não. É refletivo — funciona com qualquer fonte de luz externa (farol, poste)." },
    ],
    crossSell: ["bracadeira-led", "kit-seguranca-urbana", "fone-conducao-ossea"],
    hero: { bg: "bone", accent: "sage" },
  },
  {
    slug: "fita-anti-atrito",
    name: "Fita Anti-Atrito Paze (kit com 2)",
    shortName: "Fita Anti-Atrito",
    category: "acessorios",
    categoryLabel: "Acessórios",
    tagline: "Fim das bolhas e assaduras em treinos longos.",
    description:
      "Fita adesiva hipoalergênica, à prova d'água, aplicada nos pontos de atrito antes do treino. Fica na pele por horas sem descolar.",
    longDescription:
      "Para longões, meia-maratona e maratona. Aplicada em mamilos, virilha, axilas ou qualquer ponto de atrito — protege a pele contra bolhas, assaduras e queimaduras de sal. Adesivo médico, não deixa resíduo.",
    priceCents: 3900,
    installments: { count: 3, valueCents: 1300 },
    specs: [
      { label: "Duração", value: "Até 12 h contínuas" },
      { label: "Material", value: "Adesivo médico hipoalergênico" },
      { label: "Resistência", value: "À prova d'água" },
      { label: "Conteúdo", value: "2 rolos" },
    ],
    bullets: [
      "Aguenta chuva, suor e transpiração intensa",
      "Hipoalergênica — não irrita a pele",
      "Removível sem dor e sem resíduo",
      "Cabe no cinto de corrida",
    ],
    faq: [
      { q: "Serve para meia-maratona?", a: "Sim. Aplicada corretamente, aguenta mais de 4 horas de treino." },
      { q: "Deixa marca ou resíduo na pele?", a: "Não. Sai com água morna e sabão neutro." },
    ],
    crossSell: ["cinto-corrida", "case-braçadeira", "fone-conducao-ossea"],
    hero: { bg: "bone", accent: "terracotta" },
  },
  {
    slug: "case-braçadeira",
    name: "Case Braçadeira Impermeável para Celular",
    shortName: "Case Braçadeira",
    category: "acessorios",
    categoryLabel: "Acessórios",
    tagline: "Seu celular no braço, protegido de suor e chuva.",
    description:
      "Braçadeira com case impermeável IPX4, tela sensível ao toque, compatível com celulares até 6,7''.",
    longDescription:
      "Silicone macio que não escorrega. Janela transparente permite operar a tela, atender chamadas e usar reconhecimento facial sem tirar o celular do case. Ajuste em 20–40 cm.",
    priceCents: 4900,
    installments: { count: 4, valueCents: 1225 },
    specs: [
      { label: "Compatibilidade", value: "Até 6,7\"" },
      { label: "Resistência", value: "IPX4" },
      { label: "Ajuste", value: "20 – 40 cm" },
      { label: "Peso", value: "72 g" },
      { label: "Material", value: "Silicone + neoprene" },
    ],
    bullets: [
      "Tela funciona pelo case — não precisa tirar o celular",
      "Face ID / reconhecimento funciona pela janela",
      "Não desce no braço nem balança",
      "Ajuste para braço fino ou grosso",
    ],
    faq: [
      { q: "Serve para o meu celular?", a: "Sim, se ele tem até 6,7'' de tela — cobre 99% dos modelos atuais." },
      { q: "Posso correr na chuva?", a: "Chuva leve sim (IPX4). Chuva forte, prefira o cinto de corrida." },
    ],
    crossSell: ["cinto-corrida", "fone-conducao-ossea", "bracadeira-led"],
    hero: { bg: "graphite", accent: "sage" },
  },
  {
    slug: "cinto-corrida",
    name: "Cinto de Corrida à Prova d'Água",
    shortName: "Cinto de Corrida",
    category: "acessorios",
    categoryLabel: "Acessórios",
    tagline: "Celular, chave e gel — sem balançar.",
    description:
      "Cinto elástico com 3 compartimentos impermeáveis. Fica firme na cintura, não pula durante a passada, não gera atrito.",
    longDescription:
      "Elastano de alta densidade que se molda ao corpo. Compartimento principal cabe qualquer smartphone. Compartimentos laterais para chave, cartão e géis energéticos. Costura selada resiste à chuva.",
    priceCents: 6900,
    installments: { count: 4, valueCents: 1725 },
    specs: [
      { label: "Compartimentos", value: "3 (1 grande, 2 laterais)" },
      { label: "Ajuste", value: "60 – 100 cm" },
      { label: "Material", value: "Elastano · costura selada" },
      { label: "Resistência", value: "À prova de chuva leve" },
      { label: "Peso", value: "52 g" },
    ],
    bullets: [
      "Não pula, não balança durante a corrida",
      "Cabe celular grande + chave + géis",
      "Não gera atrito na cintura",
      "Costura selada resiste à chuva",
    ],
    faq: [
      { q: "Cabe iPhone Pro Max?", a: "Sim, cabe qualquer smartphone atual, mesmo com capinha." },
      { q: "Serve para trilha?", a: "Sim, mas para trilhas longas com hidratação prefira mochila." },
    ],
    crossSell: ["fita-anti-atrito", "fone-conducao-ossea", "case-braçadeira"],
    hero: { bg: "sage", accent: "graphite" },
  },
  {
    slug: "kit-seguranca-urbana",
    name: "Kit Segurança Urbana Paze",
    shortName: "Kit Segurança Urbana",
    category: "kits",
    categoryLabel: "Kits",
    tagline: "Tudo que você precisa para treinar em qualquer horário.",
    description:
      "Fone de Condução Óssea + Braçadeira LED + Colete Refletivo. Você economiza R$ 58 comprando junto.",
    longDescription:
      "O kit resolve as três variáveis do treino urbano: ouvir o ambiente (fone), ser visto de longe (LED) e ser reconhecido em qualquer ângulo (colete). Compra única, para toda a estação.",
    priceCents: 42900,
    compareAtCents: 48700,
    installments: { count: 10, valueCents: 4290 },
    badge: "Mais vendido",
    bundleOf: ["fone-conducao-ossea", "bracadeira-led", "colete-refletivo"],
    specs: [
      { label: "Itens no kit", value: "3" },
      { label: "Economia", value: "R$ 58,00" },
      { label: "Peso total", value: "135 g" },
      { label: "Garantia", value: "12 meses" },
    ],
    bullets: [
      "Economia de R$ 58 vs. compra separada",
      "Cobre segurança visual + auditiva completa",
      "Ideal para treinos ao amanhecer, entardecer e à noite",
      "Frete grátis em todo o Brasil",
    ],
    faq: [
      { q: "Posso escolher a cor de cada item?", a: "Sim, você escolhe a cor do fone e da braçadeira no carrinho." },
      { q: "Vem em uma caixa única?", a: "Sim, embalagem única de presente — ótima opção para presentear um corredor." },
    ],
    crossSell: ["fita-anti-atrito", "cinto-corrida", "case-braçadeira"],
    hero: { bg: "graphite", accent: "terracotta" },
  },
  {
    slug: "garmin-forerunner-965",
    name: "Garmin Forerunner 965",
    shortName: "Forerunner 965",
    category: "acessorios",
    categoryLabel: "Acessórios",
    tagline: "Smartwatch premium de corrida e triatlo — tela AMOLED, GPS multibanda.",
    description:
      "Relógio esportivo com display AMOLED de 1,4\", GPS multibanda, mapas coloridos, Training Readiness, monitoramento avançado de treino, saúde e recuperação.",
    longDescription:
      "Idêntico ao original em funções e desempenho. Tela AMOLED sensível ao toque, moldura em titânio, GPS multibanda de alta precisão, mapas coloridos TopoActive pré-carregados, métricas de treino de nível profissional (Training Readiness, Training Status, VO₂ máx., carga aguda, recuperação), monitoramento cardíaco no pulso, oximetria (SpO₂), ECG, sono avançado, Body Battery, resistência a água 5 ATM, pagamentos Garmin Pay, música offline (Spotify, Deezer, Amazon Music), notificações inteligentes e bateria de até 23 dias em modo relógio.",
    priceCents: 7990,
    compareAtCents: 999900,
    installments: { count: 10, valueCents: 799 },
    badge: "Novo",
    variants: [
      { key: "cor", label: "Cor", options: ["Preto", "Branco"] },
    ],
    specs: [
      { label: "Display", value: "AMOLED 1,4\" · 454×454 px · touchscreen" },
      { label: "Moldura", value: "Titânio Grau 5" },
      { label: "GPS", value: "Multibanda (L1 + L5) · GPS/GLONASS/Galileo/QZSS/BeiDou" },
      { label: "Mapas", value: "TopoActive coloridos pré-carregados" },
      { label: "Resistência", value: "5 ATM (natação)" },
      { label: "Sensores", value: "Cardíaco óptico · SpO₂ · ECG · barômetro · bússola · giroscópio · termômetro" },
      { label: "Autonomia", value: "Até 23 dias (relógio) · 31 h (GPS todos os sistemas)" },
      { label: "Memória", value: "32 GB (música offline)" },
      { label: "Conectividade", value: "Bluetooth · ANT+ · Wi-Fi" },
      { label: "Peso", value: "53 g" },
      { label: "Pulseira", value: "Silicone QuickFit 22 mm" },
    ],
    bullets: [
      "Idêntico ao original — mesmas funções, mesmo desempenho",
      "Training Readiness, Training Status e VO₂ máx. em tempo real",
      "GPS multibanda de precisão profissional (L1 + L5)",
      "Mapas coloridos TopoActive com navegação turn-by-turn",
      "Música offline: Spotify, Deezer e Amazon Music",
      "Pagamentos por aproximação com Garmin Pay",
      "Monitoramento 24/7: cardíaco, SpO₂, ECG, sono, Body Battery",
      "Perfis para 30+ esportes: corrida, trilha, triatlo, ciclismo, natação, golfe, força",
      "Notificações de smartphone, ligações e respostas rápidas (Android)",
      "Bateria de até 23 dias em modo relógio",
    ],
    faq: [
      {
        q: "É idêntico ao original?",
        a: "Sim. Todas as funções, sensores, GPS multibanda, mapas, Training Readiness e integrações (Garmin Connect, Strava, Spotify) funcionam exatamente como no modelo de referência.",
      },
      {
        q: "Funciona com o app Garmin Connect e Strava?",
        a: "Sim, pareia normalmente com Garmin Connect e sincroniza treinos com Strava, TrainingPeaks e Apple Saúde.",
      },
      {
        q: "Posso nadar com ele?",
        a: "Sim, resistência 5 ATM. Perfil de natação em piscina e águas abertas incluído.",
      },
      {
        q: "Qual a duração real da bateria em treino?",
        a: "Até 23 dias em modo relógio, 31 h com GPS todos os sistemas ativos, 19 h com GPS multibanda + música.",
      },
    ],
    crossSell: ["fone-conducao-ossea", "cinto-corrida", "bracadeira-led"],
    hero: { bg: "graphite", accent: "sage" },
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productsByCategory(cat: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === cat);
}

export const CATEGORIES: { slug: ProductCategory; label: string; description: string }[] = [
  { slug: "seguranca", label: "Segurança", description: "Seja visto. Corra tranquilo." },
  { slug: "audio", label: "Áudio", description: "Ouça o mundo e sua música." },
  { slug: "acessorios", label: "Acessórios", description: "Detalhes que fazem o treino render." },
  { slug: "kits", label: "Kits", description: "Combinações prontas com economia." },
];

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
