"use client";
import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/actions";
import { addService } from "@/app/core-actions";

export function AddServiceForm({ categories }: { categories: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addService, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <details className="card border-dashed border-brand-300 shadow-none">
      <summary className="cursor-pointer font-medium text-brand marker:text-brand">Pridať službu, ktorú ponúkam</summary>
      <form ref={ref} action={action} className="mt-4 space-y-3">
        <select name="categoryId" required className="input" defaultValue="" aria-label="Služba">
          <option value="" disabled>
            Vyber službu
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          rows={2}
          maxLength={300}
          className="input"
          placeholder="Krátky popis (nepovinné)"
          aria-label="Popis"
        />
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        <button className="btn" disabled={pending}>
          {pending ? "Pridávam…" : "Pridať"}
        </button>
      </form>
    </details>
  );
}
