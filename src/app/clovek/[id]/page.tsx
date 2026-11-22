import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { areConnected } from "@/lib/connections";
import { isWithinReach, vouchesFromMyNetwork } from "@/lib/network";
import { requireProfile } from "@/lib/session";
import { ContactForm } from "./contact-form";
import { Avatar } from "@/components/avatar";
import { Chain } from "@/components/chain";

export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sluzba?: string }>;
}) {
  const { id } = await params;
  const { sluzba } = await searchParams;
  const me = await requireProfile(`/clovek/${id}`);
  const db = getDb();
  if (id === me.id) {
    return (
      <p className="text-muted">
        Toto je tvoj profil. Upraviť ho môžeš v sekcii{" "}
        <Link href="/profil" className="underline">
          Profil
        </Link>
        .
      </p>
    );
  }
  if (!(await isWithinReach(db, me.id, id))) notFound();

  const [person, services, vouches, friend] = await Promise.all([
    db.query.user.findFirst({ where: eq(schema.user.id, id) }),
    db
      .select({
        categoryId: schema.category.id,
        slug: schema.category.slug,
        name: schema.category.name,
        description: schema.providerService.description,
        district: schema.providerService.district,
      })
      .from(schema.providerService)
      .innerJoin(schema.category, eq(schema.category.id, schema.providerService.categoryId))
      .where(and(eq(schema.providerService.userId, id), eq(schema.providerService.active, true)))
      .orderBy(asc(schema.category.name)),
    vouchesFromMyNetwork(db, me.id, id),
    areConnected(db, me.id, id),
  ]);
  if (!person) notFound();
  const selected = services.find((s) => s.slug === sluzba) ?? services[0];
  const first = person.name.split(" ")[0];
  const via = vouches.find((v) => v.from_user_id !== me.id);
  const chain = friend ? ["Ty", first] : ["Ty", via?.name ?? "známy", first];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/hladat" className="text-sm font-medium text-brand">
        ← Späť na hľadanie
      </Link>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={person.name} size={56} />
          <div>
            <h1 className="text-[26px] font-bold leading-tight tracking-tight">{person.name}</h1>
            <p className="text-muted">
              {person.district}
              {friend ? " · tvoj známy" : ""}
            </p>
          </div>
        </div>
        {person.bio && <p className="text-ink">{person.bio}</p>}
        <div className="space-y-2 rounded-ui bg-surface p-4">
          <p className="text-xs text-muted">Ako ho poznáš</p>
          <Chain people={chain} size="md" />
        </div>
      </div>

      {services.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Služby</h2>
          <ul className="card divide-y divide-hair p-0">
            {services.map((s) => (
              <li key={s.categoryId} className="px-5 py-3">
                <p className="font-medium">{s.name}</p>
                {s.description && <p className="text-sm text-muted">{s.description}</p>}
                {s.district && <p className="text-xs text-muted">{s.district}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {vouches.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Odporúčania od tvojich známych</h2>
          <ul className="space-y-3">
            {vouches.map((v, i) => (
              <li key={i} className="quote">
                {v.note ?? "Zaručuje sa."}
                <span className="block text-xs text-muted">
                  {v.from_user_id === me.id ? "Ty" : v.name} · {v.category}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {friend && (
        <Link href={`/odporucit?komu=${person.id}`} className="btn-secondary">
          Zaručiť sa za tohto známeho
        </Link>
      )}

      <section id="kontakt" className="space-y-2">
        <h2 className="font-semibold">Kontakt</h2>
        {person.phoneVisible && person.phone && services.length > 0 && (
          <p>
            Telefón:{" "}
            <a href={`tel:${person.phone.replace(/\s/g, "")}`} className="font-medium underline">
              {person.phone}
            </a>
          </p>
        )}
        <ContactForm
          toUserId={person.id}
          categoryId={selected?.categoryId}
          categoryName={selected?.name}
          firstName={person.name.split(" ")[0]}
        />
      </section>
    </div>
  );
}
