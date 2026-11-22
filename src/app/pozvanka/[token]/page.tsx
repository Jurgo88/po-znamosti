import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { acceptInvite } from "@/app/actions";
import { getDb, schema } from "@/db";
import { areConnected } from "@/lib/connections";
import { getCurrentUser } from "@/lib/session";
import { JoinForm } from "./join-form";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ chyba?: string }>;
}) {
  const { token } = await params;
  const { chyba } = await searchParams;
  const db = getDb();
  const inv = await db.query.invite.findFirst({ where: eq(schema.invite.token, token) });
  const from = inv
    ? await db.query.user.findFirst({
        where: eq(schema.user.id, inv.fromUserId),
        columns: { id: true, name: true },
      })
    : null;
  const user = await getCurrentUser();

  const invalid =
    !inv || !from || (inv.acceptedBy && inv.acceptedBy !== user?.id) || inv.expiresAt < new Date();
  if (invalid) {
    return (
      <Message title="Pozvánka už neplatí">
        Odkaz bol použitý alebo mu vypršala platnosť. Popros toho, kto ti ho poslal, o nový.
      </Message>
    );
  }

  if (user?.id === from.id) {
    return (
      <Message title="Toto je tvoja pozvánka">
        Pošli tento odkaz známemu, ktorého chceš pozvať.
      </Message>
    );
  }

  if (inv.acceptedBy === user?.id || (user && (await areConnected(db, user.id, from.id)))) {
    return (
      <Message title={`S ${from.name} ste už prepojení`}>
        <Link href="/siet" className="btn mt-4">
          Moja sieť
        </Link>
      </Message>
    );
  }

  const next = `/pozvanka/${token}`;
  const loginHref = `/prihlasenie?next=${encodeURIComponent(next)}`;
  const inviteLogin = getCloudflareContext().env.INVITE_LOGIN === "1";
  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div>
        <p className="text-muted">Pozvánka do Po známosti</p>
        <h1 className="mt-1 text-2xl font-bold">{from.name} ťa pozýva do svojej siete</h1>
        <p className="mt-3 text-muted">
          Budete prepojení ako známi. Uvidíš, koho {from.name} odporúča, a môže odporučiť aj teba.
        </p>
      </div>
      {user ? (
        <form action={acceptInvite}>
          <input type="hidden" name="token" value={token} />
          <button className="btn w-full">Prijať pozvánku</button>
        </form>
      ) : inviteLogin ? (
        <JoinForm token={token} loginHref={loginHref} error={chyba} />
      ) : (
        <Link href={loginHref} className="btn w-full">
          Prihlásiť sa a prijať
        </Link>
      )}
    </div>
  );
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md space-y-2 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="text-muted">{children}</div>
    </div>
  );
}
