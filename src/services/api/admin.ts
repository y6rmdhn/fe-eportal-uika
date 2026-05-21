import network from "@/utils/network.ts";

const admin = {
  getAllUserManagement(params: {
    currentLimit?: number;
    currentPage?: number;
    currentSearch?: string;
    currentFilter?: string;
  }) {
    return network.get("/admins", {
      params: {
        search: params.currentSearch,
        per_page: params.currentLimit,
        page: params.currentPage,
        role: params.currentFilter || undefined,
      },
    });
  },
  createUser(payload: FormData) {
    return network.post("/admins", payload);
  },
  updateUser(id: string, payload: FormData) {
    // hapus payload.append("_method", "PUT");
    return network.post(`/admins/${id}`, payload);
  },
  deleteUser(id: string) {
    return network.delete(`/admins/${id}`);
  },
  getSuspiciousIps() {
    return network.get("/admins/security/suspicious-ips");
  },
  getLoginLogs(params: {
    currentLimit?: number;
    currentPage?: number;
    status?: string;
    device_type?: string;
  }) {
    return network.get("/admins/security/logs", {
      params: {
        per_page: params.currentLimit,
        page: params.currentPage,
        status: params.status || undefined,
        device_type: params.device_type || undefined,
      },
    });
  },
  resetUserPassword(
    id: string,
    payload: { password: string; password_confirmation: string },
  ) {
    return network.post(`/admins/${id}/reset-password`, payload);
  },
  exportUsers(params: { role?: string; search?: string }) {
    return network.get("/admins/export", {
      params,
      responseType: "blob",
    });
  },
  importUsers(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return network.post("/admins/import", formData);
  },
  getActivityLogs(id: string, params?: { type?: string; per_page?: number }) {
    return network.get(`/admins/${id}/activity-logs`, { params });
  },
  // App Module
  getAppModules() {
    return network.get("/admins/app-modules");
  },
  createAppModule(payload: FormData) {
    return network.post("/admins/app-modules", payload);
  },
  updateAppModule(id: number, payload: FormData) {
    payload.append("_method", "PUT");

    return network.post(`/admins/app-modules/${id}`, payload);
  },
  deleteAppModule(id: number) {
    return network.delete(`/admins/app-modules/${id}`);
  },
  getMyModules() {
    return network.get("/my-modules");
  },
};

export default admin;
