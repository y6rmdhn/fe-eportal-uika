import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import network from "@/utils/network";
import session from "@/utils/session";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    // Step 1: Exchange cookie jadi token
    network
      .get("/auth/token-from-cookie", { withCredentials: true })
      .then((res) => {
        const { uika_sso_token, user } = res.data.data;

        // Simpan token ke localStorage biar interceptor bisa pakai
        session.setToken(uika_sso_token);
        session.setSession(user);
        setUser(user);

        toast.success(`Selamat datang, ${user.email}!`);
        navigate("/", { replace: true });
      })
      .catch(() => {
        toast.error("Gagal memproses login Google.");
        navigate("/login", { replace: true });
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Memproses login Google Anda...</p>
      </div>
    </div>
  );
}
