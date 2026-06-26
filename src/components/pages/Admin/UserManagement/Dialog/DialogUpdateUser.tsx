/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { UserData } from "@/types/general.type";
import useUpdateUser from "@/hooks/UserManagement/useUpdateUser";
import FormUpdateUser from "./Form/FormUpdateUser";
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

  const onSubmit = (payload: updateUserForm) => {
    if (currentData?.id) {
      handleUpdateUser(currentData.id, payload); // ← ganti public_id ke id
    }
  };

  useEffect(() => {
    if (currentData && open) {
      form.reset({
        email: currentData.email ?? "",
        nidn: currentData.nidn ?? "",
        npm: currentData.npm ?? "",
        password: "",
        unit_id: currentData.unit_id ?? null,
        roles: Array.isArray(currentData.roles) ? currentData.roles : [],
      });
    }
  }, [currentData, open]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormUpdateUser
        form={form}
        onSubmit={onSubmit}
        isLoading={isPendingUpdateUser}
      />
    </Dialog>
  );
}
