import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import type { AppModuleData } from "@/types/general.type";
import useDeleteAppModule from "@/hooks/AppModule/useDeleteAppModule";

export default function DialogDeleteAppModule({
  open,
  currentData,
  handleChangeAction,
}: {
  open: boolean;
  currentData?: AppModuleData;
  handleChangeAction: (open: boolean) => void;
}) {
  const { handleDelete, isPendingDelete } = useDeleteAppModule();

  return (
    <AlertDialog open={open} onOpenChange={handleChangeAction}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Modul?</AlertDialogTitle>
          <AlertDialogDescription>
            Modul{" "}
            <span className="font-semibold text-gray-900">
              {currentData?.name}
            </span>{" "}
            akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-600 hover:bg-rose-700 rounded-xl"
            disabled={isPendingDelete}
            onClick={() => {
              if (currentData?.id) {
                handleDelete(currentData.id);
                handleChangeAction(false);
              }
            }}
          >
            {isPendingDelete ? <Spinner /> : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
