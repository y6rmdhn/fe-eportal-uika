import DataTable from "@/common/DataTable";
import AdminLayout from "@/components/layouts/AdminLayout";
import { HEADER_TABLE_LOGIN_LOG } from "@/constants/AdminConstant";
import useDataTable from "@/hooks/Table/useDataTable";
import useLoginLog from "@/hooks/LoginLog/useLoginLog";
import useSuspiciousIps from "@/hooks/LoginLog/useSuspiciousIps";
import { useMemo, useState } from "react";
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
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DialogActivityLog from "../UserManagement/Dialog/DialogActivityLog";
import type { UserData } from "@/types/general.type";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  success: {
    label: "Berhasil",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  failed: {
    label: "Gagal",
    className: "bg-rose-50 text-rose-700 border border-rose-100",
  },
};

const DEVICE_ICON: Record<string, React.ReactNode> = {
  mobile: <Smartphone size={14} />,
  tablet: <Tablet size={14} />,
  desktop: <Monitor size={14} />,
};

const LoginLog = () => {
  const [currentDevice, setCurrentDevice] = useState("");

  const [selectedUser, setSelectedUser] = useState<UserData | undefined>(
    undefined,
  );
  const [openActivity, setOpenActivity] = useState(false);

  const {
    currentLimit,
    currentPage,
    handleChangeLimit,
    handleChangePage,
    currentFilter,
    handleChangeFilter,
  } = useDataTable();

  const { dataLoginLog, isLoadingLoginLog, dataStats } = useLoginLog({
    currentLimit,
    currentPage,
    currentFilter,
    currentDevice,
  });

  const { dataSuspiciousIps } = useSuspiciousIps();

  const stats = useMemo(
    () => ({
      total: dataStats?.total || 0,
      success: dataStats?.success || 0,
      failed: dataStats?.failed || 0,
      suspicious: dataSuspiciousIps?.data?.length || 0,
    }),
    [dataStats, dataSuspiciousIps],
  );

  const filteredData = useMemo(() => {
    return (dataLoginLog?.data || []).map((log: any, index: number) => {
      const badge = STATUS_BADGE[log.status] ?? {
        label: log.status,
        className: "bg-gray-50 text-gray-600 border border-gray-100",
      };

      return [
        <span key={`no-${index}`} className="font-medium text-gray-500">
          {currentLimit * (currentPage - 1) + index + 1}
        </span>,

        <div key={`user-${index}`} className="flex flex-col py-1">
          <p className="font-bold text-[14px] text-gray-900 leading-tight">
            {log.user?.name ?? "Guest"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {log.user?.email ?? "-"}
          </p>
        </div>,

        <span key={`ip-${index}`} className="font-mono text-xs text-gray-600">
          {log.ip_address}
        </span>,

        <span key={`browser-${index}`} className="text-sm text-gray-600">
          {log.browser} {log.browser_version}
        </span>,

        <span key={`platform-${index}`} className="text-sm text-gray-600">
          {log.platform}
        </span>,

        <span
          key={`device-${index}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 capitalize"
        >
          {DEVICE_ICON[log.device_type] ?? <Monitor size={14} />}
          {log.device_type}
        </span>,

        <span
          key={`status-${index}`}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${badge.className}`}
        >
          {badge.label}
        </span>,

        <div key={`time-${index}`} className="flex flex-col">
          <span className="text-sm text-gray-700">
            {new Date(log.created_at).toLocaleDateString("id-ID")}
          </span>
          <span className="text-xs text-gray-400">{log.created_at_human}</span>
        </div>,
        <div key={`action-${index}`}>
          {log.user ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-lg"
              title="Riwayat Aktivitas"
              onClick={() => {
                setSelectedUser(log.user);
                setOpenActivity(true);
              }}
            >
              <History size={16} strokeWidth={2.5} />
            </Button>
          ) : (
            <span className="text-xs text-gray-300">-</span>
          )}
        </div>,
      ];
    });
  }, [dataLoginLog, currentLimit, currentPage]);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
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
              onValueChange={(v) => handleChangeFilter(v === "all" ? "" : v)}
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
              onValueChange={(v) => setCurrentDevice(v === "all" ? "" : v)}
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

        {/* Stats Cards */}
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
              className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 flex items-center gap-4"
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
          <div className="bg-white rounded-[1.5rem] border border-rose-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-rose-500" />
              <h2 className="font-bold text-gray-900">IP Mencurigakan</h2>
              <span className="ml-auto text-xs text-gray-400">
                Refresh tiap 30 detik
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

        {/* Tabel */}
        <div className="bg-white p-2 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <DataTable
            header={HEADER_TABLE_LOGIN_LOG}
            data={filteredData}
            isLoading={isLoadingLoginLog}
            totalPages={dataLoginLog?.meta?.last_page || 1}
            currentPage={currentPage}
            currentLimit={currentLimit}
            onChangePage={handleChangePage}
            onChangeLimit={handleChangeLimit}
          />

          <DialogActivityLog
            open={openActivity}
            currentData={selectedUser}
            handleChangeAction={(open) => {
              setOpenActivity(open);
              if (!open) setSelectedUser(undefined);
            }}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default LoginLog;
