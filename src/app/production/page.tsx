import { KanbanBoard } from "@/components/production/kanban-board";

export default function ProductionPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Production Board</h1>
      <p className="mt-1 text-sm text-slate-500">
        Drag cards between stations as work moves through the floor. Click a card for notes, production
        guidelines, and QA photos.
      </p>
      <KanbanBoard />
    </div>
  );
}
