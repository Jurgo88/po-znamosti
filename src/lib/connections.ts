import { and, eq, or } from "drizzle-orm";
import type { Db } from "@/db";
import { schema } from "@/db";

/** Poradie pre uloženie známosti raz (menšie id ako user_a). */
export function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function areConnected(db: Db, a: string, b: string) {
  const [userA, userB] = orderPair(a, b);
  const row = await db.query.connection.findFirst({
    where: and(
      eq(schema.connection.userA, userA),
      eq(schema.connection.userB, userB),
      eq(schema.connection.status, "confirmed"),
    ),
  });
  return Boolean(row);
}

/** Zoznam potvrdených známych daného používateľa. */
export async function listConnections(db: Db, userId: string) {
  const rows = await db
    .select({
      userA: schema.connection.userA,
      userB: schema.connection.userB,
      createdAt: schema.connection.createdAt,
    })
    .from(schema.connection)
    .where(
      and(
        eq(schema.connection.status, "confirmed"),
        or(eq(schema.connection.userA, userId), eq(schema.connection.userB, userId)),
      ),
    );
  const otherIds = rows.map((r) => (r.userA === userId ? r.userB : r.userA));
  if (otherIds.length === 0) return [];
  const users = await db.query.user.findMany({
    where: (u, { inArray }) => inArray(u.id, otherIds),
    columns: { id: true, name: true, district: true },
  });
  return users.sort((x, y) => x.name.localeCompare(y.name, "sk"));
}
