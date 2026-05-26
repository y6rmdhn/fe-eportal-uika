import DialogDelete from "@/common/DialogDelete";
import { useDeleteRole } from "@/hooks/Roles/useRoles";
import type { Role } from "@/types/general.type";

export default function DialogDeleteRole({
  open,
  onOpenChange,
  currentData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentData?: Role;
}) {
  const { mutateDelete, isPendingDelete } = useDeleteRole();

  const onSubmit = () => {
    if (currentData?.id) {
      mutateDelete(currentData.id, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <DialogDelete
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isPendingDelete}
      onSubmit={onSubmit}
      title="Role"
    />
  );
}
