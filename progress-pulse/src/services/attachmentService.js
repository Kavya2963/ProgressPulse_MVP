import api from "./api";
import API from "../constants/apiRoutes";

export const uploadAttachments = async (weeklyLogId, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  return (await api.post(API.ATTACHMENT.UPLOAD(weeklyLogId), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })).data;
};

export const getAttachments = async (weeklyLogId) =>
  (await api.get(API.ATTACHMENT.GET(weeklyLogId))).data;

// Files are served as static files from wwwroot/uploads — no auth needed
export const getDownloadUrl = (filePath) => {
  return `http://localhost:5018${filePath}`;
};
