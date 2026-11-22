"use client";
import { useActionState } from "react";
import type { FormState } from "@/app/actions";
import { sendContact } from "@/app/core-actions";

export function ContactForm({
  toUserId,
  categoryId,
  categoryName,
  firstName,
}: {
  toUserId: string;
  categoryId?: number;
  categoryName?: string;
  firstName: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContact, {});
  if (state.ok) {
    return (
      <div className="card">
        <p className="font-medium">Správa odoslaná.</p>
        <p className="text-sm text-stone-600">
          {firstName} ti odpovie priamo na tvoj e-mail.
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="card space-y-3">
      <input type="hidden" name="toUserId" value={toUserId} />
      {categoryId && <input type="hidden" name="categoryId" value={categoryId} />}
      <label htmlFor="message" className="label">
        Napíš, s čím potrebuješ pomôcť{categoryName ? ` (${categoryName})` : ""}
      </label>
      <textarea id="message" name="message" rows={4} required minLength={10} className="input" />
      <p className="text-xs text-stone-500">
        Správa príde e-mailom a {firstName} ti odpovie priamo. Uvidí tvoje meno a e-mail.
      </p>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button className="btn" disabled={pending}>
        {pending ? "Posielam…" : "Odoslať správu"}
      </button>
    </form>
  );
}
