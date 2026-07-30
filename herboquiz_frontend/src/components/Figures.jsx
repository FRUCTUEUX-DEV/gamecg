/**
 * Figures SVG abstraites pour la section Prix
 * Silhouettes, couronnes et trophées métalliques
 * Design inspiré d'AGORA - Pas d'emoji, pas de cartoon
 */

export function Silhouette({ className }) {
  return (
    <svg viewBox="0 0 120 220" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sil-metal" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e6ecf3" />
          <stop offset="60%" stopColor="#b8c2cf" />
          <stop offset="100%" stopColor="#f5f7fa" />
        </linearGradient>
        <linearGradient id="sil-shine" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="sil-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#sil-glow)">
        {/* head */}
        <circle cx="60" cy="30" r="18" fill="url(#sil-metal)" />
        {/* neck */}
        <rect x="55" y="46" width="10" height="10" fill="url(#sil-metal)" />
        {/* torso */}
        <path
          d="M32 62 C 40 58, 80 58, 88 62 L 92 130 C 92 138, 78 144, 60 144 C 42 144, 28 138, 28 130 Z"
          fill="url(#sil-metal)"
        />
        {/* arms */}
        <path d="M30 68 C 22 82, 22 110, 28 128 L 34 126 C 30 110, 30 88, 36 74 Z" fill="url(#sil-metal)" />
        <path d="M90 68 C 98 82, 98 110, 92 128 L 86 126 C 90 110, 90 88, 84 74 Z" fill="url(#sil-metal)" />
        {/* legs */}
        <path d="M40 142 L 46 210 L 58 210 L 58 148 Z" fill="url(#sil-metal)" />
        <path d="M80 142 L 74 210 L 62 210 L 62 148 Z" fill="url(#sil-metal)" />
        {/* highlight */}
        <path d="M50 20 C 52 14, 68 14, 70 20 L 68 40 C 65 44, 55 44, 52 40 Z" fill="url(#sil-shine)" opacity="0.6" />
      </g>
    </svg>
  )
}

export function Crown({ className }) {
  return (
    <svg viewBox="0 0 120 70" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="crown-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff2b8" />
          <stop offset="50%" stopColor="#f5c451" />
          <stop offset="100%" stopColor="#8a5a10" />
        </linearGradient>
        <filter id="crown-glow">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <g>
        <ellipse cx="60" cy="60" rx="42" ry="6" fill="#f5c451" opacity="0.35" filter="url(#crown-glow)" />
        <path
          d="M10 55 L 22 22 L 38 44 L 60 12 L 82 44 L 98 22 L 110 55 Z"
          fill="url(#crown-g)"
          stroke="#fff2b8"
          strokeWidth="0.8"
        />
        <rect x="10" y="52" width="100" height="8" rx="2" fill="url(#crown-g)" />
        <circle cx="22" cy="22" r="3" fill="#fff" />
        <circle cx="60" cy="12" r="4" fill="#fff" />
        <circle cx="98" cy="22" r="3" fill="#fff" />
      </g>
    </svg>
  )
}

export function Trophy({ className }) {
  return (
    <svg viewBox="0 0 160 220" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="tr-body" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7a4a12" />
          <stop offset="18%" stopColor="#b8862a" />
          <stop offset="42%" stopColor="#ffe08a" />
          <stop offset="58%" stopColor="#fff2b8" />
          <stop offset="82%" stopColor="#b8862a" />
          <stop offset="100%" stopColor="#5a340a" />
        </linearGradient>
        <linearGradient id="tr-rim" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff6c8" />
          <stop offset="55%" stopColor="#c9932e" />
          <stop offset="100%" stopColor="#5a340a" />
        </linearGradient>
        <radialGradient id="tr-inside" cx="0.5" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#3a2408" />
          <stop offset="70%" stopColor="#1b1204" />
          <stop offset="100%" stopColor="#0a0602" />
        </radialGradient>
        <linearGradient id="tr-handle" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7a4a12" />
          <stop offset="50%" stopColor="#ffe08a" />
          <stop offset="100%" stopColor="#5a340a" />
        </linearGradient>
        <linearGradient id="tr-base" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff2b8" />
          <stop offset="45%" stopColor="#c9932e" />
          <stop offset="100%" stopColor="#4a2c08" />
        </linearGradient>
        <linearGradient id="tr-base-top" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7a4a12" />
          <stop offset="50%" stopColor="#ffe6a0" />
          <stop offset="100%" stopColor="#5a340a" />
        </linearGradient>
        <linearGradient id="tr-spec" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Handles */}
      <path
        d="M42 52 C 8 58, 8 118, 46 122 L 46 108 C 24 104, 24 68, 46 66 Z"
        fill="url(#tr-handle)"
        stroke="#3a2408"
        strokeWidth="0.6"
      />
      <path
        d="M118 52 C 152 58, 152 118, 114 122 L 114 108 C 136 104, 136 68, 114 66 Z"
        fill="url(#tr-handle)"
        stroke="#3a2408"
        strokeWidth="0.6"
      />

      {/* Cup body */}
      <path
        d="M34 40 L 126 40 L 118 118 C 116 138, 100 148, 80 148 C 60 148, 44 138, 42 118 Z"
        fill="url(#tr-body)"
        stroke="#3a2408"
        strokeWidth="0.7"
      />

      {/* Rim */}
      <path d="M30 34 L 130 34 L 126 46 L 34 46 Z" fill="url(#tr-rim)" stroke="#3a2408" strokeWidth="0.6" />
      <ellipse cx="80" cy="36" rx="48" ry="8" fill="url(#tr-inside)" />
      <ellipse cx="80" cy="34.5" rx="48" ry="3" fill="none" stroke="#fff6c8" strokeWidth="1.2" opacity="0.9" />

      {/* Specular sheen */}
      <path
        d="M56 46 C 54 90, 60 130, 74 144 L 78 144 C 66 128, 62 92, 64 46 Z"
        fill="url(#tr-spec)"
        opacity="0.55"
      />

      {/* Stem */}
      <path d="M70 148 L 90 148 L 92 164 L 68 164 Z" fill="url(#tr-body)" stroke="#3a2408" strokeWidth="0.6" />

      {/* Base */}
      <ellipse cx="80" cy="168" rx="34" ry="6" fill="url(#tr-base-top)" stroke="#3a2408" strokeWidth="0.6" />
      <path d="M46 168 L 114 168 L 120 190 L 40 190 Z" fill="url(#tr-base)" stroke="#3a2408" strokeWidth="0.6" />
      <ellipse cx="80" cy="192" rx="42" ry="5" fill="url(#tr-base-top)" stroke="#3a2408" strokeWidth="0.6" />
      <path d="M38 192 L 122 192 L 126 202 L 34 202 Z" fill="url(#tr-base)" stroke="#3a2408" strokeWidth="0.6" />
      <ellipse cx="80" cy="203" rx="46" ry="4" fill="#2a1806" opacity="0.55" />
    </svg>
  )
}
