"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/orders", label: "Order Sheet" },
  { href: "/production", label: "Production Board" },
  { href: "/shipping", label: "Shipping & Invoicing" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-wide text-slate-900">
          FSL PRODUCTION HUB
        </Link>
        <nav className="flex gap-1">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
