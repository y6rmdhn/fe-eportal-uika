import network from "@/utils/network.ts";

interface UserManagementParams {
  currentLimit?: number;
  currentPage?: number;
  currentSearch?: string;
}

const admin = {
  getAllUserManagement(params: UserManagementParams) {
    return network.get("/admins", {
      params: {
        search: params.currentSearch,
        per_page: params.currentLimit,
        page: params.currentPage,
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
};

export default admin;
