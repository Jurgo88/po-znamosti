"use client";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { joinViaInvite, type FormState } from "@/app/actions";

export function JoinForm({ token, loginHref }: { token: string; loginHref: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(joinViaInvite, {});
  useEffect(() => {
    if (state.redirectTo) window.location.assign(state.redirectTo);
  }, [state.redirectTo]);
  return (
    <form action={action} className="space-y-3 text-left">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="email" className="label">
          Tvoj e-mail
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      {state.error === "existing" ? (
        <p className="text-sm text-red-700">
          Tento e-mail už v Po známosti má účet.{" "}
          <Link href={loginHref} className="underline">
            Prihlás sa
          </Link>{" "}
          a pozvánku potom prijmeš.
        </p>
      ) : (
        state.error && <p className="text-sm text-red-700">{state.error}</p>
      )}
      <button className="btn w-full" disabled={pending || !!state.redirectTo}>
        {pending || state.redirectTo ? "Chvíľu…" : "Pridať sa"}
      </button>
      <p className="text-center text-sm text-muted">
        Už máš účet?{" "}
        <Link href={loginHref} className="underline">
          Prihlásiť sa
        </Link>
      </p>
    </form>
  );
}
