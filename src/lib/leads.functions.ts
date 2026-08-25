import { createServerFn } from "@tanstack/react-start";

export type LeadStatus = "INITIATED" | "ABANDONED" | "PIX_GENERATED" | "PAID" | "CARD_APPROVED";

export type CheckoutLead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  productTitle: string;
  productColor: string;
  productSize: string;
  quantity: number;
  totalAmount: number;
  paymentMethod?: "PIX" | "CREDIT_CARD";
  customer: {
    name: string;
    cpf: string;
    phone: string;
    email: string;
  };
  shipping?: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  transactionId?: string;
  pixCode?: string;
  status: LeadStatus;
  notes?: string;
};

// Global in-memory storage fallback
declare global {
  // eslint-disable-next-line no-var
  var __LEADS_STORE__: CheckoutLead[] | undefined;
}

if (!globalThis.__LEADS_STORE__) {
  globalThis.__LEADS_STORE__ = [];
}

function getKV(): any | undefined {
  const env = (globalThis as any).__env__ || (globalThis as any).env;
  return env?.LEADS_KV || (globalThis as any).LEADS_KV;
}

async function getLeadsList(): Promise<CheckoutLead[]> {
  const kv = getKV();
  if (kv) {
    try {
      const data = await kv.get("leads_all", "json");
      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.error("[Leads KV] Erro ao ler leads:", e);
    }
  }
  if (!globalThis.__LEADS_STORE__) {
    globalThis.__LEADS_STORE__ = [];
  }
  return globalThis.__LEADS_STORE__;
}

async function saveLeadsList(leads: CheckoutLead[]): Promise<void> {
  // Always update in-memory
  globalThis.__LEADS_STORE__ = leads;

  const kv = getKV();
  if (kv) {
    try {
      await kv.put("leads_all", JSON.stringify(leads.slice(0, 1000)));
    } catch (e) {
      console.error("[Leads KV] Erro ao salvar leads:", e);
    }
  }
}

// 1. Record / Save Lead (Step 1 completion or checkout start)
export type RecordLeadInput = {
  leadId?: string;
  productTitle: string;
  productColor: string;
  productSize: string;
  quantity: number;
  totalAmount: number;
  customer: {
    name: string;
    cpf: string;
    phone: string;
    email: string;
  };
  status?: LeadStatus;
};

export const recordLead = createServerFn({ method: "POST" })
  .validator((data: RecordLeadInput) => data)
  .handler(async ({ data }) => {
    const leads = await getLeadsList();
    const now = new Date().toISOString();

    const cleanCpf = (data.customer.cpf || "").replace(/\D/g, "");
    const leadKey = data.leadId || (cleanCpf ? `cpf_${cleanCpf}` : `lead_${Date.now()}`);

    const existingIndex = leads.findIndex(
      (l) => l.id === leadKey || (cleanCpf && l.customer.cpf.replace(/\D/g, "") === cleanCpf)
    );

    if (existingIndex > -1) {
      const existing = leads[existingIndex];
      leads[existingIndex] = {
        ...existing,
        productTitle: data.productTitle || existing.productTitle,
        productColor: data.productColor || existing.productColor,
        productSize: data.productSize || existing.productSize,
        quantity: data.quantity || existing.quantity,
        totalAmount: data.totalAmount || existing.totalAmount,
        customer: {
          ...existing.customer,
          ...data.customer,
        },
        status: data.status || existing.status,
        updatedAt: now,
      };
      await saveLeadsList(leads);
      return { ok: true, lead: leads[existingIndex] };
    }

    const newLead: CheckoutLead = {
      id: leadKey,
      createdAt: now,
      updatedAt: now,
      productTitle: data.productTitle,
      productColor: data.productColor,
      productSize: data.productSize,
      quantity: data.quantity,
      totalAmount: data.totalAmount,
      customer: {
        name: data.customer.name.trim(),
        cpf: data.customer.cpf.trim(),
        phone: data.customer.phone.trim(),
        email: data.customer.email.trim(),
      },
      status: data.status || "ABANDONED",
    };

    leads.unshift(newLead);
    await saveLeadsList(leads);

    return { ok: true, lead: newLead };
  });

// 2. Update Lead with Address, Transaction ID, Payment Method & Status
export type UpdateLeadStatusInput = {
  leadId: string;
  status: LeadStatus;
  paymentMethod?: "PIX" | "CREDIT_CARD";
  transactionId?: string;
  pixCode?: string;
  shipping?: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
};

export const updateLeadStatus = createServerFn({ method: "POST" })
  .validator((data: UpdateLeadStatusInput) => data)
  .handler(async ({ data }) => {
    const leads = await getLeadsList();
    const cleanDoc = (data.leadId || "").replace(/\D/g, "");

    const lead = leads.find(
      (l) =>
        l.id === data.leadId ||
        (cleanDoc && l.id === `cpf_${cleanDoc}`) ||
        (cleanDoc && l.customer.cpf.replace(/\D/g, "") === cleanDoc)
    );

    if (!lead) {
      return { ok: false, error: "Lead não encontrado" };
    }

    lead.status = data.status;
    lead.updatedAt = new Date().toISOString();
    if (data.paymentMethod) lead.paymentMethod = data.paymentMethod;
    if (data.transactionId) lead.transactionId = data.transactionId;
    if (data.pixCode) lead.pixCode = data.pixCode;
    if (data.shipping) lead.shipping = data.shipping;

    await saveLeadsList(leads);
    return { ok: true, lead };
  });

// 3. Get Admin Metrics and Lead List
export const getAdminLeadsData = createServerFn({ method: "GET" })
  .handler(async () => {
    const store = await getLeadsList();

    const totalLeads = store.length;
    const paidLeads = store.filter(
      (l) => l.status === "PAID" || l.status === "CARD_APPROVED"
    );
    const pixPendingLeads = store.filter((l) => l.status === "PIX_GENERATED");
    const abandonedLeads = store.filter((l) => l.status === "ABANDONED" || l.status === "INITIATED");

    const totalRevenuePaid = paidLeads.reduce((acc, l) => acc + (l.totalAmount || 0), 0);
    const totalRevenueAbandoned = abandonedLeads.reduce((acc, l) => acc + (l.totalAmount || 0), 0);
    const totalRevenuePixPending = pixPendingLeads.reduce((acc, l) => acc + (l.totalAmount || 0), 0);

    const conversionRate =
      totalLeads > 0 ? ((paidLeads.length / totalLeads) * 100).toFixed(1) : "0.0";

    return {
      metrics: {
        totalLeads,
        paidCount: paidLeads.length,
        pixPendingCount: pixPendingLeads.length,
        abandonedCount: abandonedLeads.length,
        totalRevenuePaid,
        totalRevenuePixPending,
        totalRevenueAbandoned,
        conversionRate,
      },
      leads: store,
    };
  });

// 4. Clear/Delete Lead
export const deleteAdminLead = createServerFn({ method: "POST" })
  .validator((data: { leadId: string }) => data)
  .handler(async ({ data }) => {
    const leads = await getLeadsList();
    const cleanDoc = (data.leadId || "").replace(/\D/g, "");

    const idx = leads.findIndex(
      (l) =>
        l.id === data.leadId ||
        (cleanDoc && l.id === `cpf_${cleanDoc}`) ||
        (cleanDoc && l.customer.cpf.replace(/\D/g, "") === cleanDoc)
    );

    if (idx > -1) {
      leads.splice(idx, 1);
      await saveLeadsList(leads);
      return { ok: true };
    }
    return { ok: false, error: "Não encontrado" };
  });