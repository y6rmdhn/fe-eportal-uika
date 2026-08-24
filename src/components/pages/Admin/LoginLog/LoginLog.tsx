import AdminLayout from "@/components/layouts/AdminLayout";
import { LIMIT_LISTS } from "@/constants/DataTableConstant";
import useSuspiciousIps from "@/hooks/LoginLog/useSuspiciousIps";
import React, { useEffect, useMemo, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useActivityLogTypes,
  useActivityLogStats,
} from "@/hooks/ActivityLog/useActivityLog";

// ── Helpers ─────────────────────────────────────────────────────────────────
const DEVICE_ICON: Record<string, React.ReactNode> = {
  mobile: <Smartphone size={13} />,
  tablet: <Tablet size={13} />,
  desktop: <Monitor size={13} />,
};

// Category config for Activity Logs
const ACTIVITY_CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
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
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
  },
  gray: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
  },
  rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-100",
  },
  teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100" },
  sky: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-100" },
};

// Badge aksi CRUD — dipakai di kolom "Aksi" tabel aktivitas
const ACTION_CONFIG: Record<
  string,
  { label: string; cls: string; dot: string }
> = {
  create: {
    label: "Create",
    cls: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
  },
  update: {
    label: "Update",
    cls: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  delete: {
    label: "Delete",
    cls: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  auth: {
    label: "Auth",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  access: {
    label: "Access",
    cls: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  other: {
    label: "Lainnya",
    cls: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
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
  const [loginSearchInput, setLoginSearchInput] = useState("");
  const [loginSearch, setLoginSearch] = useState("");
  const [detailPage, setDetailPage] = useState(1);
  // Harus salah satu nilai LIMIT_LISTS ([10,25,50,100]); nilai di luar itu
  // membuat Select tidak menemukan item yang cocok dan tampil kosong.
  const [detailLimit, setDetailLimit] = useState(10);

  // ── Activity Log State ──
  const [activityPage, setActivityPage] = useState(1);
  const [activityPerPage] = useState(15);
  const [activityTypeFilter, setActivityTypeFilter] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [activityActionFilter, setActivityActionFilter] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const { types: activityTypes } = useActivityLogTypes();
  const { stats: activityStats } = useActivityLogStats(7);

  // Filter aksi (create/update/delete) diterjemahkan menjadi daftar tipe,
  // karena backend memfilter berdasarkan tipe.
  const typesForAction = useMemo(
    () =>
      activityActionFilter
        ? activityTypes
            .filter((t) => t.action === activityActionFilter)
            .map((t) => t.value)
        : [],
    [activityActionFilter, activityTypes],
  );

  const typeOptionsByCategory = useMemo(() => {
    const groups: Record<string, typeof activityTypes> = {};
    activityTypes
      .filter((t) => !activityActionFilter || t.action === activityActionFilter)
      .forEach((t) => {
        (groups[t.category] ||= []).push(t);
      });
    return groups;
  }, [activityTypes, activityActionFilter]);

  // Debounce pencarian login supaya tiap ketikan tidak memicu request
  useEffect(() => {
    const t = setTimeout(() => {
      setLoginSearch(loginSearchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [loginSearchInput]);

  // Panel IP mencurigakan menulis langsung ke loginSearch, jadi kotak
  // pencarian ikut disinkronkan agar isinya tidak membingungkan.
  useEffect(() => {
    if (loginSearch && loginSearch !== loginSearchInput) {
      setLoginSearchInput(loginSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginSearch]);

  const { dataSuspiciousIps } = useSuspiciousIps();

  // ── Login Log Queries ──
  const { data: groupedData, isLoading: isLoadingLogin } = useQuery({
    queryKey: [
      "login-log-grouped",
      currentPage,
      currentLimit,
      currentFilter,
      currentDevice,
      loginSearch,
    ],
    queryFn: async () => {
      const res = await admin.getGroupedLoginLogs({
        page: currentPage,
        per_page: currentLimit,
        status: currentFilter || undefined,
        device_type: currentDevice || undefined,
        search: loginSearch || undefined,
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
    queryKey: [
      "activity-log-detail",
      selectedGroup?.user_id,
      selectedGroup?.date,
      detailPage,
      detailLimit,
    ],
    queryFn: async () => {
      const res = await admin.getActivityLogs(selectedGroup?.user_id, {
        per_page: detailLimit,
        page: detailPage,
        // Dialog ini dibuka dari satu baris tanggal tertentu, jadi isinya
        // harus dibatasi ke tanggal itu — sebelumnya menampilkan semua tanggal.
        date_from: selectedGroup?.date,
        date_to: selectedGroup?.date,
      });
      return res.data;
    },
    enabled: !!selectedGroup,
  });

  // ── Global Activity Log Query ──
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: [
      "global-activity-logs",
      activityPage,
      activityPerPage,
      activityTypeFilter,
      activityActionFilter,
      activitySearch,
    ],
    queryFn: async () => {
      const res = await admin.getAllActivityLogs({
        page: activityPage,
        per_page: activityPerPage,
        type: activityTypeFilter || undefined,
        types:
          !activityTypeFilter && typesForAction.length > 0
            ? typesForAction.join(",")
            : undefined,
        exclude_types: "login,logout,app_access",
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
                Monitor semua aktivitas sistem — login, logout, dan manipulasi
                data
              </p>
            </div>
          </div>
        </div>

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
          <TabsContent value="activity" className="mt-0 space-y-5">
            {/* ── RINGKASAN CRUD ── */}
            {activityStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    key: "create",
                    label: "Create",
                    value: activityStats.create,
                    cls: "text-teal-700",
                    bar: "bg-teal-500",
                  },
                  {
                    key: "update",
                    label: "Update",
                    value: activityStats.update,
                    cls: "text-sky-700",
                    bar: "bg-sky-500",
                  },
                  {
                    key: "delete",
                    label: "Delete",
                    value: activityStats.delete,
                    cls: "text-rose-700",
                    bar: "bg-rose-500",
                  },
                ].map((c) => {
                  const pct =
                    activityStats.total_crud > 0
                      ? Math.round((c.value / activityStats.total_crud) * 100)
                      : 0;
                  const active = activityActionFilter === c.key;
                  return (
                    <button
                      key={c.key}
                      onClick={() => {
                        setActivityActionFilter(active ? "" : c.key);
                        setActivityTypeFilter("");
                        setActivityPage(1);
                      }}
                      aria-pressed={active}
                      className={`text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-sm ${
                        active
                          ? "border-gray-900 ring-2 ring-gray-900/10"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          {c.label}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-400">
                          {pct}%
                        </span>
                      </div>
                      <p className={`text-2xl font-extrabold mt-1 ${c.cls}`}>
                        {c.value}
                      </p>
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${c.bar} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}

                {/* Tren 7 hari */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Tren 7 hari
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">
                      {activityStats.today} hari ini
                    </span>
                  </div>
                  <div className="flex items-end gap-1.5 h-[46px]">
                    {activityStats.trend.map((d) => {
                      const max = Math.max(
                        ...activityStats.trend.map((x) => x.total),
                        1,
                      );
                      return (
                        <div
                          key={d.date}
                          className="flex-1 flex flex-col items-center gap-1 group"
                          title={`${d.date}: ${d.total} aktivitas`}
                        >
                          <div
                            className="w-full bg-violet-500/80 group-hover:bg-violet-600 rounded-sm transition-all min-h-[2px]"
                            style={{ height: `${(d.total / max) * 34}px` }}
                          />
                          <span className="text-[9px] font-semibold text-gray-400">
                            {d.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

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
                  <SelectContent className="rounded-xl max-h-[320px]">
                    <SelectItem value="all">Semua tipe</SelectItem>
                    {Object.entries(typeOptionsByCategory).map(
                      ([category, opts]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {ACTIVITY_CATEGORY_CONFIG[category]?.label ??
                              category}
                          </div>
                          {opts.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </div>
                      ),
                    )}
                  </SelectContent>
                </Select>

                {(activityTypeFilter || activitySearch || activityActionFilter) && (
                  <button
                    onClick={() => {
                      setActivityTypeFilter("");
                      setActivitySearch("");
                      setActivityActionFilter("");
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
                        Aksi
                      </th>
                      <th className="text-left px-5 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                        Deskripsi
                      </th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoadingActivity ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 8 }).map((_, j) => (
                            <td key={j} className="px-5 py-3.5">
                              <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : activityLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-16 text-center">
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
                        const actCfg =
                          ACTION_CONFIG[log.type_action] ||
                          ACTION_CONFIG["other"];
                        const isExpanded = expandedLogId === log.id;
                        const hasDetail =
                          log.metadata &&
                          Object.keys(log.metadata).length > 0;
                        return (
                          <React.Fragment key={log.id}>
                          <tr
                            onClick={() =>
                              hasDetail &&
                              setExpandedLogId(isExpanded ? null : log.id)
                            }
                            className={`transition-colors ${
                              hasDetail ? "cursor-pointer" : ""
                            } ${isExpanded ? "bg-violet-50/40" : "hover:bg-gray-50/60"}`}
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

                            {/* Aksi CRUD */}
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${actCfg.cls}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${actCfg.dot}`}
                                />
                                {actCfg.label}
                              </span>
                            </td>

                            {/* Deskripsi */}
                            <td className="px-5 py-3.5 max-w-[340px]">
                              <span className="text-[13px] text-gray-700 leading-relaxed">
                                {log.description}
                              </span>
                            </td>

                            {/* Penanda detail */}
                            <td className="px-3 py-3.5 text-gray-300">
                              {hasDetail && (
                                <ChevronRight
                                  size={15}
                                  className={`transition-transform ${
                                    isExpanded ? "rotate-90 text-violet-500" : ""
                                  }`}
                                />
                              )}
                            </td>
                          </tr>

                          {/* Baris detail: isi metadata, termasuk before/after */}
                          {isExpanded && (
                            <tr className="bg-violet-50/20">
                              <td colSpan={8} className="px-5 pb-4 pt-0">
                                <div className="rounded-xl border border-violet-100 bg-white p-4">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                                    Detail perubahan
                                  </p>
                                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                                    {Object.entries(log.metadata).map(
                                      ([k, v]) => (
                                        <div
                                          key={k}
                                          className="flex gap-2 text-[12px] border-b border-gray-50 py-1"
                                        >
                                          <span className="font-semibold text-gray-500 shrink-0">
                                            {k}
                                          </span>
                                          <span className="font-mono text-gray-800 break-all">
                                            {typeof v === "object" && v !== null
                                              ? JSON.stringify(v)
                                              : String(v)}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
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
          <TabsContent value="login" className="mt-0 space-y-5">
            {/* ── RINGKASAN LOGIN ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  key: "",
                  label: "Total Login",
                  value: stats.total,
                  icon: <Activity size={16} className="text-blue-500" />,
                  bg: "bg-blue-50",
                  cls: "text-gray-900",
                  clickable: true,
                },
                {
                  key: "success",
                  label: "Berhasil",
                  value: stats.success,
                  icon: <CheckCircle2 size={16} className="text-emerald-500" />,
                  bg: "bg-emerald-50",
                  cls: "text-emerald-700",
                  clickable: true,
                },
                {
                  key: "failed",
                  label: "Gagal",
                  value: stats.failed,
                  icon: <XCircle size={16} className="text-rose-500" />,
                  bg: "bg-rose-50",
                  cls: "text-rose-700",
                  clickable: true,
                },
                {
                  key: "suspicious",
                  label: "IP Mencurigakan",
                  value: stats.suspicious,
                  icon: <AlertTriangle size={16} className="text-amber-500" />,
                  bg: "bg-amber-50",
                  cls: "text-amber-700",
                  clickable: false,
                },
              ].map((c) => {
                const active = c.clickable && currentFilter === c.key && c.key !== "";
                return (
                  <button
                    key={c.label}
                    disabled={!c.clickable}
                    aria-pressed={active}
                    onClick={() => {
                      if (!c.clickable) return;
                      setCurrentFilter(currentFilter === c.key ? "" : c.key);
                      setCurrentPage(1);
                    }}
                    className={`text-left bg-white rounded-2xl border p-4 transition-all ${
                      c.clickable ? "hover:shadow-sm" : "cursor-default"
                    } ${
                      active
                        ? "border-gray-900 ring-2 ring-gray-900/10"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${c.bg}`}>{c.icon}</div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        {c.label}
                      </span>
                    </div>
                    <p className={`text-2xl font-extrabold mt-2 ${c.cls}`}>
                      {c.value}
                    </p>
                    {c.key === "success" && stats.total > 0 && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${Math.round((stats.success / stats.total) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] font-semibold text-gray-400 mt-1">
                          {Math.round((stats.success / stats.total) * 100)}% tingkat
                          keberhasilan
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── IP MENCURIGAKAN ── */}
            {dataSuspiciousIps?.data?.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-amber-600" />
                  <span className="text-[12px] font-bold text-amber-800">
                    {dataSuspiciousIps.data.length} IP dengan percobaan login
                    gagal berulang
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dataSuspiciousIps.data.map((ip: any) => (
                    <button
                      key={ip.ip_address}
                      onClick={() => {
                        setLoginSearch(ip.ip_address);
                        setCurrentPage(1);
                      }}
                      title="Klik untuk memfilter log dengan IP ini"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-200 rounded-lg hover:border-amber-400 transition-colors"
                    >
                      <span className="font-mono text-[12px] font-bold text-rose-700">
                        {ip.ip_address}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-600">
                        {ip.attempt_count}x
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Login Filter Bar */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-5 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <SlidersHorizontal className="h-4 w-4" />
                Filter:
              </div>

              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                <input
                  type="text"
                  placeholder="Cari email atau IP address..."
                  value={loginSearchInput}
                  onChange={(e) => setLoginSearchInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50"
                />
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
              {(currentFilter || currentDevice || loginSearchInput) && (
                <button
                  onClick={() => {
                    setCurrentFilter("");
                    setCurrentDevice("");
                    setLoginSearchInput("");
                    setLoginSearch("");
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold text-gray-400 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Reset
                </button>
              )}

              <span className="ml-auto text-xs font-semibold text-gray-400">
                {loginMeta?.total ?? 0} entri
              </span>
            </div>

            {/* Login Log Table */}
            <div className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-[1.5rem]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      {[
                        "No",
                        "Tanggal",
                        "User",
                        "Aktivitas Login",
                        "IP Address",
                        "Perangkat",
                        "Aksi",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isLoadingLogin ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-gray-100 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : loginLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-gray-400">
                            <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center">
                              <Activity className="h-5 w-5 text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold">
                              {currentFilter || currentDevice || loginSearch
                                ? "Tidak ada log login yang cocok dengan filter."
                                : "Belum ada data log login."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      loginLogs.map((log: any, index: number) => {
                        const failed = Number(log.failed) || 0;
                        const total = Number(log.total) || 0;
                        const successPct =
                          total > 0
                            ? Math.round(((total - failed) / total) * 100)
                            : 0;
                        // Baris dengan kegagalan berulang perlu langsung terlihat
                        const isRisky = failed >= 3;
                        return (
                        <tr
                          key={`${log.date}-${log.user_id}`}
                          className={`transition-colors ${
                            isRisky
                              ? "bg-rose-50/40 hover:bg-rose-50/70"
                              : "hover:bg-gray-50/50"
                          }`}
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
                                    : log.role
                                          ?.toLowerCase()
                                          .includes("mahasiswa")
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {log.role}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 min-w-[190px]">
                            <div className="flex items-baseline gap-2">
                              <span className="font-extrabold text-gray-900 text-lg leading-none">
                                {total}
                              </span>
                              <span className="text-[11px] font-semibold text-gray-400">
                                percobaan
                              </span>
                              {isRisky && (
                                <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                  <AlertTriangle size={9} />
                                  Perlu dicek
                                </span>
                              )}
                            </div>

                            {/* Rasio berhasil vs gagal dalam satu bar */}
                            <div className="mt-2 flex h-1.5 rounded-full overflow-hidden bg-gray-100">
                              <div
                                className="bg-emerald-500"
                                style={{ width: `${successPct}%` }}
                              />
                              <div
                                className="bg-rose-500"
                                style={{ width: `${100 - successPct}%` }}
                              />
                            </div>

                            <div className="mt-1.5 flex items-center gap-3 text-[11px] font-semibold">
                              <span className="text-emerald-700">
                                {log.success} berhasil
                              </span>
                              <span
                                className={
                                  failed > 0 ? "text-rose-700" : "text-gray-300"
                                }
                              >
                                {failed} gagal
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-gray-600">
                              {log.last_ip}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 p-1.5 bg-gray-50 rounded-lg text-gray-500">
                                {DEVICE_ICON[log.device_type] ?? (
                                  <Monitor size={13} />
                                )}
                              </span>
                              <div className="flex flex-col leading-tight">
                                <span className="text-[12px] font-bold text-gray-700">
                                  {log.browser}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {log.platform} ·{" "}
                                  <span className="capitalize">
                                    {log.device_type}
                                  </span>
                                </span>
                              </div>
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
                        );
                      })
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
        <DialogContent className="!max-w-3xl w-[95vw] max-h-[88vh] rounded-2xl flex flex-col gap-0 p-0 overflow-hidden">
          {/* HEADER */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="font-extrabold text-gray-900 flex items-center gap-2.5 text-lg">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Activity size={16} />
              </div>
              Riwayat Aktivitas
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm font-bold text-gray-800">
                {selectedGroup?.email}
              </span>
              {selectedGroup?.role && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                  {selectedGroup.role}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {selectedGroup?.date &&
                  new Date(selectedGroup.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
              </span>
            </div>
          </DialogHeader>

          {/* RINGKASAN LOGIN HARI ITU */}
          {selectedGroup && (
            <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Percobaan
                </p>
                <p className="text-lg font-extrabold text-gray-900 mt-0.5">
                  {selectedGroup.total}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Berhasil / Gagal
                </p>
                <p className="text-lg font-extrabold mt-0.5">
                  <span className="text-emerald-600">{selectedGroup.success}</span>
                  <span className="text-gray-300 mx-1">/</span>
                  <span
                    className={
                      Number(selectedGroup.failed) > 0
                        ? "text-rose-600"
                        : "text-gray-300"
                    }
                  >
                    {selectedGroup.failed}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  IP Terakhir
                </p>
                <p className="text-[13px] font-mono font-bold text-gray-700 mt-1.5">
                  {selectedGroup.last_ip}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Perangkat
                </p>
                <p className="text-[12px] font-semibold text-gray-700 mt-1.5 flex items-center gap-1.5">
                  {DEVICE_ICON[selectedGroup.device_type] ?? <Monitor size={13} />}
                  {selectedGroup.browser}
                </p>
              </div>
            </div>
          )}

          {/* TIMELINE AKTIVITAS */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isLoadingDetail ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
                      <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (detailData?.data || []).length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 text-gray-400">
                <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-gray-300" />
                </div>
                <p className="text-sm font-semibold">
                  Tidak ada aktivitas tercatat pada tanggal ini.
                </p>
              </div>
            ) : (
              <ol className="relative">
                {(detailData?.data || []).map((log: any, i: number) => {
                  const typeCfg =
                    TYPE_COLOR_MAP[log.type_color] || TYPE_COLOR_MAP["gray"];
                  const actCfg =
                    ACTION_CONFIG[log.type_action] || ACTION_CONFIG["other"];
                  const isLast = i === (detailData?.data || []).length - 1;
                  const hasDetail =
                    log.metadata && Object.keys(log.metadata).length > 0;

                  return (
                    <li key={log.id} className="flex gap-3.5">
                      {/* Garis waktu */}
                      <div className="flex flex-col items-center shrink-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 ring-4 ring-white ${actCfg.dot}`}
                        />
                        {!isLast && <span className="w-px flex-1 bg-gray-200 my-1" />}
                      </div>

                      {/* Isi */}
                      <div className={isLast ? "flex-1 pb-0" : "flex-1 pb-5"}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
                          >
                            {log.type_label}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                            <Clock size={10} />
                            {log.created_at}
                          </span>
                          <span className="text-[11px] text-gray-300">
                            {log.created_at_human}
                          </span>
                        </div>

                        <p className="text-[13px] text-gray-700 mt-1 leading-relaxed">
                          {log.description}
                        </p>

                        {hasDetail && (
                          <details className="mt-1.5 group/detail">
                            <summary className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 cursor-pointer select-none list-none inline-flex items-center gap-1">
                              <ChevronRight
                                size={11}
                                className="transition-transform group-open/detail:rotate-90"
                              />
                              Lihat detail
                            </summary>
                            <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50/70 p-3 grid sm:grid-cols-2 gap-x-5 gap-y-1">
                              {Object.entries(log.metadata).map(([k, v]) => (
                                <div key={k} className="flex gap-2 text-[11px]">
                                  <span className="font-semibold text-gray-500 shrink-0">
                                    {k}
                                  </span>
                                  <span className="font-mono text-gray-800 break-all">
                                    {typeof v === "object" && v !== null
                                      ? JSON.stringify(v)
                                      : String(v)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* FOOTER: jumlah + navigasi halaman */}
          {detailData?.meta && (
            <div className="px-6 py-3.5 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
              <p className="text-xs text-gray-500 font-medium">
                {detailData.meta.total === 0
                  ? "Tidak ada entri"
                  : `Menampilkan ${detailData.meta.from}-${detailData.meta.to} dari ${detailData.meta.total} entri`}
              </p>

              <div className="flex items-center gap-2">
                <select
                  value={detailLimit}
                  onChange={(e) => {
                    setDetailLimit(Number(e.target.value));
                    setDetailPage(1);
                  }}
                  className="h-8 rounded-lg border border-gray-200 bg-gray-50 text-xs font-semibold px-2"
                >
                  {LIMIT_LISTS.map((l) => (
                    <option key={l} value={l}>
                      {l} / halaman
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={detailPage === 1}
                  onClick={() => setDetailPage((prev) => prev - 1)}
                >
                  <ChevronLeft size={15} />
                </Button>
                <span className="text-xs font-bold text-gray-700 px-1 whitespace-nowrap">
                  {detailPage} / {detailData.meta.last_page || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={detailPage >= (detailData.meta.last_page || 1)}
                  onClick={() => setDetailPage((prev) => prev + 1)}
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default LoginLog;
