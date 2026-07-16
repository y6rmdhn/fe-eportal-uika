import AdminLayout from "@/components/layouts/AdminLayout";
import useSuspiciousIps from "@/hooks/LoginLog/useSuspiciousIps";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import admin from "@/services/api/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Shield, Building2 } from "lucide-react"; // sementara tidak dipakai
import {
  Monitor,
  Smartphone,
  Tablet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Eye,
  ChevronLeft,
  ChevronRight,
  Database,
  LogIn,
  User,
  Settings,
  Clock,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DataTable from "@/common/DataTable";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// ── Helpers ─────────────────────────────────────────────────────────────────
const DEVICE_ICON: Record<string, React.ReactNode> = {
  mobile: <Smartphone size={13} />,
  tablet: <Tablet size={13} />,
  desktop: <Monitor size={13} />,
};

// Category config for Activity Logs
const ACTIVITY_CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; bgColor: string; textColor: string; borderColor: string }
> = {
  auth: {
    label: "Autentikasi",
    icon: <LogIn size={14} />,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-100",
  },
  profile: {
    label: "Profil",
    icon: <User size={14} />,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-100",
  },
  data: {
    label: "Manipulasi Data",
    icon: <Database size={14} />,
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-100",
  },
  system: {
    label: "Sistem",
    icon: <Settings size={14} />,
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-100",
  },
  other: {
    label: "Lainnya",
    icon: <Activity size={14} />,
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
    borderColor: "border-gray-100",
  },
};

const TYPE_COLOR_MAP: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
  gray:    { bg: "bg-gray-50",    text: "text-gray-600",    border: "border-gray-100"    },
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-100"    },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100"   },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-100"    },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-100"  },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-100"    },
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-100"     },
};

