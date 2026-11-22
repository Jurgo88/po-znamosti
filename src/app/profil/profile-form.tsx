"use client";
import { useActionState } from "react";
import { saveProfile, type FormState } from "@/app/actions";
import { DISTRICTS } from "@/data/districts";

type Initial = { name: string; district: string; bio: string; phone: string; phoneVisible: boolean };

export function ProfileForm({ initial, next }: { initial: Initial; next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, {});
  return (
    <form action={action} className="card space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="name" className="label">
          Meno a priezvisko
        </label>
        <input id="name" name="name" required className="input" defaultValue={initial.name} />
      </div>
      <div>
        <label htmlFor="district" className="label">
          Okres
        </label>
        <select
          id="district"
          name="district"
          required
          className="input"
          defaultValue={initial.district}
        >
          <option value="" disabled>
            Vyber okres
          </option>
          {DISTRICTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bio" className="label">
          Pár slov o sebe <span className="font-normal text-muted">(nepovinné)</span>
        </label>
        <textarea id="bio" name="bio" rows={3} className="input" defaultValue={initial.bio} />
      </div>
      <div>
        <label htmlFor="phone" className="label">
          Telefón <span className="font-normal text-muted">(nepovinné)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="input"
          defaultValue={initial.phone}
        />
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" name="phoneVisible" defaultChecked={initial.phoneVisible} />
          Ukázať telefón ľuďom z mojej siete, keď ponúkam službu
        </label>
      </div>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="text-sm text-brand">Uložené.</p>}
      <button className="btn" disabled={pending}>
        {pending ? "Ukladám…" : "Uložiť"}
      </button>
    </form>
  );
}
