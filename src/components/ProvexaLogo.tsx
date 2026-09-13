import React from 'react';

export interface ProvexaLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
  theme?: 'light' | 'dark';
  showSubtitle?: boolean;
}

export const ProvexaLogo: React.FC<ProvexaLogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'light',
  showSubtitle = true,
}) => {
  const isDark = theme === 'dark';
  const primaryTextColor = isDark ? '#FFFFFF' : '#071739';
  const cyanColor = '#00A8FF';
  const iconBg = isDark ? '#0B192C' : '#071739';

  // Standalone Icon Badge (1:1 aspect ratio)
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`shrink-0 ${className || 'w-9 h-9'}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Provexa Solution Icon"
        style={{ aspectRatio: '1 / 1' }}
      >
        <rect width="100" height="100" rx="24" fill={iconBg} />
        <rect
          x="1.5"
          y="1.5"
          width="97"
          height="97"
          rx="22.5"
          stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,168,255,0.35)'}
          strokeWidth="3"
        />
        {/* Geometric P */}
        <path
          d="M 24 26 L 42 26 C 52 26 58 32 58 41 C 58 50 52 56 42 56 L 33 56 L 33 74 L 24 74 Z M 33 34 L 33 48 L 41 48 C 45 48 48 45 48 41 C 48 37 45 34 41 34 Z"
          fill="#FFFFFF"
        />
        {/* Stylized X Right Wing */}
        <path d="M 68 26 L 78 26 L 52 74 L 42 74 Z" fill="#FFFFFF" opacity="0.85" />
        {/* Electric Cyan Dynamic Stroke */}
        <path d="M 44 26 L 54 26 L 80 74 L 70 74 Z" fill={cyanColor} />
      </svg>
    );
  }

  // Full / Compact Lockup: Icon + Bold Wordmark
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}
      aria-label="Provexa Solution"
    >
      {/* Brand Icon Mark */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ aspectRatio: '1 / 1' }}
        >
          <rect width="100" height="100" rx="24" fill={iconBg} />
          <rect
            x="1.5"
            y="1.5"
            width="97"
            height="97"
            rx="22.5"
            stroke={isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,168,255,0.35)'}
            strokeWidth="3"
          />
          {/* P glyph */}
          <path
            d="M 24 26 L 42 26 C 52 26 58 32 58 41 C 58 50 52 56 42 56 L 33 56 L 33 74 L 24 74 Z M 33 34 L 33 48 L 41 48 C 45 48 48 45 48 41 C 48 37 45 34 41 34 Z"
            fill="#FFFFFF"
          />
          {/* X right leg */}
          <path d="M 68 26 L 78 26 L 52 74 L 42 74 Z" fill="#FFFFFF" opacity="0.85" />
          {/* Cyan dynamic chevron */}
          <path d="M 44 26 L 54 26 L 80 74 L 70 74 Z" fill={cyanColor} />
        </svg>
      </div>

      {/* Brand Typographic Lockup */}
      <div className="flex flex-col justify-center min-w-0 leading-none">
        <div className="flex items-center tracking-tight text-base sm:text-lg font-black font-sans">
          <span style={{ color: primaryTextColor }}>PRO</span>
          <span style={{ color: cyanColor }}>V</span>
          <span style={{ color: primaryTextColor }}>EXA</span>
        </div>
        {showSubtitle && variant === 'full' && (
          <span
            className={`text-[9px] font-extrabold tracking-[0.26em] uppercase mt-0.5 ${
              isDark ? 'text-cyan-300' : 'text-slate-500'
            }`}
          >
            SOLUTION
          </span>
        )}
      </div>
    </div>
  );
};