// ── Main Component ──────────────────────────────────────────────────────────
const LoginLog = () => {
  const [activeTab, setActiveTab] = useState("activity");

  // ── Login Log State ──
  const [currentDevice, setCurrentDevice] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit] = useState(20);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [detailPage, setDetailPage] = useState(1);
  const [detailLimit, setDetailLimit] = useState(8);

  // ── Activity Log State ──
  const [activityPage, setActivityPage] = useState(1);
  const [activityPerPage] = useState(15);
  const [activityTypeFilter, setActivityTypeFilter] = useState("");
  const [activitySearch, setActivitySearch] = useState("");

  const { dataSuspiciousIps } = useSuspiciousIps();

  // ── Login Log Queries ──
  const { data: groupedData, isLoading: isLoadingLogin } = useQuery({
    queryKey: ["login-log-grouped", currentPage, currentLimit, currentFilter, currentDevice],
    queryFn: async () => {
      const res = await admin.getGroupedLoginLogs({
        page: currentPage,
        per_page: currentLimit,
        status: currentFilter || undefined,
        device_type: currentDevice || undefined,
      });
      return res.data;
    },
  });

  const { data: dataStats } = useQuery({
    queryKey: ["login-log-stats"],
    queryFn: async () => {
      const res = await admin.getLoginStats();
      return res.data.data;
    },
  });

  const { data: detailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["activity-log-detail", selectedGroup?.user_id, detailPage, detailLimit],
    queryFn: async () => {
      const res = await admin.getActivityLogs(selectedGroup?.user_id, {
        per_page: detailLimit,
        page: detailPage,
      });
      return res.data;
    },
    enabled: !!selectedGroup,
  });

  // ── Global Activity Log Query ──
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["global-activity-logs", activityPage, activityPerPage, activityTypeFilter, activitySearch],
    queryFn: async () => {
      const res = await admin.getAllActivityLogs({
        page: activityPage,
        per_page: activityPerPage,
        type: activityTypeFilter || undefined,
        exclude_types: "login,logout",
        search: activitySearch || undefined,
      });
      return res.data;
    },
  });

  const stats = useMemo(
    () => ({
      total: dataStats?.total || 0,
      success: dataStats?.success || 0,
      failed: dataStats?.failed || 0,
      suspicious: dataSuspiciousIps?.data?.length || 0,
    }),
    [dataStats, dataSuspiciousIps],
  );

  const loginLogs = groupedData?.data || [];
  const loginMeta = groupedData?.meta;
  const activityLogs = activityData?.data || [];
  const activityMeta = activityData?.meta;

  return (
    <AdminLayout title="Aktivitas Log | E-Portal UIKA" desc="Aktivitas Log">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-50 rounded-xl">
              <Activity className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Aktivitas Log
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-0.5">
                Monitor semua aktivitas sistem — login, logout, dan manipulasi data
              </p>
            </div>
          </div>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Login",
              value: stats.total,
              icon: <Activity size={18} className="text-blue-500" />,
              bg: "bg-blue-50",
            },
            {
              label: "Login Berhasil",
              value: stats.success,
              icon: <CheckCircle2 size={18} className="text-emerald-500" />,
              bg: "bg-emerald-50",
            },
            {
              label: "Login Gagal",
              value: stats.failed,
              icon: <XCircle size={18} className="text-rose-500" />,
              bg: "bg-rose-50",
            },
            {
              label: "IP Mencurigakan",
              value: stats.suspicious,
              icon: <AlertTriangle size={18} className="text-amber-500" />,
              bg: "bg-amber-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>{stat.icon}</div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── SUSPICIOUS IPs ── */}
        {(dataSuspiciousIps?.data?.length ?? 0) > 0 && (
          <div className="bg-white rounded-[1.5rem] border border-rose-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-rose-500" />
              <h2 className="font-bold text-gray-900">IP Mencurigakan</h2>
              <span className="ml-auto text-xs text-rose-500 font-semibold">
                Percobaan login berulang
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {(dataSuspiciousIps?.data || []).map((ip: any) => (
                <div
                  key={ip.ip_address}
                  className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl"
                >
                  <span className="font-mono text-sm font-bold text-rose-700">
                    {ip.ip_address}
                  </span>
                  <span className="text-xs text-rose-500">
                    {ip.attempt_count}x percobaan
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TABS ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-sm h-11 p-1 bg-gray-100 rounded-xl mb-2">
            <TabsTrigger
              value="activity"
              className="flex-1 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-700 flex items-center gap-2"
            >
              <Database size={14} />
              Aktivitas CRUD
            </TabsTrigger>
            <TabsTrigger
              value="login"
              className="flex-1 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 flex items-center gap-2"
            >
              <LogIn size={14} />
              Login Log
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: ACTIVITY LOG (CRUD) */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="activity" className="mt-0">
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">

              {/* Filter Bar */}
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter:
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                  <input
                    type="text"
                    placeholder="Cari deskripsi..."
                    value={activitySearch}
                    onChange={(e) => {
                      setActivitySearch(e.target.value);
                      setActivityPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-gray-50"
                  />
                </div>

                {/* Type Filter */}
                <Select
                  value={activityTypeFilter || "all"}
                  onValueChange={(v) => {
                    setActivityTypeFilter(v === "all" ? "" : v);
                    setActivityPage(1);
                  }}
                >
                  <SelectTrigger className="w-[190px] h-9 rounded-xl border-gray-200 bg-gray-50 text-sm">
                    <SelectValue placeholder="Semua tipe" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua tipe</SelectItem>
                    <SelectItem value="update_profile">Update Profil</SelectItem>
                    <SelectItem value="change_password">Ganti Password</SelectItem>
                    <SelectItem value="reset_password">Reset Password</SelectItem>
                    <SelectItem value="unit_create">Buat Unit</SelectItem>
                    <SelectItem value="unit_update">Update Unit</SelectItem>
                    <SelectItem value="unit_delete">Hapus Unit</SelectItem>
                    <SelectItem value="unit_assign">Tugaskan Unit</SelectItem>
                    <SelectItem value="unit_unassign">Cabut Unit</SelectItem>
                    <SelectItem value="permission_assign">Tugaskan Hak Akses</SelectItem>
                    <SelectItem value="permission_unassign">Cabut Hak Akses</SelectItem>
                    <SelectItem value="permission_sync">Sinkron Hak Akses</SelectItem>
                    <SelectItem value="role_create">Buat Role</SelectItem>
                    <SelectItem value="role_update">Update Role</SelectItem>
                    <SelectItem value="role_delete">Hapus Role</SelectItem>
                    <SelectItem value="role_assign">Tugaskan Role</SelectItem>
                    <SelectItem value="role_unassign">Cabut Role</SelectItem>
                    <SelectItem value="app_access">Akses Aplikasi</SelectItem>
                  </SelectContent>
                </Select>

                {(activityTypeFilter || activitySearch) && (
                  <button
                    onClick={() => {
                      setActivityTypeFilter("");
                      setActivitySearch("");
                      setActivityPage(1);
                    }}
                    className="text-xs font-bold text-gray-400 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Reset
                  </button>
                )}

                <span className="ml-auto text-xs font-semibold text-gray-400">
                  {activityMeta?.total ?? 0} entri
                </span>
              </div>

              {/* Activity Log Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-10">
                        No
                      </th>
                      <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                        Waktu
                      </th>
                      <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                        Aktor
                      </th>
                      <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                        Tipe Aksi
                      </th>
                      <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                        Deskripsi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoadingActivity ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 6 }).map((_, j) => (
                            <td key={j} className="px-5 py-3.5">
                              <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : activityLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-400">
                            <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center">
                              <Database className="h-5 w-5 text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold">
                              {activitySearch || activityTypeFilter
                                ? "Tidak ada log yang cocok dengan filter."
                                : "Belum ada aktivitas log."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      activityLogs.map((log: any, index: number) => {
                        const catCfg =
                          ACTIVITY_CATEGORY_CONFIG[log.type_category] ||
                          ACTIVITY_CATEGORY_CONFIG["other"];
                        const typeCfg =
                          TYPE_COLOR_MAP[log.type_color] ||
                          TYPE_COLOR_MAP["gray"];
                        return (
                          <tr
                            key={log.id}
                            className="hover:bg-gray-50/60 transition-colors"
                          >
                            {/* No */}
                            <td className="px-5 py-3.5 text-gray-400 font-medium text-sm">
                              {(activityPage - 1) * activityPerPage + index + 1}
                            </td>

                            {/* Waktu */}
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[12px] font-bold text-gray-700">
                                  {log.created_at}
                                </span>
                                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                  <Clock size={10} />
                                  {log.created_at_human}
                                </span>
                              </div>
                            </td>

                            {/* Aktor */}
                            <td className="px-5 py-3.5">
                              {log.actor ? (
                                <div className="flex flex-col">
                                  <span className="text-[13px] font-bold text-gray-900">
                                    {log.actor.name || log.actor.email}
                                  </span>
                                  <span className="text-[11px] text-gray-400">
                                    {log.actor.email}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[12px] text-gray-400 italic">
                                  Sistem
                                </span>
                              )}
                            </td>

                            {/* Kategori */}
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${catCfg.bgColor} ${catCfg.textColor} ${catCfg.borderColor}`}
                              >
                                {catCfg.icon}
                                {catCfg.label}
                              </span>
                            </td>

                            {/* Tipe Aksi */}
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
                              >
                                {log.type_label}
                              </span>
                            </td>

                            {/* Deskripsi */}
                            <td className="px-5 py-3.5 max-w-[300px]">
                              <span className="text-[13px] text-gray-700 leading-relaxed">
                                {log.description}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Activity Pagination */}
              {activityMeta && activityMeta.last_page > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-medium">
                    Menampilkan{" "}
                    <span className="font-bold text-gray-700">
                      {activityMeta.from}
                    </span>
                    –
                    <span className="font-bold text-gray-700">
                      {activityMeta.to}
                    </span>{" "}
                    dari{" "}
                    <span className="font-bold text-gray-700">
                      {activityMeta.total}
                    </span>{" "}
                    entri
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      disabled={activityPage === 1}
                      onClick={() => setActivityPage((p) => p - 1)}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm font-bold text-gray-700 px-1">
                      {activityPage} / {activityMeta.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      disabled={activityPage === activityMeta.last_page}
                      onClick={() => setActivityPage((p) => p + 1)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: LOGIN LOG */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="login" className="mt-0">
            {/* Login Filter Bar */}
            <div className="bg-white rounded-t-[1.5rem] border border-b-0 border-gray-100 shadow-sm p-5 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <SlidersHorizontal className="h-4 w-4" />
                Filter:
              </div>
              <Select
                value={currentFilter || "all"}
                onValueChange={(v) => {
                  setCurrentFilter(v === "all" ? "" : v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] h-9 rounded-xl border-gray-200 bg-gray-50 text-sm">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Semua status</SelectItem>
                  <SelectItem value="success">Berhasil</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={currentDevice || "all"}
                onValueChange={(v) => {
                  setCurrentDevice(v === "all" ? "" : v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] h-9 rounded-xl border-gray-200 bg-gray-50 text-sm">
                  <SelectValue placeholder="Semua device" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Semua device</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-auto text-xs font-semibold text-gray-400">
                {loginMeta?.total ?? 0} entri
              </span>
            </div>

            {/* Login Log Table */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-b-[1.5rem]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      {["No", "Tanggal", "User", "Total", "Berhasil", "Gagal", "IP Address", "Device Info", "Aksi"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoadingLogin ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 9 }).map((_, j) => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-gray-100 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : loginLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-16 text-center text-gray-400 font-medium"
                        >
                          Belum ada data log login.
                        </td>
                      </tr>
                    ) : (
                      loginLogs.map((log: any, index: number) => (
                        <tr
                          key={`${log.date}-${log.user_id}`}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-400 font-medium">
                            {(currentPage - 1) * currentLimit + index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-700">
                              {new Date(log.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-[13px]">
                                {log.email}
                              </span>
                              <span
                                className={`text-[11px] font-semibold mt-0.5 px-2 py-0.5 rounded-md w-fit ${
                                  log.role?.toLowerCase().includes("admin")
                                    ? "bg-rose-50 text-rose-700"
                                    : log.role?.toLowerCase().includes("mahasiswa")
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {log.role}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-gray-900 text-lg">
                              {log.total}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {log.success}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                              {log.failed}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-gray-600">
                              {log.last_ip}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              {DEVICE_ICON[log.device_type] ?? <Monitor size={13} />}
                              <span>
                                {log.browser} • {log.platform} •{" "}
                                <span className="capitalize">{log.device_type}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Lihat Detail Aktivitas"
                              onClick={() => {
                                setSelectedGroup(log);
                                setDetailPage(1);
                                setDetailOpen(true);
                              }}
                            >
                              <Eye size={16} strokeWidth={2.5} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Login Pagination */}
              {loginMeta && loginMeta.last_page > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-medium">
                    Menampilkan {loginMeta.from}–{loginMeta.to} dari{" "}
                    {loginMeta.total} data
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm font-bold text-gray-700">
                      {currentPage} / {loginMeta.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      disabled={currentPage === loginMeta.last_page}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── DIALOG DETAIL LOGIN USER ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="!max-w-5xl w-[95vw] max-h-[85vh] rounded-2xl flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Activity size={16} />
              </div>
              Riwayat Aktivitas — {selectedGroup?.email}
              <span className="text-gray-400 font-normal text-sm ml-1">
                (
                {selectedGroup?.date &&
                  new Date(selectedGroup.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                )
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <DataTable
              header={["Waktu", "Tipe", "Deskripsi"]}
              isLoading={isLoadingDetail}
              totalPages={detailData?.meta?.last_page || 1}
              currentPage={detailPage}
              currentLimit={detailLimit}
              onChangePage={(page) => setDetailPage(page)}
              onChangeLimit={(limit) => {
                setDetailLimit(limit);
                setDetailPage(1);
              }}
              data={(detailData?.data || []).map((log: any) => {
                const typeCfg =
                  TYPE_COLOR_MAP[log.type_color] || TYPE_COLOR_MAP["gray"];
                return [
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {log.created_at_human}
                  </span>,
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
                  >
                    {log.type_label}
                  </span>,
                  <span className="text-sm text-gray-700">{log.description}</span>,
                ];
              })}
            />
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default LoginLog;
