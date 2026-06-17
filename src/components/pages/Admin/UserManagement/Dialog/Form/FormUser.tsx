import FormImage from "@/common/FormImage";
import FormInput from "@/common/FormInput";
import FormSelect from "@/common/FormSelect";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { Preview } from "@/types/general.type";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import {
  Controller,
  type FieldValues,
  type Path,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

import { useGetRoles } from "@/hooks/Roles/useRoles";
import { useGetUnits } from "@/hooks/Units/useUnits";

const STATUS_LIST = [
  { label: "Aktif", value: "true" },
  { label: "Tidak Aktif", value: "false" },
];

export default function FormUser<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
  preview,
  setPreview,
}: {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  isLoading: boolean;
  type: "Create" | "Update";
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
}) {
  const { data: rolesData } = useGetRoles();
  const roles = rolesData?.data || [];

  const { data: unitsData } = useGetUnits();
  const units = unitsData?.data || [];

  const unitList = [
    { label: "Tanpa Unit Kerja", value: "none" },
    ...units.map((u: any) => ({
      label: `${u.nama_unit} (${u.code})`,
      value: String(u.id),
    })),
  ];

  return (
    <DialogContent className="sm:max-w-[480px] max-h-[90vh]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          {type} User
        </DialogTitle>
        <DialogDescription>
          {type === "Create"
            ? "Tambahkan akun pengguna baru ke sistem"
            : "Perbarui data pengguna"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4 max-h-[52vh] px-1 overflow-y-auto">
          {/* Informasi Akun */}
          <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
            Informasi akun
          </p>

          <FormInput
            form={form}
            label="Name"
            name={"name" as Path<T>}
            placeholder="Masukkan nama lengkap"
          />

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 h-[100px] overflow-y-auto">
              <Label className="text-xs font-bold text-gray-500 mb-1">Roles (Pilih min. 1)</Label>
              <Controller
                control={form.control}
                name={"roles" as Path<T>}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((r: any) => (
                      <div key={r.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${r.id}`}
                          checked={field.value?.includes(r.name)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            const newValue = checked
                              ? [...currentValue, r.name]
                              : currentValue.filter((v: string) => v !== r.name);
                            field.onChange(newValue);
                          }}
                        />
                        <Label
                          htmlFor={`role-${r.id}`}
                          className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {r.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              />
              {form.formState.errors.roles && (
                <span className="text-xs text-rose-500 mt-1 font-medium">
                  {form.formState.errors.roles.message as string}
                </span>
              )}
            </div>
            <FormSelect
              form={form}
              label="Status aktif"
              name={"is_active" as Path<T>}
              selectItem={STATUS_LIST}
            />
          </div>

          <FormSelect
            form={form}
            label="Unit Kerja (Opsional)"
            name={"unit_id" as Path<T>}
            selectItem={unitList}
            placeholder="Pilih Unit Kerja"
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              form={form}
              label="No. HP"
              name={"phone" as Path<T>}
              placeholder="08xxxxxxxxxx"
              type="tel"
            />
            <FormInput
              form={form}
              label="Lokasi"
              name={"location" as Path<T>}
              placeholder="Kota / alamat"
            />
          </div>

          <Separator />

          {/* Informasi Tambahan */}
          <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
            Informasi tambahan
          </p>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              form={form}
              label="NIDN"
              name={"nidn" as Path<T>}
              placeholder="Nomor NIDN"
            />
            <FormInput
              form={form}
              label="NIP"
              name={"nip" as Path<T>}
              placeholder="Nomor NIP"
            />
          </div>

          <FormInput
            form={form}
            label="NPM"
            name={"npm" as Path<T>}
            placeholder="Nomor NPM mahasiswa"
          />

          <FormInput
            form={form}
            label="About me"
            name={"about_me" as Path<T>}
            placeholder="Deskripsi singkat tentang pengguna..."
            type="textarea"
          />

          <FormImage
            form={form}
            name={"image" as Path<T>}
            label="Foto profil"
            preview={preview}
            setPreview={setPreview}
          />
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
