"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: next,
      newUserCallbackURL: `/profil?next=${encodeURIComponent(next)}`,
    });
    setState(error ? "error" : "sent");
  }

  if (state === "sent") {
    return (
      <div className="card">
        <p className="font-medium">Skontroluj si e-mail.</p>
        <p className="mt-1 text-sm text-muted">
          Na adresu {email} sme poslali odkaz na prihlásenie. Platí 15 minút.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {state === "error" && (
        <p className="text-sm text-red-700">
          Odkaz sa nepodarilo poslať. Skontroluj e-mail a skús to znova. Ak ešte nemáš účet,
          popros známeho o pozvánku a pridaj sa cez ňu.
        </p>
      )}
      <button type="submit" className="btn w-full" disabled={state === "sending"}>
        {state === "sending" ? "Posielam…" : "Poslať odkaz"}
      </button>
    </form>
  );
}
