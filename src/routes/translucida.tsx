import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type FormEvent,
} from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Heart,
  Loader2,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Info,
  Menu,
} from "lucide-react";
import { createHypercashTransaction, getHypercashTransaction } from "@/lib/hypercash.functions";
import { recordLead, updateLeadStatus } from "@/lib/leads.functions";
import { fbqInit, fbqTrackPageViewOnce, fbqTrackSingle } from "@/lib/pixel";

// Asset Imports
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
import translucidaReview1 from "@/assets/mercadopromo/translucida-review-1.png";
import translucidaReview2 from "@/assets/mercadopromo/translucida-review-2.png";
import translucidaReview3 from "@/assets/mercadopromo/translucida-review-3.png";
import pixLogoImg from "@/assets/logos/pix-banco-central-seeklogo.png";
import cartoesLogoImg from "@/assets/logos/bandeiras-de-cartao-de-credito-seeklogo.png";

const CROCS_LOGO_URL = "https://crocsbr.vtexassets.com/assets/vtex.file-manager-graphql/images/9277fd7c-4f8a-4c7a-9974-bfe53b85e56b___e1bc85b30c00f1bb85fd3805649453ef.png";
const PIXEL_ID = "1108161594900025";
const CARD_PRICE = 49.90;
const PIX_PRICE = 47.40;
const SIZES = ["33", "34", "35", "36", "37", "38", "39", "40", "41", "42"] as const;

const COLORS = [
  {
    key: "branca",
    label: "Branca",
    hex: "#ffffff",
    border: "#d0d0d0",
    images: [translucidaBranca1, translucidaBranca2, translucidaBranca3],
  },
  {
    key: "marrom",
    label: "Marrom",
    hex: "#8b5a2b",
    border: "#6b421a",
    images: [translucidaMarrom1, translucidaMarrom2],
  },
  {
    key: "rosa",
    label: "Rosa",
    hex: "#f48fb1",
    border: "#d81b60",
    images: [translucidaRosa1, translucidaRosa2, translucidaRosa3],
  },
  {
    key: "preta",
    label: "Preta",
    hex: "#1d1d1d",
    border: "#000000",
    images: [translucidaPreta1, translucidaPreta2, translucidaPreta3],
  },
] as const;

type ColorType = (typeof COLORS)[number];
type PaymentMethod = "PIX" | "CREDIT_CARD";

export const Route = createFileRoute("/translucida")({
  component: TranslucidaPage,
});

