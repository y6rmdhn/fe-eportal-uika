import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useBulkUpdatePermission } from "@/hooks/Permissions/usePermissions";
import { useGetAppModules } from "@/hooks/AppModules/useAppModules";
import type { AppModule, Permission } from "@/types/general.type";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Layers, AlertTriangle } from "lucide-react";
import { parseName, buildName, normalizePrefix } from "../permissionName";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Dialog Edit Massal Permission.
 *
 * Mengubah banyak permission sekaligus lewat dua operasi yang berdiri
 * sendiri dan bisa dipakai bersamaan:
 *   1. Memindahkan semuanya ke App Module lain.
 *   2. Mengganti prefix, sementara action tiap permission dipertahankan
 *      (users.create + users.delete  →  pengguna.create + pengguna.delete).
 *
 * Action sengaja TIDAK bisa diubah massal: mengubah action berarti
 * mengubah arti tiap permission satu per satu, dan itu sudah ditangani
 * dialog edit satuan.
 */
export default function DialogBulkEditPermission({
  open,
  onOpenChange,
  selectedPermissions,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPermissions: Permission[];
  onDone?: () => void;
}) {
  const [changeModule, setChangeModule] = useState(false);
  const [appModuleId, setAppModuleId] = useState<number | "">("");
  const [changePrefix, setChangePrefix] = useState(false);
  const [prefix, setPrefix] = useState("");

  const { mutateBulkUpdate, isPendingBulkUpdate } = useBulkUpdatePermission();
  const { data: modulesData, isLoading: isLoadingModules } = useGetAppModules();
  const appModules: AppModule[] = modulesData?.data || [];

  // Reset form tiap kali dialog dibuka agar tidak membawa sisa isian lama
  useEffect(() => {
    if (!open) return;
    setChangeModule(false);
    setChangePrefix(false);
    setAppModuleId("");

    // Kalau semua yang dipilih punya prefix sama, jadikan nilai awal —
    // ini kasus paling umum (memilih satu grup lalu mengganti namanya).
    const prefixes = new Set(
      selectedPermissions.map((p) => parseName(p.name).prefix),
    );
    setPrefix(prefixes.size === 1 ? [...prefixes][0] : "");
  }, [open, selectedPermissions]);

  const distinctPrefixes = useMemo(
    () => [...new Set(selectedPermissions.map((p) => parseName(p.name).prefix))],
    [selectedPermissions],
  );

  // Hitung hasil akhir tiap permission
  const preview = useMemo(() => {
    return selectedPermissions.map((p) => {
      const { prefix: oldPrefix, action } = parseName(p.name);
      const nextName = changePrefix && prefix.trim() !== ""
        ? buildName(prefix, action)
        : p.name;
      const nextModule = changeModule && appModuleId !== ""
        ? (appModuleId as number)
        : (p.appModule_id ?? null);

      return {
        id: p.id,
        oldName: p.name,
        newName: nextName,
        oldPrefix,
        action,
        nextModule,
        nameChanged: nextName !== p.name,
        moduleChanged: nextModule !== (p.appModule_id ?? null),
      };
    });
  }, [selectedPermissions, changePrefix, prefix, changeModule, appModuleId]);

  // Nama hasil yang bentrok satu sama lain di dalam batch ini
  const duplicates = useMemo(() => {
    const seen = new Map<string, number>();
    preview.forEach((r) => seen.set(r.newName, (seen.get(r.newName) ?? 0) + 1));
    return new Set(
      [...seen.entries()].filter(([, n]) => n > 1).map(([name]) => name),
    );
  }, [preview]);

  const changedCount = preview.filter(
    (r) => r.nameChanged || r.moduleChanged,
  ).length;

  const prefixInvalid = changePrefix && normalizePrefix(prefix) === "";
  const moduleInvalid = changeModule && appModuleId === "";
  const canSubmit =
    changedCount > 0 &&
    duplicates.size === 0 &&
    !prefixInvalid &&
    !moduleInvalid &&
    !isPendingBulkUpdate;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const payload = preview
      .filter((r) => r.nameChanged || r.moduleChanged)
      .map((r) => ({
        id: r.id,
        name: r.newName,
        ...(r.nextModule !== null ? { appModule_id: r.nextModule } : {}),
      }));

    mutateBulkUpdate(
      { permissions: payload },
      {
        onSuccess: () => {
          onOpenChange(false);
          onDone?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[88vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers size={16} className="text-emerald-600" />
            Edit {selectedPermissions.length} Permission Sekaligus
          </DialogTitle>
          <DialogDescription className="text-xs">
            Pilih perubahan yang ingin diterapkan ke semua permission terpilih.
            Aksi tiap permission ({distinctPrefixes.length > 0 && "view, create, …"})
            tetap dipertahankan.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1 overflow-y-auto flex-1">
          {/* ── Operasi 1: pindah modul ── */}
          <div className="rounded-xl border border-gray-200 p-4">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={changeModule}
                onChange={(e) => setChangeModule(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-emerald-600 cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-800">
                Pindahkan ke App Module lain
              </span>
            </label>

            {changeModule && (
              <div className="mt-3">
                <select
                  value={appModuleId}
                  onChange={(e) =>
                    setAppModuleId(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  disabled={isLoadingModules}
                  className={SELECT_CLASS}
                >
                  <option value="">
                    {isLoadingModules ? "Memuat modul..." : "-- Pilih modul tujuan --"}
                  </option>
                  {appModules.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.name}
                    </option>
                  ))}
                </select>
                {moduleInvalid && (
                  <p className="text-[11px] text-rose-600 mt-1.5">
                    Pilih modul tujuan terlebih dahulu.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Operasi 2: ganti prefix ── */}
          <div className="rounded-xl border border-gray-200 p-4">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={changePrefix}
                onChange={(e) => setChangePrefix(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-emerald-600 cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-800">
                Ganti prefix resource
              </span>
            </label>

            {changePrefix && (
              <div className="mt-3 grid gap-1.5">
                <Label htmlFor="bulk-prefix" className="text-xs text-gray-500">
                  Prefix baru
                </Label>
                <Input
                  id="bulk-prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(normalizePrefix(e.target.value))}
                  placeholder="contoh: pengguna"
                />
                {distinctPrefixes.length > 1 && (
                  <p className="text-[11px] text-amber-600 flex items-start gap-1.5 mt-0.5">
                    <AlertTriangle size={12} className="mt-px shrink-0" />
                    Terpilih {distinctPrefixes.length} prefix berbeda (
                    {distinctPrefixes.join(", ")}). Semuanya akan disatukan
                    menjadi prefix baru di atas.
                  </p>
                )}
                {prefixInvalid && (
                  <p className="text-[11px] text-rose-600">
                    Prefix tidak boleh kosong.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Pratinjau ── */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-500">
                Pratinjau perubahan
              </Label>
              <span className="text-[11px] font-semibold text-gray-400">
                {changedCount} dari {selectedPermissions.length} berubah
              </span>
            </div>

            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 max-h-[230px] overflow-y-auto divide-y divide-gray-200/70">
              {preview.map((r) => {
                const isDup = duplicates.has(r.newName);
                const changed = r.nameChanged || r.moduleChanged;
                return (
                  <div
                    key={r.id}
                    className={`flex items-center gap-2 px-3 py-2 text-xs ${
                      isDup ? "bg-rose-50" : ""
                    }`}
                  >
                    <span
                      className={`font-mono ${
                        r.nameChanged
                          ? "text-gray-400 line-through"
                          : "text-gray-600"
                      }`}
                    >
                      {r.oldName}
                    </span>

                    {r.nameChanged && (
                      <>
                        <ArrowRight size={11} className="text-gray-400 shrink-0" />
                        <span
                          className={`font-mono font-semibold ${
                            isDup ? "text-rose-700" : "text-emerald-700"
                          }`}
                        >
                          {r.newName}
                        </span>
                      </>
                    )}

                    <span className="ml-auto flex items-center gap-1.5 shrink-0">
                      {r.moduleChanged && (
                        <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                          pindah modul
                        </span>
                      )}
                      {!changed && (
                        <span className="text-[10px] text-gray-300 font-semibold">
                          tidak berubah
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {duplicates.size > 0 && (
              <p className="text-[11px] text-rose-600 flex items-start gap-1.5">
                <AlertTriangle size={12} className="mt-px shrink-0" />
                Ada {duplicates.size} nama yang bentrok setelah perubahan.
                Permission dengan nama sama tidak diizinkan — sesuaikan dulu
                pilihanmu.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isPendingBulkUpdate ? (
              <Spinner />
            ) : (
              `Simpan ${changedCount} Perubahan`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
