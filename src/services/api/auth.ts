import network from "@/utils/network.ts";
import type {
  loginForm,
  createUserForm,
} from "@/validations/authValidation.ts";

const auth = {
  getUser() {
    return network.get("/get_user");
  },
  login(payload: loginForm) {
    return network.post("/auth/login", payload);
  },
  register(payload: createUserForm) {
    return network.post("/register", payload);
  },
  logout() {
    return network.post("/logout");
  },
  sendResetLinkEmail(email: string) {
    return network.post("/password/email", { email });
  },
  resetPassword(payload: {
    email: string;
    password: string;
    password_confirmation: string;
    token: string;
  }) {
    return network.post("/password/reset", payload);
  },
  redirectToApp(roleId: string, appModuleId: string) {
        return network.post("/sso/redirect-to-app", {
            role_id:      roleId,
            appModule_id: appModuleId,
        });
    },
};

export default auth;
