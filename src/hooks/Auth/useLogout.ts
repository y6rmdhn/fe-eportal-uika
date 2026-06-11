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
    onSettled: async () => {
      // Single Logout — hit logout endpoint semua aplikasi terdaftar
      const registeredApps = [
        "http://localhost:3000/api/logout", // TIAS/UCL
        // tambahin aplikasi lain di sini nanti
      ];

      await Promise.allSettled(
        registeredApps.map((url) =>
          fetch(url, { method: "POST", credentials: "include" }),
        ),
      );

      session.clearSession();
      window.location.href = "/login";
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
