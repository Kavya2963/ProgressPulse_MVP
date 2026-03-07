import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getManagerDashboard } from "../../services/managerService";
import Loader from "../../components/shared/Loader/Loader";
import "./ManagerDashboard.css";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getManagerDashboard()
      .then((response) => {
        setData(response);
        toast.success("Dashboard loaded successfully!");
      })
      .catch((err) => {
        setError("Failed to load dashboard data");
        toast.error("Failed to load dashboard. Please refresh the page.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    getManagerDashboard()
      .then(setData)
      .catch(() => toast.error("Still having issues. Please try again later."))
      .finally(() => setLoading(false));
  };

  if (loading) return <Loader />;

  return (
    <div className="mgr-page">

      {/* ── BREADCRUMBS ── */}
      <nav className="mgr-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <span 
              className="mgr-bc-link" 
              onClick={() => navigate("/")}
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-house-door-fill"></i> Home
            </span>
          </li>
          <li><span className="mgr-bc-sep"><i className="bi bi-chevron-right"></i></span></li>
          <li><span className="mgr-bc-current">Dashboard</span></li>
        </ol>
      </nav>

      {/* ── HEADER ── */}
      <div className="mgr-header-row">
        <div>
          <div className="mgr-page-title">Manager Dashboard</div>
          <div className="mgr-page-sub">
            Real-time overview of your team's performance & activity
          </div>
        </div>
        <div className="mgr-header-date">
          <i className="bi bi-calendar3"></i>
          {new Date().toLocaleDateString("en-IN", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })}
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      {error ? (
        <div className="mgr-error-card">
          <i className="bi bi-exclamation-triangle"></i>
          <div>
            <h3>Unable to load dashboard</h3>
            <p>{error}</p>
            <button onClick={handleRetry} className="mgr-retry-btn">
              <i className="bi bi-arrow-clockwise"></i> Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="mgr-stats-grid">
          <div className="mgr-stat-card">
            <div className="mgr-stat-icon mgr-stat-icon--purple">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="mgr-stat-body">
              <div className="mgr-stat-label">Total Employees</div>
              <div className="mgr-stat-value">{data?.totalEmployees ?? "—"}</div>
            </div>
          </div>

          <div className="mgr-stat-card">
            <div className="mgr-stat-icon mgr-stat-icon--green">
              <i className="bi bi-journal-check"></i>
            </div>
            <div className="mgr-stat-body">
              <div className="mgr-stat-label">Logs This Week</div>
              <div className="mgr-stat-value">{data?.logsSubmittedThisWeek ?? "—"}</div>
            </div>
          </div>

          <div className="mgr-stat-card">
            <div className="mgr-stat-icon mgr-stat-icon--yellow">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div className="mgr-stat-body">
              <div className="mgr-stat-label">Pending Logs</div>
              <div className="mgr-stat-value">{data?.pendingLogs ?? "—"}</div>
            </div>
          </div>

          <div className="mgr-stat-card">
            <div className="mgr-stat-icon mgr-stat-icon--blue">
              <i className="bi bi-chat-left-text-fill"></i>
            </div>
            <div className="mgr-stat-body">
              <div className="mgr-stat-label">Total Comments</div>
              <div className="mgr-stat-value">{data?.totalCommentsGiven ?? "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM ROW ── */}
      <div className="mgr-bottom-row">
        {/* Most Active Employee */}
        {data?.mostActiveEmployee && (
          <div className="mgr-active-card">
            <div className="mgr-active-top">
              <div className="mgr-active-icon">
                <i className="bi bi-trophy-fill"></i>
              </div>
              <div>
                <div className="mgr-active-heading">Most Active Employee</div>
                <div className="mgr-active-sub">Based on weekly log submissions</div>
              </div>
            </div>
            <div className="mgr-active-name-row">
              <div className="mgr-active-avatar">
                {data.mostActiveEmployee.charAt(0).toUpperCase()}
              </div>
              <div className="mgr-active-name">{data.mostActiveEmployee}</div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mgr-quick-card">
          <div className="mgr-quick-title">
            <i className="bi bi-lightning-charge-fill"></i>
            Quick Actions
          </div>
          <div className="mgr-quick-links">
            <Link className="mgr-quick-btn" to="/manager/team-logs">
              <div className="mgr-quick-btn-icon">
                <i className="bi bi-journal-text"></i>
              </div>
              <div className="mgr-quick-btn-info">
                <div className="mgr-quick-btn-label">Team Logs</div>
                <div className="mgr-quick-btn-sub">Review submitted logs</div>
              </div>
              <i className="bi bi-chevron-right mgr-quick-arrow"></i>
            </Link>

            <Link className="mgr-quick-btn" to="/manager/employees">
              <div className="mgr-quick-btn-icon">
                <i className="bi bi-people"></i>
              </div>
              <div className="mgr-quick-btn-info">
                <div className="mgr-quick-btn-label">My Employees</div>
                <div className="mgr-quick-btn-sub">View team members</div>
              </div>
              <i className="bi bi-chevron-right mgr-quick-arrow"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
