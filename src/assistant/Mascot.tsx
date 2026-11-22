type Props = { className?: string; talking?: boolean };

/** Friday/EDITH-inspired 2D holographic AI assistant character. */
export default function Mascot({ className = '', talking = false }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="AI Assistant Avatar">
      <defs>
        <linearGradient id="hudGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
        </linearGradient>
        <clipPath id="avatarClip">
          <circle cx="60" cy="60" r="42" />
        </clipPath>
      </defs>

      <g className="hoshi-bob">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="url(#hudGlow)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          className="hoshi-spin"
          opacity="0.65"
        />

        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth="1"
          opacity="0.35"
        />

        <path d="M18 28 L18 18 L28 18" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />
        <path d="M102 28 L102 18 L92 18" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />
        <path d="M18 92 L18 102 L28 102" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />
        <path d="M102 92 L102 102 L92 102" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />

        <circle cx="60" cy="60" r="43" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />

        <image
          href="/images/ai_assistant_friday.webp"
          x="16"
          y="16"
          width="88"
          height="88"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#avatarClip)"
        />

        <circle
          cx="60"
          cy="60"
          r="42"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {talking && (
          <g>
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              className="animate-ping"
              opacity="0.5"
            />
            <path
              d="M44 96 L48 92 L52 98 L56 90 L60 98 L64 92 L68 98 L72 90 L76 96"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        <circle cx="28" cy="40" r="1.5" fill="#38bdf8" className="hoshi-twinkle" />
        <circle cx="92" cy="76" r="1.5" fill="#6366f1" className="hoshi-twinkle" />
      </g>
    </svg>
  );
}
