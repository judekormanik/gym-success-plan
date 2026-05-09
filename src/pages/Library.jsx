import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Search, Star, SlidersHorizontal, X, ArrowDownAZ, Sparkles, History,
} from 'lucide-react';
import {
  MUSCLE_GROUPS, EQUIPMENT_FILTERS, LEVEL_FILTERS, FORCE_FILTERS, MECHANIC_FILTERS,
} from '../utils/exerciseLibrary.js';
import useExerciseLibrary from '../hooks/useExerciseLibrary.js';
import useStore from '../store/useStore.js';
import ExerciseTile from '../components/ExerciseTile.jsx';
import ExerciseDetail from '../components/ExerciseDetail.jsx';

const SORTS = [
  { id: 'featured', label: 'Featured first' },
  { id: 'az',       label: 'A → Z' },
  { id: 'za',       label: 'Z → A' },
  { id: 'level',    label: 'Easiest first' },
];

export default function Library() {
  const navigate = useNavigate();
  const { ready, exercises } = useExerciseLibrary();
  const favorites = useStore((s) => s.favoriteIds);
  const sets = useStore((s) => s.sets);
  const customWorkouts = useStore((s) => s.customWorkouts);

  const [muscle, setMuscle] = useState('all');
  const [equipment, setEquipment] = useState('all');
  const [level, setLevel] = useState('all');
  const [force, setForce] = useState('all');
  const [mechanic, setMechanic] = useState('all');
  const [sort, setSort] = useState('featured');
  const [q, setQ] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let out = exercises.filter((e) => {
      if (muscle !== 'all' && e.muscle !== muscle) return false;
      if (equipment !== 'all' && e.equipment !== equipment) return false;
      if (level !== 'all' && e.level !== level) return false;
      if (force !== 'all' && e.force !== force) return false;
      if (mechanic !== 'all' && e.mechanic !== mechanic) return false;
      if (ql) {
        const hay = (e.name + ' ' + (e.primaryMuscles || []).join(' ') + ' ' + (e.equipment || '')).toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
    if (sort === 'az') out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'za') out = [...out].sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === 'level') {
      const order = { beginner: 0, intermediate: 1, expert: 2, null: 3 };
      out = [...out].sort((a, b) => (order[a.level] ?? 3) - (order[b.level] ?? 3));
    } else {
      // 'featured' — curated first, then alphabetical
      out = [...out].sort((a, b) => {
        if (a.curated && !b.curated) return -1;
        if (!a.curated && b.curated) return 1;
        return a.name.localeCompare(b.name);
      });
    }
    return out;
  }, [exercises, muscle, equipment, level, force, mechanic, sort, q]);

  // ── Section data ──
  const favSet = new Set(favorites);
  const myFavorites = useMemo(() => exercises.filter((e) => favSet.has(e.id)), [exercises, favorites]);

  const recentlyUsed = useMemo(() => {
    // Most recent unique exercise names from logged sets, mapped to exercises
    const seen = new Map();
    [...sets]
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .forEach((s) => {
        if (!seen.has(s.exercise_name)) {
          const ex = exercises.find((e) => e.name === s.exercise_name);
          if (ex) seen.set(s.exercise_name, ex);
        }
      });
    return Array.from(seen.values()).slice(0, 8);
  }, [sets, exercises]);

  const usedInCustom = useMemo(() => {
    const ids = new Set();
    customWorkouts.forEach((cw) => (cw.exercises || []).forEach((row) => ids.add(row.exerciseId)));
    return ids;
  }, [customWorkouts]);

  const relatedFinder = (ex) => exercises
    .filter((e) => e.id !== ex.id && e.muscle === ex.muscle && (e.equipment === ex.equipment || (ex.primaryMuscles || []).some((m) => (e.primaryMuscles || []).includes(m))))
    .slice(0, 8);

  const activeFilterCount =
    (muscle !== 'all' ? 1 : 0) + (equipment !== 'all' ? 1 : 0) +
    (level !== 'all' ? 1 : 0) + (force !== 'all' ? 1 : 0) + (mechanic !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setMuscle('all'); setEquipment('all'); setLevel('all'); setForce('all'); setMechanic('all');
  };

  return (
    <div className="fade-in">
      <div className="row gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ChevronLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div className="eyebrow">Library</div>
          <h1 className="h2" style={{ marginTop: 4 }}>Exercise library</h1>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
            {ready ? `${exercises.length} exercises · public-domain photos` : 'Loading library…'}
          </div>
        </div>
      </div>

      {/* Search + filter trigger */}
      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div className="row gap-2">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-mute)', pointerEvents: 'none',
            }} />
            <input
              className="input"
              placeholder={ready ? `Search ${exercises.length} exercises…` : 'Search…'}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ paddingLeft: 38, paddingRight: q ? 38 : 12 }}
            />
            {q && (
              <button onClick={() => setQ('')} className="icon-btn"
                style={{ position: 'absolute', right: 4, top: 4, width: 36, height: 36 }} aria-label="Clear">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={'btn ' + (filtersOpen || activeFilterCount > 0 ? 'btn-gold' : 'btn-quiet')}
            style={{ flexShrink: 0 }}
            aria-label="Filters"
          >
            <SlidersHorizontal size={14} />
            {activeFilterCount > 0 && (
              <span style={{
                background: '#0a0a0a', color: 'var(--gold)', borderRadius: 999,
                padding: '0 6px', fontSize: 11, fontWeight: 700,
              }}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {filtersOpen && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <FilterRow label="Muscle" value={muscle} onChange={setMuscle} options={MUSCLE_GROUPS} />
            <FilterRow label="Equipment" value={equipment} onChange={setEquipment} options={EQUIPMENT_FILTERS} />
            <FilterRow label="Level" value={level} onChange={setLevel} options={LEVEL_FILTERS} />
            <FilterRow label="Force" value={force} onChange={setForce} options={FORCE_FILTERS} />
            <FilterRow label="Mechanic" value={mechanic} onChange={setMechanic} options={MECHANIC_FILTERS} />
            <div className="row-between" style={{ marginTop: 12 }}>
              <button onClick={resetFilters} className="btn btn-ghost btn-sm">
                <X size={12} /> Reset
              </button>
              <div className="row gap-2">
                <ArrowDownAZ size={14} style={{ color: 'var(--text-mute)' }} />
                <select
                  className="select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  style={{ padding: '6px 10px', minHeight: 36, fontSize: 13 }}
                >
                  {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* My favorites */}
      {myFavorites.length > 0 && (
        <Section title="Favorites" icon={Star} count={myFavorites.length}>
          <Grid items={myFavorites} favorites={favSet} onPick={setSelected} />
        </Section>
      )}

      {/* Recently used */}
      {recentlyUsed.length > 0 && (
        <Section title="Recently used" icon={History} count={recentlyUsed.length}>
          <Grid items={recentlyUsed} favorites={favSet} onPick={setSelected} />
        </Section>
      )}

      {/* Featured (curated) — only show if user hasn't applied filters */}
      {muscle === 'all' && equipment === 'all' && level === 'all' && force === 'all' && mechanic === 'all' && q.trim() === '' && (
        <Section title="Featured" icon={Sparkles}
          subtitle="Hand-picked staples with extra detail">
          <Grid
            items={exercises.filter((e) => e.curated).slice(0, 12)}
            favorites={favSet}
            onPick={setSelected}
          />
        </Section>
      )}

      {/* All exercises */}
      <Section title={activeFilterCount > 0 || q ? 'Results' : 'All exercises'} count={filtered.length}>
        {filtered.length === 0 ? (
          <div className="card muted" style={{ padding: 32, textAlign: 'center' }}>
            No exercises match your filters.
          </div>
        ) : (
          <Grid items={filtered} favorites={favSet} usedSet={usedInCustom} onPick={setSelected} />
        )}
      </Section>

      {selected && (
        <ExerciseDetail
          exercise={selected}
          onClose={() => setSelected(null)}
          relatedFinder={relatedFinder}
          onPickRelated={(r) => setSelected(r)}
          onAddToWorkout={() => navigate('/workout/build', { state: { addExerciseId: selected.id } })}
        />
      )}
    </div>
  );
}

function Section({ title, subtitle, icon: Icon, count, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="row-between mb-4">
        <div className="row gap-2">
          {Icon && <Icon size={14} style={{ color: 'var(--gold)' }} />}
          <div className="eyebrow">{title}</div>
          {count != null && (
            <span className="muted mono" style={{ fontSize: 12 }}>· {count}</span>
          )}
        </div>
        {subtitle && <div className="muted" style={{ fontSize: 11 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Grid({ items, favorites, usedSet, onPick }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: 10,
    }}>
      {items.map((ex) => (
        <ExerciseTile
          key={ex.id}
          exercise={ex}
          size="md"
          showLevel
          favorited={favorites?.has(ex.id)}
          onClick={() => onPick(ex)}
        />
      ))}
    </div>
  );
}

function FilterRow({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="eyebrow" style={{ marginBottom: 6, fontSize: 10 }}>{label}</div>
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className="pill"
              style={{
                cursor: 'pointer',
                padding: '5px 12px', fontSize: 11,
                background: active ? 'var(--gold)' : 'var(--surface-2)',
                color: active ? '#0a0a0a' : 'var(--text-dim)',
                borderColor: active ? 'var(--gold)' : 'var(--border)',
                fontWeight: active ? 600 : 500,
              }}
            >{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}