export function TranslucidaPage() {
  const createTx = useServerFn(createHypercashTransaction);
  const getTx = useServerFn(getHypercashTransaction);
  const recordLeadFn = useServerFn(recordLead);
  const updateLeadFn = useServerFn(updateLeadStatus);

  // Selection state (starts with no pre-selected size)
  const [selectedColor, setSelectedColor] = useState<ColorType>(COLORS[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{
    key: string;
    name: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
    image: string;
  }>>([]);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accordion open states
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    detalhes: true,
    especificacoes: false,
    devolucao: false,
    avaliacoes: false,
  });

  // Shipping calculator
  const [shippingCep, setShippingCep] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingCalculated, setShippingCalculated] = useState(false);

  // Checkout modal state: 1 (Dados), 2 (Entrega & Pagamento), 3 (Pix QR), 4 (Sucesso)
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [txData, setTxData] = useState<{
    id: string;
    status: string;
    pix?: { qrcode?: string; expirationDate?: string } | null;
  } | null>(null);
  const [pixCountdown, setPixCountdown] = useState(900); // 15 mins
  const [pixCopied, setPixCopied] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Customer & Shipping Form
  const [customerForm, setCustomerForm] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  // Card Form
  const [cardForm, setCardForm] = useState({
    number: "",
    holderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    installments: 1,
  });

  // Trigger Toast Notification
  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Pixel Initialization
  useEffect(() => {
    fbqInit(PIXEL_ID);
    fbqTrackPageViewOnce(PIXEL_ID);
    fbqTrackSingle(PIXEL_ID, "ViewContent", {
      content_name: "Jelly Mule Feminina",
      content_ids: ["sandalia-translucida-jelly-mule"],
      content_type: "product",
      value: CARD_PRICE,
      currency: "BRL",
    });
  }, []);

  // Reset active image index when color changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColor]);

  // CEP Auto-lookup
  const handleCepChange = async (cepVal: string) => {
    const clean = cepVal.replace(/\D/g, "").slice(0, 8);
    let formatted = clean;
    if (clean.length > 5) {
      formatted = `${clean.slice(0, 5)}-${clean.slice(5)}`;
    }
    setCustomerForm((prev) => ({ ...prev, zipCode: formatted }));

    if (clean.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setCustomerForm((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch (e) {}
    }
  };

  // Stepper quantity handlers
  const handleDecQty = () => setQuantity((q) => Math.max(1, q - 1));
  const handleIncQty = () => setQuantity((q) => Math.min(10, q + 1));

  // Add to Cart
  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      showToast("⚠️ Por favor, selecione seu tamanho antes de adicionar à sacola.");
      const el = document.getElementById("tamanhos");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSizeError(false);

    const itemKey = `${selectedColor.key}-${selectedSize}`;
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.key === itemKey);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          key: itemKey,
          name: "Jelly Mule Feminina",
          color: selectedColor.label,
          size: selectedSize,
          price: CARD_PRICE,
          quantity: quantity,
          image: selectedColor.images[0],
        },
      ];
    });
    setCartOpen(true);
    showToast(`"Jelly Mule ${selectedColor.label} (Tam ${selectedSize})" adicionada à sacola!`);
    fbqTrackSingle(PIXEL_ID, "AddToCart", {
      content_name: "Jelly Mule Feminina",
      content_ids: ["sandalia-translucida-jelly-mule"],
      content_type: "product",
      value: CARD_PRICE * quantity,
      currency: "BRL",
    });
  };

  // Open Checkout
  const handleOpenCheckout = () => {
    if (!selectedSize) {
      setSizeError(true);
      showToast("⚠️ Por favor, selecione seu tamanho para comprar.");
      const el = document.getElementById("tamanhos");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSizeError(false);

    setCartOpen(false);
    setCheckoutStep(1);
    setCheckoutError(null);
    setCheckoutOpen(true);
    fbqTrackSingle(PIXEL_ID, "InitiateCheckout", {
      content_name: "Jelly Mule Feminina",
      content_ids: ["sandalia-translucida-jelly-mule"],
      content_type: "product",
      value: (paymentMethod === "PIX" ? PIX_PRICE : CARD_PRICE) * quantity,
      currency: "BRL",
      num_items: quantity,
    });
  };

  // Step 1 Validation & Proceed to Step 2
  const handleContinueToStep2 = (e: FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (!customerForm.name.trim()) {
      setCheckoutError("Por favor, preencha seu nome completo.");
      return;
    }
    const cleanCpf = customerForm.cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      setCheckoutError("Por favor, digite um CPF válido com 11 dígitos.");
      return;
    }
    const cleanPhone = customerForm.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setCheckoutError("Por favor, digite um número de WhatsApp válido.");
      return;
    }
    if (!customerForm.email.includes("@") || !customerForm.email.includes(".")) {
      setCheckoutError("Por favor, digite um e-mail válido.");
      return;
    }

    // Capture / Record Lead in Step 1 (Status: ABANDONED until they pay)
    const leadId = currentLeadId || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setCurrentLeadId(leadId);
    recordLeadFn({
      data: {
        leadId,
        productTitle: "Jelly Mule Feminina",
        productColor: selectedColor.label,
        productSize: selectedSize || "37",
        quantity,
        totalAmount: (paymentMethod === "PIX" ? PIX_PRICE : CARD_PRICE) * quantity,
        customer: {
          name: customerForm.name.trim(),
          cpf: customerForm.cpf.trim(),
          phone: customerForm.phone.trim(),
          email: customerForm.email.trim(),
        },
        status: "ABANDONED",
      },
    }).catch(() => {});

    setCheckoutStep(2);
  };

  // Submit Checkout Transaction (Step 2)
  const handleSubmitCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    const cleanCep = customerForm.zipCode.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setCheckoutError("Por favor, digite um CEP válido com 8 dígitos.");
      return;
    }
    if (!customerForm.street.trim() || !customerForm.number.trim() || !customerForm.city.trim() || !customerForm.state.trim()) {
      setCheckoutError("Por favor, preencha todos os campos obrigatórios do endereço.");
      return;
    }

    if (paymentMethod === "CREDIT_CARD") {
      const cleanCard = cardForm.number.replace(/\D/g, "");
      if (cleanCard.length < 15) {
        setCheckoutError("Por favor, digite o número do cartão completo.");
        return;
      }
      if (!cardForm.holderName.trim()) {
        setCheckoutError("Por favor, digite o nome impresso no cartão.");
        return;
      }
      if (!cardForm.expMonth || !cardForm.expYear) {
        setCheckoutError("Por favor, informe a validade do cartão (mês e ano).");
        return;
      }
      if (cardForm.cvv.replace(/\D/g, "").length < 3) {
        setCheckoutError("Por favor, informe o código de segurança (CVV).");
        return;
      }
    }

    setCheckoutLoading(true);

    const pricePerUnit = paymentMethod === "PIX" ? PIX_PRICE : CARD_PRICE;
    const unitPriceCents = Math.round(pricePerUnit * 100);

    const payload: any = {
      paymentMethod,
      items: [
        {
          slug: "sandalia-translucida-jelly-mule",
          title: `Jelly Mule Feminina - ${selectedColor.label} (Tam ${selectedSize || "37"})`,
          unitPriceCents: unitPriceCents,
          quantity: quantity,
        },
      ],
      shippingFeeCents: 0,
      customer: {
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        document: customerForm.cpf.replace(/\D/g, ""),
        phone: customerForm.phone.replace(/\D/g, ""),
      },
      address: {
        street: customerForm.street.trim(),
        streetNumber: customerForm.number.trim(),
        complement: customerForm.complement.trim() || undefined,
        zipCode: customerForm.zipCode.replace(/\D/g, ""),
        neighborhood: customerForm.neighborhood.trim(),
        city: customerForm.city.trim(),
        state: customerForm.state.toUpperCase().trim(),
      },
    };

    if (paymentMethod === "CREDIT_CARD") {
      payload.card = {
        number: cardForm.number.replace(/\D/g, ""),
        holderName: cardForm.holderName.trim().toUpperCase(),
        expirationMonth: Number(cardForm.expMonth),
        expirationYear: Number(cardForm.expYear.length === 2 ? `20${cardForm.expYear}` : cardForm.expYear),
        cvv: cardForm.cvv.replace(/\D/g, ""),
        installments: Number(cardForm.installments),
      };
    }

    // Track AddPaymentInfo when user submits checkout
    fbqTrackSingle(PIXEL_ID, "AddPaymentInfo", {
      content_name: "Jelly Mule Feminina",
      content_ids: ["sandalia-translucida-jelly-mule"],
      content_type: "product",
      value: pricePerUnit * quantity,
      currency: "BRL",
      payment_type: paymentMethod,
    });

    try {
      const res = await createTx({ data: payload });

      if (res && res.id) {
        setTxData(res);
        if (paymentMethod === "PIX") {
          // Update Lead to PIX_GENERATED with Pix Code
          if (currentLeadId) {
            updateLeadFn({
              data: {
                leadId: currentLeadId,
                status: "PIX_GENERATED",
                paymentMethod: "PIX",
                transactionId: res.id,
                pixCode: res.pix?.qrcode || "",
                shipping: {
                  zipCode: customerForm.zipCode,
                  street: customerForm.street,
                  number: customerForm.number,
                  complement: customerForm.complement,
                  neighborhood: customerForm.neighborhood,
                  city: customerForm.city,
                  state: customerForm.state,
                },
              },
            }).catch(() => {});
          }

          // Track Pix Generation for funnel optimization
          fbqTrackSingle(PIXEL_ID, "Lead", {
            content_name: "Jelly Mule Feminina - Pix Gerado",
            value: PIX_PRICE * quantity,
            currency: "BRL",
          });
          if (typeof window !== "undefined" && typeof window.fbq === "function") {
            window.fbq("trackCustom", "PixGenerated", {
              order_id: res.id,
              value: PIX_PRICE * quantity,
              currency: "BRL",
            });
          }
          setCheckoutStep(3);
          startPixPolling(res.id);
        } else {
          // Credit Card processed
          if (res.status === "PAID" || res.status === "paid" || res.status === "approved") {
            if (currentLeadId) {
              updateLeadFn({
                data: {
                  leadId: currentLeadId,
                  status: "PAID",
                  paymentMethod: "CREDIT_CARD",
                  transactionId: res.id,
                  shipping: {
                    zipCode: customerForm.zipCode,
                    street: customerForm.street,
                    number: customerForm.number,
                    complement: customerForm.complement,
                    neighborhood: customerForm.neighborhood,
                    city: customerForm.city,
                    state: customerForm.state,
                  },
                },
              }).catch(() => {});
            }

            setCheckoutStep(4);
            fbqTrackSingle(PIXEL_ID, "Purchase", {
              content_name: "Jelly Mule Feminina",
              content_ids: ["sandalia-translucida-jelly-mule"],
              content_type: "product",
              value: CARD_PRICE * quantity,
              currency: "BRL",
              order_id: res.id,
              num_items: quantity,
            });
          } else if (res.status === "WAITING_PAYMENT") {
            setCheckoutStep(4);
          } else {
            throw new Error(`Status da transação: ${res.status}`);
          }
        }
      } else {
        throw new Error("Erro ao criar transação no gateway.");
      }
    } catch (err: any) {
      setCheckoutError(err?.message || "Erro ao processar transação.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Pix Polling
  const startPixPolling = (txId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const check = await getTx({ data: { id: txId } });
        if (check && (check.status === "PAID" || check.status === "paid" || check.status === "approved")) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (currentLeadId) {
            updateLeadFn({
              data: {
                leadId: currentLeadId,
                status: "PAID",
              },
            }).catch(() => {});
          }
          setCheckoutStep(4);
          showToast("🎉 Pagamento Aprovado com Sucesso!");
          fbqTrackSingle(PIXEL_ID, "Purchase", {
            content_name: "Jelly Mule Feminina",
            content_ids: ["sandalia-translucida-jelly-mule"],
            content_type: "product",
            value: PIX_PRICE * quantity,
            currency: "BRL",
            order_id: txId,
          });
        }
      } catch (e) {}
    }, 3000);
  };

  // Pix Timer
  useEffect(() => {
    if (checkoutStep === 3 && pixCountdown > 0) {
      const timer = setInterval(() => setPixCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [checkoutStep, pixCountdown]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleCopyPix = () => {
    if (txData?.pix?.qrcode) {
      navigator.clipboard.writeText(txData.pix.qrcode);
      setPixCopied(true);
      showToast("Chave Pix Copiada com Sucesso!");
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-white text-[#272727] font-sans antialiased selection:bg-[#ebf2e3]">
      
      {/* 1. TOPBAR */}
      <div className="bg-[#141215] text-white text-xs font-bold uppercase tracking-wider py-2 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚡ FRETE GRÁTIS PARA TODO O BRASIL | PARCELE EM ATÉ 6X SEM JUROS</span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-[11px] opacity-90">
            <a href="#detalhes" className="hover:text-[#80c142] transition-colors">Detalhes</a>
            <a href="#avaliacoes" className="hover:text-[#80c142] transition-colors">Avaliações</a>
            <button onClick={() => setSizeGuideOpen(true)} className="hover:text-[#80c142] transition-colors uppercase">
              Tabela de Medidas
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="border-b border-[#e3e4e6] bg-white sticky top-[33px] z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1 text-[#222]"
              aria-label="Abrir Menu"
            >
              <Menu size={24} />
            </button>
            <a href="#" className="flex items-center">
              <img
                src={CROCS_LOGO_URL}
                alt="Crocs Logo"
                className="h-8 md:h-9 w-auto object-contain"
              />
            </a>
            <nav className="hidden md:flex items-center gap-6 ml-6 text-sm font-bold uppercase tracking-wide">
              <a href="#" className="text-[#80c142]">Destaque Verão</a>
              <a href="#detalhes" className="text-[#222] hover:text-[#80c142] transition-colors">Benefícios</a>
              <a href="#especificacoes" className="text-[#222] hover:text-[#80c142] transition-colors">Especificações</a>
              <a href="#avaliacoes" className="text-[#222] hover:text-[#80c142] transition-colors">Avaliações (5.0 ★)</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast("Salvo nos seus favoritos! ❤️")}
              className="p-2 text-[#222] hover:text-[#80c142] transition-colors"
              aria-label="Favoritos"
            >
              <Heart size={22} />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 text-[#222] hover:text-[#80c142] relative transition-colors"
              aria-label="Sacola de Compras"
            >
              <ShoppingBag size={22} />
              {cartItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#80c142] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. BREADCRUMBS */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        <a href="#" className="hover:underline">Home</a>
        <span>&gt;</span>
        <a href="#" className="hover:underline">Calçados Femininos</a>
        <span>&gt;</span>
        <span className="font-bold text-gray-900">Jelly Mule Feminina Translúcida</span>
      </div>

      {/* 4. MAIN PRODUCT SHOWCASE */}
      <main className="max-w-7xl mx-auto px-4 py-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: GALLERY */}
          <div className="lg:col-span-7">
            {/* Desktop Gallery Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {selectedColor.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative bg-[#f8f9fa] border border-[#e3e4e6] rounded-md overflow-hidden cursor-zoom-in group ${
                    idx === 0 ? "col-span-2 aspect-4/3" : "aspect-square"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Jelly Mule ${selectedColor.label} ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full shadow-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={16} />
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile Gallery Slider */}
            <div className="lg:hidden relative -mx-4 overflow-hidden">
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none aspect-square bg-[#f8f9fa]">
                {selectedColor.images.map((img, idx) => (
                  <div key={idx} className="w-full shrink-0 snap-start relative aspect-square">
                    <img
                      src={img}
                      alt={`Jelly Mule ${selectedColor.label} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 py-3">
                {selectedColor.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      activeImageIndex === idx ? "w-6 bg-black" : "w-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: BUY BOX & OPTIONS */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            
            {/* Header / Brand */}
            <div>
              <span className="inline-block bg-[#fff0e6] text-[#ff7733] font-bold text-xs uppercase px-2 py-0.5 rounded tracking-wide mb-1">
                🔥 Mais Vendido | +5 Mil Vendidos
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-[#141215] uppercase tracking-tight">
                Jelly Mule Feminina
              </h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <div className="flex text-amber-400">
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                  <Star size={15} fill="currentColor" />
                </div>
                <span className="font-bold text-gray-900">5.0</span>
                <a href="#avaliacoes" className="underline hover:text-gray-900">
                  (528 avaliações)
                </a>
                <span>•</span>
                <span>Ref: JM-2026</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#fafafa] border border-[#e3e4e6] rounded-lg">
              <div className="text-xs text-gray-400 line-through">De R$ 119,90</div>
              <div className="flex items-baseline gap-3 my-0.5">
                <span className="text-3xl font-black text-[#141215]">
                  R$ {CARD_PRICE.toFixed(2).replace(".", ",")}
                </span>
                <span className="bg-[#e5f7e7] text-[#00873e] text-xs font-black px-2 py-0.5 rounded">
                  58% OFF
                </span>
              </div>
              <div className="text-xs font-semibold text-[#00873e]">
                ou em até <strong>6x de R$ 8,31 sem juros</strong> no cartão
              </div>
              <div className="mt-2 text-xs text-gray-700 font-medium">
                ⚡ Pagando no Pix ganhe 5% OFF extra: <strong className="text-[#00873e]">R$ {PIX_PRICE.toFixed(2).replace(".", ",")}</strong>
              </div>

              {/* Official Payment Badges */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-semibold">
                  <Lock size={14} className="text-[#00873e]" />
                  <span>Pagamento 100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={pixLogoImg} alt="Pix Oficial" className="h-6 w-auto object-contain bg-white p-0.5 rounded border border-gray-200" />
                  <img src={cartoesLogoImg} alt="Cartões de Crédito" className="h-6 w-auto object-contain bg-white p-0.5 rounded border border-gray-200" />
                </div>
              </div>
            </div>

            {/* Color Swatches */}
            <div>
              <div className="text-xs font-bold text-gray-900 uppercase mb-2">
                Cor: <span className="text-gray-700">{selectedColor.label}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setSelectedColor(c)}
                    className={`w-12 h-12 rounded-md p-0.5 border-2 transition-all overflow-hidden ${
                      selectedColor.key === c.key ? "border-black scale-105 shadow-xs" : "border-transparent hover:border-gray-300"
                    }`}
                    title={c.label}
                  >
                    <img src={c.images[0]} alt={c.label} className="w-full h-full object-cover rounded" />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Grid (33 ao 42) */}
            <div id="tamanhos" className={`p-2.5 rounded-lg transition-all ${sizeError && !selectedSize ? "bg-amber-50 border-2 border-amber-400" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900 uppercase">
                  Tamanho BR: <span className={selectedSize ? "text-gray-900 font-black" : "text-amber-700 font-bold"}>{selectedSize ? `${selectedSize}` : "Selecione"}</span>
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-gray-600 underline font-semibold hover:text-[#80c142] flex items-center gap-1"
                >
                  <Info size={14} /> Guia de Medidas
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedSize(s);
                      setSizeError(false);
                    }}
                    className={`h-11 rounded font-bold text-sm transition-all border ${
                      selectedSize === s
                        ? "bg-[#141215] text-white border-[#141215] scale-105 shadow-xs"
                        : sizeError && !selectedSize
                        ? "bg-white text-gray-900 border-amber-400 hover:border-black"
                        : "bg-white text-gray-800 border-[#e3e4e6] hover:border-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && !selectedSize && (
                <div className="text-[11px] text-amber-700 font-bold mt-1.5 flex items-center gap-1">
                  👉 Por favor, escolha seu número acima para continuar.
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-2.5 pt-2">
              <div className="flex gap-2.5">
                <div className="flex items-center border border-[#e3e4e6] rounded-full bg-white px-2 h-12">
                  <button onClick={handleDecQty} className="p-2 text-gray-600 hover:text-black">
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                  <button onClick={handleIncQty} className="p-2 text-gray-600 hover:text-black">
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 border-2 border-[#141215] text-[#141215] font-black uppercase text-xs tracking-wider rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} /> Adicionar à Sacola
                </button>
              </div>

              <button
                onClick={handleOpenCheckout}
                className="w-full h-13 bg-[#80c142] hover:bg-[#72b037] text-black font-black uppercase text-sm tracking-wider rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                COMPRAR AGORA
              </button>
            </div>

            {/* Guarantee Tag */}
            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] border border-[#e3e4e6] rounded-md text-xs text-gray-600">
              <Truck size={20} className="text-[#00873e] shrink-0" />
              <div>
                <strong>Frete Grátis Especial</strong> + Garantia de 30 dias para troca ou devolução sem custos.
              </div>
            </div>

            {/* Shipping Calculator */}
            <div className="p-4 border border-[#e3e4e6] rounded-lg bg-white">
              <div className="text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5 mb-2">
                <Truck size={16} /> Simulador de Frete
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  maxLength={9}
                  value={shippingCep}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "").slice(0, 8);
                    if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`;
                    setShippingCep(v);
                  }}
                  className="flex-1 h-10 border border-[#e3e4e6] rounded px-3 text-xs focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (shippingCep.replace(/\D/g, "").length === 8) {
                      setShippingLoading(true);
                      setTimeout(() => {
                        setShippingLoading(false);
                        setShippingCalculated(true);
                      }, 500);
                    } else {
                      showToast("Digite um CEP válido com 8 dígitos.");
                    }
                  }}
                  className="h-10 px-4 bg-[#141215] text-white font-bold text-xs uppercase rounded hover:bg-black"
                >
                  Calcular
                </button>
              </div>

              {shippingLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <Loader2 size={14} className="animate-spin text-[#80c142]" /> Calculando prazos de entrega...
                </div>
              )}

              {shippingCalculated && !shippingLoading && (
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 bg-[#ebf2e3] border border-[#cde6b3] rounded">
                    <div>
                      <span className="font-bold text-[#45781a] block">Frete Grátis Especial</span>
                      <span className="text-gray-500 text-[11px]">Chegará em 3 a 5 dias úteis</span>
                    </div>
                    <span className="font-black text-[#45781a]">GRÁTIS</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordions */}
            <div className="space-y-2 pt-2">
              
              {/* 1. Detalhes & Benefícios */}
              <div className="border border-[#e3e4e6] rounded-md overflow-hidden" id="detalhes">
                <button
                  onClick={() => toggleAccordion("detalhes")}
                  className="w-full p-3.5 bg-white flex items-center justify-between text-left font-bold text-sm text-[#141215]"
                >
                  <span>Descrição &amp; Por Que Você Vai Amar</span>
                  <ChevronDown size={18} className={`transition-transform ${openAccordions.detalhes ? "rotate-180" : ""}`} />
                </button>
                {openAccordions.detalhes && (
                  <div className="p-4 pt-0 text-xs text-gray-700 space-y-3 leading-relaxed border-t border-gray-100">
                    <p className="font-bold text-black mt-2">JELLY MULE FEMININA – A TENDÊNCIA QUE VAI DOMINAR O VERÃO</p>
                    <p>Com visual moderno, acabamento translúcido e um design anatômico que valoriza qualquer produção, ela combina conforto inigualável, estilo e personalidade.</p>
                    <div className="space-y-2">
                      <div className="bg-[#fbfbfb] p-2.5 rounded border-l-3 border-[#80c142]">
                        <strong className="text-black block">✨ Visual Moderno e Estiloso</strong>
                        <span className="text-gray-600">Acabamento translúcido trançado de alta durabilidade.</span>
                      </div>
                      <div className="bg-[#fbfbfb] p-2.5 rounded border-l-3 border-[#80c142]">
                        <strong className="text-black block">☁️ Material Flexível e Confortável</strong>
                        <span className="text-gray-600">Acompanha os passos sem machucar ou apertar o peito do pé.</span>
                      </div>
                      <div className="bg-[#fbfbfb] p-2.5 rounded border-l-3 border-[#80c142]">
                        <strong className="text-black block">🌊 Resistente e Lavável</strong>
                        <span className="text-gray-600">Ideal para praia, piscina, passeios e uso diário.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Especificações */}
              <div className="border border-[#e3e4e6] rounded-md overflow-hidden" id="especificacoes">
                <button
                  onClick={() => toggleAccordion("especificacoes")}
                  className="w-full p-3.5 bg-white flex items-center justify-between text-left font-bold text-sm text-[#141215]"
                >
                  <span>Especificações Técnicas</span>
                  <ChevronDown size={18} className={`transition-transform ${openAccordions.especificacoes ? "rotate-180" : ""}`} />
                </button>
                {openAccordions.especificacoes && (
                  <div className="p-4 pt-0 text-xs border-t border-gray-100">
                    <table className="w-full divide-y divide-gray-200 mt-2">
                      <tbody>
                        <tr><td className="py-1.5 font-bold text-gray-500 w-1/3">Produto</td><td className="py-1.5">01 Sandália Jelly Mule Feminina Translúcida</td></tr>
                        <tr><td className="py-1.5 font-bold text-gray-500">Material</td><td className="py-1.5">Jelly (PVC macio e flexível de alta qualidade)</td></tr>
                        <tr><td className="py-1.5 font-bold text-gray-500">Solado</td><td className="py-1.5">Antiderrapante com aderência reforçada</td></tr>
                        <tr><td className="py-1.5 font-bold text-gray-500">Cores</td><td className="py-1.5">Branca, Marrom, Rosa e Preta</td></tr>
                        <tr><td className="py-1.5 font-bold text-gray-500">Numeração</td><td className="py-1.5">33 ao 42 (Padrão BR)</td></tr>
                        <tr><td className="py-1.5 font-bold text-gray-500">Garantia</td><td className="py-1.5">30 dias com troca/devolução grátis</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 3. Devoluções */}
              <div className="border border-[#e3e4e6] rounded-md overflow-hidden" id="devolucao">
                <button
                  onClick={() => toggleAccordion("devolucao")}
                  className="w-full p-3.5 bg-white flex items-center justify-between text-left font-bold text-sm text-[#141215]"
                >
                  <span>Garantia &amp; Troca Grátis (30 Dias)</span>
                  <ChevronDown size={18} className={`transition-transform ${openAccordions.devolucao ? "rotate-180" : ""}`} />
                </button>
                {openAccordions.devolucao && (
                  <div className="p-4 pt-0 text-xs text-gray-700 leading-relaxed border-t border-gray-100">
                    <p className="mt-2">Você tem até <strong>30 dias corridos</strong> após o recebimento para solicitar troca de tamanho, cor ou devolução sem custo algum.</p>
                  </div>
                )}
              </div>

              {/* 4. Avaliações */}
              <div className="border border-[#e3e4e6] rounded-md overflow-hidden" id="avaliacoes">
                <button
                  onClick={() => toggleAccordion("avaliacoes")}
                  className="w-full p-3.5 bg-white flex items-center justify-between text-left font-bold text-sm text-[#141215]"
                >
                  <span>Avaliações dos Clientes (528) ★★★★★</span>
                  <ChevronDown size={18} className={`transition-transform ${openAccordions.avaliacoes ? "rotate-180" : ""}`} />
                </button>
                {openAccordions.avaliacoes && (
                  <div className="p-4 pt-0 space-y-4 text-xs border-t border-gray-100">
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-3xl font-black text-black">5.0</span>
                      <div>
                        <div className="flex text-amber-400"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
                        <span className="text-gray-500 text-[11px]">98% dos compradores recomendam este produto</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* Review 1 */}
                      <div className="border-b border-gray-100 pb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-black">isabela.costa <span className="bg-[#e5f7e7] text-[#00873e] text-[10px] px-1.5 py-0.5 rounded ml-1">Verificada</span></span>
                          <span className="text-gray-400 text-[11px]">há 3 dias</span>
                        </div>
                        <p className="text-gray-700">Gente, que sandália LINDA! O acabamento translúcido é perfeito. Super leve e confortável nos pés. Já quero em outra cor!</p>
                        <img src={translucidaReview1} alt="Foto Review 1" className="w-16 h-16 object-cover rounded mt-2 border border-gray-200" />
                      </div>

                      {/* Review 2 */}
                      <div className="border-b border-gray-100 pb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-black">renata.oliveira <span className="bg-[#e5f7e7] text-[#00873e] text-[10px] px-1.5 py-0.5 rounded ml-1">Verificada</span></span>
                          <span className="text-gray-400 text-[11px]">há 1 semana</span>
                        </div>
                        <p className="text-gray-700">Chegou super rápido! A Jelly Mule é flexível e o tamanho 37 serviu certinho. Levei pra praia e fez o maior sucesso!</p>
                        <img src={translucidaReview2} alt="Foto Review 2" className="w-16 h-16 object-cover rounded mt-2 border border-gray-200" />
                      </div>

                      {/* Review 3 */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-black">ana.beatriz.m <span className="bg-[#e5f7e7] text-[#00873e] text-[10px] px-1.5 py-0.5 rounded ml-1">Verificada</span></span>
                          <span className="text-gray-400 text-[11px]">há 1 semana</span>
                        </div>
                        <p className="text-gray-700">Amei demais! Material macio e delicado. Preço super acessível comparado com lojas de shopping.</p>
                        <img src={translucidaReview3} alt="Foto Review 3" className="w-16 h-16 object-cover rounded mt-2 border border-gray-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* 5. FOOTER */}
      <footer className="border-t border-[#e3e4e6] bg-white py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-gray-600">
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-3">Atendimento &amp; Garantia</h4>
            <ul className="space-y-1.5">
              <li><a href="#" className="hover:underline">Rastrear Meu Pedido</a></li>
              <li><a href="#" className="hover:underline">Trocas e Devoluções (30 Dias)</a></li>
              <li><button onClick={() => setSizeGuideOpen(true)} className="hover:underline">Tabela de Medidas</button></li>
              <li><a href="#" className="hover:underline">Dúvidas Frequentes</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-3">Segurança na Compra</h4>
            <ul className="space-y-1.5">
              <li><span className="text-gray-800">Pagamento 100% Criptografado</span></li>
              <li><span className="text-gray-800">Frete Grátis com Seguro Total</span></li>
              <li><span className="text-gray-800">Garantia de Satisfação de 30 Dias</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-3">Formas de Pagamento</h4>
            <div className="flex items-center gap-2 flex-wrap">
              <img src={pixLogoImg} alt="Pix Oficial Banco Central" className="h-8 w-auto object-contain bg-white p-1 rounded border border-gray-200" />
              <img src={cartoesLogoImg} alt="Bandeiras de Cartão" className="h-8 w-auto object-contain bg-white p-1 rounded border border-gray-200" />
            </div>
            <div className="text-[11px] text-gray-500 mt-2">
              🔒 Ambiente Seguro com Certificado SSL ativo de 256 bits.
            </div>
          </div>
        </div>
      </footer>

      {/* 6. MOBILE STICKY BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e3e4e6] p-3 z-30 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <img src={selectedColor.images[0]} alt="Jelly Mule" className="w-10 h-10 object-cover rounded border border-gray-200" />
          <div>
            <div className="text-xs font-bold text-gray-900">
              Jelly Mule {selectedSize ? `(Tam ${selectedSize})` : ""}
            </div>
            <div className="text-sm font-black text-[#00873e]">R$ {PIX_PRICE.toFixed(2).replace(".", ",")} no Pix</div>
          </div>
        </div>
        <button
          onClick={handleOpenCheckout}
          className="px-5 h-11 bg-[#80c142] text-black font-black text-xs uppercase tracking-wider rounded-full shadow hover:bg-[#72b037]"
        >
          COMPRAR AGORA
        </button>
      </div>

      {/* 7. SLIDE-OVER MINICART DRAWER */}
      {cartOpen && (
        <>
          <div onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs" />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase flex items-center gap-2">
                <ShoppingBag size={18} /> Sua Sacola
              </h3>
              <button onClick={() => setCartOpen(false)} className="p-1 text-gray-500 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <div className="bg-[#f6fbf2] p-2.5 border-b border-[#e0f0d5] text-xs text-[#00873e] font-bold text-center">
              🎉 Parabéns! Você ganhou <strong>FRETE GRÁTIS</strong>!
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  Sua sacola está vazia.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.key} className="flex gap-3 border-b border-gray-100 pb-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border border-gray-200 shrink-0" />
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-black">{item.name}</div>
                      <div className="text-gray-500 text-[11px]">Cor: {item.color} | Tam: {item.size}</div>
                      <div className="font-bold text-black mt-1">
                        {item.quantity}x R$ {item.price.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
                <div className="flex justify-between font-black text-base text-black">
                  <span>Total</span>
                  <span>R$ {(cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0)).toFixed(2).replace(".", ",")}</span>
                </div>
                <button
                  onClick={handleOpenCheckout}
                  className="w-full h-12 bg-[#80c142] text-black font-black uppercase text-xs tracking-wider rounded-full shadow hover:bg-[#72b037]"
                >
                  FINALIZAR COMPRA
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 8. SIZE GUIDE MODAL */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm uppercase text-gray-900">Tabela de Medidas (33 ao 42)</h3>
              <button onClick={() => setSizeGuideOpen(false)} className="p-1 text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Meça do calcanhar à ponta do dedão para escolher a numeração perfeita:
            </p>
            <table className="w-full text-xs text-left divide-y divide-gray-200">
              <thead className="bg-gray-50 font-bold text-gray-700">
                <tr><th className="p-2">Numeração BR</th><th className="p-2">Comprimento em Centímetros</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="p-2 font-bold">33 BR</td><td className="p-2">21,5 - 22,0 cm</td></tr>
                <tr><td className="p-2 font-bold">34 BR</td><td className="p-2">22,1 - 22,5 cm</td></tr>
                <tr><td className="p-2 font-bold">35 BR</td><td className="p-2">22,6 - 23,2 cm</td></tr>
                <tr><td className="p-2 font-bold">36 BR</td><td className="p-2">23,3 - 23,8 cm</td></tr>
                <tr><td className="p-2 font-bold">37 BR</td><td className="p-2">23,9 - 24,5 cm</td></tr>
                <tr><td className="p-2 font-bold">38 BR</td><td className="p-2">24,6 - 25,2 cm</td></tr>
                <tr><td className="p-2 font-bold">39 BR</td><td className="p-2">25,3 - 25,8 cm</td></tr>
                <tr><td className="p-2 font-bold">40 BR</td><td className="p-2">25,9 - 26,5 cm</td></tr>
                <tr><td className="p-2 font-bold">41 BR</td><td className="p-2">26,6 - 27,2 cm</td></tr>
                <tr><td className="p-2 font-bold">42 BR</td><td className="p-2">27,3 - 28,0 cm</td></tr>
              </tbody>
            </table>
            <div className="bg-[#ebf2e3] p-3 rounded text-xs text-[#3b6b14]">
              💡 <strong>Dica:</strong> A Jelly Mule possui modelagem padrão brasileiro. Recomendamos escolher seu tamanho habitual.
            </div>
          </div>
        </div>
      )}

      {/* 9. ON-SITE CHECKOUT MODAL (2-STEP FLOW) */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-[#141215] text-white p-4 flex items-center justify-between shrink-0">
              <div className="font-bold text-sm uppercase flex items-center gap-2">
                <Lock size={16} className="text-[#80c142]" /> Checkout Seguro
              </div>
              <button onClick={() => setCheckoutOpen(false)} className="text-gray-300 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs">
              
              {/* Order Summary Ribbon */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                <img src={selectedColor.images[0]} alt="Jelly Mule" className="w-14 h-14 object-cover rounded border border-gray-200 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Jelly Mule Feminina</div>
                  <div className="text-gray-500 text-[11px]">Cor: <strong>{selectedColor.label}</strong> | Tam: <strong>{selectedSize} BR</strong> | Qtd: <strong>{quantity}</strong></div>
                  <div className="font-black text-[#00873e] text-sm mt-0.5">
                    {paymentMethod === "PIX" ? `R$ ${(PIX_PRICE * quantity).toFixed(2).replace(".", ",")}` : `R$ ${(CARD_PRICE * quantity).toFixed(2).replace(".", ",")}`}
                    <span className="bg-[#e5f7e7] text-[#00873e] text-[10px] font-bold px-1.5 py-0.2 ml-2 rounded">FRETE GRÁTIS</span>
                  </div>
                </div>
              </div>

              {/* 2-Step Progress Stepper */}
              {(checkoutStep === 1 || checkoutStep === 2) && (
                <div className="flex items-center justify-between px-2 mb-4 bg-[#fafafa] p-2.5 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      checkoutStep === 1 ? "bg-black text-white" : "bg-[#00873e] text-white"
                    }`}>
                      {checkoutStep > 1 ? <Check size={14} /> : "1"}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">Seus Dados</div>
                      <div className="text-[10px] text-gray-400">Identificação</div>
                    </div>
                  </div>

                  <div className="w-8 h-0.5 bg-gray-200 mx-2" />

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      checkoutStep === 2 ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      2
                    </div>
                    <div>
                      <div className={`font-bold text-xs ${checkoutStep === 2 ? "text-gray-900" : "text-gray-400"}`}>Entrega &amp; Pagamento</div>
                      <div className="text-[10px] text-gray-400">Frete Grátis</div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: DADOS PESSOAIS */}
              {checkoutStep === 1 && (
                <form onSubmit={handleContinueToStep2} className="space-y-3.5">
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-0.5">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Maria Silva"
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-xs focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-0.5">CPF *</label>
                        <input
                          type="text"
                          required
                          placeholder="000.000.000-00"
                          maxLength={14}
                          value={customerForm.cpf}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, "").slice(0, 11);
                            v = v.replace(/(\d{3})(\d)/, "$1.$2");
                            v = v.replace(/(\d{3})(\d)/, "$1.$2");
                            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                            setCustomerForm({ ...customerForm, cpf: v });
                          }}
                          className="w-full h-10 border border-gray-300 rounded-lg px-3 text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-0.5">WhatsApp / Celular *</label>
                        <input
                          type="text"
                          required
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                          value={customerForm.phone}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, "").slice(0, 11);
                            if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
                            else if (v.length > 5) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
                            else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
                            setCustomerForm({ ...customerForm, phone: v });
                          }}
                          className="w-full h-10 border border-gray-300 rounded-lg px-3 text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-0.5">E-mail para Confirmação *</label>
                      <input
                        type="email"
                        required
                        placeholder="seuemail@exemplo.com"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-xs focus:outline-none focus:border-black"
                      />
                      <span className="text-[10px] text-gray-400 block mt-0.5">Enviaremos o comprovante e código de rastreamento por e-mail.</span>
                    </div>
                  </div>

                  {checkoutError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center font-bold">
                      {checkoutError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-12 bg-[#80c142] hover:bg-[#72b037] text-black font-black uppercase text-xs tracking-wider rounded-full shadow transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    CONTINUAR PARA ENTREGA &amp; PAGAMENTO →
                  </button>
                </form>
              )}

              {/* STEP 2: ENTREGA & FORMA DE PAGAMENTO */}
              {checkoutStep === 2 && (
                <form onSubmit={handleSubmitCheckout} className="space-y-4">
                  {/* Top Bar with Back Link */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutError(null);
                        setCheckoutStep(1);
                      }}
                      className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1"
                    >
                      <ChevronLeft size={16} /> Voltar aos dados
                    </button>
                    <div className="text-[11px] text-gray-500 font-medium truncate max-w-[200px]">
                      👤 {customerForm.name.split(" ")[0]} ({customerForm.phone})
                    </div>
                  </div>

                  {/* 1. Endereço de Entrega */}
                  <div className="space-y-2 pt-1">
                    <span className="font-bold text-gray-900 uppercase text-[11px] block flex items-center gap-1.5">
                      <Truck size={14} className="text-[#00873e]" /> 1. Endereço de Entrega (Frete Grátis)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] text-gray-600 block mb-0.5">CEP *</label>
                        <input
                          type="text"
                          required
                          placeholder="00000-000"
                          maxLength={9}
                          value={customerForm.zipCode}
                          onChange={(e) => handleCepChange(e.target.value)}
                          className="w-full h-10 border border-gray-300 rounded px-3 text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[11px] text-gray-600 block mb-0.5">Rua / Avenida *</label>
                        <input
                          type="text"
                          required
                          placeholder="Logradouro"
                          value={customerForm.street}
                          onChange={(e) => setCustomerForm({ ...customerForm, street: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded px-3 text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] text-gray-600 block mb-0.5">Número *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: 123"
                          value={customerForm.number}
                          onChange={(e) => setCustomerForm({ ...customerForm, number: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded px-3 text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[11px] text-gray-600 block mb-0.5">Complemento</label>
                        <input
                          type="text"
                          placeholder="Apto, Bloco (opcional)"
                          value={customerForm.complement}
                          onChange={(e) => setCustomerForm({ ...customerForm, complement: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded px-3 text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] text-gray-600 block mb-0.5">Bairro *</label>
                        <input
                          type="text"
                          required
                          placeholder="Bairro"
                          value={customerForm.neighborhood}
                          onChange={(e) => setCustomerForm({ ...customerForm, neighborhood: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded px-3 text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-600 block mb-0.5">Cidade *</label>
                        <input
                          type="text"
                          required
                          placeholder="Cidade"
                          value={customerForm.city}
                          onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded px-3 text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-600 block mb-0.5">UF *</label>
                        <input
                          type="text"
                          required
                          maxLength={2}
                          placeholder="SP"
                          value={customerForm.state}
                          onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value.toUpperCase() })}
                          className="w-full h-10 border border-gray-300 rounded px-3 text-xs uppercase focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Forma de Pagamento */}
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <span className="font-bold text-gray-900 uppercase text-[11px] block flex items-center gap-1.5">
                      <CreditCard size={14} className="text-[#00873e]" /> 2. Escolha a Forma de Pagamento
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("PIX")}
                        className={`p-3 rounded-lg border-2 text-left flex items-center justify-between transition-all ${
                          paymentMethod === "PIX"
                            ? "border-[#00873e] bg-[#f6fbf2]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <span className="font-black text-black block">PIX (5% OFF)</span>
                          <span className="text-[11px] text-[#00873e] font-bold">R$ {(PIX_PRICE * quantity).toFixed(2).replace(".", ",")}</span>
                        </div>
                        <img src={pixLogoImg} alt="Pix" className="h-6 w-auto" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("CREDIT_CARD")}
                        className={`p-3 rounded-lg border-2 text-left flex items-center justify-between transition-all ${
                          paymentMethod === "CREDIT_CARD"
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <span className="font-black text-black block">Cartão de Crédito</span>
                          <span className="text-[11px] text-gray-600 font-bold">Até 6x sem juros</span>
                        </div>
                        <CreditCard size={20} className="text-gray-700" />
                      </button>
                    </div>

                    {/* Credit Card Fields */}
                    {paymentMethod === "CREDIT_CARD" && (
                      <div className="space-y-2 pt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div>
                          <label className="text-[11px] text-gray-600 block mb-0.5">Número do Cartão *</label>
                          <input
                            type="text"
                            required
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            value={cardForm.number}
                            onChange={(e) => {
                              let v = e.target.value.replace(/\D/g, "").slice(0, 16);
                              v = v.replace(/(\d{4})(?=\d)/g, "$1 ");
                              setCardForm({ ...cardForm, number: v });
                            }}
                            className="w-full h-10 border border-gray-300 rounded px-3 text-xs bg-white focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-600 block mb-0.5">Nome no Cartão *</label>
                          <input
                            type="text"
                            required
                            placeholder="COMO IMPRESSO NO CARTÃO"
                            value={cardForm.holderName}
                            onChange={(e) => setCardForm({ ...cardForm, holderName: e.target.value.toUpperCase() })}
                            className="w-full h-10 border border-gray-300 rounded px-3 text-xs uppercase bg-white focus:outline-none focus:border-black"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[11px] text-gray-600 block mb-0.5">Mês (MM) *</label>
                            <input
                              type="text"
                              required
                              placeholder="12"
                              maxLength={2}
                              value={cardForm.expMonth}
                              onChange={(e) => setCardForm({ ...cardForm, expMonth: e.target.value.replace(/\D/g, "").slice(0, 2) })}
                              className="w-full h-10 border border-gray-300 rounded px-3 text-xs text-center bg-white focus:outline-none focus:border-black"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-600 block mb-0.5">Ano (AAAA) *</label>
                            <input
                              type="text"
                              required
                              placeholder="2028"
                              maxLength={4}
                              value={cardForm.expYear}
                              onChange={(e) => setCardForm({ ...cardForm, expYear: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                              className="w-full h-10 border border-gray-300 rounded px-3 text-xs text-center bg-white focus:outline-none focus:border-black"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-gray-600 block mb-0.5">CVV *</label>
                            <input
                              type="text"
                              required
                              placeholder="123"
                              maxLength={4}
                              value={cardForm.cvv}
                              onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                              className="w-full h-10 border border-gray-300 rounded px-3 text-xs text-center bg-white focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-gray-600 block mb-0.5">Parcelamento *</label>
                          <select
                            value={cardForm.installments}
                            onChange={(e) => setCardForm({ ...cardForm, installments: Number(e.target.value) })}
                            className="w-full h-10 border border-gray-300 rounded px-3 text-xs bg-white focus:outline-none focus:border-black"
                          >
                            <option value={1}>1x de R$ {(CARD_PRICE * quantity).toFixed(2).replace(".", ",")} sem juros</option>
                            <option value={2}>2x de R$ {((CARD_PRICE * quantity) / 2).toFixed(2).replace(".", ",")} sem juros</option>
                            <option value={3}>3x de R$ {((CARD_PRICE * quantity) / 3).toFixed(2).replace(".", ",")} sem juros</option>
                            <option value={4}>4x de R$ {((CARD_PRICE * quantity) / 4).toFixed(2).replace(".", ",")} sem juros</option>
                            <option value={5}>5x de R$ {((CARD_PRICE * quantity) / 5).toFixed(2).replace(".", ",")} sem juros</option>
                            <option value={6}>6x de R$ {((CARD_PRICE * quantity) / 6).toFixed(2).replace(".", ",")} sem juros</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {checkoutError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center font-bold">
                      {checkoutError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full h-12 bg-[#80c142] hover:bg-[#72b037] text-black font-black uppercase text-xs tracking-wider rounded-full shadow transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Processando Transação...
                      </>
                    ) : paymentMethod === "PIX" ? (
                      `GERAR PIX COM 5% OFF (R$ ${(PIX_PRICE * quantity).toFixed(2).replace(".", ",")})`
                    ) : (
                      `PAGAR COM CARTÃO (R$ ${(CARD_PRICE * quantity).toFixed(2).replace(".", ",")})`
                    )}
                  </button>
                </form>
              )}

              {/* STEP 3: PIX RESULT (QR CODE + COPIA E COLA) */}
              {checkoutStep === 3 && txData?.pix && (
                <div className="text-center space-y-4 py-2">
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Pedido Gerado com Sucesso!</span>
                    <div className="text-2xl font-black text-[#00873e] my-0.5">
                      R$ {(PIX_PRICE * quantity).toFixed(2).replace(".", ",")}
                    </div>
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      ⏱️ Pague em até {formatTimer(pixCountdown)}
                    </span>
                  </div>

                  {/* QR Code */}
                  <div className="inline-block p-3 bg-white border-2 border-dashed border-[#00873e] rounded-xl shadow-xs">
                    <img
                      src={`https://quickchart.io/qr?text=${encodeURIComponent(txData.pix.qrcode || "")}&size=200&margin=1`}
                      alt="QR Code Pix"
                      className="w-44 h-44 mx-auto object-contain"
                    />
                  </div>

                  {/* Copia e Cola */}
                  <div className="text-left space-y-1">
                    <label className="text-[11px] font-bold text-gray-700">Chave Pix Copia e Cola:</label>
                    <input
                      type="text"
                      readOnly
                      value={txData.pix.qrcode || ""}
                      className="w-full h-9 bg-gray-100 border border-gray-300 rounded px-2.5 text-[11px] font-mono text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className={`w-full h-11 text-white font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 transition-colors ${
                        pixCopied ? "bg-emerald-600" : "bg-[#00873e] hover:bg-[#007033]"
                      }`}
                    >
                      {pixCopied ? <Check size={16} /> : <Copy size={16} />}
                      {pixCopied ? "CÓDIGO PIX COPIADO!" : "COPIAR CÓDIGO PIX"}
                    </button>
                  </div>

                  {/* Polling Spinner */}
                  <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded text-gray-600 text-xs">
                    <Loader2 size={14} className="animate-spin text-[#80c142]" />
                    <span>Aguardando confirmação de pagamento...</span>
                  </div>

                  <ol className="text-left bg-gray-50 p-3 rounded text-[11px] text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Abra o aplicativo do seu banco no celular.</li>
                    <li>Escolha a opção <strong>Pix &gt; Pagar com Pix Copia e Cola</strong> (ou escaneie o QR Code).</li>
                    <li>Cole o código e conclua o pagamento de R$ {(PIX_PRICE * quantity).toFixed(2).replace(".", ",")}.</li>
                    <li>A confirmação é imediata e seu pedido será despachado!</li>
                  </ol>
                </div>
              )}

              {/* STEP 4: SUCCESS CELEBRATION */}
              {checkoutStep === 4 && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 bg-[#e5f7e7] text-[#00873e] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase">Pagamento Confirmado!</h3>
                  <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
                    Recebemos seu pedido da <strong>Jelly Mule Feminina</strong> com sucesso! Estamos preparando o envio com <strong>Frete Grátis</strong>.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded text-left text-xs text-gray-600">
                    📦 O comprovante e o código de rastreamento serão enviados para seu e-mail e WhatsApp cadastrados.
                  </div>
                  <button
                    onClick={() => setCheckoutOpen(false)}
                    className="w-full h-11 bg-[#80c142] text-black font-black uppercase text-xs rounded-full shadow hover:bg-[#72b037]"
                  >
                    Concluir
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 10. LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/80"
          >
            <X size={24} />
          </button>
          <button
            onClick={() => setLightboxIndex((prev) => (prev! - 1 + selectedColor.images.length) % selectedColor.images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/40 hover:bg-black/80 text-xl"
          >
            <ChevronLeft size={28} />
          </button>
          <img
            src={selectedColor.images[lightboxIndex]}
            alt="Zoom da Sandália"
            className="max-h-[85vh] max-w-full object-contain rounded"
          />
          <button
            onClick={() => setLightboxIndex((prev) => (prev! + 1) % selectedColor.images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/40 hover:bg-black/80 text-xl"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}

      {/* 11. TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#141215] text-white px-5 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 size={16} className="text-[#80c142]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
