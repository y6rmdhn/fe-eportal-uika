import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Controller } from "react-hook-form";
import { Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import useResetUserPassword from "@/hooks/UserManagement/useResetUserPassword";
import type { UserData } from "@/types/general.type";

export default function DialogResetPassword({
  open,
  currentData,
  handleChangeAction,
}: {
  open: boolean;
  currentData?: UserData;
  handleChangeAction: (open: boolean) => void;
}) {
  const { form, isPending, handleResetPassword } = useResetUserPassword();
  const [show, setShow] = useState({ password: false, confirm: false });

  const onSubmit = (payload: any) => {
    if (currentData?.id) {
      handleResetPassword(currentData.id, payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Reset password untuk{" "}
            <span className="font-semibold text-gray-900">
              {currentData?.email}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Info email */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
          <Mail size={14} className="flex-shrink-0" />
          <span>
            Email notifikasi akan dikirim ke{" "}
            <strong>{currentData?.email}</strong>
          </span>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {[
            {
              name: "password" as const,
              label: "Password Baru",
              key: "password",
              placeholder: "Min. 8 karakter",
            },
            {
              name: "password_confirmation" as const,
              label: "Konfirmasi Password",
              key: "confirm",
              placeholder: "Ulangi password baru",
            },
          ].map(({ name, label, key, placeholder }) => (
            <Controller
              key={name}
              name={name}
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    {label}
                  </Label>
                  <div className="relative">
                    <Input
                      {...field}
                      type={
                        show[key as keyof typeof show] ? "text" : "password"
                      }
                      placeholder={placeholder}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShow((p) => ({
                          ...p,
                          [key]: !p[key as keyof typeof show],
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {show[key as keyof typeof show] ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {fieldState.error && (
                    <p className="text-xs text-rose-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          ))}

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isPending ? <Spinner /> : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
