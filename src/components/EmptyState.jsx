export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        gap: 12,
      }}
    >
      {Icon && (
        <div
          style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--gold-bg)', color: 'var(--gold)',
            display: 'grid', placeItems: 'center',
          }}
        >
          <Icon size={22} />
        </div>
      )}
      <div className="h3">{title}</div>
      {body && <div className="muted" style={{ maxWidth: 360 }}>{body}</div>}
      {action}
    </div>
  );
}
