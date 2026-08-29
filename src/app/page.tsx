import Link from "next/link";

const screens = [
  {
    href: "/orders",
    title: "Order Sheet",
    description:
      "Sortable order intake table. Check inventory needs against FNSKU, flag supply gaps, and send orders to production.",
  },
  {
    href: "/production",
    title: "Production Board",
    description:
      "Kanban view of work orders moving through Incoming, Ready, the lines, cartoning, shrinking, and completion.",
  },
  {
    href: "/shipping",
    title: "Shipping & Invoicing",
    description:
      "Log outbound shipments and roll them up into a monthly amount-due per customer, priced by FNSKU.",
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">FSL Production Hub</h1>
      <p className="mt-1 text-sm text-slate-500">
        Fifth Street Labs — orders, inventory, production, and shipping in one place.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {screens.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <h2 className="text-lg font-medium text-slate-900">{s.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
