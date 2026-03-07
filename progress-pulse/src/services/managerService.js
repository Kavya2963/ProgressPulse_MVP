import api from "./api";
import API from "../constants/apiRoutes";

export const getManagerDashboard = async () =>
  (await api.get(API.MANAGER.DASHBOARD)).data;

export const getTeamLogs = async (params) => {
  const res = await api.get(API.MANAGER.TEAM_LOGS, { params });
  return res.data;
};

export const addComment = async (data) =>
  (await api.post(API.MANAGER.ADD_COMMENT, data)).data;

export const getEmployeeSummary = async (id) =>
  (await api.get(API.MANAGER.EMPLOYEE_SUMMARY(id))).data;

export const getAppraisalReport = async (id) =>
  (await api.get(API.MANAGER.APPRAISAL_REPORT(id))).data;

export const getMyEmployees = async () =>
  (await api.get(API.MANAGER.MY_EMPLOYEES)).data;

export const assignGoalToEmployee = (data) =>
  api.post("/manager/goals/assign", data).then((res) => res.data);

export const getWeeklyDigest = async (employeeId, weekStart) => {
  const params = {
    employeeId,
    ...(weekStart ? { weekStart: weekStart.toISOString() } : {}),
  };
  return (await api.get(API.MANAGER.WEEKLY_DIGEST, { params })).data;
};
