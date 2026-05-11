import DialogDelete from "@/common/DialogDelete";
import useDeleteUser from "@/hooks/UserManagement/useDeleteUser";
import type { UserData } from "@/types/general.type";

export default function DialogDeleteUser({
  open,
  currentData,
  handleChangeAction,
}: {
  currentData?: UserData;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const { handleDeleteUser, isPendingDeleteUser } = useDeleteUser();

  const onSubmit = () => {
    if (currentData?.public_id) {
      handleDeleteUser(currentData.public_id);
    }
  };

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPendingDeleteUser}
      onSubmit={onSubmit}
      title="User"
    />
  );
}
