import axios from "axios";

import session from "./session";
import environment from "@/config/environment.ts";

const network = axios.create({
  baseURL: environment.API_URL,
  withCredentials: true,
});

network.interceptors.request.use(
  (config) => {
    const token = session.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

network.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 1. Ubah jadi .includes() supaya /v2/login tetep kebaca sebagai halaman login
      const isLoginPage = window.location.pathname.includes("/login");
      const isLogoutRequest = error.config?.url?.includes("logout");

      if (!isLoginPage && !isLogoutRequest) {
        session.clearSession();

        // 2. Ambil jalur dasar otomatis dari Vite (Lokal = '/', VPS = '/v2/')
        const baseUrl = import.meta.env.BASE_URL;

        // 3. Gabungkan jalurnya!
        window.location.href = `${baseUrl}login`;
      }
    }
    return Promise.reject(error);
  },
);

export default network;
