import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import {
  Check,
  CircleAlert,
  Copy,
  CreditCard,
  Edit3,
  Search,
  ShoppingCart,
  MapPin,
  Heart,
  ChevronDown,
  Info,
  Loader2,
  Lock,
  Zap,
  ShieldCheck,
  Gift,
  Star,
  ThumbsUp,
  Clock3,
  ChevronRight,
  ZoomIn,
  X,
  Ruler,
  Ticket,
} from "lucide-react";
import { fbqTrack, fbqTrackSingle } from "@/lib/pixel";
import { createZedyCheckout } from "@/lib/zedy.functions";
import pazeLogo from "@/assets/paze-logo.png";
import mlLogo from "@/assets/mercadopromo/ml-logo.png";
import pixLogo from "@/assets/mercadopromo/pix-logo.png";
import payAmex from "@/assets/mercadopromo/pay-amex.png";
import payElo from "@/assets/mercadopromo/pay-elo.png";
import payVisa from "@/assets/mercadopromo/pay-visa.png";
import payMastercard from "@/assets/mercadopromo/pay-mastercard.png";
import payPix from "@/assets/mercadopromo/pay-pix.png";
import jacketMarromVideo from "@/assets/mercadopromo/jaqueta-marrom-video.mp4";
import boots1 from "@/assets/mercadopromo/boots-1.jpg";
import boots2 from "@/assets/mercadopromo/boots-2.jpg";
import boots3 from "@/assets/mercadopromo/boots-3.jpg";
import pants1 from "@/assets/mercadopromo/pants-1.jpg";
import pants2 from "@/assets/mercadopromo/pants-2.jpg";
import pants3 from "@/assets/mercadopromo/pants-3.jpg";
import review1 from "@/assets/mercadopromo/review-1.jpg";
import review2 from "@/assets/mercadopromo/review-2.jpg";
import review3 from "@/assets/mercadopromo/review-3.jpg";
import garminBlack from "@/assets/mercadopromo/garmin-product-black.jpg";
import garminWhite from "@/assets/mercadopromo/garmin-product-white.jpg";
import garminRef1 from "@/assets/mercadopromo/garmin-ref-1.jpg";
import garminRef2 from "@/assets/mercadopromo/garmin-ref-2.jpg";
import garminReviewA from "@/assets/mercadopromo/garmin-review-a.jpg";
import garminReviewB from "@/assets/mercadopromo/garmin-review-b.jpg";
import garminReviewC from "@/assets/mercadopromo/garmin-review-c.jpg";
import garminReviewD from "@/assets/mercadopromo/garmin-review-d.jpg";
import jaqmascMarrom1 from "@/assets/mercadopromo/jaqmasc-marrom-1.jpg";
import jaqmascMarrom2 from "@/assets/mercadopromo/jaqmasc-marrom-2.jpg";
import jaqmascBege from "@/assets/mercadopromo/jaqmasc-bege.jpg";
import jaqmascCinza from "@/assets/mercadopromo/jaqmasc-cinza.jpg";
import jaqmascPreto from "@/assets/mercadopromo/jaqmasc-preto.jpg";
import jaqmascReview1 from "@/assets/mercadopromo/jaqmasc-review-1.jpg";
import jaqmascReview2 from "@/assets/mercadopromo/jaqmasc-review-2.jpg";
import jaqmascReview3 from "@/assets/mercadopromo/jaqmasc-review-3.jpg";
import softRosa from "@/assets/mercadopromo/soft-rosa.png";
import softAmarelo from "@/assets/mercadopromo/soft-amarelo.png";
import softAzul from "@/assets/mercadopromo/soft-azul.png";
import softBranco from "@/assets/mercadopromo/soft-branco.png";
import softMarrom from "@/assets/mercadopromo/soft-marrom.png";
import softMarromClaro from "@/assets/mercadopromo/soft-marromclaro.png";
import bobojaco1 from "@/assets/mercadopromo/bobojaco-1.webp";
import bobojaco2 from "@/assets/mercadopromo/bobojaco-2.webp";
import bobojaco3 from "@/assets/mercadopromo/bobojaco-3.webp";
import bobojaco4 from "@/assets/mercadopromo/bobojaco-4.webp";
import bobojaco5 from "@/assets/mercadopromo/bobojaco-5.webp";
import bobojaco6 from "@/assets/mercadopromo/bobojaco-6.webp";
import bobojacoRev1 from "@/assets/mercadopromo/bobojaco-review-1.png";
import bobojacoRev2 from "@/assets/mercadopromo/bobojaco-review-2.png";
import bobojacoRev3 from "@/assets/mercadopromo/bobojaco-review-3.png";
import bobojacoRev4 from "@/assets/mercadopromo/bobojaco-review-4.png";
import bobojacoRev5 from "@/assets/mercadopromo/bobojaco-review-5.png";
import bobojacoRev6 from "@/assets/mercadopromo/bobojaco-review-6.png";
import bobojacoRev7 from "@/assets/mercadopromo/bobojaco-review-7.png";
import kitPanos1 from "@/assets/mercadopromo/kitpanos-1.jpeg";
import kitPanos2 from "@/assets/mercadopromo/kitpanos-2.jpeg";
import kitPanos3 from "@/assets/mercadopromo/kitpanos-3.jpeg";
import kitPanosVideo from "@/assets/mercadopromo/kitpanos-video.mp4";
import kitPanosReview1 from "@/assets/mercadopromo/kitpanos-review-1.webp";
import kitSandaliasReview1 from "@/assets/mercadopromo/kitsandalias-review-1.png";
import kitSandaliasReview2 from "@/assets/mercadopromo/kitsandalias-review-2.png";
import kitSandaliasReview3 from "@/assets/mercadopromo/kitsandalias-review-3.png";
import roboAspiradorRb from "@/assets/mercadopromo/robo-aspirador-rb.webp";
import roboAspirador1 from "@/assets/mercadopromo/robo-aspirador-1.jpg";
import roboAspirador2 from "@/assets/mercadopromo/robo-aspirador-2.jpg";
import roboAspirador3 from "@/assets/mercadopromo/robo-aspirador-3.jpg";
import bodyModeladorPose1 from "@/assets/mercadopromo/bodymodelador-pose1.png";
import bodyModeladorPose2 from "@/assets/mercadopromo/bodymodelador-pose2.png";
import bodyModeladorPose3 from "@/assets/mercadopromo/bodymodelador-pose3.png";
import bodyModeladorPose4 from "@/assets/mercadopromo/bodymodelador-pose4.png";
import bodyModeladorPose5 from "@/assets/mercadopromo/bodymodelador-pose5.png";
import bodyModeladorPose6 from "@/assets/mercadopromo/bodymodelador-pose6.png";
import bodyModelador3 from "@/assets/mercadopromo/bodymodelador-3.jpg";
import bodyModelador4 from "@/assets/mercadopromo/bodymodelador-4.jpg";
import bodyModeladorRev1 from "@/assets/mercadopromo/bodymodelador-review-1.png";
import bodyModeladorRev2 from "@/assets/mercadopromo/bodymodelador-review-2.png";
import kitjeans1 from "@/assets/mercadopromo/kitjeans-1.png";
import kitjeans2 from "@/assets/mercadopromo/kitjeans-2.jpg";
import kitjeans3 from "@/assets/mercadopromo/kitjeans-3.jpg";
import kitjeansReview1 from "@/assets/mercadopromo/kitjeans-review-1.jpg";

const pagarMeLogoUrl = "/logo.webp";

// -----------------------------------------------------------------------------
// /mercadopromo "” página standalone estilo Mercado Livre (produto único).
// Template baseado em modamolecapromos.lovable.app + PDP real do ML.
// Não usa StoreLayout da Paze pra ficar 100% isolado. Pixel continua ativo
// pelo __root.tsx global.
// -----------------------------------------------------------------------------

type GalleryMedia = {
  src: string;
  kind: "image" | "video";
};

type Product = {
  id: string;
  title: string;
  brand: string;
  seller: string;
  sold: string;
  rating: number;
  reviewsCount: number;
  price: number;
  compareAt: number | null;
  installments: { count: number; valueCents: number };
  categoryTrail: string[];
  colors: {
    key: string;
    label: string;
    thumb: string;
    gallery: GalleryMedia[];
  }[];
  sizes: string[];
  description?: {
    heading: string;
    intro: string[];
    steps: string[];
    benefits: { title: string; result: string; feeling: string }[];
    quotes: string[];
    specs: string[];
    tip: string;
    closing: string[];
    warranty: string;
  };
};

