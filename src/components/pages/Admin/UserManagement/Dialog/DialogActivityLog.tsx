import { useQuery } from "@tanstack/react-query";
import admin from "@/services/api/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  LogIn,
  LogOut,
  User,
  KeyRound,
  RefreshCw,
  Globe,
} from "lucide-react";

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  login: {
    label: "Login",
    icon: <LogIn size={14} />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  logout: {
    label: "Logout",
    icon: <LogOut size={14} />,
    color: "bg-gray-50 text-gray-600 border-gray-100",
  },
  update_profile: {
    label: "Update Profile",
    icon: <User size={14} />,
    color: "bg-blue-50 text-blue-700 border-blue-100",
  },
  change_password: {
    label: "Ganti Password",
    icon: <KeyRound size={14} />,
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
  reset_password: {
    label: "Reset Password",
    icon: <RefreshCw size={14} />,
    color: "bg-rose-50 text-rose-700 border-rose-100",
  },
  app_access: {
    label: "Akses Aplikasi",
    icon: <Globe size={14} />,
    color: "bg-purple-50 text-purple-700 border-purple-100",
  },
};

export default function DialogActivityLog({
  open,
  currentData,
  handleChangeAction,
}: {
  open: boolean;
  currentData?: {
    public_id: string;
    name?: string;
    email?: string;
  };
  handleChangeAction: (open: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["activity-log", currentData?.public_id],
    queryFn: async () => {
      const response = await admin.getActivityLogs(currentData!.public_id);
      return response.data;
    },
    enabled: open && !!currentData?.public_id,
  });

  const logs = data?.data || [];

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Riwayat Aktivitas</DialogTitle>
          <DialogDescription>
            Log aktivitas untuk{" "}
            <span className="font-semibold text-gray-900">
              {currentData?.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-emerald-600" size={28} />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="font-medium">Belum ada aktivitas terekam.</p>
            </div>
          ) : (
            logs.map((log: any) => {
              const config = TYPE_CONFIG[log.type] ?? {
                label: log.type,
                icon: null,
                color: "bg-gray-50 text-gray-600 border-gray-100",
              };
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100"
                >
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap mt-0.5 ${config.color}`}
                  >
                    {config.icon}
                    {config.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {log.description}
                    </p>
                    {log.actor && log.actor.name !== currentData?.name && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        oleh{" "}
                        <span className="font-semibold">{log.actor.name}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {log.created_at_human}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
