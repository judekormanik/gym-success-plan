import { useState } from 'react';
import { Plus, Trash2, UtensilsCrossed, BookmarkPlus } from 'lucide-react';
import useNutrition from '../hooks/useNutrition.js';
import MacroRings from '../components/MacroRings.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FoodSearch from '../components/FoodSearch.jsx';
import useStore from '../store/useStore.js';
import { formatRelative } from '../utils/calculations.js';

const SAVED_MEALS = [
  { name: 'Greek yogurt + berries', calories: 240, protein: 22, carbs: 28, fats: 4 },
  { name: 'Chicken bowl', calories: 620, protein: 55, carbs: 60, fats: 18 },
  { name: 'Eggs + toast', calories: 420, protein: 28, carbs: 30, fats: 20 },
  { name: 'Whey shake', calories: 180, protein: 30, carbs: 6, fats: 3 },
];

export default function NutritionPage() {
  const { totals, targets, todays, logFood, removeFood } = useNutrition();
  const profile = useStore((s) => s.profile);
  const pushToast = useStore((s) => s.pushToast);

  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '' });

  const submit = () => {
    if (!form.name || !form.calories) {
      pushToast('Add a name and calories', 'error');
      return;
    }
    logFood(form);
    setForm({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    pushToast('Logged', 'success');
  };

  return (
    <div className="fade-in">
      <div className="row-between mb-6">
        <div>
          <div className="eyebrow">Nutrition</div>
          <h1 className="h2" style={{ marginTop: 6 }}>Today's intake</h1>
        </div>
      </div>

      <div className="card-row cols-2 mb-6" style={{ alignItems: 'stretch' }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="row-between mb-4">
            <div>
              <div className="eyebrow">Calorie target</div>
              <div className="h2 mono" style={{ marginTop: 4 }}>
                {Math.round(totals.calories)}<span className="muted" style={{ fontSize: 16 }}> / {targets.calories || '—'} kcal</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Goal: {profile?.goal || 'set in profile'} · BMR {profile?.bmr || '—'}
              </div>
            </div>
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
      </div>

      <div className="card mb-6" style={{ padding: 20 }}>
        <div className="eyebrow mb-4">Search foods · or scan a barcode</div>
        <FoodSearch
          onPick={(food) => {
            logFood({
              name: food.food_name,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fats: food.fats,
            });
            pushToast('Logged', 'success');
          }}
        />
      </div>

      <div className="card-row cols-2 mb-6">
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
            <button className="btn btn-gold" onClick={submit}><Plus size={14} /> Add</button>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow mb-4">Saved meals</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SAVED_MEALS.map((m) => (
              <button
                key={m.name}
                onClick={() => { logFood(m); pushToast(`Logged ${m.name}`, 'success'); }}
                className="row-between"
                style={{ padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 10, textAlign: 'left' }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{m.name}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{m.calories} kcal · {m.protein}P {m.carbs}C {m.fats}F</div>
                </div>
                <BookmarkPlus size={16} style={{ color: 'var(--text-mute)' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div className="eyebrow mb-4">Today's log</div>
        {todays.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {todays.map((e) => (
              <div key={e.id} className="row-between" style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{e.food_name}</div>
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
          <EmptyState icon={UtensilsCrossed} title="Nothing logged yet" body="Add your first meal of the day above." />
        )}
      </div>
    </div>
  );
}
