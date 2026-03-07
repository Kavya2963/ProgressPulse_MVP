import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import "./Sidebar.css";

const managerLinks = [
  { to: "/manager/dashboard", label: "Dashboard",    icon: "bi-speedometer2"  },
  { to: "/manager/team-logs", label: "Team Logs",    icon: "bi-journal-text"  },
  { to: "/manager/employees", label: "My Employees", icon: "bi-people-fill"   },
  { to: "/manager/profile",   label: "Profile",      icon: "bi-person-circle" },
];

const employeeLinks = [
  { to: "/employee/goals",   label: "My Goals",    icon: "bi-flag-fill"     },
  { to: "/employee/logs",    label: "Weekly Logs", icon: "bi-calendar-week" },
  { to: "/employee/profile", label: "Profile",     icon: "bi-person-circle" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === ROLES.MANAGER ? managerLinks : employeeLinks;

  return (
    <aside className="pp-sidebar">

      {/* Section Label */}
      {/* <div className="pp-sidebar-section">Navigation</div> */}

      {/* Links */}
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            "pp-sidebar-link" + (isActive ? " active" : "")
          }
        >
          <i className={`bi ${l.icon} pp-sidebar-icon`}></i>
          {l.label}
        </NavLink>
      ))}

      {/* Push footer to bottom */}
      <div className="pp-sidebar-spacer" />
      <div className="pp-sidebar-footer-divider" />

      {/* Online indicator */}
      <div className="pp-sidebar-footer">
        <div className="pp-sidebar-footer-dot" />
        <span className="pp-sidebar-footer-label">
          {user?.role === ROLES.MANAGER ? "Manager View" : "Employee View"}
        </span>
      </div>

    </aside>
  );
}
