import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAppraisalReport } from "../../services/managerService";
import Loader from "../../components/shared/Loader/Loader";
import "./AppraisalReportPage.css";

const ScoreBar = ({ score, color = "purple" }) => (
  <div className="ar-score-bar-wrap">
    <div
      className={`ar-score-bar ar-score-bar--${color}`}
      style={{ width: `${Math.min(score, 100)}%` }}
    />
  </div>
);

const getRatingColor = (score) => {
  if (score >= 90) return "green";
  if (score >= 75) return "blue";
  if (score >= 60) return "yellow";
  if (score >= 45) return "orange";
  return "red";
};

export default function AppraisalReportPage() {
  const { employeeId } = useParams();
  const navigate       = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppraisalReport(employeeId)
      .then(setData)
      .catch(() => toast.error("Failed to load appraisal report"))
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (loading) return <Loader />;
  if (!data)   return <div className="ar-page"><p>No data available.</p></div>;

  const maxLogs = Math.max(
    ...(data.quarterlyActivity?.map((q) => q.logsCount) || [1]), 1
  );

  const overallColor = getRatingColor(data.overallAppraisalScore ?? 0);

  return (
    <div className="ar-page">

      {/* ── BACK ── */}
      <button className="ar-back-btn" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1"></i>Back
      </button>

      {/* ── HERO ── */}
      <div className="ar-hero-card">
        <div className="ar-hero-left">
          <div className="ar-hero-avatar">
            {data.employeeName?.charAt(0).toUpperCase()}
          </div>
          <div className="ar-hero-info">
            <div className="ar-hero-name">{data.employeeName}</div>
            <div className="ar-hero-sub">
              <i className="bi bi-calendar-range me-1"></i>
              {data.appraisalPeriod ?? "Last 12 months"}
            </div>
          </div>
        </div>
        <div className="ar-hero-badge">
          <i className="bi bi-file-earmark-bar-graph-fill me-1"></i>
          Appraisal Report
        </div>
      </div>

      {/* ── OVERALL SCORE ── */}
      <div className={`ar-overall-card ar-overall-card--${overallColor}`}>
        <div className="ar-overall-left">
          <div className="ar-overall-score-wrap">
            <div className={`ar-overall-score ar-overall-score--${overallColor}`}>
              {data.overallAppraisalScore ?? "—"}
            </div>
            <div className="ar-overall-max">/100</div>
          </div>
          <div>
            <div className={`ar-overall-label ar-overall-label--${overallColor}`}>
              {data.overallRatingLabel ?? "—"}
            </div>
            <div className="ar-overall-sub">Overall Appraisal Score</div>
            <ScoreBar score={data.overallAppraisalScore ?? 0} color={overallColor} />
          </div>
        </div>
        <div className="ar-overall-right">
          <div className="ar-overall-formula">
            <div className="ar-formula-title">Score Composition</div>
            <div className="ar-formula-row">
              <span className="ar-formula-dot ar-formula-dot--blue"></span>
              Goal Intelligence
              <span className="ar-formula-pct">45%</span>
              <span className="ar-formula-score">
                {data.goalIntelligenceScore ?? "—"}
              </span>
            </div>
            <div className="ar-formula-row">
              <span className="ar-formula-dot ar-formula-dot--cyan"></span>
              Activity Intelligence
              <span className="ar-formula-pct">30%</span>
              <span className="ar-formula-score">
                {data.activityIntelligenceScore ?? "—"}
              </span>
            </div>
            <div className="ar-formula-row">
              <span className="ar-formula-dot ar-formula-dot--purple"></span>
              Engagement Intelligence
              <span className="ar-formula-pct">25%</span>
              <span className="ar-formula-score">
                {data.engagementIntelligenceScore ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3 INTELLIGENCE SCORE CARDS ── */}
      <div className="ar-intel-row">

        {/* Goal Intelligence */}
        <div className="ar-intel-card">
          <div className="ar-intel-header">
            <div className="ar-intel-icon ar-intel-icon--blue">
              <i className="bi bi-flag-fill"></i>
            </div>
            <div>
              <div className="ar-intel-title">Goal Intelligence</div>
              <div className="ar-intel-weight">45% of overall</div>
            </div>
            <div className="ar-intel-score ar-intel-score--blue">
              {data.goalIntelligenceScore ?? "—"}
            </div>
          </div>
          <ScoreBar score={data.goalIntelligenceScore ?? 0} color="blue" />

          <div className="ar-intel-breakdown">
            {/* Self vs Manager */}
            <div className="ar-breakdown-section">
              <div className="ar-breakdown-label">Self Goals</div>
              <div className="ar-breakdown-row">
                <span>{data.selfGoalsCompleted ?? 0} / {data.selfGoalsTotal ?? 0} completed</span>
                <div className="ar-mini-bar-wrap">
                  <div
                    className="ar-mini-bar ar-mini-bar--blue"
                    style={{
                      width: data.selfGoalsTotal
                        ? `${(data.selfGoalsCompleted / data.selfGoalsTotal) * 100}%`
                        : "0%"
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="ar-breakdown-section">
              <div className="ar-breakdown-label">Manager-Assigned Goals</div>
              <div className="ar-breakdown-row">
                <span>{data.managerGoalsCompleted ?? 0} / {data.managerGoalsTotal ?? 0} completed</span>
                <div className="ar-mini-bar-wrap">
                  <div
                    className="ar-mini-bar ar-mini-bar--purple"
                    style={{
                      width: data.managerGoalsTotal
                        ? `${(data.managerGoalsCompleted / data.managerGoalsTotal) * 100}%`
                        : "0%"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Due Date Row */}
            <div className="ar-intel-tags">
              <span className="ar-tag ar-tag--green">
                <i className="bi bi-check-circle me-1"></i>
                {data.onTimeGoals ?? 0} On Time
              </span>
              <span className="ar-tag ar-tag--red">
                <i className="bi bi-exclamation-circle me-1"></i>
                {data.overdueGoals ?? 0} Overdue
              </span>
              <span className="ar-tag ar-tag--gray">
                <i className="bi bi-calendar me-1"></i>
                {data.goalsWithDueDate ?? 0} with Due Date
              </span>
            </div>

            {/* Goal metrics */}
            <div className="ar-intel-metrics">
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val">{data.totalGoals ?? "—"}</div>
                <div className="ar-intel-metric-lbl">Total</div>
              </div>
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val ar-val--green">
                  {data.goalsCompleted ?? "—"}
                </div>
                <div className="ar-intel-metric-lbl">Done</div>
              </div>
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val ar-val--yellow">
                  {data.goalsInProgress ?? "—"}
                </div>
                <div className="ar-intel-metric-lbl">In Progress</div>
              </div>
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val">
                  {data.averageCompletionPercentage ?? "—"}%
                </div>
                <div className="ar-intel-metric-lbl">Avg %</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Intelligence */}
        <div className="ar-intel-card">
          <div className="ar-intel-header">
            <div className="ar-intel-icon ar-intel-icon--cyan">
              <i className="bi bi-journal-text"></i>
            </div>
            <div>
              <div className="ar-intel-title">Activity Intelligence</div>
              <div className="ar-intel-weight">30% of overall</div>
            </div>
            <div className="ar-intel-score ar-intel-score--cyan">
              {data.activityIntelligenceScore ?? "—"}
            </div>
          </div>
          <ScoreBar score={data.activityIntelligenceScore ?? 0} color="cyan" />

          <div className="ar-intel-breakdown">
            {/* Quality */}
            <div className="ar-breakdown-section">
              <div className="ar-breakdown-label">
                Avg Log Quality
                <span className="ar-breakdown-hint">
                  (Title + Desc + Impact + Goal + Attachment)
                </span>
              </div>
              <div className="ar-breakdown-row">
                <span>{data.averageLogQualityScore ?? 0} / 5</span>
                <div className="ar-mini-bar-wrap">
                  <div
                    className="ar-mini-bar ar-mini-bar--cyan"
                    style={{
                      width: `${((data.averageLogQualityScore ?? 0) / 5) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="ar-intel-tags">
              <span className="ar-tag ar-tag--blue">
                <i className="bi bi-lightning-fill me-1"></i>
                Current Streak: {data.currentWeekStreak ?? 0}w
              </span>
              <span className="ar-tag ar-tag--purple">
                <i className="bi bi-trophy me-1"></i>
                Best Streak: {data.longestWeekStreak ?? 0}w
              </span>
            </div>

            {/* Activity metrics */}
            <div className="ar-intel-metrics">
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val">{data.totalLogs ?? "—"}</div>
                <div className="ar-intel-metric-lbl">Total Logs</div>
              </div>
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val ar-val--green">
                  {data.activeMonths ?? "—"}
                </div>
                <div className="ar-intel-metric-lbl">Active Mo.</div>
              </div>
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val ar-val--red">
                  {data.inactiveMonths ?? "—"}
                </div>
                <div className="ar-intel-metric-lbl">Inactive Mo.</div>
              </div>
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val">
                  {data.volumeRate ?? "—"}%
                </div>
                <div className="ar-intel-metric-lbl">Volume Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Intelligence */}
        <div className="ar-intel-card">
          <div className="ar-intel-header">
            <div className="ar-intel-icon ar-intel-icon--purple">
              <i className="bi bi-chat-left-text-fill"></i>
            </div>
            <div>
              <div className="ar-intel-title">Engagement Intelligence</div>
              <div className="ar-intel-weight">25% of overall</div>
            </div>
            <div className="ar-intel-score ar-intel-score--purple">
              {data.engagementIntelligenceScore ?? "—"}
            </div>
          </div>
          <ScoreBar score={data.engagementIntelligenceScore ?? 0} color="purple" />

          <div className="ar-intel-breakdown">
            {/* Coverage */}
            <div className="ar-breakdown-section">
              <div className="ar-breakdown-label">Feedback Coverage</div>
              <div className="ar-breakdown-row">
                <span>{data.feedbackCoveragePercentage ?? 0}%</span>
                <div className="ar-mini-bar-wrap">
                  <div
                    className="ar-mini-bar ar-mini-bar--purple"
                    style={{ width: `${data.feedbackCoveragePercentage ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Rate */}
            <div className="ar-breakdown-section">
              <div className="ar-breakdown-label">
                Action Rate
                <span className="ar-breakdown-hint">
                  (goals updated after feedback)
                </span>
              </div>
              <div className="ar-breakdown-row">
                <span>{data.actionRate ?? 0}%</span>
                <div className="ar-mini-bar-wrap">
                  <div
                    className="ar-mini-bar ar-mini-bar--green"
                    style={{ width: `${data.actionRate ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recency tags */}
            <div className="ar-intel-tags">
              <span className="ar-tag ar-tag--green">
                <i className="bi bi-clock me-1"></i>
                {data.recentComments ?? 0} Recent (90d)
              </span>
              <span className="ar-tag ar-tag--gray">
                <i className="bi bi-archive me-1"></i>
                {data.oldComments ?? 0} Older
              </span>
            </div>

            {/* Engagement metrics */}
            <div className="ar-intel-metrics">
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val">
                  {data.totalManagerComments ?? "—"}
                </div>
                <div className="ar-intel-metric-lbl">Comments</div>
              </div>
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val">
                  {data.recencyRate ?? "—"}%
                </div>
                <div className="ar-intel-metric-lbl">Recency</div>
              </div>
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val">
                  {data.actedOnFeedbackCount ?? "—"}
                </div>
                <div className="ar-intel-metric-lbl">Acted On</div>
              </div>
              <div className="ar-intel-metric">
                <div className="ar-intel-metric-val">
                  {data.avgCommentLength ?? "—"}
                </div>
                <div className="ar-intel-metric-lbl">Avg Chars</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── IMPROVEMENT TREND BANNER ── */}
      {data.improvementTrend && (
        <div className="ar-trend-banner">
          <div className="ar-trend-banner-icon">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
          <div>
            <div className="ar-trend-banner-label">Improvement Trend</div>
            <div className="ar-trend-banner-text">{data.improvementTrend}</div>
          </div>
        </div>
      )}

      {/* ── QUARTERLY BREAKDOWN ── */}
      {data.quarterlyActivity?.length > 0 && (
        <div className="ar-section-card">
          <div className="ar-section-title">
            <div className="ar-section-icon-wrap ar-icon-wrap--teal">
              <i className="bi bi-calendar3"></i>
            </div>
            Quarterly Activity Breakdown
            <span className="ar-section-subtitle">
              (Appraisal year, not calendar year)
            </span>
          </div>
          <div className="ar-quarterly-grid">
            {data.quarterlyActivity.map((q, i) => (
              <div className="ar-quarter-box" key={i}>
                <div className="ar-quarter-label">{q.quarter}</div>
                <div className="ar-quarter-val">{q.logsCount}</div>
                <div className="ar-quarter-sub">logs submitted</div>
                <div className="ar-quarter-bar-wrap">
                  <div
                    className="ar-quarter-bar"
                    style={{
                      width: `${Math.min((q.logsCount / maxLogs) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── INACTIVITY ALERT ── */}
      {data.longestInactivityGapDays > 14 && (
        <div className="ar-inactivity-alert">
          <div className="ar-alert-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div>
            <div className="ar-alert-title">Inactivity Alert</div>
            <div className="ar-alert-text">
              Longest inactivity gap:
              <strong className="ms-1">{data.longestInactivityGapDays} days</strong>
              &nbsp;— consistent weekly submissions recommended.
            </div>
          </div>
        </div>
      )}

      {/* ── STRENGTH & RISK ── */}
      <div className="ar-section-card">
        <div className="ar-section-title">
          <div className="ar-section-icon-wrap ar-icon-wrap--green">
            <i className="bi bi-shield-check"></i>
          </div>
          Strength &amp; Risk Indicators
        </div>
        <div className="ar-sr-grid">
          <div className="ar-sr-col ar-sr-col--strength">
            <div className="ar-sr-heading ar-sr-heading--green">
              <i className="bi bi-check-circle-fill me-1"></i>
              Strengths ({data.strengthIndicators?.length ?? 0})
            </div>
            <ul className="ar-indicator-list">
              {data.strengthIndicators?.length > 0 ? (
                data.strengthIndicators.map((s, i) => (
                  <li key={i} className="ar-indicator-item">
                    <i className="bi bi-circle-fill ar-dot ar-dot--green"></i>{s}
                  </li>
                ))
              ) : (
                <li className="ar-indicator-empty">No strengths detected yet</li>
              )}
            </ul>
          </div>
          <div className="ar-sr-col ar-sr-col--risk">
            <div className="ar-sr-heading ar-sr-heading--red">
              <i className="bi bi-exclamation-circle-fill me-1"></i>
              Risk Areas ({data.riskIndicators?.length ?? 0})
            </div>
            <ul className="ar-indicator-list">
              {data.riskIndicators?.length > 0 ? (
                data.riskIndicators.map((r, i) => (
                  <li key={i} className="ar-indicator-item">
                    <i className="bi bi-circle-fill ar-dot ar-dot--red"></i>{r}
                  </li>
                ))
              ) : (
                <li className="ar-indicator-empty">No risk areas detected</li>
              )}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
