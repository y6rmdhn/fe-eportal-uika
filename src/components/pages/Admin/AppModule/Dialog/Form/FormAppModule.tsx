import FormImage from "@/common/FormImage";
import FormInput from "@/common/FormInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import type { Preview } from "@/types/general.type";
import { LayoutGrid } from "lucide-react";
import {
  Controller,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

const ROLE_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Dosen", value: "dosen" },
  { label: "Mahasiswa", value: "mahasiswa" },
];

export default function FormAppModule({
  form,
  onSubmit,
  isLoading,
  type,
  preview,
  setPreview,
}: {
  form: UseFormReturn<any>;
  onSubmit: SubmitHandler<any>;
  isLoading: boolean;
  type: "Create" | "Update";
  preview?: Preview;
  setPreview?: (p: Preview) => void;
}) {
  return (
    <DialogContent className="sm:max-w-[460px] max-h-[90vh]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" />
          {type} App Module
        </DialogTitle>
        <DialogDescription>
          {type === "Create"
            ? "Tambahkan modul aplikasi baru"
            : "Perbarui data modul"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4 max-h-[55vh] px-1 overflow-y-auto">
          <FormInput
            form={form}
            label="Nama Modul"
            name="name"
            placeholder="Contoh: SIAKAD"
          />
          <FormInput
            form={form}
            label="URL"
            name="url"
            placeholder="https://siakad.uika.ac.id"
          />
          <FormInput
            form={form}
            label="Deskripsi"
            name="description"
            placeholder="Deskripsi singkat modul..."
            type="textarea"
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              form={form}
              label="Urutan Tampil"
              name="order"
              placeholder="0"
              type="number"
            />

            {/* Toggle is_active */}
            <Controller
              name="is_active"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Status
                  </Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-sm text-gray-600">
                      {field.value ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
              )}
            />
          </div>

          <Separator />

          {/* Roles checkbox */}
          <Controller
            name="roles"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Role yang bisa akses
                </Label>
                <div className="flex gap-4">
                  {ROLE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={field.value?.includes(opt.value as any)}
                        onCheckedChange={(checked) => {
                          const current = field.value ?? [];
                          field.onChange(
                            checked
                              ? [...current, opt.value]
                              : current.filter((r: any) => r !== opt.value),
                          );
                        }}
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {fieldState.error && (
                  <p className="text-xs text-rose-500">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <Separator />

          <FormImage
            form={form}
            name="icon"
            label="Icon Modul"
            preview={preview}
            setPreview={setPreview}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <LayoutGrid className="w-4 h-4 mr-1.5" />
                {type}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
