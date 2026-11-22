"use client";
import { useActionState, useState } from "react";
import { createInvite, type FormState } from "@/app/actions";
import { vouchForFriend } from "@/app/core-actions";
import { CopyLink } from "@/app/siet/copy-link";

type Option = { id: string | number; name: string };

export function RecommendForms({
  friends,
  categories,
  preselected,
  baseUrl,
}: {
  friends: Option[];
  categories: Option[];
  preselected?: string;
  baseUrl: string;
}) {
  const [mode, setMode] = useState<"friend" | "invite">(friends.length ? "friend" : "invite");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-ui bg-surface p-1 text-sm">
        {(
          [
            ["friend", "Známy v aplikácii"],
            ["invite", "Ešte nemá účet"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-[4px] px-3 py-2.5 font-medium ${mode === m ? "bg-white shadow-sm" : "text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "friend" ? (
        <FriendForm friends={friends} categories={categories} preselected={preselected} />
      ) : (
        <InviteVouchForm categories={categories} baseUrl={baseUrl} />
      )}
    </div>
  );
}

function CategorySelect({ categories }: { categories: Option[] }) {
  return (
    <div>
      <label htmlFor="categoryId" className="label">
        Služba
      </label>
      <select id="categoryId" name="categoryId" required className="input" defaultValue="">
        <option value="" disabled>
          Vyber službu
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function NoteField() {
  return (
    <div>
      <label htmlFor="note" className="label">
        Prečo odporúčaš? <span className="font-normal text-muted">(nepovinné)</span>
      </label>
      <textarea
        id="note"
        name="note"
        rows={2}
        maxLength={300}
        className="input"
        placeholder="napr. robil mi kuchyňu v 2024, presný a férový"
      />
    </div>
  );
}

function FriendForm({
  friends,
  categories,
  preselected,
}: {
  friends: Option[];
  categories: Option[];
  preselected?: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(vouchForFriend, {});
  if (friends.length === 0)
    return (
      <p className="card text-sm text-muted">
        Zatiaľ nemáš v aplikácii žiadnych známych. Odporuč niekoho cez pozvánku.
      </p>
    );
  if (state.ok)
    return (
      <div className="card space-y-1">
        <p className="font-medium">Hotovo, zaručenie je uložené.</p>
        <p className="text-sm text-muted">
          Ak túto službu ešte nemá v profile, zobrazí sa mu na potvrdenie.
        </p>
      </div>
    );
  return (
    <form action={action} className="card space-y-4">
      <div>
        <label htmlFor="forUserId" className="label">
          Koho odporúčaš
        </label>
        <select
          id="forUserId"
          name="forUserId"
          required
          className="input"
          defaultValue={friends.some((f) => f.id === preselected) ? preselected : ""}
        >
          <option value="" disabled>
            Vyber známeho
          </option>
          {friends.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>
      <CategorySelect categories={categories} />
      <NoteField />
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button className="btn" disabled={pending}>
        {pending ? "Ukladám…" : "Zaručiť sa"}
      </button>
    </form>
  );
}

function InviteVouchForm({ categories, baseUrl }: { categories: Option[]; baseUrl: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createInvite, {});
  if (state.ok && state.token)
    return (
      <div className="card space-y-3">
        <p className="font-medium">Pozvánka s odporúčaním je pripravená.</p>
        <p className="text-sm text-muted">
          Pošli odkaz. Keď sa zaregistruje, budete prepojení a tvoje odporúčanie sa mu
          zobrazí na potvrdenie. Odkaz platí 30 dní.
        </p>
        <CopyLink url={`${baseUrl}/pozvanka/${state.token}`} />
      </div>
    );
  return (
    <form action={action} className="card space-y-4">
      <div>
        <label htmlFor="inviteeName" className="label">
          Meno
        </label>
        <input
          id="inviteeName"
          name="inviteeName"
          required
          className="input"
          placeholder="napr. Jano Novák"
        />
      </div>
      <CategorySelect categories={categories} />
      <NoteField />
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button className="btn" disabled={pending}>
        {pending ? "Vytváram…" : "Vytvoriť pozvánku"}
      </button>
    </form>
  );
}
