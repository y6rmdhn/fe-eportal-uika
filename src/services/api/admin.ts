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
};

export default admin;
