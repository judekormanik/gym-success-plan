import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Send, Trophy, Megaphone, Flame, Zap,
  Share2, X, Dumbbell, ChevronRight,
} from 'lucide-react';
import useStore from '../store/useStore.js';
import EmptyState from '../components/EmptyState.jsx';
import { exerciseById } from '../utils/exerciseLibrary.js';
import { formatRelative, dateKey } from '../utils/calculations.js';

const REACTIONS = [
  { id: 'fire',    label: '🔥', tip: 'On fire' },
  { id: 'trophy',  label: '🏆', tip: 'PR worthy' },
  { id: 'muscle',  label: '💪', tip: 'Beast' },
];

export default function Community() {
  const navigate = useNavigate();
  const posts = useStore((s) => s.posts);
  const comments = useStore((s) => s.comments);
  const addPost = useStore((s) => s.addPost);
  const likePost = useStore((s) => s.likePost);
  const reactToPost = useStore((s) => s.reactToPost);
  const addComment = useStore((s) => s.addComment);
  const cloneWorkoutFromPost = useStore((s) => s.cloneWorkoutFromPost);
  const shareCustomWorkout = useStore((s) => s.shareCustomWorkout);
  const profile = useStore((s) => s.profile);
  const workouts = useStore((s) => s.workouts);
  const sets = useStore((s) => s.sets);
  const customWorkouts = useStore((s) => s.customWorkouts);
  const pushToast = useStore((s) => s.pushToast);

  const [content, setContent] = useState('');
  const [activePostId, setActivePostId] = useState(null);
  const [comment, setComment] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [cloningId, setCloningId] = useState(null);

  const submit = () => {
    if (!content.trim()) return;
    addPost(content);
    setContent('');
    pushToast('Posted', 'success');
  };

  const submitComment = (id) => {
    if (!comment.trim()) return;
    addComment(id, comment);
    setComment('');
  };

  // Live challenge progress: workouts THIS week (Mon - Sun) / 4
  const sessionsThisWeek = useMemo(() => {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const start = new Date(now); start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    return workouts.filter((w) => w.completed_at && new Date(w.completed_at) >= start).length;
  }, [workouts]);
  const challengeTarget = 4;
  const challengeDone = sessionsThisWeek >= challengeTarget;

  const leaderboard = useMemo(() => {
    const board = [
      {
        name: profile?.name || 'You',
        sessions: workouts.length,
        volume: sets.reduce((a, s) => a + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0),
        you: true,
      },
      { name: 'Marcus T.', sessions: 16, volume: 24800 },
      { name: 'Sara K.', sessions: 18, volume: 19200 },
      { name: 'Devon R.', sessions: 22, volume: 28100 },
    ].sort((a, b) => b.volume - a.volume);
    return board;
  }, [workouts, sets, profile?.name]);

  return (
    <div className="fade-in">
      <div className="row-between mb-6" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="eyebrow">Community</div>
          <h1 className="h2" style={{ marginTop: 6 }}>Real members. Real wins.</h1>
        </div>
        {customWorkouts.length > 0 && (
          <button onClick={() => setShareOpen(true)} className="btn btn-gold btn-sm">
            <Share2 size={14} /> Share a workout
          </button>
        )}
      </div>

      <div className="card-row cols-2 mb-6">
        {/* Weekly challenge with live progress */}
        <div className="card" style={{
          padding: 20,
          background: challengeDone
            ? 'linear-gradient(180deg, rgba(212,175,55,0.12), transparent 70%), var(--surface)'
            : 'var(--surface)',
          border: challengeDone ? '1px solid rgba(212,175,55,0.4)' : '1px solid var(--border)',
        }}>
          <div className="row gap-2 mb-2">
            <Megaphone size={14} style={{ color: 'var(--gold)' }} />
            <div className="eyebrow">This week's challenge</div>
          </div>
          <div className="h3" style={{ marginBottom: 6 }}>Hit {challengeTarget} sessions in 7 days.</div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            {challengeDone
              ? "You did it. Gold-tier badge unlocked for the week."
              : `${sessionsThisWeek} / ${challengeTarget} so far this week — keep going.`}
          </div>
          <div style={{ height: 6, borderRadius: 999, background: '#0e0e0e', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, (sessionsThisWeek / challengeTarget) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--gold), var(--gold-soft))',
              transition: 'width 500ms cubic-bezier(.2,.8,.2,1)',
            }} />
          </div>
          <div className="row" style={{ gap: 4, marginTop: 8 }}>
            {Array.from({ length: challengeTarget }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i < sessionsThisWeek ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
              }} />
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card" style={{ padding: 20 }}>
          <div className="row gap-2 mb-2">
            <Trophy size={14} style={{ color: 'var(--gold)' }} />
            <div className="eyebrow">Leaderboard · weekly volume</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {leaderboard.map((m, i) => (
              <div key={m.name + i} className="row-between" style={{
                padding: '8px 10px', borderRadius: 10,
                background: i === 0 ? 'var(--gold-bg)' : m.you ? 'var(--surface-2)' : 'transparent',
                border: m.you && i !== 0 ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
              }}>
                <div className="row gap-2">
                  <span className="mono muted" style={{ width: 18 }}>#{i + 1}</span>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{m.name}{m.you && ' · you'}</span>
                </div>
                <span className="mono" style={{ fontWeight: 600, color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>{m.volume.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mb-6" style={{ padding: 20 }}>
        <div className="eyebrow mb-4">Post a win</div>
        <div className="row gap-2">
          <input
            className="input"
            placeholder="Share what you crushed today…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button className="btn btn-gold" onClick={submit} aria-label="Post"><Send size={14} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.length === 0 && (
          <EmptyState title="Be the first to post" body="Share your latest win to kick off the feed." />
        )}
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            comments={comments[p.id] || []}
            isActive={activePostId === p.id}
            onLike={() => likePost(p.id)}
            onReact={(action) => reactToPost(p.id, action)}
            onToggleComments={() => setActivePostId(activePostId === p.id ? null : p.id)}
            comment={activePostId === p.id ? comment : ''}
            onCommentChange={setComment}
            onSubmitComment={() => submitComment(p.id)}
            onClone={async () => {
              setCloningId(p.id);
              const res = await cloneWorkoutFromPost(p.id);
              setCloningId(null);
              if (res.ok) {
                pushToast('Workout cloned to your library', 'success');
                navigate('/workout');
              } else {
                pushToast(res.error || 'Could not clone', 'error');
              }
            }}
            cloning={cloningId === p.id}
          />
        ))}
      </div>

      {shareOpen && (
        <ShareWorkoutModal
          customWorkouts={customWorkouts}
          onClose={() => setShareOpen(false)}
          onShare={async (id, message) => {
            const res = await shareCustomWorkout(id, message);
            if (res.ok) pushToast('Shared to the feed', 'success');
            else pushToast(res.error || 'Could not share', 'error');
            setShareOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────
function PostCard({ post, comments, isActive, onLike, onReact, onToggleComments, comment, onCommentChange, onSubmitComment, onClone, cloning }) {
  const isShare = post.kind === 'workout_share' && post.metadata?.workout;
  const w = isShare ? post.metadata.workout : null;
  const preview = w
    ? (w.exercises || []).slice(0, 3).map((row) => exerciseById(row.exerciseId)).filter(Boolean)
    : [];
  const totalSets = isShare ? (w.exercises || []).reduce((a, e) => a + (Number(e.sets) || 0), 0) : 0;

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row gap-3 mb-2">
        <div style={{ width: 36, height: 36, borderRadius: 99, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
          {post.user_name?.[0] || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{post.user_name}</div>
          <div className="muted" style={{ fontSize: 11 }}>{formatRelative(post.created_at)}</div>
        </div>
        {isShare && (
          <span className="pill gold" style={{ padding: '3px 9px', fontSize: 10 }}>
            <Dumbbell size={10} /> Workout
          </span>
        )}
      </div>

      <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{post.content}</div>

      {/* Shared workout preview */}
      {isShare && (
        <div style={{
          padding: 14, marginBottom: 12, borderRadius: 12,
          background: 'linear-gradient(180deg, rgba(212,175,55,0.06), transparent), var(--surface-2)',
          border: '1px solid rgba(212,175,55,0.25)',
        }}>
          <div className="row-between mb-2">
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{w.name}</div>
              {w.description && (
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{w.description}</div>
              )}
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                {(w.exercises || []).length} exercises · {totalSets} sets
              </div>
            </div>
          </div>
          {preview.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10,
            }}>
              {preview.map((ex, i) => (
                <span key={ex.id + i} className="pill" style={{ padding: '3px 8px', fontSize: 11 }}>
                  {ex.name}
                </span>
              ))}
              {(w.exercises || []).length > preview.length && (
                <span className="pill muted" style={{ padding: '3px 8px', fontSize: 11 }}>
                  +{(w.exercises || []).length - preview.length} more
                </span>
              )}
            </div>
          )}
          <button onClick={onClone} disabled={cloning} className="btn btn-gold btn-sm btn-block">
            {cloning ? 'Cloning…' : <>Clone to my workouts <ChevronRight size={14} /></>}
          </button>
        </div>
      )}

      {/* Reactions strip */}
      <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
        <button className="row gap-2 muted" onClick={onLike} style={{ fontSize: 12, padding: 4 }}>
          <Heart size={14} /> {post.likes || 0}
        </button>
        {REACTIONS.map((r) => (
          <button
            key={r.id}
            onClick={() => onReact(r.id)}
            title={r.tip}
            className="row gap-1"
            style={{
              fontSize: 12, padding: '4px 8px', borderRadius: 999,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 13 }}>{r.label}</span>
            <span className="mono muted">{(post.reactions || {})[r.id] || 0}</span>
          </button>
        ))}
        <button className="row gap-2 muted" onClick={onToggleComments} style={{ fontSize: 12, padding: 4, marginLeft: 'auto' }}>
          <MessageCircle size={14} /> {comments.length}
        </button>
      </div>

      {isActive && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {comments.map((c) => (
            <div key={c.id} style={{ padding: '6px 0', fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{c.user_name}</span>
              <span className="muted" style={{ marginLeft: 6 }}>{c.content}</span>
            </div>
          ))}
          <div className="row gap-2 mt-2">
            <input
              className="input"
              placeholder="Add a comment…"
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmitComment()}
            />
            <button className="btn btn-gold btn-sm" onClick={onSubmitComment}><Send size={12} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
function ShareWorkoutModal({ customWorkouts, onClose, onShare }) {
  const [selectedId, setSelectedId] = useState(customWorkouts[0]?.id || null);
  const [message, setMessage] = useState('');

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', zIndex: 100, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} className="card slide-up" style={{ width: '100%', maxWidth: 480, padding: 18 }}>
        <div className="row-between mb-4">
          <div>
            <div className="eyebrow">Share a workout</div>
            <div className="h3" style={{ marginTop: 2 }}>Pick one to post</div>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close"><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '40vh', overflow: 'auto' }}>
          {customWorkouts.map((cw) => {
            const active = selectedId === cw.id;
            const totalSets = (cw.exercises || []).reduce((a, e) => a + (Number(e.sets) || 0), 0);
            return (
              <button
                key={cw.id}
                onClick={() => setSelectedId(cw.id)}
                className="card hover"
                style={{
                  textAlign: 'left', padding: 12, cursor: 'pointer',
                  borderColor: active ? 'rgba(212,175,55,0.6)' : 'var(--border)',
                  background: active ? 'linear-gradient(180deg, rgba(212,175,55,0.06), transparent), var(--surface-2)' : 'var(--surface-2)',
                }}
              >
                <div className="row-between">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{cw.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {(cw.exercises || []).length} exercises · {totalSets} sets
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <label className="label" style={{ marginTop: 14 }}>Caption (optional)</label>
        <textarea
          className="textarea"
          rows={2}
          placeholder="Why this workout works for you…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={() => selectedId && onShare(selectedId, message)}
          disabled={!selectedId}
          className="btn btn-gold btn-block btn-lg"
          style={{ marginTop: 12 }}
        >
          <Share2 size={14} /> Share to feed
        </button>
      </div>
    </div>
  );
}
