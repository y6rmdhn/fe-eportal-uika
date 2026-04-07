import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import auth from "@/services/api/auth.ts";
import {useMutation, useQuery} from "@tanstack/react-query";
import { LogOut, User } from "lucide-react";
import session from "@/utils/session";
import { useNavigate } from "react-router-dom";
import {useLogout} from "@/hooks/Auth/useLogout.ts";

// Tipe data untuk item API
interface PortalItem {
    id: string | number;
    title: string;
    icon: string;
    link: string;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [items, setItems] = useState<PortalItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { handleLogout, isPendingLogout } = useLogout()

    // Fetch data user dari backend
    const getUserService = async () => {
        const result = await auth.getUser();
        return result.data;
    };

    const { data: userResponse, isLoading: isUserLoading } = useQuery({
        queryKey: ['user'],
        queryFn: getUserService,
    });

    console.log(userResponse)

    // Ambil object user dari response (menyesuaikan struktur JSON kamu)
    const userData = userResponse?.data;

    // TODO: Ambil data user ini dari Context/State Auth kamu (misal: useAuth)
    const getAkunTias = {
        token: "dummy_token",
        npm: "dummy_npm",
        nidn: "dummy_nidn",
        username: "dummy_user",
        email: "dummy@email.com",
        role: "Mahasiswa",
        nip: "dummy_nip",
        nama_lengkap: "Dummy Name",
        image: "dummy.png",
        no_hp: "08123456789",
        imageUrl: "http://dummy.url",
        kode_mhs: "123",
        isverified: "1",
        created_at: "2023-01-01",
    };
    const getUsrTias = { password: "dummy_password" };

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            setTimeout(() => {
                const dummyData: PortalItem[] = [
                    { id: 1, title: "SIAKAD", icon: "https://ui-avatars.com/api/?name=SI&background=0D8ABC&color=fff&size=128", link: "https://siakad.uika-bogor.ac.id/" },
                    { id: 2, title: "SIMPEG", icon: "https://ui-avatars.com/api/?name=SP&background=f97316&color=fff&size=128", link: "https://simpeg.uika-bogor.ac.id/" },
                    { id: 3, title: "UCL UIKA", icon: "https://ui-avatars.com/api/?name=UC&background=10b981&color=fff&size=128", link: "https://ucl.uika-bogor.ac.id/" },
                ];
                setItems(dummyData);
                setIsLoading(false);
            }, 1000);
        };
        fetchItems();
    }, []);

    const buildSsoLink = (baseLink: string) => {
        const endpoint = "oauth/callback";
        const params = new URLSearchParams({
            token: getAkunTias.token,
            npm: getAkunTias.npm,
            nidn: getAkunTias.nidn,
            username: getAkunTias.username,
            email: userData?.email || getAkunTias.email, // Pakai email asli jika ada
            password: getUsrTias.password,
            role: getAkunTias.role,
            nip: getAkunTias.nip,
            nama_lengkap: userData?.name || getAkunTias.nama_lengkap, // Pakai nama asli jika ada
            image: getAkunTias.image,
            no_hp: getAkunTias.no_hp,
            imageUrl: getAkunTias.imageUrl,
            kode_mhs: getAkunTias.kode_mhs,
            isverified: getAkunTias.isverified,
            created_at: getAkunTias.created_at,
        }).toString();

        const cleanBaseLink = baseLink.endsWith('/') ? baseLink : `${baseLink}/`;
        return `${cleanBaseLink}${endpoint}?${params}`;
    };

    return (
        <section className="flex items-center justify-center p-4 md:p-8 w-full min-h-screen bg-center bg-no-repeat bg-cover bg-[url('/assets/front-page/assets/img/hero/hero-bg.png')] relative">
            {/* Overlay gelap agar background tidak bertabrakan dengan Card */}
            <div className="absolute inset-0 w-full h-full bg-slate-900/60 z-0 backdrop-blur-sm"></div>

            <div className="container relative z-10 mx-auto max-w-6xl">
                {/* Main Card Wrapper dengan efek Glassmorphism */}
                <div className="w-full flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden dark:bg-slate-900/95 dark:border-slate-700/50">

                    {/* --- HEADER NAVBAR --- */}
                    <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="font-bold text-lg">UI</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-wide">E-PORTAL UIKA</h1>
                                <p className="text-xs text-slate-400">Single Sign-On Authentication</p>
                            </div>
                        </div>

                        {/* User Profile & Logout */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                                <User size={16} className="text-blue-400" />
                                <span className="text-sm font-medium">
                                    {isUserLoading ? "Memuat data..." : userData?.name || "Mahasiswa"}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isPendingLogout}
                                className={`flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white px-4 py-2 rounded-full text-sm font-medium shadow-md ${isPendingLogout ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">
                                    {isPendingLogout ? "Keluar..." : "Logout"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* --- GREETING SECTION --- */}
                    <div className="px-8 pt-8 pb-4 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                            Selamat Datang, <span className="text-blue-600 dark:text-blue-400">{userData?.name || "..."}</span> 👋
                        </h2>
                        <p className="text-slate-500 mt-2 dark:text-slate-400">
                            Pilih layanan sistem informasi yang ingin Anda akses di bawah ini.
                        </p>
                    </div>

                    {/* --- GRID ITEMS SECTION --- */}
                    <div className="px-4 pb-8">
                        <ScrollArea className="h-[450px] w-full rounded-xl bg-slate-50/50 dark:bg-slate-800/20 p-4 border border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 p-2">

                                {/* 1. STATE LOADING (Skeleton) */}
                                {isLoading &&
                                    Array.from({ length: 10 }).map((_, idx) => (
                                        <div key={idx} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                            <Skeleton className="w-20 h-20 rounded-2xl mb-4" />
                                            <Skeleton className="w-20 h-4" />
                                        </div>
                                    ))}

                                {/* 2. STATE KOSONG */}
                                {!isLoading && items.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                        <p className="text-lg">Tidak ada layanan yang tersedia.</p>
                                    </div>
                                )}

                                {/* 3. STATE SUKSES (Menampilkan Item) */}
                                {!isLoading &&
                                    items.length > 0 &&
                                    items.map((item, index) => (
                                        <a
                                            key={index}
                                            href={buildSsoLink(item.link)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-blue-500 z-10"
                                        >
                                            <div className="w-20 h-20 mb-4 rounded-2xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
                                                <img
                                                    src={item.icon}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h5 className="font-semibold text-sm text-slate-700 text-center transition-colors group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400">
                                                {item.title}
                                            </h5>
                                        </a>
                                    ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </section>
    );
}