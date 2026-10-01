type Props = { className?: string; talking?: boolean };

/** Hoshi: an original chibi star-spirit mascot drawn in the site's ink/paper style. */
export default function Mascot({ className = '', talking = false }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Hoshi, the portfolio assistant">
      <g className="hoshi-bob">
        <path
          d="M22 58 L14 30 L34 44 L36 14 L50 38 L60 8 L70 38 L84 14 L86 44 L106 30 L98 58 Z"
          className="fill-ink"
          stroke="rgb(var(--ink))"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <ellipse cx="60" cy="68" rx="34" ry="32" className="fill-paper-50" stroke="rgb(var(--ink))" strokeWidth="3.5" />
        <path d="M28 54 Q60 40 92 54 L92 62 Q60 50 28 62 Z" className="fill-accent" stroke="rgb(var(--ink))" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M88 56 L104 50 L100 60 L106 66 L90 62 Z" className="fill-accent" stroke="rgb(var(--ink))" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M56 51 l4 -6 l4 6 l-4 4 z" fill="rgb(var(--paper-50))" stroke="rgb(var(--ink))" strokeWidth="1.5" />
        <path d="M30 60 L40 74 L36 60 M90 60 L80 74 L84 60" className="fill-ink" stroke="rgb(var(--ink))" strokeWidth="2" strokeLinejoin="round" />
        <g className="hoshi-blink">
          <ellipse cx="47" cy="72" rx="6.5" ry="8.5" className="fill-ink" />
          <ellipse cx="73" cy="72" rx="6.5" ry="8.5" className="fill-ink" />
          <circle cx="49" cy="68.5" r="2.6" fill="rgb(var(--paper-50))" />
          <circle cx="75" cy="68.5" r="2.6" fill="rgb(var(--paper-50))" />
          <circle cx="45" cy="76" r="1.2" fill="rgb(var(--paper-50))" />
          <circle cx="71" cy="76" r="1.2" fill="rgb(var(--paper-50))" />
        </g>
        <ellipse cx="36" cy="84" rx="5" ry="2.6" className="fill-accent" opacity="0.45" />
        <ellipse cx="84" cy="84" rx="5" ry="2.6" className="fill-accent" opacity="0.45" />
        {talking ? (
          <ellipse cx="60" cy="88" rx="4.5" ry="3.5" className="fill-ink hoshi-talk" />
        ) : (
          <path d="M53 86 Q60 92 67 86" fill="none" stroke="rgb(var(--ink))" strokeWidth="2.8" strokeLinecap="round" />
        )}
        <path d="M102 20 l2.5 5.5 l5.5 2.5 l-5.5 2.5 l-2.5 5.5 l-2.5 -5.5 l-5.5 -2.5 l5.5 -2.5 z" className="fill-accent hoshi-twinkle" />
      </g>
    </svg>
  );
}
