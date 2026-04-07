import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import auth from "@/services/api/auth.ts";
import session from "@/utils/session";
import toast from "react-hot-toast";

export const useLogout = () => {
    const navigate = useNavigate();

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
            navigate("/login");
        }
    });

    const handleLogout = () => {
        mutateLogout();
    };

    return {
        handleLogout,
        isPendingLogout
    };
};