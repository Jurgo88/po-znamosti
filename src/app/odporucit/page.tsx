import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { listConnections } from "@/lib/connections";
import { requireProfile } from "@/lib/session";
import { getBaseUrl } from "@/lib/url";
import { RecommendForms } from "./recommend-forms";

export default async function RecommendPage({
  searchParams,
}: {
  searchParams: Promise<{ komu?: string }>;
}) {
  const me = await requireProfile("/odporucit");
  const { komu } = await searchParams;
  const db = getDb();
  const [friends, categories] = await Promise.all([
    listConnections(db, me.id),
    db.query.category.findMany({ orderBy: asc(schema.category.name) }),
  ]);
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Odporučiť známeho</h1>
        <p className="mt-1 text-stone-600">
          Zaruč sa za niekoho, koho poznáš a koho prácu odporúčaš. Uvidia to tvoji známi, keď budú
          hľadať danú službu.
        </p>
      </div>
      <RecommendForms
        friends={friends.map((f) => ({ id: f.id, name: f.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        preselected={komu}
        baseUrl={await getBaseUrl()}
      />
    </div>
  );
}
