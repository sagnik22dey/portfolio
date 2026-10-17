type Props = { className?: string; talking?: boolean };

/** Nanahoshi: chibi mascot of the portfolio assistant, drawn in the site's ink/paper style. */
export default function Mascot({ className = '', talking = false }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Nanahoshi, the portfolio assistant">
      <g className="hoshi-bob">
        <path
          d="M60 16 C38 16 28 34 29 54 C30 78 25 98 32 108 L88 108 C95 98 90 78 91 54 C92 34 82 16 60 16 Z"
          fill="#2e2a33"
          stroke="rgb(var(--ink))"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M42 96 Q60 88 78 96 L83 116 L37 116 Z" fill="#f4f1e8" stroke="rgb(var(--ink))" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M48 94 Q60 101 72 94 L70 100 Q60 106 50 100 Z" fill="#5b7fc7" stroke="rgb(var(--ink))" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="60" cy="60" rx="22" ry="23" fill="#f5d3b5" stroke="rgb(var(--ink))" strokeWidth="3" />
        <path d="M36 54 Q34 28 58 28 Q56 36 50 44 Q44 50 42 58 Q38 56 36 54 Z" fill="#2e2a33" stroke="rgb(var(--ink))" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M84 54 Q86 28 62 28 Q64 36 70 44 Q76 50 78 58 Q82 56 84 54 Z" fill="#2e2a33" stroke="rgb(var(--ink))" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M36 50 Q30 66 34 84 Q38 92 42 86 Q38 68 42 54 Z" fill="#2e2a33" stroke="rgb(var(--ink))" strokeWidth="2" strokeLinejoin="round" />
        <path d="M84 50 Q90 66 86 84 Q82 92 78 86 Q82 68 78 54 Z" fill="#2e2a33" stroke="rgb(var(--ink))" strokeWidth="2" strokeLinejoin="round" />
        <path d="M84 36 L73 29 L76 41 Z" fill="#f4f1e8" stroke="rgb(var(--ink))" strokeWidth="2" strokeLinejoin="round" />
        <path d="M84 36 L95 29 L92 41 Z" fill="#f4f1e8" stroke="rgb(var(--ink))" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="84" cy="36" r="3.2" fill="#f4f1e8" stroke="rgb(var(--ink))" strokeWidth="2" />
        <g className="hoshi-blink">
          <ellipse cx="50" cy="64" rx="5.5" ry="7" fill="#4a7fd4" stroke="rgb(var(--ink))" strokeWidth="2" />
          <ellipse cx="70" cy="64" rx="5.5" ry="7" fill="#4a7fd4" stroke="rgb(var(--ink))" strokeWidth="2" />
          <circle cx="52" cy="61" r="2" fill="#ffffff" />
          <circle cx="72" cy="61" r="2" fill="#ffffff" />
          <circle cx="48" cy="67" r="1" fill="#ffffff" opacity="0.8" />
          <circle cx="68" cy="67" r="1" fill="#ffffff" opacity="0.8" />
        </g>
        <ellipse cx="43" cy="72" rx="4" ry="2.2" fill="#f0a8b8" opacity="0.55" />
        <ellipse cx="77" cy="72" rx="4" ry="2.2" fill="#f0a8b8" opacity="0.55" />
        {talking ? (
          <ellipse cx="60" cy="73" rx="4.5" ry="3.5" fill="rgb(var(--ink))" className="hoshi-talk" />
        ) : (
          <path d="M55 71 Q60 76 65 71" fill="none" stroke="rgb(var(--ink))" strokeWidth="2.6" strokeLinecap="round" />
        )}
        <path d="M102 20 l2.5 5.5 l5.5 2.5 l-5.5 2.5 l-2.5 5.5 l-2.5 -5.5 l-5.5 -2.5 l5.5 -2.5 z" fill="rgb(var(--accent))" className="hoshi-twinkle" />
      </g>
    </svg>
  );
}
