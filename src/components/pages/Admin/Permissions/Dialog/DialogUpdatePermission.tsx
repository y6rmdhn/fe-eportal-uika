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
import { useUpdatePermission } from "@/hooks/Permissions/usePermissions";
import { useGetAppModules } from "@/hooks/AppModules/useAppModules";
import type { AppModule, Permission } from "@/types/general.type";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Pencil } from "lucide-react";

// Daftar aksi standar (harus sinkron dengan dialog create)
const PERMISSION_ACTIONS = [
  { value: "view",   label: "View",   color: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "create", label: "Create", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "edit",   label: "Edit",   color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "delete", label: "Delete", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "export", label: "Export", color: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "import", label: "Import", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "manage", label: "Manage", color: "bg-orange-50 text-orange-700 border-orange-200" },
];

const PRESET_VALUES = new Set(PERMISSION_ACTIONS.map((a) => a.value));

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Parse nama permission menjadi { prefix, action }.
 * Contoh: "users.create" → { prefix: "users", action: "create" }
 * Contoh: "users.approve" → { prefix: "users", action: "approve" }  ← custom action tetap terbaca
 * Jika tidak ada titik, seluruhnya jadi prefix (action kosong).
 */
function parseName(name: string): { prefix: string; action: string } {
  const dotIdx = name.lastIndexOf(".");
  if (dotIdx === -1) return { prefix: name, action: "" };
  return {
    prefix: name.slice(0, dotIdx),
    action: name.slice(dotIdx + 1),
  };
}

/**
 * Dialog Edit Permission — selalu untuk SATU permission.
 *
 * Berbeda dengan dialog Tambah yang membuat banyak permission sekaligus,
 * dialog ini mengubah satu baris yang dipilih dari tabel: aksinya
 * single-select, dan perubahannya ditampilkan sebagai "sebelum → sesudah".
 */
export default function DialogUpdatePermission({
  open,
  onOpenChange,
  currentData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentData?: Permission;
}) {
  const [prefix, setPrefix]           = useState("");
  const [action, setAction]           = useState("");
  const [appModuleId, setAppModuleId] = useState<number | "">("");

  const { mutateUpdate, isPendingUpdate } = useUpdatePermission();
  const { data: modulesData, isLoading: isLoadingModules } = useGetAppModules();
  const appModules: AppModule[] = modulesData?.data || [];

  // Pre-fill dari permission yang sedang diedit
  useEffect(() => {
    if (!currentData) return;
    const { prefix: p, action: a } = parseName(currentData.name);
    setPrefix(p);
    setAction(a);
    setAppModuleId(currentData.appModule_id ?? "");
  }, [currentData]);

  const isCustomAction = action !== "" && !PRESET_VALUES.has(action);

  // Nama hasil perubahan
  const nextName = useMemo(() => {
    const base = prefix.trim().toLowerCase().replace(/\s+/g, "-");
    if (!base || !action) return "";
    return `${base}.${action}`;
  }, [prefix, action]);

  const isValid = prefix.trim() !== "" && action !== "" && appModuleId !== "";

  // Tidak ada yang berubah → tombol simpan dimatikan
  const isDirty =
    !!currentData &&
    (nextName !== currentData.name ||
      appModuleId !== (currentData.appModule_id ?? ""));

  const handleSubmit = () => {
    if (!isValid || !isDirty || !currentData) return;
    mutateUpdate(
      {
        id: currentData.id,
        payload: {
          name: nextName,
          appModule_id: appModuleId as number,
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil size={16} className="text-blue-600" />
            Edit Permission
          </DialogTitle>
          <DialogDescription className="text-xs">
            Mengubah satu permission:{" "}
            <span className="font-mono font-semibold text-gray-700">
              {currentData?.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* App Module */}
          <div className="grid gap-1.5">
            <Label htmlFor="update-perm-module">App Module</Label>
            <select
              id="update-perm-module"
              value={appModuleId}
              onChange={(e) =>
                setAppModuleId(e.target.value === "" ? "" : Number(e.target.value))
              }
              disabled={isLoadingModules}
              className={SELECT_CLASS}
            >
              <option value="">
                {isLoadingModules ? "Memuat modul..." : "-- Pilih App Module --"}
              </option>
              {appModules.map((mod) => (
                <option key={mod.id} value={mod.id}>
                  {mod.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prefix / Resource */}
          <div className="grid gap-1.5">
            <Label htmlFor="update-perm-prefix">
              Prefix Resource
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                (huruf kecil, contoh: users)
              </span>
            </Label>
            <Input
              id="update-perm-prefix"
              value={prefix}
              onChange={(e) =>
                setPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9-_.]/g, ""))
              }
            />
          </div>

          {/* Aksi — single select */}
          <div className="grid gap-2">
            <Label>
              Aksi Permission
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                (pilih satu)
              </span>
            </Label>

            <div className="flex flex-wrap gap-2">
              {PERMISSION_ACTIONS.map((act) => {
                const active = action === act.value;
                return (
                  <button
                    key={act.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setAction(act.value)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all select-none
                      ${active
                        ? act.color + " ring-2 ring-offset-1 ring-current/40 shadow-sm scale-105"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    {act.label}
                  </button>
                );
              })}
            </div>

            {/* Aksi custom — mengganti pilihan, bukan menambah */}
            <div className="grid gap-1.5 mt-1">
              <Label
                htmlFor="update-perm-custom-action"
                className="text-xs font-normal text-gray-400"
              >
                Atau tulis aksi custom
              </Label>
              <Input
                id="update-perm-custom-action"
                placeholder="contoh: approve"
                value={isCustomAction ? action : ""}
                onChange={(e) =>
                  setAction(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))
                }
                className={isCustomAction ? "border-purple-300 bg-purple-50/40" : ""}
              />
            </div>
          </div>

          {/* Preview sebelum → sesudah */}
          {currentData && (
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-500">Perubahan nama:</Label>
              <div className="flex items-center gap-2 flex-wrap p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <span className="px-2 py-1 bg-white text-gray-400 border border-gray-200 rounded-md text-xs font-mono line-through">
                  {currentData.name}
                </span>
                <ArrowRight size={13} className="text-gray-400 shrink-0" />
                <span
                  className={`px-2 py-1 rounded-md text-xs font-mono border shadow-sm ${
                    nextName
                      ? "bg-white text-emerald-700 border-emerald-200 font-semibold"
                      : "bg-white text-gray-300 border-gray-200"
                  }`}
                >
                  {nextName || "belum lengkap"}
                </span>
              </div>
              {!isDirty && isValid && (
                <p className="text-[11px] text-gray-400">
                  Belum ada perubahan.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
            disabled={isPendingUpdate || !isValid || !isDirty}
          >
            {isPendingUpdate ? <Spinner /> : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
