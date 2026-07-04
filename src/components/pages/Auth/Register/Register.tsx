// src/components/pages/Auth/Register.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import auth from "@/services/api/auth";
import toast from "react-hot-toast";
import {
  GraduationCap,
  BookUser,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL;
const LOGO = `${BASE_URL}img/LOGO_UIKA_Terbaru2 (2).png`;

const slides = [
  {
    image: `${BASE_URL}img/ilustrasi-beasiswa-di-universitas-ibn-khaldun-uika-bogor-wii-tpsg.jpg`,
    title: "Daftar Sekarang",
    body: "Bergabunglah dengan ekosistem digital UIKA. Akses semua aplikasi akademik dengan satu akun.",
  },
  {
    image: `${BASE_URL}img/202502052004-main.cropped_1738760674.jpg`,
    title: "Single Sign-On UIKA",
    body: "Satu akun untuk semua sistem — SIAKAD, SIMPEG, dan aplikasi lainnya di lingkungan UIKA.",
  },
];

const ROLES = [
  {
    key: "Mahasiswa",
    sendAsRole: "Mahasiswa",
    label: "Mahasiswa",
    desc: "Mahasiswa aktif UIKA",
    icon: <GraduationCap size={28} className="text-purple-600" />,
    idLabel: "NPM",
    idKey: "npm",
    placeholder: "Nomor Pokok Mahasiswa",
    skipValidation: false,
    formType: "simple",
  },
  {
    key: "Dosen",
    sendAsRole: "Dosen",
    label: "Dosen",
    desc: "Tenaga pengajar & peneliti UIKA",
    icon: <BookUser size={28} className="text-emerald-600" />,
    idLabel: "NIDN",
    idKey: "nidn",
    placeholder: "Nomor Induk Dosen Nasional",
    skipValidation: false,
    formType: "simple",
  },
  {
    key: "Pegawai",
    sendAsRole: "Pegawai",
    label: "Pegawai",
    desc: "Staff & tenaga kependidikan UIKA",
    icon: <BookUser size={28} className="text-blue-600" />,
    idLabel: "NIP",
    idKey: "nip",
    placeholder: "Nomor Induk Pegawai",
    skipValidation: false,
    formType: "simple",
  },
  {
    key: "Mahasiswa_PMM",
    sendAsRole: "Mahasiswa",
    label: "Mahasiswa PMM",
    desc: "Mahasiswa pertukaran dari luar UIKA",
    icon: <GraduationCap size={28} className="text-orange-600" />,
    idLabel: "NPM",
    idKey: "npm",
    placeholder: "NPM sementara dari kampus",
    skipValidation: true,
    formType: "simple",
  },
  {
    key: "Dosen_Ext",
    sendAsRole: "Dosen_Ext",
    label: "Dosen Eksternal",
    desc: "Dosen tamu / eksternal non-UIKA",
    icon: <BookUser size={28} className="text-rose-600" />,
    idLabel: "",
    idKey: "",
    placeholder: "",
    skipValidation: true,
    formType: "dosenExt",
  },
];

type Step = 1 | 2 | 3;

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [selectedRole, setSelectedRole] = useState<(typeof ROLES)[0] | null>(
    null,
  );
  const [idValue, setIdValue] = useState("");
  const [validatedData, setValidatedData] = useState<{
    nama: string;
    nip?: string;
    nidn?: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [extForm, setExtForm] = useState({
    nama_lengkap: "",
    jenkel: "",
    tanggal_lahir: "",
    tempat_lahir: "",
    agama: "",
    no_hp: "",
    nik: "",
    instansi: "",
  });

  const handleSelectRole = (role: (typeof ROLES)[0]) => {
    setSelectedRole(role);
    setIdValue("");
    setValidatedData(null);
    setStep(role.skipValidation ? 3 : 2);
  };

  const handleValidate = async () => {
    if (!idValue.trim()) {
      toast.error(`${selectedRole?.idLabel} wajib diisi.`);
      return;
    }

    setIsValidating(true);
    try {
      let res;
      if (selectedRole?.key === "Mahasiswa") {
        res = await auth.validateNpm(idValue.trim());
      } else if (selectedRole?.key === "Pegawai") {
        res = await auth.validateNip(idValue.trim());
      } else {
        res = await auth.validateNidn(idValue.trim());
      }

      const data = res.data;

      if (data.valid) {
        setValidatedData(data.data);
        toast.success(
          `${selectedRole?.idLabel} valid! Selamat datang, ${data.data.nama}`,
        );
        setStep(3);
      } else {
        toast.error(
          data.message || `${selectedRole?.idLabel} tidak ditemukan.`,
        );
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          `${selectedRole?.idLabel} tidak ditemukan di sistem.`,
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleRegister = async () => {
    if (selectedRole?.formType === "dosenExt") {
      if (!extForm.nama_lengkap.trim()) {
        toast.error("Nama lengkap wajib diisi.");
        return;
      }
      if (!extForm.nik.trim()) {
        toast.error("NIK/NIP wajib diisi.");
        return;
      }
      if (!extForm.instansi.trim()) {
        toast.error("Instansi wajib diisi.");
        return;
      }
    }

    if (!form.email || !form.password || !form.password_confirmation) {
      toast.error("Semua field wajib diisi.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      toast.error("Konfirmasi password tidak cocok.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter.");
      return;
    }

    setIsRegistering(true);
    try {
      const payload: any = {
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        role: selectedRole?.sendAsRole,
        nidn:
          selectedRole?.idKey === "nidn" || selectedRole?.idKey === "nip"
            ? idValue
            : undefined,
        npm: selectedRole?.idKey === "npm" ? idValue : undefined,
        nama: validatedData?.nama || undefined,
      };

      if (selectedRole?.formType === "dosenExt") {
        payload.nama_lengkap = extForm.nama_lengkap;
        payload.jenkel = extForm.jenkel || undefined;
        payload.tanggal_lahir = extForm.tanggal_lahir || undefined;
        payload.tempat_lahir = extForm.tempat_lahir || undefined;
        payload.agama = extForm.agama || undefined;
        payload.no_hp = extForm.no_hp || undefined;
        payload.nik = extForm.nik;
        payload.instansi = extForm.instansi;
      }

      const res = await auth.register(payload);
      if (res.data.status === 201) {
        setSuccessMessage(res.data.message || "Registrasi berhasil!");
        setIsSuccess(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registrasi gagal.");
    } finally {
      setIsRegistering(false);
    }
  };

  const stepLabels = ["Pilih Role", "Verifikasi", "Buat Akun"];

  return (
    <AuthLayout title="E-Portal UIKA — Register">
      <section className="relative flex items-center justify-center h-screen w-screen overflow-hidden bg-[#fbfcfb] p-4 sm:p-0">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 bg-white rounded-3xl w-full max-w-5xl h-full max-h-[700px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row overflow-hidden border border-gray-100">
          {/* LEFT PANEL */}
          <div className="w-full lg:w-[48%] flex flex-col h-full p-8 sm:px-12 sm:py-10 overflow-y-auto">
            {/* Logo */}
            <div className="flex justify-start mb-6 shrink-0">
              <Link
                to="/"
                className="inline-block transition-transform hover:scale-105"
              >
                <img
                  src={LOGO}
                  alt="Logo UIKA"
                  className="h-12 object-contain"
                />
              </Link>
            </div>

            {/* Title */}
            <div className="mb-6 shrink-0">
              <h4 className="text-3xl font-extrabold text-gray-950 mb-2 tracking-tighter">
                Daftar Akun
              </h4>
              <p className="text-gray-500 text-[14px] leading-relaxed">
                Buat akun E-Portal UIKA untuk mengakses semua sistem informasi
                kampus.
              </p>
            </div>

            {isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-gray-900 mb-2">
                    Pendaftaran Berhasil!
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {successMessage}
                  </p>
                  {selectedRole?.sendAsRole === "Dosen_Ext" && (
                    <p className="text-orange-600 text-xs mt-2 font-semibold">
                      Akun Anda akan diaktifkan setelah verifikasi admin.
                    </p>
                  )}
                </div>
                <Button
                  className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                  onClick={() => navigate("/login")}
                >
                  Masuk Sekarang
                </Button>
              </div>
            ) : (
              <>
                {/* Step Indicator */}
                <div className="flex items-center gap-2 mb-8 shrink-0">
                  {stepLabels.map((label, i) => {
                    const s = i + 1;
                    const isActive = step === s;
                    const isDone = step > s;
                    return (
                      <div key={s} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone ? "bg-emerald-600 text-white" : isActive ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"}`}
                          >
                            {isDone ? <CheckCircle2 size={14} /> : s}
                          </div>
                          <span
                            className={`text-xs font-semibold hidden sm:block ${isActive ? "text-emerald-700" : isDone ? "text-emerald-600" : "text-gray-400"}`}
                          >
                            {label}
                          </span>
                        </div>
                        {i < stepLabels.length - 1 && (
                          <div
                            className={`flex-1 h-px w-8 ${step > s ? "bg-emerald-400" : "bg-gray-200"}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ── STEP 1: Pilih Role ── */}
                {step === 1 && (
                  <div className="flex-1 flex flex-col justify-start gap-3 overflow-y-auto">
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Saya adalah:
                    </p>
                    {ROLES.map((role) => (
                      <button
                        key={role.key}
                        onClick={() => handleSelectRole(role)}
                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group text-left shrink-0"
                      >
                        <div className="p-3 bg-gray-50 group-hover:bg-emerald-100 rounded-xl transition-all">
                          {role.icon}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 text-[15px]">
                            {role.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {role.desc}
                          </p>
                        </div>
                        <ChevronRight
                          size={18}
                          className="ml-auto text-gray-300 group-hover:text-emerald-500 transition-all"
                        />
                      </button>
                    ))}
                    <div className="mt-2 text-center shrink-0">
                      <p className="text-sm text-gray-500">
                        Sudah punya akun?{" "}
                        <Link
                          to="/login"
                          className="text-emerald-600 font-bold hover:text-emerald-700"
                        >
                          Masuk di sini
                        </Link>
                      </p>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Validasi NIDN/NIP/NPM ── */}
                {step === 2 && (
                  <div className="flex-1 flex flex-col justify-center gap-5">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                        Role Dipilih
                      </p>
                      <p className="font-extrabold text-gray-900">
                        {selectedRole?.label}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        {selectedRole?.idLabel}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        placeholder={selectedRole?.placeholder}
                        value={idValue}
                        onChange={(e) => setIdValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                        maxLength={selectedRole?.idKey === "npm" ? 12 : 10}
                        className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                      <p className="text-xs text-gray-400">
                        Masukkan {selectedRole?.idLabel} yang terdaftar di
                        sistem UIKA.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 h-11 rounded-xl"
                        onClick={() => {
                          setStep(1);
                          setIdValue("");
                        }}
                      >
                        <ChevronLeft size={16} className="mr-1" /> Kembali
                      </Button>
                      <Button
                        className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20"
                        onClick={handleValidate}
                        disabled={isValidating}
                      >
                        {isValidating ? (
                          <Loader2 size={16} className="animate-spin mr-2" />
                        ) : null}
                        {isValidating ? "Memvalidasi..." : "Validasi"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Buat Akun ── */}
                {step === 3 && (
                  <div className="flex-1 flex flex-col justify-center gap-4">
                    {selectedRole?.skipValidation ? (
                      <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3">
                        <CheckCircle2
                          size={20}
                          className="text-orange-600 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                            {selectedRole?.label}
                          </p>
                          {selectedRole?.formType === "dosenExt" && (
                            <p className="text-xs text-gray-500">
                              Akun akan menunggu verifikasi admin.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                        <CheckCircle2
                          size={20}
                          className="text-emerald-600 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                            Terverifikasi
                          </p>
                          <p className="font-extrabold text-gray-900 text-sm">
                            {validatedData?.nama}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedRole?.idLabel}: {idValue}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Form NPM PMM opsional */}
                      {selectedRole?.formType === "simple" &&
                        selectedRole?.skipValidation && (
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                              {selectedRole?.idLabel}{" "}
                              <span className="text-gray-400 text-xs font-normal">
                                (opsional)
                              </span>
                            </label>
                            <Input
                              placeholder={selectedRole?.placeholder}
                              value={idValue}
                              onChange={(e) => setIdValue(e.target.value)}
                              maxLength={15}
                              className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                          </div>
                        )}

                      {/* Form lengkap Dosen Eksternal */}
                      {selectedRole?.formType === "dosenExt" && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                              Nama Lengkap{" "}
                              <span className="text-rose-500">*</span>
                            </label>
                            <Input
                              placeholder="Nama lengkap dengan gelar"
                              value={extForm.nama_lengkap}
                              onChange={(e) =>
                                setExtForm({
                                  ...extForm,
                                  nama_lengkap: e.target.value,
                                })
                              }
                              className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                              Instansi Asal{" "}
                              <span className="text-rose-500">*</span>
                            </label>
                            <Input
                              placeholder="Nama institusi/kampus asal"
                              value={extForm.instansi}
                              onChange={(e) =>
                                setExtForm({
                                  ...extForm,
                                  instansi: e.target.value,
                                })
                              }
                              className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-sm font-semibold text-gray-700">
                                Jenis Kelamin
                              </label>
                              <select
                                value={extForm.jenkel}
                                onChange={(e) =>
                                  setExtForm({
                                    ...extForm,
                                    jenkel: e.target.value,
                                  })
                                }
                                className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:outline-none"
                              >
                                <option value="">Pilih</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-semibold text-gray-700">
                                Tanggal Lahir
                              </label>
                              <Input
                                type="date"
                                value={extForm.tanggal_lahir}
                                onChange={(e) =>
                                  setExtForm({
                                    ...extForm,
                                    tanggal_lahir: e.target.value,
                                  })
                                }
                                className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-sm font-semibold text-gray-700">
                                Tempat Lahir
                              </label>
                              <Input
                                placeholder="Kota lahir"
                                value={extForm.tempat_lahir}
                                onChange={(e) =>
                                  setExtForm({
                                    ...extForm,
                                    tempat_lahir: e.target.value,
                                  })
                                }
                                className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-semibold text-gray-700">
                                Agama
                              </label>
                              <Input
                                placeholder="Agama"
                                value={extForm.agama}
                                onChange={(e) =>
                                  setExtForm({
                                    ...extForm,
                                    agama: e.target.value,
                                  })
                                }
                                className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-sm font-semibold text-gray-700">
                                No HP
                              </label>
                              <Input
                                placeholder="08xxxxxxxxxx"
                                value={extForm.no_hp}
                                onChange={(e) =>
                                  setExtForm({
                                    ...extForm,
                                    no_hp: e.target.value,
                                  })
                                }
                                className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-semibold text-gray-700">
                                NIK/NIP <span className="text-rose-500">*</span>
                              </label>
                              <Input
                                placeholder="Nomor identitas"
                                value={extForm.nik}
                                onChange={(e) =>
                                  setExtForm({
                                    ...extForm,
                                    nik: e.target.value,
                                  })
                                }
                                className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          type="email"
                          placeholder="nama@email.com"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimal 8 karakter"
                            value={form.password}
                            onChange={(e) =>
                              setForm({ ...form, password: e.target.value })
                            }
                            className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">
                          Konfirmasi Password{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Ulangi password"
                            value={form.password_confirmation}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                password_confirmation: e.target.value,
                              })
                            }
                            className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            onClick={() => setShowConfirm(!showConfirm)}
                          >
                            {showConfirm ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-11 rounded-xl"
                        onClick={() =>
                          setStep(selectedRole?.skipValidation ? 1 : 2)
                        }
                      >
                        <ChevronLeft size={16} className="mr-1" /> Kembali
                      </Button>
                      <Button
                        className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20"
                        onClick={handleRegister}
                        disabled={isRegistering}
                      >
                        {isRegistering ? (
                          <Loader2 size={16} className="animate-spin mr-2" />
                        ) : null}
                        {isRegistering ? "Mendaftar..." : "Buat Akun"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT PANEL */}
          <HeroSlider />
        </div>
      </section>
    </AuthLayout>
  );
}

function HeroSlider() {
  return (
    <div className="hidden lg:flex lg:w-[52%] relative bg-emerald-950 items-end overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-bullet-custom",
          bulletActiveClass: "swiper-bullet-custom-active",
        }}
        loop={true}
        className="w-full h-full absolute inset-0"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent via-50% z-10" />
              <div className="absolute bottom-0 left-0 right-0 z-20 p-12 w-full flex flex-col justify-end h-full">
                <div className="max-w-md mb-8">
                  <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/10 border border-white/10 text-emerald-200 text-xs font-bold tracking-widest mb-4 uppercase backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    E-Portal UIKA
                  </span>
                  <h5 className="text-2xl font-extrabold text-white mb-2 tracking-tight drop-shadow-sm">
                    {slide.title}
                  </h5>
                  <p className="text-emerald-100/90 text-[15px] leading-relaxed drop-shadow-sm line-clamp-3 font-medium">
                    {slide.body}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .swiper-pagination { text-align: left !important; padding-left: 3rem !important; padding-bottom: 2.5rem !important; }
        .swiper-bullet-custom { width: 8px; height: 6px; display: inline-block; border-radius: 9999px; background: rgba(255, 255, 255, 0.3); margin-right: 8px; cursor: pointer; transition: all 0.5s ease; }
        .swiper-bullet-custom:hover { background: rgba(255, 255, 255, 0.6); }
        .swiper-bullet-custom-active { background: #ffffff; width: 36px; }
      `,
        }}
      />
    </div>
  );
}
