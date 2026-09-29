import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Info,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Users,
  GraduationCap,
  ImagePlus,
  Save,
} from "lucide-react";
import {
  useAboutUsSettings,
  useUpdateAboutUsSettings,
  useAboutUsContributors,
  useCreateAboutUsContributor,
  useUpdateAboutUsContributor,
  useDeleteAboutUsContributor,
  type AboutUsSettings,
  type AboutUsContributor,
  type AboutUsContributorForm,
} from "@/hooks/AboutUs/useAboutUs";
import { useGetAppModules } from "@/hooks/AppModules/useAppModules";

// Samakan dengan batas backend (`image|max:2048` KB) — dicek di sini juga
// supaya foto kegedean ditolak dengan pesan jelas, bukan diblok WAF di
// tengah jalan (WAF cuma lihat Content-Length mentah, pesannya nggak jelas).
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function pickImageFile(file: File | null): File | null {
  if (!file) return null;
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error("Ukuran foto maksimal 2MB. Silakan kompres/perkecil dulu.");
    return null;
  }
  return file;
}

const EMPTY_FORM: AboutUsContributorForm = {
  name: "",
  type: "mahasiswa",
  angkatan: "",
  contribution: "",
  app_module_id: "",
  order: 0,
  is_active: true,
  photo: null,
};

/**
 * Komponen terpisah supaya title/description hanya diinisialisasi sekali
 * dari `settings` saat mount (bukan lewat useEffect + setState yang memicu
 * render ganda) — parent baru me-render ini setelah data selesai dimuat.
 */
