import api from "./api";
import API from "../constants/apiRoutes";

export const login = async (creds) => (await api.post(API.AUTH.LOGIN, creds)).data;

export const getProfile = () =>
  api.get(API.AUTH.ME).then((res) => res.data);
