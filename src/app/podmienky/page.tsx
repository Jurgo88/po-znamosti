import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_UPDATED, OPERATOR } from "@/data/legal";

export const metadata: Metadata = { title: "Podmienky používania · Po známosti" };

export default function TermsPage() {
  return (
    <article className="prose-legal mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold">Podmienky používania</h1>
      <p className="text-sm text-muted">Aktualizované {LEGAL_UPDATED}</p>

      <h2>O čo ide</h2>
      <p>
        Po známosti pomáha nájsť služby cez ľudí, ktorých poznáš. Aplikácia je v testovacej verzii
        a je zadarmo. Prevádzkuje ju {OPERATOR.name}.
      </p>

      <h2>Tvoj účet</h2>
      <ul>
        <li>Používaj svoje skutočné meno a vlastný e-mail.</li>
        <li>Pozývaj len ľudí, ktorých naozaj poznáš.</li>
        <li>Účet môžeš kedykoľvek zmazať v sekcii Profil.</li>
      </ul>

      <h2>Odporúčania</h2>
      <p>
        Zaruč sa len za človeka, ktorého prácu poznáš a za ktorým si stojíš. Odporúčanie je tvoj
        osobný názor. Za kvalitu, cenu a priebeh služby zodpovedá poskytovateľ, nie Po známosti.
        Dohodu o službe uzatvárate priamo medzi sebou.
      </p>

      <h2>Čo nie je dovolené</h2>
      <ul>
        <li>Posielať spam, reklamu alebo obťažujúce správy.</li>
        <li>Vydávať sa za niekoho iného alebo písať nepravdivé odporúčania.</li>
        <li>Zneužívať údaje iných ľudí z aplikácie.</li>
      </ul>
      <p>Ak niekto tieto pravidlá porušuje, môžeme jeho účet obmedziť alebo zrušiť.</p>

      <h2>Zodpovednosť</h2>
      <p>
        Aplikáciu poskytujeme tak, ako je, a môže občas nefungovať. Nezodpovedáme za služby, ktoré si
        dohodneš s poskytovateľom.
      </p>

      <h2>Kontakt</h2>
      <p>
        Otázky a nahlásenia posielaj na {OPERATOR.email}. Ako narábame s údajmi, nájdeš v časti{" "}
        <Link href="/sukromie" className="underline">
          Ochrana súkromia
        </Link>
        .
      </p>
    </article>
  );
}
