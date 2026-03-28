/**
 * AnonAvatar — deterministic avatar based on report ID.
 * Renders a unique hue + a masked-figure SVG so every reporter
 * looks distinct but stays truly anonymous.
 */

interface AnonAvatarProps {
  id: string;
  size?: number; // px — default 36
}

// Hash the id to a 0-359 hue and a 0-3 shape variant
function hashId(id: string): { hue: number; variant: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return { hue: h % 360, variant: h % 4 };
}

export function AnonAvatar({ id, size = 36 }: AnonAvatarProps) {
  const { hue, variant } = hashId(id);

  // HSL palette — bg is light tint, fg is vivid shade
  const bg = `hsl(${hue} 60% 90%)`;
  const ring = `hsl(${hue} 55% 70%)`;
  const fg = `hsl(${hue} 65% 32%)`;
  const accent = `hsl(${hue} 80% 55%)`;

  // Four silhouette paths so avatars visually differ
  const masks: React.ReactNode[] = [
    /* variant 0 — hooded figure */
    <>
      {/* hood */}
      <ellipse cx="16" cy="10" rx="6" ry="7" fill={fg} />
      {/* mask band */}
      <rect x="10" y="13" width="12" height="4" rx="2" fill={accent} opacity="0.9" />
      {/* body */}
      <path d="M8 28 Q10 19 16 18 Q22 19 24 28Z" fill={fg} />
      {/* collar */}
      <path d="M11 19 Q16 22 21 19" stroke={accent} strokeWidth="1.5" fill="none" />
    </>,

    /* variant 1 — detective hat */
    <>
      {/* hat brim */}
      <ellipse cx="16" cy="13" rx="8" ry="2.5" fill={fg} />
      {/* hat top */}
      <rect x="10" y="6" width="12" height="7" rx="2" fill={fg} />
      {/* hat band */}
      <rect x="10" y="11" width="12" height="2" fill={accent} />
      {/* face */}
      <ellipse cx="16" cy="18" rx="5" ry="4" fill={fg} opacity="0.8" />
      {/* body */}
      <path d="M8 28 Q10 21 16 20 Q22 21 24 28Z" fill={fg} />
    </>,

    /* variant 2 — ghost silhouette */
    <>
      {/* ghost head */}
      <ellipse cx="16" cy="12" rx="6.5" ry="7" fill={fg} />
      {/* ghost body with wavy bottom */}
      <path d="M9.5 18 L9.5 26 Q11 28 13 26 Q14.5 28 16 26 Q17.5 28 19 26 Q21 28 22.5 26 L22.5 18Z" fill={fg} />
      {/* eye slits */}
      <ellipse cx="13.5" cy="12" rx="1.5" ry="1" fill={accent} />
      <ellipse cx="18.5" cy="12" rx="1.5" ry="1" fill={accent} />
    </>,

    /* variant 3 — question mark face */
    <>
      {/* head circle */}
      <circle cx="16" cy="13" r="8" fill={fg} />
      {/* ?  */}
      <text
        x="16"
        y="18"
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        fill={accent}
        fontFamily="monospace"
      >
        ?
      </text>
      {/* body */}
      <path d="M8 28 Q10 21 16 20 Q22 21 24 28Z" fill={fg} />
    </>,
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: "50%",
        background: bg,
        border: `2px solid ${ring}`,
        flexShrink: 0,
        display: "block",
      }}
    >
      {masks[variant]}
    </svg>
  );
}
