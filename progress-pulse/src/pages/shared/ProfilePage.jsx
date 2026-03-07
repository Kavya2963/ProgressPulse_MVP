import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { getProfile } from "../../services/authService";
import { AuthContext } from "../../contexts/AuthContext";
import Loader from "../../components/shared/Loader/Loader";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "—";

  return (
    <div className="pp-page">

      {/* Avatar Card */}
      <div className="pp-avatar-card">
        <div className="pp-avatar">
          {profile?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="pp-avatar-info">
          <div className="pp-name">{profile?.name}</div>
          <div className="pp-email">{profile?.email}</div>
          <span className={`pp-role-badge ${profile?.role?.toLowerCase()}`}>
            <i className={`bi ${profile?.role === "Manager" ? "bi-briefcase" : "bi-person"} me-1`}></i>
            {profile?.role}
          </span>
        </div>
      </div>

      {/* Details Card */}
      <div className="pp-details-card">
        <div className="pp-section-title">Account Details</div>

        <div className="pp-detail-row">
          <div className="pp-detail-item">
            <div className="pp-detail-label">
              <i className="bi bi-person me-2"></i>Full Name
            </div>
            <div className="pp-detail-value">{profile?.name || "—"}</div>
          </div>
          <div className="pp-detail-item">
            <div className="pp-detail-label">
              <i className="bi bi-envelope me-2"></i>Email Address
            </div>
            <div className="pp-detail-value">{profile?.email || "—"}</div>
          </div>
          <div className="pp-detail-item">
            <div className="pp-detail-label">
              <i className="bi bi-shield-check me-2"></i>Role
            </div>
            <div className="pp-detail-value">{profile?.role || "—"}</div>
          </div>
          <div className="pp-detail-item">
            <div className="pp-detail-label">
              <i className="bi bi-calendar3 me-2"></i>Member Since
            </div>
            <div className="pp-detail-value">{joinedDate}</div>
          </div>
        </div>
      </div>

    </div>
  );
}
