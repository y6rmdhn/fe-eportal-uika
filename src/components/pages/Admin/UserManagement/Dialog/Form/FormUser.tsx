import FormInput from "@/common/FormInput";
import FormSelect from "@/common/FormSelect";
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
import {
  Controller,
  type FieldValues,
  type Path,
  type SubmitHandler,
  type UseFormReturn,
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
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> {type} User
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4 px-1">
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

          <FormSelect
            form={form}
            label="Role"
            name={"role" as Path<T>}
            selectItem={roleList}
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
