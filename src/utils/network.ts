import axios from "axios";

import session from "./session";
import environment from "@/config/environment.ts";

const network = axios.create({
  baseURL: environment.API_URL,
  withCredentials: true,
});

network.interceptors.request.use(
  (config) => {
    // const token = session.getToken();
    //
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

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
      // Jangan redirect kalau memang lagi di /login atau request dari authLoader
      const isLoginPage = window.location.pathname === "/login";
      const isLogoutRequest = error.config?.url?.includes("logout");

      if (!isLoginPage && !isLogoutRequest) {
        session.clearSession();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default network;
