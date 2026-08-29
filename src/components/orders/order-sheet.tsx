"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { SerializedOrderItem } from "@/lib/order-items";
import { api } from "@/lib/api-client";
import { StatusChip } from "@/components/status-chip";
import { KANBAN_STAGES, KANBAN_STAGE_LABELS } from "@/lib/constants";

type SortKey = "priority" | "customer" | "product" | "quantity" | "stage" | "createdAt";
type SortDir = "asc" | "desc";

const ROLE_COLUMNS = ["BOTTLE", "CLOSURE", "LABEL", "BULK", "DROPPER"] as const;

function statusForRole(item: SerializedOrderItem, role: string) {
  const hasBom = item.bom.some((b) => b.role === role);
  if (!hasBom) return null;
  const check = item.componentChecks.find((c) => c.role === role);
  if (!check) return { status: "NONE" as const, title: "Not checked yet" };
  return {
    status: check.manualOverride ? ("MANUAL" as const) : (check.status as any),
    title: `Required ${check.requiredQty} / on hand ${check.onHandAtCheck} (${check.componentName})`,
  };
}

export function OrderSheet({
  items,
  onRefresh,
  filterComponentId,
}: {
  items: SerializedOrderItem[];
  onRefresh: () => void;
  filterComponentId: string | null;
}) {
  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("ALL");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [trackedOnly, setTrackedOnly] = useState(false);
  const [hotOnly, setHotOnly] = useState(false);
  const [sizeFilter, setSizeFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [busyId, setBusyId] = useState<string | null>(null);

  const customers = useMemo(
    () => Array.from(new Set(items.map((i) => i.customer?.name).filter(Boolean))) as string[],
    [items]
  );
  const sizes = useMemo(
    () => Array.from(new Set(items.map((i) => i.sizeLabel).filter(Boolean))) as string[],
    [items]
  );

  const filtered = items.filter((item) => {
    if (filterComponentId && !item.bom.some((b) => b.componentId === filterComponentId)) return false;
    if (customerFilter !== "ALL" && item.customer?.name !== customerFilter) return false;
    if (stageFilter !== "ALL" && item.kanbanStage !== stageFilter) return false;
    if (trackedOnly && !item.trackInventory) return false;
    if (hotOnly && item.priority !== "HOT") return false;
    if (sizeFilter !== "ALL" && item.sizeLabel !== sizeFilter) return false;
    if (search) {
      const haystack = `${item.displayName} ${item.fnsku ?? ""} ${item.orderNumber} ${item.workOrderNumber ?? ""}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "priority":
        cmp = (a.priority === "HOT" ? 1 : 0) - (b.priority === "HOT" ? 1 : 0);
        break;
      case "customer":
        cmp = (a.customer?.name ?? "").localeCompare(b.customer?.name ?? "");
        break;
      case "product":
        cmp = a.displayName.localeCompare(b.displayName);
        break;
      case "quantity":
        cmp = a.quantity - b.quantity;
        break;
      case "stage":
        cmp = KANBAN_STAGES.indexOf(a.kanbanStage as any) - KANBAN_STAGES.indexOf(b.kanbanStage as any);
        break;
      case "createdAt":
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function runAction(id: string, fn: () => Promise<unknown>) {
    setBusyId(id);
    try {
      await fn();
      onRefresh();
    } catch (e) {
      console.error(e);
      alert("Action failed — see console.");
    } finally {
      setBusyId(null);
    }
  }

  function SortHeader({ label, k }: { label: string; k: SortKey }) {
    return (
      <button
        onClick={() => toggleSort(k)}
        className="flex items-center gap-1 text-left font-medium text-slate-500 hover:text-slate-800"
      >
        {label}
        {sortKey === k && <span>{sortDir === "asc" ? "▲" : "▼"}</span>}
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 text-xs">
        <input
          placeholder="Search product, FNSKU, order #…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1.5"
        />
        <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} className="rounded border border-slate-300 px-2 py-1.5">
          <option value="ALL">All customers</option>
          {customers.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} className="rounded border border-slate-300 px-2 py-1.5">
          <option value="ALL">All sizes</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="rounded border border-slate-300 px-2 py-1.5">
          <option value="ALL">All stages</option>
          {KANBAN_STAGES.map((s) => (
            <option key={s} value={s}>
              {KANBAN_STAGE_LABELS[s]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-slate-600">
          <input type="checkbox" checked={trackedOnly} onChange={(e) => setTrackedOnly(e.target.checked)} />
          Tracked only
        </label>
        <label className="flex items-center gap-1 text-slate-600">
          <input type="checkbox" checked={hotOnly} onChange={(e) => setHotOnly(e.target.checked)} />
          Hot only
        </label>
        <span className="ml-auto text-slate-400">{sorted.length} of {items.length} items</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2"><SortHeader label="Pri" k="priority" /></th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Order / WO#</th>
              <th className="px-3 py-2"><SortHeader label="Customer" k="customer" /></th>
              <th className="px-3 py-2"><SortHeader label="Product (FNSKU)" k="product" /></th>
              <th className="px-3 py-2"><SortHeader label="Qty" k="quantity" /></th>
              {ROLE_COLUMNS.map((r) => (
                <th key={r} className="px-2 py-2 text-left font-medium text-slate-500">
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </th>
              ))}
              <th className="px-3 py-2"><SortHeader label="Stage" k="stage" /></th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Notes</th>
              <th className="px-3 py-2 text-left font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 align-top hover:bg-slate-50/60">
                <td className="px-3 py-2">
                  {item.priority === "HOT" && (
                    <span title="Hot / prioritized" className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  <div>{item.orderNumber}</div>
                  <div className="text-slate-400">{item.workOrderNumber ?? "no WO#"}</div>
                </td>
                <td className="px-3 py-2 text-slate-700">{item.customer?.name ?? "—"}</td>
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-800">{item.displayName}</div>
                  <div className="text-slate-400">
                    {item.fnsku ? `…${item.fnskuLast4}` : item.isOneOff ? "one-off" : "no FNSKU"}
                    {item.sizeLabel ? ` · ${item.sizeLabel}` : ""}
                    {item.customerSuppliesParts ? " · customer supplies parts" : ""}
                    {!item.trackInventory ? " · untracked" : ""}
                  </div>
                </td>
                <td className="px-3 py-2 tabular-nums text-slate-700">{item.quantity}</td>
                {ROLE_COLUMNS.map((role) => {
                  const s = statusForRole(item, role);
                  return (
                    <td key={role} className="px-2 py-2">
                      {s ? <StatusChip status={s.status} label={s.status} title={s.title} /> : <span className="text-slate-300">—</span>}
                    </td>
                  );
                })}
                <td className="px-3 py-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                    {KANBAN_STAGE_LABELS[item.kanbanStage as keyof typeof KANBAN_STAGE_LABELS] ?? item.kanbanStage}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <NotesCell item={item} onSaved={onRefresh} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-1">
                    {item.trackInventory && item.bom.length > 0 && (
                      <button
                        disabled={busyId === item.id}
                        onClick={() => runAction(item.id, () => api.orderItems.checkInventory(item.id))}
                        className="rounded border border-slate-300 px-2 py-1 text-left hover:bg-slate-50 disabled:opacity-50"
                      >
                        Check inventory
                      </button>
                    )}
                    <label className="flex items-center gap-1 text-slate-500">
                      <input
                        type="checkbox"
                        checked={item.manualOverride}
                        onChange={(e) =>
                          runAction(item.id, () => api.orderItems.patch(item.id, { manualOverride: e.target.checked }))
                        }
                      />
                      Manual override
                    </label>
                    {!item.sentToProductionAt ? (
                      <button
                        disabled={busyId === item.id}
                        onClick={() => runAction(item.id, () => api.orderItems.sendToProduction(item.id))}
                        className="rounded bg-slate-900 px-2 py-1 text-left text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        Send to production
                      </button>
                    ) : (
                      <Link href="/production" className="text-left text-slate-500 underline underline-offset-2">
                        On board →
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5 + ROLE_COLUMNS.length + 3} className="px-3 py-8 text-center text-slate-400">
                  No order items match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotesCell({ item, onSaved }: { item: SerializedOrderItem; onSaved: () => void }) {
  const [value, setValue] = useState(item.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (value === (item.notes ?? "")) return;
    setSaving(true);
    try {
      await api.orderItems.patch(item.id, { notes: value });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      rows={2}
      placeholder="What's being done to complete this…"
      className={clsx(
        "w-40 resize-y rounded border px-1.5 py-1 text-xs",
        saving ? "border-slate-300 bg-slate-50" : "border-transparent hover:border-slate-200 focus:border-slate-300"
      )}
    />
  );
}
