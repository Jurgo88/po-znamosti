import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Avatar } from "@/components/avatar";
import { Chain } from "@/components/chain";
import { IconArrowRight, IconMail, IconNetwork, IconVouch } from "@/components/icons";

const STEPS = [
  {
    title: "Pozvi známych",
    text: "Pošli odkaz ľuďom, ktorých naozaj poznáš.",
    Icon: IconNetwork,
  },
  {
    title: "Zaruč sa",
    text: "Odporuč majstrov, s ktorými máš dobrú skúsenosť, aj keď ešte nemajú účet.",
    Icon: IconVouch,
  },
  {
    title: "Ozvi sa priamo",
    text: "Nájdeš ich cez známych a známych známych. Píšeš alebo voláš rovno im.",
    Icon: IconMail,
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ zmazane?: string }>;
}) {
  const user = await getCurrentUser();
  const { zmazane } = await searchParams;
  return (
    <div className="space-y-12 sm:space-y-16 sm:py-4">
      {zmazane && <p className="notice">Tvoj účet bol zmazaný.</p>}
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="space-y-6">
          <p className="badge">
            <span aria-hidden className="size-1.5 rounded-[1px] bg-brand" />
            Odporúčania najviac cez jedného známeho
          </p>
          <h1 className="text-[34px] leading-[1.08] font-bold tracking-tight text-balance sm:text-[50px]">
            Nájdi majstra, za ktorého sa{" "}
            <span className="relative whitespace-nowrap text-brand">
              zaručia
              <span aria-hidden className="absolute inset-x-0 -bottom-1 h-[5px] rounded-[1px] bg-brand-200" />
            </span>{" "}
            tvoji známi.
          </h1>
          <p className="max-w-[46ch] text-lg text-muted">
            Žiadne anonymné recenzie. Iba ľudia, ktorých odporúča niekto, koho poznáš, najviac cez
            jedného známeho.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <Link href={user ? "/hladat" : "/prihlasenie"} className="btn min-w-56">
              {user ? "Hľadať v sieti" : "Začať s e-mailom"}
              <IconArrowRight size={18} />
            </Link>
            {!user && <span className="text-sm text-muted">Bez hesla. Pošleme ti odkaz.</span>}
          </div>
        </div>

        {/* Ukážka: cesta cez známych na modrom podklade */}
        <div className="relative overflow-hidden rounded-ui bg-brand p-6 text-white shadow-raise sm:p-8">
          <svg
            aria-hidden
            className="pointer-events-none absolute hidden sm:block -right-12 -bottom-10 text-white/10"
            width="260"
            height="120"
            viewBox="0 0 260 120"
            fill="none"
          >
            <rect x="4" y="44" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="4" />
            <path d="M36 60h76" stroke="currentColor" strokeWidth="4" />
            <rect x="112" y="44" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="4" />
            <path d="M144 60h76" stroke="currentColor" strokeWidth="4" />
            <rect x="220" y="44" width="32" height="32" rx="4" fill="currentColor" />
          </svg>
          <p className="relative text-xs font-medium tracking-[0.08em] text-white/70 uppercase">
            Príklad: hľadáš stolára v Žiline
          </p>
          <div className="relative mt-4">
            <Chain people={["Ty", "Peter, spolužiak", "Marek"]} size="md" inverse />
          </div>
          <div className="relative mt-5 space-y-4 rounded-ui bg-white p-5 text-ink">
            <div className="flex items-center gap-3">
              <Avatar name="Marek Hudec" size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-bold">Marek Hudec</p>
                <p className="text-sm text-muted">Stolár · Žilina</p>
              </div>
              <span className="badge">
                <IconVouch size={14} />3 zaručenia
              </span>
            </div>
            <p className="quote">
              Kuchyňu nám spravil načas a čisto.
              <span className="mt-0.5 block text-xs text-muted">Peter Kováč · tvoj známy</span>
            </p>
          </div>
        </div>
      </section>

      {/* Kroky spojené čiarou ako reťaz */}
      <section className="rounded-ui border border-hair bg-white p-6 shadow-card sm:p-8">
        <p className="eyebrow">Ako to funguje</p>
        <ol className="relative mt-6 grid gap-8 sm:grid-cols-3 sm:gap-10">
          <span aria-hidden className="absolute top-5 right-[calc(33.333%-1.5rem)] left-5 hidden h-0.5 bg-brand-200 sm:block" />
          {STEPS.map(({ title, text, Icon }, i) => (
            <li key={title} className="relative grid grid-cols-[40px_1fr] gap-4 sm:block">
              <span
                className={`relative grid size-10 place-items-center rounded-ui ${i === 0 ? "bg-brand text-white" : "border-2 border-brand bg-white text-brand"}`}
              >
                <Icon size={20} />
              </span>
              <span className="sm:mt-4 sm:block">
                <span className="block text-xs font-medium text-brand">Krok {i + 1}</span>
                <span className="mt-0.5 block font-bold">{title}</span>
                <span className="mt-1 block text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
