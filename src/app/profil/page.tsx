import { signOut } from "@/app/actions";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "./profile-form";
import { ProfileServices } from "./services";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sluzby?: string }>;
}) {
  const user = await requireUser("/profil");
  const { next, sluzby } = await searchParams;
  const isNew = !user.name || !user.district;
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isNew ? "Vitaj! Doplň si profil" : "Môj profil"}</h1>
        <p className="mt-1 text-muted">
          {isNew
            ? "Meno a okres uvidia tvoji známi a ich známi."
            : `Prihlásený ako ${user.email}`}
        </p>
      </div>
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
        <form action={signOut}>
          <button className="text-sm text-muted hover:underline">Odhlásiť sa</button>
        </form>
      )}
    </div>
  );
}
