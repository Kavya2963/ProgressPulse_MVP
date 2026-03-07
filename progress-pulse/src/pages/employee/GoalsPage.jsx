import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getUserGoals,
  createGoal,
  updateGoal,
  getGoalProgress,
  updateGoalProgress,
} from "../../services/goalService";
import Loader from "../../components/shared/Loader/Loader";
import EmptyState from "../../components/shared/EmptyState/EmptyState";
import GoalFormModal from "../../components/goals/GoalFormModal/GoalFormModal";
import { formatDate } from "../../utils/dateFormatter";
import "./GoalsPage.css";

const STATUS_FILTERS = ["All", "NotStarted", "InProgress", "Completed"];

const badgeClass = {
  Completed:  "gp-badge-completed",
  InProgress: "gp-badge-inprogress",
  NotStarted: "gp-badge-notstarted",
};
const badgeLabel = {
  Completed:  "Completed",
  InProgress: "In Progress",
  NotStarted: "Not Started",
};
const badgeIcon = {
  Completed:  "bi-check-circle-fill",
  InProgress: "bi-arrow-repeat",
  NotStarted: "bi-circle",
};

const TABS = [
  { key: "my",      label: "My Goals",      icon: "bi-person-check" },
  { key: "manager", label: "Assigned to Me", icon: "bi-person-badge" },
  { key: "all",     label: "All Goals",      icon: "bi-grid-3x3-gap" },
];

