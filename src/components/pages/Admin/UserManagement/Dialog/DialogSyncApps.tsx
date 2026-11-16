import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import admin from "@/services/api/admin";

type AppKey = "ucl" | "siakad" | "simpeg" | "cbt";
type Status = "exists" | "created" | "failed" | "skipped";

interface Target {
  key: AppKey;
  label: string;
  configured: boolean;
}
interface Row {
  user_id: string;
  email: string | null;
  nama: string | null;
  apps: Record<string, { status: Status; message?: string | null }>;
}
interface Result {
  summary: Record<string, Record<Status, number>>;
  results: Row[];
}

const STATUS_LABEL: Record<Status, { text: string; cls: string }> = {
  exists: { text: "Sudah ada", cls: "bg-gray-100 text-gray-600 border-gray-200" },
  created: { text: "Dibuat", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { text: "Gagal", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  skipped: { text: "Dilewati", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

interface Props {
  open: boolean;
  userIds: string[];
  onOpenChange: (open: boolean) => void;
  onDone?: () => void;
}

const DialogSyncApps = ({ open, userIds, onOpenChange, onDone }: Props) => {
  const [apps, setApps] = useState<AppKey[]>(["ucl", "siakad", "simpeg", "cbt"]);
  const [result, setResult] = useState<Result | null>(null);

  const { data: targets } = useQuery({
    queryKey: ["sync-app-targets"],
    queryFn: async () =>
      (await admin.getSyncAppTargets()).data?.data as Target[],
    enabled: open,
  });

  useEffect(() => {
    if (open) setResult(null);
  }, [open]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () =>
      (await admin.syncUsersToApps(userIds, apps)).data?.data as Result,
    onSuccess: (data) => {
      setResult(data);
      toast.success("Sinkronisasi selesai");
      onDone?.();
    },
    onError: () => toast.error("Sinkronisasi gagal. Coba lagi."),
  });

  const toggle = (k: AppKey, on: boolean) =>
    setApps((prev) => (on ? [...new Set([...prev, k])] : prev.filter((a) => a !== k)));

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw size={18} /> Sinkronkan {userIds.length} user ke aplikasi lain
          </DialogTitle>
        </DialogHeader>

        {!result && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Bila user sudah ada di aplikasi tujuan, akan diabaikan. Bila belum
              ada, akun dibuat otomatis (tanpa password; masuk lewat SSO
              E-Portal).
            </p>
            <div className="flex flex-col gap-2">
              {(targets ?? []).map((t) => (
                <label key={t.key} className="flex items-center gap-3 text-sm">
                  <Checkbox
                    checked={apps.includes(t.key) && t.configured}
                    disabled={!t.configured}
                    onCheckedChange={(v) => toggle(t.key, v === true)}
                  />
                  <span className="font-semibold">{t.label}</span>
                  {!t.configured && (
                    <span className="text-xs text-amber-600">
                      belum dikonfigurasi di server
                    </span>
                  )}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Batal
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isPending || apps.length === 0 || userIds.length === 0}
                onClick={() => mutate()}
              >
                {isPending ? <Spinner /> : "Mulai sinkronisasi"}
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3 text-xs">
              {Object.entries(result.summary).map(([app, s]) => (
                <div key={app} className="rounded-lg border border-gray-200 px-3 py-2">
                  <p className="font-bold uppercase">{app}</p>
                  <p className="text-gray-600">
                    dibuat {s.created} · sudah ada {s.exists} · gagal {s.failed}
                    {s.skipped ? ` · dilewati ${s.skipped}` : ""}
                  </p>
                </div>
              ))}
            </div>
            <div className="max-h-[320px] overflow-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">User</th>
                    {Object.keys(result.summary).map((a) => (
                      <th key={a} className="px-3 py-2 text-left">{a}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r) => (
                    <tr key={r.user_id} className="border-t border-gray-100">
                      <td className="px-3 py-2">
                        <p className="font-semibold">{r.nama || r.email}</p>
                        {r.nama && <p className="text-gray-400">{r.email}</p>}
                      </td>
                      {Object.keys(result.summary).map((a) => {
                        const c = r.apps[a];
                        const st = STATUS_LABEL[c?.status ?? "failed"];
                        return (
                          <td key={a} className="px-3 py-2 align-top">
                            <span className={`inline-flex rounded-full border px-2 py-0.5 font-bold ${st.cls}`}>
                              {st.text}
                            </span>
                            {c?.message && (
                              <p className="mt-1 text-[11px] text-gray-500">{c.message}</p>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Tutup</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogSyncApps;
