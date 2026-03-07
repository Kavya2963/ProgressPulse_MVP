import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMyEmployees } from "../../services/managerService";
import Loader from "../../components/shared/Loader/Loader";
import EmptyState from "../../components/shared/EmptyState/EmptyState";
import "./TeamLogsPage.css";

export default function TeamLogsPage() {
  const navigate = useNavigate();
  const [employees, setEmployees]   = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");

  useEffect(() => {
    getMyEmployees()
      .then((data) => {
        const list = data || [];
        setEmployees(list);
        if (list.length === 0)
          toast.info("No employees are assigned to you yet.");
      })
      .catch(() => toast.error("Failed to load team members. Please try again."))
      .finally(() => setEmpLoading(false));
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = () => {
    const val = searchInput.trim();
    if (val.length === 1) {
      toast.warning("Please enter at least 2 characters to search.");
      return;
    }
    setSearch(val);
    if (val.length > 0) {
      const count = employees.filter(
        (e) =>
          e.name?.toLowerCase().includes(val.toLowerCase()) ||
          e.email?.toLowerCase().includes(val.toLowerCase())
      ).length;
      if (count === 0) toast.info(`No results found for "${val}".`);
      else toast.success(`Found ${count} result${count !== 1 ? "s" : ""}.`);
    }
  };

  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    toast.info("Search cleared.");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter")  handleSearch();
    if (e.key === "Escape") handleClear();
  };

  const handleSelectEmployee = (emp) => {
    if (!emp?.id) {
      toast.error("Invalid employee. Please try again.");
      return;
    }
    toast.success(`Opening logs for ${emp.name}…`);
    navigate(`/manager/employee/${emp.id}/logs`, {
      state: { empName: emp.name, empEmail: emp.email },
    });
  };

  return (
    <div className="tl-page">

      {/* ── BREADCRUMBS ── */}
      <nav className="tl-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <span className="tl-bc-link" onClick={() => navigate("/manager/dashboard")}>
              <i className="bi bi-house-door-fill"></i> Dashboard
            </span>
          </li>
          <li><span className="tl-bc-sep"><i className="bi bi-chevron-right"></i></span></li>
          <li><span className="tl-bc-current">Team Logs</span></li>
        </ol>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div className="tl-header-row">
        <div className="tl-header-left">
          <div className="tl-header-icon-wrap">
            <i className="bi bi-journal-text"></i>
          </div>
          <div>
            <div className="tl-page-title">Team Logs</div>
            <div className="tl-page-sub">
              Select an employee to review their logs, goals &amp; weekly progress
            </div>
          </div>
        </div>
        {!empLoading && (
          <div className="tl-team-badge">
            <i className="bi bi-people-fill"></i>
            {employees.length} Team Member{employees.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── ANALYTICS CARDS ── */}
      {!empLoading && employees.length > 0 && (
        <div className="tl-analytics-row">
          <div className="tl-analytics-card">
            <div className="tl-analytics-icon tl-icon--purple">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="tl-analytics-body">
              <div className="tl-analytics-val">{employees.length}</div>
              <div className="tl-analytics-label">Total Employees</div>
            </div>
          </div>
          <div className="tl-analytics-card">
            <div className="tl-analytics-icon tl-icon--blue">
              <i className="bi bi-funnel-fill"></i>
            </div>
            <div className="tl-analytics-body">
              <div className="tl-analytics-val">{filtered.length}</div>
              <div className="tl-analytics-label">Filtered Results</div>
            </div>
          </div>
          <div className="tl-analytics-card">
            <div className="tl-analytics-icon tl-icon--green">
              <i className="bi bi-person-check-fill"></i>
            </div>
            <div className="tl-analytics-body">
              <div className="tl-analytics-val">
                {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </div>
              <div className="tl-analytics-label">Current Period</div>
            </div>
          </div>
          <div className="tl-analytics-card">
            <div className="tl-analytics-icon tl-icon--yellow">
              <i className="bi bi-calendar-week"></i>
            </div>
            <div className="tl-analytics-body">
              <div className="tl-analytics-val">
                {new Date().toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="tl-analytics-label">Today</div>
            </div>
          </div>
        </div>
      )}

      {/* ── EMPLOYEE SECTION ── */}
      <div className="tl-emp-section-card">

        {/* Section Header */}
        <div className="tl-section-header">
          <div className="tl-section-title-wrap">
            <div className="tl-section-icon">
              <i className="bi bi-people"></i>
            </div>
            <span className="tl-section-title">Your Team</span>
            {!empLoading && (
              <span className="tl-section-count">{filtered.length}</span>
            )}
          </div>

          {/* Search */}
          <div className="tl-search-wrap">
            <i className="bi bi-search tl-search-icon"></i>
            <input
              className="tl-search-input"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchInput && (
              <button className="tl-search-clear" onClick={handleClear} title="Clear">
                <i className="bi bi-x-lg"></i>
              </button>
            )}
            <button className="tl-search-btn" onClick={handleSearch}>
              <i className="bi bi-search"></i> Search
            </button>
          </div>
        </div>

        {/* Grid */}
        {empLoading ? (
          <div className="tl-loader-wrap"><Loader /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<i className="bi bi-people"></i>}
            title="No employees found"
            desc={search ? `No results for "${search}". Try a different term.` : "No employees assigned to you."}
          />
        ) : (
          <div className="tl-emp-grid">
            {filtered.map((emp, idx) => (
              <div
                key={emp.id}
                className="tl-emp-card"
                style={{ animationDelay: `${idx * 0.04}s` }}
                onClick={() => handleSelectEmployee(emp)}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleSelectEmployee(emp)}
              >
                {/* Avatar */}
                <div className="tl-emp-card-avatar">
                  {emp.name?.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="tl-emp-card-info">
                  <div className="tl-emp-card-name">{emp.name}</div>
                  <div className="tl-emp-card-email">
                    <i className="bi bi-envelope"></i>{emp.email}
                  </div>
                  {emp.role && (
                    <div className="tl-emp-card-role">
                      <i className="bi bi-briefcase"></i>{emp.role}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="tl-emp-card-actions">
                  <div className="tl-emp-card-view-btn">
                    <i className="bi bi-eye"></i>
                    <span>View Logs</span>
                  </div>
                  <div className="tl-emp-card-arrow">
                    <i className="bi bi-arrow-right-circle-fill"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
