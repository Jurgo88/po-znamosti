import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { getAuth } from "@/lib/auth";
import { getBaseUrl } from "@/lib/url";

/**
 * Registrácia cez pozvánku bez e-mailového odkazu (INVITE_LOGIN=1).
 *
 * Obyčajný POST z formulára + presmerovanie 303: funguje bez JavaScriptu,
 * vo vstavaných prehliadačoch aj so stránkou otvorenou pred novým nasadením
 * (server action by vtedy zlyhala na neznámom ID akcie).
 *
 * Platná pozvánka slúži ako dôkaz, že človeka pozval známy. Len pre nové
 * e-maily: existujúci účet sa takto prihlásiť nedá, inak by ho mohol prevziať
 * ktokoľvek, kto pozná cudzí e-mail.
 */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const base = await getBaseUrl();
  const invitePath = `/pozvanka/${encodeURIComponent(token)}`;
  const back = (error: string) =>
    Response.redirect(`${base}${invitePath}?chyba=${error}`, 303);

  if (getCloudflareContext().env.INVITE_LOGIN !== "1") return back("vypnute");

  const form = await request.formData();
  const parsed = z.string().trim().toLowerCase().email().max(200).safeParse(form.get("email"));
  if (!parsed.success) return back("email");
  const email = parsed.data;

  const db = getDb();
  const inv = await db.query.invite.findFirst({
    where: and(
      eq(schema.invite.token, token),
      isNull(schema.invite.acceptedBy),
      gt(schema.invite.expiresAt, new Date()),
    ),
  });
  if (!inv) return Response.redirect(`${base}${invitePath}`, 303);

  if (await db.query.user.findFirst({ where: eq(schema.user.email, email), columns: { id: true } }))
    return back("ucet");

  // Better Auth vytvorí prihlasovací odkaz; namiesto e-mailu naň človeka rovno pošleme.
  let url: string | undefined;
  await getAuth({ captureMagicLink: (u) => (url = u), baseURL: base }).api.signInMagicLink({
    body: {
      email,
      callbackURL: invitePath,
      newUserCallbackURL: `/profil?next=${encodeURIComponent(invitePath)}`,
    },
    headers: request.headers,
  });
  if (!url) return back("chyba");
  return Response.redirect(url, 303);
}
