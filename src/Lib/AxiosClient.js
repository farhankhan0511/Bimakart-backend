import axios from "axios";
import { fetchNewToken, getAccessToken } from "./TokenManager.js";

const bimapi = axios.create({
  baseURL: process.env.BIMAPI,
});



bimapi.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

bimapi.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      await fetchNewToken();
      const newAccessToken = await getAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return bimapi(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default bimapi;