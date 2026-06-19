import DataTable from "@/common/DataTable";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { HEADER_TABLE_APP_MODULE } from "@/constants/AdminConstant";
import useAppModule from "@/hooks/AppModule/useAppModule";
import { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, LayoutGrid } from "lucide-react";
import type { AppModuleData } from "@/types/general.type";
import DialogCreateAppModule from "./Dialog/DialogCreateAppModule";
import DialogUpdateAppModule from "./Dialog/DialogUpdateAppModule";
import DialogDeleteAppModule from "./Dialog/DialogDeleteAppModule";

const AppModulePage = () => {
  const [selectedAction, setSelectedAction] = useState<{
    data: AppModuleData;
    type: "update" | "delete";
  } | null>(null);

  const handleChangeAction = (open: boolean) => {
    if (!open) setSelectedAction(null);
  };

  const { dataAppModule, isLoadingAppModule } = useAppModule();

  const tableData = useMemo(() => {
    return (dataAppModule?.data || []).map(
      (mod: AppModuleData, index: number) => [
        <span key={`no-${index}`} className="font-medium text-gray-500">
          {index + 1}
        </span>,

        <div key={`info-${index}`} className="flex items-center gap-3">
          {mod.icon ? (
            <img
              src={mod.icon}
              alt={mod.name}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <LayoutGrid size={16} className="text-emerald-600" />
            </div>
          )}
          <div className="flex flex-col">
            <p className="font-bold text-[14px] text-gray-900 leading-tight">
              {mod.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {mod.description || "-"}
            </p>
          </div>
        </div>,

        <span
          key={`url-${index}`}
          className="text-xs text-blue-600 font-mono truncate max-w-[180px] block"
        >
          {mod.url || "-"}
        </span>,

        <div key={`roles-${index}`} className="flex flex-wrap gap-1">
          {mod.roles.map((r: any) => (
            <span
              key={r.id}
              className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 capitalize"
            >
              {r.name}
            </span>
          ))}
        </div>,

        <span
          key={`order-${index}`}
          className="text-sm font-medium text-gray-600"
        >
          {mod.order}
        </span>,

        <span
          key={`status-${index}`}
          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            mod.is_active
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-gray-50 text-gray-500 border-gray-100"
          }`}
        >
          {mod.is_active ? "Aktif" : "Nonaktif"}
        </span>,

        <div key={`action-${index}`} className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg"
            onClick={() => setSelectedAction({ data: mod, type: "update" })}
          >
            <Edit2 size={16} strokeWidth={2.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-lg"
            onClick={() => setSelectedAction({ data: mod, type: "delete" })}
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </Button>
        </div>,
      ],
    );
  }, [dataAppModule]);

  return (
    <AdminLayout desc="Management App Module">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              App Module
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Kelola modul aplikasi dan hak akses per role.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-5">
                <Plus className="h-5 w-5 mr-1.5" strokeWidth={2.5} />
                Tambah Modul
              </Button>
            </DialogTrigger>
            <DialogCreateAppModule />
          </Dialog>
        </div>

        {/* Tabel */}
        <div className="bg-white p-2 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <DataTable
            header={HEADER_TABLE_APP_MODULE}
            data={tableData}
            isLoading={isLoadingAppModule}
            totalPages={1}
            currentPage={1}
            currentLimit={100}
            onChangePage={() => {}}
            onChangeLimit={() => {}}
          />

          <DialogUpdateAppModule
            open={selectedAction?.type === "update"}
            currentData={selectedAction?.data}
            handleChangeAction={handleChangeAction}
          />

          <DialogDeleteAppModule
            open={selectedAction?.type === "delete"}
            currentData={selectedAction?.data}
            handleChangeAction={handleChangeAction}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AppModulePage;
