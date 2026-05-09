import { useState } from 'react';
import { Dumbbell, Star } from 'lucide-react';
import { MUSCLE_ACCENTS } from '../utils/exerciseLibrary.js';

// Polished tile that shows a public-domain image when available, with a
// styled gradient fallback if it fails or doesn't exist.
export default function ExerciseTile({ exercise, size = 'md', onClick, selected, favorited, showLevel }) {
  const [errored, setErrored] = useState(false);
  const accent = MUSCLE_ACCENTS[exercise.muscle] || MUSCLE_ACCENTS.full;

  const wrap = {
    sm: { aspectRatio: '4 / 3', borderRadius: 12 },
    md: { aspectRatio: '4 / 3', borderRadius: 14 },
    lg: { aspectRatio: '16 / 10', borderRadius: 16 },
  }[size];

  const showImg = exercise.image && !errored;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        ...wrap,
        overflow: 'hidden',
        background: showImg
          ? '#0e0e0e'
          : `linear-gradient(135deg, hsla(${accent.hue},60%,30%,0.45), hsla(${accent.hue},60%,15%,0.85)), var(--surface)`,
        border: '1px solid ' + (selected ? 'var(--gold)' : 'var(--border)'),
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left',
        padding: 0,
      }}
    >
      {showImg ? (
        <img
          src={exercise.image}
          alt={exercise.name}
          loading="lazy"
          onError={() => setErrored(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: 0.85, filter: 'contrast(1.05) brightness(0.92)',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid', placeItems: 'center',
          color: `hsla(${accent.hue},60%,75%,0.3)`,
        }}>
          <Dumbbell size={48} strokeWidth={1.4} />
        </div>
      )}

      {/* Gradient overlay for text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Top-left muscle pill */}
      <div style={{
        position: 'absolute', top: 8, left: 8,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        color: '#fff',
        fontSize: 10, fontWeight: 600,
        padding: '4px 8px', borderRadius: 999,
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {accent.label}
      </div>

      {/* Top-right favorite + level badges */}
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
        {showLevel && exercise.level && (
          <div style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            color: '#fff', fontSize: 9, fontWeight: 600,
            padding: '3px 7px', borderRadius: 999,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>{exercise.level === 'expert' ? 'Adv' : exercise.level === 'intermediate' ? 'Inter' : 'Begin'}</div>
        )}
        {favorited && (
          <div style={{
            background: 'var(--gold)', color: '#0a0a0a',
            width: 22, height: 22, borderRadius: 99,
            display: 'grid', placeItems: 'center',
          }}>
            <Star size={12} fill="#0a0a0a" />
          </div>
        )}
      </div>

      {/* Bottom title */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 10,
        color: '#fff', fontWeight: 600,
        fontSize: size === 'sm' ? 13 : 14,
        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
      }}>
        {exercise.name}
      </div>
    </button>
  );
}
