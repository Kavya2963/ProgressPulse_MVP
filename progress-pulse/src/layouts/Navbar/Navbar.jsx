import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric"
  });

  return (
    <nav className="pp-navbar">

      {/* Brand */}
      <div className="pp-navbar-brand">
        Progress<span>Pulse</span>
      </div>

      {/* Right */}
      <div className="pp-navbar-right">

        {/* Date */}
        <div className="pp-navbar-date">
          <i className="bi bi-calendar3"></i>
          {today}
        </div>

        <div className="pp-navbar-divider" />

        {/* User pill — avatar initial instead of icon */}
        <div className="pp-navbar-user-info">
          <div className="pp-navbar-avatar">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <span className="pp-navbar-name">
            {user?.name || user?.email || "User"}
          </span>
          <span className="pp-navbar-role-badge">{user?.role}</span>
        </div>

        {/* Logout */}
        <button className="pp-navbar-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>Logout
        </button>

      </div>
    </nav>
  );
}
