"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function ShippingPage() {
  const [month, setMonth] = useState(currentMonth());
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async (m: string) => {
    setLoading(true);
    const [s, sum] = await Promise.all([api.shipments.list(m), api.invoicing.summary(m)]);
    setShipments(s);
    setSummary(sum);
    setLoading(false);
  }, []);

  useEffect(() => {
    api.customers.list().then(setCustomers).catch(() => {});
    api.products.list().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    refresh(month);
  }, [month, refresh]);

  async function logShipment() {
    if (!customerId || !productId || !quantity) return;
    setSaving(true);
    try {
      await api.shipments.create({
        customerId,
        productId,
        quantity: Number(quantity),
        unitPrice: unitPrice ? Number(unitPrice) : undefined,
        notes: notes || undefined,
      });
      setQuantity("");
      setUnitPrice("");
      setNotes("");
      refresh(month);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Shipping & Invoicing</h1>
          <p className="mt-1 text-sm text-slate-500">
            Log outbound shipments as they go out, then roll the month up into an amount due per customer.
          </p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900">Log a shipment</h2>
          <div className="mt-3 space-y-2 text-sm">
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full rounded border border-slate-300 px-2 py-1.5">
              <option value="">Customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const p = products.find((p) => p.id === e.target.value);
                if (p?.unitPrice != null) setUnitPrice(String(p.unitPrice));
              }}
              className="w-full rounded border border-slate-300 px-2 py-1.5"
            >
              <option value="">Product (FNSKU)…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.fnsku ? `(${p.fnsku})` : ""}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-1/2 rounded border border-slate-300 px-2 py-1.5"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Unit price"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-1/2 rounded border border-slate-300 px-2 py-1.5"
              />
            </div>
            <input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-1.5"
            />
            <button
              onClick={logShipment}
              disabled={saving}
              className="w-full rounded bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Log shipment"}
            </button>
          </div>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Shipments this month
          </h3>
          <div className="mt-2 max-h-64 space-y-1.5 overflow-y-auto text-xs">
            {shipments.length === 0 && <p className="text-slate-400">None yet.</p>}
            {shipments.map((s) => (
              <div key={s.id} className="rounded border border-slate-100 p-2">
                <div className="font-medium text-slate-700">
                  {s.product.name} × {s.quantity}
                </div>
                <div className="text-slate-400">
                  {s.customer.name} · ${s.unitPrice.toFixed(2)}/ea · {new Date(s.shippedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2 print:border-none print:shadow-none">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Amount due by customer — {month}</h2>
            <button onClick={() => window.print()} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 print:hidden">
              Print / export
            </button>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-400">Loading…</p>
          ) : !summary || summary.customers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No shipments logged for this month yet.</p>
          ) : (
            <div className="mt-3 space-y-5">
              {summary.customers.map((c: any) => (
                <div key={c.customerId}>
                  <h3 className="text-sm font-medium text-slate-800">{c.customerName}</h3>
                  <table className="mt-1 w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="py-1 pr-2 font-medium">Product</th>
                        <th className="py-1 pr-2 font-medium">FNSKU</th>
                        <th className="py-1 pr-2 font-medium">Qty</th>
                        <th className="py-1 pr-2 font-medium">Unit price</th>
                        <th className="py-1 pr-2 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.lines.map((l: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100">
                          <td className="py-1 pr-2 text-slate-700">{l.productName}</td>
                          <td className="py-1 pr-2 text-slate-400">{l.fnsku ?? "—"}</td>
                          <td className="py-1 pr-2 tabular-nums">{l.quantity}</td>
                          <td className="py-1 pr-2 tabular-nums">${l.unitPrice.toFixed(2)}</td>
                          <td className="py-1 pr-2 tabular-nums">${l.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-1 flex justify-end gap-4 text-sm">
                    {c.totalCogs != null && (
                      <span className="text-slate-400">Margin: ${(c.totalAmount - c.totalCogs).toFixed(2)}</span>
                    )}
                    <span className="font-semibold text-slate-900">Total due: ${c.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
