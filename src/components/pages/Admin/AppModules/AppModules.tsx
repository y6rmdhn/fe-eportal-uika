import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Key, Copy, Check, Eye, EyeOff, AlertTriangle, ShieldCheck } from "lucide-react";
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

  // Form Fields (Update)
  const [updateName, setUpdateName] = useState("");
  const [updateUrl, setUpdateUrl] = useState("");

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
    toast.success(`${type === "id" ? "Client ID" : "Client Secret"} berhasil disalin`);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Submit Create
  const handleCreateSubmit = () => {
    if (!createName.trim() || !createUrl.trim()) {
      toast.error("Nama modul dan URL wajib diisi");
      return;
    }
    mutateCreate(
      { name: createName.trim(), url: createUrl.trim() },
      {
        onSuccess: (res: any) => {
          setCreateName("");
          setCreateUrl("");
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
      }
    );
  };

  // Open Update Modal
  const openUpdateModal = (mod: AppModule) => {
    setUpdateData(mod);
    setUpdateName(mod.name);
    setUpdateUrl(mod.url);
  };

  // Submit Update
  const handleUpdateSubmit = () => {
    if (!updateData) return;
    if (!updateName.trim() || !updateUrl.trim()) {
      toast.error("Nama modul dan URL wajib diisi");
      return;
    }
    mutateUpdate(
      {
        id: updateData.id,
        payload: { name: updateName.trim(), url: updateUrl.trim() },
      },
      {
        onSuccess: () => {
          setUpdateData(null);
        },
      }
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
          <span key={`name-${index}`} className="font-semibold text-gray-800">
            {mod.name}
          </span>,
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
                <span className="text-gray-400 select-none text-[10px]">ID:</span>
                <span className="text-gray-600 truncate max-w-[180px]">{client.client_id}</span>
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
    [modules]
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
              Kelola modul sub-aplikasi terintegrasi beserta kunci akses SSO-nya.
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
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-[425px]">
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
            </div>
            <DialogFooter>
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
        <Dialog open={!!updateData} onOpenChange={(o) => !o && setUpdateData(null)}>
          <DialogContent className="sm:max-w-[425px]">
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateData(null)}>Batal</Button>
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
        <Dialog open={!!deleteData} onOpenChange={(o) => !o && setDeleteData(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-rose-600 flex items-center gap-2">
                <AlertTriangle size={20} /> Hapus Aplikasi
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm text-gray-500 font-medium">
              Apakah Anda yakin ingin menghapus aplikasi <strong className="text-gray-800">{deleteData?.name}</strong>?<br />
              Tindakan ini akan menghapus modul aplikasi beserta seluruh data SSO Client credentials-nya secara permanen.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteData(null)}>Batal</Button>
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
        <Dialog open={!!resetData} onOpenChange={(o) => !o && setResetData(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-amber-600 flex items-center gap-2">
                <Key size={20} /> Reset Client Secret
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm text-gray-500">
              Apakah Anda yakin ingin mereset kunci rahasia (*Client Secret*) untuk{" "}
              <strong className="text-gray-800">{resetData?.name}</strong>?<br />
              Kunci lama akan langsung kedaluwarsa. Anda wajib mengupdate berkas konfigurasi `.env` pada server sub-aplikasi yang bersangkutan.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetData(null)}>Batal</Button>
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
                  <strong>PENTING:</strong> Salin kredensial di bawah ke server sub-aplikasi Anda.
                  Kunci secret hanya akan ditampilkan **kali ini saja** demi keamanan data.
                </div>
              </div>

              <div className="grid gap-1">
                <span className="text-xs font-bold text-gray-500">Aplikasi:</span>
                <span className="text-sm font-semibold text-gray-800">{showedSecret?.appName}</span>
              </div>

              <div className="grid gap-1">
                <span className="text-xs font-bold text-gray-500">Client ID:</span>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 font-mono text-sm">
                  <span className="truncate select-all text-gray-700 w-full">{showedSecret?.clientId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-emerald-600 border border-gray-200 bg-white"
                    onClick={() => handleCopy(showedSecret?.clientId || "", "id")}
                  >
                    {copiedType === "id" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>

              <div className="grid gap-1">
                <span className="text-xs font-bold text-gray-500">Client Secret (Kunci Rahasia):</span>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 font-mono text-sm relative">
                  <span className="truncate select-all text-gray-700 w-full pr-10">
                    {secretVisible ? showedSecret?.clientSecret : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
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
                      onClick={() => handleCopy(showedSecret?.clientSecret || "", "secret")}
                    >
                      {copiedType === "secret" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">Saya Sudah Menyalin Kredensial</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AppModules;
