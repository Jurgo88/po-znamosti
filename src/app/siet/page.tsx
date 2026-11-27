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
import { EmptyState, PageHead } from "@/components/page-head";
import { IconCheck, IconClock, IconLink, IconNetwork, IconPin, IconVouch } from "@/components/icons";

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
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHead icon={<IconNetwork size={22} />} eyebrow="Moja sieť" title="Ľudia, ktorých poznáš">
        Čím viac známych pozveš, tým viac overených majstrov nájdeš. Vidíš aj ľudí, za ktorých sa
        tvoji známi zaručili.
      </PageHead>

      {novy && (
        <p className="notice">
          <IconCheck size={18} />
          Pozvánka prijatá, ste prepojení.
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3">
        <div className="card p-4 sm:p-5">
          <dt className="text-sm text-muted">Známi</dt>
          <dd className="mt-1 text-[28px] leading-none font-bold text-brand">{friends.length}</dd>
        </div>
        <div className="card p-4 sm:p-5">
          <dt className="text-sm text-muted">Čakajúce pozvánky</dt>
          <dd className="mt-1 text-[28px] leading-none font-bold text-brand">{invites.length}</dd>
        </div>
      </dl>

      <section className="card space-y-5">
        <div className="flex items-start gap-3">
          <span className="icon-tile">
            <IconLink size={20} />
          </span>
          <div>
            <h2 className="section-title">Pozvať známeho</h2>
            <p className="text-sm text-muted">
              Vytvor odkaz a pošli ho cez WhatsApp, SMS alebo e-mail. Použiť ho môže jeden človek,
              platí 30 dní.
            </p>
          </div>
        </div>
        <InviteForm />
        {invites.length > 0 && (
          <ul className="divide-y divide-hair rounded-ui border border-hair">
            {invites.map((inv) => (
              <li key={inv.token} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="grid size-9 place-items-center rounded-ui border-2 border-dashed border-brand-300 text-brand-400">
                  <IconClock size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{inv.inviteeName ?? "Pozvánka bez mena"}</p>
                  <p className="text-xs text-muted">
                    Čaká na prijatie · platí do {inv.expiresAt.toLocaleDateString("sk-SK")}
                  </p>
                </div>
                <CopyLink url={`${base}/pozvanka/${inv.token}`} />
                <form action={cancelInvite}>
                  <input type="hidden" name="token" value={inv.token} />
                  <button className="btn-ghost">Zrušiť</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {friends.length === 0 ? (
        <EmptyState title="Zatiaľ tu nikto nie je">
          Pozvi prvých známych a sieť začne rásť. Stačí jeden odkaz.
        </EmptyState>
      ) : (
        <section className="space-y-3">
          <h2 className="section-title">
            Známi <span className="badge">{friends.length}</span>
          </h2>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {friends.map((f) => (
              <li key={f.id} className="card flex items-center gap-3 p-4 sm:p-4">
                <Link href={`/clovek/${f.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={f.name} size={44} />
                  <div className="min-w-0">
                    <p className="truncate font-medium group-hover:text-brand">{f.name}</p>
                    {f.district && (
                      <p className="flex items-center gap-1 text-sm text-muted">
                        <IconPin size={14} />
                        {f.district}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <Link href={`/odporucit?komu=${f.id}`} className="btn-ghost text-brand hover:text-brand">
                    <IconVouch size={16} />
                    Zaručiť sa
                  </Link>
                  <form action={removeConnection}>
                    <input type="hidden" name="userId" value={f.id} />
                    <button className="btn-ghost min-h-8 text-xs">Odobrať</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
