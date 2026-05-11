import network from "@/utils/network.ts";

const admin = {
  getProfile() {
    return network.get("/profile");
  },
  updateProfile(payload: FormData) {
    return network.post("/profile/update", payload);
  },
  changePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) {
    return network.post("/profile/change-password", payload);
  },
};

export default admin;
