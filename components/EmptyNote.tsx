export default function EmptyNote({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="empty-note">
      <span aria-hidden="true">{emoji}</span>
      <div>
        <strong>{title}</strong>
        <p className="muted">{body}</p>
      </div>
    </div>
  );
}
