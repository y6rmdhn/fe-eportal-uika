import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  useGetRolePermissions,
  useSyncRolePermissions,
} from "@/hooks/RolePermissions/useRolePermissions";
import { useGetPermissions } from "@/hooks/Permissions/usePermissions";
import type { Permission, Role } from "@/types/general.type";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function DialogManagePermissions({
  open,
  onOpenChange,
  currentRole,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRole?: Role;
}) {
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  // Fetch all available permissions
  const { data: allPermissionsData, isLoading: isLoadingAll } =
    useGetPermissions();
  const allPermissions: Permission[] = allPermissionsData?.data || [];

  // Fetch currently assigned permissions for this role
  const { data: rolePermissionsData, isLoading: isLoadingAssigned } =
    useGetRolePermissions(open && currentRole ? currentRole.id : null);

  const { mutateSync, isPendingSync } = useSyncRolePermissions();

  // Pre-fill checkboxes when dialog opens / role changes
  useEffect(() => {
    if (rolePermissionsData?.data) {
      const ids = rolePermissionsData.data.map((p: Permission) => p.id);
      setCheckedIds(ids);
    } else {
      setCheckedIds([]);
    }
  }, [rolePermissionsData]);

  const togglePermission = (id: number) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!currentRole) return;
    mutateSync(
      { role_id: currentRole.id, permission_ids: checkedIds },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const isLoading = isLoadingAll || isLoadingAssigned;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Kelola Permissions —{" "}
            <span className="text-emerald-600 capitalize">
              {currentRole?.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2 pr-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin text-emerald-600" size={28} />
            </div>
          ) : allPermissions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Tidak ada permission tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allPermissions.map((perm) => {
                const checked = checkedIds.includes(perm.id);
                return (
                  <label
                    key={perm.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-gray-100 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePermission(perm.id)}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span
                      className={`text-sm font-semibold ${
                        checked ? "text-emerald-700" : "text-gray-700"
                      }`}
                    >
                      {perm.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-gray-100">
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSave}
            disabled={isPendingSync || isLoading}
          >
            {isPendingSync ? <Spinner /> : "Simpan Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
