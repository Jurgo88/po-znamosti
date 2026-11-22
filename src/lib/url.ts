import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";

/**
 * Verejná adresa aplikácie. Ak nie je nastavené BETTER_AUTH_URL (napr. kým beží
 * na *.workers.dev bez vlastnej domény), zistí sa z aktuálnej požiadavky.
 */
export async function getBaseUrl() {
  const { env } = getCloudflareContext();
  if (env.BETTER_AUTH_URL) return env.BETTER_AUTH_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
