export const COMPONENT_TYPES = [
  "BOTTLE",
  "CLOSURE",
  "LABEL",
  "BULK",
  "DROPPER",
  "BOX",
  "OTHER",
] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

export const CHECK_STATUSES = ["GREEN", "YELLOW", "RED", "MANUAL"] as const;
export type CheckStatus = (typeof CHECK_STATUSES)[number];

export const ORDER_SOURCES = ["EMAIL", "RESTOCK_REPORT", "MANUAL"] as const;
export type OrderSource = (typeof ORDER_SOURCES)[number];

export const PRIORITIES = ["NORMAL", "HOT"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const KANBAN_STAGES = [
  "INCOMING",
  "READY",
  "LINE_1",
  "LINE_2",
  "MANUAL",
  "CARTONING",
  "SHRINKING",
  "COMPLETED",
] as const;
export type KanbanStage = (typeof KANBAN_STAGES)[number];

export const KANBAN_STAGE_LABELS: Record<KanbanStage, string> = {
  INCOMING: "Incoming",
  READY: "Ready",
  LINE_1: "Line 1",
  LINE_2: "Line 2",
  MANUAL: "Manual",
  CARTONING: "Cartoning",
  SHRINKING: "Shrinking",
  COMPLETED: "Completed",
};

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  BOTTLE: "Bottle",
  CLOSURE: "Closure",
  LABEL: "Label",
  BULK: "Bulk",
  DROPPER: "Dropper",
  BOX: "Box",
  OTHER: "Other",
};

export function statusColorClasses(status: CheckStatus): string {
  switch (status) {
    case "GREEN":
      return "bg-green-100 text-green-800 border-green-300";
    case "YELLOW":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "RED":
      return "bg-red-100 text-red-800 border-red-300";
    case "MANUAL":
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
}

export function computeStatus(requiredQty: number, onHandQty: number): CheckStatus {
  if (onHandQty <= 0) return "RED";
  if (onHandQty < requiredQty) return "RED";
  if (onHandQty < requiredQty * 1.25) return "YELLOW";
  return "GREEN";
}

export function last4(fnsku: string | null | undefined): string {
  if (!fnsku) return "----";
  return fnsku.slice(-4);
}
