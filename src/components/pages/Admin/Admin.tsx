import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserX,
  Activity,
  Loader2,
  MonitorSmartphone,
  Globe,
  ShieldCheck,
  ShieldAlert,
  PieChart as LucidePieChart,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import dashboard from "@/services/api/dashboard";
import security from "@/services/api/security";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Warna Chart disesuaikan dengan Tema UIKA (Nuansa Emerald, Teal, Sky Blue, Amber)
const CHART_COLORS = ["#059669", "#10b981", "#34d399", "#0ea5e9", "#f59e0b"];

const AdminDashboard = () => {
  // 1. Fetch Data Stats Summary
  const { data: statsResponse, isLoading: isLoadingStats } = useQuery({
    queryKey: ["DashboardStats"],
    queryFn: () => dashboard.getStats(),
  });

  // 2. Fetch Data Recent Activity DARI SECURITY LOGS
  const { data: activityResponse, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["SecurityRecentLogs"],
    queryFn: () => security.getLogs({ per_page: 5 }),
  });

  // 3. Fetch Data Role Distribution
  const { data: roleResponse, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["DashboardRoleDistribution"],
    queryFn: () => dashboard.getRoleDistribution(),
  });

  // Extract data
  const stats = statsResponse?.data?.data;
  const recentActivities = activityResponse?.data?.data || [];
  const roleDistributionData = roleResponse?.data?.data || [];

  // Mapping data ke Card dengan warna yang lebih soft & modern
  const summaryCards = useMemo(() => {
    return [
      {
        title: "Total Pengguna",
        total: stats?.total_users || 0,
        icon: <Users className="h-6 w-6 text-sky-600" />,
        bgColor: "bg-sky-50",
        description: "Seluruh pengguna terdaftar",
      },
      {
        title: "Pengguna Aktif",
        total: stats?.active_users || 0,
        icon: <UserCheck className="h-6 w-6 text-emerald-600" />,
        bgColor: "bg-emerald-50",
        description: "Aktif dalam 30 hari terakhir",
      },
      {
        title: "Pengguna Tidak Aktif",
        total: stats?.inactive_users || 0,
        icon: <UserX className="h-6 w-6 text-rose-600" />,
        bgColor: "bg-rose-50",
        description: "Idle / lama tidak login",
      },
      {
        title: "Login Hari Ini",
        total: stats?.total_login_today || 0,
        icon: <Activity className="h-6 w-6 text-amber-600" />,
        bgColor: "bg-amber-50",
        description: "Total login sukses hari ini",
      },
    ];
  }, [stats]);

  return (
    <AdminLayout
      title="Dashboard Admin | E-Portal UIKA"
      desc="Overview Dashboard"
    >
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto">
        {/* ── BANNER WELCOME (Modern Gradient) ── */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-emerald-700 to-emerald-500 p-8 sm:p-10 text-white shadow-lg shadow-emerald-600/20 border border-emerald-400/20">
          {/* Decorative Background Blobs */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-emerald-900/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-50">
                Sistem Aktif
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight drop-shadow-sm">
              Selamat Datang, Administrator! 👋
            </h2>
            <p className="text-emerald-50 text-[15px] sm:text-base max-w-2xl leading-relaxed font-medium">
              Pantau statistik pengguna, pantau aktivitas keamanan, dan kelola
              distribusi akses e-Portal UIKA langsung dari panel kendali utama
              ini.
            </p>
          </div>
        </div>

        {/* ── GRID CARD STATISTIK ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {isLoadingStats
            ? Array.from({ length: 4 }).map((_, idx) => (
                <Card
                  key={`skeleton-${idx}`}
                  className="border-gray-100 shadow-sm rounded-2xl h-[130px] flex items-center justify-center bg-white"
                >
                  <Loader2
                    className="animate-spin text-emerald-500"
                    size={28}
                  />
                </Card>
              ))
            : summaryCards.map((data, index) => (
                <Card
                  key={index}
                  className="border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 group"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
                    <CardTitle className="text-sm font-bold text-gray-500 tracking-wide">
                      {data.title}
                    </CardTitle>
                    <div
                      className={`p-2.5 rounded-xl ${data.bgColor} transition-transform duration-300 group-hover:scale-110`}
                    >
                      {data.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                      {data.total}
                    </div>
                    <p className="text-[12px] font-medium text-gray-400 mt-1">
                      {data.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* ── SECTION BAWAH: TABEL & CHART ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-8">
          {/* Daftar Aktivitas Terbaru */}
          <Card className="col-span-1 xl:col-span-2 border-gray-100 shadow-sm rounded-[1.5rem] bg-white flex flex-col">
            <CardHeader className="px-7 pt-7 pb-4 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-extrabold text-gray-900 tracking-tight">
                  Aktivitas Login Terbaru
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Monitoring log masuk dari sistem SSO
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {isLoadingActivity ? (
                <div className="flex justify-center items-center h-full min-h-[300px]">
                  <Loader2
                    className="animate-spin text-emerald-600"
                    size={32}
                  />
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {recentActivities.map((activity: any, idx: number) => {
                    const isSuccess = activity.status === "success";
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-7 py-4 hover:bg-gray-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {/* Status Icon */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                          >
                            {isSuccess ? (
                              <ShieldCheck size={20} />
                            ) : (
                              <ShieldAlert size={20} />
                            )}
                          </div>

                          {/* User Info & Details */}
                          <div>
                            <p className="font-bold text-[14px] text-gray-900">
                              {activity.user?.name || "Unknown User"}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-[12px] font-medium text-gray-500">
                              <span className="flex items-center gap-1">
                                <Globe size={12} className="text-gray-400" />{" "}
                                {activity.ip_address}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className="flex items-center gap-1">
                                <MonitorSmartphone
                                  size={12}
                                  className="text-gray-400"
                                />{" "}
                                {activity.browser !== "0"
                                  ? activity.browser
                                  : "Sistem"}{" "}
                                (
                                {activity.platform !== "0"
                                  ? activity.platform
                                  : "Unknown"}
                                )
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Waktu & Badge Status */}
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                          >
                            {isSuccess ? "Berhasil" : "Gagal"}
                          </span>
                          <span className="text-xs font-semibold text-gray-400">
                            {activity.created_at_human || "-"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                    <Activity size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">
                    Belum ada aktivitas terekam.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* DONUT CHART (Distribusi Role) */}
          <Card className="col-span-1 border-gray-100 shadow-sm rounded-[1.5rem] bg-white flex flex-col">
            <CardHeader className="px-7 pt-7 pb-2">
              <CardTitle className="text-lg font-extrabold text-gray-900 tracking-tight">
                Distribusi Role
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Proporsi hak akses pengguna
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center min-h-[300px] pb-6">
              {isLoadingRoles ? (
                <Loader2 className="animate-spin text-emerald-600" size={32} />
              ) : roleDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="total"
                      nameKey="role"
                      stroke="none"
                    >
                      {roleDistributionData.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          className="hover:opacity-80 transition-opacity outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} Akun`, "Total"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                      itemStyle={{ color: "#374151" }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="capitalize text-gray-700 font-bold text-sm ml-1">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <LucidePieChart size={32} className="text-gray-200 mb-2" />
                  <p className="text-sm font-semibold text-gray-500">
                    Data role kosong.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
