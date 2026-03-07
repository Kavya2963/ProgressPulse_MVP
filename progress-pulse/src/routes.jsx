import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ROLES } from "./constants/roles";
import MainLayout from "./layouts/MainLayout/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import TeamLogsPage from "./pages/manager/TeamLogsPage";
import EmployeeSummaryPage from "./pages/manager/EmployeeSummaryPage";
import AppraisalReportPage from "./pages/manager/AppraisalReportPage";
import EmployeeListPage from "./pages/manager/EmployeeListPage";
import GoalsPage from "./pages/employee/GoalsPage";
import WeeklyLogsPage from "./pages/employee/WeeklyLogsPage";
import ProfilePage from "./pages/shared/ProfilePage";  
import EmployeeLogsPage from "./pages/manager/EmployeeLogsPage";


function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (!user)  return null;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


export default function AppRoutes() {
  const { token, user } = useAuth();

  const getDefaultRoute = () => {
    if (!token || !user)              return "/login";
    if (user.role === ROLES.MANAGER)  return "/manager/dashboard";
    if (user.role === ROLES.EMPLOYEE) return "/employee/goals";
    return "/login";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      <Route
        path="/login"
        element={
          token && user ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Manager routes */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={[ROLES.MANAGER]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"                      element={<ManagerDashboard />} />
        <Route path="team-logs"                      element={<TeamLogsPage />} />
        <Route path="employees"                      element={<EmployeeListPage />} />
        <Route path="employee/:employeeId/summary"   element={<EmployeeSummaryPage />} />
        <Route path="employee/:employeeId/appraisal" element={<AppraisalReportPage />} />
        <Route path="profile"                        element={<ProfilePage />} />  
        <Route path="employee/:id/logs" element={<EmployeeLogsPage />} />
        </Route>

      {/* Employee routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="goals" replace />} />
        <Route path="goals"   element={<GoalsPage />} />
        <Route path="logs"    element={<WeeklyLogsPage />} />
        <Route path="profile" element={<ProfilePage />} />  {/* ← FIXED */}
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
