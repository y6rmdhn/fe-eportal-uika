/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { AppModuleData, Preview } from "@/types/general.type";
import useUpdateAppModule from "@/hooks/AppModule/useUpdateAppModule";
import FormAppModule from "./Form/FormAppModule";
import type { AppModuleForm } from "@/hooks/AppModule/useCreateAppModule";

export default function DialogUpdateAppModule({
  open,
  currentData,
  handleChangeAction,
}: {
  open: boolean;
  currentData?: AppModuleData;
  handleChangeAction: (open: boolean) => void;
}) {
  const { form, isPending, handleUpdate } = useUpdateAppModule();

  const [manualPreview, setManualPreview] = useState<Preview | undefined>(
    undefined,
  );

  const preview: Preview | undefined =
    manualPreview ??
    (currentData?.icon
      ? { file: undefined, displayUrl: currentData.icon }
      : undefined);

  const onSubmit = (payload: AppModuleForm) => {
    if (currentData?.id) handleUpdate(currentData.id, payload);
  };

  // Cari bagian ini di dalam useEffect
  useEffect(() => {
    if (currentData) {
      form.reset({
        name: currentData.name,
        url: currentData.url ?? "",
        description: currentData.description ?? "",
        is_active: currentData.is_active,
        order: currentData.order,

        // UBAH BARIS INI: Mapping object ke string name-nya
        roles: currentData.roles?.map((r: any) => r.name) as any,

        icon: undefined,
      });
      setManualPreview(undefined);
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormAppModule
        form={form}
        onSubmit={onSubmit}
        isLoading={isPending}
        type="Update"
        preview={preview}
        setPreview={setManualPreview}
      />
    </Dialog>
  );
}
