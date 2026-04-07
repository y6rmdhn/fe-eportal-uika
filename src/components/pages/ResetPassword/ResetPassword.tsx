import { useNavigate } from "react-router-dom";
import { Controller } from "react-hook-form";

// Sesuaikan dengan import komponen UI dan custom hook kamu
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field.tsx";
import AuthLayout from "@/components/layouts/AuthLayout";
import {useResetPassword} from "@/hooks/Auth/useResetPassword.ts";

const BG_IMAGE = "https://gpm.ppsuika.ac.id/wp-content/uploads/2023/06/uika-bogor.jpg";
const SIDE_IMAGE = "https://uika-bogor.ac.id/uploads/files/surat-keterangan-semester-gasal-2023-2024.jpg";
const LOGO = "/assets/img/favicon.png";

export default function ResetPassword() {
    // Inisialisasi navigate untuk tombol kembali ke login
    const navigate = useNavigate();

    // Ambil semua state dan fungsi dari custom hook
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
        <AuthLayout title={isResetMode ? "E-Portal UIKA — Ubah Password" : "E-Portal UIKA — Lupa Password"}>
            <section
                className="relative flex items-center justify-center min-h-screen w-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${BG_IMAGE})` }}
            >
                <div className="absolute inset-0 bg-black/60" />

                <div className="relative z-10 container mx-auto px-4">
                    <div className="backdrop-blur-2xl bg-black/40 rounded-2xl overflow-hidden max-w-5xl mx-auto shadow-2xl border border-white/10">
                        <div className="grid lg:grid-cols-2">

                            {/* ── LEFT PANEL (FORM) ── */}
                            <div className="flex flex-col h-full p-10">
                                {/* Logo */}
                                <div className="pb-2 flex justify-center">
                                    <a href="/">
                                        <img src={LOGO} alt="Logo UIKA" className="h-20 object-contain" />
                                    </a>
                                </div>

                                {/* AREA KONTEN TENGAH */}
                                <div className="my-auto text-center">

                                    {/* =========================================
                                        MODE 1: TAMPILAN MINTA LINK (LUPA PASSWORD)
                                        ========================================= */}
                                    {!isResetMode && !isEmailSent && (
                                        <>
                                            <h4 className="text-2xl font-bold text-white mb-1">Lupa Password?</h4>
                                            <p className="text-gray-300 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
                                                Masukkan email yang terdaftar pada akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang password.
                                            </p>

                                            <form onSubmit={handleSubmitRequest(onRequestSubmit)} className="text-left space-y-4">
                                                <FieldGroup>
                                                    <Controller
                                                        name="email"
                                                        control={controlRequest}
                                                        // Rules dihapus karena sudah di-handle oleh Zod
                                                        render={({ field, fieldState }) => (
                                                            <Field data-invalid={fieldState.invalid}>
                                                                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                                                                <Input
                                                                    {...field}
                                                                    id="email"
                                                                    type="text" // Diubah ke text agar pesan validasi Zod yang muncul, bukan bawaan HTML browser
                                                                    aria-invalid={fieldState.invalid}
                                                                    placeholder="contoh@uika-bogor.ac.id"
                                                                />
                                                                {fieldState.invalid && (
                                                                    <FieldError errors={[fieldState.error]} />
                                                                )}
                                                            </Field>
                                                        )}
                                                    />
                                                </FieldGroup>

                                                <Button
                                                    type="submit"
                                                    disabled={isPendingSendLink}
                                                    className="w-full mt-2 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm transition-all duration-300 font-semibold"
                                                >
                                                    {isPendingSendLink ? "Mengirim Tautan..." : "Kirim Tautan Reset"}
                                                </Button>
                                            </form>
                                        </>
                                    )}

                                    {/* =========================================
                                        STATE: EMAIL BERHASIL DIKIRIM
                                        ========================================= */}
                                    {!isResetMode && isEmailSent && (
                                        <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl">
                                            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-2">Cek Email Anda</h4>
                                            <p className="text-gray-300 text-sm">
                                                Kami telah mengirimkan instruksi untuk mengatur ulang password Anda. Silakan periksa folder Inbox atau Spam.
                                            </p>
                                        </div>
                                    )}

                                    {/* =========================================
                                        MODE 2: TAMPILAN UBAH PASSWORD BARU
                                        ========================================= */}
                                    {isResetMode && (
                                        <>
                                            <h4 className="text-2xl font-bold text-white mb-1">Buat Password Baru</h4>
                                            <p className="text-gray-300 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
                                                Silakan masukkan password baru untuk akun <br/>
                                                <span className="text-blue-400 font-semibold">{emailParam}</span>
                                            </p>

                                            <form onSubmit={handleSubmitReset(onResetSubmit)} className="text-left space-y-4">
                                                <FieldGroup>
                                                    <Controller
                                                        name="password"
                                                        control={controlReset}
                                                        render={({ field, fieldState }) => (
                                                            <Field data-invalid={fieldState.invalid}>
                                                                <FieldLabel htmlFor="password">Password Baru</FieldLabel>
                                                                <Input
                                                                    {...field}
                                                                    id="password"
                                                                    type="password"
                                                                    placeholder="Minimal 6 karakter"
                                                                />
                                                                {fieldState.invalid && (
                                                                    <FieldError errors={[fieldState.error]} />
                                                                )}
                                                            </Field>
                                                        )}
                                                    />

                                                    <Controller
                                                        name="password_confirmation"
                                                        control={controlReset}
                                                        render={({ field, fieldState }) => (
                                                            <Field data-invalid={fieldState.invalid}>
                                                                <FieldLabel htmlFor="password_confirmation">Ulangi Password Baru</FieldLabel>
                                                                <Input
                                                                    {...field}
                                                                    id="password_confirmation"
                                                                    type="password"
                                                                    placeholder="Ketik ulang password baru"
                                                                />
                                                                {fieldState.invalid && (
                                                                    <FieldError errors={[fieldState.error]} />
                                                                )}
                                                            </Field>
                                                        )}
                                                    />
                                                </FieldGroup>

                                                <Button
                                                    type="submit"
                                                    disabled={isPendingReset}
                                                    className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm transition-all duration-300 font-semibold"
                                                >
                                                    {isPendingReset ? "Menyimpan..." : "Simpan Password Baru"}
                                                </Button>
                                            </form>
                                        </>
                                    )}
                                </div>

                                {/* Footer (Tombol kembali ke Login untuk semua mode) */}
                                <div className="w-full text-center mt-6">
                                    <p className="text-gray-300 text-sm">
                                        Ingat password Anda?{" "}
                                        <button
                                            onClick={() => navigate("/login")}
                                            className="text-blue-400 font-semibold hover:text-blue-300 transition-colors ml-1 bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            Sign In
                                        </button>
                                    </p>
                                </div>
                            </div>

                            {/* ── RIGHT PANEL (IMAGE ONLY) ── */}
                            <div className="hidden lg:block relative overflow-hidden">
                                <img src={SIDE_IMAGE} alt="UIKA" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </AuthLayout>
    );
}