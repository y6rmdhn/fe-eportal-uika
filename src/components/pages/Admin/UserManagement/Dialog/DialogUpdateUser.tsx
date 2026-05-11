/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { Preview, UserData } from "@/types/general.type";
import useUpdateUser from "@/hooks/UserManagement/useUpdateUser";
import FormUser from "./Form/FormUser";
import type { updateUserForm } from "@/validations/userManagementValidation";

export default function DialogUpdateUser({
  currentData,
  handleChangeAction,
  open,
}: {
  refetch: () => void;
  currentData?: UserData;
  open?: boolean;
  handleChangeAction?: (open: boolean) => void;
}) {
  const { form, handleUpdateUser, isPendingUpdateUser } = useUpdateUser();

  const [manualPreview, setManualPreview] = useState<Preview | undefined>(
    undefined,
  );

  const preview: Preview | undefined =
    manualPreview ??
    (currentData?.image
      ? { file: undefined, displayUrl: currentData.image }
      : undefined);

  console.log("errors:", form.formState.errors);

  const onSubmit = (payload: updateUserForm) => {
    console.log("payload:", payload);

    if (currentData?.public_id) {
      handleUpdateUser(currentData.public_id, payload);
    }
  };

  useEffect(() => {
    if (currentData && open) {
      form.reset({
        name: currentData.name,
        email: currentData.email,
        role: currentData.role,
        phone: currentData.phone ? String(currentData.phone) : "",
        location: currentData.location ?? "",
        about_me: currentData.about_me ?? "",
        nidn: currentData.nidn ?? "",
        nip: currentData.nip ?? "",
        npm: currentData.npm ?? "",
        is_active: String(currentData.is_active) as "true" | "false",
        password: "",
        image: undefined,
      });
      setManualPreview(undefined);
    }
  }, [currentData, open]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormUser
        form={form}
        onSubmit={onSubmit}
        isLoading={isPendingUpdateUser}
        type="Update"
        preview={preview}
        setPreview={setManualPreview}
      />
    </Dialog>
  );
}
