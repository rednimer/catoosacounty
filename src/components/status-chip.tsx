import clsx from "clsx";
import { CheckStatus, statusColorClasses } from "@/lib/constants";

export function StatusChip({
  status,
  label,
  title,
}: {
  status: CheckStatus | "NONE";
  label: string;
  title?: string;
}) {
  if (status === "NONE") {
    return (
      <span
        title={title}
        className="inline-flex items-center rounded border border-dashed border-slate-300 px-2 py-0.5 text-xs text-slate-400"
      >
        {label}
      </span>
    );
  }

  return (
    <span
      title={title}
      className={clsx(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
        statusColorClasses(status)
      )}
    >
      {label}
    </span>
  );
}
