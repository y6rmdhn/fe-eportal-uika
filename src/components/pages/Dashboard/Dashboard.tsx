import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import auth from "@/services/api/auth.ts";
import { useQuery } from "@tanstack/react-query";
import { LogOut, User, LayoutGrid } from "lucide-react"; // Loader2 dihapus karena tidak perlu loading tiket
import { useLogout } from "@/hooks/Auth/useLogout.ts";

// Tipe data untuk item API
interface PortalItem {
  id: string | number;
  title: string;
  icon: string;
  link: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<PortalItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { handleLogout, isPendingLogout } = useLogout();

  const { data: userResponse, isLoading: isUserLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const result = await auth.getUser();
      return result.data;
    },
  });

  const userData = userResponse?.data;

  const handleBukaAplikasi = (appLink: string) => {
    window.open(appLink, "_blank");
  };

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setTimeout(() => {
        const dummyData: PortalItem[] = [
          {
            id: 1,
            title: "SIAKAD",
            icon: "https://ui-avatars.com/api/?name=SI&background=0ea5e9&color=fff&size=128",
            link: "http://localhost:5174/",
          },
          {
            id: 2,
            title: "SIMPEG",
            icon: "https://ui-avatars.com/api/?name=SP&background=f97316&color=fff&size=128",
            link: "https://simpeg.uika-bogor.ac.id",
          },
          {
            id: 3,
            title: "UCL UIKA",
            icon: "https://ui-avatars.com/api/?name=UC&background=10b981&color=fff&size=128",
            link: "http://localhost:3000/login",
          },
        ];
        setItems(dummyData);
        setIsLoading(false);
      }, 1000);
    };
    fetchItems();
  }, []);

  return (
    <section className="flex items-center justify-center p-4 md:p-8 w-full min-h-screen bg-center bg-no-repeat bg-cover bg-[url('/assets/front-page/assets/img/hero/hero-bg.png')] relative">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-black/80 z-0 backdrop-blur-[6px]"></div>

      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="w-full flex flex-col bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/20 overflow-hidden dark:bg-slate-900/30 dark:border-slate-700/50">
          {/* ── HEADER NAVBAR ── */}
          <div className="px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
                <LayoutGrid size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  E-PORTAL
                </h1>
                <p className="text-xs font-medium text-blue-200/80 uppercase tracking-wider">
                  Universitas Ibn Khaldun
                </p>
              </div>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2.5 rounded-xl border border-white/10 text-white backdrop-blur-md">
                <div className="bg-blue-500/20 p-1 rounded-lg">
                  <User size={16} className="text-blue-300" />
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  {isUserLoading ? "Memuat..." : userData?.name || "Mahasiswa"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isPendingLogout}
                className={`flex items-center gap-2 bg-rose-500/80 hover:bg-rose-500 transition-all text-white px-4 py-2.5 rounded-xl text-sm font-semibold border border-rose-400/30 shadow-[0_0_15px_rgba(244,63,94,0.2)] ${isPendingLogout ? "opacity-50 cursor-not-allowed" : "hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]"}`}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">
                  {isPendingLogout ? "Keluar..." : "Logout"}
                </span>
              </button>
            </div>
          </div>

          {/* ── GREETING SECTION ── */}
          <div className="px-8 pt-10 pb-6 text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-white mb-2">
              Selamat Datang,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-sm">
                {isUserLoading ? "..." : userData?.name || "Mahasiswa"}
              </span>{" "}
              👋
            </h2>
            <p className="text-slate-300 text-base font-medium">
              Pilih layanan sistem informasi terintegrasi yang ingin Anda akses
              hari ini.
            </p>
          </div>

          {/* ── GRID ITEMS SECTION ── */}
          <div className="px-8 pb-10">
            <ScrollArea className="h-[400px] w-full pr-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-2 pb-6">
                {isLoading &&
                  Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10"
                    >
                      <Skeleton className="w-20 h-20 rounded-2xl mb-4 bg-white/10" />
                      <Skeleton className="w-24 h-4 rounded-full bg-white/10" />
                    </div>
                  ))}

                {!isLoading && items.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <LayoutGrid className="text-white/30" size={40} />
                    </div>
                    <p className="text-lg text-white/60 font-medium">
                      Belum ada layanan yang terhubung.
                    </p>
                  </div>
                )}

                {!isLoading &&
                  items.length > 0 &&
                  items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleBukaAplikasi(item.link)}
                      className="group relative flex flex-col items-center justify-center p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-400/50"
                    >
                      <div className="relative w-20 h-20 mb-5 rounded-2xl overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-400/40 transition-colors duration-500"></div>
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="relative w-full h-full object-cover rounded-2xl"
                        />
                      </div>
                      <h5 className="font-bold text-sm text-slate-200 text-center tracking-wide transition-colors group-hover:text-white">
                        {item.title}
                      </h5>
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
