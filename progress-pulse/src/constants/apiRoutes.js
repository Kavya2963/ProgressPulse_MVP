const API = {
  AUTH: {
    LOGIN: "/Auth/login",
    ME:    "/Auth/me",
  },
  GOAL: {
    CREATE:          "/Goal",
    GET_ALL:         "/Goal",
    UPDATE:          (id) => `/Goal/${id}`,
    PROGRESS:        "/Goal/progress",
    DETAILS:         (id) => `/Goal/${id}/details`,
    UPDATE_PROGRESS: (id) => `/Goal/${id}/progress`,
  },
  WEEKLY_LOG: {
    CREATE:   "/WeeklyLog",
    GET_ALL:  "/WeeklyLog",
    COMMENTS: (logId) => `/WeeklyLog/${logId}/comments`,
  },
  ATTACHMENT: {
    UPLOAD:   (weeklyLogId) => `/Attachment/${weeklyLogId}`,
    GET:      (weeklyLogId) => `/Attachment/${weeklyLogId}`,
    DOWNLOAD: (weeklyLogId, fileName) => `/Attachment/download/${weeklyLogId}/${fileName}`,
  },
  MANAGER: {
    DASHBOARD:        "/Manager/dashboard",
    TEAM_LOGS:        "/Manager/team-logs",
    ADD_COMMENT:      "/Manager/comment",
    MY_EMPLOYEES:     "/Manager/my-employees",
    WEEKLY_DIGEST:    "/Manager/weekly-digest",      // ← ADD THIS
    EMPLOYEE_SUMMARY: (id) => `/Manager/employee-summary/${id}`,
    APPRAISAL_REPORT: (id) => `/Manager/appraisal-report/${id}`,
  },
};

export default API;
