import api from "./api";
import API from "../constants/apiRoutes";

export const createWeeklyLog = async (data) =>
  (await api.post(API.WEEKLY_LOG.CREATE, data)).data;

export const getUserLogs = async (goalId) => {
  const params = goalId ? { goalId } : {};
  return (await api.get(API.WEEKLY_LOG.GET_ALL, { params })).data;
  
};

export const getLogComments = async (logId) =>
    (await api.get(API.WEEKLY_LOG.COMMENTS(logId))).data;