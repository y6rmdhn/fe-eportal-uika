import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldCheck,
  Upload,
  X,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

import DataTable from "@/common/DataTable";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { HEADER_TABLE_APP_MODULE } from "@/constants/AdminConstant";
import {
  useGetAppModules,
  useCreateAppModule,
  useUpdateAppModule,
  useDeleteAppModule,
  useResetAppModuleSecret,
} from "@/hooks/AppModules/useAppModules";
import type { AppModule } from "@/types/general.type";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

interface IconUploadSectionProps {
  label: string;
  isOptional?: boolean;
  currentIconUrl?: string | null;
  selectedFile: File | null;
  previewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSelectFile: (file: File | null) => void;
  onRemoveFile: () => void;
}

const IconUploadSection = ({
  label,
  isOptional = false,
  currentIconUrl,
  selectedFile,
  previewUrl,
  fileInputRef,
  onSelectFile,
  onRemoveFile,
}: IconUploadSectionProps) => {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-gray-700">
          {label}{" "}
          {isOptional && (
            <span className="text-gray-400 font-normal text-xs">
              (Opsional)
            </span>
          )}
        </Label>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          Rasio 1:1
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onSelectFile(e.target.files[0]);
          }
        }}
      />

      {/* ── PREVIEW BOX ── */}
      {previewUrl ? (
        // Preview of newly selected file
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3 flex items-center gap-3 transition-all">
          <div className="w-16 h-16 rounded-xl border border-emerald-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview Icon Baru"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="text-xs font-bold text-gray-800 truncate"
                title={selectedFile?.name}
              >
                {selectedFile?.name || "Foto Baru"}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Baru
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {selectedFile ? formatFileSize(selectedFile.size) : ""}
            </p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <Check size={12} strokeWidth={2.5} /> Siap diunggah
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-gray-700 hover:text-emerald-700 hover:border-emerald-300 bg-white"
              onClick={() => fileInputRef.current?.click()}
            >
              Ganti
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
              title="Hapus foto terpilih"
              onClick={onRemoveFile}
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      ) : currentIconUrl ? (
        // Preview of existing icon (for edit mode)
        <div className="border border-gray-200 bg-gray-50/70 rounded-xl p-3 flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl border border-gray-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <img
              src={currentIconUrl}
              alt="Icon Saat Ini"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-800">
                Icon Saat Ini
              </span>
              <span className="text-[10px] font-semibold text-gray-600 bg-gray-200/80 px-1.5 py-0.5 rounded">
                Tersimpan
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Icon ini akan tetap digunakan jika tidak memilih foto baru.
            </p>
          </div>
          <div className="shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-gray-700 hover:text-emerald-700 hover:border-emerald-300 bg-white flex items-center gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={13} />
              Ganti Icon
            </Button>
          </div>
        </div>
      ) : (
        // Empty state / Dropzone
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              onSelectFile(e.dataTransfer.files[0]);
            }
          }}
          className="border-2 border-dashed border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center text-gray-400 group-hover:text-emerald-600 transition-colors">
            <Upload size={18} />
          </div>
          <p className="text-xs font-semibold text-gray-700 group-hover:text-emerald-700">
            Pilih foto atau seret ke sini
          </p>
          <p className="text-[11px] text-gray-400">
            Klik untuk mencari file gambar icon modul
          </p>
        </div>
      )}

      {/* ── KETERANGAN & PETUNJUK ── */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-2.5 text-xs text-blue-900 flex gap-2.5 items-start">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-950 text-[11px]">
            Keterangan & Ketentuan Foto:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-800 text-[11px] leading-relaxed">
            <li>
              Format file didukung: <strong>PNG, JPG, JPEG, SVG, WebP</strong>
            </li>
            <li>
              Ukuran maksimal: <strong>2 MB</strong>
            </li>
            <li>
              Disarankan rasio <strong>1:1 (persegi)</strong> dengan latar transparan (PNG/SVG) untuk tampilan terbaik di dashboard.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const AppModules = () => {
  const { data, isLoading } = useGetAppModules();
  const modules: AppModule[] = data?.data || [];

  const { mutateCreate, isPendingCreate } = useCreateAppModule();
  const { mutateUpdate, isPendingUpdate } = useUpdateAppModule();
  const { mutateDelete, isPendingDelete } = useDeleteAppModule();
  const { mutateResetSecret, isPendingResetSecret } = useResetAppModuleSecret();

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [updateData, setUpdateData] = useState<AppModule | null>(null);
  const [deleteData, setDeleteData] = useState<AppModule | null>(null);
  const [resetData, setResetData] = useState<AppModule | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Form Fields (Create)
  const [createName, setCreateName] = useState("");
  const [createUrl, setCreateUrl] = useState("");
  const [createIcon, setCreateIcon] = useState<File | null>(null);
  const [createIconPreview, setCreateIconPreview] = useState<string | null>(
    null,
  );
  const createFileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Fields (Update)
  const [updateName, setUpdateName] = useState("");
  const [updateUrl, setUpdateUrl] = useState("");
  const [updateIcon, setUpdateIcon] = useState<File | null>(null);
  const [updateIconPreview, setUpdateIconPreview] = useState<string | null>(
    null,
  );
  const updateFileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (createIconPreview) URL.revokeObjectURL(createIconPreview);
      if (updateIconPreview) URL.revokeObjectURL(updateIconPreview);
    };
  }, [createIconPreview, updateIconPreview]);

  // Validation & Selection Handlers
  const validateAndSelectFile = (
    file: File | null,
    onSuccess: (file: File) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(
        "Format file tidak didukung. Harap gunakan format PNG, JPG, JPEG, SVG, atau WebP.",
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(
        "Ukuran foto maksimal 2 MB. Silakan pilih foto dengan ukuran lebih kecil.",
      );
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onSuccess(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCreateIconChange = (file: File | null) => {
    if (!file) {
      handleRemoveCreateIcon();
      return;
    }
    validateAndSelectFile(
      file,
      (validFile) => {
        if (createIconPreview) URL.revokeObjectURL(createIconPreview);
        setCreateIcon(validFile);
        setCreateIconPreview(URL.createObjectURL(validFile));
      },
      createFileInputRef,
    );
  };

  const handleRemoveCreateIcon = () => {
    if (createIconPreview) URL.revokeObjectURL(createIconPreview);
    setCreateIcon(null);
    setCreateIconPreview(null);
    if (createFileInputRef.current) createFileInputRef.current.value = "";
  };

  const handleUpdateIconChange = (file: File | null) => {
    if (!file) {
      handleRemoveUpdateIcon();
      return;
    }
    validateAndSelectFile(
      file,
      (validFile) => {
        if (updateIconPreview) URL.revokeObjectURL(updateIconPreview);
        setUpdateIcon(validFile);
        setUpdateIconPreview(URL.createObjectURL(validFile));
      },
      updateFileInputRef,
    );
  };

  const handleRemoveUpdateIcon = () => {
    if (updateIconPreview) URL.revokeObjectURL(updateIconPreview);
    setUpdateIcon(null);
    setUpdateIconPreview(null);
    if (updateFileInputRef.current) updateFileInputRef.current.value = "";
  };

  const handleOpenCreateChange = (open: boolean) => {
    if (!open) {
      setCreateName("");
      setCreateUrl("");
      handleRemoveCreateIcon();
    }
    setCreateOpen(open);
  };

  // Open Update Modal
  const openUpdateModal = (mod: AppModule) => {
    if (updateIconPreview) URL.revokeObjectURL(updateIconPreview);
    setUpdateData(mod);
    setUpdateName(mod.name);
    setUpdateUrl(mod.url);
    setUpdateIcon(null);
    setUpdateIconPreview(null);
    if (updateFileInputRef.current) updateFileInputRef.current.value = "";
  };

  const closeUpdateModal = () => {
    handleRemoveUpdateIcon();
    setUpdateData(null);
  };

  // Credentials Display Modal (upon create or reset secret)
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showedSecret, setShowedSecret] = useState<{
    clientId: string;
    clientSecret: string;
    appName: string;
  } | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);

  // Clipboard copy helper
  const handleCopy = (text: string, type: "id" | "secret") => {
    navigator.clipboard.writeText(text);
    toast.success(
      `${type === "id" ? "Client ID" : "Client Secret"} berhasil disalin`,
    );
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Submit Create
  const handleCreateSubmit = () => {
    if (!createName.trim() || !createUrl.trim()) {
      toast.error("Nama modul dan URL wajib diisi");
      return;
    }

    const formData = new FormData();
    formData.append("name", createName.trim());
    formData.append("url", createUrl.trim());
    if (createIcon) {
      formData.append("icon", createIcon);
    }

    mutateCreate(formData, {
      onSuccess: (res: any) => {
        setCreateName("");
        setCreateUrl("");
        handleRemoveCreateIcon();
        setCreateOpen(false);

        // Show newly generated client credentials
        const nestedSso = res?.data?.data?.sso_client;
        if (nestedSso) {
          setShowedSecret({
            clientId: nestedSso.client_id,
            clientSecret: nestedSso.plain_secret,
            appName: res.data.data.name,
          });
          setSecretVisible(false);
          setShowSecretModal(true);
        }
      },
    });
  };

  // Submit Update
  const handleUpdateSubmit = () => {
    if (!updateData) return;
    if (!updateName.trim() || !updateUrl.trim()) {
      toast.error("Nama modul dan URL wajib diisi");
      return;
    }

    const formData = new FormData();
    formData.append("name", updateName.trim());
    formData.append("url", updateUrl.trim());
    if (updateIcon) {
      formData.append("icon", updateIcon);
    }

    // Trik Laravel: Selipkan method PUT di dalam POST request
    formData.append("_method", "PUT");

    mutateUpdate(
      {
        id: updateData.id,
        payload: formData,
      },
      {
        onSuccess: () => {
          closeUpdateModal();
        },
      },
    );
  };

  // Submit Delete
  const handleDeleteSubmit = () => {
    if (!deleteData) return;
    mutateDelete(deleteData.id, {
      onSuccess: () => {
        setDeleteData(null);
      },
    });
  };

  // Submit Reset Secret
  const handleResetSecretSubmit = () => {
    if (!resetData) return;
    mutateResetSecret(resetData.id, {
      onSuccess: (res: any) => {
        setResetData(null);
        const nestedSso = res?.data?.data?.sso_client;
        if (nestedSso) {
          setShowedSecret({
            clientId: nestedSso.client_id,
            clientSecret: nestedSso.plain_secret,
            appName: res.data.data.name,
          });
          setSecretVisible(false);
          setShowSecretModal(true);
        }
      },
    });
  };

  // Build table data
  const tableData = useMemo(
    () =>
      modules.map((mod, index) => {
        const client = mod.sso_client || mod.ssoClient;

        return [
          <span key={`no-${index}`} className="font-medium text-gray-500">
            {index + 1}
          </span>,
          <div key={`name-${index}`} className="flex items-center gap-3">
            {mod.icon_url ? (
              <img
                src={mod.icon_url}
                alt={mod.name}
                className="w-8 h-8 rounded-lg object-contain border border-gray-200 bg-white p-0.5"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">
                {mod.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-gray-800">{mod.name}</span>
          </div>,
          <a
            key={`url-${index}`}
            href={mod.url}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-600 hover:underline text-sm font-medium truncate max-w-xs block"
          >
            {mod.url}
          </a>,
          <div key={`creds-${index}`} className="max-w-[280px]">
            {client ? (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 p-1 px-2 rounded-md font-mono text-xs">
                <span className="text-gray-400 select-none text-[10px]">
                  ID:
                </span>
                <span className="text-gray-600 truncate max-w-[180px]">
                  {client.client_id}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-gray-400 hover:text-emerald-600 ml-auto"
                  title="Salin Client ID"
                  onClick={() => handleCopy(client.client_id, "id")}
                >
                  <Copy size={12} />
                </Button>
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">Belum dibuat</span>
            )}
          </div>,
          <div key={`action-${index}`} className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
              title="Edit"
              onClick={() => openUpdateModal(mod)}
            >
              <Edit2 size={16} strokeWidth={2.5} />
            </Button>
            {client && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
                title="Reset Secret"
                onClick={() => setResetData(mod)}
              >
                <Key size={16} strokeWidth={2.5} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors"
              title="Hapus"
              onClick={() => setDeleteData(mod)}
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </Button>
          </div>,
        ];
      }),
    [modules],
  );

  return (
    <AdminLayout desc="Manajemen App Modules & SSO Clients">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              App Modules & Credentials
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Kelola modul sub-aplikasi terintegrasi beserta kunci akses
              SSO-nya.
            </p>
          </div>
          <Button
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/20 font-bold px-5 transition-all"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-5 w-5 mr-1.5" strokeWidth={2.5} />
            Tambah Aplikasi
          </Button>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white p-2 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <DataTable
            header={HEADER_TABLE_APP_MODULE}
            data={tableData}
            isLoading={isLoading}
            totalPages={1}
            currentPage={1}
            currentLimit={modules.length || 10}
            onChangePage={() => {}}
            onChangeLimit={() => {}}
          />
        </div>

        {/* ── DIALOGS ── */}

        {/* Modal 1: Create AppModule */}
        <Dialog open={createOpen} onOpenChange={handleOpenCreateChange}>
          <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Aplikasi & SSO Client</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label>Nama Modul / Aplikasi</Label>
                <Input
                  placeholder="Contoh: SIAKAD"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>URL Callback SSO</Label>
                <Input
                  placeholder="Contoh: https://siakad.uika.ac.id/sso/callback"
                  value={createUrl}
                  onChange={(e) => setCreateUrl(e.target.value)}
                />
              </div>

              <IconUploadSection
                label="Icon / Foto Aplikasi"
                isOptional
                selectedFile={createIcon}
                previewUrl={createIconPreview}
                fileInputRef={createFileInputRef}
                onSelectFile={handleCreateIconChange}
                onRemoveFile={handleRemoveCreateIcon}
              />
            </div>
            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleCreateSubmit}
                disabled={isPendingCreate}
              >
                {isPendingCreate ? <Spinner /> : "Simpan & Buat Kunci"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal 2: Update AppModule */}
        <Dialog
          open={!!updateData}
          onOpenChange={(o) => !o && closeUpdateModal()}
        >
          <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Aplikasi / Modul</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label>Nama Modul</Label>
                <Input
                  value={updateName}
                  onChange={(e) => setUpdateName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>URL Callback SSO</Label>
                <Input
                  value={updateUrl}
                  onChange={(e) => setUpdateUrl(e.target.value)}
                />
              </div>

              <IconUploadSection
                label="Icon / Foto Aplikasi"
                currentIconUrl={updateData?.icon_url}
                selectedFile={updateIcon}
                previewUrl={updateIconPreview}
                fileInputRef={updateFileInputRef}
                onSelectFile={handleUpdateIconChange}
                onRemoveFile={handleRemoveUpdateIcon}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={closeUpdateModal}>
                Batal
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleUpdateSubmit}
                disabled={isPendingUpdate}
              >
                {isPendingUpdate ? <Spinner /> : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal 3: Delete AppModule */}
        <Dialog
          open={!!deleteData}
          onOpenChange={(o) => !o && setDeleteData(null)}
        >
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-rose-600 flex items-center gap-2">
                <AlertTriangle size={20} /> Hapus Aplikasi
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm text-gray-500 font-medium">
              Apakah Anda yakin ingin menghapus aplikasi{" "}
              <strong className="text-gray-800">{deleteData?.name}</strong>?
              <br />
              Tindakan ini akan menghapus modul aplikasi beserta seluruh data
              SSO Client credentials-nya secara permanen.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteData(null)}>
                Batal
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleDeleteSubmit}
                disabled={isPendingDelete}
              >
                {isPendingDelete ? <Spinner /> : "Ya, Hapus"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal 4: Reset Secret Confirmation */}
        <Dialog
          open={!!resetData}
          onOpenChange={(o) => !o && setResetData(null)}
        >
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-amber-600 flex items-center gap-2">
                <Key size={20} /> Reset Client Secret
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm text-gray-500">
              Apakah Anda yakin ingin mereset kunci rahasia (*Client Secret*)
              untuk <strong className="text-gray-800">{resetData?.name}</strong>
              ?<br />
              Kunci lama akan langsung kedaluwarsa. Anda wajib mengupdate berkas
              konfigurasi `.env` pada server sub-aplikasi yang bersangkutan.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetData(null)}>
                Batal
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleResetSecretSubmit}
                disabled={isPendingResetSecret}
              >
                {isPendingResetSecret ? <Spinner /> : "Reset Kunci"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal 5: Display Secret Credentials */}
        <Dialog open={showSecretModal} onOpenChange={setShowSecretModal}>
          <DialogContent className="sm:max-w-[500px] border-emerald-200">
            <DialogHeader>
              <DialogTitle className="text-emerald-700 flex items-center gap-2">
                <ShieldCheck size={24} /> Kredensial SSO Berhasil Dibuat
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-emerald-700 h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-800 leading-relaxed">
                  <strong>PENTING:</strong> Salin kredensial di bawah ke server
                  sub-aplikasi Anda. Kunci secret hanya akan ditampilkan **kali
                  ini saja** demi keamanan data.
                </div>
              </div>

              <div className="grid gap-1">
                <span className="text-xs font-bold text-gray-500">
                  Aplikasi:
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {showedSecret?.appName}
                </span>
              </div>

              <div className="grid gap-1">
                <span className="text-xs font-bold text-gray-500">
                  Client ID:
                </span>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 font-mono text-sm">
                  <span className="truncate select-all text-gray-700 w-full">
                    {showedSecret?.clientId}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-emerald-600 border border-gray-200 bg-white"
                    onClick={() =>
                      handleCopy(showedSecret?.clientId || "", "id")
                    }
                  >
                    {copiedType === "id" ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-1">
                <span className="text-xs font-bold text-gray-500">
                  Client Secret (Kunci Rahasia):
                </span>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 font-mono text-sm relative">
                  <span className="truncate select-all text-gray-700 w-full pr-10">
                    {secretVisible
                      ? showedSecret?.clientSecret
                      : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                  </span>
                  <div className="absolute right-2 top-1.5 flex items-center gap-1 bg-gray-50 pl-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-gray-600 border border-gray-200 bg-white"
                      title={secretVisible ? "Sembunyikan" : "Tampilkan"}
                      onClick={() => setSecretVisible(!secretVisible)}
                    >
                      {secretVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-emerald-600 border border-gray-200 bg-white"
                      onClick={() =>
                        handleCopy(showedSecret?.clientSecret || "", "secret")
                      }
                    >
                      {copiedType === "secret" ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                  Saya Sudah Menyalin Kredensial
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AppModules;