const AboutUsContentEditor = ({
  settings,
}: {
  settings: AboutUsSettings;
}) => {
  const { updateSettings, isUpdatingSettings } = useUpdateAboutUsSettings();
  const [title, setTitle] = useState(settings.title ?? "");
  const [description, setDescription] = useState(settings.description ?? "");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleBannerChange = (rawFile: File | null) => {
    const file = pickImageFile(rawFile);
    if (rawFile && !file) return;
    setBannerFile(file);
    setBannerPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSaveSettings = () => {
    updateSettings({ title, description, banner_photo: bannerFile });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Judul</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tentang Kami"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">
              Deskripsi
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan tentang E-Portal, tujuannya, dan sejarah pengembangannya..."
              className="rounded-xl min-h-[160px]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700">Banner</label>
          <label
            htmlFor="banner-upload"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl h-[212px] cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors overflow-hidden"
          >
            {bannerPreview || settings.banner_photo ? (
              <img
                src={bannerPreview ?? settings.banner_photo ?? ""}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <ImagePlus className="text-gray-300" size={28} />
                <span className="text-xs font-semibold text-gray-400">
                  Unggah banner
                </span>
              </>
            )}
          </label>
          <input
            id="banner-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleBannerChange(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-5"
          onClick={handleSaveSettings}
          disabled={isUpdatingSettings}
        >
          {isUpdatingSettings ? (
            <Loader2 size={16} className="animate-spin mr-2" />
          ) : (
            <Save size={16} className="mr-2" />
          )}
          Simpan Konten
        </Button>
      </div>
    </div>
  );
};

const AboutUs = () => {
  // ── Konten About Us ─────────────────────────────────────────────────────
  const { settings, isLoading: isLoadingSettings } = useAboutUsSettings();

  // ── Kontributor ─────────────────────────────────────────────────────────
  const { contributors, isLoading: isLoadingContributors } =
    useAboutUsContributors();
  const { createContributor, isCreatingContributor } =
    useCreateAboutUsContributor();
  const { updateContributor, isUpdatingContributor } =
    useUpdateAboutUsContributor();
  const { deleteContributor, isDeletingContributor } =
    useDeleteAboutUsContributor();
  const { data: appModulesRes } = useGetAppModules();
  const appModules = appModulesRes?.data ?? [];

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<AboutUsContributor | null>(null);
  const [form, setForm] = useState<AboutUsContributorForm>(EMPTY_FORM);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return contributors.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || c.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [contributors, search, typeFilter]);

  const handleOpenCreate = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setPhotoPreview(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (contributor: AboutUsContributor) => {
    setSelected(contributor);
    setForm({
      name: contributor.name,
      type: contributor.type,
      angkatan: contributor.angkatan ?? "",
      contribution: contributor.contribution ?? "",
      app_module_id: contributor.app_module_id
        ? String(contributor.app_module_id)
        : "",
      order: contributor.order ?? 0,
      is_active: contributor.is_active,
      photo: null,
    });
    setPhotoPreview(contributor.photo);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;

    if (selected) {
      updateContributor(
        { id: selected.id, payload: form },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      createContributor(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteContributor(selected.id, {
      onSuccess: () => setDeleteDialogOpen(false),
    });
  };

  const dosenCount = contributors.filter((c) => c.type === "dosen").length;
  const mahasiswaCount = contributors.filter(
    (c) => c.type === "mahasiswa",
  ).length;

  return (
    <AdminLayout desc="About Us">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <Info className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              About Us
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-0.5">
              Kelola konten "Tentang Kami" beserta daftar dosen & mahasiswa
              yang pernah berkontribusi pada aplikasi di E-Portal.
            </p>
          </div>
        </div>

        {/* ═══ KONTEN ═══════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">
            Konten Halaman
          </h2>

          {isLoadingSettings || !settings ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-emerald-600" size={28} />
            </div>
          ) : (
            <AboutUsContentEditor settings={settings} />
          )}
        </div>

        {/* ═══ STATS ═════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Kontributor",
              value: contributors.length,
              icon: <Users size={18} className="text-emerald-600" />,
              bg: "bg-emerald-50",
            },
            {
              label: "Dosen",
              value: dosenCount,
              icon: <GraduationCap size={18} className="text-blue-600" />,
              bg: "bg-blue-50",
            },
            {
              label: "Mahasiswa",
              value: mahasiswaCount,
              icon: <Users size={18} className="text-purple-600" />,
              bg: "bg-purple-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`p-2.5 rounded-xl ${s.bg}`}>{s.icon}</div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ DAFTAR KONTRIBUTOR ═══════════════════════════════════════════ */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
            <h2 className="text-lg font-extrabold text-gray-900">
              Daftar Kontributor
            </h2>
            <div className="flex gap-3 w-full md:w-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] h-11 rounded-xl border-gray-200 bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="dosen">Dosen</SelectItem>
                  <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama..."
                  className="pl-9 h-11 bg-gray-50 border-gray-200 rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-5 shrink-0"
                onClick={handleOpenCreate}
              >
                <Plus size={18} className="mr-1.5" strokeWidth={2.5} />
                Tambah
              </Button>
            </div>
          </div>

          {isLoadingContributors ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
              <Users size={36} className="text-gray-200 mb-3" />
              <p className="font-bold text-gray-500">
                Belum ada kontributor ditambahkan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 p-4 bg-gray-50/60 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-colors"
                >
                  <Avatar className="w-12 h-12 rounded-xl shrink-0">
                    <AvatarImage
                      src={c.photo ?? undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-xl bg-emerald-100 text-emerald-700 font-extrabold">
                      {c.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-sm text-gray-900 truncate">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.type === "dosen"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                      >
                        {c.type === "dosen" ? "Dosen" : "Mahasiswa"}
                      </span>
                      {c.angkatan && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          Angkatan {c.angkatan}
                        </span>
                      )}
                      {!c.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    {c.contribution && (
                      <p className="text-xs text-gray-500 mt-1.5 truncate">
                        {c.contribution}
                      </p>
                    )}
                    {c.app_module?.name && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 truncate">
                        {c.app_module.name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-600 hover:bg-blue-50 rounded-lg"
                      onClick={() => handleOpenEdit(c)}
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-600 hover:bg-rose-50 rounded-lg"
                      onClick={() => {
                        setSelected(c);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog Create/Edit Kontributor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] rounded-2xl flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-gray-900">
              {selected ? "Edit Kontributor" : "Tambah Kontributor"}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            <div className="flex items-center gap-4">
              <label
                htmlFor="contributor-photo"
                className="w-20 h-20 shrink-0 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-emerald-300 overflow-hidden bg-gray-50"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Foto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImagePlus className="text-gray-300" size={22} />
                )}
              </label>
              <input
                id="contributor-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const rawFile = e.target.files?.[0] ?? null;
                  const file = pickImageFile(rawFile);
                  if (rawFile && !file) return;
                  setForm({ ...form, photo: file });
                  setPhotoPreview(file ? URL.createObjectURL(file) : null);
                }}
              />
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Nama Lengkap *
                </label>
                <Input
                  placeholder="Nama dosen/mahasiswa"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                className={cn(
                  "space-y-1.5",
                  form.type === "dosen" && "col-span-2",
                )}
              >
                <label className="text-sm font-bold text-gray-700">
                  Tipe *
                </label>
                <Select
                  value={form.type}
                  onValueChange={(v) => {
                    const type = v as "dosen" | "mahasiswa";
                    setForm({
                      ...form,
                      type,
                      // Angkatan & aplikasi cuma relevan untuk mahasiswa —
                      // dosen tidak punya angkatan/keterikatan ke satu aplikasi.
                      angkatan: type === "dosen" ? "" : form.angkatan,
                      app_module_id:
                        type === "dosen" ? "" : form.app_module_id,
                    });
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="dosen">Dosen</SelectItem>
                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.type === "mahasiswa" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">
                    Angkatan
                  </label>
                  <Input
                    placeholder="e.g. 2021"
                    value={form.angkatan}
                    onChange={(e) =>
                      setForm({ ...form, angkatan: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Kontribusi / Peran
              </label>
              <Input
                placeholder="e.g. Backend Developer, UI/UX Designer"
                value={form.contribution}
                onChange={(e) =>
                  setForm({ ...form, contribution: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {form.type === "mahasiswa" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">
                    Aplikasi
                  </label>
                  <Select
                    value={form.app_module_id || "none"}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        app_module_id: v === "none" ? "" : v,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih aplikasi" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">Tidak spesifik</SelectItem>
                      {appModules.map((m: { id: number; name: string }) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div
                className={cn(
                  "space-y-1.5",
                  form.type === "dosen" && "col-span-2",
                )}
              >
                <label className="text-sm font-bold text-gray-700">
                  Urutan
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_active: checked })
                }
              />
              <label className="text-sm font-bold text-gray-700">
                Tampilkan di halaman About Us
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              onClick={handleSubmit}
              disabled={isCreatingContributor || isUpdatingContributor}
            >
              {isCreatingContributor || isUpdatingContributor ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              {selected ? "Simpan Perubahan" : "Tambah Kontributor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-gray-900">
              Hapus Kontributor
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Yakin ingin menghapus{" "}
            <span className="font-bold text-gray-900">{selected?.name}</span>{" "}
            dari daftar kontributor? Aksi ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              onClick={handleDelete}
              disabled={isDeletingContributor}
            >
              {isDeletingContributor ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AboutUs;
