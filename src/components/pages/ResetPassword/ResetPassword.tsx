import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Mail,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import useResetPassword from "@/hooks/Auth/useResetPassword";

const BASE_URL = import.meta.env.BASE_URL;
const LOGO = `${BASE_URL}img/LOGO_UIKA_Terbaru2 (2).png`;

const ResetPassword = () => {
  const {
    isResetMode,
    emailParam,
    isEmailSent,
    isSuccess,
    forgotForm,
    resetForm,
    isForgotPending,
    isResetPending,
    onForgotSubmit,
    onResetSubmit,
  } = useResetPassword();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={LOGO}
            alt="Logo UIKA"
            className="h-14 object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            E-Portal UIKA
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Universitas Ibn Khaldun Bogor
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
          {/* ── Sukses Reset Password ── */}
          {isSuccess && (
            <div className="p-10 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                  Password Berhasil Diubah!
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Password akun E-Portal kamu sudah berhasil diperbarui. Silakan
                  login dengan password baru kamu.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[15px] transition-all shadow-md shadow-emerald-600/20"
              >
                Masuk Sekarang
              </Link>
            </div>
          )}

          {/* ── Email Terkirim ── */}
          {!isSuccess && isEmailSent && (
            <div className="p-10 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail size={40} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                  Cek Email Kamu!
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Link reset password telah dikirim ke email kamu. Silakan cek
                  inbox atau folder spam.
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  Link berlaku selama 60 menit.
                </p>
              </div>
              <Link
                to="/login"
                className="text-emerald-600 font-bold text-sm hover:text-emerald-700 transition-colors"
              >
                Kembali ke Login
              </Link>
            </div>
          )}

          {/* ── Form Reset Password (dari link email) ── */}
          {!isSuccess && !isEmailSent && isResetMode && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <KeyRound size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Buat Password Baru
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {decodeURIComponent(emailParam ?? "")}
                  </p>
                </div>
              </div>

              <form
                onSubmit={resetForm.handleSubmit(onResetSubmit)}
                className="space-y-5"
              >
                <Controller
                  name="password"
                  control={resetForm.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-bold text-gray-700">
                        Password Baru <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimal 8 karakter"
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
                      {fieldState.error && (
                        <p className="text-xs text-rose-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="password_confirmation"
                  control={resetForm.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-bold text-gray-700">
                        Konfirmasi Password{" "}
                        <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirm ? "text" : "password"}
                          placeholder="Ulangi password baru"
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
                      {fieldState.error && (
                        <p className="text-xs text-rose-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isResetPending}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[15px] shadow-md shadow-emerald-600/20 mt-2"
                >
                  {isResetPending ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : null}
                  {isResetPending ? "Menyimpan..." : "Simpan Password Baru"}
                </Button>
              </form>
            </div>
          )}

          {/* ── Form Lupa Password (kirim email) ── */}
          {!isSuccess && !isEmailSent && !isResetMode && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    Lupa Password?
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Masukkan email untuk reset password
                  </p>
                </div>
              </div>

              <form
                onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
                className="space-y-5"
              >
                <Controller
                  name="email"
                  control={forgotForm.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-bold text-gray-700">
                        Email <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        {...field}
                        type="email"
                        placeholder="nama@email.com"
                        className="h-11 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                      {fieldState.error && (
                        <p className="text-xs text-rose-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isForgotPending}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[15px] shadow-md shadow-emerald-600/20"
                >
                  {isForgotPending ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : null}
                  {isForgotPending ? "Mengirim..." : "Kirim Link Reset"}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-sm text-gray-500 hover:text-emerald-600 font-medium transition-colors"
                  >
                    ← Kembali ke Login
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 E-Portal UIKA — Universitas Ibn Khaldun Bogor
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
