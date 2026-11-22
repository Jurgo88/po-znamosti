import Link from "next/link";

const ERRORS: Record<string, string> = {
  email: "Zadaj platný e-mail.",
  vypnute: "Registrácia cez pozvánku je vypnutá.",
  chyba: "Registrácia sa nepodarila. Skús to znova.",
};

/** Obyčajný HTML formulár (bez JavaScriptu), spracuje ho route ./pridat. */
export function JoinForm({
  token,
  loginHref,
  error,
}: {
  token: string;
  loginHref: string;
  error?: string;
}) {
  return (
    <form
      method="post"
      action={`/pozvanka/${encodeURIComponent(token)}/pridat`}
      className="space-y-3 text-left"
    >
      <div>
        <label htmlFor="email" className="label">
          Tvoj e-mail
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      {error === "ucet" ? (
        <p className="text-sm text-red-700">
          Tento e-mail už v Po známosti má účet.{" "}
          <Link href={loginHref} className="underline">
            Prihlás sa
          </Link>{" "}
          a pozvánku potom prijmeš.
        </p>
      ) : (
        error && ERRORS[error] && <p className="text-sm text-red-700">{ERRORS[error]}</p>
      )}
      <button className="btn w-full">Pridať sa</button>
      <p className="text-center text-xs text-muted">
        Pokračovaním súhlasíš s{" "}
        <Link href="/podmienky" className="underline">
          podmienkami
        </Link>{" "}
        a berieš na vedomie{" "}
        <Link href="/sukromie" className="underline">
          ochranu súkromia
        </Link>
        .
      </p>
      <p className="text-center text-sm text-stone-600">
        Už máš účet?{" "}
        <Link href={loginHref} className="underline">
          Prihlásiť sa
        </Link>
      </p>
    </form>
  );
}
