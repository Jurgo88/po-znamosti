/** Iniciály v štvorci. Odtieň z rodiny hlavnej modrej podľa mena, aby sa ľudia dali rozlíšiť. */
const TONES = [
  "bg-brand-100 text-brand",
  "bg-brand-200 text-brand-dark",
  "bg-brand text-white",
  "bg-surface text-brand",
] as const;

function tone(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export function Avatar({
  name,
  size = 40,
  onSurface = false,
}: {
  name: string;
  size?: number;
  /** Zachované kvôli kompatibilite; farba sa teraz odvodzuje od mena. */
  onSurface?: boolean;
}) {
  void onSurface;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-ui font-bold ${tone(name)}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {initials}
    </span>
  );
}
