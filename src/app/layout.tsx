import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Po známosti",
  description: "Nájdi overených remeselníkov a služby cez ľudí, ktorých poznáš.",
};

// Celá aplikácia závisí od prihlásenia, nič sa negeneruje staticky.
export const dynamic = "force-dynamic";

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="sk">
      <body className={`${geist.variable} min-h-dvh bg-stone-50 text-stone-900 antialiased`}>
        <header className="border-b border-stone-200 bg-white">
          <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight">
              Po známosti
            </Link>
            {user ? (
              <div className="flex items-center gap-3 text-sm sm:gap-4">
                <Link href="/hladat" className="hover:underline">
                  Hľadať
                </Link>
                <Link href="/odporucit" className="hover:underline">
                  Odporučiť
                </Link>
                <Link href="/siet" className="hover:underline">
                  Moja sieť
                </Link>
                <Link href="/profil" className="hover:underline">
                  Profil
                </Link>
              </div>
            ) : (
              <Link href="/prihlasenie" className="text-sm hover:underline">
                Prihlásiť sa
              </Link>
            )}
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
