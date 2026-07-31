import React, { useState, useEffect } from "react";
import { UserDTO } from "../types/auth.types";
import { authApi } from "../api/auth.api";
import { AuthContext } from "./auth-context-def";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    authApi
      .me()
      .then((userData: UserDTO) => {
        setUser(userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("currentUser");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (phone: string, passwordHash: string): Promise<UserDTO> => {
    const res = await authApi.login({ phone, passwordHash });
    const userData = res.user;
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    return userData;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      localStorage.removeItem("currentUser");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
