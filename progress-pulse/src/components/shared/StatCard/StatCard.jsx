import "./StatCard.css";
export default function StatCard({ icon, label, value, sub, iconBg = "#e0e7ff" }) {
  return (
    <div className="pp-stat-card">
      <div className="pp-stat-icon" style={{ background: iconBg }}>{icon}</div>
      <div className="pp-stat-info">
        <div className="pp-stat-label">{label}</div>
        <div className="pp-stat-value">{value ?? "—"}</div>
        {sub && <div className="pp-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
