"use client";

import { useRef, useState } from "react";
import { SerializedOrderItem } from "@/lib/order-items";
import { api } from "@/lib/api-client";
import { KANBAN_STAGE_LABELS } from "@/lib/constants";

export function ItemDetailDrawer({
  item,
  onClose,
  onChanged,
}: {
  item: SerializedOrderItem;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [notes, setNotes] = useState(item.notes ?? "");
  const [caption, setCaption] = useState("");
  const [actualQty, setActualQty] = useState(String(item.quantity));
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function saveNotes() {
    if (notes === (item.notes ?? "")) return;
    await api.orderItems.patch(item.id, { notes });
    onChanged();
  }

  async function togglePriority() {
    setBusy(true);
    try {
      await api.orderItems.patch(item.id, { priority: item.priority === "HOT" ? "NORMAL" : "HOT" });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhoto() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await api.orderItems.uploadPhoto(item.id, file, caption);
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function completeProduction() {
    setBusy(true);
    try {
      await api.orderItems.complete(item.id, Number(actualQty));
      onChanged();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{item.displayName}</h2>
            <p className="text-xs text-slate-500">
              {item.workOrderNumber ?? "no WO#"} · Qty {item.quantity} · …{item.fnskuLast4} ·{" "}
              {KANBAN_STAGE_LABELS[item.kanbanStage as keyof typeof KANBAN_STAGE_LABELS]}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <button
          onClick={togglePriority}
          disabled={busy}
          className={`mt-3 rounded px-2.5 py-1 text-xs font-medium ${
            item.priority === "HOT" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {item.priority === "HOT" ? "★ Hot item — click to unmark" : "Mark as hot / prioritized"}
        </button>

        <section className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Production guidelines
          </h3>
          <p className="mt-1 whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-2 text-sm text-slate-700">
            {item.productionGuidelines || "No guidelines on file for this product."}
          </p>
        </section>

        <section className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={3}
            className="mt-1 w-full rounded border border-slate-300 p-2 text-sm"
            placeholder="What's being done to complete this item…"
          />
        </section>

        <section className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">QA photos</h3>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {item.qaPhotos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.url} alt={p.caption ?? "QA photo"} className="h-20 w-full rounded object-cover" />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="text-xs" />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
            />
            <button
              onClick={uploadPhoto}
              disabled={busy}
              className="rounded bg-slate-900 px-2 py-1 text-xs text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Upload
            </button>
          </div>
        </section>

        {item.kanbanStage !== "COMPLETED" && (
          <section className="mt-6 border-t border-slate-200 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Finish production
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={actualQty}
                onChange={(e) => setActualQty(e.target.value)}
                className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
              />
              <span className="text-xs text-slate-500">actual qty produced</span>
            </div>
            <button
              onClick={completeProduction}
              disabled={busy}
              className="mt-2 rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Complete & close make order
            </button>
            <p className="mt-1 text-[11px] text-slate-400">
              {item.odooMakeOrderRef
                ? `Will close Odoo make order ${item.odooMakeOrderRef} (stubbed).`
                : "No make order was opened for this item yet."}
            </p>
          </section>
        )}

        {item.kanbanStage === "COMPLETED" && (
          <section className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
            Completed {item.completedAt ? new Date(item.completedAt).toLocaleString() : ""} — actual qty{" "}
            {item.actualQtyProduced}.{" "}
            {item.odooMakeOrderClosed ? "Make order closed in Odoo (stubbed)." : ""}
          </section>
        )}
      </div>
    </div>
  );
}
