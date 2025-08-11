import axios from 'axios';
import { getAccessToken, refreshAccessToken } from './auth';

const api = axios.create({
    baseURL: 'http://localhost:8000/accounts', // Update with your backend URL
});

// Add Authorization header to requests
api.interceptors.request.use(
    async (config) => {
        let token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newToken = await refreshAccessToken();
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;