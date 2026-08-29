"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { api } from "@/lib/api-client";
import { SerializedOrderItem } from "@/lib/order-items";
import { KANBAN_STAGES, KanbanStage } from "@/lib/constants";
import { KanbanColumn } from "@/components/production/kanban-column";
import { ItemDetailDrawer } from "@/components/production/item-detail-drawer";

export function KanbanBoard() {
  const [items, setItems] = useState<SerializedOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completeQty, setCompleteQty] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const refresh = useCallback(async () => {
    const all = await api.orderItems.list();
    setItems(all.filter((i) => i.sentToProductionAt));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byStage = useMemo(() => {
    const map = new Map<KanbanStage, SerializedOrderItem[]>();
    for (const stage of KANBAN_STAGES) map.set(stage, []);
    for (const item of items) {
      map.get(item.kanbanStage as KanbanStage)?.push(item);
    }
    return map;
  }, [items]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const itemId = String(active.id);
    const targetStage = String(over.id) as KanbanStage;
    const item = items.find((i) => i.id === itemId);
    if (!item || item.kanbanStage === targetStage) return;

    if (targetStage === "COMPLETED") {
      setCompletingId(itemId);
      setCompleteQty(String(item.quantity));
      return;
    }

    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, kanbanStage: targetStage } : i)));
    try {
      await api.orderItems.moveKanban(itemId, targetStage);
    } catch (e) {
      console.error(e);
      refresh();
    }
  }

  const openItem = items.find((i) => i.id === openId) ?? null;
  const completingItem = items.find((i) => i.id === completingId) ?? null;

  return (
    <div>
      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Loading…</p>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-4">
            {KANBAN_STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                items={byStage.get(stage) ?? []}
                onOpenItem={setOpenId}
              />
            ))}
          </div>
        </DndContext>
      )}

      {openItem && (
        <ItemDetailDrawer item={openItem} onClose={() => setOpenId(null)} onChanged={refresh} />
      )}

      {completingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-slate-900">
              Complete {completingItem.displayName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Ordered qty {completingItem.quantity}. Enter what was actually produced — this closes the
              make order in Odoo (stubbed).
            </p>
            <input
              type="number"
              min={0}
              value={completeQty}
              onChange={(e) => setCompleteQty(e.target.value)}
              className="mt-3 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setCompletingId(null)}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await api.orderItems.complete(completingItem.id, Number(completeQty));
                  setCompletingId(null);
                  refresh();
                }}
                className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