export default function GoalsPage() {
  const navigate = useNavigate();

  const [goals, setGoals]           = useState([]);
  const [progress, setProgress]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("All");
  const [activeTab, setActiveTab]   = useState("my");
  const [showModal, setShowModal]   = useState(false);
  const [editGoal, setEditGoal]     = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [progressDraft,   setProgressDraft]   = useState({});
  const [progressEditing, setProgressEditing] = useState({});
  const [progressSaving,  setProgressSaving]  = useState({});

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const [goalsData, progressData] = await Promise.all([
        getUserGoals(),
        getGoalProgress().catch(() => null),
      ]);
      setGoals(goalsData || []);
      setProgress(progressData);
    } catch {
      toast.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSave = async (form) => {
    setSubmitting(true);
    try {
      if (editGoal) {
        await updateGoal(editGoal.id, form);
        toast.success("Goal updated successfully!");
      } else {
        await createGoal(form);
        toast.success("Goal created successfully!");
      }
      setShowModal(false);
      setEditGoal(null);
      fetchGoals();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save goal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProgress = (goal) => {
    setProgressDraft((p)   => ({ ...p, [goal.id]: goal.progressPercentage ?? 0 }));
    setProgressEditing((p) => ({ ...p, [goal.id]: true }));
  };
  const handleCancelProgress = (goalId) =>
    setProgressEditing((p) => ({ ...p, [goalId]: false }));

  const handleSaveProgress = async (goalId) => {
    const value = progressDraft[goalId];
    setProgressSaving((p) => ({ ...p, [goalId]: true }));
    try {
      await updateGoalProgress(goalId, value);
      toast.success("Progress updated!");
      setProgressEditing((p) => ({ ...p, [goalId]: false }));
      fetchGoals();
    } catch {
      toast.error("Failed to update progress");
    } finally {
      setProgressSaving((p) => ({ ...p, [goalId]: false }));
    }
  };

  const openEdit   = (goal) => { setEditGoal(goal); setShowModal(true); };
  const openCreate = ()     => { setEditGoal(null); setShowModal(true); };

  /* ── Derived tab base list ── */
  const myGoals      = goals.filter((g) => g.createdBy !== "manager");
  const managerGoals = goals.filter((g) => g.createdBy === "manager");
  const tabGoals     = activeTab === "my"
    ? myGoals
    : activeTab === "manager"
    ? managerGoals
    : goals;

  /*
   * ✅ Key fix: completed goals are ALWAYS excluded from
   * active/in-progress views and ONLY appear in the
   * "Completed" filter section.
   */
  const activeGoals    = tabGoals.filter((g) => g.status !== "Completed");
  const completedGoals = tabGoals.filter((g) => g.status === "Completed");

  /* Apply non-completed status filter only to active goals */
  const filteredActive = filter === "All" || filter === "Completed"
    ? activeGoals
    : activeGoals.filter((g) => g.status === filter);

  /* Stats */
  const totalCompleted  = goals.filter((g) => g.status === "Completed").length;
  const totalInProgress = goals.filter((g) => g.status === "InProgress").length;
  const totalNotStarted = goals.filter((g) => g.status === "NotStarted").length;

  /* ── Goal Card ── */
  const renderGoalCard = (goal, idx = 0) => {
    const isManagerAssigned = goal.createdBy === "manager";
    const pct         = goal.progressPercentage ?? 0;
    const isCompleted = goal.status === "Completed";
    const isEditing   = progressEditing[goal.id];
    const isSaving    = progressSaving[goal.id];
    const draft       = progressDraft[goal.id] ?? pct;

    return (
      <div
        key={goal.id}
        className={[
          "gp-goal-card",
          isManagerAssigned ? "gp-goal-card--manager" : "",
          isCompleted       ? "gp-goal-card--completed" : "",
        ].join(" ").trim()}
        data-status={goal.status}
        style={{ animationDelay: `${idx * 0.05}s` }}
      >
        {/* Completed ribbon */}
        {isCompleted && (
          <div className="gp-completed-ribbon">
            <i className="bi bi-check-circle-fill"></i> Completed
          </div>
        )}

        {/* Manager banner — only on active */}
        {isManagerAssigned && !isCompleted && (
          <div className="gp-manager-assigned-badge">
            <i className="bi bi-person-check-fill"></i> Assigned by Manager
          </div>
        )}

        {/* Top Row */}
        <div className="gp-goal-card-top">
          <div className="gp-goal-title">{goal.title}</div>
          <span className={`gp-badge ${badgeClass[goal.status] || "gp-badge-notstarted"}`}>
            <i className={`bi ${badgeIcon[goal.status]}`}></i>
            {badgeLabel[goal.status] || goal.status}
          </span>
        </div>

        {goal.description && (
          <div className="gp-goal-desc">{goal.description}</div>
        )}

        {/* Category + Priority */}
        {(goal.category || goal.priority) && (
          <div className="gp-goal-meta">
            {goal.category && (
              <span className="gp-meta-chip">
                <i className="bi bi-tag"></i> {goal.category}
              </span>
            )}
            {goal.priority && (
              <span className={`gp-meta-chip gp-priority-chip--${goal.priority?.toLowerCase()}`}>
                <i className="bi bi-bar-chart-steps"></i> {goal.priority}
              </span>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="gp-progress-row">
          <span>Progress</span>
          <span className="gp-progress-pct">{pct}%</span>
        </div>
        <div className="gp-progress-track">
          <div
            className={[
              "gp-progress-fill",
              isCompleted ? "gp-progress-fill--done" : "",
              isManagerAssigned && !isCompleted ? "gp-progress-fill--manager" : "",
            ].join(" ").trim()}
            style={{ width: pct + "%" }}
          />
        </div>

        {/* Progress Editor — locked when completed */}
        {isEditing && !isCompleted && (
          <div className="gp-progress-editor">
            <div className="gp-progress-editor-header">
              <i className="bi bi-sliders"></i> Adjust Progress
              <span className="gp-progress-draft-val">{draft}%</span>
            </div>
            <input
              type="range"
              min="0" max="100" step="5"
              value={draft}
              onChange={(e) =>
                setProgressDraft((p) => ({ ...p, [goal.id]: Number(e.target.value) }))
              }
              className="gp-progress-slider"
            />
            <div className="gp-progress-editor-row">
              <div className="gp-editor-track-labels">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
              <div className="gp-editor-actions">
                <button
                  className="gp-editor-save-btn"
                  onClick={() => handleSaveProgress(goal.id)}
                  disabled={isSaving}
                >
                  {isSaving
                    ? <><i className="bi bi-hourglass-split"></i> Saving...</>
                    : <><i className="bi bi-check-lg"></i> Save</>}
                </button>
                <button
                  className="gp-editor-cancel-btn"
                  onClick={() => handleCancelProgress(goal.id)}
                  disabled={isSaving}
                >
                  <i className="bi bi-x-lg"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="gp-goal-footer">
          <div className="gp-goal-due">
            {goal.dueDate ? (
              <><i className="bi bi-calendar3"></i> {formatDate(goal.dueDate)}</>
            ) : (
              <span className="gp-no-date">
                <i className="bi bi-calendar-x"></i> No due date
              </span>
            )}
          </div>

          {/* ✅ Actions fully locked when completed */}
          {isCompleted ? (
            <div className="gp-completed-lock">
              <i className="bi bi-lock-fill"></i> Locked
            </div>
          ) : (
            <div className="gp-footer-actions">
              {!isEditing && (
                <button
                  className={`gp-progress-update-btn${isManagerAssigned ? " gp-progress-update-btn--manager" : ""}`}
                  onClick={() => handleEditProgress(goal)}
                >
                  <i className="bi bi-bar-chart-line"></i> Update
                </button>
              )}
              {!isManagerAssigned && (
                <button className="gp-goal-edit-btn" onClick={() => openEdit(goal)}>
                  <i className="bi bi-pencil"></i> Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="gp-page">

      {/* ── BREADCRUMB — no back button ── */}
      <div className="gp-breadcrumb-row">
        <nav className="tl-breadcrumbs" aria-label="breadcrumb">
          <ol>
            <li>
              <span
                className="tl-bc-link"
                onClick={() => navigate("/employee/dashboard")}
              >
                <i className="bi bi-house-door"></i> Dashboard
              </span>
            </li>
            <li>
              <span className="tl-bc-sep">
                <i className="bi bi-chevron-right"></i>
              </span>
            </li>
            <li>
              <span className="tl-bc-current">
                <i className="bi bi-bullseye me-1"></i>My Goals
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* ── HEADER ── */}
      <div className="gp-header-row">
        <div className="gp-header-left">
          <div className="gp-header-icon">
            <i className="bi bi-bullseye"></i>
          </div>
          <div>
            <div className="gp-page-title">Goals</div>
            <div className="gp-page-sub">
              Track your performance goals and updates
            </div>
          </div>
        </div>
        <button className="gp-add-btn" onClick={openCreate}>
          <i className="bi bi-plus-lg"></i> Add Goal
        </button>
      </div>

      {/* ── STATS GRID ── */}
      {!loading && goals.length > 0 && (
        <div className="gp-stats-grid">
          <div className="gp-stat-card">
            <div className="gp-stat-icon-wrap gp-stat-icon--total">
              <i className="bi bi-bullseye"></i>
            </div>
            <div className="gp-stat-info">
              <div className="gp-stat-val">{goals.length}</div>
              <div className="gp-stat-lbl">Total Goals</div>
            </div>
          </div>
          <div className="gp-stat-card">
            <div className="gp-stat-icon-wrap gp-stat-icon--completed">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className="gp-stat-info">
              <div className="gp-stat-val gp-val--green">{totalCompleted}</div>
              <div className="gp-stat-lbl">Completed</div>
            </div>
          </div>
          <div className="gp-stat-card">
            <div className="gp-stat-icon-wrap gp-stat-icon--inprogress">
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <div className="gp-stat-info">
              <div className="gp-stat-val gp-val--yellow">{totalInProgress}</div>
              <div className="gp-stat-lbl">In Progress</div>
            </div>
          </div>
          <div className="gp-stat-card">
            <div className="gp-stat-icon-wrap gp-stat-icon--notstarted">
              <i className="bi bi-circle"></i>
            </div>
            <div className="gp-stat-info">
              <div className="gp-stat-val gp-val--blue">{totalNotStarted}</div>
              <div className="gp-stat-lbl">Not Started</div>
            </div>
          </div>
          {progress?.averageCompletion != null && (
            <div className="gp-stat-card">
              <div className="gp-stat-icon-wrap gp-stat-icon--avg">
                <i className="bi bi-bar-chart-fill"></i>
              </div>
              <div className="gp-stat-info">
                <div className="gp-stat-val">{progress.averageCompletion}%</div>
                <div className="gp-stat-lbl">Avg Progress</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TABS + FILTER ROW ── */}
      <div className="gp-controls-row">

        {/* Tabs */}
        <div className="gp-tabs-bar">
          {TABS.map((t) => {
            const count = t.key === "my"
              ? myGoals.length
              : t.key === "manager"
              ? managerGoals.length
              : goals.length;
            return (
              <button
                key={t.key}
                className={`gp-tab${activeTab === t.key ? " active" : ""}`}
                onClick={() => { setActiveTab(t.key); setFilter("All"); }}
              >
                <i className={`bi ${t.icon}`}></i>
                {t.label}
                <span className="gp-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Status filter chips */}
        <div className="gp-filter-chips">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              className={`gp-filter-chip${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "All"        && <><i className="bi bi-grid-3x3-gap"></i> All</>}
              {f === "NotStarted" && <><i className="bi bi-circle"></i> Not Started</>}
              {f === "InProgress" && <><i className="bi bi-arrow-repeat"></i> In Progress</>}
              {f === "Completed"  && <><i className="bi bi-check-circle-fill"></i> Completed</>}
              {f !== "All" && (
                <span className="gp-chip-count">
                  {tabGoals.filter((g) => g.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      {loading ? <Loader /> : (
        <>
          {/* ──────────────────────────────────────────
              ACTIVE GOALS SECTION
              Shows NotStarted + InProgress only.
              Never shows Completed goals here.
          ────────────────────────────────────────── */}
          {filter !== "Completed" && (
            <>
              <div className="gp-section-header">
                <div className="gp-section-icon-wrap">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <div className="gp-section-title">Active Goals</div>
                <span className="gp-section-count">{filteredActive.length}</span>
              </div>

              {filteredActive.length === 0 ? (
                <EmptyState
                  icon={<i className="bi bi-bullseye"></i>}
                  title={
                    filter !== "All"
                      ? `No ${badgeLabel[filter] || filter} goals`
                      : activeTab === "my"
                      ? "No active personal goals"
                      : activeTab === "manager"
                      ? "No active goals assigned"
                      : "No active goals"
                  }
                  desc={
                    filter !== "All"
                      ? "Try a different filter."
                      : "Click Add Goal to create your first goal."
                  }
                />
              ) : (
                <div className="gp-goals-grid">
                  {filteredActive.map((g, i) => renderGoalCard(g, i))}
                </div>
              )}
            </>
          )}

          {/* ──────────────────────────────────────────
              COMPLETED GOALS SECTION
              Always isolated. Never mixed with active.
          ────────────────────────────────────────── */}
          {(filter === "All" || filter === "Completed") && completedGoals.length > 0 && (
            <>
              <div className="gp-section-header gp-section-header--completed">
                <div className="gp-section-icon-wrap gp-section-icon-wrap--green">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div className="gp-section-title gp-section-title--completed">
                  Completed Goals
                </div>
                <span className="gp-section-count gp-section-count--completed">
                  {completedGoals.length}
                </span>
              </div>

              <div className="gp-goals-grid">
                {completedGoals.map((g, i) => renderGoalCard(g, i))}
              </div>
            </>
          )}

          {/* Empty state when Completed filter is active but no completed goals */}
          {filter === "Completed" && completedGoals.length === 0 && (
            <EmptyState
              icon={<i className="bi bi-check-circle"></i>}
              title="No completed goals yet"
              desc="Goals you finish will appear here."
            />
          )}
        </>
      )}

      {showModal && (
        <GoalFormModal
          goal={editGoal}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditGoal(null); }}
          submitting={submitting}
        />
      )}
    </div>
  );
}
