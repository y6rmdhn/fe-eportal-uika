import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, Users, Sparkles } from "lucide-react";
import auth from "@/services/api/auth.ts";
import { Skeleton } from "@/components/ui/skeleton";

const BASE_URL = import.meta.env.BASE_URL;
const LOGO = `${BASE_URL}img/LOGO_UIKA_Terbaru2 (2).png`;

interface Contributor {
  id: number;
  name: string;
  type: "dosen" | "mahasiswa";
  angkatan: string | null;
  contribution: string | null;
  photo: string | null;
  app_module?: { id: number; name: string } | null;
}

interface AboutUsResponse {
  settings: {
    title: string;
    description: string | null;
    banner_photo: string | null;
  };
  contributors: Contributor[];
}

export default function AboutUsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["about-us-public"],
    queryFn: async () => {
      const res = await auth.getAboutUs();
      return res.data?.data as AboutUsResponse;
    },
    staleTime: 1000 * 60 * 5,
  });

  const settings = data?.settings;

  const dosen = useMemo(
    () => (data?.contributors ?? []).filter((c) => c.type === "dosen"),
    [data],
  );
  const mahasiswa = useMemo(
    () => (data?.contributors ?? []).filter((c) => c.type === "mahasiswa"),
    [data],
  );

  const ContributorCard = ({ c }: { c: Contributor }) => (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-emerald-50 border border-emerald-100 flex items-center justify-center">
        {c.photo ? (
          <img
            src={c.photo}
            alt={c.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-extrabold text-emerald-700">
            {c.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-sm text-gray-900 truncate">
          {c.name}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          {c.angkatan && (
            <span className="text-[11px] font-semibold text-gray-400">
              Angkatan {c.angkatan}
            </span>
          )}
        </div>
        {c.contribution && (
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5 truncate">
            {c.contribution}
          </p>
        )}
        {c.app_module?.name && (
          <p className="text-[10px] text-gray-400 font-medium truncate">
            {c.app_module.name}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <section className="flex items-center justify-center p-4 sm:p-6 min-h-screen w-screen bg-[#f8faf9] relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-emerald-100 rounded-full blur-[130px] opacity-60" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-teal-100 rounded-full blur-[110px] opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col my-6">
        <div className="w-full flex flex-col bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.10)] border border-white overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 py-4 flex items-center gap-3.5 border-b border-gray-100/80 bg-white/60 backdrop-blur-sm">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Kembali ke dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <img
              src={LOGO}
              alt="Logo UIKA"
              className="h-9 w-auto object-contain drop-shadow-sm"
            />
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.2em] leading-none">
                Universitas Ibn Khaldun
              </p>
              <h1 className="text-lg font-extrabold tracking-tight text-gray-900 leading-tight mt-0.5">
                E-PORTAL <span className="text-emerald-500">SSO</span>
              </h1>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="w-full h-40 rounded-2xl bg-gray-100" />
              <Skeleton className="w-2/3 h-6 rounded-full bg-gray-100" />
              <Skeleton className="w-full h-20 rounded-2xl bg-gray-100" />
            </div>
          ) : (
            <>
              {/* Banner */}
              {settings?.banner_photo && (
                <img
                  src={settings.banner_photo}
                  alt="Banner About Us"
                  className="w-full h-48 sm:h-64 object-cover"
                />
              )}

              {/* Konten */}
              <div className="px-6 sm:px-8 pt-8 pb-4">
                <p className="text-sm font-semibold text-emerald-600 mb-1 flex items-center gap-1.5">
                  <Sparkles size={13} strokeWidth={2.5} />
                  Tentang Kami
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
                  {settings?.title || "Tentang Kami"}
                </h2>
                {settings?.description && (
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line max-w-3xl">
                    {settings.description}
                  </p>
                )}
              </div>

              {/* Dosen */}
              {dosen.length > 0 && (
                <div className="px-6 sm:px-8 pb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <GraduationCap size={16} className="text-blue-600" />
                    </div>
                    <h3 className="text-sm font-extrabold text-gray-900">
                      Dosen
                    </h3>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100">
                      {dosen.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dosen.map((c) => (
                      <ContributorCard key={c.id} c={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* Mahasiswa */}
              {mahasiswa.length > 0 && (
                <div className="px-6 sm:px-8 pb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-emerald-50 rounded-lg">
                      <Users size={16} className="text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-extrabold text-gray-900">
                      Mahasiswa
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-100">
                      {mahasiswa.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mahasiswa.map((c) => (
                      <ContributorCard key={c.id} c={c} />
                    ))}
                  </div>
                </div>
              )}

              {dosen.length === 0 && mahasiswa.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-8">
                  <Users size={36} className="text-gray-200 mb-3" />
                  <p className="font-bold text-gray-500 text-sm">
                    Belum ada kontributor yang ditambahkan.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
