export default function HandballLogo({ size = 32 }: { size?: number }) {
  const id = `logo-grad-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for the ball – primary indigo with a subtle lighter highlight */}
        <linearGradient id={id} x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        {/* Subtle shine highlight */}
        <radialGradient id={`${id}-shine`} cx="0.35" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ball body */}
      <circle cx="32" cy="32" r="27" fill={`url(#${id})`} />
      {/* Shine overlay */}
      <circle cx="32" cy="32" r="27" fill={`url(#${id}-shine)`} />
      {/* Outer ring */}
      <circle cx="32" cy="32" r="27" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />

      {/* Handball seam lines */}
      <path
        d="M13 23C20 28 28 30 32 30C36 30 44 28 51 23"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M13 41C20 36 28 34 32 34C36 34 44 36 51 41"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 5C32 5 30 20 30 32C30 44 32 59 32 59"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Motion lines – subtle speed streaks */}
      <line x1="3" y1="21" x2="7" y2="22" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="2" y1="32" x2="6" y2="32" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <line x1="3" y1="43" x2="7" y2="42" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
