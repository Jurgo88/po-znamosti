import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DISTRICTS } from "@/data/districts";
import { searchNetwork } from "@/lib/network";
import { requireProfile } from "@/lib/session";
import type { SearchResult } from "@/lib/network";
import { Avatar } from "@/components/avatar";
import { Chain } from "@/components/chain";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">Hľadať v sieti</h1>
        <p className="mt-1 text-muted">
          Ukážeme ti tvojich známych a ľudí, za ktorých sa tvoji známi zaručili.
        </p>
      </div>

      <form className="grid gap-3 rounded-ui bg-surface p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
        <button className="btn">Hľadať</button>
      </form>

      {results && results.length === 0 && (
        <div className="max-w-xl space-y-3">
          <Chain people={["Ty", "?"]} size="md" />
          <h2 className="text-xl font-bold">
            V tvojej sieti zatiaľ nikto taký nie je{district ? ` v okrese ${district}` : ""}.
          </h2>
          <p className="text-muted">
            Skús celé Slovensko alebo pozvi viac známych. Čím väčšia sieť, tým viac odporúčaní.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/siet" className="btn">
              Pozvať známych
            </Link>
            {district && (
              <Link href={`?sluzba=${cat!.slug}`} className="btn-secondary">
                Hľadať na celom Slovensku
              </Link>
            )}
          </div>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-8">
          <div>
            <p className="mb-2 text-xs text-muted">
              {results.length === 1 ? "1 človek" : results.length < 5 ? `${results.length} ľudia` : `${results.length} ľudí`} vo tvojej sieti
            </p>
            <ul>
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

function ResultRow({ r, selected }: { r: SearchResult; selected: boolean }) {
  return (
    <div
      className={`grid gap-2 border-b border-hair px-3 py-4 ${selected ? "lg:rounded-ui lg:border-transparent lg:bg-tint" : ""}`}
    >
      <div className="flex items-center gap-3">
        <Avatar name={r.name} onSurface={selected} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{r.name}</p>
          <p className="text-sm text-muted">{r.serviceDistrict ?? r.district}</p>
        </div>
        {r.vouchers.length > 0 && (
          <span className="text-xs text-muted">
            {r.vouchers.length === 1 ? "1 zaručenie" : r.vouchers.length < 5 ? `${r.vouchers.length} zaručenia` : `${r.vouchers.length} zaručení`}
          </span>
        )}
      </div>
      <Chain people={chainFor(r)} />
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
    <aside className="hidden space-y-5 rounded-ui bg-surface p-8 lg:block">
      <div className="flex items-center gap-4">
        <Avatar name={r.name} size={64} onSurface />
        <div className="min-w-0 flex-1">
          <h2 className="text-[26px] font-bold leading-tight tracking-tight">{r.name}</h2>
          <p className="text-muted">{r.serviceDistrict ?? r.district}</p>
        </div>
      </div>
      {r.description && <p className="max-w-prose">{r.description}</p>}
      <div className="space-y-2 rounded-ui bg-white p-5">
        <p className="text-xs text-muted">Ako ho poznáš</p>
        <Chain people={chainFor(r)} size="md" />
      </div>
      {r.vouchers.length > 0 && (
        <div className="space-y-3 rounded-ui bg-white p-5">
          <p className="text-xs text-muted">Zaručili sa tvoji známi</p>
          {r.vouchers.map((v) => (
            <p key={v.id} className="quote">
              {v.note ?? "Zaručuje sa."}
              <span className="block text-xs text-muted">{v.name}</span>
            </p>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Link href={`/clovek/${r.userId}?sluzba=${slug}#kontakt`} className="btn">
          Napísať
        </Link>
        {r.phone && (
          <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="btn-secondary">
            {r.phone}
          </a>
        )}
        <Link href={`/clovek/${r.userId}?sluzba=${slug}`} className="btn-secondary">
          Celý profil
        </Link>
      </div>
    </aside>
  );
}
