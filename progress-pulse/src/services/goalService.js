import api from "./api";
import API from "../constants/apiRoutes";

export const createGoal      = async (data) => (await api.post(API.GOAL.CREATE, data)).data;
export const getUserGoals    = async ()      => (await api.get(API.GOAL.GET_ALL)).data;
export const updateGoal = async (id, data) => {
    try {
      return (await api.put(API.GOAL.UPDATE(id), data)).data;
    } catch (err) {
      console.error("Update error response:", JSON.stringify(err?.response?.data));
      throw err;
    }
  };
  export const getGoalProgress = async ()      => (await api.get(API.GOAL.PROGRESS)).data;
export const getGoalDetails  = async (id)    => (await api.get(API.GOAL.DETAILS(id))).data;
export const updateGoalProgress = async (goalId, progressPercentage) =>
    (await api.patch(API.GOAL.UPDATE_PROGRESS(goalId), { progressPercentage })).data;

  
