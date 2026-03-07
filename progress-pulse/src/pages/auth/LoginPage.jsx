import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import "./LoginPage.css";

export default function LoginPage() {

  const { saveToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {

      const data = await login(form);

      const token =
        data.Token ||
        data.token ||
        data.accessToken;

      if (!token) {
        setError("No token received from server.");
        return;
      }

      const decoded = jwtDecode(token);

      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";

      const email =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "";

      saveToken(token);

      toast.success(`Welcome back, ${email}!`);

      if (role === "Manager")
        navigate("/manager/dashboard", { replace: true });

      else if (role === "Employee")
        navigate("/employee/goals", { replace: true });

      else
        setError(`Unknown role: "${role}"`);

    }
    catch (err) {

      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        "Invalid credentials. Please try again."
      );

    }
    finally {
      setLoading(false);
    }

  };

  return (

    <div className="pp-login-page">

      <div className="pp-login-container">


        {/* LEFT PANEL */}

        <div className="pp-login-left">

          <div className="pp-left-content">

            <div className="pp-left-logo">
              <i className="bi bi-activity"></i>
              <h1>ProgressPulse</h1>
            </div>

            <p className="pp-left-tagline">
              Track performance, measure growth, and empower teams
              to achieve meaningful goals.
            </p>

            <div className="pp-left-features">

              <div>
                <i className="bi bi-graph-up"></i>
                <span>Performance Analytics</span>
              </div>

              <div>
                <i className="bi bi-bullseye"></i>
                <span>Goal Tracking</span>
              </div>

              <div>
                <i className="bi bi-people"></i>
                <span>Team Insights</span>
              </div>

            </div>

          </div>

        </div>


        {/* RIGHT PANEL */}

        <div className="pp-login-right">

          <div className="pp-login-card">

            <div className="pp-login-logo">

              <div className="pp-login-icon">
                <i className="bi bi-activity"></i>
              </div>

              <h1>
                Progress<span>Pulse</span>
              </h1>

              <p>Performance Intelligence Platform</p>

            </div>

            <h2>Sign in to your account</h2>

            {error && (
              <div className="pp-login-error">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="pp-form-group">
                <label>
                  <i className="bi bi-envelope me-1"></i>Email
                </label>

                <div className="pp-input-wrap">
                  <input
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>


              <div className="pp-form-group">

                <label>
                  <i className="bi bi-lock me-1"></i>Password
                </label>

                <div className="pp-input-wrap pp-input-password">

                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="pp-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>

                </div>

              </div>


              <button
                className="pp-login-btn"
                disabled={loading}
              >

                {loading
                  ?
                  <>
                    <i className="bi bi-arrow-repeat pp-spin me-2"></i>
                    Signing in...
                  </>
                  :
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </>
                }

              </button>

            </form>

          </div>

        </div>

      </div>

    </div>

  );

}