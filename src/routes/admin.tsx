import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useMemo } from "react";
import { adminLogin, clearAdminSession, isAdminLoggedIn, setAdminLoggedIn } from "@/lib/admin-auth";
import { getAdminLeadsData, deleteAdminLead, type CheckoutLead } from "@/lib/leads.functions";
import {
  Lock,
  LogOut,
  ShieldCheck,
  CircleAlert,
  ExternalLink,
  RefreshCw,
  Search,
  MessageCircle,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Download,
  Trash2,
  UserCheck,
  PhoneCall,
  Mail,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel de Controle & Leads — Crocs Jelly Mule" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAdminLoggedIn());
    setReady(true);
  }, []);

  if (!ready) return null;
  return authed ? <Dashboard onLogout={() => setAuthed(false)} /> : <LoginForm onLogin={() => setAuthed(true)} />;
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const login = useServerFn(adminLogin);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login({ data: { user, password } });
      setAdminLoggedIn();
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciais inválidas");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl border border-gray-100 space-y-5"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow">
            <Lock size={22} />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Painel de Controle</h2>
          <p className="text-xs text-gray-500 mt-0.5">Acesso exclusivo do administrador</p>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              Usuário
            </label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="admin"
              autoFocus
              autoComplete="username"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-100">
            <CircleAlert size={16} className="shrink-0" /> {error}
          </div>
        )}

        <button
          disabled={busy}
          className="w-full rounded-lg bg-black py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-gray-800 disabled:opacity-50 transition-all shadow"
        >
          {busy ? "Entrando..." : "Acessar Painel"}
        </button>

        <p className="text-center text-[10px] text-gray-400">
          💡 Padrão: <code>admin</code> / <code>admin2026</code>
        </p>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const getLeads = useServerFn(getAdminLeadsData);
  const deleteLead = useServerFn(deleteAdminLead);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    metrics: {
      totalLeads: number;
      paidCount: number;
      pixPendingCount: number;
      abandonedCount: number;
      totalRevenuePaid: number;
      totalRevenuePixPending: number;
      totalRevenueAbandoned: number;
      conversionRate: string;
    };
    leads: CheckoutLead[];
  }>({
    metrics: {
      totalLeads: 0,
      paidCount: 0,
      pixPendingCount: 0,
      abandonedCount: 0,
      totalRevenuePaid: 0,
      totalRevenuePixPending: 0,
      totalRevenueAbandoned: 0,
      conversionRate: "0.0",
    },
    leads: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ABANDONED" | "PIX_GENERATED" | "PAID">("ALL");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getLeads();
      if (res) setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (leadId: string) => {
    if (!confirm("Deseja realmente remover este registro?")) return;
    try {
      await deleteLead({ data: { leadId } });
      setData((prev) => ({
        ...prev,
        leads: prev.leads.filter((l) => l.id !== leadId),
      }));
    } catch (err) {
      alert("Erro ao excluir");
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return data.leads.filter((l) => {
      const matchSearch =
        searchQuery === "" ||
        l.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.customer.phone.includes(searchQuery) ||
        l.customer.cpf.includes(searchQuery) ||
        l.customer.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ABANDONED" && (l.status === "ABANDONED" || l.status === "INITIATED")) ||
        (statusFilter === "PIX_GENERATED" && l.status === "PIX_GENERATED") ||
        (statusFilter === "PAID" && (l.status === "PAID" || l.status === "CARD_APPROVED"));

      return matchSearch && matchStatus;
    });
  }, [data.leads, searchQuery, statusFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = "Data/Hora,Status,Nome,Telefone,CPF,Email,Produto,Cor,Tamanho,Qtd,Total,FormaPagamento,CEP,Cidade,UF\n";
    const rows = filteredLeads
      .map((l) => {
        const date = new Date(l.createdAt).toLocaleString("pt-BR");
        const status = l.status;
        const name = `"${l.customer.name}"`;
        const phone = `"${l.customer.phone}"`;
        const cpf = `"${l.customer.cpf}"`;
        const email = `"${l.customer.email}"`;
        const prod = `"${l.productTitle}"`;
        const color = `"${l.productColor}"`;
        const size = l.productSize;
        const qty = l.quantity;
        const total = l.totalAmount.toFixed(2).replace(".", ",");
        const method = l.paymentMethod || "NA";
        const cep = l.shipping?.zipCode || "";
        const city = `"${l.shipping?.city || ""}"`;
        const uf = l.shipping?.state || "";
        return `${date},${status},${name},${phone},${cpf},${email},${prod},${color},${size},${qty},${total},${method},${cep},${city},${uf}`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_checkout_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper WhatsApp Recovery Link
  const getWhatsAppLink = (lead: CheckoutLead) => {
    const cleanPhone = lead.customer.phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    const firstName = lead.customer.name.split(" ")[0];

    let message = "";
    if (lead.status === "PAID" || lead.status === "CARD_APPROVED") {
      message = `Olá, ${firstName}! Tudo bem? Recebemos seu pedido da Sandália Crocs Jelly Mule com sucesso! 🎉 Estamos preparando tudo com muito carinho e em breve te envio o código de rastreamento.`;
    } else if (lead.status === "PIX_GENERATED") {
      message = `Olá, ${firstName}! Tudo bem? Vi que você gerou a chave Pix para a sua Sandália Crocs Jelly Mule (Cor ${lead.productColor}, Tamanho ${lead.productSize} BR). Posso te ajudar a concluir para garantirmos seu envio com Frete Grátis hoje?`;
    } else {
      // Abandoned cart / Step 1
      message = `Olá, ${firstName}! Tudo bem? Notei que você se interessou pela Sandália Crocs Jelly Mule (Cor ${lead.productColor}, Tamanho ${lead.productSize} BR) e começou a preencher seu pedido. Ficou alguma dúvida sobre o tamanho ou entrega? Posso te ajudar a finalizar com Frete Grátis!`;
    }

    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pb-16 font-sans">
      {/* TOP HEADER */}
      <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#80c142] text-black font-black text-xs px-2.5 py-1 rounded tracking-wider uppercase">
              Admin
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black tracking-tight flex items-center gap-2">
                Painel de Leads &amp; Checkout Seguro
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Monitorando em tempo real" />
              </h1>
              <p className="text-[11px] text-gray-400">Crocs Jelly Mule Feminina (/translucida)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold transition-all border border-gray-700"
              title="Atualizar dados agora"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
            <button
              onClick={() => navigate({ to: "/translucida" })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold transition-all border border-gray-700 text-emerald-400"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Ver Loja</span>
            </button>
            <button
              onClick={() => {
                clearAdminSession();
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-300 text-xs font-bold transition-all border border-red-800/50"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* METRIC CARDS ROW */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* CARD 1: VENDAS APROVADAS */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Vendas Aprovadas</span>
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-emerald-600">
              R$ {data.metrics.totalRevenuePaid.toFixed(2).replace(".", ",")}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">
              <strong>{data.metrics.paidCount}</strong> {data.metrics.paidCount === 1 ? "pedido pago" : "pedidos pagos"}
            </div>
          </div>

          {/* CARD 2: PIX PENDENTES */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pix Aguardando</span>
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <QrCode size={16} />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-amber-600">
              R$ {data.metrics.totalRevenuePixPending.toFixed(2).replace(".", ",")}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">
              <strong>{data.metrics.pixPendingCount}</strong> {data.metrics.pixPendingCount === 1 ? "chave gerada" : "chaves geradas"}
            </div>
          </div>

          {/* CARD 3: CARRINHOS ABANDONADOS */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Abandonados (Etapa 1)</span>
              <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle size={16} />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-rose-600">
              R$ {data.metrics.totalRevenueAbandoned.toFixed(2).replace(".", ",")}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">
              <strong>{data.metrics.abandonedCount}</strong> leads recuperáveis
            </div>
          </div>

          {/* CARD 4: TAXA DE CONVERSÃO */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Conversão &amp; Leads</span>
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-gray-900">
              {data.metrics.conversionRate}%
            </div>
            <div className="text-[11px] text-gray-500 mt-1 font-medium">
              Total de <strong>{data.metrics.totalLeads}</strong> leads cadastrados
            </div>
          </div>
        </section>

        {/* CONTROLS BAR: SEARCH + FILTERS + EXPORT */}
        <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* SEARCH INPUT */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, WhatsApp ou CPF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-gray-50 rounded-lg border border-gray-300 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          {/* STATUS PILLS */}
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === "ALL"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Todos ({data.leads.length})
            </button>
            <button
              onClick={() => setStatusFilter("ABANDONED")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === "ABANDONED"
                  ? "bg-rose-600 text-white"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              🔴 Abandonados ({data.metrics.abandonedCount})
            </button>
            <button
              onClick={() => setStatusFilter("PIX_GENERATED")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === "PIX_GENERATED"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              🟡 Pix Gerado ({data.metrics.pixPendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("PAID")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === "PAID"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              🟢 Pagos ({data.metrics.paidCount})
            </button>
          </div>

          {/* EXPORT CSV BUTTON */}
          <button
            onClick={handleExportCSV}
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-all border border-gray-300 shrink-0"
          >
            <Download size={14} /> Exportar CSV
          </button>
        </section>

        {/* LEADS & CHECKOUT TABLE */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-black text-sm uppercase tracking-wide text-gray-900 flex items-center gap-2">
              <UserCheck size={18} className="text-gray-700" />
              Controle de Clientes &amp; Carrinhos
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              Exibindo {filteredLeads.length} de {data.leads.length} registros
            </span>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <ShoppingBag size={40} className="mx-auto text-gray-300" />
              <p className="text-sm font-bold text-gray-600">Nenhum registro encontrado</p>
              <p className="text-xs max-w-sm mx-auto">
                Assim que um cliente entrar no checkout em <code>/translucida</code> e preencher os dados, ele aparecerá instantaneamente aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead className="bg-gray-50 font-bold uppercase tracking-wider text-[10px] text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Status / Data</th>
                    <th className="px-4 py-3">Cliente &amp; Documento</th>
                    <th className="px-4 py-3">WhatsApp &amp; Recuperação</th>
                    <th className="px-4 py-3">Produto &amp; Valor</th>
                    <th className="px-4 py-3">Endereço de Entrega</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead) => {
                    const isPaid = lead.status === "PAID" || lead.status === "CARD_APPROVED";
                    const isPix = lead.status === "PIX_GENERATED";
                    const isAbandoned = lead.status === "ABANDONED" || lead.status === "INITIATED";

                    return (
                      <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* 1. STATUS & DATA */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={12} /> PAGO
                            </span>
                          ) : isPix ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                              <QrCode size={12} /> PIX GERADO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle size={12} /> ABANDONOU ETAPA 1
                            </span>
                          )}
                          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(lead.createdAt).toLocaleDateString("pt-BR")} às{" "}
                            {new Date(lead.createdAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>

                        {/* 2. CLIENTE */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-gray-900 text-sm">{lead.customer.name}</div>
                          <div className="text-gray-500 text-[11px] font-mono mt-0.5">CPF: {lead.customer.cpf}</div>
                          <div className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <Mail size={11} /> {lead.customer.email}
                          </div>
                        </td>

                        {/* 3. WHATSAPP & RECUPERAÇÃO */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-gray-800 flex items-center gap-1">
                            <PhoneCall size={12} className="text-gray-500" />
                            {lead.customer.phone}
                          </div>
                          <a
                            href={getWhatsAppLink(lead)}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-1.5 inline-flex items-center gap-1 px-3 py-1 bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-[11px] rounded-full shadow-xs transition-transform active:scale-95"
                            title="Abrir conversa no WhatsApp com mensagem de recuperação pronta"
                          >
                            <MessageCircle size={13} />
                            <span>{isPaid ? "Mensagem de Envio" : "Recuperar no WhatsApp"}</span>
                          </a>
                        </td>

                        {/* 4. PRODUTO & VALOR */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-gray-900">{lead.productTitle}</div>
                          <div className="text-gray-500 text-[11px]">
                            Cor: <strong>{lead.productColor}</strong> | Tam: <strong>{lead.productSize} BR</strong> ({lead.quantity}x)
                          </div>
                          <div className="font-black text-[#00873e] text-xs mt-0.5">
                            R$ {lead.totalAmount.toFixed(2).replace(".", ",")}
                            {lead.paymentMethod && (
                              <span className="ml-1 text-[10px] text-gray-400 font-normal">
                                ({lead.paymentMethod})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. ENDEREÇO */}
                        <td className="px-4 py-3.5 text-[11px] text-gray-600 max-w-xs">
                          {lead.shipping?.street ? (
                            <div>
                              <div className="font-medium text-gray-800 flex items-center gap-1">
                                <MapPin size={12} className="text-gray-400 shrink-0" />
                                {lead.shipping.street}, {lead.shipping.number}
                                {lead.shipping.complement ? ` - ${lead.shipping.complement}` : ""}
                              </div>
                              <div className="text-gray-500 text-[10px]">
                                {lead.shipping.neighborhood} • {lead.shipping.city}/{lead.shipping.state} (CEP {lead.shipping.zipCode})
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Preencheu apenas etapa 1 (identificação)</span>
                          )}
                        </td>

                        {/* 6. AÇÕES */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover este lead"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

