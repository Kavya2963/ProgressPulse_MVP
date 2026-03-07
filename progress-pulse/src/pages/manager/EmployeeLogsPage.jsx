import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  getTeamLogs,
  addComment,
  getWeeklyDigest,
} from "../../services/managerService";
import Loader from "../../components/shared/Loader/Loader";
import EmptyState from "../../components/shared/EmptyState/EmptyState";
import CommentModal from "../../components/logs/CommentModal/CommentModal";
import WeeklyDigestCard from "../../components/manager/WeeklyDigestCard/WeeklyDigestCard";
import { formatDate } from "../../utils/dateFormatter";
import { PAGINATION_DEFAULTS } from "../../constants/appConstants";
import "./EmployeeLogsPage.css";

const safeArray = (data) => {
  if (Array.isArray(data))        return data;
  if (Array.isArray(data?.data))  return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.logs))  return data.logs;
  return [];
};

const getWeekStart = (offset = 0) => {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
};

const TIME_RANGES = [
  { label: "This Week",     value: "week"    },
  { label: "This Month",    value: "month"   },
  { label: "Last 3 Months", value: "3months" },
  { label: "Custom",        value: "custom"  },
];

const getRangeDates = (range) => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  let start = new Date(now);
  if (range === "week") {
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(now.getDate() + diff);
  } else if (range === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (range === "3months") {
    start.setMonth(start.getMonth() - 3);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export default function EmployeeLogsPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  const empName  = location.state?.empName  || "Employee";
  const empEmail = location.state?.empEmail || "";

  const [view, setView]                   = useState("digest");
  const [digest, setDigest]               = useState(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [weekOffset, setWeekOffset]       = useState(0);
  const [weekStart, setWeekStart]         = useState(getWeekStart(0));

  const [logs, setLogs]                   = useState([]);
  const [logsLoading, setLogsLoading]     = useState(false);
  const [page, setPage]                   = useState(1);
  const [pageSize, setPageSize]           = useState(PAGINATION_DEFAULTS.PAGE_SIZE || 10);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalCount, setTotalCount]       = useState(0);
  const [timeRange, setTimeRange]         = useState("week");
  const [customDates, setCustomDates]     = useState({ startDate: "", endDate: "" });
  const [searchQuery, setSearchQuery]     = useState("");
  const [expandedRows, setExpandedRows]   = useState(new Set());

  const [selectedLog, setSelectedLog]     = useState(null);
  const [submitting, setSubmitting]       = useState(false);

  useEffect(() => {
    if (view === "digest") fetchDigest(weekStart);
    else fetchLogs(1);
  }, [id, view]);

  useEffect(() => {
    if (view !== "digest") return;
    fetchDigest(weekStart);
  }, [weekStart]);

  useEffect(() => {
    if (view !== "detailed") return;
    fetchLogs(page);
  }, [page, timeRange, pageSize]);

  const fetchDigest = async (ws = weekStart) => {
    setDigestLoading(true);
    try {
      const data = await getWeeklyDigest(id, ws);
      const arr  = Array.isArray(data) ? data : [data];
      setDigest(arr[0] || null);
    } catch {
      toast.error("Failed to fetch digest");
      setDigest(null);
    } finally {
      setDigestLoading(false);
    }
  };

  const fetchLogs = async (p = page) => {
    setLogsLoading(true);
    try {
      const { start, end } = getRangeDates(timeRange);
      const params = {
        page: p,
        pageSize,
        employeeId: id,
        startDate: timeRange === "custom" ? customDates.startDate : start.toISOString(),
        endDate:   timeRange === "custom" ? customDates.endDate   : end.toISOString(),
      };
      const data = await getTeamLogs(params);
      const list = safeArray(data);
      setLogs(list);
      setTotalCount(data?.totalCount ?? list.length);
      setTotalPages(
        data?.totalPages ||
        Math.ceil((data?.totalCount || list.length) / pageSize) || 1
      );
    } catch {
      toast.error("Failed to fetch logs");
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleWeekChange = (dir) => {
    const newOffset = weekOffset + dir;
    setWeekOffset(newOffset);
    setWeekStart(getWeekStart(newOffset));
  };

  const handleAddComment = async (comment) => {
    setSubmitting(true);
    try {
      await addComment({ weeklyLogId: selectedLog.id, comment });
      toast.success("Comment added.");
      setSelectedLog(null);
      if (view === "digest") fetchDigest(weekStart);
      else fetchLogs(page);
    } catch {
      toast.error("Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatWeekLabel = (date) => {
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  // Client-side search filter
  const filteredLogs = searchQuery.trim()
    ? logs.filter(
        (l) =>
          l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.impact?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  const startEntry = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry   = Math.min(page * pageSize, totalCount);

  return (
    <div className="el-page">

      {/* ── BREADCRUMB ROW ── */}
      <div className="el-breadcrumb-row">
        <button className="el-back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
        </button>

        {/* ✅ tl-breadcrumbs style */}
        <nav className="tl-breadcrumbs" aria-label="breadcrumb">
          <ol>
            <li>
              <span
                className="tl-bc-link"
                onClick={() => navigate("/manager")}
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
              <span
                className="tl-bc-link"
                onClick={() => navigate("/manager/team-logs")}
              >
                Team Logs
              </span>
            </li>
            <li>
              <span className="tl-bc-sep">
                <i className="bi bi-chevron-right"></i>
              </span>
            </li>
            <li>
              <span className="tl-bc-current">
                <i className="bi bi-person-lines-fill me-1"></i>
                {empName}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* ── HERO CARD ── */}
      <div className="el-hero-card">
        <div className="el-hero-left">
          <div className="el-hero-avatar">
            {empName.charAt(0).toUpperCase()}
          </div>
          <div className="el-hero-info">
            <div className="el-hero-name">{empName}</div>
            {empEmail && (
              <div className="el-hero-email">
                <i className="bi bi-envelope"></i>{empEmail}
              </div>
            )}
            <div className="el-hero-sub">
              <i className="bi bi-journal-text"></i> Logs &amp; Goal Progress
            </div>
          </div>
        </div>
        <div className="el-hero-actions">
          <Link className="el-hero-btn" to={`/manager/employee/${id}/summary`}>
            <i className="bi bi-person-lines-fill"></i> Summary
          </Link>
          <Link className="el-hero-btn el-hero-btn--green" to={`/manager/employee/${id}/appraisal`}>
            <i className="bi bi-bar-chart-line"></i> Appraisal
          </Link>
        </div>
      </div>

      {/* ── LOGS CARD ── */}
      <div className="el-logs-card">

        {/* Toolbar */}
        <div className="el-logs-toolbar">
          <div className="el-view-toggle">
            <button
              className={`el-toggle-btn ${view === "digest" ? "active" : ""}`}
              onClick={() => setView("digest")}
            >
              <i className="bi bi-grid-3x2-gap"></i> Digest
            </button>
            <button
              className={`el-toggle-btn ${view === "detailed" ? "active" : ""}`}
              onClick={() => setView("detailed")}
            >
              <i className="bi bi-table"></i> Detailed
            </button>
          </div>

          {view === "detailed" && !logsLoading && (
            <div className="el-toolbar-right">
              {/* Search */}
              <div className="el-search-box">
                <i className="bi bi-search el-search-icon"></i>
                <input
                  className="el-search-input"
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="el-search-clear" onClick={() => setSearchQuery("")}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>

              {/* Count pill */}
              <div className="el-count-pill">
                <span className="el-count-dot"></span>
                {startEntry}–{endEntry} of <strong>{totalCount}</strong>
              </div>
            </div>
          )}
        </div>

        {/* ── DIGEST VIEW ── */}
        {view === "digest" && (
          <div className="el-view-body">
            <div className="el-week-nav">
              <button className="el-week-btn" onClick={() => handleWeekChange(-1)}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <div className="el-week-label">
                <i className="bi bi-calendar-week"></i>
                {formatWeekLabel(weekStart)}
                {weekOffset === 0 && (
                  <span className="el-week-chip">This Week</span>
                )}
              </div>
              <button
                className="el-week-btn"
                onClick={() => handleWeekChange(1)}
                disabled={weekOffset >= 0}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>

            {digestLoading ? (
              <Loader />
            ) : !digest ? (
              <EmptyState
                icon={<i className="bi bi-inbox"></i>}
                title="No data for this week"
                desc="No log submitted or no goals assigned for this period."
              />
            ) : (
              <WeeklyDigestCard
                digest={digest}
                onComment={(log) => setSelectedLog(log)}
              />
            )}
          </div>
        )}

        {/* ── DETAILED VIEW ── */}
        {view === "detailed" && (
          <div className="el-view-body">

            {/* Time Range + Page Size Row */}
            <div className="el-filter-row">
              <div className="el-range-bar">
                <span className="el-range-label">
                  <i className="bi bi-clock-history"></i> Range
                </span>
                <div className="el-range-chips">
                  {TIME_RANGES.map((r) => (
                    <button
                      key={r.value}
                      className={`el-chip-btn ${timeRange === r.value ? "active" : ""}`}
                      onClick={() => { setTimeRange(r.value); setPage(1); }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page size selector */}
              <div className="el-pagesize-wrap">
                <span className="el-range-label">
                  <i className="bi bi-list-ol"></i> Show
                </span>
                <div className="el-pagesize-chips">
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      className={`el-chip-btn el-chip-btn--sm ${pageSize === s ? "active" : ""}`}
                      onClick={() => handlePageSizeChange(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Dates */}
            {timeRange === "custom" && (
              <div className="el-custom-dates">
                <div className="el-field">
                  <label className="el-field-label">
                    <i className="bi bi-calendar3"></i> Start Date
                  </label>
                  <input
                    className="el-field-input"
                    type="date"
                    value={customDates.startDate}
                    onChange={(e) =>
                      setCustomDates({ ...customDates, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="el-field">
                  <label className="el-field-label">
                    <i className="bi bi-calendar3"></i> End Date
                  </label>
                  <input
                    className="el-field-input"
                    type="date"
                    value={customDates.endDate}
                    onChange={(e) =>
                      setCustomDates({ ...customDates, endDate: e.target.value })
                    }
                  />
                </div>
                <button className="el-apply-btn" onClick={() => fetchLogs(1)}>
                  <i className="bi bi-search"></i> Apply
                </button>
              </div>
            )}

            {/* Table */}
            {logsLoading ? (
              <Loader />
            ) : filteredLogs.length === 0 ? (
              <EmptyState
                icon={<i className="bi bi-inbox"></i>}
                title={searchQuery ? "No matching logs" : "No logs found"}
                desc={
                  searchQuery
                    ? `No logs match "${searchQuery}".`
                    : "No logs submitted in this time range."
                }
              />
            ) : (
              <div className="el-table-wrap">
                <table className="el-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}></th>
                      <th><i className="bi bi-card-text"></i> Title</th>
                      <th><i className="bi bi-lightning-charge"></i> Impact</th>
                      <th><i className="bi bi-flag"></i> Goals</th>
                      <th><i className="bi bi-calendar3"></i> Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const isExpanded = expandedRows.has(log.id);
                      return (
                        <>
                          <tr
                            key={log.id}
                            className={isExpanded ? "el-tr-expanded" : ""}
                          >
                            {/* Expand toggle */}
                            <td>
                              <button
                                className="el-expand-btn"
                                onClick={() => toggleRow(log.id)}
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                <i className={`bi bi-chevron-${isExpanded ? "up" : "down"}`}></i>
                              </button>
                            </td>
                            <td className="el-td-title">{log.title}</td>
                            <td className="el-td-muted">
                              {log.impact || <span className="el-td-empty">—</span>}
                            </td>
                            <td>
                              {log.goals?.length > 0 ? (
                                <div className="el-tags">
                                  {log.goals.map((g) => (
                                    <span key={g.id} className="el-tag">
                                      <i className="bi bi-flag-fill"></i> {g.title}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="el-td-empty">—</span>
                              )}
                            </td>
                            <td className="el-td-date">
                              <i className="bi bi-calendar3"></i>
                              {formatDate(log.createdAt)}
                            </td>
                            <td>
                              <button
                                className="el-btn-sm"
                                onClick={() => setSelectedLog(log)}
                              >
                                <i className="bi bi-chat-left-text"></i> Comment
                              </button>
                            </td>
                          </tr>

                          {/* Expanded description row */}
                          {isExpanded && (
                            <tr key={`${log.id}-exp`} className="el-tr-detail">
                              <td></td>
                              <td colSpan={5}>
                                <div className="el-expanded-body">
                                  {log.description ? (
                                    <>
                                      <div className="el-expanded-label">
                                        <i className="bi bi-text-paragraph"></i> Description
                                      </div>
                                      <p className="el-expanded-text">{log.description}</p>
                                    </>
                                  ) : (
                                    <span className="el-td-empty">No description provided.</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="el-pagination">
                    <span className="el-page-info">
                      Showing {startEntry}–{endEntry} of {totalCount} logs
                    </span>
                    <div className="el-page-btns">
                      <button
                        className="el-page-btn"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        title="First page"
                      >
                        <i className="bi bi-chevron-double-left"></i>
                      </button>
                      <button
                        className="el-page-btn"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <i className="bi bi-chevron-left"></i> Prev
                      </button>

                      {/* Page number pills */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - page) <= 1
                        )
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) {
                            acc.push("...");
                          }
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, idx) =>
                          item === "..." ? (
                            <span key={`ellipsis-${idx}`} className="el-page-ellipsis">
                              …
                            </span>
                          ) : (
                            <button
                              key={item}
                              className={`el-page-num ${page === item ? "active" : ""}`}
                              onClick={() => setPage(item)}
                            >
                              {item}
                            </button>
                          )
                        )}

                      <button
                        className="el-page-btn"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages}
                      >
                        Next <i className="bi bi-chevron-right"></i>
                      </button>
                      <button
                        className="el-page-btn"
                        onClick={() => setPage(totalPages)}
                        disabled={page >= totalPages}
                        title="Last page"
                      >
                        <i className="bi bi-chevron-double-right"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedLog && (
        <CommentModal
          log={selectedLog}
          onSubmit={handleAddComment}
          onClose={() => setSelectedLog(null)}
          submitting={submitting}
        />
      )}
    </div>
  );
}
