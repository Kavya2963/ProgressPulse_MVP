import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getUserLogs, getLogComments } from "../../services/weeklyLogService";
import { getUserGoals } from "../../services/goalService";
import {
  uploadAttachments,
  getAttachments,
  getDownloadUrl,
} from "../../services/attachmentService";
import { createWeeklyLog } from "../../services/weeklyLogService";
import Loader from "../../components/shared/Loader/Loader";
import EmptyState from "../../components/shared/EmptyState/EmptyState";
import LogFormModal from "../../components/logs/LogFormModal/LogFormModal";
import { formatDate } from "../../utils/dateFormatter";
import "./WeeklyLogsPage.css";

const fileIcon = (fileName) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "pdf")                          return "bi-file-earmark-pdf-fill";
  if (["png","jpg","jpeg"].includes(ext))     return "bi-file-earmark-image-fill";
  return "bi-file-earmark-fill";
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function WeeklyLogsPage() {
  const navigate = useNavigate();

  const [logs, setLogs]                 = useState([]);
  const [goals, setGoals]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterGoalId, setFilterGoalId] = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");

  const [expandedSection, setExpandedSection]       = useState({});
  const [commentsMap, setCommentsMap]               = useState({});
  const [attachmentsMap, setAttachmentsMap]         = useState({});
  const [commentsLoading, setCommentsLoading]       = useState({});
  const [attachmentsLoading, setAttachmentsLoading] = useState({});

  const fetchData = async (goalId = "") => {
    setLoading(true);
    try {
      const [logsData, goalsData] = await Promise.all([
        getUserLogs(goalId || undefined),
        getUserGoals(),
      ]);
      setLogs(logsData || []);
      setGoals(goalsData || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFilter = () => fetchData(filterGoalId);

  const handleToggle = async (logId, section) => {
    const current = expandedSection[logId];
    if (current === section) {
      setExpandedSection((p) => ({ ...p, [logId]: null }));
      return;
    }
    setExpandedSection((p) => ({ ...p, [logId]: section }));

    if (section === "comments" && !commentsMap[logId]) {
      setCommentsLoading((p) => ({ ...p, [logId]: true }));
      try {
        const data = await getLogComments(logId);
        setCommentsMap((p) => ({ ...p, [logId]: data || [] }));
      } catch {
        toast.error("Failed to load comments");
        setCommentsMap((p) => ({ ...p, [logId]: [] }));
      } finally {
        setCommentsLoading((p) => ({ ...p, [logId]: false }));
      }
    }

    if (section === "attachments" && !attachmentsMap[logId]) {
      const logObj = logs.find((l) => l.id === logId);
      if (logObj?.attachments?.length > 0) {
        setAttachmentsMap((p) => ({ ...p, [logId]: logObj.attachments }));
      } else {
        setAttachmentsLoading((p) => ({ ...p, [logId]: true }));
        try {
          const data = await getAttachments(logId);
          setAttachmentsMap((p) => ({ ...p, [logId]: data || [] }));
        } catch {
          toast.error("Failed to load attachments");
          setAttachmentsMap((p) => ({ ...p, [logId]: [] }));
        } finally {
          setAttachmentsLoading((p) => ({ ...p, [logId]: false }));
        }
      }
    }
  };

  const handleSave = async (form, files) => {
    setSubmitting(true);
    try {
      const newLog = await createWeeklyLog(form);
      toast.success("Weekly log submitted!");
      if (files?.length > 0 && newLog?.id) {
        await uploadAttachments(newLog.id, files);
        toast.success("Attachments uploaded!");
      }
      setShowModal(false);
      setAttachmentsMap({});
      setCommentsMap({});
      setExpandedSection({});
      fetchData(filterGoalId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit log");
    } finally {
      setSubmitting(false);
    }
  };

  /* Client-side search */
  const filteredLogs = searchQuery.trim()
    ? logs.filter(
        (l) =>
          l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.impact?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  const totalAttachments = logs.reduce((s, l) => s + (l.attachments?.length ?? 0), 0);
  const totalComments    = logs.reduce((s, l) => s + (l.commentsCount ?? l.CommentsCount ?? 0), 0);

  return (
    <div className="wlp-page">

      {/* ── BREADCRUMB — tl-breadcrumbs exact, no back button ── */}
      <div className="wlp-breadcrumb-row">
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
                <i className="bi bi-journal-text me-1"></i>Weekly Logs
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* ── HEADER ── */}
      <div className="wlp-header-row">
        <div className="wlp-header-left">
          <div className="wlp-header-icon">
            <i className="bi bi-journal-text"></i>
          </div>
          <div>
            <div className="wlp-page-title">Weekly Logs</div>
            <div className="wlp-page-sub">
              Document your weekly work and link logs to your goals
            </div>
          </div>
        </div>
        <button className="wlp-submit-btn" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg"></i> Submit Log
        </button>
      </div>

      {/* ── STATS ROW ── */}
      {!loading && (
        <div className="wlp-stats-row">
          <div className="wlp-stat-card">
            <div className="wlp-stat-icon wlp-stat-icon--purple">
              <i className="bi bi-journal-richtext"></i>
            </div>
            <div className="wlp-stat-body">
              <div className="wlp-stat-val">{logs.length}</div>
              <div className="wlp-stat-label">Total Logs</div>
            </div>
          </div>
          <div className="wlp-stat-card">
            <div className="wlp-stat-icon wlp-stat-icon--blue">
              <i className="bi bi-flag-fill"></i>
            </div>
            <div className="wlp-stat-body">
              <div className="wlp-stat-val">{goals.length}</div>
              <div className="wlp-stat-label">Goals</div>
            </div>
          </div>
          <div className="wlp-stat-card">
            <div className="wlp-stat-icon wlp-stat-icon--green">
              <i className="bi bi-paperclip"></i>
            </div>
            <div className="wlp-stat-body">
              <div className="wlp-stat-val">{totalAttachments}</div>
              <div className="wlp-stat-label">Attachments</div>
            </div>
          </div>
          <div className="wlp-stat-card">
            <div className="wlp-stat-icon wlp-stat-icon--yellow">
              <i className="bi bi-chat-left-text-fill"></i>
            </div>
            <div className="wlp-stat-body">
              <div className="wlp-stat-val">{totalComments}</div>
              <div className="wlp-stat-label">Comments</div>
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER + SEARCH BAR ── */}
      <div className="wlp-filter-bar">
        {/* Goal filter */}
        <div className="wlp-filter-group">
          <label className="wlp-filter-label">
            <i className="bi bi-flag"></i> Filter by Goal
          </label>
          <select
            className="wlp-filter-select"
            value={filterGoalId}
            onChange={(e) => setFilterGoalId(e.target.value)}
          >
            <option value="">All Goals</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>

        <button className="wlp-filter-btn" onClick={handleFilter}>
          <i className="bi bi-funnel-fill"></i> Apply
        </button>

        {filterGoalId && (
          <button
            className="wlp-filter-clear"
            onClick={() => { setFilterGoalId(""); fetchData(""); }}
          >
            <i className="bi bi-x-circle"></i> Clear
          </button>
        )}

        {/* Divider */}
        <div className="wlp-filter-divider"></div>

        {/* Search */}
        <div className="wlp-filter-group">
          <label className="wlp-filter-label">
            <i className="bi bi-search"></i> Search Logs
          </label>
          <div className="wlp-search-wrap">
            <i className="bi bi-search wlp-search-icon"></i>
            <input
              className="wlp-search-input"
              type="text"
              placeholder="Search title, description, impact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="wlp-search-clear"
                onClick={() => setSearchQuery("")}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── LOG COUNT ── */}
      {!loading && (
        <div className="wlp-log-count">
          <span className="wlp-count-dot"></span>
          Showing <strong>{filteredLogs.length}</strong> of{" "}
          <strong>{logs.length}</strong> log{logs.length !== 1 ? "s" : ""}
          {filterGoalId && (
            <span className="wlp-count-tag">
              <i className="bi bi-flag-fill"></i> Goal filtered
            </span>
          )}
          {searchQuery && (
            <span className="wlp-count-tag">
              <i className="bi bi-search"></i> "{searchQuery}"
            </span>
          )}
        </div>
      )}

      {/* ── CONTENT ── */}
      {loading ? (
        <Loader />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={<i className="bi bi-journal-x"></i>}
          title={searchQuery ? "No matching logs" : "No logs found"}
          desc={
            searchQuery
              ? `No logs match "${searchQuery}".`
              : "Submit your first weekly log to start tracking your work."
          }
        />
      ) : (
        <div className="wlp-logs-grid">
          {filteredLogs.map((log, idx) => {
            const activeSection        = expandedSection[log.id];
            const comments             = commentsMap[log.id]    || [];
            const attachments          = attachmentsMap[log.id] || [];
            const commentCount         = log.commentsCount ?? log.CommentsCount ?? 0;
            const attachmentCount      = attachmentsMap[log.id]?.length ?? log.attachments?.length ?? 0;
            const isCommentsLoading    = commentsLoading[log.id]    || false;
            const isAttachmentsLoading = attachmentsLoading[log.id] || false;

            return (
              <div
                className={`wlp-log-card${activeSection ? " wlp-log-card--expanded" : ""}`}
                key={log.id}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* Card Header */}
                <div className="wlp-card-header">
                  <div className="wlp-card-index">#{idx + 1}</div>
                  <div className="wlp-log-title">{log.title}</div>
                </div>

                {log.description && (
                  <div className="wlp-log-desc">{log.description}</div>
                )}

                {log.impact && (
                  <div className="wlp-log-impact-wrap">
                    <div className="wlp-log-impact-label">
                      <i className="bi bi-lightning-charge-fill"></i> Impact
                    </div>
                    <div className="wlp-log-impact">{log.impact}</div>
                  </div>
                )}

                {/* Linked Goals */}
                {log.goals?.length > 0 && (
                  <div className="wlp-log-goals">
                    {log.goals.map((g) => (
                      <span key={g.id} className="wlp-log-goal-tag">
                        <i className="bi bi-flag-fill"></i> {g.title}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="wlp-log-footer">
                  <div className="wlp-log-date">
                    <i className="bi bi-calendar3"></i>
                    {formatDate(log.createdAt || log.weekStartDate)}
                  </div>
                  <div className="wlp-log-meta-chips">
                    {commentCount > 0 && (
                      <span className="wlp-meta-chip wlp-meta-chip--purple">
                        <i className="bi bi-chat-left-text-fill"></i> {commentCount}
                      </span>
                    )}
                    {attachmentCount > 0 && (
                      <span className="wlp-meta-chip wlp-meta-chip--blue">
                        <i className="bi bi-paperclip"></i> {attachmentCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Toggle Buttons */}
                <div className="wlp-toggle-btns">
                  <button
                    className={`wlp-toggle-btn${activeSection === "comments" ? " active" : ""}`}
                    onClick={() => handleToggle(log.id, "comments")}
                  >
                    <i className={`bi ${activeSection === "comments" ? "bi-chevron-up" : "bi-chat-left-text"}`}></i>
                    Comments ({commentCount})
                  </button>
                  <button
                    className={`wlp-toggle-btn${activeSection === "attachments" ? " active" : ""}`}
                    onClick={() => handleToggle(log.id, "attachments")}
                  >
                    <i className={`bi ${activeSection === "attachments" ? "bi-chevron-up" : "bi-paperclip"}`}></i>
                    Attachments ({attachmentCount})
                  </button>
                </div>

                {/* Comments Panel */}
                {activeSection === "comments" && (
                  <div className="wlp-section-panel">
                    {isCommentsLoading ? (
                      <div className="wlp-panel-loading">
                        <i className="bi bi-hourglass-split"></i> Loading comments...
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="wlp-panel-empty">
                        <i className="bi bi-chat-left"></i> No manager comments yet.
                      </div>
                    ) : (
                      <div className="wlp-comments-list">
                        {comments.map((c) => (
                          <div className="wlp-comment-item" key={c.id}>
                            <div className="wlp-comment-header">
                              <span className="wlp-comment-manager">
                                <i className="bi bi-person-badge-fill"></i> {c.managerName}
                              </span>
                              <span className="wlp-comment-date">
                                <i className="bi bi-clock"></i> {formatDate(c.createdAt)}
                              </span>
                            </div>
                            <div className="wlp-comment-text">{c.comment}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments Panel */}
                {activeSection === "attachments" && (
                  <div className="wlp-section-panel">
                    {isAttachmentsLoading ? (
                      <div className="wlp-panel-loading">
                        <i className="bi bi-hourglass-split"></i> Loading attachments...
                      </div>
                    ) : attachments.length === 0 ? (
                      <div className="wlp-panel-empty">
                        <i className="bi bi-paperclip"></i> No attachments uploaded.
                      </div>
                    ) : (
                      <div className="wlp-attachments-list">
                        {attachments.map((a, i) => (
                          <div className="wlp-attachment-item" key={i}>
                            <div className="wlp-attachment-left">
                              <i className={`bi ${fileIcon(a.fileName)} wlp-file-icon`}></i>
                              <div className="wlp-attachment-info">
                                <div className="wlp-attachment-name">{a.fileName}</div>
                                <div className="wlp-attachment-size">{formatSize(a.fileSize)}</div>
                              </div>
                            </div>
                            <a
                              href={getDownloadUrl(a.filePath)}
                              target="_blank"
                              rel="noreferrer"
                              className="wlp-download-btn"
                              download={a.fileName}
                            >
                              <i className="bi bi-download"></i> Download
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <LogFormModal
          goals={goals}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
}
