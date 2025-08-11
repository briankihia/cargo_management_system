// src/pages/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000", // Adjust to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request if present
instance.interceptors.request.use(
  (config) => {
    const session = JSON.parse(localStorage.getItem("session"));
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;