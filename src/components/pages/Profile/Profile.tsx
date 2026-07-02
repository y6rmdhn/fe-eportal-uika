import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Controller } from "react-hook-form";
import {
  KeyRound,
  Eye,
  EyeOff,
  UserCircle,
  ShieldCheck,
  ArrowLeft,
  MapPin,
  Users,
  Heart,
  Briefcase,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProfile from "@/hooks/Profile/useProfile";
import useUpdateProfile from "@/hooks/Profile/useUpdateProfile";
import useChangePassword from "@/hooks/Profile/useChangePassword";
import type { Preview } from "@/types/general.type";

type Tab = "kependudukan" | "alamat" | "keluarga" | "wali" | "lainnya";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "kependudukan",
    label: "Kependudukan",
    icon: <ShieldCheck size={15} />,
  },
  { key: "alamat", label: "Alamat & Kontak", icon: <MapPin size={15} /> },
  { key: "keluarga", label: "Keluarga", icon: <Heart size={15} /> },
  { key: "wali", label: "Wali", icon: <Users size={15} /> },
  { key: "lainnya", label: "Lainnya", icon: <Briefcase size={15} /> },
];

// ── Field Component (di luar Profile agar tidak re-create saat render) ──
const Field = ({
  name,
  label,
  type = "text",
  placeholder = "",
  control,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  control: any;
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <div className="space-y-1.5">
        <Label className="text-sm font-bold text-gray-700">{label}</Label>
        <Input
          {...field}
          type={type}
          placeholder={placeholder || label}
          className="h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 px-4"
          value={field.value ?? ""}
        />
        {fieldState.error && (
          <p className="text-xs text-rose-500 font-medium">
            {fieldState.error.message}
          </p>
        )}
      </div>
    )}
  />
);

// ── SelectField Component ──
const SelectField = ({
  name,
  label,
  options,
  control,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  control: any;
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <div className="space-y-1.5">
        <Label className="text-sm font-bold text-gray-700">{label}</Label>
        <select
          {...field}
          value={field.value ?? ""}
          className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-emerald-500 focus:outline-none bg-gray-50/50"
        >
          <option value="">Pilih</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )}
  />
);

