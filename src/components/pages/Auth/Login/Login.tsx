import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AuthLayout from "@/components/layouts/AuthLayout";
import {useLogin} from "@/hooks/Auth/useLogin.ts";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field.tsx";
import {Controller} from "react-hook-form";

const BG_IMAGE =
  "https://gpm.ppsuika.ac.id/wp-content/uploads/2023/06/uika-bogor.jpg";
const SIDE_IMAGE =
  "https://uika-bogor.ac.id/uploads/files/surat-keterangan-semester-gasal-2023-2024.jpg";
const LOGO = "/assets/img/favicon.png";
const GOOGLE_LOGO = "https://tias.ti.ft.uika-bogor.ac.id/img/google.png";

export default function Login() {

  const { handleSubmit, handleLogin, isPendingLogin, errors, control } = useLogin()

  return (
    <AuthLayout title="E-Portal UIKA — Sign In">
      {/* Background */}
      <section
        className="relative flex items-center justify-center min-h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="backdrop-blur-2xl bg-black/40 rounded-2xl overflow-hidden max-w-5xl mx-auto shadow-2xl border border-white/10">
            <div className="grid lg:grid-cols-2">
              {/* ── LEFT PANEL ── */}
              <div className="flex flex-col h-full p-10">
                {/* Logo */}
                <div className="pb-2 flex justify-center">
                  <a href="/">
                    <img
                      src={LOGO}
                      alt="Logo UIKA"
                      className="h-20 object-contain"
                    />
                  </a>
                </div>

                {/* Form area */}
                <div className="my-auto text-center">
                  <h4 className="text-2xl font-bold text-white mb-1">
                    E-PORTAL
                  </h4>
                  <p className="text-gray-300 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
                    <strong>Sign In</strong>
                    <br />
                    Portal UIKA sistem informasi dari Universitas Ibn Khaldun
                    Bogor.
                  </p>

                  <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(handleLogin)(e);
                      }}
                      className="text-left space-y-4"
                  >
                    <FieldGroup>
                      <Controller
                          name="email"
                          control={control}
                          render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="email">
                                  Email
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="email"
                                    type="text"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter your email address"
                                    autoComplete="off"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                          )}
                      />
                      <Controller
                          name="password"
                          control={control}
                          render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="password">
                                  Password
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="password"
                                    type="password"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter your password"
                                    autoComplete="off"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                          )}
                      />
                    </FieldGroup>

                    {/* Remember me + Forgot */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember"
                          // checked={rememberMe}
                          // onCheckedChange={(v) => setRememberMe(!!v)}
                          className="border-white/30 data-[state=checked]:bg-white/30"
                        />
                        <Label
                          htmlFor="remember"
                          className="text-gray-200 text-sm cursor-pointer"
                        >
                          Remember me
                        </Label>
                      </div>
                      <a
                        href="/reset-password"
                        className="text-gray-300 text-xs border-b border-dashed border-gray-400 hover:text-white transition-colors"
                      >
                        Forgot your password?
                      </a>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isPendingLogin}
                      className="w-full mt-2 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm transition-all duration-300 font-semibold"
                    >
                      {isPendingLogin ? "Signing in..." : "Log In"}
                    </Button>
                  </form>

                  {/* OAuth */}
                  <div className="mt-6">
                    <p className="text-gray-200 font-semibold mb-3">
                      Sign in with
                    </p>
                    <div className="flex justify-center">
                      <a href="http://localhost:8000/api/auth/google/redirect"
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/20 transition-all duration-300 text-sm font-medium"
                      >
                        <img src={GOOGLE_LOGO} width={22} alt="Google" />
                        Google
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="w-full text-center mt-6">
                  <p className="text-gray-300 text-sm">
                    Don&apos;t have an account?{" "}
                    <a
                      href="/register"
                      className="text-blue-400 font-semibold hover:text-blue-300 transition-colors ml-1"
                    >
                      Sign Up
                    </a>
                  </p>
                </div>
              </div>

              {/* ── RIGHT PANEL (hidden on mobile) ── */}
              <div className="hidden lg:block relative overflow-hidden">
                <img
                  src={SIDE_IMAGE}
                  alt="UIKA"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 flex items-end justify-center pb-10 px-6">
                  <Announcements />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AuthLayout>
  );
}

// ── Announcement carousel (simple CSS-based auto-scroll) ──
const announcements = [
  {
    title: "Pengumuman Pembayaran",
    body: "Berdasarkan Pengumuman Rektor UIKA Nomor: 1911/K.11/UIKA/2023 tentang Pembayaran Biaya Perkuliahan Semester GASAL Tahun Akademik 2023/2024.",
  },
  {
    title: "Kalender Akademik",
    body: "Berdasarkan SK Rektor UIKA Nomor: 270/KEP/UIKA/2023 tentang Kalender Akademik UIKA Tahun Akademik 2023/2024.",
  },
];

function Announcements() {
  const [current, setCurrent] = useState(0);

  return (
    <div className="text-center max-w-xs">
      <h5 className="text-lg font-bold text-white mb-2">
        {announcements[current].title}
      </h5>
      <p className="text-gray-300 text-sm leading-relaxed mb-4">
        {announcements[current].body}
      </p>
      <div className="flex justify-center gap-2">
        {announcements.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-white w-4" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
