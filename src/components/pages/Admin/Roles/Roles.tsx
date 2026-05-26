import DataTable from "@/common/DataTable";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { HEADER_TABLE_ROLE } from "@/constants/AdminConstant";
import { useGetRoles } from "@/hooks/Roles/useRoles";
import type { Role } from "@/types/general.type";
import { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, KeyRound } from "lucide-react";
import DialogCreateRole from "./Dialog/DialogCreateRole";
import DialogUpdateRole from "./Dialog/DialogUpdateRole";
import DialogDeleteRole from "./Dialog/DialogDeleteRole";
import DialogManagePermissions from "./Dialog/DialogManagePermissions";

type ActionType = "update" | "delete" | "permissions";

const Roles = () => {
  const { data, isLoading } = useGetRoles();
  const roles: Role[] = data?.data || [];

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{
    data: Role;
    type: ActionType;
  } | null>(null);

  const tableData = useMemo(
    () =>
      roles.map((role, index) => [
        <span key={`no-${index}`} className="font-medium text-gray-500">
          {index + 1}
        </span>,
        <span key={`name-${index}`} className="font-semibold text-gray-800 capitalize">
          {role.name}
        </span>,
        <span
          key={`guard-${index}`}
          className="inline-flex px-2.5 py-1 bg-gray-50 text-gray-600 font-mono text-xs rounded-md border border-gray-100"
        >
          {role.guard_name}
        </span>,
        <div key={`action-${index}`} className="flex items-center gap-2">
          {/* <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-violet-600 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition-colors"
            title="Kelola Permissions"
            onClick={() => setSelectedAction({ data: role, type: "permissions" })}
          >
            <KeyRound size={16} strokeWidth={2.5} />
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
            title="Edit"
            onClick={() => setSelectedAction({ data: role, type: "update" })}
          >
            <Edit2 size={16} strokeWidth={2.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors"
            title="Hapus"
            onClick={() => setSelectedAction({ data: role, type: "delete" })}
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </Button>
        </div>,
      ]),
    [roles]
  );

  return (
    <AdminLayout desc="Manajemen Roles">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Manajemen Roles
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Kelola role pengguna dan permission yang dimiliki.
            </p>
          </div>
          <Button
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/20 font-bold px-5 transition-all"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-5 w-5 mr-1.5" strokeWidth={2.5} />
            Tambah Role
          </Button>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white p-2 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <DataTable
            header={HEADER_TABLE_ROLE}
            data={tableData}
            isLoading={isLoading}
            totalPages={1}
            currentPage={1}
            currentLimit={roles.length || 10}
            onChangePage={() => {}}
            onChangeLimit={() => {}}
          />
        </div>

        {/* ── DIALOGS ── */}
        <DialogCreateRole open={createOpen} onOpenChange={setCreateOpen} />

        <DialogUpdateRole
          open={selectedAction?.type === "update"}
          onOpenChange={(o) => !o && setSelectedAction(null)}
          currentData={selectedAction?.data}
        />

        <DialogDeleteRole
          open={selectedAction?.type === "delete"}
          onOpenChange={(o) => !o && setSelectedAction(null)}
          currentData={selectedAction?.data}
        />

        <DialogManagePermissions
          open={selectedAction?.type === "permissions"}
          onOpenChange={(o) => !o && setSelectedAction(null)}
          currentRole={selectedAction?.data}
        />
      </div>
    </AdminLayout>
  );
};

export default Roles;
