import user from "@/services/api/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useLogout } from "@/hooks/Auth/useLogout";

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Password lama wajib diisi"),
    password: z
      .string()
      .min(8, "Minimal 8 karakter")
      .max(32, "Terlalu panjang"),
    password_confirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

export type changePasswordForm = z.infer<typeof changePasswordSchema>;

const useChangePassword = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { handleLogout } = useLogout();

  const form = useForm<changePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: changePasswordForm) => {
      const response = await user.changePassword(payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password berhasil diubah");
      form.reset();
      setShowSuccessModal(true);
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Terjadi kesalahan server",
        );
      } else {
        toast.error(error.message);
      }
    },
  });

  const handleChangePassword = (payload: changePasswordForm) => mutate(payload);

  // Dipanggil setelah user klik "Lanjutkan" di modal, atau otomatis via timer
  const confirmAndLogout = () => {
    setShowSuccessModal(false);
    handleLogout();
  };

  return {
    form,
    isPending,
    handleChangePassword,
    showSuccessModal,
    confirmAndLogout,
  };
};

export default useChangePassword;
