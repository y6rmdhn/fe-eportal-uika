import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  useDeletePermission,
  useBulkDeletePermission,
} from "@/hooks/Permissions/usePermissions";
import type { Permission } from "@/types/general.type";

export default function DialogDeletePermission({
  open,
  onOpenChange,
  currentData,
  selectedIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Single-delete mode
  currentData?: Permission;
  // Bulk-delete mode: array of id yang dicentang
  selectedIds?: number[];
}) {
  const { mutateDelete, isPendingDelete }       = useDeletePermission();
  const { mutateBulkDelete, isPendingBulkDelete } = useBulkDeletePermission();

  const isBulk  = selectedIds && selectedIds.length > 0;
  const isLoading = isBulk ? isPendingBulkDelete : isPendingDelete;

  const onSubmit = () => {
    if (isBulk) {
      mutateBulkDelete(
        { ids: selectedIds },
        { onSuccess: () => onOpenChange(false) }
      );
    } else if (currentData?.id) {
      mutateDelete(currentData.id, { onSuccess: () => onOpenChange(false) });
    }
  };

  const title = isBulk
    ? `Hapus ${selectedIds.length} Permission`
    : "Hapus Permission";

  const description = isBulk
    ? `Anda akan menghapus ${selectedIds.length} permission sekaligus. Tindakan ini tidak dapat dibatalkan.`
    : `Anda yakin ingin menghapus permission "${currentData?.name}"? Tindakan ini tidak dapat dibatalkan.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form className="grid gap-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button variant="destructive" formAction={onSubmit} disabled={isLoading}>
              {isLoading ? <Spinner /> : "Hapus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
