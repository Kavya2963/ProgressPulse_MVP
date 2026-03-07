import api from "./api";

export const getGoalSummary = (employeeName, goals) =>
  api.post("/ai/goal-summary", { employeeName, goals }).then((r) => r.data);

export const getWeeklyDigest = (employeeName, logs, weekStart) =>
  api.post("/ai/weekly-digest", { employeeName, logs, weekStart }).then((r) => r.data);

export const getProgressInsight = (employeeName, goals) =>
  api.post("/ai/progress-insight", { employeeName, goals }).then((r) => r.data);
