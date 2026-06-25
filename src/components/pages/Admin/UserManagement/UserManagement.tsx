import DataTable from "@/common/DataTable";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HEADER_TABLE_USER } from "@/constants/AdminConstant";
import useDataTable from "@/hooks/Table/useDataTable";
import useUserManagement from "@/hooks/UserManagement/useUserManagement";
import { useMemo, useState } from "react";
import { Search, Plus, Edit2, Trash2, KeyRound, Download } from "lucide-react";
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

const UserManagement = () => {
  const [selectedAction, setSelectedAction] = useState<{
    data: UserData;
    type: "update" | "delete" | "reset-password";
  } | null>(null);

  const handleChanngeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  // Fetch jabatan/roles dari API untuk filter dropdown
  const { data: rolesRes } = useQuery({
    queryKey: ["all-roles"],
    queryFn: async () => {
      const res = await admin.getRoles();
      return res.data?.data as { id: number; name: string }[];
    },
  });
  const jabatanOptions = rolesRes || [];

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

  // LOGIKA TETAP SAMA SEPERTI KODE KAMU
  const { dataUserManagement, isLoadingUserManagement, refetch } =
    useUserManagement({
      currentLimit,
      currentPage,
      currentSearch,
      currentFilter,
    });

  const {
    exportUsers,
    isPendingExport,
    isPendingImport,
    handleFileChange,
    downloadTemplate,
  } = useExportImportUser(currentSearch, currentFilter);

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
            className="font-bold text-[14px] text-gray-900"
          >
            {user.email}
          </p>,

          // NIDN / NPM
          <span
            key={`id-${index}`}
            className="inline-flex px-2.5 py-1 bg-gray-50 text-gray-600 font-mono text-xs rounded-md border border-gray-100"
          >
            {user.nidn || user.npm || "-"}
          </span>,

          // Role / Jabatan — tampilkan dari array roles aktual (Spatie)
          <div
            key={`role-${index}`}
            className="flex flex-wrap gap-1"
          >
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
  }, [dataUserManagement, currentLimit, currentSearch, currentPage]);

  return (
    <AdminLayout desc="Management User">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* ── HEADER HALAMAN ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Management User
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Kelola data pengguna, hak akses, dan role.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Input Search Modern */}

            <Select
              value={currentFilter || "all"}
              onValueChange={(v) => handleChangeFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[150px] h-11 rounded-xl border-gray-200 bg-gray-50">
                <SelectValue placeholder="Filter role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Jabatan</SelectItem>
                {jabatanOptions.map((jab) => (
                  <SelectItem key={jab.id} value={jab.name}>
                    {jab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl transition-all"
                onChange={(e) => handleChangeSearch(e.target.value)}
              />
            </div>

            <>
              {/* Hidden file input untuk import */}
              <DialogImportUser
                isPendingImport={isPendingImport}
                handleFileChange={handleFileChange}
                downloadTemplate={downloadTemplate}
              />

              {/* Tombol Export */}
              <Button
                variant="outline"
                className="h-11 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold px-4"
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
            </>

            {/* Tombol Create Modern */}
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

        {/* ── KOMPONEN DATA TABLE ── */}
        <div className="bg-white p-2 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <DataTable
            header={HEADER_TABLE_USER}
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
