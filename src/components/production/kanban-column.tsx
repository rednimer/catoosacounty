"use client";

import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import { SerializedOrderItem } from "@/lib/order-items";
import { KanbanCard } from "@/components/production/kanban-card";
import { KanbanStage, KANBAN_STAGE_LABELS } from "@/lib/constants";

export function KanbanColumn({
  stage,
  items,
  onOpenItem,
}: {
  stage: KanbanStage;
  items: SerializedOrderItem[];
  onOpenItem: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex w-64 shrink-0 flex-col rounded-lg border bg-slate-50/60 p-2",
        isOver ? "border-slate-400 bg-slate-100" : "border-slate-200"
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {KANBAN_STAGE_LABELS[stage]}
        </h3>
        <span className="rounded-full bg-slate-200 px-1.5 text-[10px] font-medium text-slate-600">
          {items.length}
        </span>
      </div>
      <div className="flex min-h-[80px] flex-1 flex-col gap-2">
        {items.map((item) => (
          <KanbanCard key={item.id} item={item} onOpen={() => onOpenItem(item.id)} />
        ))}
      </div>
    </div>
  );
}
