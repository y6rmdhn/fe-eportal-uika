import { useState } from "react";
import type { Preview } from "@/types/general.type";
import useCreateUser from "@/hooks/UserManagement/useCreateUser";
import FormMenu from "./Form/FormUser";

export default function DialogCreateUser() {
  const [preview, setPreview] = useState<Preview | undefined>(undefined);
  const { form, isPendingCreateUser, handleCreateUser } = useCreateUser();

  return (
    <FormMenu
      form={form}
      // @ts-ignore
      onSubmit={handleCreateUser}
      isLoading={isPendingCreateUser}
      type="Create"
      preview={preview}
      setPreview={setPreview}
    />
  );
}
