/** Hlavička obrazovky: ikona v odtieni hlavnej farby, malý nadpis, nadpis a popis. */
export function PageHead({
  icon,
  eyebrow,
  title,
  children,
  action,
}: {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-start gap-4">
        {icon && <span className="icon-tile mt-1 hidden size-12 sm:grid">{icon}</span>}
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h1 className="text-[26px] leading-tight font-bold tracking-tight text-balance sm:text-[30px]">
            {title}
          </h1>
          {children && <div className="mt-1.5 max-w-[60ch] text-muted">{children}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Prázdny stav: prerušená reťaz „Ty – ?“, nadpis, text a akcie. */
export function EmptyState({
  title,
  children,
  actions,
  chain = ["Ty", "?"],
}: {
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  chain?: string[];
}) {
  return (
    <div className="rounded-ui border border-dashed border-brand-300 bg-white/70 px-6 py-10 text-center sm:py-14">
      <div aria-hidden className="mx-auto mb-5 flex w-fit items-center">
        {chain.map((p, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && (
              <span
                className={`h-0.5 w-10 ${p === "?" ? "bg-[repeating-linear-gradient(90deg,var(--color-brand-300)_0_5px,transparent_5px_10px)]" : "bg-brand"}`}
              />
            )}
            <span
              className={`grid size-9 place-items-center rounded-ui text-xs font-bold ${
                p === "?"
                  ? "border-2 border-dashed border-brand-300 text-brand-400"
                  : "bg-brand text-white"
              }`}
            >
              {p === "?" ? "?" : p.slice(0, 2)}
            </span>
          </span>
        ))}
      </div>
      <h2 className="mx-auto max-w-md text-lg font-bold text-balance">{title}</h2>
      {children && <p className="mx-auto mt-2 max-w-md text-muted">{children}</p>}
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
