import network from "@/utils/network.ts";
import type { loginForm } from "@/validations/authValidation.ts";

const auth = {
  getUser() {
    return network.get("/get_user");
  },
  getMyModules() {
    return network.get("/my-modules");
  },
  login(payload: loginForm) {
    return network.post("/auth/login", payload);
  },
  register(payload: {
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    nidn?: string;
    npm?: string;
    nip?: string;
    nama?: string;
    unit_id?: number;
    jabatan_id?: number;
    nama_lengkap?: string;
    nik?: string;
    instansi?: string;
    jenkel?: string;
    tanggal_lahir?: string;
    tempat_lahir?: string;
    agama?: string;
    no_hp?: string;
  }) {
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
      role_id: roleId,
      appModule_id: appModuleId,
    });
  },
  validateNidn(nidn: string) {
    return network.get("/validate/nidn", { params: { nidn } });
  },
  validateNip(nip: string) {
    return network.get("/validate/nip", { params: { nip } });
  },
  validateNpm(npm: string) {
    return network.get("/validate/npm", { params: { npm } });
  },
  getPublicUnits() {
    return network.get("/public/units");
  },
  getPublicJabatans() {
    return network.get("/public/jabatans");
  },
};

export default auth;
