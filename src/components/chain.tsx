/** Reťaz ľudí: Ty → známy → poskytovateľ. Hlavný motív vizuálneho smeru D. */
export function Chain({
  people,
  size = "sm",
  inverse = false,
}: {
  people: string[];
  size?: "sm" | "md" | "lg";
  /** Biela verzia na modrom pozadí. */
  inverse?: boolean;
}) {
  const text = size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs";
  const node = size === "lg" ? "size-3" : "size-2.5";
  const line = inverse ? "bg-white/60" : "bg-brand";
  return (
    <div
      className={`flex flex-wrap items-center gap-y-1.5 ${text} ${inverse ? "text-white/75" : "text-muted"}`}
      aria-label={`Cesta: ${people.join(", ")}`}
    >
      {people.map((p, i) => {
        const first = i === 0;
        const last = i === people.length - 1;
        const unknown = p === "?";
        const fill = inverse ? "bg-white" : "bg-brand";
        const hollow = inverse ? "bg-brand" : "bg-white";
        return (
          <span key={i} className="flex items-center">
            {i > 0 && (
              <span
                aria-hidden
                className={`mx-1.5 h-0.5 w-5 sm:w-8 ${unknown ? "bg-[repeating-linear-gradient(90deg,currentColor_0_4px,transparent_4px_8px)] text-brand-300" : line}`}
              />
            )}
            <span
              className={`flex items-center gap-1.5 ${last && !unknown ? `font-medium ${inverse ? "text-white" : "text-ink"}` : ""}`}
            >
              <span
                aria-hidden
                className={`inline-block rounded-[2px] border-2 ${
                  unknown
                    ? "border-dashed border-brand-300 bg-transparent"
                    : `${inverse ? "border-white" : "border-brand"} ${last || first ? fill : hollow}`
                } ${node}`}
              />
              {p}
            </span>
          </span>
        );
      })}
    </div>
  );
}
