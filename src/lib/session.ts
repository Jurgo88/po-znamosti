import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";

/** Prihlásený používateľ s profilovými poliami, alebo null. */
export async function getCurrentUser() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return null;
  const db = getDb();
  const row = await db.query.user.findFirst({ where: eq(schema.user.id, session.user.id) });
  return row ?? null;
}

/** Vyžaduje prihlásenie; neprihláseného pošle na prihlásenie s návratom na `next`. */
export async function requireUser(next = "/siet") {
  const user = await getCurrentUser();
  if (!user) redirect(`/prihlasenie?next=${encodeURIComponent(next)}`);
  return user;
}

/** Ako requireUser, ale navyše vyžaduje vyplnený profil (meno a okres). */
export async function requireProfile(next = "/siet") {
  const user = await requireUser(next);
  if (!user.name || !user.district) redirect(`/profil?next=${encodeURIComponent(next)}`);
  return user;
}
