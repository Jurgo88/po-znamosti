# Po známosti

Webová aplikácia, kde ľudia nájdu remeselníkov a služby cez svojich známych. Ľudia sa prepoja so známymi, zaručia sa za nich v konkrétnej službe a hľadajúci vidí poskytovateľov do 2 krokov v sieti spolu s cestou („Ty → Jurgo → Jano“).

Návrh MVP: [Po známosti: návrh MVP](https://claude.ai/artifact/47LykuMcXiT6WNwSmRRET4)

## Technológie

- **Next.js 15** (App Router) bežiaci na **Cloudflare Workers** cez [OpenNext](https://opennext.js.org/cloudflare)
- **Cloudflare D1** (SQLite) + **Drizzle ORM**
- **Better Auth** s prihlásením magickým odkazom
- **Resend** na e-maily
- **Tailwind CSS 4**

## Lokálny vývoj

```bash
npm install
cp .dev.vars.example .dev.vars        # doplň BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:migrate:local              # vytvorí lokálnu D1 databázu v .wrangler/
npm run dev                           # http://localhost:3000
```

Bez `RESEND_API_KEY` sa prihlasovací odkaz neposiela, ale vypíše sa do konzoly, kde beží `npm run dev`.

Ukážka produkčného buildu priamo vo Workers runtime: `npm run preview`.

## Zmena databázy

1. Uprav `src/db/schema.ts`.
2. `npm run db:generate` vytvorí novú migráciu v `drizzle/migrations/`.
3. `npm run db:migrate:local`, po nasadení `npm run db:migrate:remote`.

Zoznam kategórií je v `src/data/categories.ts` a do databázy ho vkladá migrácia `0001_seed_categories.sql`. Nové kategórie pridávaj novou migráciou.

## Nasadenie na Cloudflare

Databáza D1 `po-znamosti` už existuje (región západná Európa), migrácie sú na nej spustené a jej `database_id` je vo `wrangler.jsonc`.

**Automatické nasadenie z GitHubu (odporúčané):**

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → vyber `Jurgo88/po-znamosti`.
2. Build command: `npx opennextjs-cloudflare build`, Deploy command: `npx opennextjs-cloudflare deploy`.
3. Vo workeri `poznamosti` → **Settings → Variables and Secrets** pridaj tajomstvá:
   - `BETTER_AUTH_SECRET` (vygeneruj: `openssl rand -base64 32`)
   - `RESEND_API_KEY` (z [resend.com](https://resend.com))
4. Každý push do `main` sa potom nasadí sám. Aplikácia pobeží na `https://poznamosti.<tvoj-subdomain>.workers.dev`.

**Ručne z počítača:** `npx wrangler login`, nastav tajomstvá cez `npx wrangler secret put BETTER_AUTH_SECRET` a `npx wrangler secret put RESEND_API_KEY`, potom `npm run deploy`.

**Nové migrácie** spúšťaj pred nasadením: `npm run db:migrate:remote`.

**E-maily:** kým nemáš v Resend overenú vlastnú doménu, odosielateľ je `onboarding@resend.dev` a Resend doručí e-maily iba na adresu tvojho Resend účtu. Na testovanie s kamošmi treba doménu overiť a zmeniť `EMAIL_FROM`.

**Registrácia cez pozvánku:** s `INVITE_LOGIN=1` (vo `wrangler.jsonc`) sa nový človek zaregistruje priamo z pozvánky, iba zadaním e-mailu, bez prihlasovacieho odkazu. Funguje len pre e-maily, ktoré ešte nemajú účet, aby sa cudzí účet nedal prevziať. Session platí 60 dní. Kto sa odhlási alebo príde z iného zariadenia, potrebuje e-mailový odkaz, teda overenú doménu.

**Vlastná doména:** vo workeri → **Settings → Domains & Routes** pridaj doménu a do `vars` vo `wrangler.jsonc` doplň `"BETTER_AUTH_URL": "https://poznamosti.sk"`.

## Štruktúra

```
src/
  app/
    actions.ts          serverové akcie: profil, pozvánky, známosti
    core-actions.ts     serverové akcie: zaručenie sa, služby, kontakt
    hladat/             vyhľadávanie v sieti do 2 krokov
    odporucit/          zaručenie sa za známeho alebo cez pozvánku
    clovek/[id]/        profil poskytovateľa a kontaktný formulár
    prihlasenie/        prihlásenie magickým odkazom
    profil/             úprava profilu
    siet/               moja sieť: známi a pozvánky
    pozvanka/[token]/   prijatie pozvánky
    api/auth/           Better Auth endpointy
  db/schema.ts          tabuľky D1
  data/                 kategórie a okresy
  lib/                  auth, e-mail, session, známosti
drizzle/migrations/     SQL migrácie (spúšťa ich wrangler)
```
