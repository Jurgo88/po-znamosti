"use client";
import { useActionState, useState } from "react";
import { deleteAccount, type FormState } from "@/app/actions";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(deleteAccount, {});
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-muted hover:underline">
        Zmazať účet
      </button>
    );
  return (
    <form action={action} className="card space-y-3 border-red-200">
      <p className="font-medium">Zmazať účet natrvalo?</p>
      <p className="text-sm text-muted">
        Odstránime tvoj profil, služby, prepojenia so známymi, odporúčania aj správy. Vrátiť sa to
        nedá.
      </p>
      <div>
        <label htmlFor="confirm" className="label">
          Pre potvrdenie napíš ZMAZAŤ
        </label>
        <input id="confirm" name="confirm" className="input" autoComplete="off" />
      </div>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <div className="flex gap-3">
        <button className="btn bg-red-700 hover:bg-red-800" disabled={pending}>
          {pending ? "Mažem…" : "Zmazať účet"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Zrušiť
        </button>
      </div>
    </form>
  );
}
