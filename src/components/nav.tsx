"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/hladat", label: "Hľadať" },
  { href: "/siet", label: "Moja sieť" },
  { href: "/odporucit", label: "Zaručiť sa" },
  { href: "/profil", label: "Profil" },
];

function useActive() {
  const path = usePathname();
  return (href: string) => path === href || path.startsWith(href + "/");
}

export function DesktopNav() {
  const isActive = useActive();
  return (
    <div className="hidden items-center gap-6 text-sm sm:flex">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={isActive(i.href) ? "page" : undefined}
          className={`border-b-2 py-5 ${
            isActive(i.href) ? "border-brand font-medium text-ink" : "border-transparent text-muted hover:text-ink"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </div>
  );
}

export function MobileTabBar() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Hlavná navigácia"
      className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-hair bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 sm:hidden"
    >
      {ITEMS.map((i) => {
        const on = isActive(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={on ? "page" : undefined}
            className={`grid justify-items-center gap-1.5 text-xs ${on ? "font-medium text-brand" : "text-muted"}`}
          >
            <span aria-hidden className={`h-[3px] w-5 rounded-[2px] ${on ? "bg-brand" : "bg-line"}`} />
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
