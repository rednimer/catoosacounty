"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { SerializedOrderItem } from "@/lib/order-items";
import {
  COMPONENT_TYPE_LABELS,
  COMPONENT_TYPES,
  ComponentType,
  computeStatus,
  statusColorClasses,
} from "@/lib/constants";

interface ComponentRecord {
  id: string;
  name: string;
  type: string;
  unitOfMeasure: string;
  onHandQty: number;
}

interface Row {
  componentId: string;
  componentName: string;
  type: ComponentType;
  unitOfMeasure: string;
  onHandQty: number;
  requiredQty: number;
  status: ReturnType<typeof computeStatus>;
  usedBy: { productName: string; orderNumber: string; quantity: number }[];
}

export function SupplyNeedsPanel({
  items,
  components,
  onFilterComponent,
  activeComponentId,
}: {
  items: SerializedOrderItem[];
  components: ComponentRecord[];
  onFilterComponent: (componentId: string | null) => void;
  activeComponentId: string | null;
}) {
  const [typeFilter, setTypeFilter] = useState<ComponentType | "ALL">("ALL");
  const [shortagesOnly, setShortagesOnly] = useState(false);

  const rows = useMemo<Row[]>(() => {
    const byId = new Map<string, Row>();
    const componentById = new Map(components.map((c) => [c.id, c]));

    for (const item of items) {
      if (item.kanbanStage === "COMPLETED" || !item.trackInventory) continue;
      for (const line of item.bom) {
        const comp = componentById.get(line.componentId);
        if (!comp) continue;
        const required = line.qtyPerUnit * item.quantity;
        const existing = byId.get(line.componentId);
        if (existing) {
          existing.requiredQty += required;
          existing.usedBy.push({
            productName: item.displayName,
            orderNumber: item.orderNumber,
            quantity: item.quantity,
          });
        } else {
          byId.set(line.componentId, {
            componentId: line.componentId,
            componentName: comp.name,
            type: comp.type as ComponentType,
            unitOfMeasure: comp.unitOfMeasure,
            onHandQty: comp.onHandQty,
            requiredQty: required,
            status: "GREEN",
            usedBy: [{ productName: item.displayName, orderNumber: item.orderNumber, quantity: item.quantity }],
          });
        }
      }
    }

    const result = Array.from(byId.values()).map((r) => ({
      ...r,
      status: computeStatus(r.requiredQty, r.onHandQty),
    }));

    return result.sort((a, b) => {
      const order = { RED: 0, YELLOW: 1, GREEN: 2, MANUAL: 3 } as const;
      return order[a.status] - order[b.status] || a.componentName.localeCompare(b.componentName);
    });
  }, [items, components]);

  const filtered = rows.filter((r) => {
    if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
    if (shortagesOnly && r.status === "GREEN") return false;
    return true;
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Supply needs across all open orders
        </h2>
        <div className="flex items-center gap-2 text-xs">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ComponentType | "ALL")}
            className="rounded border border-slate-300 px-2 py-1"
          >
            <option value="ALL">All component types</option>
            {COMPONENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {COMPONENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-slate-600">
            <input
              type="checkbox"
              checked={shortagesOnly}
              onChange={(e) => setShortagesOnly(e.target.checked)}
            />
            Shortages only
          </label>
          {activeComponentId && (
            <button
              onClick={() => onFilterComponent(null)}
              className="rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50"
            >
              Clear sheet filter
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400">No supply needs match this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-1.5 pr-3 font-medium">Component</th>
                <th className="py-1.5 pr-3 font-medium">Type</th>
                <th className="py-1.5 pr-3 font-medium">Required</th>
                <th className="py-1.5 pr-3 font-medium">On hand</th>
                <th className="py-1.5 pr-3 font-medium">Status</th>
                <th className="py-1.5 pr-3 font-medium">Used by</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.componentId}
                  className={clsx(
                    "cursor-pointer border-b border-slate-100 hover:bg-slate-50",
                    activeComponentId === row.componentId && "bg-slate-100"
                  )}
                  onClick={() =>
                    onFilterComponent(activeComponentId === row.componentId ? null : row.componentId)
                  }
                >
                  <td className="py-1.5 pr-3 font-medium text-slate-800">{row.componentName}</td>
                  <td className="py-1.5 pr-3 text-slate-500">{COMPONENT_TYPE_LABELS[row.type]}</td>
                  <td className="py-1.5 pr-3 tabular-nums text-slate-700">
                    {row.requiredQty.toLocaleString()} {row.unitOfMeasure}
                  </td>
                  <td className="py-1.5 pr-3 tabular-nums text-slate-700">
                    {row.onHandQty.toLocaleString()} {row.unitOfMeasure}
                  </td>
                  <td className="py-1.5 pr-3">
                    <span
                      className={clsx(
                        "inline-flex items-center rounded border px-2 py-0.5 font-medium",
                        statusColorClasses(row.status)
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-1.5 pr-3 text-slate-500">
                    {row.usedBy.length} order line{row.usedBy.length === 1 ? "" : "s"}
                    {row.usedBy.length > 1 && (
                      <span className="text-slate-400"> ({row.usedBy.map((u) => u.productName).join(", ")})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
