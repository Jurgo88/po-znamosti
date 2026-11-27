import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { LoginForm } from "./login-form";
import { IconMail } from "@/components/icons";

function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/siet";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <div className="mx-auto max-w-md py-4 sm:py-10">
      <div className="card space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <span className="icon-tile size-12">
            <IconMail size={22} />
          </span>
          <h1 className="text-[26px] leading-tight font-bold tracking-tight">Prihlásenie</h1>
          <p className="text-muted">Zadaj e-mail a pošleme ti odkaz na prihlásenie. Bez hesla.</p>
        </div>
        <LoginForm next={next} />
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        Ešte nemáš účet? Popros známeho o pozvánku.
      </p>
    </div>
  );
}
