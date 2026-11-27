import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Ubuntu } from "next/font/google";
import { getCurrentUser } from "@/lib/session";
import { DesktopNav, MobileTabBar, ProfileLink } from "@/components/nav";
import { IconPlus } from "@/components/icons";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Po známosti",
  description: "Nájdi overených remeselníkov a služby cez ľudí, ktorých poznáš.",
};

// Celá aplikácia závisí od prihlásenia, nič sa negeneruje staticky.
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

/** Logo: dva štvorcové body spojené čiarou, ako v reťazi známych. */
function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`flex items-center ${className}`}>
      <span className="size-2.5 rounded-[2px] bg-brand" />
      <span className="h-0.5 w-2.5 bg-brand" />
      <span className="size-2.5 rounded-[2px] border-2 border-brand bg-white" />
    </span>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-[17px] font-bold tracking-tight">
      <LogoMark />
      Po známosti
    </Link>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="sk">
      <body className={`${ubuntu.variable} flex min-h-dvh flex-col bg-surface font-sans text-ink antialiased`}>
        <header className="sticky top-0 z-20 border-b border-hair bg-white/95 backdrop-blur">
          <nav className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
            <div className="flex items-center gap-8">
              <Logo />
              {user && <DesktopNav />}
            </div>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/siet"
                  className="flex items-center gap-1.5 rounded-ui px-2 py-1.5 text-sm font-medium text-brand hover:bg-brand-50"
                >
                  <IconPlus size={16} />
                  Pozvať známeho
                </Link>
                <ProfileLink name={user.name} />
              </div>
            ) : (
              <Link href="/prihlasenie" className="btn min-h-10 px-4 text-sm">
                Prihlásiť sa
              </Link>
            )}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        <footer className={`border-t border-hair bg-white ${user ? "pb-20 sm:pb-0" : ""}`}>
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-6 text-xs text-muted sm:px-6">
            <p className="flex items-center gap-2">
              <LogoMark className="scale-90" />
              Odporúčania len od ľudí, ktorých poznáš.
            </p>
            <div className="flex gap-4">
              <Link href="/sukromie" className="hover:text-ink hover:underline">
                Ochrana súkromia
              </Link>
              <Link href="/podmienky" className="hover:text-ink hover:underline">
                Podmienky používania
              </Link>
            </div>
          </div>
        </footer>
        {user && <MobileTabBar />}
      </body>
    </html>
  );
}
