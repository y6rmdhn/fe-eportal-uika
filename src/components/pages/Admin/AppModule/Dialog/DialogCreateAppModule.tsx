import { useState } from "react";
import type { Preview } from "@/types/general.type";
import useCreateAppModule from "@/hooks/AppModule/useCreateAppModule";
import FormAppModule from "./Form/FormAppModule";

export default function DialogCreateAppModule() {
  const [preview, setPreview] = useState<Preview | undefined>(undefined);
  const { form, isPending, handleCreate } = useCreateAppModule();

  return (
    <FormAppModule
      form={form}
      onSubmit={handleCreate}
      isLoading={isPending}
      type="Create"
      preview={preview}
      setPreview={setPreview}
    />
  );
}
