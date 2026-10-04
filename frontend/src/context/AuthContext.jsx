import { createContext, useContext, useEffect, useState } from "react";

import { ensureCsrfCookie } from "../services/api";
import {
  fetchProfile,
  login as loginRequest,
  logout as logoutRequest,
} from "../services/auth";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function bootstrapSession() {
      await ensureCsrfCookie();

      try {
        const profile = await fetchProfile();
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapSession();
  }, []);

  async function login(username, password) {
    const profile = await loginRequest(username, password);
    setUser(profile);
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };
