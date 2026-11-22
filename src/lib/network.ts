import { sql } from "drizzle-orm";
import type { Db } from "@/db";

/**
 * Známi používateľa ako SQL poddotaz. D1 povoľuje najviac 100 parametrov,
 * preto zoznam známych nikdy neposielame ako IN (...) z aplikácie.
 */
const friendsOf = (userId: string) => sql`
  SELECT user_b AS id FROM connection WHERE user_a = ${userId} AND status = 'confirmed'
  UNION
  SELECT user_a AS id FROM connection WHERE user_b = ${userId} AND status = 'confirmed'`;

export type SearchResult = {
  userId: string;
  name: string;
  district: string | null;
  description: string | null;
  serviceDistrict: string | null;
  phone: string | null;
  direct: boolean;
  vouchers: { id: string; name: string; note: string | null }[];
};

/**
 * Poskytovatelia služby v sieti do 2 krokov:
 *  1 krok: môj známy, ktorý službu ponúka,
 *  2 kroky: niekto, za koho sa v tejto službe zaručil môj známy.
 * Zobrazujú sa len potvrdené (aktívne) služby.
 */
export async function searchNetwork(
  db: Db,
  me: string,
  categoryId: number,
  district: string | null,
): Promise<SearchResult[]> {
  const rows = await db.all<{
    user_id: string;
    name: string;
    district: string | null;
    description: string | null;
    service_district: string | null;
    phone: string | null;
    phone_visible: number;
    direct: number;
  }>(sql`
    WITH friends AS (${friendsOf(me)})
    SELECT ps.user_id, u.name, u.district, ps.description, ps.district AS service_district,
           u.phone, u.phone_visible,
           (ps.user_id IN (SELECT id FROM friends)) AS direct
    FROM provider_service ps
    JOIN user u ON u.id = ps.user_id
    WHERE ps.category_id = ${categoryId}
      AND ps.active = 1
      AND ps.user_id != ${me}
      AND (${district} IS NULL OR ps.district = ${district})
      AND (
        ps.user_id IN (SELECT id FROM friends)
        OR EXISTS (
          SELECT 1 FROM vouch v
          WHERE v.for_user_id = ps.user_id AND v.category_id = ${categoryId}
            AND (v.from_user_id IN (SELECT id FROM friends) OR v.from_user_id = ${me})
        )
      )
    LIMIT 200`);

  if (rows.length === 0) return [];

  const vouches = await db.all<{
    for_user_id: string;
    from_user_id: string;
    name: string;
    note: string | null;
  }>(sql`
    WITH friends AS (${friendsOf(me)})
    SELECT v.for_user_id, v.from_user_id, u.name, v.note
    FROM vouch v JOIN user u ON u.id = v.from_user_id
    WHERE v.category_id = ${categoryId}
      AND (v.from_user_id IN (SELECT id FROM friends) OR v.from_user_id = ${me})
    ORDER BY v.created_at DESC`);

  const byProvider = new Map<string, SearchResult["vouchers"]>();
  for (const v of vouches) {
    const list = byProvider.get(v.for_user_id) ?? [];
    list.push({ id: v.from_user_id, name: v.from_user_id === me ? "Ty" : v.name, note: v.note });
    byProvider.set(v.for_user_id, list);
  }

  return rows
    .map((r) => ({
      userId: r.user_id,
      name: r.name,
      district: r.district,
      description: r.description,
      serviceDistrict: r.service_district,
      phone: r.phone_visible ? r.phone : null,
      direct: Boolean(r.direct),
      vouchers: byProvider.get(r.user_id) ?? [],
    }))
    .sort(
      (a, b) =>
        Number(b.direct) - Number(a.direct) ||
        b.vouchers.length - a.vouchers.length ||
        a.name.localeCompare(b.name, "sk"),
    );
}

/** Je `target` v mojej sieti do 2 krokov? (známy, alebo má aktívnu službu so zaručením od známeho) */
export async function isWithinReach(db: Db, me: string, target: string) {
  if (me === target) return true;
  const row = await db.get<{ ok: number }>(sql`
    WITH friends AS (${friendsOf(me)})
    SELECT (
      ${target} IN (SELECT id FROM friends)
      OR EXISTS (
        SELECT 1 FROM vouch v
        JOIN provider_service ps
          ON ps.user_id = v.for_user_id AND ps.category_id = v.category_id AND ps.active = 1
        WHERE v.for_user_id = ${target}
          AND (v.from_user_id IN (SELECT id FROM friends) OR v.from_user_id = ${me})
      )
    ) AS ok`);
  return Boolean(row?.ok);
}

/** Zaručenia za daného človeka od mojich známych (a odo mňa), so službou. */
export async function vouchesFromMyNetwork(db: Db, me: string, target: string) {
  return db.all<{ from_user_id: string; name: string; note: string | null; category: string }>(sql`
    WITH friends AS (${friendsOf(me)})
    SELECT v.from_user_id, u.name, v.note, c.name AS category
    FROM vouch v
    JOIN user u ON u.id = v.from_user_id
    JOIN category c ON c.id = v.category_id
    WHERE v.for_user_id = ${target}
      AND (v.from_user_id IN (SELECT id FROM friends) OR v.from_user_id = ${me})
    ORDER BY v.created_at DESC`);
}
