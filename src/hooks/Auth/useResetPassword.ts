import auth from "@/services/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react"; // ← tambah useState
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

const resetPasswordSchema = z
  .object({
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

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const useResetPassword = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const isResetMode = !!tokenParam && !!emailParam;

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // ← state baru untuk halaman sukses

  const forgotForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  // Auto-fill email dari URL params
  useEffect(() => {
    if (emailParam) {
      forgotForm.setValue("email", decodeURIComponent(emailParam));
    }
  }, [emailParam]);

  // Mutation: kirim email reset
  const { mutate: mutateForgot, isPending: isForgotPending } = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const response = await auth.sendResetLinkEmail(data.email);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Link reset password telah dikirim ke email Anda.");
        setIsEmailSent(true);
      } else {
        toast.error(data.message || "Gagal mengirim email.");
      }
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Terjadi kesalahan server",
        );
      } else {
        toast.error("Terjadi kesalahan");
      }
    },
  });

  // Mutation: reset password
  const { mutate: mutateReset, isPending: isResetPending } = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const response = await auth.resetPassword({
        token: tokenParam!,
        email: emailParam!,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Password berhasil diubah!");
        setIsSuccess(true); // ← set sukses, tidak redirect langsung
      } else {
        toast.error(data.message || "Gagal reset password.");
      }
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Terjadi kesalahan server",
        );
      } else {
        toast.error("Terjadi kesalahan");
      }
    },
  });

  const onForgotSubmit = (data: ForgotPasswordForm) => mutateForgot(data);
  const onResetSubmit = (data: ResetPasswordForm) => mutateReset(data);

  return {
    isResetMode,
    emailParam,
    isEmailSent,
    isSuccess, // ← export state sukses
    forgotForm,
    resetForm,
    isForgotPending,
    isResetPending,
    onForgotSubmit,
    onResetSubmit,
  };
};

export default useResetPassword;
