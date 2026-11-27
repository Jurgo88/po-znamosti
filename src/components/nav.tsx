"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconNetwork, IconSearch, IconUser, IconVouch } from "./icons";

const ITEMS = [
  { href: "/hladat", label: "Hľadať", Icon: IconSearch },
  { href: "/siet", label: "Moja sieť", Icon: IconNetwork },
  { href: "/odporucit", label: "Zaručiť sa", Icon: IconVouch },
  { href: "/profil", label: "Profil", Icon: IconUser },
];

function useActive() {
  const path = usePathname();
  return (href: string) => path === href || path.startsWith(href + "/");
}

export function DesktopNav() {
  const isActive = useActive();
  return (
    <div className="hidden items-center gap-1 text-sm sm:flex">
      {ITEMS.slice(0, 3).map(({ href, label, Icon }) => {
        const on = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`flex items-center gap-2 rounded-ui px-3 py-2 transition-colors ${
              on ? "bg-brand-100 font-medium text-brand" : "text-muted hover:bg-surface hover:text-ink"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

/** Odkaz na profil s iniciálami vpravo v hlavičke (desktop). */
export function ProfileLink({ name }: { name: string }) {
  const isActive = useActive();
  const on = isActive("/profil");
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?";
  return (
    <Link
      href="/profil"
      aria-current={on ? "page" : undefined}
      aria-label="Môj profil"
      className={`hidden size-9 place-items-center rounded-ui text-xs font-bold transition-colors sm:grid ${
        on ? "bg-brand text-white" : "bg-brand-100 text-brand hover:bg-brand-200"
      }`}
    >
      {initials}
    </Link>
  );
}

export function MobileTabBar() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Hlavná navigácia"
      className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-hair bg-white/95 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden"
    >
      {ITEMS.map(({ href, label, Icon }) => {
        const on = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`grid justify-items-center gap-1 text-[11px] ${on ? "font-medium text-brand" : "text-muted"}`}
          >
            <span
              aria-hidden
              className={`grid h-8 w-14 place-items-center rounded-ui transition-colors ${on ? "bg-brand-100" : ""}`}
            >
              <Icon size={21} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
