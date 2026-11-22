"use client";
import { useActionState, useEffect, useRef } from "react";
import { createInvite, type FormState } from "@/app/actions";

export function InviteForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createInvite, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-2 sm:flex-row">
      <input
        name="inviteeName"
        placeholder="Komu? (napr. Jano Novák, nepovinné)"
        className="input"
        aria-label="Meno pozvaného"
      />
      <button className="btn shrink-0" disabled={pending}>
        {pending ? "Vytváram…" : "Vytvoriť odkaz"}
      </button>
    </form>
  );
}
