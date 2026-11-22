"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { DISTRICTS } from "@/data/districts";
import { getAuth } from "@/lib/auth";
import { orderPair } from "@/lib/connections";
import { requireProfile, requireUser } from "@/lib/session";
import { getBaseUrl } from "@/lib/url";

const INVITE_DAYS = 30;

function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/siet";
}

/* ---------- Profil ---------- */

const profileSchema = z.object({
  name: z.string().trim().min(2, "Zadaj meno a priezvisko.").max(80),
  district: z.enum(DISTRICTS as [string, ...string[]], { message: "Vyber okres." }),
  bio: z.string().trim().max(500).optional(),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9 ()/-]*$/, "Telefón môže obsahovať len čísla, medzery a +.")
    .optional(),
  phoneVisible: z.boolean(),
});

export type FormState = { error?: string; ok?: boolean; token?: string; redirectTo?: string };

export async function saveProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("/profil");
  const parsed = profileSchema.safeParse({
    name: form.get("name"),
    district: form.get("district"),
    bio: form.get("bio") || undefined,
    phone: form.get("phone") || undefined,
    phoneVisible: form.get("phoneVisible") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Skontroluj údaje." };

  const { name, district, bio, phone, phoneVisible } = parsed.data;
  await getDb()
    .update(schema.user)
    .set({
      name,
      district,
      bio: bio ?? null,
      phone: phone ?? null,
      phoneVisible: Boolean(phone) && phoneVisible,
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, user.id));

  const next = form.get("next");
  if (next) redirect(safeNext(next));
  revalidatePath("/profil");
  return { ok: true };
}

export async function signOut() {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/");
}

/* ---------- Pozvánky ---------- */

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createInvite(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireProfile("/siet");
  const inviteeName = String(form.get("inviteeName") ?? "").trim().slice(0, 80) || null;
  const categoryId = Number(form.get("categoryId")) || null;
  const note = String(form.get("note") ?? "").trim().slice(0, 300) || null;
  if (categoryId && !inviteeName) return { error: "Napíš, koho odporúčaš." };
  const db = getDb();
  if (categoryId && !(await db.query.category.findFirst({ where: eq(schema.category.id, categoryId) })))
    return { error: "Vyber službu." };
  const token = newToken();
  await db.insert(schema.invite).values({
    token,
    fromUserId: user.id,
    inviteeName,
    categoryId,
    note: categoryId ? note : null,
    expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
  });
  revalidatePath("/siet");
  return { ok: true, token };
}

export async function cancelInvite(form: FormData) {
  const user = await requireUser("/siet");
  const token = String(form.get("token") ?? "");
  await getDb()
    .delete(schema.invite)
    .where(
      and(
        eq(schema.invite.token, token),
        eq(schema.invite.fromUserId, user.id),
        isNull(schema.invite.acceptedBy),
      ),
    );
  revalidatePath("/siet");
}

/** Prijatie pozvánky: vznikne známosť, a ak pozvánka nesie odporúčanie, aj zaručenie. */
export async function acceptInvite(form: FormData) {
  const token = String(form.get("token") ?? "");
  const user = await requireProfile(`/pozvanka/${token}`);
  const db = getDb();

  const inv = await db.query.invite.findFirst({
    where: and(
      eq(schema.invite.token, token),
      isNull(schema.invite.acceptedBy),
      gt(schema.invite.expiresAt, new Date()),
    ),
  });
  if (!inv) redirect(`/pozvanka/${token}`);
  if (inv.fromUserId === user.id) redirect("/siet");

  const [userA, userB] = orderPair(inv.fromUserId, user.id);
  const statements: BatchItem<"sqlite">[] = [
    db
      .update(schema.invite)
      .set({ acceptedBy: user.id, acceptedAt: new Date() })
      .where(and(eq(schema.invite.token, token), isNull(schema.invite.acceptedBy))),
    db
      .insert(schema.connection)
      .values({ userA, userB, status: "confirmed" })
      .onConflictDoUpdate({
        target: [schema.connection.userA, schema.connection.userB],
        set: { status: "confirmed" },
      }),
  ];
  if (inv.categoryId) {
    statements.push(
      db
        .insert(schema.vouch)
        .values({
          fromUserId: inv.fromUserId,
          forUserId: user.id,
          categoryId: inv.categoryId,
          note: inv.note,
        })
        .onConflictDoNothing(),
      // Služba čaká na potvrdenie poskytovateľom (active = false)
      db
        .insert(schema.providerService)
        .values({ userId: user.id, categoryId: inv.categoryId, district: user.district })
        .onConflictDoNothing(),
    );
  }
  await db.batch(statements as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]]);

  redirect(inv.categoryId ? "/profil?sluzby=1#sluzby" : "/siet?novy=1");
}

/**
 * Registrácia cez pozvánku bez e-mailového odkazu (zapína INVITE_LOGIN=1).
 * Platná pozvánka slúži ako dôkaz, že človeka pozval známy. Len pre nové
 * e-maily: existujúci účet sa takto prihlásiť nedá, inak by ho mohol
 * prevziať ktokoľvek, kto pozná cudzí e-mail.
 */
export async function joinViaInvite(_prev: FormState, form: FormData): Promise<FormState> {
  const { env } = getCloudflareContext();
  if (env.INVITE_LOGIN !== "1") return { error: "Registrácia cez pozvánku je vypnutá." };

  const token = String(form.get("token") ?? "");
  const parsed = z.string().trim().toLowerCase().email().max(200).safeParse(form.get("email"));
  if (!parsed.success) return { error: "Zadaj platný e-mail." };
  const email = parsed.data;

  const db = getDb();
  const inv = await db.query.invite.findFirst({
    where: and(
      eq(schema.invite.token, token),
      isNull(schema.invite.acceptedBy),
      gt(schema.invite.expiresAt, new Date()),
    ),
  });
  if (!inv) return { error: "Pozvánka už neplatí." };

  if (await db.query.user.findFirst({ where: eq(schema.user.email, email), columns: { id: true } }))
    return { error: "existing" };

  // Better Auth vytvorí prihlasovací odkaz; namiesto e-mailu naň človeka rovno pošleme.
  let url: string | undefined;
  const next = `/pozvanka/${token}`;
  await getAuth({ captureMagicLink: (u) => (url = u), baseURL: await getBaseUrl() }).api.signInMagicLink({
    body: { email, callbackURL: next, newUserCallbackURL: `/profil?next=${encodeURIComponent(next)}` },
    headers: await headers(),
  });
  if (!url) return { error: "Registrácia sa nepodarila. Skús to znova." };
  // Plná navigácia v prehliadači (nie redirect zo server action), aby sa uložila session cookie.
  return { redirectTo: url };
}

/* ---------- Známosti ---------- */

export async function removeConnection(form: FormData) {
  const user = await requireUser("/siet");
  const otherId = String(form.get("userId") ?? "");
  const [userA, userB] = orderPair(user.id, otherId);
  await getDb()
    .delete(schema.connection)
    .where(and(eq(schema.connection.userA, userA), eq(schema.connection.userB, userB)));
  revalidatePath("/siet");
}
