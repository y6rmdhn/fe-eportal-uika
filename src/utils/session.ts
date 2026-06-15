import Cookies from "js-cookie";
import { ROLE_ADMIN, SESSION_KEY } from "./constants";
import auth from "@/services/api/auth";

const session = {
  setSession(user: any) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  getSession() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  },
  setToken(token: string) {
    localStorage.setItem("token", token);
  },
  getToken() {
    return localStorage.getItem("token") || undefined;
  },
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("token");

    Cookies.remove("token");
    Cookies.remove("user_tias");
    Cookies.remove("tias");
  },

  async isAuthenticated() {
    try {
      // Cek cache dulu
      const cached = this.getSession();
      if (cached) return true;

      // Kalau gak ada, baru hit API
      const res = await auth.getUser();
      if (res.status === 200) {
        this.setSession(res.data.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  isAdmin() {
    const user = this.getSession();
    return user?.role === ROLE_ADMIN;
  },
};

export default session;
