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
import { UserPlus } from "lucide-react";
import type {
  FieldValues,
  Path,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";

import { useGetRoles } from "@/hooks/Roles/useRoles";

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
  
  const roleList = roles.map((r: any) => ({
    label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
    value: r.name,
  }));

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
            <FormSelect
              form={form}
              label="Role"
              name={"role" as Path<T>}
              selectItem={roleList}
            />
            <FormSelect
              form={form}
              label="Status aktif"
              name={"is_active" as Path<T>}
              selectItem={STATUS_LIST}
            />
          </div>

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
