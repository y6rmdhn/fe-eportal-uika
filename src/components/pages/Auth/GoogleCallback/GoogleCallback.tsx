import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import session from "@/utils/session";
import toast from "react-hot-toast";

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Tangkap parameter 'data' dari URL
        const encodedData = searchParams.get("data");

        if (encodedData) {
            try {
                // Buka bungkus Base64-nya
                const decodedString = atob(encodedData);
                const userData = JSON.parse(decodedString);

                // 1. Simpan flag login ke session/localStorage
                session.setSession(userData);

                // 2. Tampilkan pesan sukses
                toast.success(`Selamat datang, ${userData.name}!`);

                // 3. Langsung tendang ke Dashboard
                navigate("/", { replace: true });

            } catch (error) {
                toast.error("Gagal memproses data dari Google.");
                navigate("/login", { replace: true });
            }
        } else {
            // Kalau ngga ada data (mungkin nyasar), balikin ke login
            navigate("/login", { replace: true });
        }
    }, [searchParams, navigate]);

    // Tampilan loading sementara (biasanya cuma kedip sepersekian detik)
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Memproses login Google Anda...</p>
            </div>
        </div>
    );
}