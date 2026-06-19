import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import auth from "@/services/api/auth.ts";
import { useQuery } from "@tanstack/react-query";
import {
  LogOut,
  LayoutGrid,
  ArrowRight,
  UserCircle,
  LayoutDashboard,
  Shield,
  Globe,
  ExternalLink,
} from "lucide-react";
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
import { useLoaderData } from "react-router-dom";

const LOGO = "/img/LOGO_UIKA_Terbaru2 (2).png";

/** Palet warna gradient untuk kartu modul (bergiliran berdasarkan index) */
const MODULE_GRADIENTS = [
  { from: "#059669", to: "#047857", shadow: "rgba(5,150,105,0.25)" },
  { from: "#0284c7", to: "#0369a1", shadow: "rgba(2,132,199,0.25)" },
  { from: "#ea580c", to: "#c2410c", shadow: "rgba(234,88,12,0.25)" },
  { from: "#7c3aed", to: "#6d28d9", shadow: "rgba(124,58,237,0.25)" },
  { from: "#db2777", to: "#be185d", shadow: "rgba(219,39,119,0.25)" },
  { from: "#d97706", to: "#b45309", shadow: "rgba(217,119,6,0.25)" },
  { from: "#0891b2", to: "#0e7490", shadow: "rgba(8,145,178,0.25)" },
  { from: "#65a30d", to: "#4d7c0f", shadow: "rgba(101,163,13,0.25)" },
];

/** Buat singkatan dari nama modul (maks 2 kata) */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Warna role badge */
function getRoleBadge(role?: string) {
  if (!role) return { bg: "bg-gray-100", text: "text-gray-600", label: "User" };
  const r = role.toLowerCase();
  if (r.includes("admin"))
    return { bg: "bg-rose-50", text: "text-rose-700", label: role };
  if (r.includes("dosen"))
    return { bg: "bg-blue-50", text: "text-blue-700", label: role };
  if (r.includes("mahasiswa"))
    return { bg: "bg-emerald-50", text: "text-emerald-700", label: role };
  return { bg: "bg-purple-50", text: "text-purple-700", label: role };
}

interface AppModule {
  id: number;
  name: string;
  url: string;
}

interface MyModulesResponse {
  is_admin: boolean;
  role: string;
  modules: AppModule[];
}