const Profile = () => {
  const navigate = useNavigate();
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

  const [_, setPreview] = useState<Preview | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<Tab>("kependudukan");
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
        nama_lengkap: dataProfile.nama_lengkap ?? "",
        nik: dataProfile.nik ?? "",
        jenkel: dataProfile.jenkel ?? "",
        tanggal_lahir: dataProfile.tanggal_lahir ?? "",
        tempat_lahir: dataProfile.tempat_lahir ?? "",
        ibu_kandung: dataProfile.ibu_kandung ?? "",
        agama: dataProfile.agama ?? "",
        warga_negara: dataProfile.warga_negara ?? "",
        no_hp: dataProfile.no_hp ?? "",
        alamat: dataProfile.alamat ?? "",
        rt: dataProfile.rt ? String(dataProfile.rt) : "",
        rw: dataProfile.rw ? String(dataProfile.rw) : "",
        desa_kelurahan: dataProfile.desa_kelurahan ?? "",
        kota_kabupaten: dataProfile.kota_kabupaten ?? "",
        provinsi: dataProfile.provinsi ?? "",
        kode_pos: dataProfile.kode_pos ?? "",
        status_kawin: dataProfile.status_kawin
          ? String(dataProfile.status_kawin)
          : "",
        nama_pasangan: dataProfile.nama_pasangan ?? "",
        nip_pasangan: dataProfile.nip_pasangan ?? "",
        pekerjaan_pasangan: dataProfile.pekerjaan_pasangan ?? "",
        tanggal_pns_pasangan: dataProfile.tanggal_pns_pasangan ?? "",
        wali: dataProfile.wali ?? "",
        telp_wali: dataProfile.telp_wali ?? "",
        alamat_wali: dataProfile.alamat_wali ?? "",
        pekerjaan: dataProfile.pekerjaan ?? "",
        alamat_pekerjaan: dataProfile.alamat_pekerjaan ?? "",
        image: undefined,
      });
      if (dataProfile.image) {
        setPreview({ file: undefined, displayUrl: dataProfile.image });
      }
    }
  }, [dataProfile]);

  const c = profileForm.control;

  return (
    <div className="w-full max-w-[1100px] mx-auto pb-12 pt-4 sm:pt-6 animate-in fade-in duration-500 font-sans px-4 sm:px-0">
      {/* Tombol Kembali */}
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

      {/* Header */}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri — Form Profile */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {isLoadingProfile ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner className="text-emerald-600 w-8 h-8" />
              <span className="text-sm font-medium text-gray-500">
                Memuat data profil...
              </span>
            </div>
          ) : (
            <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)}>
              {/* Info Akademik + Foto */}
              <div className="p-6 sm:p-8 border-b border-gray-100">
                {/* Info Identitas */}
                <div className="p-5 bg-[#f8faf9] rounded-2xl border border-emerald-100/50 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      Data Akademik & Sistem
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
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
                        Email
                      </p>
                      <p className="font-extrabold text-gray-900 truncate">
                        {dataProfile?.email ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-1">
                        Role
                      </p>
                      <span className="font-bold text-emerald-700 capitalize inline-flex px-2.5 py-0.5 bg-emerald-100 rounded-md text-xs">
                        {dataProfile?.role ?? "-"}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-1">
                        NIM/NIP/NIDN
                      </p>
                      <p className="font-mono font-bold text-gray-900">
                        {dataProfile?.npm || dataProfile?.nidn || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Foto Profil */}
                {/* <div className="space-y-3">
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
                      control={c}
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
                                const { file, displayUrl } =
                                  getImageData(event);
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
                </div> */}
                {/* <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700">
                    Foto Profil
                  </Label>
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 rounded-full border-2 border-emerald-50 shadow-sm">
                      <AvatarImage
                        src={dataProfile?.image ?? undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-emerald-50 text-emerald-600 font-extrabold text-2xl">
                        {dataProfile?.name?.charAt(0).toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm font-semibold text-gray-700">
                        {dataProfile?.name ?? "-"}
                      </p>
                      <span className="text-[11px] text-orange-500 font-medium">
                        Ganti foto hanya tersedia melalui portal UCL.
                      </span>
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Tab Navigation */}
              <div className="flex overflow-x-auto border-b border-gray-100 px-6">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                      activeTab === tab.key
                        ? "border-emerald-600 text-emerald-700"
                        : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 sm:p-8 space-y-5">
                {/* Kependudukan */}
                {activeTab === "kependudukan" && (
                  <>
                    <Field
                      name="nama_lengkap"
                      label="Nama Lengkap"
                      control={c}
                    />
                    <Field name="nik" label="NIK" control={c} />
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField
                        name="jenkel"
                        label="Jenis Kelamin"
                        control={c}
                        options={[
                          { value: "L", label: "Laki-laki" },
                          { value: "P", label: "Perempuan" },
                        ]}
                      />
                      <Field
                        name="tanggal_lahir"
                        label="Tanggal Lahir"
                        type="date"
                        control={c}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        name="tempat_lahir"
                        label="Tempat Lahir"
                        control={c}
                      />
                      <Field
                        name="ibu_kandung"
                        label="Nama Ibu Kandung"
                        control={c}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field name="agama" label="Agama" control={c} />
                      <Field
                        name="warga_negara"
                        label="Kewarganegaraan"
                        control={c}
                      />
                    </div>
                  </>
                )}

                {/* Alamat & Kontak */}
                {activeTab === "alamat" && (
                  <>
                    <Field name="no_hp" label="Nomor HP" control={c} />
                    <Field name="alamat" label="Alamat" control={c} />
                    <div className="grid grid-cols-2 gap-4">
                      <Field name="rt" label="RT" control={c} />
                      <Field name="rw" label="RW" control={c} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field
                        name="desa_kelurahan"
                        label="Desa/Kelurahan"
                        control={c}
                      />
                      <Field
                        name="kota_kabupaten"
                        label="Kota/Kabupaten"
                        control={c}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field name="provinsi" label="Provinsi" control={c} />
                      <Field name="kode_pos" label="Kode POS" control={c} />
                    </div>
                  </>
                )}

                {/* Keluarga */}
                {activeTab === "keluarga" && (
                  <>
                    <SelectField
                      name="status_kawin"
                      label="Status Perkawinan"
                      control={c}
                      options={[
                        { value: "0", label: "Belum Menikah" },
                        { value: "1", label: "Menikah" },
                        { value: "2", label: "Cerai" },
                      ]}
                    />
                    <Field
                      name="nama_pasangan"
                      label="Nama Suami/Istri"
                      control={c}
                    />
                    <Field
                      name="nip_pasangan"
                      label="NIP Suami/Istri"
                      control={c}
                    />
                    <Field
                      name="pekerjaan_pasangan"
                      label="Pekerjaan Suami/Istri"
                      control={c}
                    />
                    <Field
                      name="tanggal_pns_pasangan"
                      label="Tanggal PNS Suami/Istri"
                      type="date"
                      control={c}
                    />
                  </>
                )}

                {/* Wali */}
                {activeTab === "wali" && (
                  <>
                    <Field name="wali" label="Nama Wali" control={c} />
                    <Field name="telp_wali" label="No. Telp Wali" control={c} />
                    <Field name="alamat_wali" label="Alamat Wali" control={c} />
                  </>
                )}

                {/* Lainnya */}
                {activeTab === "lainnya" && (
                  <>
                    <Field name="pekerjaan" label="Pekerjaan" control={c} />
                    <Field
                      name="alamat_pekerjaan"
                      label="Alamat Pekerjaan"
                      control={c}
                    />
                  </>
                )}

                {/* Tombol Simpan */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isPendingProfile}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/10 transition-all text-[15px]"
                  >
                    {isPendingProfile ? (
                      <Spinner className="w-5 h-5 text-white" />
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Kolom Kanan — Ganti Password */}
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
