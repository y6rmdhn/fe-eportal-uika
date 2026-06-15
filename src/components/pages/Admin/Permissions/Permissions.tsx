import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { useGetPermissions } from "@/hooks/Permissions/usePermissions";
import type { Permission } from "@/types/general.type";
import { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Trash, FolderOpen, Layers, Shield, Loader2 } from "lucide-react";
import DialogCreatePermission from "./Dialog/DialogCreatePermission";
import DialogUpdatePermission from "./Dialog/DialogUpdatePermission";
import DialogDeletePermission from "./Dialog/DialogDeletePermission";

interface GroupedPermissions {
  moduleName: string;
  moduleId: number | null;
  permissions: Permission[];
}

const Permissions = () => {
  const { data, isLoading } = useGetPermissions();
  const permissions: Permission[] = useMemo(() => data?.data || [], [data]);

  const [createOpen, setCreateOpen]       = useState(false);
  const [selectedIds, setSelectedIds]     = useState<number[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [selectedAction, setSelectedAction] = useState<{
    data: Permission;
    type: "update" | "delete";
  } | null>(null);

  // ── Grouping logic ──────────────────────────────────────────────────────────
  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: GroupedPermissions } = {};
    permissions.forEach((perm) => {
      const module = perm.app_module || perm.appModule;
      const moduleId = module?.id || null;
      const moduleName = module?.name || "Tanpa Modul";
      const key = moduleId ? `module-${moduleId}` : "no-module";
      if (!groups[key]) {
        groups[key] = {
          moduleName,
          moduleId,
          permissions: [],
        };
      }
      groups[key].permissions.push(perm);
    });
    return Object.values(groups).sort((a, b) => {
      if (a.moduleId === null) return 1;
      if (b.moduleId === null) return -1;
      return a.moduleName.localeCompare(b.moduleName);
    });
  }, [permissions]);

  // ── Checkbox helpers ────────────────────────────────────────────────────────
  const toggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isGroupAllChecked = (groupPermissions: Permission[]) => {
    return groupPermissions.length > 0 && groupPermissions.every((p) => selectedIds.includes(p.id));
  };

  const isGroupSomeChecked = (groupPermissions: Permission[]) => {
    const checkedCount = groupPermissions.filter((p) => selectedIds.includes(p.id)).length;
    return checkedCount > 0 && checkedCount < groupPermissions.length;
  };

  const toggleGroup = (groupPermissions: Permission[]) => {
    const groupIds = groupPermissions.map((p) => p.id);
    const allChecked = groupIds.every((id) => selectedIds.includes(id));
    if (allChecked) {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...groupIds])]);
    }
  };

  return (
    <AdminLayout desc="Manajemen Permissions">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Manajemen Permissions
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Kelola daftar permission yang dikelompokkan berdasarkan modul aplikasi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tombol Bulk Delete — muncul hanya saat ada item dicentang */}
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                className="h-11 rounded-xl shadow-sm font-bold px-5 transition-all flex items-center gap-2"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash className="h-4 w-4" strokeWidth={2.5} />
                Hapus ({selectedIds.length})
              </Button>
            )}

            <Button
              className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/20 font-bold px-5 transition-all"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-5 w-5 mr-1.5" strokeWidth={2.5} />
              Tambah Permission
            </Button>
          </div>
        </div>

        {/* ── INFO SELEKSI ── */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-xs font-bold">
              {selectedIds.length}
            </span>
            permission dipilih.
            {selectedIds.length < permissions.length && (
              <button
                className="ml-3 text-xs text-emerald-600 underline hover:text-emerald-800 transition-colors"
                onClick={() => setSelectedIds(permissions.map((p) => p.id))}
              >
                Pilih semua ({permissions.length})
              </button>
            )}
            <button
              className="ml-auto text-xs text-emerald-600 underline hover:text-emerald-800 transition-colors"
              onClick={() => setSelectedIds([])}
            >
              Batalkan seleksi
            </button>
          </div>
        )}

        {/* ── CONTENT (GROUPED TABLES) ── */}
        {isLoading ? (
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-emerald-600 h-10 w-10" />
              <span className="text-sm font-medium text-gray-500">
                Memuat data permissions...
              </span>
            </div>
          </div>
        ) : permissions.length === 0 ? (
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center p-16">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Belum Ada Permission</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              Silakan tambahkan permission baru dengan menekan tombol di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedPermissions.map((group) => (
              <div
                key={group.moduleId ?? "no-module"}
                className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden"
              >
                {/* Group Header */}
                <div className="bg-gray-50/70 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isGroupAllChecked(group.permissions)}
                      ref={(el: HTMLInputElement | null) => {
                        if (el) {
                          el.indeterminate = isGroupSomeChecked(group.permissions);
                        }
                      }}
                      onChange={() => toggleGroup(group.permissions)}
                      className="w-4 h-4 rounded border-gray-300 accent-emerald-600 cursor-pointer"
                    />
                    {group.moduleId ? (
                      <FolderOpen className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Layers className="h-5 w-5 text-gray-400" />
                    )}
                    <h2 className="text-base font-extrabold text-gray-905 tracking-tight uppercase">
                      {group.moduleName}
                    </h2>
                    <span className="inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-250/20">
                      {group.permissions.length} Item
                    </span>
                  </div>
                </div>

                {/* Group Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/30 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-6 w-16 text-center">Pilih</th>
                        <th className="py-3 px-6 w-20 text-center">No</th>
                        <th className="py-3 px-6">Nama Permission</th>
                        <th className="py-3 px-6 w-48">Guard Name</th>
                        <th className="py-3 px-6 w-32 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.permissions.map((perm, index) => {
                        const isChecked = selectedIds.includes(perm.id);
                        return (
                          <tr
                            key={perm.id}
                            className={`hover:bg-gray-50/30 transition-colors ${
                              isChecked ? "bg-emerald-50/5" : ""
                            }`}
                          >
                            <td className="py-3 px-6 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleOne(perm.id)}
                                className="w-4 h-4 rounded border-gray-300 accent-emerald-600 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-6 text-center font-medium text-gray-400 text-sm">
                              {index + 1}
                            </td>
                            <td className="py-3 px-6 font-semibold text-gray-800 text-sm">
                              {perm.name}
                            </td>
                            <td className="py-3 px-6">
                              <span className="inline-flex px-2.5 py-1 bg-gray-50 text-gray-600 font-mono text-xs rounded-md border border-gray-100">
                                {perm.guard_name}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                                  title="Edit"
                                  onClick={() => setSelectedAction({ data: perm, type: "update" })}
                                >
                                  <Edit2 size={14} strokeWidth={2.5} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors"
                                  title="Hapus"
                                  onClick={() => setSelectedAction({ data: perm, type: "delete" })}
                                >
                                  <Trash2 size={14} strokeWidth={2.5} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── DIALOGS ── */}
        <DialogCreatePermission open={createOpen} onOpenChange={setCreateOpen} />

        <DialogUpdatePermission
          open={selectedAction?.type === "update"}
          onOpenChange={(o) => !o && setSelectedAction(null)}
          currentData={selectedAction?.data}
        />

        {/* Single delete */}
        <DialogDeletePermission
          open={selectedAction?.type === "delete"}
          onOpenChange={(o) => !o && setSelectedAction(null)}
          currentData={selectedAction?.data}
        />

        {/* Bulk delete */}
        <DialogDeletePermission
          open={bulkDeleteOpen}
          onOpenChange={(o) => {
            setBulkDeleteOpen(o);
            if (!o) setSelectedIds([]);
          }}
          selectedIds={selectedIds}
        />
      </div>
    </AdminLayout>
  );
};

export default Permissions;
