import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '../lib/api.js';
import { calcStreak } from '../utils/calculations.js';

const LS_QUEUE = 'gsp_sync_queue';
const LS_LOCAL = 'gsp_local_data';

const localData = () => { try { return JSON.parse(localStorage.getItem(LS_LOCAL)) || {}; } catch { return {}; } };
const writeLocal = (d) => { try { localStorage.setItem(LS_LOCAL, JSON.stringify(d)); } catch {} };
const queue = () => { try { return JSON.parse(localStorage.getItem(LS_QUEUE)) || []; } catch { return []; } };
const writeQueue = (q) => { try { localStorage.setItem(LS_QUEUE, JSON.stringify(q)); } catch {} };

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2);

const SEED_POSTS = [
  { id: 'p1', user_id: 'm1', user_name: 'Marcus T.', content: 'Hit a 405 rack pull today. Stuck at 365 for two months — the structured progression in this app actually works.', likes: 47, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'p2', user_id: 'm2', user_name: 'Sara K.', content: 'Down 6.2kg in 11 weeks holding all my lifts. The macro targets + workout cadence are dialled in.', likes: 92, created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString() },
  { id: 'p3', user_id: 'm3', user_name: 'Devon R.', content: 'Day 47 streak. Showing up was the system.', likes: 31, created_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
];

const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth / profile ──
      user: null,
      profile: null,
      syncing: false,
      lastSyncedAt: null,
      online: typeof navigator === 'undefined' ? true : navigator.onLine,

      // ── Domain data ──
      workouts: [],
      sets: [],
      personalRecords: [],
      bodyWeight: [],
      nutrition: [],
      posts: [],
      comments: {},
      photos: [],

      // ── UI ──
      toasts: [],
      prCelebration: null,
      installPromptEvent: null,
      pwaInstalled: false,
      installBannerDismissed: false,

      // ════════════════════════════════════════════════════
      // Toasts
      // ════════════════════════════════════════════════════
      pushToast: (text, type = 'default') => {
        const id = newId();
        set((s) => ({ toasts: [...s.toasts, { id, text, type }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // ════════════════════════════════════════════════════
      // Session
      // ════════════════════════════════════════════════════
      initSession: async () => {
        // Hydrate UI cache from localStorage (works offline)
        const local = localData();
        set({
          workouts: local.workouts || [],
          sets: local.sets || [],
          personalRecords: local.personalRecords || [],
          bodyWeight: local.bodyWeight || [],
          nutrition: local.nutrition || [],
          posts: local.posts?.length ? local.posts : SEED_POSTS,
          comments: local.comments || {},
          photos: local.photos || [],
          pwaInstalled: localStorage.getItem('pwa_installed') === 'true',
          installBannerDismissed: localStorage.getItem('install_banner_dismissed') === 'true',
        });

        try {
          const { user } = await api.me();
          if (user) {
            set({ user, profile: user });
            await get().loadAllData();
          }
        } catch {
          // Offline or no session; continue with local cache.
        }
      },

      signInWithEmail: async (email, password) => {
        try {
          const { user } = await api.signin(email, password);
          set({ user, profile: user });
          await get().loadAllData();
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e.message };
        }
      },

      signUpWithEmail: async (email, password) => {
        try {
          const { user } = await api.signup(email, password);
          set({ user, profile: user });
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e.message };
        }
      },

      // No magic-link in D1 mode (no email service wired). Keep the API for the UI:
      // it falls back to a normal signin attempt with a placeholder password.
      signInWithMagicLink: async () => {
        return { ok: false, error: 'Magic links require an email service. Use email + password.' };
      },

      signOut: async () => {
        try { await api.signout(); } catch {}
        set({
          user: null, profile: null,
          workouts: [], sets: [], personalRecords: [],
          bodyWeight: [], nutrition: [], comments: {}, photos: [],
        });
        writeLocal({});
      },

      // ════════════════════════════════════════════════════
      // Profile
      // ════════════════════════════════════════════════════
      saveProfile: async (patch) => {
        const next = { ...(get().profile || {}), ...patch };
        set({ profile: next });
        writeLocal({ ...localData(), profile: next });
        if (!get().user) return;
        set({ syncing: true });
        try {
          const { profile } = await api.updateProfile(patch);
          set({ profile, syncing: false, lastSyncedAt: new Date().toISOString() });
        } catch {
          set({ syncing: false });
          get().queueChange({ kind: 'profile', payload: patch });
        }
      },

      loadAllData: async () => {
        if (!get().user) return;
        set({ syncing: true });
        try {
          const [w, prs, bw, nut, posts, photos] = await Promise.all([
            api.listWorkouts(),
            api.listPRs(),
            api.listBodyWeight(),
            api.listNutrition(),
            api.listPosts(),
            api.listPhotos(),
          ]);
          set({
            workouts: w.workouts || [],
            sets: w.sets || [],
            personalRecords: prs.personal_records || [],
            bodyWeight: bw.body_weight || [],
            nutrition: nut.nutrition || [],
            posts: posts.posts || SEED_POSTS,
            photos: photos.photos || [],
            syncing: false,
            lastSyncedAt: new Date().toISOString(),
          });
          writeLocal({
            workouts: w.workouts, sets: w.sets,
            personalRecords: prs.personal_records,
            bodyWeight: bw.body_weight, nutrition: nut.nutrition,
            posts: posts.posts, photos: photos.photos,
          });
        } catch {
          set({ syncing: false });
        }
      },

      // ════════════════════════════════════════════════════
      // Workouts
      // ════════════════════════════════════════════════════
      saveWorkout: async ({ dayNumber, dayName, durationMinutes, notes, sets: setRows }) => {
        const optimisticId = newId();
        const completedAt = new Date().toISOString();
        const optimistic = {
          id: optimisticId, user_id: get().user?.id || 'guest',
          day_number: dayNumber, day_name: dayName,
          completed_at: completedAt, duration_minutes: durationMinutes, notes: notes || '',
        };
        const optimisticSets = setRows.map((s, i) => ({
          id: newId(), workout_id: optimisticId,
          exercise_name: s.exercise, set_number: s.setNumber || i + 1,
          weight: Number(s.weight) || 0, reps: Number(s.reps) || 0,
          is_drop_set: !!s.isDropSet, is_pr: !!s.isPR,
          completed_at: completedAt,
        }));
        set((st) => ({ workouts: [optimistic, ...st.workouts], sets: [...optimisticSets, ...st.sets] }));

        // Streak update locally + on server
        const streak = calcStreak([optimistic, ...get().workouts]);
        get().saveProfile({
          current_streak: streak.current,
          longest_streak: Math.max(streak.longest, get().profile?.longest_streak || 0),
          last_workout_date: completedAt.slice(0, 10),
        });

        if (!get().user) return;
        set({ syncing: true });
        try {
          await api.saveWorkout({
            day_number: dayNumber, day_name: dayName,
            duration_minutes: durationMinutes, notes,
            sets: setRows,
          });
          set({ syncing: false, lastSyncedAt: new Date().toISOString() });
        } catch {
          set({ syncing: false });
          get().queueChange({ kind: 'workout', payload: { dayNumber, dayName, durationMinutes, notes, sets: setRows } });
        }
      },

      logPR: async (pr) => {
        const optimistic = { id: newId(), user_id: get().user?.id || 'guest', ...pr, achieved_at: new Date().toISOString() };
        set((s) => ({ personalRecords: [optimistic, ...s.personalRecords], prCelebration: optimistic }));
        setTimeout(() => set({ prCelebration: null }), 3500);
        if (!get().user) return;
        try { await api.addPR(pr); }
        catch { get().queueChange({ kind: 'pr', payload: pr }); }
      },

      logBodyWeight: async (weight) => {
        const optimistic = { id: newId(), user_id: get().user?.id || 'guest', weight: Number(weight), logged_at: new Date().toISOString() };
        set((s) => ({ bodyWeight: [optimistic, ...s.bodyWeight] }));
        if (!get().user) return;
        try { await api.addBodyWeight(weight); }
        catch { get().queueChange({ kind: 'body_weight', payload: { weight } }); }
      },

      // ════════════════════════════════════════════════════
      // Nutrition
      // ════════════════════════════════════════════════════
      logFood: async (food) => {
        const optimistic = {
          id: newId(), user_id: get().user?.id || 'guest',
          food_name: food.name || food.food_name,
          calories: Number(food.calories) || 0,
          protein: Number(food.protein) || 0,
          carbs: Number(food.carbs) || 0,
          fats: Number(food.fats) || 0,
          logged_at: new Date().toISOString(),
        };
        set((s) => ({ nutrition: [optimistic, ...s.nutrition] }));
        if (!get().user) return;
        try { await api.addFood({ ...food, food_name: food.name || food.food_name }); }
        catch { get().queueChange({ kind: 'food', payload: food }); }
      },
      removeFood: async (id) => {
        set((s) => ({ nutrition: s.nutrition.filter((n) => n.id !== id) }));
        if (!get().user) return;
        try { await api.removeFood(id); } catch {}
      },

      // ════════════════════════════════════════════════════
      // Community
      // ════════════════════════════════════════════════════
      addPost: async (content) => {
        const optimistic = {
          id: newId(), user_id: get().user?.id || 'guest',
          user_name: get().profile?.name || 'Member',
          content, likes: 0, created_at: new Date().toISOString(),
        };
        set((s) => ({ posts: [optimistic, ...s.posts] }));
        if (!get().user) return;
        try { await api.addPost(content); }
        catch { get().queueChange({ kind: 'post', payload: { content } }); }
      },
      likePost: async (id) => {
        set((s) => ({ posts: s.posts.map((p) => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p) }));
        try { await api.likePost(id); } catch {}
      },
      addComment: async (postId, content) => {
        const optimistic = {
          id: newId(), post_id: postId,
          user_id: get().user?.id || 'guest',
          user_name: get().profile?.name || 'Member',
          content, created_at: new Date().toISOString(),
        };
        set((s) => ({ comments: { ...s.comments, [postId]: [...(s.comments[postId] || []), optimistic] } }));
        if (!get().user) return;
        try { await api.addComment(postId, content); }
        catch { get().queueChange({ kind: 'comment', payload: { postId, content } }); }
      },

      // ════════════════════════════════════════════════════
      // Photos
      // ════════════════════════════════════════════════════
      addPhoto: async ({ photoUrl, notes }) => {
        const optimistic = { id: newId(), user_id: get().user?.id || 'guest', photo_url: photoUrl, notes: notes || '', taken_at: new Date().toISOString() };
        set((s) => ({ photos: [optimistic, ...s.photos] }));
        if (!get().user) return;
        try { await api.addPhoto(photoUrl, notes); }
        catch { get().queueChange({ kind: 'photo', payload: { photoUrl, notes } }); }
      },

      // ════════════════════════════════════════════════════
      // Sync queue (offline)
      // ════════════════════════════════════════════════════
      queueChange: (change) => {
        const q = queue();
        q.push({ ...change, queuedAt: Date.now() });
        writeQueue(q);
      },
      flushQueue: async () => {
        const q = queue();
        if (!q.length) return;
        set({ syncing: true });
        const remaining = [];
        for (const c of q) {
          try {
            if (c.kind === 'profile') await api.updateProfile(c.payload);
            else if (c.kind === 'workout') await api.saveWorkout({
              day_number: c.payload.dayNumber, day_name: c.payload.dayName,
              duration_minutes: c.payload.durationMinutes, notes: c.payload.notes,
              sets: c.payload.sets,
            });
            else if (c.kind === 'pr') await api.addPR(c.payload);
            else if (c.kind === 'body_weight') await api.addBodyWeight(c.payload.weight);
            else if (c.kind === 'food') await api.addFood({ ...c.payload, food_name: c.payload.name || c.payload.food_name });
            else if (c.kind === 'post') await api.addPost(c.payload.content);
            else if (c.kind === 'comment') await api.addComment(c.payload.postId, c.payload.content);
            else if (c.kind === 'photo') await api.addPhoto(c.payload.photoUrl, c.payload.notes);
          } catch {
            remaining.push(c);
          }
        }
        writeQueue(remaining);
        set({ syncing: false, lastSyncedAt: new Date().toISOString() });
        if (!remaining.length && q.length) get().pushToast('All changes synced', 'success');
      },

      // ════════════════════════════════════════════════════
      // PWA install
      // ════════════════════════════════════════════════════
      setInstallPromptEvent: (e) => set({ installPromptEvent: e }),
      markInstalled: () => {
        localStorage.setItem('pwa_installed', 'true');
        set({ pwaInstalled: true });
        if (get().user) api.updateProfile({ pwa_installed: true }).catch(() => {});
      },
      dismissInstallBanner: () => {
        localStorage.setItem('install_banner_dismissed', 'true');
        set({ installBannerDismissed: true });
      },
    }),
    {
      name: 'gsp-store',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        installBannerDismissed: state.installBannerDismissed,
        pwaInstalled: state.pwaInstalled,
      }),
    }
  )
);

export default useStore;
