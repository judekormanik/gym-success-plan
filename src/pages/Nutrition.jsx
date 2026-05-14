import { useMemo, useState } from 'react';
import {
  Plus, Trash2, UtensilsCrossed, Coffee, Utensils, Moon, Cookie,
  ChevronLeft, ChevronRight, Repeat, ChevronDown, ChevronUp, Calendar,
} from 'lucide-react';
import MacroRings from '../components/MacroRings.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FoodSearch from '../components/FoodSearch.jsx';
import WaterTracker from '../components/WaterTracker.jsx';
import useStore from '../store/useStore.js';
import useNutrition from '../hooks/useNutrition.js';
import { dateKey, formatRelative, sumMacros } from '../utils/calculations.js';
import { GENERIC_FOODS, PORTIONS, scaleFood } from '../utils/genericFoods.js';

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', Icon: Coffee },
  { id: 'lunch',     label: 'Lunch',     Icon: Utensils },
  { id: 'dinner',    label: 'Dinner',    Icon: Moon },
  { id: 'snack',     label: 'Snacks',    Icon: Cookie },
];

function defaultMealForNow(d = new Date()) {
  const h = d.getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function prettyDate(d, todayKey) {
  const k = dateKey(d);
  const y = dateKey(addDays(new Date(), -1));
  if (k === todayKey) return 'Today';
  if (k === y) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function NutritionPage() {
  const { targets, logFood, removeFood, allEntries } = useNutrition();
  const profile = useStore((s) => s.profile);
  const pushToast = useStore((s) => s.pushToast);

  const todayKey = dateKey();
  const [activeDateKey, setActiveDateKey] = useState(todayKey);
  const [activeMeal, setActiveMeal] = useState(defaultMealForNow());
  const [customOpen, setCustomOpen] = useState(false);
  const [portion, setPortion] = useState('m');
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '' });

  const activeDate = useMemo(() => new Date(activeDateKey + 'T12:00:00'), [activeDateKey]);
  const isToday = activeDateKey === todayKey;

  // Entries for the active date
  const dayEntries = useMemo(
    () => allEntries.filter((e) => dateKey(new Date(e.logged_at)) === activeDateKey),
    [allEntries, activeDateKey]
  );
  const dayTotals = useMemo(() => sumMacros(dayEntries), [dayEntries]);

  // Group entries by meal type for the active date
  const buckets = useMemo(() => {
    const out = { breakfast: [], lunch: [], dinner: [], snack: [] };
    dayEntries.forEach((e) => {
      const k = MEALS.find((m) => m.id === e.meal_type) ? e.meal_type : 'snack';
      out[k].push(e);
    });
    return out;
  }, [dayEntries]);

  const portionFactor = PORTIONS.find((p) => p.id === portion)?.factor || 1;

  const quickLog = (food) => {
    const scaled = scaleFood(food, portionFactor);
    logFood({
      name: scaled.food_name,
      calories: scaled.calories,
      protein: scaled.protein,
      carbs: scaled.carbs,
      fats: scaled.fats,
      meal_type: activeMeal,
    });
    pushToast(`+ ${scaled.calories} kcal`, 'success');
  };

  const customSubmit = () => {
    if (!form.name || !form.calories) {
      pushToast('Add a name and calories', 'error');
      return;
    }
    logFood({ ...form, meal_type: activeMeal });
    setForm({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    pushToast('Logged', 'success');
  };

  const handleSearchPick = (food) => {
    logFood({ ...food, meal_type: activeMeal });
    pushToast(`Logged to ${activeMeal}`, 'success');
  };

  const repeatYesterday = () => {
    const ydayKey = dateKey(addDays(new Date(), -1));
    const ydayEntries = allEntries.filter((e) => dateKey(new Date(e.logged_at)) === ydayKey);
    if (ydayEntries.length === 0) {
      pushToast('Nothing logged yesterday to repeat', 'error');
      return;
    }
    let count = 0;
    ydayEntries.forEach((e) => {
      logFood({
        name: e.food_name,
        calories: e.calories,
        protein: e.protein,
        carbs: e.carbs,
        fats: e.fats,
        meal_type: e.meal_type || 'snack',
      });
      count++;
    });
    pushToast(`Re-logged ${count} item${count === 1 ? '' : 's'} from yesterday`, 'success');
  };

  return (
    <div className="fade-in">
      <div className="row-between mb-6">
        <div>
          <div className="eyebrow">Nutrition</div>
          <h1 className="h2" style={{ marginTop: 6 }}>Daily intake</h1>
        </div>
      </div>

      {/* Date navigator */}
      <div className="card mb-4" style={{ padding: 12 }}>
        <div className="row-between">
          <button
            onClick={() => setActiveDateKey(dateKey(addDays(activeDate, -1)))}
            className="icon-btn"
            aria-label="Previous day"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="row gap-2">
            <Calendar size={14} style={{ color: 'var(--gold)' }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>{prettyDate(activeDate, todayKey)}</span>
            {!isToday && (
              <button
                onClick={() => setActiveDateKey(todayKey)}
                className="pill"
                style={{ padding: '2px 10px', fontSize: 11, cursor: 'pointer' }}
              >Jump to today</button>
            )}
          </div>
          <button
            onClick={() => {
              const next = dateKey(addDays(activeDate, 1));
              if (next > todayKey) return; // don't navigate into the future
              setActiveDateKey(next);
            }}
            className="icon-btn"
            disabled={isToday}
            style={{ opacity: isToday ? 0.4 : 1 }}
            aria-label="Next day"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day summary cards */}
      <div className="card-row cols-3 mb-6" style={{ alignItems: 'stretch' }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow mb-2">Calories</div>
          <div className="h2 mono" style={{ marginTop: 4 }}>
            {Math.round(dayTotals.calories)}
            <span className="muted" style={{ fontSize: 16 }}> / {targets.calories || '—'}</span>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            {isToday ? `Goal: ${profile?.goal || '—'}` : prettyDate(activeDate, todayKey)}
          </div>
          <div style={{ height: 6, background: '#0e0e0e', borderRadius: 999, overflow: 'hidden', marginTop: 14 }}>
            <div style={{
              width: `${Math.min(100, targets.calories ? (dayTotals.calories / targets.calories) * 100 : 0)}%`,
              height: '100%', background: 'var(--gold)', transition: 'width 400ms',
            }} />
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow mb-4">Macros</div>
          <MacroRings totals={dayTotals} targets={targets} />
        </div>

        {/* Water — only shown for today; historical view is calorie-focused */}
        {isToday ? <WaterTracker /> : (
          <div className="card" style={{ padding: 22 }}>
            <div className="eyebrow mb-2">Items logged</div>
            <div className="h2 mono" style={{ marginTop: 4 }}>{dayEntries.length}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              {dayEntries.length === 0 ? 'Nothing on this day' : `${MEALS.filter((m) => buckets[m.id].length).length} meals`}
            </div>
          </div>
        )}
      </div>

      {/* Repeat-from-yesterday — only visible today */}
      {isToday && (
        <div className="row gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
          <button onClick={repeatYesterday} className="btn btn-ghost btn-sm">
            <Repeat size={14} /> Repeat yesterday's log
          </button>
        </div>
      )}

      {/* Meal tabs */}
      <div className="row" style={{ gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {MEALS.map((m) => {
          const subtotal = sumMacros(buckets[m.id] || []);
          const active = activeMeal === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMeal(m.id)}
              className="row gap-2"
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: active ? 'var(--gold)' : 'var(--surface-2)',
                color: active ? '#0a0a0a' : 'var(--text-dim)',
                border: '1px solid ' + (active ? 'var(--gold)' : 'var(--border)'),
                fontWeight: active ? 600 : 500,
                fontSize: 13,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <m.Icon size={14} />
              {m.label}
              {(buckets[m.id]?.length || 0) > 0 && (
                <span className="mono" style={{ opacity: 0.8, fontSize: 11 }}>
                  · {Math.round(subtotal.calories)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* QUICK LOG — only on today */}
      {isToday && (
        <div className="card mb-4" style={{ padding: 18 }}>
          <div className="row-between mb-4" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="eyebrow">Quick log</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Just tap. Don't overthink it.
              </div>
            </div>
            {/* Portion picker */}
            <div className="row" style={{ gap: 4 }}>
              {PORTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPortion(p.id)}
                  className="pill"
                  title={`${p.label} portion · ×${p.factor}`}
                  style={{
                    cursor: 'pointer', padding: '5px 12px', fontSize: 11,
                    background: portion === p.id ? 'var(--gold)' : 'var(--surface-2)',
                    color: portion === p.id ? '#0a0a0a' : 'var(--text-dim)',
                    borderColor: portion === p.id ? 'var(--gold)' : 'var(--border)',
                    fontWeight: portion === p.id ? 700 : 500,
                  }}
                >{p.label}</button>
              ))}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 8,
          }}>
            {GENERIC_FOODS.map((f) => {
              const scaled = scaleFood(f, portionFactor);
              return (
                <button
                  key={f.id}
                  onClick={() => quickLog(f)}
                  className="card hover"
                  style={{
                    padding: 12, textAlign: 'left', cursor: 'pointer',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    minHeight: 86,
                  }}
                >
                  <div className="row-between">
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{f.emoji}</span>
                    <span className="mono muted" style={{ fontSize: 11 }}>{scaled.calories} kcal</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>{f.name}</div>
                  <div className="muted mono" style={{ fontSize: 10 }}>
                    {scaled.protein}P · {scaled.carbs}C · {scaled.fats}F
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom entry — collapsed by default */}
          <button
            onClick={() => setCustomOpen((v) => !v)}
            className="row gap-2 mt-4"
            style={{
              padding: '10px 12px', borderRadius: 10,
              background: 'transparent', border: '1px dashed var(--border-strong)',
              color: 'var(--text-dim)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', width: '100%', justifyContent: 'center',
            }}
          >
            {customOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {customOpen ? 'Hide custom entry' : "Don't see it? Add custom"}
          </button>

          {customOpen && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                className="input"
                placeholder="What did you eat?"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                <input className="input" inputMode="numeric" placeholder="kcal" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
                <input className="input" inputMode="numeric" placeholder="P (opt)" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
                <input className="input" inputMode="numeric" placeholder="C (opt)" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
                <input className="input" inputMode="numeric" placeholder="F (opt)" value={form.fats} onChange={(e) => setForm({ ...form, fats: e.target.value })} />
              </div>
              <div className="muted" style={{ fontSize: 11 }}>
                Only the name and calories are required. Macros are optional — guesses are fine.
              </div>
              <button className="btn btn-gold" onClick={customSubmit}>
                <Plus size={14} /> Add to {MEALS.find((m) => m.id === activeMeal)?.label.toLowerCase()}
              </button>
              <button
                onClick={() => setCustomOpen('search')}
                className="btn btn-quiet"
                style={{ marginTop: 4 }}
              >
                Or search the full food database
              </button>
            </div>
          )}

          {customOpen === 'search' && (
            <div style={{ marginTop: 12 }}>
              <FoodSearch onPick={handleSearchPick} />
            </div>
          )}
        </div>
      )}

      {/* Active meal log */}
      <div className="card" style={{ padding: 20 }}>
        <div className="row-between mb-4">
          <div className="eyebrow">
            {MEALS.find((m) => m.id === activeMeal)?.label}
            {!isToday && ` · ${prettyDate(activeDate, todayKey)}`}
          </div>
          {(buckets[activeMeal]?.length || 0) > 0 && (
            <span className="mono muted" style={{ fontSize: 12 }}>
              {Math.round(sumMacros(buckets[activeMeal]).calories)} kcal · {Math.round(sumMacros(buckets[activeMeal]).protein)}P
            </span>
          )}
        </div>
        {(buckets[activeMeal]?.length || 0) > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {buckets[activeMeal].map((e) => (
              <div key={e.id} className="row-between" style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.food_name}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{formatRelative(e.logged_at)} · {e.protein}P {e.carbs}C {e.fats}F</div>
                </div>
                <div className="row gap-2">
                  <span className="mono" style={{ fontWeight: 600 }}>{e.calories}</span>
                  <button onClick={() => removeFood(e.id)} className="muted" style={{ padding: 6 }} aria-label="Remove"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UtensilsCrossed}
            title="Nothing here yet"
            body={isToday ? `Tap any item above to add to ${MEALS.find((m) => m.id === activeMeal)?.label.toLowerCase()}.` : 'No entries for this meal on this day.'}
          />
        )}
      </div>
    </div>
  );
}