export default function Dashboard() {
  const [loadingApp, setLoadingApp] = useState<number | null>(null);
  const { handleLogout, isPendingLogout } = useLogout();
  const navigate = useNavigate();

  const userData = useLoaderData() as any;
  const isUserLoading = false;

  // ── Fetch modul sesuai role/permission user yang login ──────────────────────
  const { data: modulesResponse, isLoading: isModulesLoading } = useQuery({
    queryKey: ["my-modules"],
    queryFn: async () => {
      const result = await auth.getMyModules();
      return result.data?.data as MyModulesResponse;
    },
    staleTime: 1000 * 60 * 5, // cache 5 menit
  });

  const modules = modulesResponse?.modules ?? [];
  const isAdmin = modulesResponse?.is_admin ?? false;
  const isLoading = isModulesLoading || isUserLoading;
  const roleBadge = getRoleBadge(userData?.role);

  console.log("modulesResponse:", modulesResponse);
  console.log("isAdmin:", isAdmin);
  console.log("userData:", userData);

  // ── Buka aplikasi via SSO redirect ─────────────────────────────────────────
  const handleOpenApp = async (mod: AppModule) => {
    await proceedRedirect(mod, userData?.role_id ?? "1");
  };

  const proceedRedirect = async (mod: AppModule, roleId: string | number) => {
    setLoadingApp(mod.id);
    try {
      const response = await network.get("/sso/redirect", {
        params: {
          target_url: mod.url,
          appModule_id: mod.id,
          role_id: roleId,
        },
        withCredentials: true,
      });

      console.log(response.data);

      window.location.href = response.data.redirect_url;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Sesi kamu sudah habis, silakan login ulang.");
      } else {
        // Jika SSO tidak dikonfigurasi, buka URL langsung
        window.open(mod.url, "_blank");
      }
    } finally {
      setLoadingApp(null);
    }
  };

  return (
    <section className="flex items-center justify-center p-4 sm:p-6 h-screen w-screen bg-[#f8faf9] relative overflow-hidden">
      {/* ── Decorative blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-emerald-100 rounded-full blur-[130px] opacity-60" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-teal-100 rounded-full blur-[110px] opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/40 rounded-full blur-[80px]" />
      </div>

      {/* ── Main Container ── */}
      <div className="relative z-10 w-full max-w-6xl h-full max-h-[760px] flex flex-col">
        <div className="w-full h-full flex flex-col bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.10)] border border-white overflow-hidden">
          {/* ═══ HEADER ═══════════════════════════════════════════════════════ */}
          <div className="px-6 sm:px-8 py-4 flex justify-between items-center border-b border-gray-100/80 bg-white/60 backdrop-blur-sm shrink-0">
            {/* Logo + title */}
            <a
              href="/"
              className="flex items-center gap-3.5 hover:opacity-90 transition-opacity"
            >
              <img
                src={LOGO}
                alt="Logo UIKA"
                className="h-10 w-auto object-contain drop-shadow-sm"
              />
              <div>
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.2em] leading-none">
                  Universitas Ibn Khaldun
                </p>
                <h1 className="text-xl font-extrabold tracking-tight text-gray-900 leading-tight mt-0.5">
                  E-PORTAL{" "}
                  <span className="text-emerald-500 font-black">SSO</span>
                </h1>
              </div>
            </a>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 bg-gray-50/80 hover:bg-gray-100/80 px-3 py-2 rounded-2xl border border-gray-100 transition-all hover:shadow-sm">
                  <Avatar className="h-8 w-8 rounded-full ring-2 ring-emerald-100">
                    <AvatarImage
                      src={userData?.image}
                      alt={userData?.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-emerald-600 text-white font-extrabold text-sm">
                      {userData?.name?.charAt(0).toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-bold text-gray-800 leading-none truncate max-w-[140px]">
                      {isUserLoading
                        ? "Memuat..."
                        : (userData?.name ?? "Pengguna")}
                    </span>
                    <span
                      className={`text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.text}`}
                    >
                      {roleBadge.label}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl border-gray-100 shadow-xl p-1"
              >
                <DropdownMenuLabel className="px-3 py-2.5">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {userData?.name}
                  </p>
                  <p className="text-xs text-gray-400 font-normal truncate mt-0.5">
                    {userData?.email}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded-full ${roleBadge.bg} ${roleBadge.text}`}
                  >
                    {roleBadge.label}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="gap-2 cursor-pointer rounded-xl mx-0.5 font-medium text-gray-700"
                >
                  <UserCircle size={15} /> Profile Saya
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate("/admin")}
                      className="gap-2 cursor-pointer rounded-xl mx-0.5 font-medium text-emerald-700 focus:text-emerald-700 focus:bg-emerald-50"
                    >
                      <LayoutDashboard size={15} /> Dashboard Admin
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isPendingLogout}
                  className="gap-2 cursor-pointer rounded-xl mx-0.5 mb-0.5 font-medium text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                >
                  <LogOut size={15} />{" "}
                  {isPendingLogout ? "Keluar..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ═══ GREETING ══════════════════════════════════════════════════════ */}
          <div className="px-6 sm:px-8 pt-8 pb-5 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-600 mb-1 flex items-center gap-1.5">
                  <Globe size={13} strokeWidth={2.5} />
                  Single Sign-On Portal
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  Selamat Datang,{" "}
                  <span className="text-emerald-600">
                    {isUserLoading
                      ? "..."
                      : (userData?.name?.split(" ")[0] ?? "Anda")}
                  </span>{" "}
                  👋
                </h2>
                <p className="text-gray-500 text-sm mt-2 font-medium max-w-lg leading-relaxed">
                  {isAdmin
                    ? "Sebagai admin, kamu dapat mengakses seluruh sistem informasi yang tersedia."
                    : "Pilih aplikasi di bawah untuk mengaksesnya dengan satu klik. Akses disesuaikan dengan hak yang kamu miliki."}
                </p>
              </div>

              {/* Badge info modul */}
              {!isLoading && (
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-end">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700">
                    <LayoutGrid size={12} strokeWidth={2.5} />
                    {modules.length} Aplikasi
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-700">
                      <Shield size={12} strokeWidth={2.5} />
                      Admin
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ═══ GRID MODUL ════════════════════════════════════════════════════ */}
          <div className="flex-1 overflow-hidden px-6 sm:px-8 pb-8">
            <ScrollArea className="h-full w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-1 pb-6">
                {/* ── Loading Skeleton ── */}
                {isLoading &&
                  Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center p-6 bg-gray-50 rounded-3xl border border-gray-100"
                    >
                      <Skeleton className="w-[72px] h-[72px] rounded-2xl mb-4 bg-gray-200" />
                      <Skeleton className="w-20 h-3.5 rounded-full bg-gray-200 mb-2" />
                      <Skeleton className="w-14 h-2.5 rounded-full bg-gray-100" />
                    </div>
                  ))}

                {/* ── Empty State ── */}
                {!isLoading && modules.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm border border-gray-100">
                      <LayoutGrid className="text-gray-300" size={30} />
                    </div>
                    <p className="text-gray-600 font-bold text-base mb-1">
                      Tidak ada aplikasi tersedia
                    </p>
                    <p className="text-gray-400 text-sm text-center max-w-xs">
                      Akunmu belum memiliki akses ke aplikasi manapun. Hubungi
                      administrator.
                    </p>
                  </div>
                )}

                {/* ── Module Cards ── */}
                {!isLoading &&
                  modules.map((mod, idx) => {
                    const gradient =
                      MODULE_GRADIENTS[idx % MODULE_GRADIENTS.length];
                    const isOpening = loadingApp === mod.id;
                    const initials = getInitials(mod.name);

                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleOpenApp(mod)}
                        disabled={isOpening}
                        title={mod.name}
                        className={`group relative flex flex-col items-center text-center p-5 sm:p-6 bg-white rounded-3xl border border-gray-100/80
                          transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_-10px_var(--mod-shadow)]
                          hover:border-transparent overflow-hidden
                          ${isOpening ? "opacity-70 cursor-wait scale-95" : "cursor-pointer hover:scale-[1.02]"}`}
                        style={
                          {
                            "--mod-shadow": gradient.shadow,
                          } as React.CSSProperties
                        }
                      >
                        {/* Hover glow overlay */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl"
                          style={{
                            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                          }}
                        />

                        {/* Icon box */}
                        <div
                          className="relative w-[72px] h-[72px] mb-4 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-2deg]"
                          style={{
                            background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                            boxShadow: `0 8px 24px -6px ${gradient.shadow}`,
                          }}
                        >
                          {initials}
                          {/* Loading spinner overlay */}
                          {isOpening && (
                            <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <h5 className="font-extrabold text-[14px] text-gray-900 tracking-tight leading-tight mb-1 group-hover:text-gray-800 transition-colors line-clamp-2">
                          {mod.name}
                        </h5>

                        {/* URL hint */}
                        <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                          <ExternalLink size={9} /> Buka Aplikasi
                        </p>

                        {/* Arrow indicator */}
                        <div className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                          {!isOpening && (
                            <div
                              className="rounded-full p-1.5 text-white"
                              style={{
                                background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                              }}
                            >
                              <ArrowRight size={11} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>

          {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
          <div className="shrink-0 px-8 py-3 border-t border-gray-100/80 bg-white/50 flex items-center justify-between">
            <p className="text-[11px] text-gray-400 font-medium">
              © {new Date().getFullYear()} Universitas Ibn Khaldun Bogor —
              E-Portal SSO
            </p>
            {!isLoading && (
              <p className="text-[11px] text-gray-400 font-medium">
                {modules.length} dari {isAdmin ? "semua" : "hak akses kamu"}{" "}
                tersedia
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
