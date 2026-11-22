import Link from "next/link";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { cancelInvite, removeConnection } from "@/app/actions";
import { getDb, schema } from "@/db";
import { listConnections } from "@/lib/connections";
import { requireProfile } from "@/lib/session";
import { getBaseUrl } from "@/lib/url";
import { CopyLink } from "./copy-link";
import { InviteForm } from "./invite-form";
import { Avatar } from "@/components/avatar";

export default async function NetworkPage({
  searchParams,
}: {
  searchParams: Promise<{ novy?: string }>;
}) {
  const user = await requireProfile("/siet");
  const { novy } = await searchParams;
  const db = getDb();
  const base = await getBaseUrl();

  const [friends, invites] = await Promise.all([
    listConnections(db, user.id),
    db.query.invite.findMany({
      where: and(
        eq(schema.invite.fromUserId, user.id),
        isNull(schema.invite.acceptedBy),
        gt(schema.invite.expiresAt, new Date()),
      ),
      orderBy: desc(schema.invite.createdAt),
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Moja sieť</h1>
        <p className="mt-1 text-muted">
          {friends.length === 0
            ? "Zatiaľ tu nikto nie je. Pozvi prvých známych a sieť začne rásť."
            : `Máš ${friends.length} ${friends.length === 1 ? "známeho" : "známych"}.`}
        </p>
        {novy && (
          <p className="mt-3 rounded-ui bg-tint px-3 py-2 text-sm text-brand">
            Pozvánka prijatá, ste prepojení.
          </p>
        )}
      </div>

      <section className="card space-y-4">
        <div>
          <h2 className="font-semibold">Pozvať známeho</h2>
          <p className="text-sm text-muted">
            Vytvor odkaz a pošli ho cez WhatsApp, SMS alebo e-mail. Použiť ho môže jeden človek,
            platí 30 dní.
          </p>
        </div>
        <InviteForm />
        {invites.length > 0 && (
          <ul className="divide-y divide-hair border-t border-hair">
            {invites.map((inv) => (
              <li key={inv.token} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{inv.inviteeName ?? "Pozvánka bez mena"}</p>
                  <p className="text-xs text-muted">
                    Platí do {inv.expiresAt.toLocaleDateString("sk-SK")}
                  </p>
                </div>
                <CopyLink url={`${base}/pozvanka/${inv.token}`} />
                <form action={cancelInvite}>
                  <input type="hidden" name="token" value={inv.token} />
                  <button className="text-sm text-muted hover:underline">Zrušiť</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {friends.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Známi</h2>
          <ul className="card divide-y divide-hair p-0">
            {friends.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <Link href={`/clovek/${f.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={f.name} />
                  <div className="min-w-0">
                    <p className="truncate font-medium group-hover:underline">{f.name}</p>
                    {f.district && <p className="text-sm text-muted">{f.district}</p>}
                  </div>
                </Link>
                <form action={removeConnection}>
                  <input type="hidden" name="userId" value={f.id} />
                  <button className="text-sm text-muted hover:underline">Odobrať</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
