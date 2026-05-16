import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Controller } from "react-hook-form";
import {
  KeyRound,
  Eye,
  EyeOff,
  UserCircle,
  Camera,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react"; // <-- Tambah ArrowLeft
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Tambah useNavigate
import useProfile from "@/hooks/Profile/useProfile";
import useUpdateProfile from "@/hooks/Profile/useUpdateProfile";
import useChangePassword from "@/hooks/Profile/useChangePassword";
import type { Preview } from "@/types/general.type";
import { getImageData } from "@/lib/utils";

const Profile = () => {
  const navigate = useNavigate(); // <-- Inisialisasi navigate
  const { dataProfile, isLoadingProfile } = useProfile();
  const {
    form: profileForm,
    isPending: isPendingProfile,
    handleUpdateProfile,
  } = useUpdateProfile();
  const {
    form: passwordForm,
    isPending: isPendingPassword,
    handleChangePassword,
  } = useChangePassword();

  const [preview, setPreview] = useState<Preview | undefined>(undefined);
  const [show, setShow] = useState({
    current: false,
    password: false,
    confirm: false,
  });

  const toggle = (field: "current" | "password" | "confirm") =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  useEffect(() => {
    if (dataProfile) {
      profileForm.reset({
        phone: dataProfile.phone ? String(dataProfile.phone) : "",
        location: dataProfile.location ?? "",
        about_me: dataProfile.about_me ?? "",
        image: undefined,
      });
      if (dataProfile.image) {
        setPreview({ file: undefined, displayUrl: dataProfile.image });
      }
    }
  }, [dataProfile]);

  return (
    <div className="w-full max-w-[1100px] mx-auto pb-12 pt-4 sm:pt-6 animate-in fade-in duration-500 font-sans px-4 sm:px-0">
      {/* ── TOMBOL KEMBALI ── */}
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="mb-4 sm:mb-5 flex items-center gap-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl px-4 py-2 transition-colors w-fit"
      >
        <ArrowLeft size={18} strokeWidth={2.5} />
        <span className="font-bold text-sm tracking-wide">
          Kembali ke Dashboard
        </span>
      </Button>

      {/* ── HEADER HALAMAN ── */}
      <div className="flex items-center gap-5 bg-white p-6 sm:px-8 sm:py-7 rounded-[2rem] border border-gray-100 shadow-sm mb-8">
        <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100">
          <UserCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Pengaturan Akun
          </h1>
          <p className="text-[14px] font-medium text-gray-500 mt-1">
            Kelola informasi profil pribadi dan tingkatkan keamanan akun
            E-Portal Anda.
          </p>
        </div>
      </div>

      {/* ── KONTEN DUA KOLOM ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================
            KOLOM KIRI: FORM UPDATE PROFILE 
            ========================================= */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Informasi Profil
          </h2>

          {isLoadingProfile ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner className="text-emerald-600 w-8 h-8" />
              <span className="text-sm font-medium text-gray-500">
                Memuat data profil...
              </span>
            </div>
          ) : (
            <form
              onSubmit={profileForm.handleSubmit(handleUpdateProfile)}
              className="space-y-7"
            >
              {/* ── INFO AKADEMIK ── */}
              <div className="p-6 bg-[#f8faf9] rounded-2xl border border-emerald-100/50">
                <div className="flex items-center gap-2 mb-5">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    Data Akademik & Sistem
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs font-semibold mb-1">
                      Nama Lengkap
                    </p>
                    <p className="font-extrabold text-gray-900 truncate">
                      {dataProfile?.name ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold mb-1">
                      Alamat Email
                    </p>
                    <p className="font-extrabold text-gray-900 truncate">
                      {dataProfile?.email ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold mb-1">
                      Role Akses
                    </p>
                    <p className="font-bold text-emerald-700 capitalize inline-flex px-2.5 py-0.5 bg-emerald-100 rounded-md text-xs mt-0.5">
                      {dataProfile?.role ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold mb-1">
                      NIM/NIP/NIDN
                    </p>
                    <p className="font-mono font-bold text-gray-900">
                      {dataProfile?.npm ||
                        dataProfile?.nip ||
                        dataProfile?.nidn ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── FOTO PROFIL UPLOAD ── */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700">
                  Foto Profil
                </Label>
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 rounded-full border-2 border-emerald-50 shadow-sm">
                    <AvatarImage
                      src={preview?.displayUrl}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-emerald-50 text-emerald-600 font-extrabold text-2xl">
                      {dataProfile?.name?.charAt(0).toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>

                  <Controller
                    name="image"
                    control={profileForm.control}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-1.5">
                        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm text-sm font-bold text-gray-700">
                          <Camera size={16} />
                          Ubah Foto
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(event) => {
                              const { file, displayUrl } = getImageData(event);
                              if (file) {
                                field.onChange(file);
                                setPreview({ file, displayUrl });
                              }
                            }}
                          />
                        </label>
                        <span className="text-[11px] text-gray-400 font-medium ml-1">
                          Format: JPG, PNG. Maks 2MB.
                        </span>
                        {fieldState.error && (
                          <p className="text-xs text-rose-500 font-medium ml-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* ── INPUT NO HP ── */}
              <Controller
                name="phone"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">
                      Nomor Handphone
                    </Label>
                    <Input
                      {...field}
                      placeholder="Contoh: 08123456789"
                      className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 px-4"
                    />
                    {fieldState.error && (
                      <p className="text-xs text-rose-500 font-medium">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* ── INPUT LOKASI ── */}
              <Controller
                name="location"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">
                      Lokasi / Alamat
                    </Label>
                    <Input
                      {...field}
                      placeholder="Kota atau alamat domisili"
                      className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 px-4"
                    />
                    {fieldState.error && (
                      <p className="text-xs text-rose-500 font-medium">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* ── INPUT ABOUT ME ── */}
              <Controller
                name="about_me"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">
                      Tentang Saya (Bio)
                    </Label>
                    <textarea
                      {...field}
                      placeholder="Ceritakan sedikit tentang dirimu..."
                      className="w-full min-h-[100px] px-4 py-3 text-sm bg-gray-50/50 border border-gray-200 rounded-xl resize-none focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    />
                    {fieldState.error && (
                      <p className="text-xs text-rose-500 font-medium">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* TOMBOL SIMPAN PROFIL */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isPendingProfile}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/10 transition-all text-[15px]"
                >
                  {isPendingProfile ? (
                    <Spinner className="w-5 h-5 text-white" />
                  ) : (
                    "Simpan Perubahan Profil"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* =========================================
            KOLOM KANAN: FORM UBAH PASSWORD
            ========================================= */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm sticky top-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
              <KeyRound size={20} className="text-rose-600" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Keamanan & Password
            </h2>
          </div>

          <form
            onSubmit={passwordForm.handleSubmit(handleChangePassword)}
            className="space-y-6"
          >
            {[
              {
                name: "current_password" as const,
                label: "Password Lama",
                key: "current",
                placeholder: "Masukkan password lama",
              },
              {
                name: "password" as const,
                label: "Password Baru",
                key: "password",
                placeholder: "Minimal 8 karakter",
              },
              {
                name: "password_confirmation" as const,
                label: "Konfirmasi Password Baru",
                key: "confirm",
                placeholder: "Ketik ulang password baru",
              },
            ].map(({ name, label, key, placeholder }) => (
              <Controller
                key={name}
                name={name}
                control={passwordForm.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">
                      {label}
                    </Label>
                    <div className="relative">
                      <Input
                        {...field}
                        type={
                          show[key as keyof typeof show] ? "text" : "password"
                        }
                        placeholder={placeholder}
                        className="h-12 pr-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-rose-500 focus:ring-rose-500/20 px-4 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          toggle(key as "current" | "password" | "confirm")
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors bg-transparent border-none p-1.5"
                      >
                        {show[key as keyof typeof show] ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {fieldState.error && (
                      <p className="text-xs text-rose-500 font-medium">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            ))}

            <div className="pt-6">
              <Button
                type="submit"
                disabled={isPendingPassword}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-md shadow-gray-900/10 transition-all text-[15px]"
              >
                {isPendingPassword ? (
                  <Spinner className="w-5 h-5 text-white" />
                ) : (
                  "Perbarui Password"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
