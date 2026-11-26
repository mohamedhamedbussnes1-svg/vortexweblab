import React from 'react';
import { PLAYER_CHARACTERS } from '../game/rules';
import { PlayerCharacterId } from '../game/types';

interface CharacterPortraitProps {
  characterId: PlayerCharacterId;
  className?: string;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  className = 'w-12 h-12',
}) => {
  const def = PLAYER_CHARACTERS[characterId] ?? PLAYER_CHARACTERS.mohamed;
  const skinBase =
    characterId === 'ali'
      ? '#d8a078'
      : characterId === 'ahmed'
        ? '#c78c62'
        : '#cfa074';
  const skinShade =
    characterId === 'ali'
      ? '#b87d56'
      : characterId === 'ahmed'
        ? '#a36b44'
        : '#ad7a50';

  const bgGradientId = `char-bg-${characterId}`;

  return (
    <svg
      viewBox="0 0 96 108"
      className={className}
      aria-label={def.nameAr}
      role="img"
    >
      <defs>
        <linearGradient id={bgGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#355269" />
          <stop offset="55%" stopColor="#6c513a" />
          <stop offset="100%" stopColor="#261c14" />
        </linearGradient>
      </defs>

      {/* Atmospheric Hara backdrop */}
      <rect width="96" height="108" fill={`url(#${bgGradientId})`} />
      <rect x="6" y="16" width="16" height="42" fill="#2c241d" opacity="0.45" />
      <rect x="74" y="12" width="18" height="46" fill="#2c241d" opacity="0.45" />
      <circle cx="48" cy="38" r="30" fill="#f5b400" opacity="0.12" />

      {/* Shoulders & Shirt / Hoodie */}
      <path
        d="M12 108 C14 78, 28 70, 48 70 C68 70, 82 78, 84 108 Z"
        fill={def.shirtHex}
      />
      {/* Shirt shading */}
      <path
        d="M48 70 C68 70, 82 78, 84 108 L54 108 C56 90, 54 78, 48 70 Z"
        fill="#000000"
        opacity="0.18"
      />
      {def.hasHoodie ? (
        <>
          {/* Hoodie collar & drawstrings */}
          <path
            d="M31 73 C36 86, 60 86, 65 73 C60 66, 36 66, 31 73 Z"
            fill={def.shirtHex}
            stroke="#000000"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
          <line x1="42" y1="81" x2="41" y2="97" stroke="#f5efe6" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="54" y1="81" x2="55" y2="97" stroke="#f5efe6" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : (
        /* Crewneck T-shirt collar */
        <path
          d="M36 71 Q48 82 60 71"
          fill="none"
          stroke="#1b1510"
          strokeOpacity="0.35"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}

      {/* Neck */}
      <rect x="40" y="55" width="16" height="19" rx="7" fill={skinShade} />

      {/* Ears */}
      <ellipse cx="29" cy="43" rx="3.8" ry="6.2" fill={skinShade} />
      <ellipse cx="67" cy="43" rx="3.8" ry="6.2" fill={skinShade} />

      {/* Head */}
      <path
        d="M30 34 C30 20, 66 20, 66 34 L65 49 C64 59, 55 64, 48 64 C41 64, 32 59, 31 49 Z"
        fill={skinBase}
      />

      {/* Hair */}
      {characterId === 'mohamed' && (
        <path
          d="M29 36 C28 19, 41 14, 51 15 C61 15, 68 22, 67 36 C64 28, 56 25, 47 26 C38 26, 32 30, 29 36 Z"
          fill="#1a1512"
        />
      )}
      {characterId === 'ahmed' && (
        <path
          d="M30 34 C30 18, 43 16, 48 16 C56 16, 66 20, 66 34 C62 27, 54 24, 48 24 C40 24, 33 28, 30 34 Z"
          fill="#211a15"
        />
      )}
      {characterId === 'ali' && (
        <path
          d="M29 35 C28 18, 40 13, 52 14 C63 15, 67 24, 66 35 C61 26, 51 23, 41 25 C35 26, 31 30, 29 35 Z"
          fill="#1b1613"
        />
      )}
      {characterId === 'mahmoud' && (
        <path
          d="M29 35 C29 19, 39 15, 48 15 C59 15, 67 21, 67 35 C63 29, 55 26, 48 26 C40 26, 33 29, 29 35 Z"
          fill="#171210"
        />
      )}

      {/* Eyebrows */}
      <path d="M35 36 Q40 34 44 36" fill="none" stroke="#1b1410" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M52 36 Q56 34 61 36" fill="none" stroke="#1b1410" strokeWidth="2.2" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="39.5" cy="41" rx="2.7" ry="2.2" fill="#ffffff" />
      <circle cx="39.5" cy="41" r="1.5" fill="#1e1510" />
      <ellipse cx="56.5" cy="41" rx="2.7" ry="2.2" fill="#ffffff" />
      <circle cx="56.5" cy="41" r="1.5" fill="#1e1510" />

      {/* Nose */}
      <path d="M48 40 L46.5 48 Q48 49.5 50.5 48" fill="none" stroke={skinShade} strokeWidth="2" strokeLinecap="round" />

      {/* Facial Hair & Mouth */}
      {def.hasMustache && (
        <path
          d="M41 52 Q48 49 55 52 Q52 54.5 48 53.5 Q44 54.5 41 52 Z"
          fill="#1b1410"
        />
      )}
      <path
        d="M43 56 Q48 58.5 53 56"
        fill="none"
        stroke="#7a3e2e"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {characterId === 'mahmoud' && (
        <path
          d="M36 55 Q48 66 60 55"
          fill="none"
          stroke="#1b1410"
          strokeOpacity="0.45"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};
