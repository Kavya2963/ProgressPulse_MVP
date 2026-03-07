import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getEmployeeSummary } from "../../services/managerService";
import Loader from "../../components/shared/Loader/Loader";
import AIInsightCard from "../../components/shared/AIInsightCard/AIInsightCard";
import { getGoalSummary, getProgressInsight } from "../../services/aiService";

import "./EmployeeSummaryPage.css";

const QualityBadge = ({ label }) => {
  const map = {
    Excellent: "es-quality--green",
    High:      "es-quality--blue",
    Medium:    "es-quality--yellow",
    Low:       "es-quality--red",
  };
  return (
    <span className={`es-quality-badge ${map[label] ?? "es-quality--gray"}`}>
      {label}
    </span>
  );
};

const getProgressColor = (pct) => {
  if (pct >= 100) return "#059669";
  if (pct >= 60)  return "#0284c7";
  if (pct >= 30)  return "#d97706";
  return "#dc2626";
};

export default function EmployeeSummaryPage() {
  const { employeeId } = useParams();
  const navigate       = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployeeSummary(employeeId)
      .then(setData)
      .catch(() => toast.error("Failed to load employee summary"))
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (loading) return <Loader />;
  if (!data)   return <div className="es-page"><p>No data available.</p></div>;

  const completionPct = data.averageCompletionPercentage ?? 0;

  return (
    <div className="es-page">

    {/* ── BREADCRUMB + BACK ── */}
<div className="es-topbar">
  

  <nav className="es-breadcrumb" aria-label="breadcrumb">
    <ol className="es-breadcrumb-list">
      <li className="es-breadcrumb-item">
        <i className="bi bi-house-door me-1"></i>
        <span onClick={() => navigate("/dashboard")} className="es-breadcrumb-link">
          Dashboard
        </span>
      </li>
      <li className="es-breadcrumb-sep"><i className="bi bi-chevron-right"></i></li>
      <li className="es-breadcrumb-item">
        <span onClick={() => navigate("/manager/team")} className="es-breadcrumb-link">
          My Team
        </span>
      </li>
      <li className="es-breadcrumb-sep"><i className="bi bi-chevron-right"></i></li>
      <li className="es-breadcrumb-item es-breadcrumb-item--active">
        <i className="bi bi-person-lines-fill me-1"></i>
        {data.employeeName ?? "Employee Summary"}
      </li>
    </ol>
  </nav>
</div>


      {/* ── HERO ── */}
      <div className="es-hero-card">
        <div className="es-hero-left">
          <div className="es-hero-avatar">
            {data.employeeName?.charAt(0).toUpperCase()}
          </div>
          <div className="es-hero-info">
            <div className="es-hero-name">{data.employeeName}</div>
            <div className="es-hero-sub">
              <i className="bi bi-calendar3 me-1"></i>
              90-day performance snapshot
            </div>
          </div>
        </div>
      </div>

      {/* ── SNAPSHOT STATS ── */}
      <div className="es-stats-grid">
        <div className="es-stat-card">
          <div className="es-stat-icon es-icon--purple">
            <i className="bi bi-flag-fill"></i>
          </div>
          <div className="es-stat-body">
            <div className="es-stat-value">{data.totalGoals ?? "—"}</div>
            <div className="es-stat-label">Total Goals</div>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon es-icon--green">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="es-stat-body">
            <div className="es-stat-value">{data.completedGoals ?? "—"}</div>
            <div className="es-stat-label">Completed</div>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon es-icon--yellow">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <div className="es-stat-body">
            <div className="es-stat-value">{data.inProgressGoals ?? "—"}</div>
            <div className="es-stat-label">In Progress</div>
          </div>
        </div>

        <div className="es-stat-card">
          <div className="es-stat-icon es-icon--blue">
            <i className="bi bi-journal-text"></i>
          </div>
          <div className="es-stat-body">
            <div className="es-stat-value">{data.totalLogsLast90Days ?? "—"}</div>
            <div className="es-stat-label">Logs (90 Days)</div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ROW ── */}
      <div className="es-main-row">

        {/* ── GOALS CARD ── */}
        <div className="es-goals-card">
          <div className="es-card-header">
            <div className="es-card-title">
              <i className="bi bi-flag"></i>
              Goal Progress
            </div>
            <div className="es-card-meta">
              {data.totalGoals} goal{data.totalGoals !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="es-card-body">

            {/* Overall bar */}
            <div className="es-overall-bar-wrap">
              <div className="es-overall-bar-header">
                <span className="es-overall-bar-label">Overall Completion</span>
                <span className="es-overall-bar-pct">{completionPct}%</span>
              </div>
              <div className="es-overall-track">
                <div
                  className="es-overall-fill"
                  style={{
                    width: `${completionPct}%`,
                    background: getProgressColor(completionPct),
                  }}
                />
              </div>
              <div className="es-overall-status-row">
                <span className={`es-status-chip ${
                  completionPct >= 75 ? "es-chip--green"
                  : completionPct >= 40 ? "es-chip--blue"
                  : "es-chip--red"
                }`}>
                  {completionPct >= 75 ? "On Track"
                    : completionPct >= 40 ? "In Progress"
                    : "Needs Attention"}
                </span>
                <span className="es-goals-legend">
                  <span className="es-legend-dot es-legend-dot--green"></span>
                  {data.completedGoals} done
                  <span className="es-legend-dot es-legend-dot--blue"></span>
                  {data.inProgressGoals} in progress
                </span>
              </div>
            </div>

            {/* Individual goals */}
            {data.goals?.length > 0 ? (
              <div className="es-goal-list">
                {data.goals.map((g) => (
                  <div key={g.goalId} className="es-goal-item">
                    <div className="es-goal-item-header">
                      <div className="es-goal-item-left">
                        <span className="es-goal-title">{g.title}</span>
                        <div className="es-goal-tags">
                          <span className={`es-goal-tag ${
                            g.createdBy === "manager"
                              ? "es-goal-tag--purple"
                              : "es-goal-tag--gray"
                          }`}>
                            {g.createdBy === "manager"
                              ? <><i className="bi bi-person-badge me-1"></i>Manager</>
                              : <><i className="bi bi-person me-1"></i>Self</>}
                          </span>
                          {g.category && (
                            <span className="es-goal-tag es-goal-tag--blue">
                              {g.category}
                            </span>
                          )}
                          {g.isOverdue && (
                            <span className="es-goal-tag es-goal-tag--red">
                              <i className="bi bi-exclamation-triangle me-1"></i>Overdue
                            </span>
                          )}
                          {g.progressPercentage >= 100 && (
                            <span className="es-goal-tag es-goal-tag--green">
                              <i className="bi bi-check-circle me-1"></i>Done
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className="es-goal-pct"
                        style={{ color: getProgressColor(g.progressPercentage) }}
                      >
                        {g.progressPercentage}%
                      </span>
                    </div>
                    <div className="es-goal-bar-track">
                      <div
                        className="es-goal-bar-fill"
                        style={{
                          width: `${g.progressPercentage}%`,
                          background: getProgressColor(g.progressPercentage),
                        }}
                      />
                    </div>
                    {g.dueDate && (
                      <div className={`es-goal-due ${g.isOverdue ? "es-goal-due--red" : ""}`}>
                        <i className="bi bi-calendar-event me-1"></i>
                        Due: {new Date(g.dueDate).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="es-empty-goals">
                <i className="bi bi-flag"></i>
                No goals assigned yet.
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="es-right-col">
          {/* ── AI INSIGHT ── */}
<AIInsightCard
  title="AI Goal Summary"
  onFetch={() => getGoalSummary(data.employeeName, data.goals)}
/>

<AIInsightCard
  title="AI Progress Insight"
  onFetch={() => getProgressInsight(data.employeeName, data.goals)}
/>


          {data.summary && (
            <div className="es-summary-card">
              <div className="es-card-header">
                <div className="es-card-title">
                  <i className="bi bi-clipboard2-pulse"></i>
                  Performance Summary
                </div>
              </div>
              <div className="es-card-body">
                <p className="es-summary-text">{data.summary}</p>
              </div>
            </div>
          )}

          <div className="es-recent-card">
            <div className="es-card-header">
              <div className="es-card-title">
                <i className="bi bi-journal-text"></i>
                Recent Logs
              </div>
              <div className="es-card-meta">Last 90 days</div>
            </div>
            <div className="es-card-body">
              {data.recentLogs?.length > 0 ? (
                <div className="es-log-list">
                  {data.recentLogs.map((log) => (
                    <div key={log.id} className="es-log-item">
                      <div className="es-log-item-header">
                        <span className="es-log-title">{log.title}</span>
                        <QualityBadge label={log.qualityLabel} />
                      </div>
                      {log.impact && (
                        <div className="es-log-impact">
                          <i className="bi bi-lightning-charge me-1"></i>
                          {log.impact}
                        </div>
                      )}
                      <div className="es-log-meta">
                        <span>
                          <i className="bi bi-flag me-1"></i>
                          {log.goalsLinked} goal{log.goalsLinked !== 1 ? "s" : ""} linked
                        </span>
                        <span>
                          <i className="bi bi-calendar3 me-1"></i>
                          {new Date(log.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="es-empty-logs">
                  <i className="bi bi-inbox me-2"></i>
                  No logs submitted in the last 90 days.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
