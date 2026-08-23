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

// Global in-memory storage for Worker/Node instances
declare global {
  // eslint-disable-next-line no-var
  var __LEADS_STORE__: CheckoutLead[] | undefined;
}

if (!globalThis.__LEADS_STORE__) {
  globalThis.__LEADS_STORE__ = [];
}

function getLeadsStore(): CheckoutLead[] {
  if (!globalThis.__LEADS_STORE__) {
    globalThis.__LEADS_STORE__ = [];
  }
  return globalThis.__LEADS_STORE__;
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
  .inputValidator((data: RecordLeadInput) => data)
  .handler(async ({ data }) => {
    const store = getLeadsStore();
    const now = new Date().toISOString();

    const existingIndex = data.leadId
      ? store.findIndex((l) => l.id === data.leadId)
      : -1;

    if (existingIndex > -1) {
      const existing = store[existingIndex];
      store[existingIndex] = {
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
      return { ok: true, lead: store[existingIndex] };
    }

    const newLead: CheckoutLead = {
      id: data.leadId || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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

    // Keep store within 1000 items
    store.unshift(newLead);
    if (store.length > 1000) {
      store.pop();
    }

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
  .inputValidator((data: UpdateLeadStatusInput) => data)
  .handler(async ({ data }) => {
    const store = getLeadsStore();
    const lead = store.find((l) => l.id === data.leadId);
    if (!lead) {
      return { ok: false, error: "Lead não encontrado" };
    }

    lead.status = data.status;
    lead.updatedAt = new Date().toISOString();
    if (data.paymentMethod) lead.paymentMethod = data.paymentMethod;
    if (data.transactionId) lead.transactionId = data.transactionId;
    if (data.pixCode) lead.pixCode = data.pixCode;
    if (data.shipping) lead.shipping = data.shipping;

    return { ok: true, lead };
  });

// 3. Get Admin Metrics and Lead List
export const getAdminLeadsData = createServerFn({ method: "GET" })
  .handler(async () => {
    const store = getLeadsStore();

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
  .inputValidator((data: { leadId: string }) => data)
  .handler(async ({ data }) => {
    const store = getLeadsStore();
    const idx = store.findIndex((l) => l.id === data.leadId);
    if (idx > -1) {
      store.splice(idx, 1);
      return { ok: true };
    }
    return { ok: false, error: "Não encontrado" };
  });