export function QuantLogo({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  const ink = inverse ? "#FFFFFF" : "#0D1B2A";
  return (
    <svg className={compact ? "logo logo--compact" : "logo"} viewBox={compact ? "0 0 128 128" : "0 0 620 128"} role="img" aria-label="The Quant Club">
      <g>
        <path fill={ink} d="M 101.299 98.782 A 51 51 0 0 1 14.976 78.058 L 34.201 72.545 A 31 31 0 0 0 86.672 85.142 Z" />
        <path fill="#06B6D4" d="M 13.937 73.731 A 51 51 0 0 1 22.740 34.023 L 38.920 45.779 A 31 31 0 0 0 33.570 69.915 Z" />
        <path fill="#2563EB" d="M 25.510 30.541 A 51 51 0 0 1 61.331 13.070 L 62.378 33.042 A 31 31 0 0 0 40.604 43.662 Z" />
        <path fill="#2563EB" d="M 65.780 13.031 A 51 51 0 0 1 101.900 29.874 L 87.037 43.257 A 31 31 0 0 0 65.082 33.019 Z" />
        <path fill="#2563EB" d="M 104.730 33.307 A 51 51 0 0 1 104.189 95.399 L 88.428 83.086 A 31 31 0 0 0 88.758 45.344 Z" />
        <path fill={ink} d="M 84 81 L 120 109 L 107 123 L 76 94 Z" />
      </g>
      {!compact && <text x="153" y="79" fill={ink} fontFamily="Arial, sans-serif" fontWeight="700" fontSize="43" letterSpacing="1">THE QUANT CLUB</text>}
    </svg>
  );
}
