import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "https://unitech-request-platform-backend.azurewebsites.net/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  // Note: In a real app, we might store this in HttpOnly cookie or local storage
  // For this MVP, we'll assume it's in localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

