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
    user_id?: string;
    date_from?: string;
    date_to?: string;
  }) {
    return network.get("/admins/security/logs", {
      params: {
        per_page: params.currentLimit,
        page: params.currentPage,
        status: params.status || undefined,
        device_type: params.device_type || undefined,
        user_id: params.user_id || undefined,
        date_from: params.date_from || undefined,
        date_to: params.date_to || undefined,
      },
    });
  },
  getLoginStats() {
    return network.get("/admins/security/logs/stats");
  },
  getGroupedLoginLogs(params: {
    page?: number;
    per_page?: number;
    status?: string;
    device_type?: string;
  }) {
    return network.get("/admins/security/logs/grouped", { params });
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
  getActivityLogs(
    id: string,
    params?: { type?: string; per_page?: number; page?: number },
  ) {
    return network.get(`/admins/${id}/activity-logs`, { params });
  },

  // ─── App Modules ───────────────────────────────────────────────────────────
  getAppModules() {
    return network.get("/admins/app-modules");
  },
  getAppModule(id: number) {
    return network.get(`/admins/app-modules/${id}`);
  },
  createAppModule(payload: { name: string; url: string }) {
    return network.post("/admins/app-modules", payload);
  },
  updateAppModule(id: number, payload: { name: string; url: string }) {
    return network.put(`/admins/app-modules/${id}`, payload);
  },
  deleteAppModule(id: number) {
    return network.delete(`/admins/app-modules/${id}`);
  },
  resetAppModuleSecret(id: number) {
    return network.post(`/admins/app-modules/${id}/reset-secret`);
  },

  // ─── Roles ─────────────────────────────────────────────────────────────────
  getRoles() {
    return network.get("/admins/roles");
  },
  getRole(id: number) {
    return network.get(`/admins/roles/${id}`);
  },
  createRole(payload: { name: string; guard_name?: string }) {
    return network.post("/admins/roles", payload);
  },
  updateRole(id: number, payload: { name: string; guard_name?: string }) {
    return network.put(`/admins/roles/${id}`, payload);
  },
  deleteRole(id: number) {
    return network.delete(`/admins/roles/${id}`);
  },

  // ─── Permissions ───────────────────────────────────────────────────────────
  getPermissions() {
    return network.get("/admins/permissions");
  },
  getPermission(id: number) {
    return network.get(`/admins/permissions/${id}`);
  },
  createPermission(payload: {
    name: string;
    guard_name?: string;
    appModule_id: number;
  }) {
    return network.post("/admins/permissions", payload);
  },
  bulkCreatePermission(payload: {
    appModule_id: number;
    permissions: { name: string; guard_name?: string }[];
  }) {
    return network.post("/admins/permissions/bulk", payload);
  },
  updatePermission(
    id: number,
    payload: { name: string; guard_name?: string; appModule_id: number },
  ) {
    return network.put(`/admins/permissions/${id}`, payload);
  },
  bulkUpdatePermission(payload: {
    permissions: {
      id: number;
      name: string;
      guard_name?: string;
      appModule_id?: number;
    }[];
  }) {
    return network.put("/admins/permissions/bulk", payload);
  },
  deletePermission(id: number) {
    return network.delete(`/admins/permissions/${id}`);
  },
  bulkDeletePermission(payload: { ids: number[] }) {
    return network.delete("/admins/permissions/bulk", { data: payload });
  },

  // ─── Role Permissions ──────────────────────────────────────────────────────
  getRolePermissions(roleId: number) {
    return network.get("/admins/role-permissions", {
      params: { role_id: roleId },
    });
  },
  syncRolePermissions(payload: { role_id: number; permission_ids: number[] }) {
    return network.post("/admins/role-permissions/sync", payload);
  },
  assignRolePermissions(payload: {
    role_id: number;
    permission_ids: number[];
  }) {
    return network.post("/admins/role-permissions/assign", payload);
  },
  unassignRolePermissions(payload: {
    role_id: number;
    permission_ids: number[];
  }) {
    return network.post("/admins/role-permissions/unassign", payload);
  },
};

export default admin;
