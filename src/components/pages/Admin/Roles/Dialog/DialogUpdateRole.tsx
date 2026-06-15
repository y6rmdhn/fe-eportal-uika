import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateRole } from "@/hooks/Roles/useRoles";
import type { Role } from "@/types/general.type";
import { useEffect, useState } from "react";

export default function DialogUpdateRole({
  open,
  onOpenChange,
  currentData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentData?: Role;
}) {
  const [name, setName] = useState("");
  const { mutateUpdate, isPendingUpdate } = useUpdateRole();

  useEffect(() => {
    if (currentData) {
      setName(currentData.name);
    }
  }, [currentData]);

  const handleSubmit = () => {
    if (!currentData || !name.trim()) return;
    mutateUpdate(
      { id: currentData.id, payload: { name: name.trim() } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Nama Role</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
            disabled={isPendingUpdate}
          >
            {isPendingUpdate ? <Spinner /> : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
