import DataTable from "@/common/DataTable";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HEADER_TABLE_USER } from "@/constants/AdminConstant";
import useDataTable from "@/hooks/Table/useDataTable";
import useUserManagement from "@/hooks/UserManagement/useUserManagement";
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  Download,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import DialogCreateUser from "./Dialog/DialogCreateUser";
import DialogUpdateUser from "./Dialog/DialogUpdateUser";
import type { UserData } from "@/types/general.type";
import DialogDeleteUser from "./Dialog/DialogDeleteUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DialogResetPassword from "./Dialog/DialogResetPassword";
import useExportImportUser from "@/hooks/UserManagement/useExportImportUser";
import { Spinner } from "@/components/ui/spinner";
import DialogImportUser from "./Dialog/DialogImportUser";
import { useQuery } from "@tanstack/react-query";
import admin from "@/services/api/admin";
import { SearchableSelect } from "@/components/ui/searchable-select";
import useToggleActive from "@/hooks/UserManagement/useToggleActive";

const UserManagement = () => {
  const [selectedAction, setSelectedAction] = useState<{
    data: UserData;
    type: "update" | "delete" | "reset-password";
  } | null>(null);

  const [currentUnitFilter, setCurrentUnitFilter] = useState<string>("");

  const handleChanngeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const { handleToggleActive } = useToggleActive();

  // Fetch jabatan/roles dari API untuk filter dropdown
  const { data: rolesRes } = useQuery({
    queryKey: ["all-roles"],
    queryFn: async () => {
      const res = await admin.getRoles();
      return res.data?.data as { id: number; name: string }[];
    },
  });
  const jabatanOptions = rolesRes || [];

  // Fetch units dari API untuk filter dropdown
  const { data: unitsRes } = useQuery({
    queryKey: ["all-units-filter"],
    queryFn: async () => {
      const res = await admin.getUnits({ per_page: 1000 });
      return res.data?.data as { id: number; code: string; nama_unit: string }[];
    },
  });
  const unitOptions = unitsRes || [];

  const {
    currentLimit,
    currentPage,
    handleChangeLimit,
    handleChangePage,
    currentSearch,
    handleChangeSearch,
    currentFilter,
    handleChangeFilter,
  } = useDataTable();

  // Fetch users with unit filter included
  const { dataUserManagement, isLoadingUserManagement, refetch } =
    useUserManagement({
      currentLimit,
      currentPage,
      currentSearch,
      currentFilter,
      currentUnitFilter,
    });

  const {
    exportUsers,
    isPendingExport,
    isPendingImport,
    handleFileChange,
    downloadTemplate,
  } = useExportImportUser(currentSearch, currentFilter);

  const roleFilterOptions = useMemo(() => {
    return [
      { value: "", label: "Semua Jabatan" },
      ...jabatanOptions.map((jab) => ({ value: jab.name, label: jab.name })),
    ];
  }, [jabatanOptions]);

  const unitFilterOptions = useMemo(() => {
    return [
      { value: "", label: "Semua Unit" },
      ...unitOptions.map((unit) => ({
        value: unit.id.toString(),
        label: `${unit.nama_unit} (${unit.code})`,
      })),
    ];
  }, [unitOptions]);

  const filteredData = useMemo(() => {
    return (dataUserManagement?.data || []).map(
      (user: UserData, index: number) => {
        return [
          <span key={`no-${index}`} className="font-medium text-gray-500">
            {currentLimit * (currentPage - 1) + index + 1}
          </span>,

          // Email
          <p
            key={`email-${index}`}
            className="font-bold text-[14px] text-gray-900 max-w-[200px] break-all"
          >
            {user.email}
          </p>,

          // NIDN / NPM
          <span
            key={`id-${index}`}
            className="inline-flex px-2.5 py-1 bg-gray-50 text-gray-600 font-mono text-xs rounded-md border border-gray-100"
          >
            {user.nidn ?? user.npm ?? user.nik ?? "-"}
          </span>,

          // Unit
          <div key={`unit-${index}`} className="flex flex-col max-w-[200px]">
            <span className="font-bold text-gray-800 text-[13px]">{user.unit?.nama_unit || "-"}</span>
            {user.unit?.code && (
              <span className="text-[10px] font-bold text-gray-400 font-mono mt-0.5">{user.unit.code}</span>
            )}
          </div>,

          // Role / Jabatan — tampilkan dari array roles aktual (Spatie)
          <div key={`role-${index}`} className="flex flex-wrap gap-1">
            {Array.isArray(user.roles) && user.roles.length > 0 ? (
              user.roles.map((r, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap"
                >
                  {r}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-400 border border-gray-200">
                Tidak Ada Jabatan
              </span>
            )}
          </div>,

          // Tanggal
          <span
            key={`date-${index}`}
            className="text-sm text-gray-600 font-medium"
          >
            {user.created_at?.split("T")[0]}
          </span>,

          // Aksi
          <div key={`action-${index}`} className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-lg ${
                user.isverified
                  ? "text-gray-400 hover:bg-gray-50"
                  : "text-emerald-600 hover:bg-emerald-50"
              }`}
              title={user.isverified ? "Nonaktifkan" : "Verifikasi Akun"}
              onClick={() => handleToggleActive(user.id)}
            >
              {user.isverified ? (
                <ShieldOff size={16} strokeWidth={2.5} />
              ) : (
                <ShieldCheck size={16} strokeWidth={2.5} />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg"
              onClick={() => setSelectedAction({ data: user, type: "update" })}
            >
              <Edit2 size={16} strokeWidth={2.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-amber-600 hover:bg-amber-50 rounded-lg"
              onClick={() =>
                setSelectedAction({ data: user, type: "reset-password" })
              }
            >
              <KeyRound size={16} strokeWidth={2.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-lg"
              onClick={() => setSelectedAction({ data: user, type: "delete" })}
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </Button>
          </div>,
        ];
      },
    );
  }, [
    dataUserManagement,
    currentLimit,
    currentSearch,
    currentPage,
    handleToggleActive,
  ]);

  return (
    <AdminLayout desc="Management User">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* ── HEADER HALAMAN ── */}
        <div className="flex flex-col gap-6 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          {/* Top Row: Title & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Management User
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Kelola data pengguna, hak akses, dan role.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Import Action */}
              <DialogImportUser
                isPendingImport={isPendingImport}
                handleFileChange={handleFileChange}
                downloadTemplate={downloadTemplate}
              />

              {/* Export Action */}
              <Button
                variant="outline"
                className="h-11 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold px-4 transition-all"
                onClick={() => exportUsers()}
                disabled={isPendingExport}
              >
                {isPendingExport ? (
                  <Spinner />
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1.5" />
                    Export
                  </>
                )}
              </Button>

              {/* Create User Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/20 font-bold px-5 transition-all">
                    <Plus className="h-5 w-5 mr-1.5" strokeWidth={2.5} />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogCreateUser />
              </Dialog>
            </div>
          </div>

          {/* Horizontal separator line */}
          <div className="border-t border-gray-100" />

          {/* Bottom Row: Search & Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all w-full"
                onChange={(e) => handleChangeSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Filter Jabatan */}
              <SearchableSelect
                options={roleFilterOptions}
                value={currentFilter}
                onValueChange={(v) => handleChangeFilter(v)}
                placeholder="Filter Jabatan"
                className="w-full sm:w-[200px]"
              />

              {/* Filter Unit */}
              <SearchableSelect
                options={unitFilterOptions}
                value={currentUnitFilter}
                onValueChange={(v) => {
                  setCurrentUnitFilter(v);
                  handleChangePage(1);
                }}
                placeholder="Filter Unit"
                className="w-full sm:w-[220px]"
              />
            </div>
          </div>
        </div>

        {/* ── KOMPONEN DATA TABLE ── */}
        <div className="bg-white p-2 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <DataTable
            header={[
              "No",
              "Informasi User",
              "ID (NPM/NIP/NIDN)",
              "Unit",
              "Jabatan / Role",
              "Tanggal Daftar",
              "Aksi",
            ]}
            data={filteredData}
            isLoading={isLoadingUserManagement}
            totalPages={dataUserManagement?.meta.last_page || 1}
            currentPage={currentPage}
            currentLimit={currentLimit}
            onChangePage={handleChangePage}
            onChangeLimit={handleChangeLimit}
          />

          <DialogUpdateUser
            refetch={refetch}
            open={selectedAction !== null && selectedAction.type === "update"}
            currentData={selectedAction?.data}
            handleChangeAction={handleChanngeAction}
          />

          <DialogDeleteUser
            open={selectedAction !== null && selectedAction.type === "delete"}
            currentData={selectedAction?.data}
            handleChangeAction={handleChanngeAction}
          />

          <DialogResetPassword
            open={
              selectedAction !== null &&
              selectedAction.type === "reset-password"
            }
            currentData={selectedAction?.data}
            handleChangeAction={handleChanngeAction}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
