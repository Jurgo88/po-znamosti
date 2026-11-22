"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, schema } from "@/db";
import { areConnected } from "@/lib/connections";
import { sendEmail } from "@/lib/email";
import { isWithinReach } from "@/lib/network";
import { requireProfile } from "@/lib/session";
import { getBaseUrl } from "@/lib/url";
import type { FormState } from "./actions";

const CONTACTS_PER_DAY = 10;

async function findCategory(id: number) {
  if (!id) return null;
  return getDb().query.category.findFirst({ where: eq(schema.category.id, id) });
}

/* ---------- Zaručenie sa ---------- */

/** Zaručím sa za známeho. Ak službu ešte nemá, vznikne mu na potvrdenie. */
export async function vouchForFriend(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireProfile("/odporucit");
  const forUserId = String(form.get("forUserId") ?? "");
  const cat = await findCategory(Number(form.get("categoryId")));
  const note = String(form.get("note") ?? "").trim().slice(0, 300) || null;
  if (!cat) return { error: "Vyber službu." };
  const db = getDb();
  if (forUserId === me.id || !(await areConnected(db, me.id, forUserId)))
    return { error: "Zaručiť sa môžeš len za svojho známeho." };

  const target = await db.query.user.findFirst({
    where: eq(schema.user.id, forUserId),
    columns: { district: true },
  });
  await db.batch([
    db
      .insert(schema.vouch)
      .values({ fromUserId: me.id, forUserId, categoryId: cat.id, note })
      .onConflictDoUpdate({
        target: [schema.vouch.fromUserId, schema.vouch.forUserId, schema.vouch.categoryId],
        set: { note },
      }),
    db
      .insert(schema.providerService)
      .values({ userId: forUserId, categoryId: cat.id, district: target?.district ?? null })
      .onConflictDoNothing(),
  ]);
  revalidatePath("/profil");
  return { ok: true };
}

export async function removeVouch(form: FormData) {
  const me = await requireProfile("/profil");
  const id = String(form.get("id") ?? "");
  await getDb()
    .delete(schema.vouch)
    .where(and(eq(schema.vouch.id, id), eq(schema.vouch.fromUserId, me.id)));
  revalidatePath("/profil");
}

/* ---------- Moje služby ---------- */

export async function addService(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireProfile("/profil");
  const cat = await findCategory(Number(form.get("categoryId")));
  if (!cat) return { error: "Vyber službu." };
  const description = String(form.get("description") ?? "").trim().slice(0, 300) || null;
  await getDb()
    .insert(schema.providerService)
    .values({ userId: me.id, categoryId: cat.id, description, district: me.district, active: true })
    .onConflictDoUpdate({
      target: [schema.providerService.userId, schema.providerService.categoryId],
      set: { description, active: true },
    });
  revalidatePath("/profil");
  return { ok: true };
}

/** Potvrdenie služby, ktorú mi niekto odporučil, vrátane popisu. */
export async function confirmService(form: FormData) {
  const me = await requireProfile("/profil");
  const id = String(form.get("id") ?? "");
  const description = String(form.get("description") ?? "").trim().slice(0, 300) || null;
  await getDb()
    .update(schema.providerService)
    .set({ active: true, description, district: me.district })
    .where(and(eq(schema.providerService.id, id), eq(schema.providerService.userId, me.id)));
  revalidatePath("/profil");
}

/** Odstránenie služby (aj zamietnutie odporučenej). Zaručenia ostávajú, kým ju znova nepotvrdím. */
export async function removeService(form: FormData) {
  const me = await requireProfile("/profil");
  const id = String(form.get("id") ?? "");
  await getDb()
    .delete(schema.providerService)
    .where(and(eq(schema.providerService.id, id), eq(schema.providerService.userId, me.id)));
  revalidatePath("/profil");
}

/* ---------- Kontakt ---------- */

export async function sendContact(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireProfile("/hladat");
  const toUserId = String(form.get("toUserId") ?? "");
  const message = String(form.get("message") ?? "").trim();
  const cat = await findCategory(Number(form.get("categoryId")));
  if (message.length < 10) return { error: "Napíš aspoň pár slov, s čím potrebuješ pomôcť." };
  if (message.length > 2000) return { error: "Správa je príliš dlhá (max. 2000 znakov)." };
  if (toUserId === me.id) return { error: "Sebe správu poslať nemôžeš." };

  const db = getDb();
  if (!(await isWithinReach(db, me.id, toUserId)))
    return { error: "Tento človek nie je v tvojej sieti." };

  const [{ sent }] = await db
    .select({ sent: count() })
    .from(schema.contactRequest)
    .where(
      and(
        eq(schema.contactRequest.fromUserId, me.id),
        gt(schema.contactRequest.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
      ),
    );
  if (sent >= CONTACTS_PER_DAY)
    return { error: "Dnes už bolo odoslaných veľa správ. Skús to znova zajtra." };

  const to = await db.query.user.findFirst({
    where: eq(schema.user.id, toUserId),
    columns: { email: true, name: true },
  });
  if (!to) return { error: "Používateľ neexistuje." };

  await db
    .insert(schema.contactRequest)
    .values({ fromUserId: me.id, toUserId, categoryId: cat?.id ?? null, message });

  const base = await getBaseUrl();
  const about = cat ? ` (${cat.name})` : "";
  await sendEmail({
    to: to.email,
    replyTo: me.email,
    subject: `${me.name} ti píše cez Po známosti${about}`,
    text: `Ahoj ${to.name},\n\n${me.name} (${me.district}) ťa našiel cez Po známosti${about} a píše:\n\n${message}\n\nOdpovedz priamo na tento e-mail, správa príde na ${me.email}.${
      me.phoneVisible && me.phone ? `\nTelefón: ${me.phone}` : ""
    }\n\nPo známosti\n${base}`,
  });

  return { ok: true };
}
