import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

const ROUTE_LABELS = {
  manager:    "Dashboard",
  employee:   "My Employees",
  summary:    "Summary",
  logs:       "Team Logs",
  appraisal:  "Appraisal",
  goals:      "Goals",
  profile:    "Profile",
};

export default function Breadcrumbs({ custom }) {
  const location = useLocation();

  // If custom crumbs passed, use them
  // e.g. custom={[{ label: "My Employees", to: "/manager/employees" }, { label: "Kavya Sri" }]}
  const crumbs = custom ?? buildCrumbs(location.pathname);

  return (
    <nav className="bc-nav" aria-label="breadcrumb">
      <ol className="bc-list">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className={`bc-item ${isLast ? "bc-item--active" : ""}`}>
              {!isLast ? (
                <>
                  <Link className="bc-link" to={crumb.to}>{crumb.label}</Link>
                  <i className="bi bi-chevron-right bc-sep"></i>
                </>
              ) : (
                <span className="bc-current">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function buildCrumbs(pathname) {
  const parts  = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Home", to: "/" }];
  let   path   = "";

  for (const part of parts) {
    path += `/${part}`;
    const label = ROUTE_LABELS[part] ?? capitalize(part);
    crumbs.push({ label, to: path });
  }
  return crumbs;
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
