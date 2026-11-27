import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DISTRICTS } from "@/data/districts";
import { searchNetwork } from "@/lib/network";
import { requireProfile } from "@/lib/session";
import type { SearchResult } from "@/lib/network";
import { Avatar } from "@/components/avatar";
import { Chain } from "@/components/chain";
import { EmptyState, PageHead } from "@/components/page-head";
import {
  IconArrowRight,
  IconMail,
  IconPhone,
  IconPin,
  IconPlus,
  IconQuote,
  IconSearch,
  IconTools,
  IconVouch,
} from "@/components/icons";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ sluzba?: string; okres?: string; vybrany?: string }>;
}) {
  const me = await requireProfile("/hladat");
  const { sluzba, okres, vybrany } = await searchParams;
  const db = getDb();
  const categories = await db.query.category.findMany({ orderBy: asc(schema.category.name) });
  const cat = sluzba ? categories.find((c) => c.slug === sluzba) : undefined;
  const district = okres && DISTRICTS.includes(okres) ? okres : null;
  const results = cat ? await searchNetwork(db, me.id, cat.id, district) : null;
  const selected = results?.find((r) => r.userId === vybrany) ?? results?.[0];
  const qs = (extra: Record<string, string>) =>
    "?" + new URLSearchParams({ sluzba: cat?.slug ?? "", ...(district ? { okres: district } : {}), ...extra });

  const popular = ["stolar", "elektrikar", "instalater", "maliar", "upratovanie", "autoservis"]
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is (typeof categories)[number] => Boolean(c));
  const shown = popular.length >= 4 ? popular : categories.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHead icon={<IconSearch size={22} />} eyebrow="Hľadať v sieti" title="Koho potrebuješ?">
        Ukážeme ti tvojich známych a ľudí, za ktorých sa tvoji známi zaručili.
      </PageHead>

      <form className="card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-5">
        <div>
          <label htmlFor="sluzba" className="label">
            Služba
          </label>
          <select id="sluzba" name="sluzba" required className="input" defaultValue={cat?.slug ?? ""}>
            <option value="" disabled>
              Čo hľadáš?
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="okres" className="label">
            Okres
          </label>
          <select id="okres" name="okres" className="input" defaultValue={district ?? ""}>
            <option value="">Celé Slovensko</option>
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <button className="btn">
          <IconSearch size={18} />
          Hľadať
        </button>
      </form>

      {!results && (
        <section className="space-y-3">
          <p className="text-sm font-medium text-muted">Ľudia najčastejšie hľadajú</p>
          <div className="flex flex-wrap gap-2">
            {shown.map((c) => (
              <Link key={c.id} href={`?sluzba=${c.slug}`} className="chip">
                <IconTools size={16} className="text-brand" />
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {results && results.length === 0 && (
        <EmptyState
          title={`V tvojej sieti zatiaľ nikto taký nie je${district ? ` v okrese ${district}` : ""}.`}
          actions={
            <>
              <Link href="/siet" className="btn">
                <IconPlus size={18} />
                Pozvať známych
              </Link>
              {district && (
                <Link href={`?sluzba=${cat!.slug}`} className="btn-secondary">
                  Hľadať na celom Slovensku
                </Link>
              )}
            </>
          }
        >
          Skús celé Slovensko alebo pozvi viac známych. Čím väčšia sieť, tým viac odporúčaní.
        </EmptyState>
      )}

      {results && results.length > 0 && (
        <div className="lg:grid lg:grid-cols-[360px_1fr] lg:items-start lg:gap-6">
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm text-muted">
              <span className="badge">{results.length}</span>
              {results.length === 1 ? "človek" : results.length < 5 ? "ľudia" : "ľudí"} vo tvojej sieti
              {cat ? ` · ${cat.name}` : ""}
            </p>
            <ul className="space-y-2.5">
              {results.map((r) => {
                const isSel = r.userId === selected?.userId;
                return (
                  <li key={r.userId} className="relative">
                    <ResultRow r={r} selected={isSel} />
                    {/* Mobil: rovno profil. Desktop: detail vpravo. */}
                    <Link href={`/clovek/${r.userId}?sluzba=${cat!.slug}`} className="absolute inset-0 lg:hidden">
                      <span className="sr-only">Profil: {r.name}</span>
                    </Link>
                    <Link href={qs({ vybrany: r.userId })} scroll={false} className="absolute inset-0 hidden lg:block">
                      <span className="sr-only">Zobraziť detail: {r.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          {selected && <Detail r={selected} slug={cat!.slug} />}
        </div>
      )}
    </div>
  );
}

function chainFor(r: SearchResult) {
  const first = r.name.split(" ")[0];
  return r.direct ? ["Ty", `${first}, poznáš priamo`] : ["Ty", r.vouchers[0]?.name ?? "známy", first];
}

function vouchLabel(n: number) {
  return n === 1 ? "1 zaručenie" : n < 5 ? `${n} zaručenia` : `${n} zaručení`;
}

function ResultRow({ r, selected }: { r: SearchResult; selected: boolean }) {
  return (
    <div
      className={`grid gap-3 rounded-ui border bg-white p-4 shadow-card transition-colors ${
        selected ? "border-hair lg:border-brand lg:bg-brand-50/60" : "border-hair hover:border-brand-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar name={r.name} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{r.name}</p>
          <p className="flex items-center gap-1 text-sm text-muted">
            <IconPin size={14} />
            {r.serviceDistrict ?? r.district}
          </p>
        </div>
        {r.vouchers.length > 0 && (
          <span className="badge shrink-0">
            <IconVouch size={13} />
            {vouchLabel(r.vouchers.length)}
          </span>
        )}
      </div>
      <div className="rounded-[4px] bg-brand-50 px-3 py-2">
        <Chain people={chainFor(r)} />
      </div>
      {r.vouchers[0]?.note && (
        <p className="quote lg:hidden">
          {r.vouchers[0].note}
          <span className="block text-xs text-muted">{r.vouchers[0].name}</span>
        </p>
      )}
    </div>
  );
}

function Detail({ r, slug }: { r: SearchResult; slug: string }) {
  return (
    <aside className="card hidden space-y-6 p-8 lg:block lg:sticky lg:top-24">
      <div className="flex items-start gap-4">
        <Avatar name={r.name} size={64} />
        <div className="min-w-0 flex-1">
          <h2 className="text-[26px] leading-tight font-bold tracking-tight">{r.name}</h2>
          <p className="mt-0.5 flex items-center gap-1 text-muted">
            <IconPin size={16} />
            {r.serviceDistrict ?? r.district}
            {r.direct ? " · tvoj známy" : ""}
          </p>
        </div>
      </div>
      {r.description && <p className="max-w-prose leading-relaxed">{r.description}</p>}

      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <div className="rounded-ui bg-brand-50 p-4">
          <p className="mb-2 text-xs font-medium text-muted">Ako ho poznáš</p>
          <Chain people={chainFor(r)} size="md" />
        </div>
        <div className="rounded-ui bg-brand-50 p-4">
          <p className="mb-1 text-xs font-medium text-muted">Zaručili sa</p>
          <p className="flex items-baseline gap-1.5">
            <span className="text-[28px] leading-none font-bold text-brand">{r.vouchers.length}</span>
            <span className="text-sm text-muted">{r.vouchers.length === 1 ? "známy" : "známi"}</span>
          </p>
        </div>
      </div>

      {r.vouchers.length > 0 && (
        <div className="space-y-4">
          <p className="section-title text-base">
            <IconQuote size={18} className="text-brand" />
            Čo hovoria tvoji známi
          </p>
          {r.vouchers.map((v) => (
            <p key={v.id} className="quote text-[15px]">
              {v.note ?? "Zaručuje sa."}
              <span className="mt-0.5 block text-xs text-muted">{v.name}</span>
            </p>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 border-t border-hair pt-6">
        <Link href={`/clovek/${r.userId}?sluzba=${slug}#kontakt`} className="btn">
          <IconMail size={18} />
          Napísať správu
        </Link>
        {r.phone && (
          <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="btn-secondary">
            <IconPhone size={18} />
            {r.phone}
          </a>
        )}
        <Link href={`/clovek/${r.userId}?sluzba=${slug}`} className="btn-ghost ml-auto">
          Celý profil
          <IconArrowRight size={16} />
        </Link>
      </div>
    </aside>
  );
}
