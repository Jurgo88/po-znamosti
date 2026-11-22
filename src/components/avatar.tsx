export function Avatar({ name, size = 40, onSurface = false }: { name: string; size?: number; onSurface?: boolean }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-ui font-bold text-brand ${onSurface ? "bg-white" : "bg-surface"}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}
    >
      {initials}
    </span>
  );
}
