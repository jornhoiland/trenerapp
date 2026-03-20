import * as React from 'react';

export default function HandballPlayerLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ball */}
      <circle cx="54" cy="10" r="6" fill="url(#ballGradient)" stroke="#6366F1" strokeWidth="2" />
      {/* Player body */}
      <path d="M32 16c0-4 4-8 8-8s8 4 8 8-4 8-8 8-8-4-8-8z" fill="#6366F1" />
      {/* Arm throwing */}
      <path d="M40 16c6-6 12-8 14-6" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      {/* Head */}
      <circle cx="40" cy="8" r="4" fill="#F1F5F9" stroke="#6366F1" strokeWidth="1.5" />
      {/* Jumping legs */}
      <path d="M32 24c-2 8-8 18-12 22" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 24c4 8 10 18 14 22" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
      {/* Jersey shine */}
      <path d="M36 12c2 2 4 2 6 0" stroke="#F1F5F9" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="ballGradient" x1="48" y1="10" x2="60" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
