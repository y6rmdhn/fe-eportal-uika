import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import AuthLayout from "@/components/layouts/AuthLayout";
import { useLogin } from "@/hooks/Auth/useLogin.ts";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.tsx";
import { Controller } from "react-hook-form";

// ── IMPORT SWIPER ──
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { Link } from "react-router-dom";

// ASSETS
const BASE_URL = import.meta.env.BASE_URL;

// Tinggal gabungin string-nya! (BASE_URL udah ada garis miring akhirnya)
const LOGO = `${BASE_URL}img/LOGO_UIKA_Terbaru2 (2).png`;
const GOOGLE_LOGO = "https://tias.ti.ft.uika-bogor.ac.id/img/google.png";
const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

// DATA SLIDER
const slides = [
  {
    image: `${BASE_URL}img/ilustrasi-beasiswa-di-universitas-ibn-khaldun-uika-bogor-wii-tpsg.jpg`,
    title: "Pengumuman Pembayaran Kuliah",
    body: "Berdasarkan Pengumuman Rektor UIKA Nomor: 1911/K.11/UIKA/2023 tentang Pembayaran Biaya Perkuliahan Semester GASAL Tahun Akademik 2023/2024.",
  },
  {
    image: `${BASE_URL}img/202502052004-main.cropped_1738760674.jpg`,
    title: "Kalender Akademik Terbaru",
    body: "Berdasarkan SK Rektor UIKA Nomor: 270/KEP/UIKA/2023 tentang Kalender Akademik UIKA Tahun Akademik 2023/2024.",
  },
];

export default function Login() {
  const { handleSubmit, handleLogin, isPendingLogin, control } = useLogin();

  return (
    <AuthLayout title="E-Portal UIKA — Sign In">
      {/* ── BACKGROUND UTAMA ── */}
      <section className="relative flex items-center justify-center h-screen w-screen overflow-hidden bg-[#fbfcfb] p-4 sm:p-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[100px]" />
        </div>

        {/* ── MAIN CARD ── */}
        <div className="relative z-10 bg-white rounded-3xl w-full max-w-5xl h-full max-h-[620px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row overflow-hidden border border-gray-100">
          {/* ── LEFT PANEL (Form) ── */}
          <div className="w-full lg:w-[48%] flex flex-col h-full p-8 sm:px-12 sm:py-10 overflow-y-auto">
            <div className="flex justify-start mb-6 shrink-0">
              <a
                href="/"
                className="inline-block transition-transform hover:scale-105 active:scale-95"
              >
                <img
                  src={LOGO}
                  alt="Logo UIKA"
                  className="h-12 object-contain"
                />
              </a>
            </div>

            <div className="mb-8 shrink-0">
              <h4 className="text-3xl font-extrabold text-gray-950 mb-2.5 tracking-tighter">
                Sign In ke E-PORTAL
              </h4>
              <p className="text-gray-600 text-[15px] leading-relaxed max-w-md">
                Selamat datang di sistem informasi akademik terpadu{" "}
                <strong className="text-emerald-700 font-semibold">
                  Universitas Ibn Khaldun Bogor.
                </strong>
              </p>
            </div>

            <div className="flex-grow flex flex-col justify-center">
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
                          autoComplete="email"
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
                    name="password"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid} className="mt-4">
                        <FieldLabel
                          htmlFor="password"
                          className="text-gray-800 font-semibold text-sm mb-1.5 block"
                        >
                          Password
                        </FieldLabel>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          aria-invalid={fieldState.invalid}
                          placeholder="Masukkan password Anda"
                          autoComplete="current-password"
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

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id="remember"
                      className="h-4.5 w-4.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-gray-600 text-sm cursor-pointer select-none font-medium"
                    >
                      Ingat saya
                    </Label>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors"
                  >
                    Lupa password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isPendingLogin}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 shadow-lg shadow-emerald-600/20 transition-all duration-300 font-bold text-sm"
                >
                  {isPendingLogin ? "Authenticating..." : "Masuk Sekarang"}
                </Button>
              </form>

              <div className="mt-6 flex items-center before:flex-1 before:border-t before:border-gray-100 after:flex-1 after:border-t after:border-gray-100">
                <p className="mx-4 text-center text-xs text-gray-400 font-bold tracking-widest">
                  ATAU
                </p>
              </div>

              <div className="mt-5 mb-2">
                <a
                  href={`${API_URL}/auth/google/redirect`}
                  className="flex items-center justify-center gap-3 w-full h-11 bg-white hover:bg-gray-50 text-gray-800 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 text-sm font-semibold"
                >
                  <img
                    src={GOOGLE_LOGO}
                    className="w-5 h-5 object-contain"
                    alt="Google"
                  />
                  Lanjutkan dengan Google
                </a>
              </div>
            </div>

            <div className="w-full text-center mt-4 pt-4 border-t border-gray-50 shrink-0">
              <p className="text-gray-600 text-sm">
                Belum memiliki akun?{" "}
                <a
                  href="/register"
                  className="text-emerald-600 font-bold hover:text-emerald-800 transition-colors"
                >
                  Daftar di sini
                </a>
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL (Swiper Slider) ── */}
          <HeroSlider />
        </div>
      </section>
    </AuthLayout>
  );
}

// ── Komponen Hero Slider dengan Swiper ──
function HeroSlider() {
  return (
    <div className="hidden lg:flex lg:w-[52%] relative bg-emerald-950 items-end overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        speed={1000} // Transisi fade selama 1 detik biar elegan
        autoplay={{
          delay: 5000,
          disableOnInteraction: false, // Tetap autoplay walau di-klik/drag
        }}
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
              {/* Gambar Background */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Overlay Gradasi */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent via-50% z-10" />

              {/* Konten Teks */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-12 w-full flex flex-col justify-end h-full">
                <div className="max-w-md mb-8">
                  <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white/10 border border-white/10 text-emerald-200 text-xs font-bold tracking-widest mb-4 uppercase backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Info Terkini
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

      {/* ── CUSTOM CSS UNTUK PAGINATION SWIPER ── */}
      {/* Meng-override gaya bawaan Swiper agar bentuknya mirip Tailwind sebelumnya */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .swiper-pagination {
            text-align: left !important;
            padding-left: 3rem !important; /* Sama dengan p-12 (48px) */
            padding-bottom: 2.5rem !important;
          }
          .swiper-bullet-custom {
            width: 8px;
            height: 6px;
            display: inline-block;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.3);
            margin-right: 8px;
            cursor: pointer;
            transition: all 0.5s ease;
          }
          .swiper-bullet-custom:hover {
            background: rgba(255, 255, 255, 0.6);
          }
          .swiper-bullet-custom-active {
            background: #ffffff;
            width: 36px;
          }
        `,
        }}
      />
    </div>
  );
}
