import network from "@/utils/network.ts";

const dashboard = {
  getStats() {
    return network.get("/admins/dashboard/stats");
  },

  getActiveUsersChart(period: "weekly" | "monthly" = "weekly") {
    return network.get(`/admins/dashboard/active-users?period=${period}`);
  },

  getUserGrowth(period: "weekly" | "monthly" = "monthly") {
    return network.get(`/admins/dashboard/user-growth?period=${period}`);
  },

  getRecentActivity(limit: number = 10) {
    return network.get(`/admins/dashboard/recent-activity?limit=${limit}`);
  },

  getIdleUsers(days: number = 30, limit: number = 10) {
    return network.get(
      `/admins/dashboard/idle-users?days=${days}&limit=${limit}`,
    );
  },

  getRoleDistribution() {
    return network.get("/admins/dashboard/role-distribution");
  },

  getLoginHeatmap() {
    return network.get("/admins/dashboard/login-heatmap");
  },

  clearCache() {
    return network.post("/admins/dashboard/clear-cache");
  },
};

export default dashboard;
