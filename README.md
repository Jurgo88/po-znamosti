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

## Prvé nasadenie na Cloudflare

1. Prihlás sa: `npx wrangler login`
2. Vytvor databázu: `npx wrangler d1 create po-znamosti` a vrátené `database_id` vlož do `wrangler.jsonc`.
3. Spusti migrácie: `npm run db:migrate:remote`
4. Nastav tajomstvá:
   ```bash
   npx wrangler secret put BETTER_AUTH_SECRET   # openssl rand -base64 32
   npx wrangler secret put RESEND_API_KEY
   ```
5. V `wrangler.jsonc` skontroluj `BETTER_AUTH_URL` a `EMAIL_FROM` (doména musí byť overená v Resend).
6. Nasaď: `npm run deploy`
7. V Cloudflare dashboarde pripoj vlastnú doménu k workeru `po-znamosti` (Workers → po-znamosti → Settings → Domains & Routes).

## Štruktúra

```
src/
  app/
    actions.ts          serverové akcie (profil, pozvánky, známosti)
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
