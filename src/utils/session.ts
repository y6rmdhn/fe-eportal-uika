import Cookies from "js-cookie";
import { ROLE_ADMIN, SESSION_KEY } from "./constants";

const session = {
  setSession(user: any) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  getSession() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  },
  clearSession() {
    localStorage.removeItem(SESSION_KEY);

    Cookies.remove('token');
    Cookies.remove('user_tias');
    Cookies.remove('tias');
  },

  isAuthenticated() {
    const user = this.getSession();
    return user !== null;
  },

  isAdmin() {
    const user = this.getSession();
    return user?.role === ROLE_ADMIN;
  },
};

export default session;