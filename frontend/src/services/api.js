import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error("VITE_API_URL must be configured for production.");
}

const API_BASE_URL = (configuredApiUrl || "http://localhost:5000/api").replace(
  /\/+$/,
  "",
);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: to send and receive HttpOnly cookies
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for handling 401 and refresh token logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = /\/auth\/(login|register|refresh|logout)(\/|$)/.test(
      originalRequest?.url || "",
    );

    // Refresh once for protected requests, but never recurse on auth endpoints.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const res = await refreshClient.post("/auth/refresh", {});

        if (res.data.accessToken) {
          localStorage.setItem("token", res.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.warn("Session refresh failed; clearing the local session.");
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth:session-expired"));
      }
    }

    return Promise.reject(error);
  },
);

export default api;
