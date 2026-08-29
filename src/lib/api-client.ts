async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  orderItems: {
    list: () => request<import("@/lib/order-items").SerializedOrderItem[]>("/api/order-items"),
    patch: (id: string, data: Record<string, unknown>) =>
      request(`/api/order-items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    checkInventory: (id: string) =>
      request(`/api/order-items/${id}/check-inventory`, { method: "POST" }),
    sendToProduction: (id: string) =>
      request(`/api/order-items/${id}/send-to-production`, { method: "POST" }),
    moveKanban: (id: string, stage: string) =>
      request(`/api/order-items/${id}/kanban`, { method: "PATCH", body: JSON.stringify({ stage }) }),
    complete: (id: string, actualQtyProduced: number) =>
      request(`/api/order-items/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({ actualQtyProduced }),
      }),
    uploadPhoto: async (id: string, file: File, caption?: string) => {
      const form = new FormData();
      form.append("file", file);
      if (caption) form.append("caption", caption);
      const res = await fetch(`/api/order-items/${id}/qa-photos`, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
  },
  componentChecks: {
    patch: (id: string, data: Record<string, unknown>) =>
      request(`/api/component-checks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  orders: {
    create: (data: Record<string, unknown>) =>
      request("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  },
  components: {
    list: () => request<any[]>("/api/components"),
    patch: (id: string, data: Record<string, unknown>) =>
      request(`/api/components/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  customers: {
    list: () => request<any[]>("/api/customers"),
  },
  products: {
    list: () => request<any[]>("/api/products"),
  },
  shipments: {
    list: (month?: string) => request<any[]>(`/api/shipments${month ? `?month=${month}` : ""}`),
    create: (data: Record<string, unknown>) =>
      request("/api/shipments", { method: "POST", body: JSON.stringify(data) }),
  },
  invoicing: {
    summary: (month?: string) =>
      request<any>(`/api/invoicing/summary${month ? `?month=${month}` : ""}`),
  },
};
