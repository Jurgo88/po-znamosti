import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Ubuntu } from "next/font/google";
import { getCurrentUser } from "@/lib/session";
import { DesktopNav, MobileTabBar } from "@/components/nav";
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

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-[17px] font-bold tracking-tight">
      <span aria-hidden className="flex">
        <span className="size-2.5 rounded-full bg-brand" />
        <span className="-ml-0.5 size-2.5 rounded-full border-2 border-brand bg-white" />
      </span>
      Po známosti
    </Link>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="sk">
      <body className={`${ubuntu.variable} min-h-dvh bg-white font-sans text-ink antialiased`}>
        <header className="border-b border-hair bg-white">
          <nav className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
            <Logo />
            {user ? (
              <>
                <DesktopNav />
                <Link href="/siet" className="text-sm font-medium text-brand sm:hidden">
                  Pozvať známeho
                </Link>
              </>
            ) : (
              <Link href="/prihlasenie" className="text-sm font-medium text-brand">
                Prihlásiť sa
              </Link>
            )}
          </nav>
        </header>
        <main className={`mx-auto max-w-5xl px-4 py-8 sm:px-6 ${user ? "pb-28 sm:pb-12" : ""}`}>
          {children}
        </main>
        {user && <MobileTabBar />}
      </body>
    </html>
  );
}
