import { useState, useEffect } from "react";
import { GOAL_STATUS } from "../../../constants/appConstants";
import "./GoalFormModal.css";

const emptyForm = {
  title: "",
  description: "",
  status: "NotStarted",
  progressPercentage: 0,
  category: "",
  priority: "Medium",
  dueDate: "",
};

const STATUS_OPTIONS = [
  { value: GOAL_STATUS.NOT_STARTED, label: "Not Started", icon: "bi-circle",            cls: "active-notstarted" },
  { value: GOAL_STATUS.IN_PROGRESS, label: "In Progress", icon: "bi-arrow-repeat",      cls: "active-inprogress" },
  { value: GOAL_STATUS.COMPLETED,   label: "Completed",   icon: "bi-check-circle-fill", cls: "active-completed"  },
];

const CATEGORY_OPTIONS = [
  { value: "Delivery",      icon: "bi-box-seam",         label: "Delivery" },
  { value: "Communication", icon: "bi-chat-dots",         label: "Communication" },
  { value: "Quality",       icon: "bi-patch-check",       label: "Quality" },
  { value: "Leadership",    icon: "bi-person-lines-fill", label: "Leadership" },
  { value: "Learning",      icon: "bi-book",              label: "Learning" },
  { value: "Other",         icon: "bi-three-dots",        label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "High",   cls: "priority-high",   icon: "bi-arrow-up-circle-fill" },
  { value: "Medium", cls: "priority-medium", icon: "bi-dash-circle-fill" },
  { value: "Low",    cls: "priority-low",    icon: "bi-arrow-down-circle-fill" },
];

export default function GoalFormModal({
  goal,
  onSave,
  onClose,
  submitting,
  mode = "employee",
  assignedToName = "",
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (goal) {
      setForm({
        title:              goal.title              || "",
        description:        goal.description        || "",
        status:             goal.status             || GOAL_STATUS.NOT_STARTED,
        progressPercentage: goal.progressPercentage ?? 0,
        category:           goal.category           || "",
        priority:           goal.priority           || "Medium",
        dueDate:            goal.dueDate            || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [goal]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "range" || type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      title:              form.title.trim(),
      description:        form.description.trim(),
      status:             form.status,
      progressPercentage: Number(form.progressPercentage),
      category:           form.category,
      priority:           form.priority,
      dueDate:            form.dueDate,
      createdBy:          mode,
    });
  };

  const isEdit    = Boolean(goal);
  const isManager = mode === "manager";

  const headerIcon     = isManager ? "bi-person-check-fill" : isEdit ? "bi-pencil-fill" : "bi-flag-fill";
  const headerTitle    = isManager
    ? isEdit ? "Edit Assigned Goal" : "Assign Goal"
    : isEdit ? "Edit Goal" : "Create New Goal";
  const headerSubtitle = isManager
    ? isEdit
      ? `Update goal assigned to ${assignedToName}`
      : `Assigning a new goal to ${assignedToName}`
    : isEdit
      ? "Update your goal details and progress"
      : "Set a new performance goal";

  return (
    <div className="gfm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gfm-box">

        {/* ── Decorative top bar ── */}
        <div className={`gfm-top-bar ${isManager ? "gfm-top-bar--manager" : ""}`} />

        {/* ── Header ── */}
        <div className="gfm-header">
          <div className="gfm-header-left">
            <div className={`gfm-header-icon ${isManager ? "gfm-header-icon--manager" : ""}`}>
              <i className={`bi ${headerIcon}`}></i>
            </div>
            <div>
              <div className="gfm-title">{headerTitle}</div>
              <div className="gfm-subtitle">{headerSubtitle}</div>
            </div>
          </div>
          <button className="gfm-close" onClick={onClose} title="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* ── Manager Banner ── */}
        {isManager && assignedToName && (
          <div className="gfm-assign-banner">
            <div className="gfm-assign-avatar">
              {assignedToName.charAt(0).toUpperCase()}
            </div>
            <span>Assigning to <strong>{assignedToName}</strong></span>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          <div className="gfm-form-body">

            {/* Title */}
            <div className="gfm-field">
              <label>
                <i className="bi bi-pencil"></i>
                Title <span className="gfm-required">*</span>
              </label>
              <input
                name="title"
                placeholder="e.g. Complete React module"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="gfm-field">
              <label>
                <i className="bi bi-text-paragraph"></i>
                Description
              </label>
              <textarea
                name="description"
                placeholder="Describe what this goal involves..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {/* Category + Priority */}
            <div className="gfm-row">
              <div className="gfm-field">
                <label>
                  <i className="bi bi-tag"></i>
                  Category <span className="gfm-required">*</span>
                </label>
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="gfm-field">
                <label>
                  <i className="bi bi-bar-chart-steps"></i>
                  Priority
                </label>
                <div className="gfm-priority-pills">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`gfm-priority-pill ${form.priority === p.value ? p.cls : ""}`}
                      onClick={() => setForm((prev) => ({ ...prev, priority: p.value }))}
                    >
                      <i className={`bi ${p.icon}`}></i>
                      {p.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="gfm-field">
              <label>
                <i className="bi bi-calendar-event"></i>
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Status Pills — edit only */}
            {isEdit && (
              <div className="gfm-field">
                <label>
                  <i className="bi bi-circle-half"></i>
                  Status
                </label>
                <div className="gfm-status-pills">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`gfm-status-pill${form.status === opt.value ? ` ${opt.cls}` : ""}`}
                      onClick={() => setForm((prev) => ({ ...prev, status: opt.value }))}
                    >
                      <i className={`bi ${opt.icon}`}></i>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Slider — edit only */}
            {isEdit && (
              <div className="gfm-field">
                <label>
                  <i className="bi bi-bar-chart-line"></i>
                  Progress Percentage
                </label>
                <div className="gfm-range-wrap">
                  <div className="gfm-range-track-area">
                    <input
                      type="range"
                      name="progressPercentage"
                      min="0"
                      max="100"
                      step="5"
                      value={form.progressPercentage}
                      onChange={handleChange}
                    />
                    <div className="gfm-range-labels">
                      <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                  </div>
                  <div className="gfm-range-val-bubble">
                    {form.progressPercentage}%
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="gfm-footer">
              <button type="button" className="gfm-btn-cancel" onClick={onClose}>
                <i className="bi bi-x-lg"></i> Cancel
              </button>
              <button type="submit" className="gfm-btn-save" disabled={submitting}>
                {submitting ? (
                  <><i className="bi bi-hourglass-split"></i> Saving...</>
                ) : isManager ? (
                  <><i className="bi bi-person-check"></i> {isEdit ? "Update Goal" : "Assign Goal"}</>
                ) : isEdit ? (
                  <><i className="bi bi-check-lg"></i> Update Goal</>
                ) : (
                  <><i className="bi bi-plus-lg"></i> Create Goal</>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
