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
import {
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconPin,
  IconQuote,
  IconTools,
  IconVouch,
} from "@/components/icons";

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
      <Link href={friend ? "/siet" : "/hladat"} className="btn-ghost -ml-2.5 font-medium text-brand hover:text-brand">
        <IconArrowLeft size={16} />
        {friend ? "Späť do siete" : "Späť na hľadanie"}
      </Link>

      <section className="card space-y-5 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Avatar name={person.name} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] leading-tight font-bold tracking-tight">{person.name}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
              <span className="flex items-center gap-1">
                <IconPin size={16} />
                {person.district}
              </span>
              {friend && <span className="badge">Tvoj známy</span>}
            </p>
          </div>
        </div>
        {person.bio && <p className="leading-relaxed">{person.bio}</p>}
        <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr]">
          <div className="rounded-ui bg-brand-50 p-4">
            <p className="mb-2 text-xs font-medium text-muted">Ako ho poznáš</p>
            <Chain people={chain} size="md" />
          </div>
          <div className="rounded-ui bg-brand-50 p-4">
            <p className="mb-1 text-xs font-medium text-muted">Odporúčania z tvojej siete</p>
            <p className="text-[28px] leading-none font-bold text-brand">{vouches.length}</p>
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-title">
            <IconTools size={18} className="text-brand" />
            Služby
          </h2>
          <ul className="grid gap-2.5">
            {services.map((s) => (
              <li
                key={s.categoryId}
                className={`card p-4 sm:p-5 ${s.categoryId === selected?.categoryId && services.length > 1 ? "border-brand-300" : ""}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">{s.name}</p>
                  {s.district && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <IconPin size={13} />
                      {s.district}
                    </span>
                  )}
                </div>
                {s.description && <p className="mt-1 text-sm text-muted">{s.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {vouches.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-title">
            <IconQuote size={18} className="text-brand" />
            Odporúčania od tvojich známych
          </h2>
          <ul className="card space-y-4">
            {vouches.map((v, i) => (
              <li key={i} className="quote text-[15px]">
                {v.note ?? "Zaručuje sa."}
                <span className="mt-0.5 block text-xs text-muted">
                  {v.from_user_id === me.id ? "Ty" : v.name} · {v.category}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {friend && (
        <Link href={`/odporucit?komu=${person.id}`} className="btn-secondary">
          <IconVouch size={18} className="text-brand" />
          Zaručiť sa za tohto známeho
        </Link>
      )}

      <section id="kontakt" className="scroll-mt-24 space-y-3">
        <h2 className="section-title">
          <IconMail size={18} className="text-brand" />
          Kontakt
        </h2>
        {person.phoneVisible && person.phone && services.length > 0 && (
          <a href={`tel:${person.phone.replace(/\s/g, "")}`} className="btn-secondary w-full sm:w-auto">
            <IconPhone size={18} className="text-brand" />
            Zavolať {person.phone}
          </a>
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
