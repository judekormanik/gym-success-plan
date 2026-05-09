import { useState, useMemo } from 'react';
import { X, Plus, Star, Dumbbell, Activity, Layers, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore.js';
import { MUSCLE_ACCENTS } from '../utils/exerciseLibrary.js';

// Rich exercise detail modal — used by both Library and Builder picker.
// Props:
//   exercise:    the exercise object
//   onClose:     close the modal
//   onAddToWorkout: optional handler for "Add to a custom workout"
//   relatedFinder: optional fn(exercise) -> array of related exercises
export default function ExerciseDetail({ exercise, onClose, onAddToWorkout, relatedFinder, onPickRelated }) {
  const favorites = useStore((s) => s.favoriteIds);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const isFav = favorites.includes(exercise.id);
  const accent = MUSCLE_ACCENTS[exercise.muscle] || MUSCLE_ACCENTS.full;

  const images = [exercise.image, exercise.imageAlt].filter(Boolean);
  const [imgIdx, setImgIdx] = useState(0);

  const related = useMemo(() => (relatedFinder ? relatedFinder(exercise).slice(0, 4) : []), [exercise, relatedFinder]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="card slide-up" style={{
        width: '100%', maxWidth: 540, padding: 0, maxHeight: '92vh', overflow: 'auto',
      }}>
        {/* Image header */}
        <div style={{
          position: 'relative',
          aspectRatio: '16 / 10',
          background: images.length === 0
            ? `linear-gradient(135deg, hsla(${accent.hue},60%,30%,0.45), hsla(${accent.hue},60%,15%,0.85))`
            : '#0e0e0e',
          overflow: 'hidden',
        }}>
          {images.length > 0 ? (
            <img
              src={images[imgIdx]}
              alt={exercise.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9)' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: `hsla(${accent.hue},60%,75%,0.4)` }}>
              <Dumbbell size={64} strokeWidth={1.4} />
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)' }} />

          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i + images.length - 1) % images.length)}
                className="icon-btn"
                style={{
                  position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                }}
                aria-label="Previous image"
              ><ChevronLeft size={16} /></button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                className="icon-btn"
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                }}
                aria-label="Next image"
              ><ChevronRight size={16} /></button>
              <div style={{
                position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 4,
              }}>
                {images.map((_, i) => (
                  <div key={i} style={{
                    width: 18, height: 3, borderRadius: 2,
                    background: i === imgIdx ? 'var(--gold)' : 'rgba(255,255,255,0.35)',
                  }} />
                ))}
              </div>
            </>
          )}

          {/* Top-right controls */}
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
            <button
              onClick={() => toggleFavorite(exercise.id)}
              className="icon-btn"
              style={{
                width: 36, height: 36,
                background: isFav ? 'var(--gold)' : 'rgba(0,0,0,0.55)',
                color: isFav ? '#0a0a0a' : '#fff',
                backdropFilter: 'blur(4px)',
              }}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={16} fill={isFav ? '#0a0a0a' : 'transparent'} />
            </button>
            <button
              onClick={onClose}
              className="icon-btn"
              style={{
                width: 36, height: 36,
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                backdropFilter: 'blur(4px)',
              }}
              aria-label="Close"
            ><X size={16} /></button>
          </div>

          {/* Bottom-left muscle pill */}
          <div style={{
            position: 'absolute', left: 16, bottom: 16,
            color: '#fff',
          }}>
            <div className="pill gold" style={{ padding: '4px 10px', marginBottom: 8 }}>
              {accent.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}>{exercise.name}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 18 }}>
          {/* Taxonomy badges */}
          <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {exercise.equipment && <Tag icon={Dumbbell}>{exercise.equipment}</Tag>}
            {exercise.level && <Tag icon={Target}>{exercise.level}</Tag>}
            {exercise.force && <Tag icon={Activity}>{exercise.force}</Tag>}
            {exercise.mechanic && <Tag icon={Layers}>{exercise.mechanic}</Tag>}
          </div>

          {/* Muscles worked */}
          {(exercise.primaryMuscles?.length || exercise.secondaryMuscles?.length) && (
            <div style={{ marginBottom: 16 }}>
              <div className="eyebrow mb-2">Muscles worked</div>
              <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                {(exercise.primaryMuscles || []).map((m) => (
                  <span key={m} className="pill gold" style={{ padding: '3px 9px', fontSize: 11 }}>{m}</span>
                ))}
                {(exercise.secondaryMuscles || []).map((m) => (
                  <span key={m} className="pill" style={{ padding: '3px 9px', fontSize: 11 }}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="eyebrow mb-2">How to do it</div>
              <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div className="eyebrow mb-2">Similar exercises</div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(related.length, 4)}, 1fr)`,
                gap: 8,
              }}>
                {related.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onPickRelated?.(r)}
                    style={{
                      padding: 10, background: 'var(--surface-2)',
                      border: '1px solid var(--border)', borderRadius: 10,
                      textAlign: 'left', cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{r.name}</div>
                    <div className="muted" style={{ fontSize: 10, marginTop: 4, textTransform: 'capitalize' }}>{r.muscle}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {onAddToWorkout && (
            <button onClick={onAddToWorkout} className="btn btn-gold btn-block btn-lg">
              <Plus size={16} /> Add to a custom workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Tag({ icon: Icon, children }) {
  return (
    <span className="row gap-2" style={{
      padding: '4px 10px', borderRadius: 999,
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      fontSize: 11, color: 'var(--text-dim)',
      textTransform: 'capitalize',
    }}>
      <Icon size={12} /> {children}
    </span>
  );
}
