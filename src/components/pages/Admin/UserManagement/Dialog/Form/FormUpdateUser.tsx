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
import { UserCheck, Search } from "lucide-react";
import { Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import admin from "@/services/api/admin";
import { useState } from "react";
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

  const { data: unitsRes } = useQuery({
    queryKey: ["all-units"],
    queryFn: async () => {
      const res = await admin.getUnits();
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

  // Filter roles based on search term
  const filteredRoles = roles.filter((r) =>
    (r.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected = roles.length > 0 && currentRoles.length === roles.length;
  const isIndeterminate =
    roles.length > 0 &&
    currentRoles.length > 0 &&
    currentRoles.length < roles.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      form.setValue(
        "roles" as Path<T>,
        roles.map((r) => r.name) as any,
        { shouldValidate: true }
      );
    } else {
      form.setValue(
        "roles" as Path<T>,
        [] as any,
        { shouldValidate: true }
      );
    }
  };

  return (
    <DialogContent className="sm:max-w-[760px] rounded-[2rem] p-6 sm:p-8 bg-white border border-gray-200 shadow-2xl">
      <DialogHeader className="pb-4 border-b border-gray-100">
        <DialogTitle className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span>Update User Account</span>
            <p className="text-xs text-gray-400 font-medium normal-case mt-0.5">
              Edit user credentials, institutional assignments, and access privileges.
            </p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {/* Two-column layout grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Account Details (7/12 width) */}
          <div className="md:col-span-7 space-y-5">
            <div className="p-4.5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Account Credentials
              </p>
              
              <div className="relative">
                <FormInput
                  form={form}
                  label="Email Address"
                  name={"email" as Path<T>}
                  placeholder="email@domain.com"
                  type="email"
                />
              </div>

              <div className="relative">
                <FormInput
                  form={form}
                  label="Password"
                  name={"password" as Path<T>}
                  placeholder="Leave blank to keep current password"
                  type="password"
                />
              </div>
            </div>

            <div className="p-4.5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Institutional Data
              </p>

              <div className="grid grid-cols-2 gap-4">
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
                        className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
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

          {/* Right Column: Roles (5/12 width) */}
          <div className="md:col-span-5">
            <div className="p-4.5 bg-gray-50/50 rounded-2xl border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Access Privileges
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-bold text-gray-600">Pilih Semua</span>
                </div>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari Jabatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((r) => {
                    const isChecked = currentRoles.includes(r.name);
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none text-xs font-semibold
                          ${isChecked 
                            ? "bg-emerald-50/50 border-emerald-100 text-emerald-800 shadow-sm" 
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50/50"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              form.setValue(
                                "roles" as Path<T>,
                                [...currentRoles, r.name] as any,
                                { shouldValidate: true }
                              );
                            } else {
                              form.setValue(
                                "roles" as Path<T>,
                                currentRoles.filter((item: string) => item !== r.name) as any,
                                { shouldValidate: true }
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                        />
                        <span className="truncate">{r.name}</span>
                      </label>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400 font-medium text-xs">
                    Jabatan tidak ditemukan
                  </div>
                )}
              </div>

              {form.formState.errors["roles" as Path<T>] && (
                <p className="text-xs text-rose-500 font-medium mt-2">
                  {(form.formState.errors["roles" as Path<T>] as any)?.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <DialogFooter className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 sm:space-x-0">
          <DialogClose asChild>
            <Button
              variant="outline"
              type="button"
              className="h-11 px-6 rounded-xl font-bold border-gray-200 text-gray-700 hover:bg-gray-50 transition-all text-xs"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 px-6 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 transition-all text-xs flex items-center gap-1.5"
          >
            {isLoading ? (
              <Spinner className="w-4 h-4 text-white" />
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
