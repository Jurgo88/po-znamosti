/** Reťaz ľudí: Ty → známy → poskytovateľ. Hlavný motív vizuálneho smeru D. */
export function Chain({ people, size = "sm" }: { people: string[]; size?: "sm" | "md" }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-y-1 text-muted ${size === "md" ? "text-sm" : "text-xs"}`}
      aria-label={`Cesta: ${people.join(", ")}`}
    >
      {people.map((p, i) => {
        const first = i === 0;
        const last = i === people.length - 1;
        return (
          <span key={i} className="flex items-center">
            {i > 0 && <span aria-hidden className="mx-1.5 h-0.5 w-5 bg-brand sm:w-8" />}
            <span className={`flex items-center gap-1.5 ${last ? "font-medium text-ink" : ""}`}>
              <span
                aria-hidden
                className={`inline-block rounded-[2px] border-2 border-brand ${
                  last ? "size-2.5 bg-brand" : first ? "size-2 bg-brand" : "size-2 bg-white"
                }`}
              />
              {p}
            </span>
          </span>
        );
      })}
    </div>
  );
}
