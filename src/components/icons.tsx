/**
 * Vlastná sada ikon: ťah 1.75, zaoblené konce, 24×24.
 * Ikona „sieť“ a „zaručiť sa“ preberajú motív štvorcových bodov spojených čiarou.
 */
type P = { className?: string; size?: number };

function Svg({ className, size = 20, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15 15 5 5" />
  </Svg>
);

/** Tri ľudia spojení čiarou: Ty → známy → známy známeho. */
export const IconNetwork = (p: P) => (
  <Svg {...p}>
    <rect x="2.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <rect x="16.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M7.5 12h2M14.5 12h2" />
  </Svg>
);

/** Pečiatka s fajkou: zaručenie sa. */
export const IconVouch = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.4 3.1 8 7.5 9.5 4.4-1.5 7.5-5.1 7.5-9.5V6z" />
    <path d="m8.8 12 2.2 2.2 4.2-4.4" />
  </Svg>
);

export const IconUser = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.75" />
    <path d="M4.5 20c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5" />
  </Svg>
);

export const IconPhone = (p: P) => (
  <Svg {...p}>
    <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.5 1.5C10.6 20.5 3.5 13.4 3.5 5.5A1.5 1.5 0 0 1 5 4z" />
  </Svg>
);

export const IconMail = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Svg>
);

export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconLink = (p: P) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Svg>
);

export const IconArrowLeft = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const IconArrowRight = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconPin = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.25" />
  </Svg>
);

export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const IconTools = (p: P) => (
  <Svg {...p}>
    <path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z" />
    <path d="m4 4 5 5M4 4l1.5 3.5L7.5 8" />
  </Svg>
);

export const IconQuote = (p: P) => (
  <Svg {...p}>
    <path d="M9 7H6a1 1 0 0 0-1 1v4h4v-4M19 7h-3a1 1 0 0 0-1 1v4h4v-4M9 12c0 2.5-1 4-3.5 5M19 12c0 2.5-1 4-3.5 5" />
  </Svg>
);

export const IconClock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);
