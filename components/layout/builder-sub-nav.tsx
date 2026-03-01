"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BuilderSubNav({ builderId }: { builderId: string }) {
  const pathname = usePathname();
  const base = `/builders/${builderId}`;

  const tabs = [
    { label: "Overview", href: base },
    { label: "Projects", href: `${base}/projects` },
    { label: "Connections", href: `${base}/connections` },
    { label: "Leads", href: `${base}/leads` },
    { label: "Sessions", href: `${base}/sessions` },
  ];

  return (
    <nav className="flex gap-1 border-b px-4">
      {tabs.map((tab) => {
        const isActive =
          tab.href === base
            ? pathname === base
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
