import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { DISTRICTS } from "@/data/districts";
import { searchNetwork } from "@/lib/network";
import { requireProfile } from "@/lib/session";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ sluzba?: string; okres?: string }>;
}) {
  const me = await requireProfile("/hladat");
  const { sluzba, okres } = await searchParams;
  const db = getDb();
  const categories = await db.query.category.findMany({ orderBy: asc(schema.category.name) });
  const cat = sluzba ? categories.find((c) => c.slug === sluzba) : undefined;
  const district = okres && DISTRICTS.includes(okres) ? okres : null;
  const results = cat ? await searchNetwork(db, me.id, cat.id, district) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hľadať v sieti</h1>
        <p className="mt-1 text-stone-600">
          Ukážeme ti tvojich známych a ľudí, za ktorých sa tvoji známi zaručili.
        </p>
      </div>

      <form className="card grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
        <div className="card space-y-2">
          <p className="font-medium">V tvojej sieti zatiaľ nikto taký nie je.</p>
          <p className="text-sm text-stone-600">
            Skús iný okres alebo pozvi viac známych. Čím väčšia sieť, tým viac odporúčaní.
          </p>
          <Link href="/siet" className="btn-secondary mt-2">
            Pozvať známych
          </Link>
        </div>
      )}

      {results && results.length > 0 && (
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={r.userId} className="card space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/clovek/${r.userId}`} className="text-lg font-semibold hover:underline">
                    {r.name}
                  </Link>
                  <p className="text-sm text-stone-500">{r.serviceDistrict ?? r.district}</p>
                </div>
                <Path direct={r.direct} vouchers={r.vouchers} name={r.name} />
              </div>
              {r.description && <p className="text-stone-700">{r.description}</p>}
              {r.vouchers.length > 0 && (
                <ul className="space-y-1 border-l-2 border-emerald-200 pl-3 text-sm">
                  {r.vouchers.map((v) => (
                    <li key={v.id}>
                      <span className="font-medium">{v.name}</span>
                      {v.note ? <span className="text-stone-600">: „{v.note}“</span> : " sa zaručuje"}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2">
                <Link href={`/clovek/${r.userId}?sluzba=${cat!.slug}#kontakt`} className="btn">
                  Napísať
                </Link>
                {r.phone && (
                  <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="btn-secondary">
                    {r.phone}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Path({
  direct,
  vouchers,
  name,
}: {
  direct: boolean;
  vouchers: { name: string }[];
  name: string;
}) {
  const first = name.split(" ")[0];
  const label = direct
    ? `Ty → ${first}`
    : `Ty → ${vouchers[0]?.name.split(" ")[0] ?? "známy"} → ${first}`;
  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
      {direct ? "Tvoj známy · " : ""}
      {label}
    </span>
  );
}
