import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Hash,
  LayoutGrid,
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import {
  useGetUnits,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
} from "@/hooks/Units/useUnits";
import useDebounce from "@/hooks/Debounce/useDebounce";

interface Unit {
  id: number;
  code: string;
  nama_unit: string;
  created_at: string;
}

interface UnitFormData {
  code: string;
  nama_unit: string;
}

export default function Units() {
  // --- Pagination & Search State ---
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounce = useDebounce();

  // --- Modal States ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

  // --- Form State ---
  const [form, setForm] = useState<UnitFormData>({ code: "", nama_unit: "" });
  const [formErrors, setFormErrors] = useState<Partial<UnitFormData>>({});
  const codeRef = useRef<HTMLInputElement>(null);

  // --- Data & Mutations ---
  const { data: unitsResponse, isLoading } = useGetUnits({
    page,
    per_page: perPage,
    search: search || undefined,
  });
  const { mutateCreate, isPendingCreate } = useCreateUnit();
  const { mutateUpdate, isPendingUpdate } = useUpdateUnit();
  const { mutateDelete, isPendingDelete } = useDeleteUnit();

  const units: Unit[] = useMemo(() => unitsResponse?.data || [], [unitsResponse]);
  const meta = unitsResponse?.meta;

  // --- Form Helpers ---
  const openCreate = () => {
    setEditingUnit(null);
    setForm({ code: "", nama_unit: "" });
    setFormErrors({});
    setIsFormOpen(true);
    setTimeout(() => codeRef.current?.focus(), 100);
  };

  const openEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setForm({ code: unit.code, nama_unit: unit.nama_unit });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openDelete = (unit: Unit) => {
    setDeletingUnit(unit);
    setIsDeleteOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<UnitFormData> = {};
    if (!form.code.trim()) errors.code = "Kode unit wajib diisi";
    else if (form.code.length > 50) errors.code = "Kode maksimal 50 karakter";
    if (!form.nama_unit.trim()) errors.nama_unit = "Nama unit wajib diisi";
    else if (form.nama_unit.length > 100) errors.nama_unit = "Nama maksimal 100 karakter";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const payload = { code: form.code.trim(), nama_unit: form.nama_unit.trim() };

    if (editingUnit) {
      mutateUpdate(
        { id: editingUnit.id, payload },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      mutateCreate(payload, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!deletingUnit) return;
    mutateDelete(deletingUnit.id, { onSuccess: () => setIsDeleteOpen(false) });
  };

  const isPendingSubmit = isPendingCreate || isPendingUpdate;

  return (
    <AdminLayout title="Manajemen Unit | E-Portal UIKA" desc="Manajemen Unit">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-12">
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Manajemen Unit
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Kelola data unit / fakultas yang ada di sistem.
              </p>
            </div>
          </div>
          <Button
            id="btn-add-unit"
            onClick={openCreate}
            className="h-11 px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/15 flex items-center gap-2 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Unit
          </Button>
        </div>

        {/* ── STATS BAR ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-teal-50">
              <LayoutGrid className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Unit
              </p>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                {isLoading ? "—" : meta?.total ?? 0}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-sky-50">
              <Hash className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Halaman
              </p>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                {isLoading ? "—" : `${meta?.current_page ?? 1} / ${meta?.last_page ?? 1}`}
              </p>
            </div>
          </div>
        </div>

        {/* ── TABEL ── */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Search Bar */}
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                id="search-unit"
                type="text"
                placeholder="Cari kode atau nama unit..."
                value={searchInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchInput(val);
                  setPage(1);
                  debounce(() => {
                    setSearch(val);
                  }, 400);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50"
              />
            </div>
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                }}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-12">
                    No
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Nama Unit
                  </th>
                  <th className="text-left px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Dibuat
                  </th>
                  <th className="text-right px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded-lg animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : units.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold">
                          {searchInput ? "Tidak ada unit yang cocok." : "Belum ada data unit."}
                        </p>
                        {!searchInput && (
                          <Button
                            size="sm"
                            onClick={openCreate}
                            className="mt-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                          >
                            <Plus className="h-3 w-3 mr-1.5" />
                            Tambah Unit Pertama
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  units.map((unit, index) => (
                    <tr
                      key={unit.id}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      <td className="px-6 py-4 text-gray-400 font-medium text-sm">
                        {(page - 1) * perPage + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 text-xs font-bold font-mono tracking-wide">
                          {unit.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {unit.nama_unit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400 font-medium">
                          {unit.created_at
                            ? new Date(unit.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Unit"
                            className="h-8 w-8 text-sky-600 hover:bg-sky-50 rounded-lg"
                            onClick={() => openEdit(unit)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Hapus Unit"
                            className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-lg"
                            onClick={() => openDelete(unit)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
              <p className="text-sm text-gray-500 font-medium">
                Menampilkan{" "}
                <span className="font-bold text-gray-700">{meta.from}</span>–
                <span className="font-bold text-gray-700">{meta.to}</span> dari{" "}
                <span className="font-bold text-gray-700">{meta.total}</span> unit
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-gray-200"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === meta.last_page ||
                        Math.abs(p - page) <= 1
                    )
                    .reduce<(number | "...")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`dot-${i}`} className="px-1 text-gray-400 text-sm">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`h-8 w-8 rounded-lg text-sm font-bold transition-colors ${
                            page === p
                              ? "bg-teal-600 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-gray-200"
                  disabled={page === meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FORM DIALOG (Create / Edit) ── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                <Building2 className="h-4 w-4" />
              </div>
              {editingUnit ? "Edit Unit" : "Tambah Unit Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Code Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-code"
                className="text-sm font-bold text-gray-700"
              >
                Kode Unit <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-code"
                ref={codeRef}
                type="text"
                placeholder="Contoh: FAK-TI, FAK-EK, LPPM..."
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                className={`w-full px-4 py-2.5 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition-all ${
                  formErrors.code
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/30"
                    : "border-gray-200 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50"
                }`}
              />
              {formErrors.code && (
                <p className="text-xs text-rose-600 font-medium">
                  {formErrors.code}
                </p>
              )}
            </div>

            {/* Nama Unit Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-nama-unit"
                className="text-sm font-bold text-gray-700"
              >
                Nama Unit <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-nama-unit"
                type="text"
                placeholder="Contoh: Fakultas Teknik Informatika"
                value={form.nama_unit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nama_unit: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  formErrors.nama_unit
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/30"
                    : "border-gray-200 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50"
                }`}
              />
              {formErrors.nama_unit && (
                <p className="text-xs text-rose-600 font-medium">
                  {formErrors.nama_unit}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              className="rounded-xl border-gray-200 font-semibold"
              onClick={() => setIsFormOpen(false)}
              disabled={isPendingSubmit}
            >
              Batal
            </Button>
            <Button
              id="btn-submit-unit"
              onClick={handleSubmit}
              disabled={isPendingSubmit}
              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/15"
            >
              {isPendingSubmit ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingUnit ? (
                "Simpan Perubahan"
              ) : (
                "Buat Unit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM DIALOG ── */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-extrabold text-gray-900">
              Hapus Unit?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Unit{" "}
              <span className="font-bold text-gray-800">
                [{deletingUnit?.code}] {deletingUnit?.nama_unit}
              </span>{" "}
              akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-gray-200 font-semibold">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPendingDelete}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isPendingDelete ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Ya, Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
