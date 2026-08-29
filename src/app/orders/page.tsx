"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { SerializedOrderItem } from "@/lib/order-items";
import { SupplyNeedsPanel } from "@/components/orders/supply-needs-panel";
import { OrderSheet } from "@/components/orders/order-sheet";
import { AddOrderModal } from "@/components/orders/add-order-modal";

export default function OrdersPage() {
  const [items, setItems] = useState<SerializedOrderItem[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filterComponentId, setFilterComponentId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [i, c] = await Promise.all([api.orderItems.list(), api.components.list()]);
    setItems(i);
    setComponents(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Order Sheet</h1>
          <p className="mt-1 text-sm text-slate-500">
            Everything ties to the FNSKU — check supply needs, flag shortages, and send finished checks to
            production.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add order / one-off item
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <div className="mt-4">
            <SupplyNeedsPanel
              items={items}
              components={components}
              onFilterComponent={setFilterComponentId}
              activeComponentId={filterComponentId}
            />
          </div>
          <OrderSheet items={items} onRefresh={refresh} filterComponentId={filterComponentId} />
        </>
      )}

      {showAdd && (
        <AddOrderModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
