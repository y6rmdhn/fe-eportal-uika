import FormInput from "@/common/FormInput";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { UserCheck, Shield, Search, GripVertical, Check, ArrowRightLeft, Trash2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import admin from "@/services/api/admin";
import { useState, useMemo } from "react";
import type {
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";

export default function FormUpdateUser<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
}: {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  isLoading: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDraggingOverAvailable, setIsDraggingOverAvailable] = useState(false);
  const [isDraggingOverSelected, setIsDraggingOverSelected] = useState(false);

  const { data: unitsRes } = useQuery({
    queryKey: ["all-units"],
    queryFn: async () => {
      const res = await admin.getUnits({ per_page: 1000 });
      return res.data?.data as { id: number; code: string; nama_unit: string }[];
    },
  });

  const { data: rolesRes } = useQuery({
    queryKey: ["all-roles"],
    queryFn: async () => {
      const res = await admin.getRoles();
      return res.data?.data as { id: number; name: string }[];
    },
  });

  const units = unitsRes || [];
  const roles = rolesRes || [];

  const currentRoles = (form.watch("roles" as Path<T>) || []) as string[];

  // Split roles into assigned (selected) and unassigned (available) lists
  const selectedRoles = useMemo(() => {
    return roles.filter((r) => currentRoles.includes(r.name));
  }, [roles, currentRoles]);

  const availableRoles = useMemo(() => {
    return roles.filter(
      (r) =>
        !currentRoles.includes(r.name) &&
        (r.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, currentRoles, searchTerm]);

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, roleName: string) => {
    e.dataTransfer.setData("text/plain", roleName);
  };

  const handleDropToSelected = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverSelected(false);
    const roleName = e.dataTransfer.getData("text/plain");
    if (roleName && !currentRoles.includes(roleName)) {
      form.setValue("roles" as Path<T>, [...currentRoles, roleName] as any, {
        shouldValidate: true,
      });
    }
  };

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverAvailable(false);
    const roleName = e.dataTransfer.getData("text/plain");
    if (roleName && currentRoles.includes(roleName)) {
      form.setValue(
        "roles" as Path<T>,
        currentRoles.filter((r) => r !== roleName) as any,
        { shouldValidate: true }
      );
    }
  };

  const toggleRole = (roleName: string) => {
    if (currentRoles.includes(roleName)) {
      form.setValue(
        "roles" as Path<T>,
        currentRoles.filter((r) => r !== roleName) as any,
        { shouldValidate: true }
      );
    } else {
      form.setValue("roles" as Path<T>, [...currentRoles, roleName] as any, {
        shouldValidate: true,
      });
    }
  };

  // Bulk handlers
  const handleAssignAllFiltered = () => {
    const allFilteredNames = availableRoles.map((r) => r.name);
    form.setValue("roles" as Path<T>, [...currentRoles, ...allFilteredNames] as any, {
      shouldValidate: true,
    });
  };

  const handleClearAllSelected = () => {
    form.setValue("roles" as Path<T>, [] as any, {
      shouldValidate: true,
    });
  };

  return (
    <DialogContent className="sm:max-w-[950px] rounded-[2rem] p-6 sm:p-8 bg-white border border-gray-200 shadow-2xl">
      <DialogHeader className="pb-4 border-b border-gray-100">
        <DialogTitle className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span>Update User Account</span>
            <p className="text-xs text-gray-400 font-medium normal-case mt-0.5">
              Edit kredensial user, penugasan unit institusi, dan hak akses jabatan.
            </p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Left Column: Account Details & Institutional (5/12 width) */}
          <div className="md:col-span-5 space-y-5">
            {/* Account Credentials */}
            <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-gray-400" /> Account Credentials
              </p>

              <FormInput
                form={form}
                label="Email Address"
                name={"email" as Path<T>}
                placeholder="email@domain.com"
                type="email"
              />

              <FormInput
                form={form}
                label="Password"
                name={"password" as Path<T>}
                placeholder="Biarkan kosong jika tidak ingin mengubah password"
                type="password"
              />
            </div>

            {/* Institutional Data */}
            <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Institutional Data
              </p>

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  form={form}
                  label="NIDN (Dosen)"
                  name={"nidn" as Path<T>}
                  placeholder="Nomor NIDN"
                />
                <FormInput
                  form={form}
                  label="NPM (Mahasiswa)"
                  name={"npm" as Path<T>}
                  placeholder="Nomor NPM"
                />
              </div>

              {/* Unit selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Unit Institusi</label>
                <Controller
                  name={"unit_id" as Path<T>}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="flex flex-col gap-1.5">
                      <select
                        {...field}
                        value={field.value ? String(field.value) : ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-medium text-gray-700"
                      >
                        <option value="">-- Pilih Unit --</option>
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.nama_unit} ({unit.code})
                          </option>
                        ))}
                      </select>
                      {fieldState.error && (
                        <span className="text-xs text-rose-500 font-medium">
                          {fieldState.error.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Roles Drag & Drop (7/12 width) */}
          <div className="md:col-span-7 flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-gray-400" /> Jabatan & Role Akses
              </p>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full select-none">
                Trello Style Drag & Drop
              </span>
            </div>

            {/* Drag & Drop Board Containers */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              
              {/* Available Roles Column */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDraggingOverAvailable(true)}
                onDragLeave={() => setIsDraggingOverAvailable(false)}
                onDrop={handleDropToAvailable}
                className={`flex flex-col p-4 bg-gray-50/50 rounded-2xl border transition-all h-[360px] overflow-hidden ${
                  isDraggingOverAvailable
                    ? "border-dashed border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/10 scale-[1.01]"
                    : "border-gray-200/80"
                }`}
              >
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700">Tersedia ({availableRoles.length})</span>
                  {availableRoles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAssignAllFiltered}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Pilih Semua
                    </button>
                  )}
                </div>

                {/* Filter Search inside board */}
                <div className="relative mb-3 flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari jabatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-gray-200 bg-white outline-none focus:border-emerald-500 transition-all font-medium"
                  />
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {availableRoles.length > 0 ? (
                    availableRoles.map((r) => (
                      <div
                        key={r.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, r.name)}
                        onClick={() => toggleRole(r.name)}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200/85 rounded-xl shadow-sm hover:border-emerald-400 hover:shadow-md hover:scale-[1.01] transition-all cursor-grab active:cursor-grabbing select-none"
                      >
                        <span className="text-xs font-semibold text-gray-700 truncate mr-2">{r.name}</span>
                        <GripVertical className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <span className="text-[11px] font-medium text-gray-400">Tidak ada jabatan tersedia</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Roles Column */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDraggingOverSelected(true)}
                onDragLeave={() => setIsDraggingOverSelected(false)}
                onDrop={handleDropToSelected}
                className={`flex flex-col p-4 bg-gray-50/50 rounded-2xl border transition-all h-[360px] overflow-hidden ${
                  isDraggingOverSelected
                    ? "border-dashed border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/10 scale-[1.01]"
                    : "border-gray-200/80"
                }`}
              >
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-700">Terpilih ({selectedRoles.length})</span>
                  {selectedRoles.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllSelected}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Bersihkan
                    </button>
                  )}
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {selectedRoles.length > 0 ? (
                    selectedRoles.map((r) => (
                      <div
                        key={r.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, r.name)}
                        onClick={() => toggleRole(r.name)}
                        className="flex items-center justify-between p-3 bg-white border border-emerald-100 rounded-xl shadow-sm hover:border-rose-400 hover:shadow-md hover:scale-[1.01] transition-all cursor-grab active:cursor-grabbing select-none"
                      >
                        <span className="text-xs font-semibold text-emerald-800 truncate mr-2">{r.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md">Active</span>
                          <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 rounded-xl bg-white/40">
                      <span className="text-[11px] font-bold text-gray-400">Drag jabatan ke sini</span>
                      <span className="text-[9px] text-gray-400 mt-1 font-medium">atau klik kartu untuk memindahkan</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
            
            {form.formState.errors["roles" as Path<T>] && (
              <p className="text-xs text-red-500 font-medium mt-2 flex-shrink-0">
                {(form.formState.errors["roles" as Path<T>] as any)?.message}
              </p>
            )}
          </div>

        </div>

        <DialogFooter className="pt-4 border-t border-gray-100 flex-shrink-0">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-xl h-11 font-semibold">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 font-semibold px-5 shadow-sm transition-all">
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