const MAIN_PRODUCT: Product = {
  id: "mercadopromo-jaqueta-courino",
  title: "Jaqueta Feminina Courino Slim",
  brand: "SKATHI",
  seller: "Skhati Wear",
  sold: "+5000 vendidos",
  rating: 5.0,
  reviewsCount: 131,
  price: 6990,
  compareAt: null,
  installments: { count: 6, valueCents: 1165 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Agasalhos", "Casacos e Jaquetas"],
  colors: [
    {
      key: "marrom",
      label: "Marrom",
      thumb: "https://http2.mlstatic.com/D_NQ_NP_2X_810204-MLB110339498152_052026-F.webp",
      gallery: [
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_810204-MLB110339498152_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_662783-MLB111271156807_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_683019-MLB111271096821_052026-F.webp", kind: "image" },
        { src: jacketMarromVideo, kind: "video" },
      ],
    },
    {
      key: "preto",
      label: "Branco",
      thumb: "https://http2.mlstatic.com/D_NQ_NP_2X_866958-MLB111273807557_052026-F.webp",
      gallery: [
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_866958-MLB111273807557_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_698571-MLB111273241677_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_789158-MLB111273927385_052026-F.webp", kind: "image" },
      ],
    },
    {
      key: "bege",
      label: "Preto",
      thumb: "https://http2.mlstatic.com/D_NQ_NP_2X_958620-MLB110339498344_052026-F.webp",
      gallery: [
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_958620-MLB110339498344_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_695488-MLB111273241551_052026-F.webp", kind: "image" },
        { src: "https://http2.mlstatic.com/D_NQ_NP_2X_992725-MLB110339498342_052026-F.webp", kind: "image" },
      ],
    },
  ],
  sizes: ["P", "M", "G", "GG"],
  description: {
    heading: "Jaqueta Feminina Couro Sintético Forrada Luxo Rock",
    intro: [
      "Você já olhou pro seu guarda-roupa e sentiu que faltava aquela peça que transforma qualquer look? Aquela que você coloca e já sai de casa diferente — com mais atitude, mais presença, mais você.",
      "A maioria das jaquetas ou custa caro demais, ou chega e decepciona: material fino, sem forro, sem caimento. Você compra animada e na hora de usar... não é bem o que esperava.",
      "E o pior? Aquela sensação de que seu look está apagado enquanto outras mulheres chegam em algum lugar e param o ambiente só pela peça que escolheram usar. Você merece se sentir assim. Toda vez que sair.",
      'A gente entende essa frustração — e foi exatamente por isso que essa jaqueta foi desenvolvida. Com mais de 5 estrelas em dezenas de avaliações reais e clientes que afirmam "parece que paguei o triplo em loja cara — ninguém acreditou que comprei no Mercado Livre", ela entrega o que promete: estilo de boutique com preço acessível.',
    ],
    steps: [
      "Escolha seu tamanho pela tabela de medidas (dica: se quiser um caimento mais folgado, suba um número)",
      "Receba em casa com frete rápido e compra 100% protegida",
      "Vista e sinta a diferença — no espelho e nos elogios que vão chegar",
    ],
    benefits: [
      {
        title: "Material sintético macio e resistente",
        result: "Aparência de couro legítimo sem pagar por isso",
        feeling: "Você parece ter gastado muito mais do que gastou",
      },
      {
        title: "Forro interno completo",
        result: "Conforto real por dentro, estilo real por fora",
        feeling: "Sem aquela sensação de peça barata que incomoda na pele",
      },
      {
        title: "Modelagem ajustada que valoriza o corpo",
        result: "Caimento feminino que abraça na medida certa",
        feeling: "Você se sente poderosa desde o momento em que veste",
      },
      {
        title: "Detalhes de costura nas mangas estilo moto",
        result: "Design urbano com personalidade",
        feeling: 'A jaqueta que as pessoas perguntam "onde você comprou?"',
      },
      {
        title: "Zíper frontal + bolsos laterais funcionais",
        result: "Praticidade sem abrir mão do estilo",
        feeling: "Sai para qualquer programa sem precisar trocar de roupa",
      },
      {
        title: "Peça atemporal — combina com tudo",
        result: "Jeans, vestido, saia, legging",
        feeling: "Um investimento que você vai usar por anos, não por uma temporada",
      },
    ],
    quotes: [
      "Linda, adorei — parece que paguei o triplo em loja cara. Ninguém acreditou que comprei no Mercado Livre.",
      "Minha esposa adorou. Caimento perfeito e tamanho preciso com a numeração. A qualidade do material também é muito boa.",
      "Muito incrível essa jaqueta — confortável e de ótima qualidade.",
    ],
    specs: [
      "Material: Couro sintético (PU) — macio, resistente e fácil de limpar",
      "Forro: Interno completo — conforto e acabamento premium",
      "Fechamento: Zíper frontal",
      "Detalhes: Costura decorativa nas mangas + bolsos laterais com zíper",
      "Gola: Padre (sem lapela) — estilo moto/rock feminino",
      "Cores disponíveis: Preto",
      "Tamanhos: P ao GG (consulte a tabela de medidas na publicação)",
      "Cuidados: Lavar à mão ou a seco — não torcer",
    ],
    tip: "Se você tem estatura acima de 1,70m ou prefere manga no comprimento exato, considere subir um tamanho. Se é mais baixinha e quer caimento justo, siga a tabela normalmente.",
    closing: [
      "Compra 100% protegida pelo Mercado Livre. Não ficou do jeito que esperava? A política de devolução garante sua tranquilidade — você não corre risco nenhum.",
      "Compre com a confiança de quem já viu centenas de mulheres satisfeitas com essa mesma escolha.",
      "Adicione ao carrinho agora e receba a jaqueta que vai transformar seu guarda-roupa — e a forma como você se sente ao sair de casa. Seu estilo está esperando por essa peça.",
    ],
    warranty: "30 dias",
  },
};

const BOOT_PRODUCT: Product = {
  id: "mercadopromo-bota-montaria",
  title: "Montaria Feminina Cano Longo Coturno Cadarço Atrás",
  brand: "SKATHI",
  seller: "Skhati Wear",
  sold: "+300 vendidos",
  rating: 4.9,
  reviewsCount: 12,
  price: 4990,
  compareAt: null,
  installments: { count: 6, valueCents: 832 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Calçados", "Botas"],
  colors: [
    {
      key: "preto",
      label: "Preto",
      thumb: boots1,
      gallery: [
        { src: boots1, kind: "image" },
        { src: boots2, kind: "image" },
        { src: boots3, kind: "image" },
      ],
    },
  ],
  sizes: ["33", "34", "35", "36", "37", "38", "39", "40"],
  description: {
    heading: "Montaria Feminina Cano Longo Coturno Cadarço Atrás",
    intro: [
      "Bota montaria cano médio com sintético hidratado e solado de borracha, finalizada com costura em linha turca para elevar a durabilidade sem abrir mão do conforto.",
      "O conjunto entrega presença visual, estrutura firme e uso agradável no dia a dia. É o tipo de bota que deixa o look mais elegante e ainda transmite segurança ao caminhar.",
      "O zíper lateral facilita o calce e o sistema de respiração ajuda a controlar a temperatura interna, deixando a experiência mais confortável por mais tempo.",
    ],
    steps: [
      "Escolha o número usando a medida da palmilha",
      "Calce com praticidade pelo zíper lateral",
      "Use com jeans, legging, vestido ou sobreposição de inverno para um visual marcante",
    ],
    benefits: [
      {
        title: "Sintético hidratado",
        result: "Visual elegante com toque mais encorpado e boa resistência",
        feeling: "A peça transmite mais presença logo no primeiro uso",
      },
      {
        title: "Solado de borracha",
        result: "Passada mais estável e segura",
        feeling: "Mais confiança para caminhar bem em diferentes rotinas",
      },
      {
        title: "Costura com linha turca",
        result: "Estrutura reforçada com durabilidade superior",
        feeling: "Você leva uma bota feita para acompanhar muitos usos",
      },
      {
        title: "Zíper lateral com sistema de respiração",
        result: "Calce fácil e melhor controle térmico interno",
        feeling: "Conforto prolongado sem sacrificar a elegância",
      },
    ],
    quotes: [
      "Visual elegante, firme no pé e muito confortável para usar por horas.",
      "O acabamento chama atenção e a bota veste super bem na perna.",
      "Combina com tudo e passa sensação de produto premium.",
    ],
    specs: [
      "Material: Sintético",
      "Solado: Borracha",
      "Forro: Têxtil",
      "Numeração: do 33 ao 40",
      "Palmilha 33: 24 cm",
      "Palmilha 34: 24,5 cm",
      "Palmilha 35: 25 cm",
      "Palmilha 36: 25,5 cm",
      "Palmilha 37: 26 cm",
      "Palmilha 38: 26,5 cm",
      "Palmilha 39: 27 cm",
      "Palmilha 40: 27,5 cm",
      "Altura do cano 33: 35,0 cm",
      "Altura do cano 34: 35,5 cm",
      "Altura do cano 35: 36,0 cm",
      "Altura do cano 36: 37,0 cm",
      "Altura do cano 37: 37,5 cm",
      "Altura do cano 38: 38,0 cm",
      "Altura do cano 39: 38,5 cm",
      "Altura do cano 40: 39,0 cm",
      "Circunferência da panturrilha 33: 28,0 cm",
      "Circunferência da panturrilha 34: 28,5 cm",
      "Circunferência da panturrilha 35: 29,0 cm",
      "Circunferência da panturrilha 36: 29,5 cm",
      "Circunferência da panturrilha 37: 30,0 cm",
      "Circunferência da panturrilha 38: 30,5 cm",
      "Circunferência da panturrilha 39: 31,0 cm",
      "Circunferência da panturrilha 40: 31,5 cm",
    ],
    tip: "Se estiver entre dois números, priorize a medida da palmilha e confira também a circunferência da panturrilha para um encaixe mais confortável.",
    closing: [
      "É uma montaria pensada para unir elegância, conforto e resistência em uma só peça.",
      "Perfeita para quem quer se sentir exclusiva, bem vestida e segura em cada passo.",
    ],
    warranty: "30 dias",
  },
};

const PANTS_PRODUCT: Product = {
  id: "mercadopromo-calca-hiperlipo",
  title: "Calça Hiperlipo Modeladora Chapa Barriga Suplex e Poliam Leg",
  brand: "SKATHI",
  seller: "Skhati Wear",
  sold: "+500 vendidos",
  rating: 4.8,
  reviewsCount: 21,
  price: 5990,
  compareAt: null,
  installments: { count: 6, valueCents: 998 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Roupas", "Calças"],
  colors: [
    {
      key: "preto",
      label: "Preto",
      thumb: pants1,
      gallery: [
        { src: pants1, kind: "image" },
        { src: pants2, kind: "image" },
        { src: pants3, kind: "image" },
      ],
    },
  ],
  sizes: ["P", "M", "G", "GG"],
};

const JAQMASC_PRODUCT: Product = {
  id: "mercadopromo-jaqueta-termica-masc",
  title: "Jaqueta Térmica Masculina Premium Suede Forro Peluciado",
  brand: "SKATHI",
  seller: "Skhati Wear",
  sold: "+5 mil vendidos",
  rating: 5.0,
  reviewsCount: 3,
  price: 7990,
  compareAt: null,
  installments: { count: 6, valueCents: 1332 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Agasalhos", "Casacos e Jaquetas"],
  colors: [
    {
      key: "marrom",
      label: "Marrom",
      thumb: jaqmascMarrom1,
      gallery: [
        { src: jaqmascMarrom1, kind: "image" },
        { src: jaqmascMarrom2, kind: "image" },
      ],
    },
    {
      key: "bege",
      label: "Bege",
      thumb: jaqmascBege,
      gallery: [{ src: jaqmascBege, kind: "image" }],
    },
    {
      key: "cinza",
      label: "Cinza",
      thumb: jaqmascCinza,
      gallery: [{ src: jaqmascCinza, kind: "image" }],
    },
    {
      key: "preto",
      label: "Preto",
      thumb: jaqmascPreto,
      gallery: [{ src: jaqmascPreto, kind: "image" }],
    },
  ],
  sizes: ["P", "M", "G", "GG", "EXG"],
  description: {
    heading: "Jaqueta Térmica Premium: Estilo Robusto e Conforto Absoluto",
    intro: [
      "Enfrente o inverno com a combinação ideal de elegância e funcionalidade. Nossa jaqueta foi projetada para o homem que busca um visual imponente sem abrir mão do bem-estar.",
      "Com um acabamento externo em textura que remete ao suede/camurça, ela oferece um toque sofisticado e durabilidade real — pra durar temporadas, não semanas.",
    ],
    steps: [
      "Escolha seu tamanho pela tabela de medidas (dica: se quiser caimento mais folgado, suba um número).",
      "Receba em casa com frete rápido e compra 100% protegida pelo Mercado Livre.",
      "Vista e sinta o forro peluciado abraçar — estilo por fora, conforto absoluto por dentro.",
    ],
    benefits: [
      {
        title: "Máximo isolamento térmico",
        result: "Todo o interior revestido com forro peluciado ultra macio.",
        feeling: "Aquecido mesmo nas temperaturas mais baixas, sem peso extra.",
      },
      {
        title: "Design sofisticado",
        result: "Detalhes acolchoados nos ombros dão ar moderno e levemente esportivo.",
        feeling: "Visual imponente que combina com jeans, calça social ou moletom.",
      },
      {
        title: "Funcionalidade inteligente",
        result: "Bolso interno prático e discreto para documentos ou celular.",
        feeling: "Sai de casa com tudo no lugar e as mãos livres.",
      },
      {
        title: "Fechamento de alta qualidade",
        result: "Zíper robusto e eficiente, projetado para durar e facilitar o dia a dia.",
        feeling: "Sem travamento, sem desgaste rápido — feito para uso diário.",
      },
      {
        title: "Gola padre com botão",
        result: "Proteção extra para o pescoço e um toque final de estilo.",
        feeling: "Vento cortante do inverno bloqueado, visual limpo mantido.",
      },
    ],
    quotes: [
      "“Chegou rápido, o suede parece de loja cara. Forro peluciado é MUITO quente.” — comprador verificado",
      "“Uso quase todo dia. Caimento perfeito no M e o zíper é firme.” — comprador verificado",
      "“Comprei o marrom e o preto. Nota 10, recomendo demais.” — comprador verificado",
    ],
    specs: [
      "Material externo: textura tipo suede/camurça",
      "Forro: peluciado interno completo",
      "Fechamento: zíper frontal robusto",
      "Gola: padre com botão",
      "Detalhes: ombros acolchoados + bolso interno discreto",
      "Cores: marrom, bege, cinza e preto",
      "Tamanhos: P ao EXG (consulte a tabela de medidas)",
      "Cuidados: lavar à mão ou a seco — não torcer",
    ],
    tip: "Combine com jeans escuro e botas de couro para um visual clássico de inverno, ou com camiseta branca básica para um look casual e despojado.",
    closing: [
      "Compra 100% protegida pelo Mercado Livre. Não ficou como esperava? A política de devolução garante sua tranquilidade.",
      "Adicione ao carrinho agora e leve a jaqueta que combina estilo robusto com conforto absoluto — enquanto durar o estoque promocional.",
    ],
    warranty: "30 dias",
  },
};

const GARMIN_PRODUCT: Product = {
  id: "mercadopromo-garmin-forerunner-965",
  title: "Garmin Forerunner 965 Amoled 47mm Touchscreen",
  brand: "GARMIN",
  seller: "Skhati Wear",
  sold: "+150 vendidos",
  rating: 4.9,
  reviewsCount: 4,
  price: 7990,
  compareAt: 12800,
  installments: { count: 10, valueCents: 799 },
  categoryTrail: ["Esportes e Fitness", "Corrida", "Relógios GPS"],
  colors: [
    {
      key: "preto",
      label: "Preto",
      thumb: garminBlack,
      gallery: [
        { src: garminBlack, kind: "image" },
        { src: garminRef1, kind: "image" },
        { src: garminRef2, kind: "image" },
        { src: garminWhite, kind: "image" },
      ],
    },
    {
      key: "branco",
      label: "Branco",
      thumb: garminWhite,
      gallery: [
        { src: garminWhite, kind: "image" },
        { src: garminBlack, kind: "image" },
      ],
    },
  ],
  sizes: ["Único"],
  description: {
    heading: "Garmin Forerunner 965 · corra, treine e monitore sem depender do celular",
    intro: [
      "Você já saiu pra correr e sentiu que o celular no braço atrapalha mais do que ajuda? Ou terminou o treino sem saber ao certo seu ritmo, VO₂ máx. ou tempo de recuperação?",
      "O Forerunner 965 é o relógio esportivo topo de linha da Garmin: tela AMOLED de 1,4”, caixa de 47 mm em titânio, GPS multibanda e todas as métricas avançadas de corrida, ciclismo e triatlo no seu pulso.",
    ],
    steps: [
      "Coloque no pulso e sincronize com o Garmin Connect em menos de 2 minutos.",
      "Escolha o esporte (corrida, trilha, bike, natação, força) e o GPS trava em segundos.",
      "Ao final do treino, veja ritmo, FC, VO₂ máx., tempo de recuperação e sugestão do próximo treino.",
    ],
    benefits: [
      {
        title: "Tela AMOLED sempre visível",
        result: "1,4” com toque, brilho automático e visibilidade perfeita ao sol.",
        feeling: "Você lê o ritmo num relance, sem tirar o foco da passada.",
      },
      {
        title: "GPS multibanda de precisão",
        result: "Distância, ritmo e traçado corretos mesmo em cidade densa ou trilha.",
        feeling: "Confiança total nos seus tempos e recordes pessoais.",
      },
      {
        title: "Bateria de até 23 dias",
        result: "Até 31h em GPS contínuo. Você treina a semana toda sem carregar.",
        feeling: "Menos preocupação com tomada, mais foco no treino.",
      },
      {
        title: "Treinos guiados + Garmin Coach",
        result: "Planos de 5k, 10k, meia e maratona ajustados ao seu condicionamento.",
        feeling: "Sensação de ter um treinador no pulso todo dia.",
      },
    ],
    quotes: [
      "“Migrei do celular pro Garmin e nunca mais voltei. Ritmo, FC e trajeto batendo certinho.” — corredor de 10k",
      "“A tela AMOLED é outro nível. Leio no sol forte sem esforço.” — triatleta amadora",
    ],
    specs: [
      "Tela AMOLED 1,4” touchscreen, vidro Corning Gorilla",
      "Caixa 47 mm em titânio, pulseira de silicone",
      "GPS multibanda (L1 + L5), GLONASS, Galileo",
      "Monitor cardíaco no pulso + oxímetro (SpO₂)",
      "VO₂ máx., tempo de recuperação, treinos sugeridos",
      "Bateria: até 23 dias smartwatch / 31h GPS contínuo",
      "Resistência à água 5 ATM",
      "Pagamentos por aproximação (Garmin Pay)",
      "Notificações do celular e controle de música",
    ],
    tip: "Combine com o app Garmin Connect no celular para acompanhar histórico, gráficos e desafios semanais.",
    closing: [
      "O Forerunner 965 normalmente custa R$ 3.000+ nas lojas oficiais. Nessa promoção especial, você garante por uma fração do preço — enquanto durar o estoque.",
      "Compra 100% protegida pelo Mercado Livre. Não gostou? Devolução garantida.",
      "Adicione ao carrinho agora e leve pro pulso o relógio que vai mudar seus treinos.",
    ],
    warranty: "Garantia do vendedor: 30 dias",
  },
};

const SOFT_PRODUCT: Product = {
  id: "mercadopromo-conjunto-soft-teddy",
  title: "Conjunto Soft Premium Teddy Camel Feminino Blusa e Calça Peluciado",
  brand: "SANDY ESTILO",
  seller: "Skhati Wear",
  sold: "+8 mil vendidos",
  rating: 4.9,
  reviewsCount: 3451,
  price: 7990,
  compareAt: 11999,
  installments: { count: 12, valueCents: 666 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Roupas", "Conjuntos"],
  colors: [
    { key: "rosa", label: "Rosa", thumb: softRosa, gallery: [{ src: softRosa, kind: "image" }] },
    { key: "amarelo", label: "Amarelo", thumb: softAmarelo, gallery: [{ src: softAmarelo, kind: "image" }] },
    { key: "azul", label: "Azul", thumb: softAzul, gallery: [{ src: softAzul, kind: "image" }] },
    { key: "branco", label: "Branco", thumb: softBranco, gallery: [{ src: softBranco, kind: "image" }] },
    { key: "marrom", label: "Marrom", thumb: softMarrom, gallery: [{ src: softMarrom, kind: "image" }] },
    { key: "marrom-claro", label: "Marrom Claro", thumb: softMarromClaro, gallery: [{ src: softMarromClaro, kind: "image" }] },
  ],
  sizes: ["PP", "P", "M", "G", "GG", "G2", "G3"],
  description: {
    heading: "Conjunto Soft Premium Teddy — conforto peluciado pros dias frios",
    intro: [],
    steps: [],
    benefits: [
      { title: "Tecido peluciado premium", result: "Soft Teddy ultra macio, toque aveludado que não pinica.", feeling: "" },
      { title: "Blusa com capuz e bolso canguru", result: "Proteção extra e praticidade no dia a dia.", feeling: "" },
      { title: "Calça com cós elástico", result: "Ajuste confortável sem apertar a cintura.", feeling: "" },
      { title: "Punhos e barra reforçados", result: "Acabamento firme, durabilidade acima da média.", feeling: "" },
      { title: "Modelagem versátil", result: "Caimento moderno, veste bem sem apertar.", feeling: "" },
      { title: "Lavagem fácil", result: "Alta durabilidade e secagem rápida.", feeling: "" },
    ],
    quotes: [],
    specs: [
      "Composição: Soft Teddy Premium (peluciado)",
      "Peças: blusa com capuz + bolso canguru + calça com cós elástico",
      "Indicação: homewear, pijama de inverno, viagens, dias frios",
      "Tamanhos: PP ao G3 (consulte tabela de medidas)",
      "Cores: Rosa, Amarelo, Azul, Branco, Marrom e Marrom Claro",
      "Cuidados: lavar à mão ou máquina em ciclo delicado — não usar alvejante",
    ],
    tip: "Se prefere caimento oversized (bem folgado), suba um tamanho na tabela.",
    closing: [],
    warranty: "30 dias",
  },
};

const BOBOJACO_PRODUCT: Product = {
  id: "mercadopromo-jaqueta-bobojaco-puffer",
  title: "Jaqueta Unissex Bobojaco Puffer com Capuz Nylon Impermeável",
  brand: "SKATHI",
  seller: "Skhati Wear",
  sold: "+5 mil vendidos",
  rating: 4.9,
  reviewsCount: 1284,
  price: 5800,
  compareAt: 14990,
  installments: { count: 6, valueCents: 967 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Agasalhos", "Casacos e Jaquetas"],
  colors: [
    {
      key: "preto",
      label: "Preto",
      thumb: bobojaco1,
      gallery: [
        { src: bobojaco1, kind: "image" },
        { src: bobojaco2, kind: "image" },
        { src: bobojaco3, kind: "image" },
        { src: bobojaco4, kind: "image" },
        { src: bobojaco5, kind: "image" },
        { src: bobojaco6, kind: "image" },
      ],
    },
  ],
  sizes: ["P", "M", "G", "GG", "XGG"],
  description: {
    heading: "Jaqueta Unissex Bobojaco Puffer com Capuz",
    intro: [
      "Conforto, proteção e estilo para os dias frios.",
      "Nossa Jaqueta Bobojaco Puffer é confeccionada em nylon resistente, leve e confortável. Possui forro interno que ajuda a manter o corpo aquecido, além de oferecer proteção contra vento e chuva leve.",
      "Modelo unissex, indicado para homens e mulheres, disponível em diversos tamanhos.",
    ],
    steps: [
      "Escolha o tamanho na tabela de medidas (o tamanho selecionado fica registrado no seu pedido).",
      "Confira antes de finalizar — mesmo que o tamanho não apareça novamente no checkout, enviaremos exatamente o que você escolheu.",
      "Receba em casa com envio rápido e nota fiscal.",
    ],
    benefits: [
      { title: "Modelo unissex", result: "Estilo bobojaco/puffer que veste bem homens e mulheres.", feeling: "Uma peça que serve pra toda a família." },
      { title: "Nylon resistente e leve", result: "Tecido externo em nylon com ótima durabilidade.", feeling: "Aquece sem pesar no corpo." },
      { title: "Proteção contra vento e chuva leve", result: "Barreira contra o frio cortante do inverno.", feeling: "Segurança pra sair mesmo em dias instáveis." },
      { title: "Forro interno para aquecimento", result: "Revestimento em poliéster que retém o calor do corpo.", feeling: "Conforto térmico do primeiro ao último minuto." },
      { title: "Capuz para maior proteção", result: "Cobre a cabeça em dias de vento ou garoa.", feeling: "Praticidade sem precisar de gorro." },
      { title: "Zíper frontal + punhos com elástico", result: "Fechamento firme e vedação nos pulsos.", feeling: "Nenhum vento passa por dentro." },
      { title: "Bolsos internos e externos", result: "Espaço pra celular, carteira, chaves e documentos.", feeling: "Sai de casa com tudo à mão." },
    ],
    quotes: [
      "“Muito leve e quente ao mesmo tempo. Uso na moto e o vento não passa.” — comprador verificado",
      "“Puffer excelente pelo preço. Nylon parece de marca cara.” — comprador verificado",
      "“Comprei pra viajar pro sul e me salvou. Capuz removível é ótimo.” — comprador verificado",
    ],
    specs: [
      "Material externo: nylon",
      "Revestimento interno: poliéster",
      "Fechamento: zíper frontal",
      "Punhos: elástico",
      "Capuz: sim, para maior proteção",
      "Bolsos: internos e externos",
      "Gênero: unissex (homens e mulheres)",
      "Tipo: casaco de inverno puffer/bobojaco",
      "Tamanhos disponíveis: P · M · G · GG · XGG/EXGG · G3 · G4",
      "Indicação: trabalho, passeios, viagens, motociclistas, caminhadas, uso diário — dias frios, com vento ou chuva leve",
      "Medidas P: manga 64 cm · comprimento 64 cm · cintura 100 cm",
      "Medidas M: manga 64 cm · comprimento 66 cm · cintura 104 cm",
      "Medidas G: manga 65 cm · comprimento 68 cm · cintura 108 cm",
      "Medidas GG: manga 65 cm · comprimento 70 cm · cintura 112 cm",
      "Medidas XGG/EXGG: manga 67 cm · comprimento 73 cm · cintura 118 cm",
      "Medidas G3: manga 68 cm · comprimento 75 cm · cintura 124 cm",
      "Medidas G4: manga 69 cm · comprimento 77 cm · cintura 130 cm",
    ],
    tip: "ATENÇÃO SOBRE O TAMANHO: o tamanho selecionado na página fica registrado no seu pedido. Mesmo que ele não apareça novamente no checkout, enviaremos exatamente o tamanho escolhido antes da compra. Confira antes de finalizar. As medidas podem apresentar pequenas variações — compare com uma jaqueta que você já utiliza.",
    closing: [
      "Envio rápido: produto à pronta entrega. Pedidos confirmados até as 13h podem ser enviados no mesmo dia útil, conforme disponibilidade da transportadora. Enviado com nota fiscal.",
      "Garantia de qualidade: acabamento excelente, material selecionado — confortável, resistente e pronto pra acompanhar seus dias de frio.",
      "Compra 100% protegida pelas políticas do Mercado Livre. Adicione ao carrinho enquanto durar o estoque promocional.",
    ],
    warranty: "30 dias (Mercado Livre)",
  },
};

const KIT_SANDALIAS_PIXEL_ID = "1577403850715282";
const ROBOASPIRADOR_PIXEL_ID = "2202849697230187";
const JAQUETAFEM_PIXEL_ID = "1108161594900025";

function trackProductEvent(
  product: Product,
  event: string,
  params?: Record<string, unknown>,
) {
  if (product.id === "mercadopromo-jaqueta-courino" || product.id === "mercadopromo-body-modelador") {
    fbqTrackSingle(JAQUETAFEM_PIXEL_ID, event, params);
    return;
  }
  if (product.id === "mercadopromo-kit-jeans") {
    fbqTrackSingle("2044710949498678", event, params);
    return;
  }
  if (product.id === "mercadopromo-robo-aspirador") {
    const isAspirador = typeof window !== 'undefined' && window.location.pathname.startsWith('/aspirador');
    if (isAspirador) {
      fbqTrackSingle("1601719418324869", event, params);
    } else {
      fbqTrackSingle(ROBOASPIRADOR_PIXEL_ID, event, params);
    }
    return;
  }
  if (product.id === "mercadopromo-kit-sandalias") {
    fbqTrackSingle(KIT_SANDALIAS_PIXEL_ID, event, params);
    return;
  }
  fbqTrack(event, params);
}

const KIT_PANOS_PRODUCT: Product = {
  id: "mercadopromo-kit-panos",
  title: "Pano de Prato Atoalhado 70x50 cm em Algodão – Alta Absorção e Durabilidade",
  brand: "Mercado Livre",
  seller: "Casa Prime",
  sold: "+2 mil vendidos",
  rating: 4.9,
  reviewsCount: 87,
  price: 3990,
  compareAt: 7990,
  installments: { count: 6, valueCents: 665 },
  categoryTrail: ["Casa, Móveis e Decoração", "Cozinha", "Panos de Prato"],
  colors: [
    {
      key: "kit-estampado",
      label: "Kit estampado",
      thumb: kitPanos1,
      gallery: [
        { src: kitPanos1, kind: "image" },
        { src: kitPanos2, kind: "image" },
        { src: kitPanos3, kind: "image" },
        { src: kitPanosVideo, kind: "video" },
      ],
    },
  ],
  sizes: [],
  description: {
    heading: "Kit 10x Pano de Prato Atoalhado 70x50 cm em Algodão",
    intro: [
      "Pano de prato atoalhado confeccionado em tecido 100% algodão, macio, resistente e com excelente poder de absorção.",
      "Ideal para secar louças, utensílios e manter a cozinha sempre limpa e organizada, sem deixar pelos nas peças.",
      "Kit perfeito para uso doméstico, cozinha profissional ou revenda, com estampas variadas e acabamento resistente para o dia a dia.",
    ],
    steps: [
      "Receba um kit com 10 panos atoalhados sortidos.",
      "Use para secar louças, copos, talheres e bancadas com absorção rápida.",
      "Lave normalmente e reutilize por muito mais tempo.",
    ],
    benefits: [
      {
        title: "100% algodão atoalhado",
        result: "Mais absorção no uso diário",
        feeling: "Louça seca mais rápido, cozinha mais prática.",
      },
      {
        title: "Tamanho 70 x 50 cm",
        result: "Medida versátil para louças e utensílios",
        feeling: "Não fica pequeno demais nem atrapalha no manuseio.",
      },
      {
        title: "Kit com 10 unidades",
        result: "Mais custo-benefício para casa ou revenda",
        feeling: "Você sempre tem pano limpo disponível.",
      },
    ],
    quotes: [
      "Parece toalha de rosto. Seca super bem e são super bonitos. Amei.",
      "O acabamento das peças é excelente e não deixa pelo nas louças.",
      "Pano bom. Gostei.",
    ],
    specs: [
      "Quantidade: kit com 10 panos de prato",
      "Tamanho: 70 x 50 cm",
      "Material: 100% algodão",
      "Tecido: atoalhado de alta absorção",
      "Toque: macio, resistente e durável",
      "Lavagem: fácil de lavar e de secagem rápida",
      "Uso indicado: doméstico, profissional ou revenda",
    ],
    tip: "As estampas podem variar conforme disponibilidade do lote, mantendo sempre o mesmo padrão de qualidade e absorção.",
    closing: [
      "Produto de ótima qualidade, perfeito para o dia a dia e também uma excelente opção para revenda.",
      "Adicione ao carrinho agora e receba um kit completo para deixar sua cozinha mais prática, limpa e organizada.",
    ],
    warranty: "30 dias (Mercado Livre)",
  },
};

// Slug -> índice em PRODUCTS. Usado para URLs de anúncio: /mercadopromo?p=<slug>
const KIT_SANDALIAS_PRODUCT: Product = {
  id: "mercadopromo-kit-sandalias",
  title: "Kit 3 Sandálias Femininas Branca, Preta e Rosé",
  brand: "PAZE",
  seller: "Paze Oficial",
  sold: "+500 vendidos",
  rating: 5.0,
  reviewsCount: 127,
  price: 9990,
  compareAt: null,
  installments: { count: 6, valueCents: 1665 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Calçados Femininos", "Sandálias"],
  colors: [
    {
      key: "kit-3-cores",
      label: "Branca, preta e rosé",
      thumb: "https://assetsglobalbr.com/u/testimony/72ad024d.png",
      gallery: [
        { src: "https://assetsglobalbr.com/u/testimony/72ad024d.png", kind: "image" },
        { src: "https://assetsglobalbr.com/u/testimony/5212b1e6.png", kind: "image" },
        { src: "https://assetsglobalbr.com/u/testimony/6106dfdf.png", kind: "image" },
        { src: "https://assetsglobalbr.com/u/testimony/17ef9a65.png", kind: "image" },
      ],
    },
  ],
  sizes: ["34", "35", "36", "37", "38", "39", "40", "41"],
  description: {
    heading: "Kit com 3 Sandálias Femininas — Branca, Preta e Rosé",
    intro: [
      "Tenha uma opção perfeita para cada look sem precisar escolher apenas uma cor. O Kit Paze reúne três sandálias femininas versáteis nas cores branca, preta e rosé, ideais para combinar com vestidos, saias, calças, shorts e produções casuais ou mais arrumadas.",
      "Cada modelo possui um acabamento diferente, trazendo variedade para o seu dia a dia: a branca tem detalhes trançados, a preta apresenta tiras cruzadas e a rosé conta com acabamento metalizado elegante.",
      "Você leva as 3 sandálias por apenas R$ 99,90, o equivalente a somente R$ 33,30 por par.",
    ],
    steps: [
      "Escolha sua numeração, do 34 ao 41.",
      "Receba em casa um kit completo com as três cores.",
      "Varie as combinações e tenha uma opção perfeita para cada look.",
    ],
    benefits: [
      {
        title: "Três modelos em um único kit",
        result: "1 sandália branca, 1 sandália preta e 1 sandália rosé",
        feeling: "Você renova os looks sem precisar escolher apenas uma cor.",
      },
      {
        title: "Acabamentos diferentes",
        result: "Detalhes trançados, tiras cruzadas e acabamento metalizado",
        feeling: "Mais variedade para produções casuais ou mais arrumadas.",
      },
      {
        title: "Somente R$ 33,30 por par",
        result: "Três sandálias por apenas R$ 99,90",
        feeling: "Mais opções pagando menos do que muitas lojas cobram por um par.",
      },
      {
        title: "Cores fáceis de combinar",
        result: "Branco, preto e rosé para acompanhar todo o guarda-roupa",
        feeling: "Praticidade para combinar com vestidos, saias, calças e shorts.",
      },
    ],
    quotes: [
      "As três são lindas e combinam com tudo. O kit vale muito a pena.",
      "A rosé é ainda mais bonita pessoalmente e a preta virou minha favorita.",
      "Chegaram certinhas e o tamanho que escolhi ficou ótimo.",
    ],
    specs: [
      "O kit contém: 1 sandália branca",
      "O kit contém: 1 sandália preta",
      "O kit contém: 1 sandália rosé",
      "Numerações disponíveis: do 34 ao 41",
      "Sandália branca: detalhes trançados",
      "Sandália preta: tiras cruzadas",
      "Sandália rosé: acabamento metalizado elegante",
    ],
    tip: "Escolha a numeração que você usa normalmente. Cada opção exibida na página corresponde ao grupo de numeração disponível no estoque.",
    closing: [
      "Uma escolha prática para renovar seus looks, variar as combinações e ter três modelos diferentes pagando menos do que muitas lojas cobram por apenas um par.",
      "Garanta o seu tamanho enquanto houver disponibilidade em estoque.",
    ],
    warranty: "30 dias",
  },
};

const ROBOASPIRADOR_PRODUCT: Product = {
  id: "mercadopromo-robo-aspirador",
  title: "Robô Aspirador de Pó Inteligente Wi-Fi Varre, Aspira e Passa Pano Mop Automático",
  brand: "ROBOCLEAN",
  seller: "Skhati Wear",
  sold: "+3 mil vendidos",
  rating: 5.0,
  reviewsCount: 428,
  price: 15990,
  compareAt: 69990,
  installments: { count: 6, valueCents: 2665 },
  categoryTrail: ["Eletrodomésticos", "Pequenos Eletrodomésticos", "Robôs Aspiradores"],
  colors: [
    {
      key: "preto",
      label: "Preto Titanium",
      thumb: roboAspiradorRb,
      gallery: [
        { src: roboAspiradorRb, kind: "image" },
        { src: roboAspirador1, kind: "image" },
        { src: roboAspirador2, kind: "image" },
        { src: roboAspirador3, kind: "image" },
      ],
    },
  ],
  sizes: ["Bivolt (110V/220V)"],
  description: {
    heading: "Robô Aspirador de Pó Inteligente Wi-Fi 3 em 1 — Varre, Aspira e Passa Pano",
    intro: [
      "Cansado de perder horas do seu dia varrendo e passando pano pela casa? Conheça a revolução na limpeza doméstica inteligente.",
      "O Robô Aspirador de Pó Inteligente combina alta potência de sucção de 3000Pa, navegação inteligente com sensores anti-queda e anti-colisão, e sistema 3 em 1 (varre, aspira e passa pano mop simultaneamente).",
      "Conecte ao seu smartphone via Wi-Fi ou controle pelo controle remoto. Limpa facilmente pisos frios, amadeirados, carpetes e tapetes, alcançando os cantos mais difíceis sob móveis e sofás.",
      "Com bateria de longa duração e retorno automático para a base de carregamento, você tem a casa sempre impecável sem mover um dedo.",
    ],
    steps: [
      "Ligue o Robô Aspirador e conecte ao aplicativo Wi-Fi no celular ou use o botão inteligente de toque rápido.",
      "Selecione o modo de limpeza desejado (automático, cantos, espiral ou mop com água).",
      "Relaxe e aproveite seu tempo livre enquanto o robô limpa toda a casa e retorna sozinho para recarregar.",
    ],
    benefits: [
      {
        title: "Sistema 3 em 1 Completo",
        result: "Varre, aspira e passa pano com reservatório de água inteligente",
        feeling: "Casa limpa e cheirosa todos os dias sem nenhum esforço.",
      },
      {
        title: "Potência de Sucção 3000Pa",
        result: "Remove poeira, pelos de pets, migalhas e sujeiras profundas de tapetes",
        feeling: "Livre-se dos pelos de animais espalhados pela casa.",
      },
      {
        title: "Sensores Anti-Queda e Anti-Colisão",
        result: "Desvia de móveis, degraus e escadas com extrema precisão",
        feeling: "Tranquilidade total para deixar o robô limpando sozinho.",
      },
      {
        title: "Design Ultra Slim 7.5cm",
        result: "Entra facilmente debaixo de camas, sofás e armários baixos",
        feeling: "Chega nos lugares onde a vassoura tradicional nunca alcança.",
      },
      {
        title: "Controle por Aplicativo Wi-Fi",
        result: "Agende horários de limpeza e controle tudo pelo celular mesmo longe de casa",
        feeling: "Chegar em casa do trabalho e encontrar tudo limpinho.",
      },
      {
        title: "Bateria de Longa Duração & Carga Auto",
        result: "Até 120 minutos de autonomia contínua e retorno automático à base",
        feeling: "Autonomia suficiente para limpar apartamentos e casas grandes.",
      },
    ],
    quotes: [
      "“Melhor compra do ano! Aspira todos os pelos dos meus dois cachorros e passa pano super bem. Valeu cada centavo.” — cliente verificado",
      "“Silencioso e muito eficiente. Entra debaixo da minha cama e do sofá sem travar. O aplicativo é fácil de usar.” — cliente verificado",
      "“Surpreendeu pela potência pelo preço promocional de R$ 159,90. Chegou super rápido e bem embalado. Recomendo!” — cliente verificado",
    ],
    specs: [
      "Funções: 3 em 1 (Varre, Aspira e Passa Pano Mop)",
      "Potência de sucção: 3000 Pa (motor brushless de alta performance)",
      "Navegação: Sensores infravermelhos anti-colisão e anti-queda",
      "Conectividade: Wi-Fi 2.4GHz + Aplicativo Smartphone (Android/iOS) + Controle Remoto",
      "Capacidade do reservatório de pó: 600ml (filtro HEPA lavável anti-alérgico)",
      "Capacidade do reservatório de água: 300ml (controle inteligente de fluxo)",
      "Bateria: Lítio 2600 mAh (autonomia de até 120 min de uso contínuo)",
      "Voltagem: Bivolt Automático (110V - 220V)",
      "Nível de ruído: Ultra silencioso (< 58 dB)",
      "Altura do produto: 7.5 cm (ultra slim para alcançar sob móveis)",
      "Itens inclusos: 1 Robô Aspirador, 1 Base de Carregamento, 1 Controle Remoto, 2 Escovas Laterais Reserva, 1 Pano Mop Microfibra, 1 Filtro HEPA, 1 Manual de Instruções",
    ],
    tip: "Para melhor resultado no modo Mop (passar pano), umedeça levemente o pano de microfibra antes de fixar na base e adicione algumas gotas do seu limpador perfumado favorito no reservatório de água.",
    closing: [
      "Compra 100% protegida pelo Mercado Livre com garantia de satisfação e devolução grátis em até 30 dias.",
      "Aproveite o preço promocional exclusivo de lançamento de R$ 699,90 por apenas R$ 159,90 com frete grátis para todo o Brasil!",
    ],
    warranty: "30 dias de garantia com devolução grátis pelo Mercado Livre",
  },
};

const BODYMODELADOR_PRODUCT: Product = {
  id: "mercadopromo-body-modelador",
  title: "Body Modelador Feminino Alta Compressão — Pague 1 e Leve 2",
  brand: "SKATHI",
  seller: "Skhati Wear",
  sold: "+3 mil vendidos",
  rating: 5.0,
  reviewsCount: 184,
  price: 5990,
  compareAt: 14990,
  installments: { count: 6, valueCents: 998 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Roupas Femininas", "Lingerie e Moda Íntima", "Modeladores"],
  colors: [
    {
      key: "kit-preto-branco",
      label: "Kit 2x (Preto e Branco)",
      thumb: bodyModeladorPose1,
      gallery: [
        { src: bodyModeladorPose1, kind: "image" },
        { src: bodyModeladorPose2, kind: "image" },
        { src: bodyModeladorPose3, kind: "image" },
        { src: bodyModeladorPose4, kind: "image" },
        { src: bodyModeladorPose5, kind: "image" },
        { src: bodyModeladorPose6, kind: "image" },
        { src: bodyModelador3, kind: "image" },
        { src: bodyModelador4, kind: "image" },
      ],
    },
  ],
  sizes: ["P", "M", "G", "GG", "XG"],
  description: {
    heading: "Body Modelador Feminino Alta Compressão — Pague 1 e Leve 2",
    intro: [
      "Realce suas curvas e deixe a silhueta mais definida com o Body Modelador Feminino. Desenvolvido com tecido de alta compressão, ele ajuda a modelar a cintura, alinhar o abdômen e valorizar o corpo, mantendo conforto para usar durante o dia.",
      "🔥 OFERTA ESPECIAL: PAGUE 1 E LEVE 2 BODYS! Você recebe 2 unidades pelo preço de 1.",
    ],
    steps: [
      "Escolha o seu tamanho de acordo com a tabela de numerações (P ao XG).",
      "Receba em casa 2 unidades do Body Modelador de Alta Compressão (Preto e Branco).",
      "Vista por baixo de vestidos, calças, saias ou jeans e sinta o efeito modelador imediato.",
    ],
    benefits: [
      { title: "Efeito modelador imediato", result: "Ajuda a deixar a cintura mais marcada e desenhada.", feeling: "Valoriza a silhueta em qualquer look." },
      { title: "Compressão de abdômen", result: "Auxilia na compressão suave e alinhamento do abdômen.", feeling: "Sustentação firme e confortável." },
      { title: "Tecido confortável e flexível", result: "Valoriza as curvas naturais do corpo sem machucar.", feeling: "Discreto e suave no contato com a pele." },
      { title: "Não marca sob a roupa", result: "Ideal para usar por baixo de vestidos, calças e saias.", feeling: "Acabamento invisível na rotina." },
      { title: "Alças largas e fecho inferior", result: "Alças reforçadas para sustentação + fechamento inferior prático.", feeling: "Praticidade e conforto em todos os momentos." },
    ],
    quotes: [
      "“Efeito modelador incrível! Modela a cintura perfeitamente e não marca sob o vestido.” — cliente verificada",
      "“Promoção maravilhosa, vem 2 bodys de altíssima qualidade. O M ficou certinho!” — cliente verificada",
      "“Muito confortável para usar o dia todo no trabalho. Recomendo!” — cliente verificada",
    ],
    specs: [
      "Oferta Especial: PAGUE 1 E LEVE 2 (Você recebe 2 unidades)",
      "Cores inclusas no kit: Preto e Branco",
      "Tamanho P: veste numeração 36 – 38",
      "Tamanho M: veste numeração 40 – 42",
      "Tamanho G: veste numeração 44 – 46",
      "Tamanho GG: veste numeração 48 – 50",
      "Tamanho XG: veste numeração 52 – 54",
      "Material: Tecido de alta compressão flexível e respirável",
      "Fechamento: Fecho inferior prático + alças largas de alta sustentação",
      "Conteúdo da embalagem: 2x Body Modelador Feminino (Preto e Branco)",
    ],
    tip: "Importante: a tabela acima é uma referência aproximada. Por se tratar de uma peça modeladora com compressão, o caimento pode variar conforme as medidas e o formato do corpo. Se preferir menos compressão, considere pedir um tamanho maior.",
    closing: [
      "Compre com a confiança do Mercado Livre: compra 100% protegida e devolução grátis em até 30 dias.",
      "Garanta seu kit PAGUE 1 E LEVE 2 por apenas R$ 59,90 enquanto durar o estoque promocional!",
    ],
    warranty: "30 dias de garantia com devolução grátis pelo Mercado Livre",
  },
};

const KITJEANS_PRODUCT: Product = {
  id: "mercadopromo-kit-jeans",
  title: "Kit 2 Calças Jeans Masculinas — Azul + Jeans Escura",
  brand: "SKATHI",
  seller: "Skhati Wear",
  sold: "+2 mil vendidos",
  rating: 4.9,
  reviewsCount: 153,
  price: 7990,
  compareAt: 19990,
  installments: { count: 6, valueCents: 1332 },
  categoryTrail: ["Calçados, Roupas e Bolsas", "Roupas", "Calças"],
  colors: [
    {
      key: "kit-azul-escura",
      label: "Kit (Azul + Escura)",
      thumb: kitjeans1,
      gallery: [
        { src: kitjeans1, kind: "image" },
        { src: kitjeans2, kind: "image" },
        { src: kitjeans3, kind: "image" },
      ],
    },
  ],
  sizes: ["38", "39", "40", "41", "42", "43", "44", "45", "46", "48"],
  description: {
    heading: "Kit 2 Calças Jeans Masculinas — Azul + Jeans Escura",
    intro: [
      "Renove seus looks com praticidade e economia. O Kit Calça Jeans Masculina acompanha 2 peças, sendo 1 jeans azul tradicional + 1 jeans azul escura, ideais para usar no trabalho, no dia a dia, em passeios ou ocasiões casuais.",
      "Com modelagem masculina confortável e visual versátil, são peças fáceis de combinar com camisetas, polos, camisas, tênis ou sapatos.",
    ],
    steps: [
      "Escolha o seu tamanho de acordo com a numeração que costuma usar.",
      "Receba em casa um kit contendo 2 calças jeans de lavagens diferentes.",
      "Aproveite a versatilidade e o conforto de peças premium para usar no trabalho, passeios ou no dia a dia.",
    ],
    benefits: [
      { title: "Modelagem confortável", result: "Corte tradicional que veste super bem", feeling: "Conforto para usar o dia todo." },
      { title: "Jeans resistente", result: "Material de alta durabilidade para a rotina", feeling: "Roupas que duram muito mais tempo." },
      { title: "Duas cores essenciais", result: "Azul tradicional e Jeans escuro no mesmo kit", feeling: "Mais versatilidade para variar seus looks." },
    ],
    quotes: [
      "“Ótima qualidade, visto 42 e serviu perfeitamente. Comprarei novamente com certeza.”",
      "“Vale muito a pena pelo preço, o jeans é macio e as cores são exatamente como na foto.”",
      "“Chegaram rápido e vieram as duas cores. Caimento super bom, recomendo!”",
    ],
    specs: [
      "O que vem no kit: 1 Calça Jeans Azul e 1 Calça Jeans Escura (Total de 2 calças)",
      "Modelagem: Masculina confortável e tradicional",
      "Material: Jeans resistente para o dia a dia",
      "Bolsos: Frontais e traseiros",
      "Fechamento: Botão e zíper",
      "Detalhes: Costuras reforçadas",
    ],
    tip: "A numeração é padrão, peça o tamanho que você já usa normalmente ou use o guia de medidas para comparar com uma peça que já sirva bem.",
    closing: [
      "Oferta: KIT COM 2 CALÇAS POR R$ 79,90.",
      "Você leva duas opções de jeans para variar o visual pagando um único valor.",
    ],
    warranty: "30 dias"
  }
};


const PRODUCT_SLUGS: Record<string, number> = {
  jaquetafem: 0,
  bota: 1,
  calca: 2,
  garmin: 3,
  "jaqueta-masculina": 4,
  "conjunto-soft-teddy": 5,
  bobojaco: 6,
  kitpanos: 7,
  kitsandalias: 8,
  roboaspirador: 9,
  "robo-aspirador": 9,
  aspirador: 9,
  bodymodelador: 10,
  "body-modelador": 10,
  kitjeans: 11,
};
const LEGACY_JACKET_SEARCH_SLUGS = new Set(["jaqueta", "jaquetafem"]);
const DEFAULT_MERCADO_PROMO_SLUG = "bota";

const PRODUCTS: Product[] = [MAIN_PRODUCT, BOOT_PRODUCT, PANTS_PRODUCT, GARMIN_PRODUCT, JAQMASC_PRODUCT, SOFT_PRODUCT, BOBOJACO_PRODUCT, KIT_PANOS_PRODUCT, KIT_SANDALIAS_PRODUCT, ROBOASPIRADOR_PRODUCT, BODYMODELADOR_PRODUCT, KITJEANS_PRODUCT];


const FEMALE_JACKET_VARIANT_IDS: Record<string, Record<string, number>> = {
  marrom: {
    P: 248867337,
    M: 250272025,
    G: 250272071,
    GG: 250272082,
  },
  preto: {
    P: 250272166,
    M: 250272274,
    G: 250272380,
    GG: 250272472,
  },
  bege: {
    P: 250272635,
    M: 250272743,
    G: 250272745,
    GG: 250272838,
  },
};

const BOBOJACO_VARIANT_IDS: Record<string, number> = {
  P: 249797139,
  M: 250277308,
  G: 250277311,
  GG: 250277319,
  XGG: 250277323,
};

const KIT_SANDALIAS_VARIANT_IDS: Record<string, number> = {
  "34": 252579869,
  "35": 252579869,
  "36": 252579914,
  "37": 252579914,
  "38": 252579922,
  "39": 252579922,
  "40": 252579930,
  "41": 252579930,
};

const SIZE_GUIDE = [
  { label: "P", equivalent: "P", chest: 88, height: 55, shoulders: 37 },
  { label: "M", equivalent: "M", chest: 95, height: 56, shoulders: 40 },
  { label: "G", equivalent: "G", chest: 100, height: 57, shoulders: 41 },
  { label: "GG", equivalent: "GG", chest: 102, height: 58, shoulders: 42 },
  { label: "EXG", equivalent: "XG", chest: 104, height: 59, shoulders: 43 },
];

const PAYMENT_METHODS = {
  credit: [
    { name: "American Express", src: payAmex },
    { name: "Elo", src: payElo },
    { name: "Visa", src: payVisa },
    { name: "Mastercard", src: payMastercard },
  ],
  pix: { name: "Pix", src: payPix },
};

const SELLER = {
  name: "Skhati Wear",
  image: "https://http2.mlstatic.com/D_NQ_NP_624580-MLA91707854636_092025-F.jpg",
  medal: "https://http2.mlstatic.com/frontend-assets/vpp-frontend/medal.svg",
};

type Review = {
  name: string;
  verified: boolean;
  rating: number;
  text: string;
  when: string;
  photo?: string;
  photos?: string[];
};

const JAQUETA_REVIEWS: Review[] = [
  {
    name: "juliana.m",
    verified: true,
    rating: 5,
    text: "Chegou super rápido, o couro sintético é firme e o caimento slim ficou perfeito. Comprei M e serviu certinho.",
    when: "há 1 mês",
    photo: review1,
  },
  {
    name: "carol.s",
    verified: true,
    rating: 5,
    text: "Linda! Igual à foto, cor marrom-escuro exatamente como aparece. Quente sem ser pesada.",
    when: "há 2 meses",
    photo: review2,
  },
  {
    name: "priscila.f",
    verified: true,
    rating: 5,
    text: "Recomendo demais. Zíper de qualidade, costura reforçada. Já é a segunda que compro.",
    when: "há 2 meses",
    photo: review3,
  },
];

const GARMIN_REVIEWS: Review[] = [
  {
    name: "rafael.p",
    verified: true,
    rating: 5,
    text: "Chegou rapidinho e lacrado na caixa. Visor AMOLED nítido, leve no pulso e o GPS multibanda pega em menos de 10 segundos. Já usei em 3 treinos de rua e não perdeu sinal em nenhum.",
    when: "há 3 semanas",
    photo: garminReviewA,
  },
  {
    name: "camila.r",
    verified: true,
    rating: 5,
    text: "Amei! Uso o dia inteiro, bateria dura tranquilamente mais de duas semanas com treino diário. O monitor cardíaco bate certinho com meu cinta. Custo-benefício absurdo por esse preço.",
    when: "há 1 mês",
    photo: garminReviewB,
  },
  {
    name: "diego.s",
    verified: true,
    rating: 5,
    text: "Sincroniza direitinho com o Garmin Connect e manda pro Strava sem enrolação. Distância e ritmo bateram com meu antigo relógio na prova. Recomendo demais.",
    when: "há 1 mês",
    photo: garminReviewC,
  },
  {
    name: "juliana.m",
    verified: true,
    rating: 5,
    text: "Comprei pra minha primeira meia maratona e virou item essencial. Os treinos sugeridos me ajudaram muito a evoluir o pace. A tela AMOLED no sol é outro nível.",
    when: "há 2 semanas",
    photo: garminReviewD,
  },
];

const JAQMASC_REVIEWS: Review[] = [
  {
    name: "marcos.a",
    verified: true,
    rating: 5,
    text: "Chegou rápido, embalada certinho. O suede parece muito mais caro do que custou e o forro peluciado é absurdo de quente. Comprei o marrom no G e caiu perfeito.",
    when: "há 3 semanas",
    photo: jaqmascReview1,
  },
  {
    name: "rafael.c",
    verified: true,
    rating: 5,
    text: "Uso praticamente todo dia desde que chegou. Costura reforçada, zíper firme, gola com botão bloqueia o vento. Já pedi a segunda na cor preta.",
    when: "há 1 mês",
    photo: jaqmascReview2,
  },
  {
    name: "vinicius.p",
    verified: true,
    rating: 5,
    text: "Nota 10. Combina com jeans, moletom, calça social. Bolso interno é ótimo pro celular. Recomendo demais pelo preço.",
    when: "há 2 meses",
    photo: jaqmascReview3,
  },
];

const SOFT_REVIEWS: Review[] = [
  {
    name: "beatriz.l",
    verified: true,
    rating: 5,
    text: "Tecido soft peluciado por dentro é maravilhoso, super quentinho e não solta pelo. Comprei o marrom no M e o caimento ficou ótimo. Vale muito o preço.",
    when: "há 3 semanas",
  },
  {
    name: "amanda.r",
    verified: true,
    rating: 5,
    text: "Conjunto lindo, a calça tem elástico confortável e não marca. Costura bem feita, chegou embalado direitinho. Já quero comprar em outra cor.",
    when: "há 1 mês",
  },
  {
    name: "larissa.o",
    verified: true,
    rating: 5,
    text: "Perfeito pro inverno aqui do sul. Bem grossinho, aquece de verdade e a modelagem é folgadinha sem ficar largona. Recomendo.",
    when: "há 2 meses",
  },
  {
    name: "fernanda.k",
    verified: true,
    rating: 4,
    text: "Gostei bastante, tecido macio e cor fiel à foto. Só achei que a blusa veste um número menor, se tiver dúvida pega o maior.",
    when: "há 2 meses",
  },
];

const BOBOJACO_REVIEWS: Review[] = [
  {
    name: "lucas.freire",
    verified: true,
    rating: 5,
    text: "Chegou muito rápido e é exatamente como nas fotos. Muito quente, leve e o capuz com forro peluciado é confortável demais. Uso pra ir trabalhar e nos passeios de fim de semana. Recomendo!",
    when: "há 2 semanas",
    photos: [bobojacoRev1, bobojacoRev2, bobojacoRev3],
  },
  {
    name: "tatiane.r",
    verified: true,
    rating: 5,
    text: "Perfeita! O nylon é bem resistente, aquece muito e o caimento ficou ótimo. Comprei o M e serviu certinho. O preço foi o melhor que encontrei, valeu cada centavo.",
    when: "há 3 semanas",
    photos: [bobojacoRev4, bobojacoRev5],
  },
  {
    name: "jaqueline.db",
    verified: true,
    rating: 5,
    text: "Já é a segunda que compro, uma pra mim e outra pro meu marido. Puffer super quente, o forro peluciado por dentro do capuz é maravilhoso e o zíper é firme. Chegou embalado direitinho.",
    when: "há 1 mês",
    photos: [bobojacoRev6, bobojacoRev7],
  },
];

const KIT_PANOS_REVIEWS: Review[] = [
  {
    name: "marcia.s",
    verified: true,
    rating: 5,
    text: "Parece toalha de rosto. Seca super bem e são super bonitas. Amei.",
    when: "há 2 semanas",
    photos: [kitPanosReview1],
  },
  {
    name: "regina.l",
    verified: true,
    rating: 5,
    text: "O pano de prato tem uma trama média. O acabamento das peças é excelente e seu tamanho atende a proposta. Não deixa pelo nas louças, o que já coloca o material numa posição privilegiada.",
    when: "há 3 semanas",
  },
  {
    name: "clau.cozinha",
    verified: true,
    rating: 5,
    text: "Pano bom. Gostei. Comprei para usar em casa e já separei alguns para revenda porque a qualidade surpreendeu.",
    when: "há 1 mês",
  },
];

const KIT_SANDALIAS_REVIEWS: Review[] = [
  {
    name: "ana.clara",
    verified: true,
    rating: 5,
    text: "Eu fiquei apaixonada! As três são ainda mais bonitas pessoalmente, super confortáveis e vieram muito bem embaladas. A branca é delicada, a preta combina com tudo e a rosé é simplesmente perfeita. Foi uma das melhores compras que já fiz.",
    when: "há 2 semanas",
    photo: kitSandaliasReview1,
  },
  {
    name: "mariana.s",
    verified: true,
    rating: 5,
    text: "O kit é maravilhoso e o tamanho ficou certinho no pé. Já usei as três e recebi elogios com todas. Parecem sandálias bem mais caras, principalmente a rosé. Pelo preço, vale muito a pena mesmo!",
    when: "há 3 semanas",
    photo: kitSandaliasReview2,
  },
  {
    name: "camila.r",
    verified: true,
    rating: 5,
    text: "Chegaram rápido e são lindas demais! Gostei muito da variedade porque consigo usar tanto no dia a dia quanto para sair. São leves, confortáveis e o acabamento me surpreendeu. Recomendo de olhos fechados.",
    when: "há 1 mês",
    photo: kitSandaliasReview3,
  },
];

const ROBOASPIRADOR_REVIEWS: Review[] = [
  {
    name: "fernando.mota",
    verified: true,
    rating: 5,
    text: "Excelente robô aspirador! Tenho 2 gatos em casa e ele limpa todos os pelos do chão e do tapete com facilidade. O aplicativo conectou de primeira no Wi-Fi. Muito silencioso e bateria dura bastante. Recomendo demais!",
    when: "há 2 semanas",
  },
  {
    name: "patricia.albuquerque",
    verified: true,
    rating: 5,
    text: "Superou minhas expectativas! Ele varre, aspira e passa pano de verdade. O reservatório de água umedece o pano na medida certa sem encharcar o piso amadeirado. Design slim passa por baixo dos móveis. Nota 10!",
    when: "há 3 semanas",
  },
  {
    name: "ricardo.silva",
    verified: true,
    rating: 5,
    text: "Chegou muito rápido no Mercado Livre, muito bem embalado. A base de carregamento funciona perfeitamente, quando a bateria tá acabando ele volta sozinho pra carregar. Pelo valor promocional de R$ 159,90 é disparado o melhor custo-benefício.",
    when: "há 1 mês",
  },
];

const BODYMODELADOR_REVIEWS: Review[] = [
  {
    name: "vanessa.mendonca",
    verified: true,
    rating: 5,
    text: "GENTE!! Olhem a diferença no espelho!! 😱😍 Eu fiquei em CHOQUE quando vesti! Modela a cintura na HORA, alinha o abdômen e não marca NADA por baixo da roupa. Vem 2 bodys perfeitos na promoção! Melhor compra da minha vida, autoestima lá no topo!! 🔥❤️",
    when: "há 1 semana",
    photo: bodyModeladorRev1,
  },
  {
    name: "jessica.alves",
    verified: true,
    rating: 5,
    text: "Passando pra mostrar esse resultado inacreditável! Mantenho o sorriso no rosto porque o caimento é impecável! Dá uma super sustentada no busto e deixa a cintura desenhadinha. Chegou super rápido no Mercado Livre e a qualidade é surreal pelo preço do Pague 1 Leve 2!! 🥰✨",
    when: "há 2 semanas",
    photo: bodyModeladorRev2,
  },
  {
    name: "carolina.dias",
    verified: true,
    rating: 5,
    text: "Estou simplesmente APAIXONADA! Tecido super macio e confortável para usar o dia todo no trabalho, sem dobrar e sem enrolar. A promoção de levar 2 unidades pelo valor de 1 é imbatível! Podem comprar sem medo!! 👏🏼💖",
    when: "há 3 semanas",
  },
];


const KITJEANS_REVIEWS: Review[] = [
  {
    name: "rodrigo.alves",
    verified: true,
    rating: 5,
    text: "O kit é sensacional! Chegou rápido, vestiu super bem e o jeans tem uma qualidade excelente pelo preço promocional. Já estou indicando para amigos.",
    when: "há 1 semana",
    photo: kitjeansReview1,
  },
  {
    name: "carlos.m",
    verified: true,
    rating: 5,
    text: "Ótima qualidade, visto 42 e serviu perfeitamente. Comprarei novamente com certeza. Muito bom ter duas cores coringas no armário.",
    when: "há 2 semanas",
  },
  {
    name: "marcelo.s",
    verified: true,
    rating: 5,
    text: "Vale muito a pena pelo preço, o jeans é macio e as cores são exatamente como na foto. Costura super bem feita, e os bolsos têm bom tamanho.",
    when: "há 3 semanas",
  },
  {
    name: "felipe.o",
    verified: true,
    rating: 5,
    text: "Chegaram rápido e vieram as duas cores corretas. O caimento é super bom, clássico. Pelo valor pago pelas duas calças, foi a minha melhor compra do mês. Recomendo demais!",
    when: "há 1 mês",
  },
];


const REVIEWS_BY_ID: Record<string, Review[]> = {
  [MAIN_PRODUCT.id]: JAQUETA_REVIEWS,
  [BOOT_PRODUCT.id]: JAQUETA_REVIEWS,
  [PANTS_PRODUCT.id]: JAQUETA_REVIEWS,
  [GARMIN_PRODUCT.id]: GARMIN_REVIEWS,
  [JAQMASC_PRODUCT.id]: JAQMASC_REVIEWS,
  [SOFT_PRODUCT.id]: SOFT_REVIEWS,
  [BOBOJACO_PRODUCT.id]: BOBOJACO_REVIEWS,
  [KIT_PANOS_PRODUCT.id]: KIT_PANOS_REVIEWS,
  [KIT_SANDALIAS_PRODUCT.id]: KIT_SANDALIAS_REVIEWS,
  [ROBOASPIRADOR_PRODUCT.id]: ROBOASPIRADOR_REVIEWS,
  [BODYMODELADOR_PRODUCT.id]: BODYMODELADOR_REVIEWS,
  [KITJEANS_PRODUCT.id]: KITJEANS_REVIEWS,
};


function formatBRL(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatBRLSplit(cents: number) {
  const value = (cents / 100).toFixed(2);
  const [int, dec] = value.split(".");
  return { int, dec };
}

const onlyDigits = (value: string) => value.replace(/\D+/g, "");
const maskCPF = (value: string) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};
const maskCEP = (value: string) =>
  onlyDigits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const maskCardNumber = (value: string) =>
  onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
const maskCardExpiry = (value: string) =>
  onlyDigits(value).slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");

type CheckoutForm = {
  name: string;
  email: string;
  document: string;
  phone: string;
  zipCode: string;
  street: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type PixData = {
  qrcode?: string;
  qrcodeBase64?: string;
  qrcodeUrl?: string;
};

type CardForm = {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
  installments: number;
};

export const Route = createFileRoute("/mercadopromo")({
  validateSearch: (search: Record<string, unknown>) => ({
    p: typeof search.p === "string" ? search.p : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mercado Livre" },
      {
        name: "description",
        content:
          "Jaqueta feminina slim em courino com zíper estilo motoqueiro. Frete grátis, 6x sem juros e devolução grátis em até 30 dias.",
      },
      { property: "og:title", content: MAIN_PRODUCT.title },
      {
        property: "og:description",
        content: "Frete grátis e 6x sem juros no Mercado Livre.",
      },
      { property: "og:image", content: MAIN_PRODUCT.colors[0].gallery[0].src },
    ],
  }),
  component: MercadoPromoPage,
});

export function MercadoPromoPage({ forcedSlug }: { forcedSlug?: string } = {}) {
  const search = useSearch({ strict: false }) as { p?: string };
  const navigate = useNavigate();
  const p = forcedSlug ?? search.p;
  const isBlockedLegacyJacket = !forcedSlug && Boolean(search.p) && LEGACY_JACKET_SEARCH_SLUGS.has(search.p!);
  const activeIdx =
    p && PRODUCT_SLUGS[p] !== undefined && !isBlockedLegacyJacket
      ? PRODUCT_SLUGS[p]
      : PRODUCT_SLUGS[DEFAULT_MERCADO_PROMO_SLUG];
  const PRODUCT = PRODUCTS[activeIdx];
  const COLORS = PRODUCT.colors;
  const SIZES = PRODUCT.sizes;
  const requiresSize = SIZES.length > 0;
  const isMercadoLivreTheme =
    PRODUCT.id === "mercadopromo-kit-sandalias" ||
    PRODUCT.id === "mercadopromo-robo-aspirador" ||
    PRODUCT.id === "mercadopromo-jaqueta-courino" ||
    PRODUCT.id === "mercadopromo-body-modelador" ||
    PRODUCT.id === "mercadopromo-kit-jeans";

  const promoTheme = {
    "--promo-accent": isMercadoLivreTheme ? "#3483fa" : "#79C142",
    "--promo-accent-hover": isMercadoLivreTheme ? "#2968c8" : "#6bb136",
    "--promo-accent-soft": isMercadoLivreTheme ? "#e6f0ff" : "#f2fbe8",
    "--promo-accent-soft-hover": isMercadoLivreTheme ? "#d5e4fc" : "#e5f7d3",
    "--promo-header": isMercadoLivreTheme ? "#fff159" : "#bbf0b6",
    "--promo-header-border": isMercadoLivreTheme ? "#fff159" : "#aae0a5",
  } as CSSProperties;

  const [colorKey, setColorKey] = useState(COLORS[0].key);
  const color = useMemo(
    () => COLORS.find((c) => c.key === colorKey) ?? COLORS[0],
    [colorKey, COLORS],
  );
  const [activeImg, setActiveImg] = useState(color.gallery[0].src);
  const activeMedia = color.gallery.find((media) => media.src === activeImg);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const priceSplit = formatBRLSplit(PRODUCT.price);
  const fiveStarReviews =
    PRODUCT.id === "mercadopromo-kit-sandalias"
      ? PRODUCT.reviewsCount
      : Math.max(1, Math.round(PRODUCT.reviewsCount * 0.9));
  const fourStarReviews = Math.max(0, PRODUCT.reviewsCount - fiveStarReviews);
  const ratingDistribution = [
    [5, fiveStarReviews],
    [4, fourStarReviews],
    [3, 0],
    [2, 0],
    [1, 0],
  ];

  const createCheckout = useServerFn(createZedyCheckout);

  useEffect(() => {
    setActiveImg(color.gallery[0].src);
  }, [color]);

  // Reset selection when switching products via sub-tabs
  useEffect(() => {
    setColorKey(PRODUCTS[activeIdx].colors[0].key);
    setSize(null);
    setQty(1);
    setCheckoutError(null);
  }, [activeIdx]);

  const SOFT_CHECKOUT_URL =
    "https://seguro.mercadomodasoferta.site/api/public/shopify?product=3353942983311&store=33539";
  const isSoftProduct = PRODUCT.id === "mercadopromo-conjunto-soft-teddy";

  // Pixel: ViewContent fires per active product
  useEffect(() => {
    if (isBlockedLegacyJacket) return;

    const params = {
      content_ids: [PRODUCT.id],
      content_name: PRODUCT.title,
      content_type: "product",
      value: PRODUCT.price / 100,
      currency: "BRL",
    };
    trackProductEvent(PRODUCT, "ViewContent", params);
  }, [PRODUCT.id, PRODUCT.price, PRODUCT.title, isBlockedLegacyJacket]);

  const selectProduct = (idx: number) => {
    if (idx === activeIdx) return;
    const slug = (Object.keys(PRODUCT_SLUGS) as (keyof typeof PRODUCT_SLUGS)[]).find(
      (k) => PRODUCT_SLUGS[k] === idx,
    );
    navigate({ to: "/mercadopromo", search: { p: slug } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedFemaleJacketVariantId =
    PRODUCT.id === "mercadopromo-jaqueta-courino" && size
      ? FEMALE_JACKET_VARIANT_IDS[colorKey]?.[size]
      : undefined;
  const selectedBobojacoVariantId =
    PRODUCT.id === "mercadopromo-jaqueta-bobojaco-puffer" && size
      ? BOBOJACO_VARIANT_IDS[size]
      : undefined;
  const selectedKitSandaliasVariantId =
    PRODUCT.id === "mercadopromo-kit-sandalias" && size
      ? KIT_SANDALIAS_VARIANT_IDS[size]
      : undefined;
  const selectedZedyVariantId =
    selectedFemaleJacketVariantId ??
    selectedBobojacoVariantId ??
    selectedKitSandaliasVariantId;

  function validateSelection() {
    if (requiresSize && !size) {
      setCheckoutError("Escolha um tamanho para continuar.");
      return false;
    }

    if (PRODUCT.id === "mercadopromo-jaqueta-courino" && !selectedFemaleJacketVariantId) {
      setCheckoutError("Esta combinação de cor e tamanho não está disponível.");
      return false;
    }

    if (PRODUCT.id === "mercadopromo-jaqueta-bobojaco-puffer" && !selectedBobojacoVariantId) {
      setCheckoutError("Este tamanho não está disponível.");
      return false;
    }

    if (PRODUCT.id === "mercadopromo-kit-sandalias" && !selectedKitSandaliasVariantId) {
      setCheckoutError("Este tamanho não está disponível.");
      return false;
    }

    return true;
  }

  async function goToZedy() {
    if (checkoutLoading) return;
    if (!validateSelection()) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const { url } = await createCheckout({
        data: {
          items: [
            selectedZedyVariantId
              ? { variantId: selectedZedyVariantId, quantity: qty }
              : { slug: PRODUCT.id, quantity: qty },
          ],
        },
      });
      window.location.href = url;
    } catch (err) {
      setCheckoutError(
        err instanceof Error
          ? err.message
          : "Falha ao abrir o pagamento. Tente novamente.",
      );
      setCheckoutLoading(false);
    }
  }

  function goToSoftCheckout() {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    window.location.href = SOFT_CHECKOUT_URL;
  }

  // Product-specific external checkouts. Female jacket and Bobojaco use Zedy variants.
  const BODYMODELADOR_SIZE_CHECKOUTS: Record<string, string> = {
    P: "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393726345959&store=33937",
    M: "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393735548255&store=33937",
    G: "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393768988791&store=33937",
    GG: "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393756117366&store=33937",
    XG: "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393758231487&store=33937",
    EXG: "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393758231487&store=33937",
  };

  const KITJEANS_SIZE_CHECKOUTS: Record<string, string> = {
    "38": "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393777758131&store=33937",
    "39": "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393714274397&store=33937",
    "40": "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393742467931&store=33937",
    "41": "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393758493839&store=33937",
    "42": "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393722341746&store=33937",
    "43": "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393718887195&store=33937",
    "44": "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393725931575&store=33937",
    "45": "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393773537199&store=33937",
    "46": "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393724432255&store=33937",
    "48": "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393781566131&store=33937",
  };

  const EXTERNAL_MAIN_PIXEL_CHECKOUTS: Record<string, string> = {
    "mercadopromo-jaqueta-termica-masc":
      "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393767842421&store=33937",
    "mercadopromo-robo-aspirador":
      "https://seguro.mercadolpromo.veltro.digital/api/public/shopify?product=3393759721155&store=33937",
  };
  const externalMainPixelCheckoutUrl =
    PRODUCT.id === "mercadopromo-body-modelador" && size
      ? BODYMODELADOR_SIZE_CHECKOUTS[size]
      : PRODUCT.id === "mercadopromo-kit-jeans" && size
      ? KITJEANS_SIZE_CHECKOUTS[size]
      : EXTERNAL_MAIN_PIXEL_CHECKOUTS[PRODUCT.id];


  function goToExternalMainPixelCheckout() {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    if (externalMainPixelCheckoutUrl) {
      window.location.href = externalMainPixelCheckoutUrl;
    }
  }

  const onBuy = () => {
    if (!validateSelection()) return;
    const params = {
      content_ids: [selectedZedyVariantId ?? PRODUCT.id],
      content_name: PRODUCT.title,
      value: PRODUCT.price / 100,
      currency: "BRL",
      num_items: qty,
      contents: [{ id: selectedZedyVariantId ?? colorKey, size: size ?? "-", quantity: qty }],
    };
    if (isSoftProduct) {
      trackProductEvent(PRODUCT, "InitiateCheckout", params);
      goToSoftCheckout();
      return;
    }
    if (externalMainPixelCheckoutUrl) {
      trackProductEvent(PRODUCT, "InitiateCheckout", params);
      goToExternalMainPixelCheckout();
      return;
    }
    trackProductEvent(PRODUCT, "InitiateCheckout", params);
    void goToZedy();
  };

  const onAddToCart = () => {
    if (!validateSelection()) return;
    const atcParams = {
      content_ids: [selectedZedyVariantId ?? PRODUCT.id],
      content_name: PRODUCT.title,
      value: PRODUCT.price / 100,
      currency: "BRL",
    };
    const icParams = {
      ...atcParams,
      num_items: qty,
      contents: [{ id: selectedZedyVariantId ?? colorKey, size: size ?? "-", quantity: qty }],
    };
    if (isSoftProduct) {
      trackProductEvent(PRODUCT, "AddToCart", atcParams);
      trackProductEvent(PRODUCT, "InitiateCheckout", icParams);
      goToSoftCheckout();
      return;
    }
    if (externalMainPixelCheckoutUrl) {
      trackProductEvent(PRODUCT, "AddToCart", atcParams);
      trackProductEvent(PRODUCT, "InitiateCheckout", icParams);
      goToExternalMainPixelCheckout();
      return;
    }
    trackProductEvent(PRODUCT, "AddToCart", atcParams);
    trackProductEvent(PRODUCT, "InitiateCheckout", icParams);
    void goToZedy();
  };

  if (isBlockedLegacyJacket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ededed] px-4 text-[#333]">
        <div className="text-center">
          <h1 className="text-5xl font-semibold">404</h1>
          <p className="mt-3 text-sm text-[#666]">Página não encontrada.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mercado-promo-page min-h-screen bg-[#ededed] text-[#333]"
      style={promoTheme}
    >
      <style>{`
        .mercado-promo-page,
          .mercado-promo-page h1,
          .mercado-promo-page h2,
          .mercado-promo-page h3 {
          font-family: "Proxima Nova", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
          letter-spacing: 0 !important;
          text-transform: none !important;
        }
      `}</style>
      <MLHeader mercadoLivreTheme={isMercadoLivreTheme} />

      {/* Breadcrumbs */}
      <div className="mx-auto hidden max-w-[1200px] px-4 py-3 text-[13px] md:block">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a href="#" className="text-[var(--promo-accent)] hover:underline">
            Voltar à lista
          </a>
          <span className="text-[#999]">|</span>
          {PRODUCT.categoryTrail.map((c, i) => (
            <span key={c} className="flex items-center gap-2">
              <a href="#" className="text-[var(--promo-accent)] hover:underline">
                {c}
              </a>
              {i < PRODUCT.categoryTrail.length - 1 && (
                <ChevronRight className="h-3 w-3 text-[#999]" />
              )}
            </span>
          ))}
          <div className="ml-auto flex gap-4">
            <a href="#" className="text-[var(--promo-accent)] hover:underline">
              Vender um igual
            </a>
            <a href="#" className="text-[var(--promo-accent)] hover:underline">
              Compartilhar
            </a>
          </div>
        </div>
      </div>

      {!forcedSlug && (
        <div className="mx-auto max-w-[1200px] px-3 pt-3 md:px-4">
          <div className="flex gap-2 overflow-x-auto border-b border-[#e6e6e6]">
            {PRODUCTS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectProduct(i)}
                className={`whitespace-nowrap border-b-2 px-3 py-2 text-[13px] transition ${
                  activeIdx === i
                    ? "border-[var(--promo-accent)] text-[var(--promo-accent)]"
                    : "border-transparent text-[#666] hover:text-[#333]"
                }`}
              >
                {p.title.split(" ").slice(0, 3).join(" ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="mx-auto max-w-[1200px] bg-white md:my-2 md:rounded-md md:shadow-sm">
        <div className="grid gap-4 p-3 md:grid-cols-[minmax(0,1fr)_320px] md:p-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_320px]">
          {/* Gallery column (image + mobile thumbnails) */}
          <div className="min-w-0">
            <div className="flex gap-3">
              <div className="hidden w-14 flex-col gap-2 lg:flex">
                {color.gallery.map((media) => (
                  <button
                    key={media.src}
                    onMouseEnter={() => setActiveImg(media.src)}
                    onClick={() => setActiveImg(media.src)}
                    className={`aspect-square overflow-hidden rounded border bg-white ${
                      activeImg === media.src ? "border-[var(--promo-accent)]" : "border-[#e0e0e0]"
                    }`}
                  >
                    {media.kind === "video" ? (
                      <video src={media.src} muted playsInline className="h-full w-full object-cover" />
                    ) : (
                      <img src={media.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </button>
                ))}
              </div>
              <div className="relative min-w-0 flex-1 overflow-hidden rounded bg-white">
                {activeMedia?.kind === "video" ? (
                  <video
                    src={activeImg}
                    className="mx-auto aspect-[3/4] w-full max-w-[520px] object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={activeImg}
                    alt={PRODUCT.title}
                    className="mx-auto aspect-[3/4] w-full max-w-[520px] object-contain bg-[#f8f8f8] p-1"
                  />
                )}
                <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white">
                  <Heart className="h-5 w-5 text-[var(--promo-accent)]" />
                </button>
              </div>
            </div>
            {/* Mobile thumbnails row */}
            <div className="mt-2 flex gap-2 overflow-x-auto lg:hidden">
              {color.gallery.map((media) => (
                <button
                  key={media.src}
                  onClick={() => setActiveImg(media.src)}
                  className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded border ${
                    activeImg === media.src ? "border-[var(--promo-accent)]" : "border-[#e0e0e0]"
                  }`}
                >
                  {media.kind === "video" ? (
                    <video src={media.src} muted playsInline className="h-full w-full object-cover" />
                  ) : (
                    <img src={media.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  )}
                </button>
              ))}
            </div>
          </div>


          {/* Info */}
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-[13px] text-[#666]">
              <span>Novo</span>
              <span>|</span>
              <span>{PRODUCT.sold}</span>
            </div>
            <div className="mb-2 inline-block rounded-sm bg-[#ff7733] px-2 py-0.5 text-[11px] font-semibold text-white">
              MAIS VENDIDO
            </div>
            <div className="mb-1 text-[13px] text-[#666]">
              1º em{" "}
              <a href="#" className="text-[var(--promo-accent)] hover:underline">
                {PRODUCT.categoryTrail.at(-1)} {PRODUCT.brand}
              </a>
            </div>
            <h1 className="mb-2 text-[22px] font-semibold leading-tight text-[#333] md:text-[24px]">
              {PRODUCT.title}
            </h1>
            <div className="mb-4 flex items-center gap-2 text-[14px]">
              <span className="text-[var(--promo-accent)]">{PRODUCT.rating.toFixed(1)}</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[var(--promo-accent)] text-[var(--promo-accent)]" strokeWidth={0} />
                ))}
              </div>
              <span className="text-[var(--promo-accent)]">({PRODUCT.reviewsCount})</span>
            </div>

            <div className="mb-1 flex items-start gap-1">
              <span className="text-[36px] leading-none text-[#333]">R$&nbsp;{priceSplit.int}</span>
              <span className="mt-1 text-[14px] text-[#333]">{priceSplit.dec}</span>
            </div>
            <div className="mb-1 text-[16px] text-[#00a650]">
              {PRODUCT.installments.count}x {formatBRL(PRODUCT.installments.valueCents)} sem juros
            </div>
            <a href="#" className="mb-6 inline-block text-[13px] text-[var(--promo-accent)] hover:underline">
              Ver os meios de pagamento
            </a>

            {/* Cor */}
            <div className="mt-4">
              <div className="mb-2 text-[14px]">
                <span className="text-[#333]">Cor: </span>
                <span className="text-[#333]">{color.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setColorKey(c.key)}
                    title={c.label}
                    className={`h-11 w-11 overflow-hidden rounded border-2 bg-white ${
                      colorKey === c.key ? "border-[var(--promo-accent)]" : "border-transparent hover:border-[#999]"
                    }`}
                  >
                    <img src={c.thumb} alt={c.label} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {requiresSize && (
              <div className="mt-6">
                <div className="mb-2 text-[14px]">
                  <span className="text-[#333]">Tamanho: </span>
                  <span className="text-[#666]">{size ?? "Escolha"}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`min-w-[54px] rounded border px-3 py-2 text-[14px] ${
                        size === s
                          ? "border-[var(--promo-accent)] bg-[var(--promo-accent-soft)] text-[var(--promo-accent)]"
                          : "border-[#c7c7c7] bg-white text-[#333] hover:border-[var(--promo-accent)]"
                      } ${size === null ? "border-dashed" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {PRODUCT.id !== "mercadopromo-kit-sandalias" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="mt-3 inline-flex items-center gap-1 text-[13px] text-[var(--promo-accent)] hover:underline"
                    >
                      <Ruler className="h-3.5 w-3.5" /> Guia de tamanhos
                    </button>
                    <div className="mt-2">
                      <a href="#" className="inline-flex items-center gap-1 text-[13px] text-[var(--promo-accent)] hover:underline">
                        Perfeito para 100% <ChevronDown className="h-3 w-3" />
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="rounded-md border border-[#e6e6e6] p-4">
            <div className="mb-3 inline-flex items-center gap-1 rounded bg-[#00a650] px-2 py-1 text-[12px] font-semibold text-white">
              <Zap className="h-3 w-3 fill-white" strokeWidth={0} />
              FRETE GRÁTIS ACIMA DE R$ 19
            </div>
            <p className="text-[14px]">
              <span className="text-[#00a650]">Chegará grátis amanhã</span> por ser sua primeira compra
            </p>
            <a href="#" className="mt-1 inline-block text-[13px] text-[var(--promo-accent)] hover:underline">
              Mais detalhes e formas de entrega
            </a>

            <p className="mt-4 text-[14px]">
              <span className="text-[#00a650]">Retire grátis</span> a partir de segunda-feira em uma agência Mercado Livre
            </p>
            <a href="#" className="text-[13px] text-[var(--promo-accent)] hover:underline">
              Ver no mapa
            </a>

            <p className="mt-4 text-[14px]">
              <span className="text-[#00a650]">Devolução grátis.</span> Você tem 30 dias a partir da data de recebimento.
            </p>

            <div className="mt-5 text-[14px] text-[#333]">Estoque disponível</div>
            <div className="mt-1 flex items-center gap-2 text-[14px]">
              <span>Quantidade:</span>
              <button
                onClick={() =>
                  setQty((q) => {
                    const next = Math.max(1, q - (q > 1 ? 0 : 0));
                    return next;
                  })
                }
                className="hidden"
              />
              <div className="relative">
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="appearance-none rounded border border-[#c7c7c7] bg-white py-1 pl-3 pr-8 text-[14px]"
                >
                  {[1, 2].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "unidade" : "unidades"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              </div>
              <span className="text-[#666]">(2 disponíveis)</span>
            </div>

            <button
              onClick={onBuy}
              disabled={checkoutLoading}
              className="mt-5 w-full rounded-md bg-[var(--promo-accent)] py-3 text-[16px] font-semibold text-white hover:bg-[var(--promo-accent-hover)] disabled:opacity-70"
            >
              {checkoutLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Abrindo pagamento…
                </span>
              ) : (
                "Comprar agora"
              )}
            </button>
            <button
              onClick={onAddToCart}
              disabled={checkoutLoading}
              className="mt-2 w-full rounded-md bg-[var(--promo-accent-soft)] py-3 text-[16px] font-semibold text-[var(--promo-accent)] hover:bg-[var(--promo-accent-soft-hover)] disabled:opacity-70"
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Adicionar ao carrinho
              </span>
            </button>
            {checkoutError && (
              <div className="mt-2 flex items-start gap-2 rounded-sm bg-red-50 px-3 py-2 text-[12px] text-red-700">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            <div className="mt-5 border-t border-[#eee] pt-4 text-[14px]">
              <div>
                Vendido por{" "}
                <a href="#" className="text-[var(--promo-accent)] hover:underline">
                  {PRODUCT.seller}
                </a>
              </div>
              <div className="text-[13px] text-[#666]">MercadoLíder | +10 mil vendas</div>
            </div>

            <ul className="mt-4 space-y-3 text-[13px]">
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--promo-accent)]" />
                <span>
                  <a href="#" className="text-[var(--promo-accent)] hover:underline">Compra Garantida</a>. Receba o produto que está esperando ou devolvemos o dinheiro.
                </span>
              </li>
              <li className="flex gap-2">
                <Gift className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--promo-accent)]" />
                <span>
                  <a href="#" className="text-[var(--promo-accent)] hover:underline">Vale-troca para presente</a>. A pessoa que o receber poderá trocá-lo.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {PRODUCT.description && <ProductDescription d={PRODUCT.description} />}

        <div className="border-t border-[#eee] p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <SellerCard seller={PRODUCT.seller} />
            <PaymentMethodsCard />
          </div>
        </div>


        {/* Opiniões */}
        <div className="border-t border-[#eee] p-4 md:p-6">
          <h2 className="mb-4 text-[22px] font-semibold">Opiniões do produto</h2>
          <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
            <div>
              <div className="text-[48px] font-light leading-none">{PRODUCT.rating.toFixed(1)}</div>
              <div className="mt-1 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[var(--promo-accent)] text-[var(--promo-accent)]" strokeWidth={0} />
                ))}
              </div>
              <div className="mt-1 text-[13px] text-[#666]">{PRODUCT.reviewsCount} avaliações</div>
              <div className="mt-4 space-y-1">
                {ratingDistribution.map(([star, n]) => (
                  <div key={star} className="flex items-center gap-2 text-[13px]">
                    <span className="w-3 text-[#666]">{star}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded bg-[#eee]">
                      <div
                        className="h-full bg-[var(--promo-accent)]"
                        style={{ width: `${(n / PRODUCT.reviewsCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-[#666]">{n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              {(REVIEWS_BY_ID[PRODUCT.id] ?? JAQUETA_REVIEWS).map((r) => (
                <div key={r.name} className="border-b border-[#eee] pb-4 last:border-0">
                  <div className="mb-1 flex items-center gap-2 text-[13px] text-[#666]">
                    <span>{r.when}</span>
                  </div>
                  <div className="mb-1 flex items-center gap-1 text-[14px]">
                    <span className="text-[#333]">{r.name}</span>
                    {r.verified && (
                      <span className="text-[12px] text-[#00a650]">✓ Verificado</span>
                    )}
                  </div>
                  <div className="mb-2 flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating ? "fill-[var(--promo-accent)] text-[var(--promo-accent)]" : "text-[#ddd]"
                        }`}
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <p className="mb-3 text-[14px] leading-relaxed text-[#333]">{r.text}</p>
                  {(() => {
                    const photos = r.photos ?? (r.photo ? [r.photo] : []);
                    if (photos.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-2">
                        {photos.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setZoomPhoto(p)}
                            className="group relative inline-block overflow-hidden rounded border border-[#eee]"
                          >
                            <img
                              src={p}
                              alt={`Foto ${idx + 1} enviada por ${r.name}`}
                              loading="lazy"
                              className="h-40 w-40 object-cover"
                            />
                            <span className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[var(--promo-accent)] shadow transition-transform group-hover:scale-105">
                              <ZoomIn className="h-4 w-4" />
                            </span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}
      {zoomPhoto && <ZoomModal src={zoomPhoto} onClose={() => setZoomPhoto(null)} />}
      <div className="h-10" />
    </div>
  );
}

// MercadoCheckout e sub-componentes removidos: /mercadopromo agora redireciona
// pro checkout hospedado da Zedy (via createZedyCheckout no server).


// ---------------- Header ----------------
function MLHeader({ mercadoLivreTheme }: { mercadoLivreTheme: boolean }) {
  const [destination, setDestination] = useState("Casa");

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentLocation() {
      if (!("geolocation" in navigator)) return;

      const permissions = navigator.permissions;
      if (permissions?.query) {
        try {
          const status = await permissions.query({ name: "geolocation" as PermissionName });
          if (status.state !== "granted") return;
        } catch {
          return;
        }
      }

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=pt-BR`,
            );
            const data = (await response.json()) as {
              city?: string;
              locality?: string;
              principalSubdivision?: string;
              postcode?: string;
            };
            if (cancelled) return;
            const city = data.city || data.locality || data.principalSubdivision;
            const postcode = data.postcode ? ` ${data.postcode}` : "";
            if (city) setDestination(`${city}${postcode}`);
          } catch {
            if (!cancelled) setDestination("Casa");
          }
        },
        () => {
          if (!cancelled) setDestination("Casa");
        },
        { maximumAge: 30 * 60 * 1000, timeout: 3500 },
      );
    }

    loadCurrentLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="border-b border-[var(--promo-header-border)] bg-[var(--promo-header)]">
      <div className="mx-auto max-w-[1200px] px-3 pb-3 pt-3 md:px-4 md:pb-0">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:flex md:gap-6">
          {/* Logo */}
          <a href="/mercadopromo" className="flex-shrink-0">
            <img
              src={mercadoLivreTheme ? mlLogo : pagarMeLogoUrl}
              alt={mercadoLivreTheme ? "Mercado Livre" : "Pagar.me"}
              className="h-8 w-auto md:h-10"
              draggable={false}
            />
          </a>

          {/* Search */}
          <div className="order-3 col-span-3 mt-1 flex min-w-0 flex-1 items-center rounded bg-white shadow-sm md:order-none md:col-span-1 md:mt-0">
            <input
              type="search"
              placeholder="Buscar produtos, marcas e muito mais..."
              className="min-w-0 flex-1 rounded-l bg-transparent px-3 py-3 text-[14px] text-[#333] outline-none placeholder:text-[#999] md:py-2.5"
            />
            <button className="p-2 pr-3 text-[#999]">
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* CTA + cart */}
          <div className="contents md:flex md:items-center md:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-[var(--promo-accent)] bg-white px-3 py-1 text-[12px] text-[#333] lg:flex">
              <span className="font-semibold text-[var(--promo-accent)]">ASSINE AGORA</span>
              <span className="rounded-full bg-[#00c58f] px-1.5 text-[10px] font-bold text-white">GRÁTIS</span>
              <span className="font-semibold">MELI+</span>
              <span className="text-[10px] text-[#666]">
                A PARTIR DE <b className="text-[#333]">R$ 9,90/MÊS</b>
              </span>
            </div>
            <button className="justify-self-end text-[#333]">
              <ShoppingCart className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Row 2 */}
        <div className="mt-2 hidden items-center gap-4 pb-2 text-[13px] text-[#333] md:flex">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span className="text-[#666]">
              Enviar para{" "}
              {destination === "Casa" ? (
                "Casa"
              ) : (
                <b className="text-[#333]">{destination}</b>
              )}
            </span>
          </div>
          <a href="#" className="hover:underline">Categorias <ChevronDown className="inline h-3 w-3" /></a>
          <a href="#" className="hover:underline">Ofertas</a>
          <a href="#" className="hover:underline">Cupons</a>
          <a href="#" className="hover:underline">Supermercado</a>
          <a href="#" className="hover:underline">Moda</a>
          <a href="#" className="relative hover:underline">
            Mercado Play
            <span className="absolute -top-3 right-0 rounded-sm bg-[#00c58f] px-1 text-[9px] font-bold text-white">GRÁTIS</span>
          </a>
          <a href="#" className="hover:underline">Vender</a>
          <a href="#" className="hover:underline">Contato</a>
        </div>
      </div>
    </header>
  );
}

// ---------------- Product description ----------------
function ProductDescription({
  d,
}: {
  d: NonNullable<Product["description"]>;
}) {
  return (
    <section className="border-t border-[#eee] p-4 md:p-6">
      <h2 className="mb-4 text-[22px] font-semibold text-[#333]">Descrição</h2>
      <div className="max-w-[820px] space-y-4 text-[15px] leading-relaxed text-[#333]">
        <h3 className="text-[18px] font-semibold text-[#333]">{d.heading}</h3>

        <div>
          <h4 className="mb-2 text-[16px] font-semibold text-[#333]">Características</h4>
          <ul className="space-y-1.5">
            {d.benefits.map((b) => (
              <li key={b.title} className="flex gap-2 text-[14px]">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--promo-accent)]" />
                <span>
                  <b className="text-[#333]">{b.title}:</b>{" "}
                  <span className="text-[#555]">{b.result}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-[16px] font-semibold text-[#333]">Especificações</h4>
          <ul className="list-disc space-y-1 pl-5 text-[14px]">
            {d.specs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <p className="rounded-md bg-[#fff8e1] px-4 py-3 text-[14px] text-[#7a5a00]">
          <b>Dica:</b> {d.tip}
        </p>

        <p className="pt-2 text-[13px] text-[#666]">
          <b>Garantia do vendedor:</b> {d.warranty}
        </p>
      </div>
    </section>
  );
}

function SizeGuideModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 px-3 py-8 md:py-12">
      <div className="w-full max-w-[760px] rounded-md bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eee] px-6 py-4">
          <h2 className="text-[26px] font-semibold text-[#111]">Guia de tamanhos</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia de tamanhos"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--promo-accent)] hover:bg-[#f2f6ff]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-6 grid grid-cols-2 border-b border-[#e6e6e6] text-center text-[14px]">
            <div className="pb-2 text-[#bbb]">
              Do corpo
              <div className="mx-auto mt-1 w-fit rounded-full bg-[#eee] px-3 py-0.5 text-[10px] text-[#777]">
                Guia não disponível
              </div>
            </div>
            <div className="border-b-2 border-[var(--promo-accent)] pb-3 font-medium text-[var(--promo-accent)]">Da peça</div>
          </div>

          <h3 className="text-[16px] font-semibold text-[#333]">Tabela de medidas para peças</h3>
          <p className="mt-2 text-[13px] text-[#777]">
            As medidas estão em centímetros e podem variar conforme o modelo.
          </p>

          <div className="mt-4 overflow-hidden rounded-md border border-[#ddd]">
            <table className="w-full border-collapse text-center text-[12px] text-[#333]">
              <thead>
                <tr className="bg-[#f5f5f5]">
                  <th className="bg-[#dce9fb] px-3 py-4 font-semibold">Tamanho na etiqueta</th>
                  <th className="px-3 py-4 font-semibold">Equivalências</th>
                  <th className="px-3 py-4 font-semibold">Largura do peito</th>
                  <th className="px-3 py-4 font-semibold">Altura da peça</th>
                  <th className="px-3 py-4 font-semibold">Largura dos ombros</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row) => (
                  <tr key={row.label} className="border-t border-[#ddd]">
                    <td className="bg-[#dce9fb] px-3 py-4 font-medium text-[#0b1f3f]">{row.label}</td>
                    <td className="px-3 py-4">{row.equivalent}</td>
                    <td className="px-3 py-4">{row.chest}</td>
                    <td className="px-3 py-4">{row.height}</td>
                    <td className="px-3 py-4">{row.shoulders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-7">
            <h3 className="text-[16px] font-semibold text-[#333]">Como medir suas peças</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[#777]">
              Coloque a peça sobre uma superfície plana. Meça a largura do peito de axila a axila,
              a altura da peça do ombro até a barra e a largura dos ombros de ponta a ponta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoomModal({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <div className="relative max-h-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar imagem ampliada"
          className="absolute -right-2 -top-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--promo-accent)] shadow-lg hover:bg-[#f5f5f5]"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src={src}
          alt="Foto ampliada do comprador"
          className="max-h-[86vh] max-w-full rounded-md bg-white object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}

function SellerCard({ seller }: { seller: string }) {
  const isPazeSeller = seller === "Paze Oficial";

  return (
    <aside className="rounded-md border border-[#e6e6e6] p-4">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-[#eee]">
          <img
            src={isPazeSeller ? pazeLogo : SELLER.image}
            alt={seller}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold text-[#333]">{seller}</div>
          <div className="text-[12px] text-[#666]">+1000 Seguidores &nbsp; +500 Produtos</div>
        </div>
        <button className="rounded border border-[var(--promo-accent)] px-3 py-1 text-[12px] text-[var(--promo-accent)] hover:bg-[var(--promo-accent-soft)]">
          Seguir
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[13px] text-[#00a650]">
        <img src={SELLER.medal} alt="" className="h-5 w-5" loading="lazy" />
        MercadoLíder Platinum
      </div>
      <div className="mt-1 text-[12px] text-[#666]">É um dos melhores do site!</div>
      <div className="mt-3 grid grid-cols-4 gap-1">
        <div className="h-1.5 rounded bg-[#f9d0d0]" />
        <div className="h-1.5 rounded bg-[#fce9c0]" />
        <div className="h-1.5 rounded bg-[#f0e58b]" />
        <div className="h-1.5 rounded bg-[#00a650]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px] text-[#666]">
        <div>
          <div className="font-semibold text-[#333]">+10 mil</div>
          Vendas
        </div>
        <div>
          <ThumbsUp className="mx-auto h-4 w-4 text-[#333]" aria-hidden="true" />
          Bom atendimento
        </div>
        <div>
          <Clock3 className="mx-auto h-4 w-4 text-[#333]" aria-hidden="true" />
          Entrega no prazo
        </div>
      </div>
      <button className="mt-4 w-full rounded-md bg-[var(--promo-accent-soft)] py-2 text-[13px] font-semibold text-[var(--promo-accent)] hover:bg-[var(--promo-accent-soft-hover)]">
        Ir para a página do vendedor
      </button>
    </aside>
  );
}

function PaymentMethodsCard() {
  return (
    <aside className="rounded-md border border-[#e6e6e6] p-4">
      <div className="mb-3 text-[16px] font-semibold text-[#333]">Meios de pagamento</div>
      <div className="text-[13px] text-[#333]">Cartões de crédito</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {PAYMENT_METHODS.credit.map((method) => (
          <span key={method.name} className="inline-flex h-8 items-center justify-center rounded border border-[#eee] bg-white px-2">
            <img src={method.src} alt={method.name} className="h-5 max-w-[48px]" loading="lazy" />
          </span>
        ))}
      </div>
      <div className="mt-4 text-[13px] text-[#333]">Pix</div>
      <div className="mt-2">
        <span className="inline-flex h-8 items-center justify-center rounded border border-[#eee] bg-white px-2">
          <img src={PAYMENT_METHODS.pix.src} alt={PAYMENT_METHODS.pix.name} className="h-5 max-w-[48px]" loading="lazy" />
        </span>
      </div>
      <a href="#" className="mt-4 inline-block text-[13px] text-[var(--promo-accent)] hover:underline">
        Confira outros meios de pagamento
      </a>
    </aside>
  );
}

