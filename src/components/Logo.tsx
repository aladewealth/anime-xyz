type LogoProps = {
  className?: string;
  title?: string;
};

const Logo = ({ className, title = "ANiMe.xyz" }: LogoProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    role="img"
    aria-label={title}
    className={className}
  >
    <defs>
      <linearGradient id="anx-logo-brand" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="hsl(350 80% 60%)" />
        <stop offset="100%" stopColor="hsl(30 90% 60%)" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="60" height="60" rx="14" fill="hsl(230 20% 11%)" />
    <rect
      x="2"
      y="2"
      width="60"
      height="60"
      rx="14"
      fill="none"
      stroke="url(#anx-logo-brand)"
      strokeWidth="2"
    />
    <path d="M20 49 L31 14 H33 L44 49 H37 L34.4 40 H29.6 L27 49 Z" fill="url(#anx-logo-brand)" />
    <path d="M30.5 35 L33.5 35 L32 29.5 Z" fill="hsl(230 20% 11%)" />
    <path d="M27 24 L36 29 L27 34 Z" fill="hsl(230 20% 11%)" />
    <circle cx="48" cy="18" r="2.5" fill="hsl(30 90% 60%)" />
  </svg>
);

export default Logo;
