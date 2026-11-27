import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { listConnections } from "@/lib/connections";
import { requireProfile } from "@/lib/session";
import { getBaseUrl } from "@/lib/url";
import { RecommendForms } from "./recommend-forms";
import { PageHead } from "@/components/page-head";
import { IconVouch } from "@/components/icons";

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
    <div className="mx-auto max-w-xl space-y-6">
      <PageHead icon={<IconVouch size={22} />} eyebrow="Zaručiť sa" title="Zaruč sa za niekoho">
        Odporuč človeka, s ktorého prácou máš osobnú skúsenosť. Uvidia to tvoji známi, keď budú
        hľadať danú službu.
      </PageHead>
      <RecommendForms
        friends={friends.map((f) => ({ id: f.id, name: f.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        preselected={komu}
        baseUrl={await getBaseUrl()}
      />
    </div>
  );
}
