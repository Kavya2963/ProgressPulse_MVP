import "./ConfirmModal.css";
export default function ConfirmModal({ title, desc, onConfirm, onCancel }) {
  return (
    <div className="pp-confirm-overlay">
      <div className="pp-confirm-box">
        <div className="pp-confirm-title">{title}</div>
        <div className="pp-confirm-desc">{desc}</div>
        <div className="pp-confirm-actions">
          <button className="pp-confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="pp-confirm-ok" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
