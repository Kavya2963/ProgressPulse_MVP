import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getMyEmployees, assignGoalToEmployee } from "../../services/managerService";
import Loader from "../../components/shared/Loader/Loader";
import EmptyState from "../../components/shared/EmptyState/EmptyState";
import GoalFormModal from "../../components/goals/GoalFormModal/GoalFormModal";
import "./EmployeeListPage.css";
import { useNavigate } from "react-router-dom";


export default function EmployeeListPage() {
  const [employees, setEmployees]   = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [assignTarget, setAssignTarget] = useState(null);  
  const [assigning, setAssigning]   = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    getMyEmployees()
      .then((data) => { setEmployees(data || []); setFiltered(data || []); })
      .catch(() => toast.error("Failed to load employees"))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    setFiltered(
      employees.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(val) ||
          emp.email?.toLowerCase().includes(val)
      )
    );
  };

  const handleAssignGoal = async (formData) => {
    setAssigning(true);
    try {
      await assignGoalToEmployee({
        assignedToEmployeeId: Number(assignTarget.id),
        title:       formData.title,
        description: formData.description || "",
        category:    formData.category    || null,
        priority:    formData.priority    || null,
        dueDate:     formData.dueDate     || null,
      });
      toast.success(`Goal assigned to ${assignTarget.name} successfully!`);
      setAssignTarget(null);
    } catch {
      toast.error("Failed to assign goal.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="el-page">
      {/* ── BREADCRUMBS ── */}
<div className="el-breadcrumb-row">
  <button className="el-back-btn" onClick={() => navigate(-1)}>
    <i className="bi bi-arrow-left"></i>
  </button>
  <span className="el-breadcrumb-item el-breadcrumb-link" onClick={() => navigate("/manager")}>
    <i className="bi bi-house"></i> Dashboard
  </span>
  <i className="bi bi-chevron-right el-breadcrumb-sep"></i>
  <span className="el-breadcrumb-item el-breadcrumb-active">My Employees</span>
</div>


      {/* Header */}
      <div className="el-header-row">
  <div className="el-header-left">
    <div className="el-header-icon-wrap">
      <i className="bi bi-people-fill"></i>
    </div>
    <div>
      <div className="el-page-title">My Employees</div>
      <div className="el-page-sub">
        View performance summary and assign goals to your team
      </div>
    </div>
  </div>
  <div className="el-count-badge">
    <i className="bi bi-people-fill"></i>
    {employees.length} employee{employees.length !== 1 ? "s" : ""}
  </div>
</div>


      {/* Search */}
      <div className="el-search-bar">
        <i className="bi bi-search el-search-icon"></i>
        <input
          className="el-search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearch}
        />
        {search && (
          <button
            className="el-search-clear"
            onClick={() => { setSearch(""); setFiltered(employees); }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<i className="bi bi-people"></i>}
          title="No employees found"
          desc={search ? "Try a different search term." : "No employees assigned to you yet."}
        />
      ) : (
        <div className="el-table-wrap">
          <table className="el-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, index) => (
                <tr key={emp.id}>
                  <td className="el-td-index">{index + 1}</td>
                  <td>
                    <div className="el-emp-name-row">
                      <div className="el-emp-avatar">
                        {emp.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="el-emp-name">{emp.name}</span>
                    </div>
                  </td>
                  <td className="el-td-email">
                    <i className="bi bi-envelope me-1 text-muted"></i>
                    {emp.email || "—"}
                  </td>
                  <td>
                    <div className="el-action-btns">
                      {/* Summary only — no appraisal
                      <Link
                        className="el-btn-summary"
                        to={`/manager/employee/${emp.id}/summary`}
                      >
                        <i className="bi bi-person-lines-fill me-1"></i>Summary
                      </Link> */}
                      {/* Assign Goal lives here */}
                      <button
                        className="el-btn-assign"
                        onClick={() =>
                          setAssignTarget({ id: emp.id, name: emp.name })
                        }
                      >
                        <i className="bi bi-plus-circle me-1"></i>Assign Goal
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Goal Modal */}
      {assignTarget && (
        <GoalFormModal
          goal={null}
          onSave={handleAssignGoal}
          onClose={() => setAssignTarget(null)}
          submitting={assigning}
          mode="manager"
          assignedToName={assignTarget.name}
        />
      )}
    </div>
  );
}
