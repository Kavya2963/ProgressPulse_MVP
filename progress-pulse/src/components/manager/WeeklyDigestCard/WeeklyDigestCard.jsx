import "./WeeklyDigestCard.css";

const QUALITY_CONFIG = {
  Excellent: { cls: "wdc-quality--excellent", icon: "bi-stars" },
  High:      { cls: "wdc-quality--high",      icon: "bi-star-fill" },
  Medium:    { cls: "wdc-quality--medium",     icon: "bi-star-half" },
  Low:       { cls: "wdc-quality--low",        icon: "bi-star" },
};

export default function WeeklyDigestCard({ digest, onComment }) {
  const qConfig = QUALITY_CONFIG[digest.qualityLabel] || QUALITY_CONFIG.Low;

  return (
    <div className={`wdc-card ${!digest.submitted ? "wdc-card--missing" : ""}`}>

      {/* Card Header */}
      <div className="wdc-header">
        <div className="wdc-emp-row">
          <div className="wdc-avatar">
            {digest.employeeName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="wdc-emp-name">{digest.employeeName}</div>
            <div className="wdc-week-label">
              <i className="bi bi-calendar3 me-1"></i>
              {digest.weekStart} – {digest.weekEnd}
            </div>
          </div>
        </div>

        {/* Submitted / Not Submitted Badge */}
        {digest.submitted ? (
          <span className="wdc-status wdc-status--submitted">
            <i className="bi bi-check-circle-fill me-1"></i>Submitted
          </span>
        ) : (
          <span className="wdc-status wdc-status--missing">
            <i className="bi bi-x-circle-fill me-1"></i>Not Submitted
          </span>
        )}
      </div>

      {/* Not Submitted — no more content */}
      {!digest.submitted ? (
        <div className="wdc-no-log">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No log submitted this week
        </div>
      ) : (
        <>
          {/* Log Title + Impact */}
          <div className="wdc-log-info">
            <div className="wdc-log-title">
              <i className="bi bi-journal-text me-2"></i>
              {digest.logTitle}
            </div>
            {digest.impact && (
              <div className="wdc-log-impact">
                <i className="bi bi-lightning-charge me-1"></i>
                {digest.impact}
              </div>
            )}
          </div>

          {/* Week Summary Row */}
          <div className="wdc-summary-row">
            <div className="wdc-summary-chip">
              <i className="bi bi-paperclip me-1"></i>
              {digest.attachmentsCount} Attachment{digest.attachmentsCount !== 1 ? "s" : ""}
            </div>
            <div className="wdc-summary-chip">
              <i className="bi bi-chat-left-text me-1"></i>
              {digest.commentsCount} Comment{digest.commentsCount !== 1 ? "s" : ""}
            </div>
            <div className={`wdc-summary-chip wdc-quality ${qConfig.cls}`}>
              <i className={`bi ${qConfig.icon} me-1`}></i>
              {digest.qualityLabel} Quality
            </div>
          </div>

          {/* Goals Section */}
          {digest.goals?.length > 0 && (
            <div className="wdc-goals-section">
              <div className="wdc-goals-title">
                <i className="bi bi-flag me-2"></i>Goals Progress
              </div>

              {digest.goals.map((goal) => (
                <div className="wdc-goal-row" key={goal.goalId}>
                  <div className="wdc-goal-top">
                    <div className="wdc-goal-name">{goal.title}</div>
                    <div className="wdc-goal-badges">
                      {goal.createdBy === "manager" && (
                        <span className="wdc-badge wdc-badge--manager">
                          <i className="bi bi-person-check me-1"></i>Assigned
                        </span>
                      )}
                      <span className={`wdc-badge wdc-badge--status wdc-status-${goal.status?.toLowerCase()}`}>
                        {goal.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="wdc-goal-progress-wrap">
                    <div className="wdc-goal-progress-track">
                      <div
                        className="wdc-goal-progress-fill"
                        style={{ width: `${goal.progressPercentage}%` }}
                      />
                    </div>
                    <span className="wdc-goal-pct">{goal.progressPercentage}%</span>
                  </div>

                  {/* Logs linked this week */}
                  {goal.linkedLogTitles?.length > 0 ? (
                    <div className="wdc-goal-logs">
                      {goal.linkedLogTitles.map((t, i) => (
                        <span key={i} className="wdc-log-chip">
                          <i className="bi bi-journal-text me-1"></i>{t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="wdc-goal-no-log">
                      <i className="bi bi-dash-circle me-1"></i>No log linked this week
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="wdc-footer">
            <button
              className="wdc-btn-comment"
              onClick={() => onComment({ id: digest.logId, title: digest.logTitle })}
            >
              <i className="bi bi-chat-left-text me-1"></i>Add Comment
            </button>
          </div>
        </>
      )}
    </div>
  );
}
