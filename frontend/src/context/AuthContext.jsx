import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api"; // We'll create this axios instance next
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => setUser(null);
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
        }
      } catch {
        console.error("Failed to restore the authenticated user.");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
    localStorage.setItem("token", res.data.accessToken);
    return res.data.user;
  };

  const registerCitizen = async (data) => {
    await api.post("/auth/register/citizen", data);
  };

  const registerWorker = async (data) => {
    await api.post("/auth/register/worker", data);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      console.error("Logout request failed.");
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, registerCitizen, registerWorker }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
