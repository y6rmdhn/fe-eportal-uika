import admin from "@/services/api/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimal 8 karakter")
      .max(32, "Terlalu panjang"),
    password_confirmation: z.string().min(1, "Wajib diisi"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

export type resetPasswordForm = z.infer<typeof resetPasswordSchema>;

const useResetUserPassword = () => {
  const queryClient = useQueryClient();

  const form = useForm<resetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: resetPasswordForm;
    }) => {
      const response = await admin.resetUserPassword(id, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-management"] });
      toast.success(
        "Password berhasil direset, email notifikasi telah dikirim",
      );
      form.reset();
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

  const handleResetPassword = (id: string, payload: resetPasswordForm) => {
    mutate({ id, payload });
  };

  return { form, isPending, handleResetPassword };
};

export default useResetUserPassword;
