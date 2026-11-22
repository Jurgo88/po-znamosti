import { and, asc, eq } from "drizzle-orm";
import { confirmService, removeService, removeVouch } from "@/app/core-actions";
import { getDb, schema } from "@/db";
import { AddServiceForm } from "./add-service-form";

/** Sekcie profilu: moje služby (aj čakajúce na potvrdenie) a zaručenia, ktoré som dal. */
export async function ProfileServices({ userId, highlight }: { userId: string; highlight: boolean }) {
  const db = getDb();
  const [services, given, received, categories] = await Promise.all([
    db
      .select({
        id: schema.providerService.id,
        categoryId: schema.providerService.categoryId,
        name: schema.category.name,
        description: schema.providerService.description,
        active: schema.providerService.active,
      })
      .from(schema.providerService)
      .innerJoin(schema.category, eq(schema.category.id, schema.providerService.categoryId))
      .where(eq(schema.providerService.userId, userId))
      .orderBy(asc(schema.category.name)),
    db
      .select({
        id: schema.vouch.id,
        forName: schema.user.name,
        category: schema.category.name,
        note: schema.vouch.note,
      })
      .from(schema.vouch)
      .innerJoin(schema.user, eq(schema.user.id, schema.vouch.forUserId))
      .innerJoin(schema.category, eq(schema.category.id, schema.vouch.categoryId))
      .where(eq(schema.vouch.fromUserId, userId)),
    db
      .select({
        categoryId: schema.vouch.categoryId,
        fromName: schema.user.name,
        note: schema.vouch.note,
      })
      .from(schema.vouch)
      .innerJoin(schema.user, eq(schema.user.id, schema.vouch.fromUserId))
      .where(and(eq(schema.vouch.forUserId, userId))),
    db.query.category.findMany({ orderBy: asc(schema.category.name) }),
  ]);

  const pending = services.filter((s) => !s.active);
  const active = services.filter((s) => s.active);
  const vouchesFor = (categoryId: number) => received.filter((r) => r.categoryId === categoryId);

  return (
    <>
      <section id="sluzby" className="space-y-3">
        <h2 className="text-lg font-semibold">Moje služby</h2>

        {pending.map((s) => (
          <div
            key={s.id}
            className={`card space-y-3 ${highlight ? "border-emerald-400 ring-2 ring-emerald-700/10" : ""}`}
          >
            <div>
              <p className="font-medium">Odporučili ťa ako: {s.name}</p>
              {vouchesFor(s.categoryId).map((v, i) => (
                <p key={i} className="text-sm text-stone-600">
                  {v.fromName}
                  {v.note ? `: „${v.note}“` : ""}
                </p>
              ))}
              <p className="mt-1 text-sm text-stone-500">
                Potvrď, ak túto službu ponúkaš. Až potom ťa nájdu známi tvojich známych.
              </p>
            </div>
            <form action={confirmService} className="space-y-2">
              <input type="hidden" name="id" value={s.id} />
              <textarea
                name="description"
                rows={2}
                maxLength={300}
                className="input"
                placeholder="Krátky popis, napr. kuchyne a vstavané skrine na mieru"
              />
              <div className="flex gap-2">
                <button className="btn">Potvrdiť službu</button>
                <button formAction={removeService} className="btn-secondary">
                  Neponúkam
                </button>
              </div>
            </form>
          </div>
        ))}

        {active.length > 0 && (
          <ul className="card divide-y divide-stone-100 p-0">
            {active.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-medium">{s.name}</p>
                  {s.description && <p className="text-sm text-stone-600">{s.description}</p>}
                  <p className="text-xs text-stone-500">
                    Zaručenia: {vouchesFor(s.categoryId).length}
                  </p>
                </div>
                <form action={removeService}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-sm text-stone-500 hover:underline">Odstrániť</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <AddServiceForm
          categories={categories
            .filter((c) => !services.some((s) => s.categoryId === c.id))
            .map((c) => ({ id: c.id, name: c.name }))}
        />
      </section>

      {given.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Za koho sa zaručujem</h2>
          <ul className="card divide-y divide-stone-100 p-0">
            {given.map((g) => (
              <li key={g.id} className="flex items-start justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-medium">
                    {g.forName} <span className="font-normal text-stone-500">· {g.category}</span>
                  </p>
                  {g.note && <p className="text-sm text-stone-600">„{g.note}“</p>}
                </div>
                <form action={removeVouch}>
                  <input type="hidden" name="id" value={g.id} />
                  <button className="text-sm text-stone-500 hover:underline">Zrušiť</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
