import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Controller } from "react-hook-form";
import { KeyRound, Eye, EyeOff, UserCircle, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import useProfile from "@/hooks/Profile/useProfile";
import useUpdateProfile from "@/hooks/Profile/useUpdateProfile";
import useChangePassword from "@/hooks/Profile/useChangePassword";
import type { Preview } from "@/types/general.type";
import { getImageData } from "@/lib/utils";

const Profile = () => {
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
    <AdminLayout>
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="p-2.5 bg-emerald-50 rounded-xl">
            <UserCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Profile Saya
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-0.5">
              Kelola informasi dan keamanan akun kamu
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Update Profile */}
          <div className="bg-white p-8 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Informasi Profile
            </h2>

            {isLoadingProfile ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <form
                onSubmit={profileForm.handleSubmit(handleUpdateProfile)}
                className="space-y-5"
              >
                {/* Info readonly */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Data akademik (tidak dapat diubah)
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Nama</p>
                      <p className="font-semibold text-gray-800">
                        {dataProfile?.name ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Email</p>
                      <p className="font-semibold text-gray-800">
                        {dataProfile?.email ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Role</p>
                      <p className="font-semibold text-gray-800 capitalize">
                        {dataProfile?.role ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">NIM/NIP/NIDN</p>
                      <p className="font-semibold text-gray-800">
                        {dataProfile?.npm ||
                          dataProfile?.nip ||
                          dataProfile?.nidn ||
                          "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Foto profil */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Foto Profil
                  </Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 rounded-xl">
                      <AvatarImage
                        src={preview?.displayUrl}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-xl bg-emerald-50 text-emerald-600 font-bold text-lg">
                        {dataProfile?.name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <Controller
                      name="image"
                      control={profileForm.control}
                      render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-1">
                          <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600">
                            <Camera size={15} />
                            Ganti foto
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
                          {fieldState.error && (
                            <p className="text-xs text-rose-500">
                              {fieldState.error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Phone */}
                <Controller
                  name="phone"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        No. HP
                      </Label>
                      <Input {...field} placeholder="08xxxxxxxxxx" />
                      {fieldState.error && (
                        <p className="text-xs text-rose-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Location */}
                <Controller
                  name="location"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        Lokasi
                      </Label>
                      <Input {...field} placeholder="Kota / alamat" />
                      {fieldState.error && (
                        <p className="text-xs text-rose-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* About me */}
                <Controller
                  name="about_me"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        About Me
                      </Label>
                      <textarea
                        {...field}
                        placeholder="Ceritakan sedikit tentang dirimu..."
                        className="w-full min-h-[80px] px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                  disabled={isPendingProfile}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  {isPendingProfile ? <Spinner /> : "Simpan Perubahan"}
                </Button>
              </form>
            )}
          </div>

          {/* Form Ubah Password */}
          <div className="bg-white p-8 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <KeyRound size={18} className="text-emerald-600" />
              Ubah Password
            </h2>

            <form
              onSubmit={passwordForm.handleSubmit(handleChangePassword)}
              className="space-y-5"
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
                  placeholder: "Min. 8 karakter",
                },
                {
                  name: "password_confirmation" as const,
                  label: "Konfirmasi Password Baru",
                  key: "confirm",
                  placeholder: "Ulangi password baru",
                },
              ].map(({ name, label, key, placeholder }) => (
                <Controller
                  key={name}
                  name={name}
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-gray-700">
                        {label}
                      </Label>
                      <div className="relative">
                        <Input
                          {...field}
                          type={
                            show[key as keyof typeof show] ? "text" : "password"
                          }
                          placeholder={placeholder}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            toggle(key as "current" | "password" | "confirm")
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {show[key as keyof typeof show] ? (
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
              ))}

              <Button
                type="submit"
                disabled={isPendingPassword}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                {isPendingPassword ? <Spinner /> : "Simpan Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Profile;
