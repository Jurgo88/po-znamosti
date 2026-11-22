import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-10 py-6">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Remeselníkov a služby nájdeš cez ľudí, ktorých poznáš.
        </h1>
        <p className="text-lg text-stone-600">
          Žiadne anonymné recenzie. Uvidíš, ktorý tvoj známy sa za koho zaručí: „Jurgo pozná Jana a
          odporúča ho ako stolára.“
        </p>
        <Link href={user ? "/hladat" : "/prihlasenie"} className="btn">
          {user ? "Hľadať v sieti" : "Začať"}
        </Link>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Prepoj sa so známymi", "Pošli kamošom odkaz a vytvor si vlastnú sieť dôvery."],
          ["Zaruč sa za nich", "Poznáš dobrého stolára? Odporuč ho, aj keď ešte nemá účet."],
          ["Nájdi, koho potrebuješ", "Hľadáš v sieti svojich známych a ich známych."],
        ].map(([title, text]) => (
          <div key={title} className="card">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-stone-600">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
