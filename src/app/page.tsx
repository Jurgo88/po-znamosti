import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Avatar } from "@/components/avatar";
import { Chain } from "@/components/chain";

const STEPS = [
  ["Pozvi známych", "Pošli odkaz ľuďom, ktorých naozaj poznáš."],
  ["Zaruč sa", "Odporuč majstrov, s ktorými máš dobrú skúsenosť, aj keď ešte nemajú účet."],
  ["Ozvi sa priamo", "Nájdeš ich cez známych a známych známych. Píšeš alebo voláš rovno im."],
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ zmazane?: string }>;
}) {
  const user = await getCurrentUser();
  const { zmazane } = await searchParams;
  return (
    <div className="space-y-14 py-2 sm:py-8">
      {zmazane && (
        <p className="rounded-ui bg-tint px-3 py-2 text-sm text-brand">Tvoj účet bol zmazaný.</p>
      )}
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="space-y-5">
          <h1 className="text-[32px] font-bold leading-[1.1] tracking-tight text-balance sm:text-[46px]">
            Nájdi majstra, za ktorého sa zaručia tvoji známi.
          </h1>
          <p className="max-w-[46ch] text-lg text-muted">
            Žiadne anonymné recenzie. Iba ľudia, ktorých odporúča niekto, koho poznáš, najviac cez
            jedného známeho.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={user ? "/hladat" : "/prihlasenie"} className="btn min-w-56">
              {user ? "Hľadať v sieti" : "Začať s e-mailom"}
            </Link>
            {!user && <span className="text-xs text-muted">Bez hesla. Pošleme ti odkaz.</span>}
          </div>
        </div>
        <div className="space-y-4 rounded-ui bg-surface p-6 sm:p-7">
          <p className="text-xs text-muted">Príklad: hľadáš stolára v Žiline</p>
          <Chain people={["Ty", "Peter, spolužiak", "Marek, stolár"]} size="md" />
          <div className="space-y-3 rounded-ui bg-white p-5">
            <div className="flex items-center gap-3">
              <Avatar name="Marek Hudec" />
              <div>
                <p className="font-bold">Marek Hudec</p>
                <p className="text-sm text-muted">Stolár · Žilina · 3 zaručenia</p>
              </div>
            </div>
            <p className="quote">
              Kuchyňu nám spravil načas a čisto.
              <span className="block text-xs text-muted">Peter Kováč</span>
            </p>
          </div>
        </div>
      </section>
      <ol className="grid gap-6 sm:grid-cols-3 sm:gap-10">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="grid grid-cols-[28px_1fr] gap-3">
            <span className="grid size-7 place-items-center rounded-ui bg-tint text-sm font-bold text-brand">
              {i + 1}
            </span>
            <span>
              <span className="block font-bold">{title}</span>
              <span className="text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
