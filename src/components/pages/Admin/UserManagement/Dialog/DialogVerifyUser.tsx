import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  X,
  User,
  Mail,
  Building2,
  MapPin,
  Hash,
} from "lucide-react";
import type { UserData } from "@/types/general.type";
import useToggleActive from "@/hooks/UserManagement/useToggleActive";
import useDeleteUser from "@/hooks/UserManagement/useDeleteUser";

interface Props {
  open: boolean;
  currentData?: UserData;
  handleChangeAction: (open: boolean) => void;
  refetch: () => void;
}

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    Mahasiswa: "Mahasiswa PMM",
    Dosen_Ext: "Dosen Eksternal",
    Dosen: "Dosen",
    Pegawai: "Pegawai",
    Admin: "Admin",
  };
  return map[role] ?? role;
};

const DialogVerifyUser = ({
  open,
  currentData,
  handleChangeAction,
  refetch,
}: Props) => {
  const { handleToggleActive, isPending: isPendingVerify } = useToggleActive();
  const { handleDeleteUser, isPendingDeleteUser: isPendingDelete } =
    useDeleteUser();

  if (!currentData) return null;

  const handleVerify = () => {
    handleToggleActive(currentData.id);
    handleChangeAction(false);
    refetch();
  };

  const handleReject = () => {
    handleDeleteUser(currentData.id);
    handleChangeAction(false);
    refetch();
  };

  const isMahasiswaPMM = currentData.role === "Mahasiswa";
  const isDosenExt = currentData.role === "Dosen_Ext";

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-extrabold text-gray-900">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <ShieldCheck size={18} className="text-emerald-600" />
            </div>
            Verifikasi Akun
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Periksa data pengguna sebelum mengaktifkan akun.
          </p>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Badge Role */}
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isDosenExt
                  ? "bg-rose-50 text-rose-700 border-rose-100"
                  : "bg-orange-50 text-orange-700 border-orange-100"
              }`}
            >
              {getRoleLabel(currentData.role)}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Daftar: {currentData.created_at?.split("T")[0]}
            </span>
          </div>

          {/* Info Cards */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            {/* Nama */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white rounded-lg border border-gray-100 shrink-0">
                <User size={14} className="text-gray-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Nama Lengkap
                </p>
                <p className="font-bold text-gray-900 text-sm">
                  {currentData.nama_lengkap ?? "-"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white rounded-lg border border-gray-100 shrink-0">
                <Mail size={14} className="text-gray-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Email
                </p>
                <p className="font-bold text-gray-900 text-sm break-all">
                  {currentData.email}
                </p>
              </div>
            </div>

            {/* NIK / NPM */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white rounded-lg border border-gray-100 shrink-0">
                <Hash size={14} className="text-gray-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {isDosenExt ? "NIK" : "NPM"}
                </p>
                <p className="font-mono font-bold text-gray-900 text-sm">
                  {isDosenExt
                    ? (currentData.nik ?? "-")
                    : (currentData.npm ?? "-")}
                </p>
              </div>
            </div>

            {/* Instansi / Asal Universitas */}
            {(isDosenExt || isMahasiswaPMM) && currentData.instansi_ext && (
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white rounded-lg border border-gray-100 shrink-0">
                  <Building2 size={14} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {isDosenExt ? "Instansi Asal" : "Asal Universitas"}
                  </p>
                  <p className="font-bold text-gray-900 text-sm">
                    {currentData.instansi_ext}
                  </p>
                </div>
              </div>
            )}

            {/* Unit */}
            {currentData.unit && (
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white rounded-lg border border-gray-100 shrink-0">
                  <MapPin size={14} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Unit / Prodi
                  </p>
                  <p className="font-bold text-gray-900 text-sm">
                    {currentData.unit.nama_unit}
                  </p>
                  <p className="text-[11px] font-mono text-gray-400">
                    {currentData.unit.code}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold"
            onClick={handleReject}
            disabled={isPendingDelete}
          >
            <X size={16} className="mr-1.5" />
            Tolak & Hapus
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            onClick={handleVerify}
            disabled={isPendingVerify}
          >
            <ShieldCheck size={16} className="mr-1.5" />
            Verifikasi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogVerifyUser;
