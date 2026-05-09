import { useMemo, useState } from 'react';
import { Plus, Trash2, UtensilsCrossed, Coffee, Utensils, Moon, Cookie } from 'lucide-react';
import useNutrition from '../hooks/useNutrition.js';
import MacroRings from '../components/MacroRings.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FoodSearch from '../components/FoodSearch.jsx';
import WaterTracker from '../components/WaterTracker.jsx';
import useStore from '../store/useStore.js';
import { dateKey, formatRelative, sumMacros } from '../utils/calculations.js';

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

export default function NutritionPage() {
  const { totals, targets, todays, logFood, removeFood } = useNutrition();
  const profile = useStore((s) => s.profile);
  const pushToast = useStore((s) => s.pushToast);

  const [activeMeal, setActiveMeal] = useState(defaultMealForNow());
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '' });

  // Group today's entries by meal type. Items without meal_type land under "snack"
  // for legacy compatibility.
  const buckets = useMemo(() => {
    const out = { breakfast: [], lunch: [], dinner: [], snack: [] };
    todays.forEach((e) => {
      const k = MEALS.find((m) => m.id === e.meal_type) ? e.meal_type : 'snack';
      out[k].push(e);
    });
    return out;
  }, [todays]);

  const submit = () => {
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

  return (
    <div className="fade-in">
      <div className="row-between mb-6">
        <div>
          <div className="eyebrow">Nutrition</div>
          <h1 className="h2" style={{ marginTop: 6 }}>Today's intake</h1>
        </div>
      </div>

      <div className="card-row cols-3 mb-6" style={{ alignItems: 'stretch' }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow mb-2">Calorie target</div>
          <div className="h2 mono" style={{ marginTop: 4 }}>
            {Math.round(totals.calories)}
            <span className="muted" style={{ fontSize: 16 }}> / {targets.calories || '—'} kcal</span>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            Goal: {profile?.goal || '—'} · BMR {profile?.bmr || '—'}
          </div>
          <div style={{ height: 6, background: '#0e0e0e', borderRadius: 999, overflow: 'hidden', marginTop: 16 }}>
            <div style={{
              width: `${Math.min(100, targets.calories ? (totals.calories / targets.calories) * 100 : 0)}%`,
              height: '100%', background: 'var(--gold)', transition: 'width 400ms',
            }} />
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow mb-4">Macros</div>
          <MacroRings totals={totals} targets={targets} />
        </div>

        <WaterTracker />
      </div>

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
                  · {Math.round(subtotal.calories)} kcal
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="card-row cols-2 mb-6">
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow mb-4">Search foods · or scan a barcode</div>
          <FoodSearch onPick={handleSearchPick} />
          <div className="muted" style={{ fontSize: 11, marginTop: 10 }}>
            Adding to: <b style={{ color: 'var(--gold)' }}>{MEALS.find((m) => m.id === activeMeal)?.label}</b>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow mb-4">Quick log (custom)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" placeholder="Food name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              <input className="input" inputMode="numeric" placeholder="kcal" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
              <input className="input" inputMode="numeric" placeholder="P" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
              <input className="input" inputMode="numeric" placeholder="C" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
              <input className="input" inputMode="numeric" placeholder="F" value={form.fats} onChange={(e) => setForm({ ...form, fats: e.target.value })} />
            </div>
            <button className="btn btn-gold" onClick={submit}>
              <Plus size={14} /> Add to {MEALS.find((m) => m.id === activeMeal)?.label.toLowerCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Active meal log */}
      <div className="card" style={{ padding: 20 }}>
        <div className="row-between mb-4">
          <div className="eyebrow">{MEALS.find((m) => m.id === activeMeal)?.label} · today</div>
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
                  <span className="mono" style={{ fontWeight: 600 }}>{e.calories} kcal</span>
                  <button onClick={() => removeFood(e.id)} className="muted" style={{ padding: 6 }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={UtensilsCrossed} title="Nothing here yet" body={`Search or quick-log to add to ${MEALS.find((m) => m.id === activeMeal)?.label.toLowerCase()}.`} />
        )}
      </div>
    </div>
  );
}
