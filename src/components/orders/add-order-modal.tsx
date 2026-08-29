"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { ORDER_SOURCES } from "@/lib/constants";

interface ItemDraft {
  productId: string; // "" means one-off
  oneOffName: string;
  oneOffFnsku: string;
  quantity: string;
  notes: string;
}

function emptyItem(): ItemDraft {
  return { productId: "", oneOffName: "", oneOffFnsku: "", quantity: "", notes: "" };
}

export function AddOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [source, setSource] = useState<(typeof ORDER_SOURCES)[number]>("MANUAL");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.customers.list().then(setCustomers).catch(() => {});
    api.products.list().then(setProducts).catch(() => {});
  }, []);

  function updateItem(idx: number, patch: Partial<ItemDraft>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        customerId: customerId || undefined,
        source,
        notes: notes || undefined,
        items: items
          .filter((it) => it.quantity)
          .map((it) => ({
            productId: it.productId || undefined,
            oneOffName: it.productId ? undefined : it.oneOffName || "One-off item",
            oneOffFnsku: it.productId ? undefined : it.oneOffFnsku || undefined,
            quantity: Number(it.quantity),
            trackInventory: !!it.productId,
            notes: it.notes || undefined,
          })),
      };
      if (payload.items.length === 0) throw new Error("Add at least one item with a quantity.");
      await api.orders.create(payload);
      onCreated();
    } catch (e: any) {
      setError(e.message ?? "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Add order</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter an order from email or the restock report, or add a one-off item not in the catalog.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-slate-600">
            Customer
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">— none —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Source
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as typeof source)}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            >
              {ORDER_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-3 block text-xs font-medium text-slate-600">
          Order notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>

        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-medium text-slate-800">Items</h3>
          {items.map((item, idx) => (
            <div key={idx} className="rounded border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={!item.productId}
                    onChange={(e) =>
                      updateItem(idx, e.target.checked ? { productId: "" } : { productId: products[0]?.id ?? "" })
                    }
                  />
                  One-off item (not in catalog)
                </label>
                {items.length > 1 && (
                  <button
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {item.productId || products.length === 0 ? null : (
                  <div className="col-span-3 grid grid-cols-2 gap-2">
                    <input
                      placeholder="Item name"
                      value={item.oneOffName}
                      onChange={(e) => updateItem(idx, { oneOffName: e.target.value })}
                      className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <input
                      placeholder="FNSKU (optional)"
                      value={item.oneOffFnsku}
                      onChange={(e) => updateItem(idx, { oneOffFnsku: e.target.value })}
                      className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                )}
                {item.productId !== "" && (
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(idx, { productId: e.target.value })}
                    className="col-span-3 rounded border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">Select a product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.fnsku ? `(${p.fnsku})` : ""}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                  className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                />
                <input
                  placeholder="Notes"
                  value={item.notes}
                  onChange={(e) => updateItem(idx, { notes: e.target.value })}
                  className="col-span-2 rounded border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => setItems((prev) => [...prev, emptyItem()])}
            className="text-xs font-medium text-slate-600 hover:underline"
          >
            + Add another item
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Create order"}
          </button>
        </div>
      </div>
    </div>
  );
}
