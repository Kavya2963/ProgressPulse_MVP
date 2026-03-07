import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("pp_token") || null);
  const [user, setUser]   = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Exact URI keys your .NET backend uses with ClaimTypes
        const role =
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";

        const id =
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "";

        const email =
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "";

        setUser({ id, name: email, role, email });
      } catch {
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const saveToken = (t) => {
    localStorage.setItem("pp_token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("pp_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, saveToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
