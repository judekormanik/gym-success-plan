import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { calcStreak } from '../utils/calculations.js';

const LS_QUEUE = 'gsp_sync_queue';
const LS_LOCAL = 'gsp_local_data';

const localData = () => {
  try { return JSON.parse(localStorage.getItem(LS_LOCAL)) || {}; }
  catch { return {}; }
};
const writeLocal = (data) => {
  try { localStorage.setItem(LS_LOCAL, JSON.stringify(data)); } catch {}
};

const queue = () => {
  try { return JSON.parse(localStorage.getItem(LS_QUEUE)) || []; }
  catch { return []; }
};
const writeQueue = (q) => {
  try { localStorage.setItem(LS_QUEUE, JSON.stringify(q)); } catch {}
};

const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2);

const useStore = create(
  persist(
    (set, get) => ({
      // ---- Auth / profile ----
      user: null,
      profile: null,
      session: null,
      syncing: false,
      lastSyncedAt: null,
      online: typeof navigator === 'undefined' ? true : navigator.onLine,

      // ---- Domain data (kept in memory, mirrored to localStorage and supabase) ----
      workouts: [],
      sets: [],
      personalRecords: [],
      bodyWeight: [],
      nutrition: [],
      posts: [],
      comments: {},
      photos: [],

      // ---- Toasts ----
      toasts: [],

      // ---- PR celebration ----
      prCelebration: null,

      // ---- PWA install ----
      installPromptEvent: null,
      pwaInstalled: false,
      installBannerDismissed: false,

      // ============================================================
      // Toasts
      // ============================================================
      pushToast: (text, type = 'default') => {
        const id = newId();
        set((s) => ({ toasts: [...s.toasts, { id, text, type }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // ============================================================
      // Session
      // ============================================================
      initSession: async () => {
        const local = localData();
        set({
          workouts: local.workouts || [],
          sets: local.sets || [],
          personalRecords: local.personalRecords || [],
          bodyWeight: local.bodyWeight || [],
          nutrition: local.nutrition || [],
          posts: local.posts || seedPosts(),
          comments: local.comments || {},
          photos: local.photos || [],
          pwaInstalled: localStorage.getItem('pwa_installed') === 'true',
          installBannerDismissed: localStorage.getItem('install_banner_dismissed') === 'true',
        });

        if (!isSupabaseConfigured) {
          // Demo mode: hydrate a guest profile if one was created locally
          const stored = localData();
          if (stored.profile) set({ user: { id: 'guest', email: stored.profile.email || 'guest@local' }, profile: stored.profile });
          return;
        }

        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          set({ user: data.session.user, session: data.session });
          await get().loadAllData();
        }
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            set({ user: session.user, session });
            await get().loadAllData();
          } else {
            set({ user: null, profile: null, session: null });
          }
        });
      },

      signInWithEmail: async (email, password) => {
        if (!isSupabaseConfigured) {
          const profile = { ...(localData().profile || {}), email, onboarded: !!localData().profile?.onboarded };
          writeLocal({ ...localData(), profile });
          set({ user: { id: 'guest', email }, profile });
          return { ok: true };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { ok: false, error: error.message };
        set({ user: data.user, session: data.session });
        await get().loadAllData();
        return { ok: true };
      },

      signUpWithEmail: async (email, password) => {
        if (!isSupabaseConfigured) {
          const profile = { email, onboarded: false };
          writeLocal({ ...localData(), profile });
          set({ user: { id: 'guest', email }, profile });
          return { ok: true };
        }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { ok: false, error: error.message };
        set({ user: data.user, session: data.session, profile: { email, onboarded: false } });
        return { ok: true };
      },

      signInWithMagicLink: async (email) => {
        if (!isSupabaseConfigured) {
          return get().signInWithEmail(email, 'demo');
        }
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },

      signOut: async () => {
        if (isSupabaseConfigured) await supabase.auth.signOut();
        set({ user: null, profile: null, session: null });
      },

      // ============================================================
      // Profile
      // ============================================================
      saveProfile: async (patch) => {
        const next = { ...(get().profile || {}), ...patch };
        set({ profile: next });
        const local = { ...localData(), profile: next };
        writeLocal(local);

        if (!isSupabaseConfigured || !get().user) return;
        set({ syncing: true });
        const { error } = await supabase
          .from('users')
          .upsert({ id: get().user.id, email: get().user.email, ...next })
          .select();
        set({ syncing: false, lastSyncedAt: new Date().toISOString() });
        if (error) get().queueChange({ table: 'users', op: 'upsert', payload: { id: get().user.id, ...next } });
      },

      loadAllData: async () => {
        if (!isSupabaseConfigured || !get().user) return;
        const uid = get().user.id;
        set({ syncing: true });
        const [profileRes, workoutRes, setsRes, prRes, bwRes, nutritionRes, postsRes, photosRes] = await Promise.all([
          supabase.from('users').select('*').eq('id', uid).maybeSingle(),
          supabase.from('workouts').select('*').eq('user_id', uid).order('completed_at', { ascending: false }),
          supabase.from('sets').select('*').eq('workout_id', null).limit(0), // placeholder
          supabase.from('personal_records').select('*').eq('user_id', uid),
          supabase.from('body_weight_log').select('*').eq('user_id', uid).order('logged_at', { ascending: false }),
          supabase.from('nutrition_log').select('*').eq('user_id', uid).order('logged_at', { ascending: false }),
          supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('progress_photos').select('*').eq('user_id', uid).order('taken_at', { ascending: false }),
        ]);
        set({
          profile: profileRes.data || get().profile,
          workouts: workoutRes.data || [],
          personalRecords: prRes.data || [],
          bodyWeight: bwRes.data || [],
          nutrition: nutritionRes.data || [],
          posts: postsRes.data?.length ? postsRes.data : get().posts,
          photos: photosRes.data || [],
          syncing: false,
          lastSyncedAt: new Date().toISOString(),
        });
      },

      // ============================================================
      // Workouts
      // ============================================================
      saveWorkout: async ({ dayNumber, dayName, durationMinutes, notes, sets }) => {
        const id = newId();
        const completedAt = new Date().toISOString();
        const workout = {
          id, user_id: get().user?.id || 'guest',
          day_number: dayNumber, day_name: dayName,
          completed_at: completedAt, duration_minutes: durationMinutes, notes: notes || '',
        };
        const setRows = sets.map((s, i) => ({
          id: newId(), workout_id: id,
          exercise_name: s.exercise, set_number: s.setNumber || i + 1,
          weight: Number(s.weight) || 0, reps: Number(s.reps) || 0,
          is_drop_set: !!s.isDropSet, is_pr: !!s.isPR,
          completed_at: completedAt,
        }));

        set((st) => ({
          workouts: [workout, ...st.workouts],
          sets: [...setRows, ...st.sets],
        }));
        const local = { ...localData(), workouts: [workout, ...(localData().workouts || [])], sets: [...setRows, ...(localData().sets || [])] };
        writeLocal(local);

        // Update streak
        const streak = calcStreak([workout, ...get().workouts]);
        get().saveProfile({
          current_streak: streak.current,
          longest_streak: Math.max(streak.longest, get().profile?.longest_streak || 0),
          last_workout_date: completedAt.slice(0, 10),
        });

        if (!isSupabaseConfigured || !get().user) return;
        set({ syncing: true });
        const w = await supabase.from('workouts').insert(workout);
        const s = await supabase.from('sets').insert(setRows);
        set({ syncing: false, lastSyncedAt: new Date().toISOString() });
        if (w.error) get().queueChange({ table: 'workouts', op: 'insert', payload: workout });
        if (s.error) get().queueChange({ table: 'sets', op: 'insert', payload: setRows });
      },

      logPR: async (pr) => {
        const row = { id: newId(), user_id: get().user?.id || 'guest', ...pr, achieved_at: new Date().toISOString() };
        set((s) => ({ personalRecords: [row, ...s.personalRecords] }));
        writeLocal({ ...localData(), personalRecords: [row, ...(localData().personalRecords || [])] });
        set({ prCelebration: row });
        setTimeout(() => set({ prCelebration: null }), 3500);

        if (!isSupabaseConfigured || !get().user) return;
        const { error } = await supabase.from('personal_records').insert(row);
        if (error) get().queueChange({ table: 'personal_records', op: 'insert', payload: row });
      },

      logBodyWeight: async (weight) => {
        const row = { id: newId(), user_id: get().user?.id || 'guest', weight: Number(weight), logged_at: new Date().toISOString() };
        set((s) => ({ bodyWeight: [row, ...s.bodyWeight] }));
        writeLocal({ ...localData(), bodyWeight: [row, ...(localData().bodyWeight || [])] });
        if (!isSupabaseConfigured || !get().user) return;
        const { error } = await supabase.from('body_weight_log').insert(row);
        if (error) get().queueChange({ table: 'body_weight_log', op: 'insert', payload: row });
      },

      // ============================================================
      // Nutrition
      // ============================================================
      logFood: async (food) => {
        const row = {
          id: newId(),
          user_id: get().user?.id || 'guest',
          food_name: food.name,
          calories: Number(food.calories) || 0,
          protein: Number(food.protein) || 0,
          carbs: Number(food.carbs) || 0,
          fats: Number(food.fats) || 0,
          logged_at: new Date().toISOString(),
        };
        set((s) => ({ nutrition: [row, ...s.nutrition] }));
        writeLocal({ ...localData(), nutrition: [row, ...(localData().nutrition || [])] });
        if (!isSupabaseConfigured || !get().user) return;
        const { error } = await supabase.from('nutrition_log').insert(row);
        if (error) get().queueChange({ table: 'nutrition_log', op: 'insert', payload: row });
      },
      removeFood: async (id) => {
        set((s) => ({ nutrition: s.nutrition.filter((n) => n.id !== id) }));
        writeLocal({ ...localData(), nutrition: (localData().nutrition || []).filter((n) => n.id !== id) });
        if (!isSupabaseConfigured) return;
        await supabase.from('nutrition_log').delete().eq('id', id);
      },

      // ============================================================
      // Community
      // ============================================================
      addPost: async (content) => {
        const row = {
          id: newId(),
          user_id: get().user?.id || 'guest',
          user_name: get().profile?.name || 'Member',
          content,
          likes: 0,
          created_at: new Date().toISOString(),
        };
        set((s) => ({ posts: [row, ...s.posts] }));
        writeLocal({ ...localData(), posts: [row, ...(localData().posts || [])] });
        if (!isSupabaseConfigured) return;
        const { error } = await supabase.from('community_posts').insert(row);
        if (error) get().queueChange({ table: 'community_posts', op: 'insert', payload: row });
      },
      likePost: (id) => {
        set((s) => ({ posts: s.posts.map((p) => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p) }));
        if (isSupabaseConfigured) {
          const post = get().posts.find((p) => p.id === id);
          supabase.from('community_posts').update({ likes: post?.likes }).eq('id', id);
        }
      },
      addComment: async (postId, content) => {
        const row = {
          id: newId(), post_id: postId,
          user_id: get().user?.id || 'guest',
          user_name: get().profile?.name || 'Member',
          content, created_at: new Date().toISOString(),
        };
        set((s) => ({ comments: { ...s.comments, [postId]: [...(s.comments[postId] || []), row] } }));
        writeLocal({ ...localData(), comments: { ...(localData().comments || {}), [postId]: [...((localData().comments || {})[postId] || []), row] } });
        if (!isSupabaseConfigured) return;
        await supabase.from('community_comments').insert(row);
      },

      // ============================================================
      // Photos
      // ============================================================
      addPhoto: async ({ photoUrl, notes }) => {
        const row = { id: newId(), user_id: get().user?.id || 'guest', photo_url: photoUrl, notes: notes || '', taken_at: new Date().toISOString() };
        set((s) => ({ photos: [row, ...s.photos] }));
        writeLocal({ ...localData(), photos: [row, ...(localData().photos || [])] });
        if (!isSupabaseConfigured) return;
        await supabase.from('progress_photos').insert(row);
      },

      // ============================================================
      // Sync queue (offline)
      // ============================================================
      queueChange: (change) => {
        const q = queue();
        q.push({ ...change, queuedAt: Date.now() });
        writeQueue(q);
      },
      flushQueue: async () => {
        if (!isSupabaseConfigured) return;
        const q = queue();
        if (!q.length) return;
        set({ syncing: true });
        const remaining = [];
        for (const change of q) {
          let res;
          if (change.op === 'insert') res = await supabase.from(change.table).insert(change.payload);
          else if (change.op === 'upsert') res = await supabase.from(change.table).upsert(change.payload);
          else if (change.op === 'update') res = await supabase.from(change.table).update(change.payload.values).eq('id', change.payload.id);
          if (res?.error) remaining.push(change);
        }
        writeQueue(remaining);
        set({ syncing: false, lastSyncedAt: new Date().toISOString() });
        if (!remaining.length) get().pushToast('All changes synced', 'success');
      },

      // ============================================================
      // PWA install
      // ============================================================
      setInstallPromptEvent: (e) => set({ installPromptEvent: e }),
      markInstalled: () => {
        localStorage.setItem('pwa_installed', 'true');
        set({ pwaInstalled: true });
        if (isSupabaseConfigured && get().user) {
          supabase.from('users').upsert({ id: get().user.id, email: get().user.email, pwa_installed: true });
        }
      },
      dismissInstallBanner: () => {
        localStorage.setItem('install_banner_dismissed', 'true');
        set({ installBannerDismissed: true });
      },
    }),
    {
      name: 'gsp-store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist tiny UI prefs; data is mirrored separately to LS_LOCAL
        installBannerDismissed: state.installBannerDismissed,
        pwaInstalled: state.pwaInstalled,
      }),
    }
  )
);

function seedPosts() {
  return [
    { id: 'p1', user_id: 'm1', user_name: 'Marcus T.', content: 'Hit a 405 rack pull today. Stuck at 365 for two months — the structured progression in this app actually works.', likes: 47, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 'p2', user_id: 'm2', user_name: 'Sara K.', content: 'Down 6.2kg in 11 weeks holding all my lifts. The macro targets + workout cadence are dialled in.', likes: 92, created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString() },
    { id: 'p3', user_id: 'm3', user_name: 'Devon R.', content: 'Day 47 streak. Showing up was the system.', likes: 31, created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
  ];
}

export default useStore;
