"use client";

import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import { SerializedOrderItem } from "@/lib/order-items";

export function KanbanCard({
  item,
  onOpen,
}: {
  item: SerializedOrderItem;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className={clsx(
        "cursor-grab select-none rounded-md border bg-white p-2.5 text-xs shadow-sm active:cursor-grabbing",
        isDragging ? "z-10 opacity-70 shadow-md" : "opacity-100",
        item.priority === "HOT" ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="font-medium text-slate-800">{item.displayName}</span>
        {item.priority === "HOT" && (
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">HOT</span>
        )}
      </div>
      <div className="mt-1 text-slate-500">
        Qty {item.quantity} · …{item.fnskuLast4}
      </div>
      <div className="mt-1 flex items-center justify-between text-slate-400">
        <span>{item.workOrderNumber ?? "no WO#"}</span>
        <span>{item.customer?.name ?? ""}</span>
      </div>
    </div>
  );
}
