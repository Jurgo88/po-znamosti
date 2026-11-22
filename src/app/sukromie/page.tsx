import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_UPDATED, OPERATOR } from "@/data/legal";

export const metadata: Metadata = { title: "Ochrana súkromia · Po známosti" };

export default function PrivacyPage() {
  return (
    <article className="prose-legal mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold">Ochrana súkromia</h1>
      <p className="text-sm text-muted">Aktualizované {LEGAL_UPDATED}</p>

      <h2>Kto spracúva tvoje údaje</h2>
      <p>
        Prevádzkovateľom aplikácie Po známosti je {OPERATOR.name}, kontakt: {OPERATOR.email}.
      </p>

      <h2>Aké údaje zbierame</h2>
      <ul>
        <li>E-mail, ktorým sa prihlasuješ.</li>
        <li>Profil: meno, okres, krátky popis a telefón, ak ho vyplníš.</li>
        <li>Tvoju sieť: s kým si prepojený, koho si pozval a za koho sa zaručuješ.</li>
        <li>Služby, ktoré ponúkaš, a odporúčania, ktoré si dostal.</li>
        <li>Správy, ktoré pošleš poskytovateľovi cez kontaktný formulár.</li>
        <li>Technické údaje o prihlásení (IP adresa a prehliadač) kvôli bezpečnosti.</li>
      </ul>

      <h2>Na čo ich používame</h2>
      <p>
        Len na to, aby aplikácia fungovala: aby ťa našli známi a ich známi, aby si videl odporúčania
        a mohol kontaktovať poskytovateľa. Údaje nepredávame, nepoužívame na reklamu ani na
        profilovanie. Právnym základom je plnenie zmluvy, teda používanie aplikácie, ktoré si
        zvolil.
      </p>

      <h2>Kto tvoje údaje vidí</h2>
      <ul>
        <li>
          Meno, okres, popis a ponúkané služby vidia tvoji známi a, ak ponúkaš službu, aj známi tvojich
          známych.
        </li>
        <li>Telefón len vtedy, ak si zapol jeho zobrazenie a ponúkaš aspoň jednu službu.</li>
        <li>E-mail nikomu neukazujeme. Správu z kontaktného formulára dostaneš e-mailom.</li>
      </ul>

      <h2>Kto nám pomáha</h2>
      <ul>
        <li>Cloudflare: hosting a databáza (dáta sú uložené v západnej Európe).</li>
        <li>Resend: odosielanie e-mailov (prihlasovacie odkazy a správy).</li>
      </ul>

      <h2>Ako dlho údaje uchovávame</h2>
      <p>
        Kým máš účet. Keď ho zmažeš, odstránime tvoj profil, sieť, odporúčania aj správy. Pozvánky,
        ktoré si prijal od iných, ostanú bez tvojho mena.
      </p>

      <h2>Tvoje práva</h2>
      <p>
        Máš právo na prístup k údajom, ich opravu, vymazanie, obmedzenie spracúvania a prenosnosť.
        Profil upravíš a účet zmažeš sám v sekcii{" "}
        <Link href="/profil" className="underline">
          Profil
        </Link>
        . S ostatným ti pomôžeme na {OPERATOR.email}. Sťažnosť môžeš podať na Úrad na ochranu
        osobných údajov SR.
      </p>

      <h2>Cookies</h2>
      <p>Používame len nevyhnutnú cookie, ktorá ťa drží prihláseného. Žiadne analytické ani reklamné.</p>
    </article>
  );
}
