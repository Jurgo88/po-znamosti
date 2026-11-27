import { signOut } from "@/app/actions";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "./profile-form";
import { ProfileServices } from "./services";
import { DeleteAccount } from "./delete-account";
import { Avatar } from "@/components/avatar";
import { PageHead } from "@/components/page-head";
import { IconUser } from "@/components/icons";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sluzby?: string }>;
}) {
  const user = await requireUser("/profil");
  const { next, sluzby } = await searchParams;
  const isNew = !user.name || !user.district;
  return (
    <div className="mx-auto max-w-xl space-y-8">
      {isNew ? (
        <PageHead icon={<IconUser size={22} />} eyebrow="Ešte jeden krok" title="Vitaj! Doplň si profil">
          Meno a okres uvidia tvoji známi a ich známi.
        </PageHead>
      ) : (
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size={64} />
          <div className="min-w-0">
            <p className="eyebrow mb-1">Môj profil</p>
            <h1 className="truncate text-[26px] leading-tight font-bold tracking-tight">{user.name}</h1>
            <p className="truncate text-sm text-muted">
              {user.district} · {user.email}
            </p>
          </div>
        </div>
      )}
      <ProfileForm
        next={next}
        initial={{
          name: user.name,
          district: user.district ?? "",
          bio: user.bio ?? "",
          phone: user.phone ?? "",
          phoneVisible: user.phoneVisible,
        }}
      />
      {!isNew && <ProfileServices userId={user.id} highlight={Boolean(sluzby)} />}
      {!isNew && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-hair pt-6">
          <form action={signOut}>
            <button className="text-sm text-muted hover:underline">Odhlásiť sa</button>
          </form>
          <DeleteAccount />
        </div>
      )}
    </div>
  );
}
