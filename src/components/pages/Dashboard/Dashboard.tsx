import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import auth from "@/services/api/auth.ts";
import { useQuery } from "@tanstack/react-query";
import { LogOut, LayoutGrid, ArrowRight, UserCircle } from "lucide-react";
import { useLogout } from "@/hooks/Auth/useLogout.ts";
import toast from "react-hot-toast";
import network from "@/utils/network";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

// ASSET LOGO UIKA
const LOGO = "/img/LOGO_UIKA_Terbaru2 (2).png";

interface PortalItem {
  id: string | number;
  title: string;
  icon: string;
  link: string;
  needsSso?: boolean;
  role_id?: string;
  appModule_id?: string;
  unit_id?: string;
  description?: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<PortalItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingApp, setLoadingApp] = useState<string | number | null>(null);
  const { handleLogout, isPendingLogout } = useLogout();

  const navigate = useNavigate();

  const { data: userResponse, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const result = await auth.getUser();
      return result.data;
    },
  });

  const userData = userResponse?.data;

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setTimeout(() => {
        const dummyData: PortalItem[] = [
          {
            id: 1,
            title: "SIAKAD",
            description: "Sistem Informasi Akademik",
            icon: "https://ui-avatars.com/api/?name=SI&background=059669&color=fff&size=128&bold=true",
            link: "http://localhost:5174/login",
            needsSso: true,
            role_id: "1",
            appModule_id: "1",
            unit_id: "1",
          },
          {
            id: 2,
            title: "SIMPEG",
            description: "Sistem Kepegawaian",
            icon: "https://ui-avatars.com/api/?name=SP&background=0284c7&color=fff&size=128&bold=true",
            link: "http://localhost:5174/login",
            needsSso: true,
            role_id: "1",
            appModule_id: "2",
          },
          {
            id: 3,
            title: "UCL UIKA",
            description: "E-Learning System",
            icon: "https://ui-avatars.com/api/?name=UC&background=ea580c&color=fff&size=128&bold=true",
            link: "http://localhost:3000/login",
            needsSso: true,
            role_id: "1",
            appModule_id: "3",
          },
        ];
        setItems(dummyData);
        setIsLoading(false);
      }, 1000);
    };
    fetchItems();
  }, []);

  const handleBukaAplikasi = async (item: PortalItem) => {
    if (!item.needsSso) {
      window.open(item.link, "_blank");
      return;
    }

    setLoadingApp(item.id);
    try {
      const response = await network.get("/sso/redirect", {
        params: {
          target_url: item.link,
          role_id: item.role_id,
          appModule_id: item.appModule_id,
        },
        withCredentials: true,
      });

      const { redirect_url } = response.data;
      window.location.href = redirect_url;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Sesi kamu sudah habis, silakan login ulang.");
      } else {
        toast.error("Gagal membuka aplikasi, coba lagi.");
      }
    } finally {
      setLoadingApp(null);
    }
  };

  return (
    // 1. Dibuat jadi h-screen w-screen overflow-hidden biar nggak bisa di-scroll bodynya
    <section className="flex items-center justify-center p-4 sm:p-6 h-screen w-screen bg-[#fbfcfb] relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px]" />
      </div>

      {/* Main Container - Dibatasi max-height nya biar selalu pas di tengah */}
      <div className="relative z-10 w-full max-w-6xl h-full max-h-[720px] flex flex-col">
        {/* Main Card - Dibuat flex col biar dalamnya bisa bagi proporsi */}
        <div className="w-full h-full flex flex-col bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
          {/* ── HEADER (shrink-0 biar ukurannya tetep) ── */}
          <div className="px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-50 bg-white/50 backdrop-blur-sm shrink-0">
            {/* 2. Logo UIKA dan Title */}
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="inline-block hover:scale-105 transition-transform"
              >
                <img
                  src={LOGO}
                  alt="Logo UIKA"
                  className="h-12 w-auto object-contain drop-shadow-sm"
                />
              </a>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-tight">
                  E-PORTAL
                </h1>
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                  Universitas Ibn Khaldun
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <Avatar className="h-8 w-8 rounded-full border-2 border-emerald-50 shadow-sm">
                      <AvatarImage
                        src={userData?.image}
                        alt={userData?.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-emerald-50 text-emerald-600 font-extrabold text-sm">
                        {userData?.name?.charAt(0).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-bold text-gray-700 tracking-wide truncate max-w-[150px] hidden sm:block">
                      {isUserLoading
                        ? "Memuat..."
                        : userData?.name || "Pengguna"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 rounded-xl border-gray-100 shadow-lg"
                >
                  <DropdownMenuLabel className="flex flex-col gap-0.5 px-3 py-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {userData?.name}
                    </span>
                    <span className="text-xs text-gray-400 font-normal">
                      {userData?.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="gap-2 cursor-pointer rounded-lg mx-1 font-medium text-gray-700"
                  >
                    <UserCircle size={15} />
                    Profile Saya
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isPendingLogout}
                    className="gap-2 cursor-pointer rounded-lg mx-1 mb-1 font-medium text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                  >
                    <LogOut size={15} />
                    {isPendingLogout ? "Keluar..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ── GREETING SECTION (shrink-0 biar ukurannya tetep) ── */}
          <div className="px-8 pt-10 pb-6 text-center sm:text-left shrink-0">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2.5 tracking-tight">
              Selamat Datang,{" "}
              <span className="text-emerald-600">
                {isUserLoading ? "..." : userData?.name || "Mahasiswa"}
              </span>{" "}
              👋
            </h2>
            <p className="text-gray-500 text-[15px] max-w-xl mx-auto sm:mx-0 leading-relaxed font-medium">
              Akses semua layanan sistem informasi terintegrasi Universitas Ibn
              Khaldun Bogor dengan satu klik dari dashboard Anda.
            </p>
          </div>

          {/* ── GRID APLIKASI (flex-1 biar mengisi sisa ruang yang ada) ── */}
          {/* Cuma area kotak kecil ini yang bisa discroll KALAU datanya banyak banget */}
          <div className="flex-1 overflow-hidden px-8 pb-8">
            <ScrollArea className="h-full w-full pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pt-2 pb-6">
                {/* Loading State */}
                {isLoading &&
                  Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm"
                    >
                      <Skeleton className="w-20 h-20 rounded-2xl mb-4 bg-gray-100" />
                      <Skeleton className="w-24 h-4 rounded-full bg-gray-100 mb-2" />
                      <Skeleton className="w-16 h-3 rounded-full bg-gray-50" />
                    </div>
                  ))}

                {/* Empty State */}
                {!isLoading && items.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                      <LayoutGrid className="text-gray-300" size={32} />
                    </div>
                    <p className="text-gray-500 font-semibold">
                      Belum ada layanan yang tersedia.
                    </p>
                  </div>
                )}

                {/* Data Items */}
                {!isLoading &&
                  items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleBukaAplikasi(item)}
                      disabled={loadingApp === item.id}
                      className={`group relative flex flex-col items-center text-center p-6 bg-white hover:bg-emerald-50/30 rounded-3xl border border-gray-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.15)] hover:border-emerald-200 ${loadingApp === item.id ? "opacity-60 cursor-wait" : ""}`}
                    >
                      {/* Icon Box */}
                      <div className="relative w-[84px] h-[84px] mb-5 rounded-[1.25rem] overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="relative w-full h-full object-cover"
                        />
                        {/* Overlay loading spinner area */}
                        {loadingApp === item.id && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Text */}
                      <h5 className="font-extrabold text-[15px] text-gray-900 tracking-tight mb-1 group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-gray-500 font-medium leading-snug px-2 line-clamp-2">
                        {item.description || "Klik untuk membuka"}
                      </p>

                      {/* Hover Arrow Indicator */}
                      <div className="absolute bottom-4 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        {loadingApp !== item.id && (
                          <div className="bg-emerald-100 text-emerald-600 rounded-full p-1.5">
                            <ArrowRight size={14} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </section>
  );
}
