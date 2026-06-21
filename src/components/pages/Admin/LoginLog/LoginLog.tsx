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
import {
  Shield,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DataTable from "@/common/DataTable";

const DEVICE_ICON: Record<string, React.ReactNode> = {
  mobile: <Smartphone size={13} />,
  tablet: <Tablet size={13} />,
  desktop: <Monitor size={13} />,
};

const LoginLog = () => {
  const [currentDevice, setCurrentDevice] = useState("");
  const [currentFilter, setCurrentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit] = useState(20);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [detailPage, setDetailPage] = useState(1);
  const [detailLimit, setDetailLimit] = useState(8);

  const { dataSuspiciousIps } = useSuspiciousIps();

  // Fetch grouped logs
  const { data: groupedData, isLoading } = useQuery({
    queryKey: [
      "login-log-grouped",
      currentPage,
      currentLimit,
      currentFilter,
      currentDevice,
    ],
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

  // Fetch stats
  const { data: dataStats } = useQuery({
    queryKey: ["login-log-stats"],
    queryFn: async () => {
      const res = await admin.getLoginStats();
      return res.data.data;
    },
  });

  // Fetch detail logs untuk dialog
  const { data: detailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: [
      "activity-log-detail",
      selectedGroup?.user_id,
      detailPage,
      detailLimit,
    ],
    queryFn: async () => {
      const res = await admin.getActivityLogs(selectedGroup?.user_id, {
        per_page: detailLimit,
        page: detailPage,
      });
      return res.data;
    },
    enabled: !!selectedGroup,
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

  const logs = groupedData?.data || [];
  const meta = groupedData?.meta;

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Login Log
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-0.5">
                Monitor aktivitas login pengguna
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select
              value={currentFilter || "all"}
              onValueChange={(v) => {
                setCurrentFilter(v === "all" ? "" : v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] h-11 rounded-xl border-gray-200 bg-gray-50">
                <SelectValue placeholder="Filter status" />
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
              <SelectTrigger className="w-[160px] h-11 rounded-xl border-gray-200 bg-gray-50">
                <SelectValue placeholder="Filter device" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua device</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Login",
              value: stats.total,
              icon: <Activity size={18} className="text-blue-500" />,
              bg: "bg-blue-50",
            },
            {
              label: "Berhasil",
              value: stats.success,
              icon: <CheckCircle2 size={18} className="text-emerald-500" />,
              bg: "bg-emerald-50",
            },
            {
              label: "Gagal",
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

        {/* Suspicious IPs */}
        {(dataSuspiciousIps?.data?.length ?? 0) > 0 && (
          <div className="bg-white rounded-[1.5rem] border border-rose-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-rose-500" />
              <h2 className="font-bold text-gray-900">IP Mencurigakan</h2>
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

        {/* Tabel Grouped */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    No
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Berhasil
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Gagal
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Device Info
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-16 text-center text-gray-400 font-medium"
                    >
                      Belum ada data log.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any, index: number) => (
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
                          {DEVICE_ICON[log.device_type] ?? (
                            <Monitor size={13} />
                          )}
                          <span>
                            {log.browser} • {log.platform} •{" "}
                            <span className="capitalize">
                              {log.device_type}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Lihat Detail"
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

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 font-medium">
                Menampilkan {meta.from}–{meta.to} dari {meta.total} data
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
                  {currentPage} / {meta.last_page}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={currentPage === meta.last_page}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Detail */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="!max-w-6xl w-[95vw] max-h-[85vh] rounded-2xl flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-gray-900">
              Detail Login — {selectedGroup?.email} (
              {selectedGroup?.date &&
                new Date(selectedGroup.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              )
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
              data={(detailData?.data || []).map((log: any) => [
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {log.created_at_human}
                </span>,
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold
        ${
          log.type_color === "emerald"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : log.type_color === "blue"
              ? "bg-blue-50 text-blue-700 border border-blue-100"
              : log.type_color === "amber"
                ? "bg-amber-50 text-amber-700 border border-amber-100"
                : log.type_color === "rose"
                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                  : log.type_color === "purple"
                    ? "bg-purple-50 text-purple-700 border border-purple-100"
                    : "bg-gray-50 text-gray-700 border border-gray-100"
        }`}
                >
                  {log.type_label}
                </span>,
                <span className="text-sm text-gray-700">
                  {log.description}
                </span>,
              ])}
            />
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default LoginLog;
