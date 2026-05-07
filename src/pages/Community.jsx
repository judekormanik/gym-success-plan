import { useMemo, useState } from 'react';
import { Heart, MessageCircle, Send, Trophy, Megaphone } from 'lucide-react';
import useStore from '../store/useStore.js';
import EmptyState from '../components/EmptyState.jsx';
import { formatRelative } from '../utils/calculations.js';

export default function Community() {
  const posts = useStore((s) => s.posts);
  const comments = useStore((s) => s.comments);
  const addPost = useStore((s) => s.addPost);
  const likePost = useStore((s) => s.likePost);
  const addComment = useStore((s) => s.addComment);
  const profile = useStore((s) => s.profile);
  const workouts = useStore((s) => s.workouts);
  const sets = useStore((s) => s.sets);

  const [content, setContent] = useState('');
  const [activePostId, setActivePostId] = useState(null);
  const [comment, setComment] = useState('');

  const submit = () => {
    if (!content.trim()) return;
    addPost(content);
    setContent('');
  };

  const submitComment = (id) => {
    if (!comment.trim()) return;
    addComment(id, comment);
    setComment('');
  };

  const leaderboard = useMemo(() => {
    const board = [
      { name: profile?.name || 'You', sessions: workouts.length, volume: sets.reduce((a, s) => a + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0) },
      { name: 'Marcus T.', sessions: 16, volume: 24800 },
      { name: 'Sara K.', sessions: 18, volume: 19200 },
      { name: 'Devon R.', sessions: 22, volume: 28100 },
    ].sort((a, b) => b.volume - a.volume);
    return board;
  }, [workouts, sets, profile?.name]);

  return (
    <div className="fade-in">
      <div className="row-between mb-6">
        <div>
          <div className="eyebrow">Community</div>
          <h1 className="h2" style={{ marginTop: 6 }}>Real members. Real wins.</h1>
        </div>
      </div>

      <div className="card-row cols-2 mb-6">
        <div className="card" style={{ padding: 20 }}>
          <div className="row gap-2 mb-2">
            <Megaphone size={14} style={{ color: 'var(--gold)' }} />
            <div className="eyebrow">This week's challenge</div>
          </div>
          <div className="h3" style={{ marginBottom: 6 }}>Hit 4 sessions in 7 days.</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Finish all four days this week. Members at 4/4 unlock the gold-tier badge.
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="row gap-2 mb-2">
            <Trophy size={14} style={{ color: 'var(--gold)' }} />
            <div className="eyebrow">Leaderboard · weekly volume</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {leaderboard.map((m, i) => (
              <div key={m.name + i} className="row-between" style={{ padding: '8px 10px', borderRadius: 10, background: i === 0 ? 'var(--gold-bg)' : 'transparent' }}>
                <div className="row gap-2">
                  <span className="mono muted" style={{ width: 18 }}>#{i + 1}</span>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</span>
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
          <button className="btn btn-gold" onClick={submit}><Send size={14} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.length === 0 && (
          <EmptyState title="Be the first to post" body="Share your latest win to kick off the feed." />
        )}
        {posts.map((p) => (
          <div key={p.id} className="card" style={{ padding: 20 }}>
            <div className="row gap-3 mb-2">
              <div style={{ width: 36, height: 36, borderRadius: 99, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                {p.user_name?.[0] || '?'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.user_name}</div>
                <div className="muted" style={{ fontSize: 11 }}>{formatRelative(p.created_at)}</div>
              </div>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{p.content}</div>
            <div className="row gap-3">
              <button className="row gap-2 muted" onClick={() => likePost(p.id)} style={{ fontSize: 12 }}>
                <Heart size={14} /> {p.likes || 0}
              </button>
              <button className="row gap-2 muted" onClick={() => setActivePostId(activePostId === p.id ? null : p.id)} style={{ fontSize: 12 }}>
                <MessageCircle size={14} /> {(comments[p.id] || []).length}
              </button>
            </div>
            {activePostId === p.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                {(comments[p.id] || []).map((c) => (
                  <div key={c.id} style={{ padding: '6px 0', fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{c.user_name}</span>
                    <span className="muted" style={{ marginLeft: 6 }}>{c.content}</span>
                  </div>
                ))}
                <div className="row gap-2 mt-2">
                  <input
                    className="input"
                    placeholder="Add a comment…"
                    value={activePostId === p.id ? comment : ''}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitComment(p.id)}
                  />
                  <button className="btn btn-gold btn-sm" onClick={() => submitComment(p.id)}><Send size={12} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
