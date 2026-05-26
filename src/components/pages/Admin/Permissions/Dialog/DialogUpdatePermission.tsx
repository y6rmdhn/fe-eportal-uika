import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useBulkUpdatePermission } from "@/hooks/Permissions/usePermissions";
import { useGetAppModules } from "@/hooks/AppModules/useAppModules";
import type { AppModule, Permission } from "@/types/general.type";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

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
 * Dialog Update Permission — mode Bulk.
 *
 * Dua mode penggunaan:
 * 1. Edit satu permission (currentData) → prefix & aksi lama di-pre-fill.
 * 2. Edit sekelompok permission sekaligus (currentGroup) → prefix dari item pertama.
 *
 * Kedua mode mendukung custom action di luar daftar preset.
 */
export default function DialogUpdatePermission({
  open,
  onOpenChange,
  currentData,
  currentGroup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentData?: Permission;
  currentGroup?: Permission[];
}) {
  const [prefix, setPrefix]            = useState("");
  const [selectedActions, setSelected] = useState<string[]>([]);
  const [appModuleId, setAppModuleId]  = useState<number | "">("");
  const [customInput, setCustomInput]  = useState("");
  const customInputRef                 = useRef<HTMLInputElement>(null);

  const { mutateBulkUpdate, isPendingBulkUpdate } = useBulkUpdatePermission();
  const { data: modulesData, isLoading: isLoadingModules } = useGetAppModules();
  const appModules: AppModule[] = modulesData?.data || [];

  // Pre-fill saat currentData / currentGroup berubah
  useEffect(() => {
    if (currentData) {
      const { prefix: p, action: a } = parseName(currentData.name);
      setPrefix(p);
      setSelected(a ? [a] : []);
      setAppModuleId(currentData.appModule_id ?? "");
    } else if (currentGroup && currentGroup.length > 0) {
      const { prefix: p } = parseName(currentGroup[0].name);
      setPrefix(p);
      const actions = currentGroup
        .map((perm) => parseName(perm.name).action)
        .filter(Boolean);
      setSelected(actions);
      setAppModuleId(currentGroup[0].appModule_id ?? "");
    }
    setCustomInput("");
  }, [currentData, currentGroup]);

  const toggleAction = (val: string) => {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  // Tambah custom action dari input
  const addCustomAction = () => {
    const val = customInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (!val) return;
    if (!selectedActions.includes(val)) {
      setSelected((prev) => [...prev, val]);
    }
    setCustomInput("");
    customInputRef.current?.focus();
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomAction();
    }
  };

  // Preview nama-nama permission yang akan dikirim
  const previews = useMemo(() => {
    const base = prefix.trim();
    if (!base || selectedActions.length === 0) return [];
    return selectedActions.map((a) => `${base}.${a}`);
  }, [prefix, selectedActions]);

  const isValid = prefix.trim() !== "" && selectedActions.length > 0 && appModuleId !== "";

  const handleSubmit = () => {
    if (!isValid) return;
    const base = prefix.trim().toLowerCase().replace(/\s+/g, "-");

    if (currentData) {
      // ── Single-edit: kirim 1 item (action pertama yang dipilih) ──
      mutateBulkUpdate(
        {
          permissions: [
            {
              id: currentData.id,
              name: `${base}.${selectedActions[0]}`,
              appModule_id: appModuleId as number,
            },
          ],
        },
        { onSuccess: () => onOpenChange(false) }
      );
    } else if (currentGroup && currentGroup.length > 0) {
      // ── Group-edit: cocokkan action lama → baru ──
      const oldActions = currentGroup.map((perm) => ({
        ...perm,
        parsedAction: parseName(perm.name).action,
      }));

      const permissionsPayload = selectedActions
        .map((action) => {
          const match = oldActions.find((p) => p.parsedAction === action);
          if (match) {
            return {
              id: match.id,
              name: `${base}.${action}`,
              appModule_id: appModuleId as number,
            };
          }
          return null;
        })
        .filter(Boolean) as { id: number; name: string; appModule_id: number }[];

      if (permissionsPayload.length === 0) return;
      mutateBulkUpdate(
        { permissions: permissionsPayload },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const title = currentGroup
    ? `Edit Group Permission (${currentGroup.length} item)`
    : "Edit Permission";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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

          {/* Pilih Aksi */}
          <div className="grid gap-2">
            <Label>
              Aksi Permission
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                (pilih preset atau tambah custom)
              </span>
            </Label>

            {/* Chip preset */}
            <div className="flex flex-wrap gap-2">
              {PERMISSION_ACTIONS.map((act) => {
                const active = selectedActions.includes(act.value);
                return (
                  <button
                    key={act.value}
                    type="button"
                    onClick={() => toggleAction(act.value)}
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

            {/* Input custom action */}
            <div className="flex gap-2 mt-1">
              <Input
                ref={customInputRef}
                id="update-perm-custom-action"
                placeholder="Aksi custom, contoh: approve"
                value={customInput}
                onChange={(e) =>
                  setCustomInput(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))
                }
                onKeyDown={handleCustomKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addCustomAction}
                disabled={!customInput.trim()}
                className="shrink-0 border-dashed hover:border-solid hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all"
                title="Tambah aksi custom"
              >
                <Plus size={16} strokeWidth={2.5} />
              </Button>
            </div>

            {/* Chip custom yang sudah dipilih */}
            {selectedActions.some((a) => !PRESET_VALUES.has(a)) && (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {selectedActions
                  .filter((a) => !PRESET_VALUES.has(a))
                  .map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => toggleAction(a)}
                        className="ml-0.5 hover:text-purple-900 transition-colors"
                        title={`Hapus aksi "${a}"`}
                      >
                        <X size={11} strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {previews.length > 0 && (
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-500">Preview permission yang akan disimpan:</Label>
              <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                {previews.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-1 bg-white text-gray-700 border border-gray-200 rounded-md text-xs font-mono shadow-sm"
                  >
                    {p}
                  </span>
                ))}
              </div>
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
            disabled={isPendingBulkUpdate || !isValid}
          >
            {isPendingBulkUpdate ? <Spinner /> : `Simpan (${selectedActions.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
