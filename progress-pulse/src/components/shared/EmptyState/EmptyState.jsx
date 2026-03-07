import "./EmptyState.css";
export default function EmptyState({ icon = "📭", title = "No data found", desc = "" }) {
  return (
    <div className="pp-empty">
      <div className="pp-empty-icon">{icon}</div>
      <div className="pp-empty-title">{title}</div>
      {desc && <div className="pp-empty-desc">{desc}</div>}
    </div>
  );
}
