import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import auth from "@/services/api/auth";
import toast from "react-hot-toast";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    auth
      .getUser()
      .then((res) => {
        const userData = res.data.data;
        setUser(userData);
        toast.success(`Selamat datang, ${userData.name}!`);
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
