import network from "@/utils/network.ts";

const security = {
  // Ambil semua log login (bisa pakai params filter: status, ip_address, date_from, dll)
  getLogs(params?: any) {
    return network.get("/admins/security/logs", { params });
  },

  // Ambil histori log login khusus untuk satu user tertentu
  getLogsByUser(userId: string | number, params?: any) {
    return network.get(`/admins/security/logs/user/${userId}`, { params });
  },

  // Ambil daftar IP yang dicurigai melakukan brute force
  getSuspiciousIps() {
    return network.get("/admins/security/suspicious-ips");
  },

  // Cek status rate limit (opsional kirim parameter ip atau email)
  getRateLimitStatus(params?: { ip?: string; email?: string }) {
    return network.get("/admins/security/rate-limit-status", { params });
  },

  // Hapus log lama (default 90 hari sesuai settingan backend kamu)
  purgeLogs(days: number = 90) {
    return network.delete(`/admins/security/logs/purge?days=${days}`);
  }
};

export default security;