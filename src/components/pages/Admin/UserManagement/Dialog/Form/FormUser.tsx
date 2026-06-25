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
import { UserPlus } from "lucide-react";
import { Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import admin from "@/services/api/admin";
import type {
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";

export default function FormUser<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
}: {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  isLoading: boolean;
  type: "Create" | "Update";
}) {
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

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> {type} User
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4 px-1 max-h-[450px] overflow-y-auto">
          <FormInput
            form={form}
            label="Email"
            name={"email" as Path<T>}
            placeholder="email@domain.com"
            type="email"
          />

          <FormInput
            form={form}
            label="Password"
            name={"password" as Path<T>}
            placeholder="Min. 8 karakter"
            type="password"
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              form={form}
              label="NIDN"
              name={"nidn" as Path<T>}
              placeholder="Nomor NIDN (Dosen)"
            />
            <FormInput
              form={form}
              label="NPM"
              name={"npm" as Path<T>}
              placeholder="Nomor NPM (Mahasiswa)"
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
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  >
                    <option value="">-- Pilih Unit --</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.nama_unit} ({unit.code})
                      </option>
                    ))}
                  </select>
                  {fieldState.error && (
                    <span className="text-xs text-red-500 font-medium">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>

          {/* Jabatan (Spatie Roles) checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">Jabatan / Role Akses (Bisa Pilih Banyak)</label>
            <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-3 max-h-[160px] overflow-y-auto space-y-2.5">
              {roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={currentRoles.includes(r.name)}
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
                  <span>{r.name}</span>
                </label>
              ))}
            </div>
            {form.formState.errors["roles" as Path<T>] && (
              <p className="text-xs text-red-500 font-medium">
                {(form.formState.errors["roles" as Path<T>] as any)?.message}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1.5" />
                {type}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
