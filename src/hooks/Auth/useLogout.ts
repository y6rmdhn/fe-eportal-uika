import { useMutation } from "@tanstack/react-query";
import auth from "@/services/api/auth.ts";
import session from "@/utils/session";
import toast from "react-hot-toast";

export const useLogout = () => {
  const logoutService = async () => {
    const result = await auth.logout();
    return result.data;
  };

  const { mutate: mutateLogout, isPending: isPendingLogout } = useMutation({
    mutationFn: logoutService,
    onSuccess: (data) => {
      const message = data?.message || "Berhasil logout!";
      toast.success(message);
    },
    onError: (error) => {
      console.error("Gagal logout di server:", error);
      toast.error("Sesi telah berakhir.");
    },
    onSettled: () => {
      session.clearSession();
      // Ikuti base build (lokal "/", produksi "/eportal/") — jangan di-hardcode,
      // karena hardcode membuat logout gagal saat dijalankan lokal.
      window.location.href = `${import.meta.env.BASE_URL}login`;
    },
  });

  const handleLogout = () => {
    mutateLogout();
  };

  return {
    handleLogout,
    isPendingLogout,
  };
};