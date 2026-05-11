import { useNavigate } from "react-router-dom";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.tsx";
import AuthLayout from "@/components/layouts/AuthLayout";
import { useResetPassword } from "@/hooks/Auth/useResetPassword.ts";

// ASSETS - Disesuaikan agar logonya konsisten dengan halaman Login & Dashboard
const SIDE_IMAGE =
  "https://uika-bogor.ac.id/uploads/files/surat-keterangan-semester-gasal-2023-2024.jpg";
const LOGO = "/img/LOGO_UIKA_Terbaru2 (2).png"; // Pakai logo utama biar lebih bagus dari favicon

export default function ResetPassword() {
  const navigate = useNavigate();

  const {
    isResetMode,
    emailParam,
    isEmailSent,
    controlRequest,
    handleSubmitRequest,
    onRequestSubmit,
    isPendingSendLink,
    controlReset,
    handleSubmitReset,
    onResetSubmit,
    isPendingReset,
  } = useResetPassword();

  return (
    <AuthLayout
      title={
        isResetMode
          ? "E-Portal UIKA — Ubah Password"
          : "E-Portal UIKA — Lupa Password"
      }
    >
      {/* ── BACKGROUND UTAMA ── 
          Konsisten dengan Login: Mesh Gradient Halus, No Scroll (h-screen, overflow-hidden) */}
      <section className="relative flex items-center justify-center h-screen w-screen overflow-hidden bg-[#fbfcfb] p-4 sm:p-0">
        {/* Decorative Gradient Blobs */}
        <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[100px]" />
        </div>

        {/* ── MAIN CARD ── */}
        <div className="relative z-10 bg-white rounded-3xl w-full max-w-5xl h-full max-h-[620px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row overflow-hidden border border-gray-100">
          {/* ── LEFT PANEL (FORM) ── */}
          <div className="w-full lg:w-[48%] flex flex-col h-full p-8 sm:px-12 sm:py-10 overflow-y-auto">
            {/* Logo UIKA */}
            <div className="flex justify-start mb-6 shrink-0">
              <button
                onClick={() => navigate("/login")}
                className="inline-block transition-transform hover:scale-105 active:scale-95"
              >
                <img
                  src={LOGO}
                  alt="Logo UIKA"
                  className="h-12 object-contain"
                />
              </button>
            </div>

            {/* AREA KONTEN TENGAH */}
            <div className="flex-grow flex flex-col justify-center">
              {/* =========================================
                  MODE 1: TAMPILAN MINTA LINK (LUPA PASSWORD)
                  ========================================= */}
              {!isResetMode && !isEmailSent && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h4 className="text-3xl font-extrabold text-gray-950 mb-2.5 tracking-tighter">
                      Lupa Password?
                    </h4>
                    <p className="text-gray-600 text-[15px] leading-relaxed max-w-md">
                      Masukkan email yang terdaftar pada akun Anda. Kami akan
                      mengirimkan tautan untuk mengatur ulang password.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmitRequest(onRequestSubmit)}
                    className="text-left space-y-4"
                  >
                    <FieldGroup>
                      <Controller
                        name="email"
                        control={controlRequest}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel
                              htmlFor="email"
                              className="text-gray-800 font-semibold text-sm mb-1.5 block"
                            >
                              Alamat Email
                            </FieldLabel>
                            <Input
                              {...field}
                              id="email"
                              type="email"
                              aria-invalid={fieldState.invalid}
                              placeholder="nama@uika-bogor.ac.id"
                              className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all bg-white hover:border-gray-300"
                            />
                            {fieldState.invalid && (
                              <FieldError
                                errors={[fieldState.error]}
                                className="text-xs mt-1"
                              />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>

                    <Button
                      type="submit"
                      disabled={isPendingSendLink}
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 shadow-lg shadow-emerald-600/20 transition-all duration-300 font-bold text-sm"
                    >
                      {isPendingSendLink
                        ? "Mengirim Tautan..."
                        : "Kirim Tautan Reset"}
                    </Button>
                  </form>
                </div>
              )}

              {/* =========================================
                  STATE: EMAIL BERHASIL DIKIRIM
                  ========================================= */}
              {!isResetMode && isEmailSent && (
                <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center text-center bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2rem]">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <h4 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    Cek Email Anda
                  </h4>
                  <p className="text-gray-600 text-[15px] leading-relaxed max-w-sm">
                    Kami telah mengirimkan instruksi untuk mengatur ulang
                    password Anda. Silakan periksa folder Inbox atau Spam.
                  </p>
                </div>
              )}

              {/* =========================================
                  MODE 2: TAMPILAN UBAH PASSWORD BARU
                  ========================================= */}
              {isResetMode && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h4 className="text-3xl font-extrabold text-gray-950 mb-2.5 tracking-tighter">
                      Buat Password Baru
                    </h4>
                    <p className="text-gray-600 text-[15px] leading-relaxed max-w-md">
                      Silakan masukkan password baru untuk akun{" "}
                      <strong className="text-emerald-700">{emailParam}</strong>
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmitReset(onResetSubmit)}
                    className="text-left space-y-4"
                  >
                    <FieldGroup>
                      <Controller
                        name="password"
                        control={controlReset}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel
                              htmlFor="password"
                              className="text-gray-800 font-semibold text-sm mb-1.5 block"
                            >
                              Password Baru
                            </FieldLabel>
                            <Input
                              {...field}
                              id="password"
                              type="password"
                              placeholder="Minimal 6 karakter"
                              className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all bg-white hover:border-gray-300"
                            />
                            {fieldState.invalid && (
                              <FieldError
                                errors={[fieldState.error]}
                                className="text-xs mt-1"
                              />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name="password_confirmation"
                        control={controlReset}
                        render={({ field, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="mt-4"
                          >
                            <FieldLabel
                              htmlFor="password_confirmation"
                              className="text-gray-800 font-semibold text-sm mb-1.5 block"
                            >
                              Ulangi Password Baru
                            </FieldLabel>
                            <Input
                              {...field}
                              id="password_confirmation"
                              type="password"
                              placeholder="Ketik ulang password baru"
                              className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all bg-white hover:border-gray-300"
                            />
                            {fieldState.invalid && (
                              <FieldError
                                errors={[fieldState.error]}
                                className="text-xs mt-1"
                              />
                            )}
                          </Field>
                        )}
                      />
                    </FieldGroup>

                    <Button
                      type="submit"
                      disabled={isPendingReset}
                      className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 shadow-lg shadow-emerald-600/20 transition-all duration-300 font-bold text-sm"
                    >
                      {isPendingReset ? "Menyimpan..." : "Simpan Password Baru"}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="w-full text-center mt-6 pt-4 border-t border-gray-50 shrink-0">
              <p className="text-gray-600 text-sm">
                Ingat password Anda?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-emerald-600 font-bold hover:text-emerald-800 transition-colors ml-1"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL (IMAGE ONLY) ── */}
          <div className="hidden lg:flex lg:w-[52%] relative bg-emerald-950 items-end overflow-hidden">
            {/* Gambar Background */}
            <img
              src={SIDE_IMAGE}
              alt="UIKA"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 hover:scale-105"
            />
            {/* Overlay Gradasi biar estetik dan menyatu */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 via-emerald-900/40 to-transparent" />

            {/* Sedikit ornamen biar nggak terlalu kosong */}
            <div className="relative z-10 p-12 w-full text-white/90">
              <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-bold tracking-widest uppercase">
                  E-Portal Security
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight drop-shadow-md">
                Amankan Akun Anda
              </h2>
            </div>
          </div>
        </div>
      </section>
    </AuthLayout>
  );
}
