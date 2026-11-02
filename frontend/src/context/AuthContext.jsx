import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const enrichUser = (rawUser) => {
  if (!rawUser) return null;
  let displayName = rawUser.name;
  if (!displayName || !displayName.trim() || displayName.toLowerCase() === "account") {
    const storedName = localStorage.getItem(`user_name_${rawUser.id}`) || localStorage.getItem("last_registered_name");
    if (storedName && storedName.trim()) {
      displayName = storedName.trim();
    } else if (rawUser.email) {
      const prefix = rawUser.email.split("@")[0].replace(/[._-]/g, " ").trim();
      displayName = prefix
        ? prefix.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
        : (rawUser.role?.name ? rawUser.role.name.charAt(0) + rawUser.role.name.slice(1).toLowerCase().replace(/_/g, " ") : "Citizen");
    } else if (rawUser.role?.name) {
      const r = rawUser.role.name.replace(/_/g, " ").toLowerCase();
      displayName = r.charAt(0).toUpperCase() + r.slice(1);
    } else {
      displayName = "Citizen";
    }
  }
  return { ...rawUser, name: displayName };
};

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
          setUser(enrichUser(res.data.user));
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
    const enriched = enrichUser(res.data.user);
    setUser(enriched);
    localStorage.setItem("token", res.data.accessToken);
    return enriched;
  };

  const registerCitizen = async (data) => {
    if (data?.name && data.name.trim()) {
      localStorage.setItem("last_registered_name", data.name.trim());
    }
    await api.post("/auth/register/citizen", data);
  };

  const registerWorker = async (data) => {
    if (data?.name && data.name.trim()) {
      localStorage.setItem("last_registered_name", data.name.trim());
    }
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
