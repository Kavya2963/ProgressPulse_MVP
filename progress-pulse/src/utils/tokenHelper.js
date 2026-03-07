import { jwtDecode } from "jwt-decode";
export const getDecodedToken = () => {
  const t = localStorage.getItem("pp_token");
  if (!t) return null;
  try { return jwtDecode(t); } catch { return null; }
};
export const isTokenExpired = () => {
  const d = getDecodedToken();
  if (!d) return true;
  return d.exp * 1000 < Date.now();
};
