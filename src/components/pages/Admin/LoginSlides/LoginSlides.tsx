import { useState } from "react";
import toast from "react-hot-toast";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Images,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ImagePlus,
  GripVertical,
} from "lucide-react";
import {
  useLoginSlides,
  useCreateLoginSlide,
  useUpdateLoginSlide,
  useDeleteLoginSlide,
  type LoginSlide,
  type LoginSlideForm,
} from "@/hooks/LoginSlides/useLoginSlides";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function pickImageFile(file: File | null): File | null {
  if (!file) return null;
  if (file.size > MAX_IMAGE_SIZE) {
    toast.error("Ukuran gambar maksimal 2MB. Silakan kompres/perkecil dulu.");
    return null;
  }
  return file;
}

const EMPTY_FORM: LoginSlideForm = {
  title: "",
  body: "",
  order: 0,
  is_active: true,
  image: null,
};

const LoginSlides = () => {
  const { slides, isLoading } = useLoginSlides();
  const { createSlide, isCreatingSlide } = useCreateLoginSlide();
  const { updateSlide, isUpdatingSlide } = useUpdateLoginSlide();
  const { deleteSlide, isDeletingSlide } = useDeleteLoginSlide();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<LoginSlide | null>(null);
  const [form, setForm] = useState<LoginSlideForm>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (slide: LoginSlide) => {
    setSelected(slide);
    setForm({
      title: slide.title,
      body: slide.body ?? "",
      order: slide.order,
      is_active: slide.is_active,
      image: null,
    });
    setImagePreview(slide.image);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (!selected && !form.image) {
      toast.error("Gambar wajib diunggah untuk slide baru.");
      return;
    }

    if (selected) {
      updateSlide(
        { id: selected.id, payload: form },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      createSlide(form, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteSlide(selected.id, { onSuccess: () => setDeleteDialogOpen(false) });
  };

  return (
    <AdminLayout desc="Info Terkini (Login)">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <Images className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Info Terkini
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-0.5">
                Kelola gambar & teks slider "Info Terkini" di halaman login
              </p>
            </div>
          </div>
          <Button
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-5"
            onClick={handleOpenCreate}
          >
            <Plus size={18} className="mr-1.5" strokeWidth={2.5} />
            Tambah Slide
          </Button>
        </div>

        {/* Daftar Slide */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
          ) : slides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
              <Images size={36} className="text-gray-200 mb-3" />
              <p className="font-bold text-gray-500">
                Belum ada slide ditambahkan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {slides.map((s) => (
                <div
                  key={s.id}
                  className="flex gap-4 p-4 bg-gray-50/60 rounded-2xl border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-colors"
                >
                  <div className="w-28 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <GripVertical size={12} className="text-gray-300" />
                      <span className="text-[10px] font-bold text-gray-400">
                        Urutan {s.order}
                      </span>
                      {!s.is_active && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="font-extrabold text-sm text-gray-900 truncate mt-0.5">
                      {s.title}
                    </p>
                    {s.body && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {s.body}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-600 hover:bg-blue-50 rounded-lg"
                      onClick={() => handleOpenEdit(s)}
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-600 hover:bg-rose-50 rounded-lg"
                      onClick={() => {
                        setSelected(s);
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

      {/* Dialog Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] rounded-2xl flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-gray-900">
              {selected ? "Edit Slide" : "Tambah Slide"}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Gambar {!selected && "*"}
              </label>
              <label
                htmlFor="slide-image"
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl h-[160px] cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="text-gray-300" size={28} />
                    <span className="text-xs font-semibold text-gray-400">
                      Unggah gambar (maks 2MB)
                    </span>
                  </>
                )}
              </label>
              <input
                id="slide-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const rawFile = e.target.files?.[0] ?? null;
                  const file = pickImageFile(rawFile);
                  if (rawFile && !file) return;
                  setForm({ ...form, image: file });
                  setImagePreview(
                    file ? URL.createObjectURL(file) : imagePreview,
                  );
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Judul *
              </label>
              <Input
                placeholder="e.g. Pengumuman Pembayaran Kuliah"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Deskripsi
              </label>
              <Textarea
                placeholder="Isi pengumuman/info singkat..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div className="space-y-1.5">
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

            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_active: checked })
                }
              />
              <label className="text-sm font-bold text-gray-700">
                Tampilkan di halaman login
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
              disabled={isCreatingSlide || isUpdatingSlide}
            >
              {isCreatingSlide || isUpdatingSlide ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              {selected ? "Simpan Perubahan" : "Tambah Slide"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-gray-900">
              Hapus Slide
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Yakin ingin menghapus slide{" "}
            <span className="font-bold text-gray-900">{selected?.title}</span>
            ? Aksi ini tidak dapat dibatalkan.
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
              disabled={isDeletingSlide}
            >
              {isDeletingSlide ? (
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

export default LoginSlides;
