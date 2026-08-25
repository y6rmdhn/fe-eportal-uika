import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useGetRoles } from "@/hooks/Roles/useRoles";
import { useGetPermissions } from "@/hooks/Permissions/usePermissions";
import {
  useGetRolePermissions,
  useSyncRolePermissions,
} from "@/hooks/RolePermissions/useRolePermissions";
import type { Permission, Role } from "@/types/general.type";
import PermissionGraph from "./PermissionGraph";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Shield,
  Search,
  ShieldCheck,
  Loader2,
  FolderOpen,
  Layers,
  ChevronDown,
  X,
  Check,
  RotateCcw,
  Save,
  Plus,
  Minus,
  Network,
  ChevronUp,
} from "lucide-react";

interface GroupedPermissions {
  moduleName: string;
  moduleId: number | null;
  permissions: Permission[];
}

// ── Searchable Role Select Component ──────────────────────────────────────────
function SearchableRoleSelect({
  roles,
  value,
  onChange,
  isLoading,
}: {
  roles: Role[];
  value: string;
  onChange: (v: string) => void;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedRole = roles.find((r) => r && r.id.toString() === value);

  const filtered = useMemo(
    () =>
      roles.filter((r) =>
        r && (r.name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [roles, search]
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        id="select-role-trigger"
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 px-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-left transition-all hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
      >
        <span
          className={
            selectedRole
              ? "text-gray-900 font-semibold capitalize"
              : "text-gray-400"
          }
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat role...
            </span>
          ) : selectedRole ? (
            selectedRole.name || "Unnamed Role"
          ) : (
            "Pilih role..."
          )}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setOpen(false);
              }}
              className="p-0.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-white rounded-2xl border border-gray-200 shadow-xl shadow-black/10 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Cari role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50"
              />
            </div>
          </div>

          {/* Role List */}
          <div className="max-h-56 overflow-y-auto p-1.5">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="animate-spin text-emerald-600 h-5 w-5" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400 font-medium">
                {search ? `Tidak ada role "${search}"` : "Belum ada role."}
              </div>
            ) : (
              filtered.map((role) => {
                const isSelected = role.id.toString() === value;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      onChange(role.id.toString());
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 font-bold"
                        : "text-gray-700 hover:bg-gray-50 font-medium"
                    }`}
                  >
                    <span className="capitalize">{role.name || "Unnamed Role"}</span>
                    {isSelected && (
                      <span className="text-emerald-600 text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type ViewFilter = "all" | "granted" | "revoked";

/** Ambil bagian aksi dari nama permission ("users.create" → "create"). */
function actionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1);
}

/** Pisahkan nama menjadi prefix dan aksi ("cbt.soal.create" → cbt.soal + create). */
function splitName(name: string): { prefix: string; action: string } {
  const i = name.lastIndexOf(".");
  if (i === -1) return { prefix: name, action: "" };
  return { prefix: name.slice(0, i), action: name.slice(i + 1) };
}

/**
 * Warna per jenis aksi. `bar` dipakai untuk pita di atas kartu (penanda
 * kategori ala label Trello), `badge` untuk label aksinya sendiri.
 */
const ACTION_ACCENT: Record<string, { bar: string; badge: string }> = {
  view:    { bar: "bg-sky-400",     badge: "bg-sky-50 text-sky-700 border-sky-200" },
  create:  { bar: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  edit:    { bar: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  update:  { bar: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  delete:  { bar: "bg-rose-400",    badge: "bg-rose-50 text-rose-700 border-rose-200" },
  export:  { bar: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
  import:  { bar: "bg-indigo-400",  badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  manage:  { bar: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 border-orange-200" },
  default: { bar: "bg-gray-400",    badge: "bg-gray-50 text-gray-600 border-gray-200" },
};

export default function RolePermissions() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [showGraph, setShowGraph] = useState(true);

  /**
   * draft = keadaan yang DIINGINKAN, bukan yang tersimpan.
   * Semua toggle hanya mengubah draft; server baru disentuh saat Simpan.
   * Pendekatan ini menggantikan dua panel assign/unassign lama: satu daftar,
   * satu pencarian, dan perubahan bisa dibatalkan sebelum benar-benar terjadi.
   */
  const [draft, setDraft] = useState<Set<number>>(new Set());

  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoles();
  const roles: Role[] = useMemo(() => rolesData?.data || [], [rolesData]);

  const { data: allPermsData, isLoading: isLoadingAllPerms } =
    useGetPermissions();
  const allPermissions: Permission[] = useMemo(
    () => allPermsData?.data || [],
    [allPermsData],
  );

  const activeRoleId = selectedRoleId ? parseInt(selectedRoleId, 10) : null;
  const { data: rolePermsData, isLoading: isLoadingRolePerms } =
    useGetRolePermissions(activeRoleId);

  const assignedIds = useMemo(() => {
    const rows = rolePermsData?.data || [];
    return new Set<number>(
      rows
        .map((item: { permission?: Permission }) => item.permission?.id)
        .filter((id: number | undefined): id is number => !!id),
    );
  }, [rolePermsData]);

  const { mutateSync, isPendingSync } = useSyncRolePermissions();

  // Setiap kali data tersimpan berubah (ganti role / selesai simpan),
  // draft disamakan lagi dengan keadaan server.
  useEffect(() => {
    setDraft(new Set(assignedIds));
  }, [assignedIds]);

  // ── Selisih draft vs tersimpan ───────────────────────────────────────────
  const added = useMemo(
    () => [...draft].filter((id) => !assignedIds.has(id)),
    [draft, assignedIds],
  );
  const removed = useMemo(
    () => [...assignedIds].filter((id) => !draft.has(id)),
    [draft, assignedIds],
  );
  const isDirty = added.length > 0 || removed.length > 0;

  // ── Filter + pengelompokan ───────────────────────────────────────────────
  const visiblePermissions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allPermissions.filter((p) => {
      if (!p?.id) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (viewFilter === "granted" && !draft.has(p.id)) return false;
      if (viewFilter === "revoked" && draft.has(p.id)) return false;
      return true;
    });
  }, [allPermissions, search, viewFilter, draft]);

  /**
   * Pengelompokan penuh untuk graph. Sengaja TIDAK mengikuti pencarian atau
   * filter: graph berfungsi menggambarkan cakupan role secara utuh, dan kalau
   * ikut terfilter, modul yang tersembunyi akan terbaca seolah tidak ada.
   */
  const allGrouped = useMemo(() => {
    const groups: Record<string, GroupedPermissions> = {};
    allPermissions.forEach((perm) => {
      if (!perm?.id) return;
      const mod = perm.app_module || perm.appModule;
      const moduleId = mod?.id ?? null;
      const moduleName = mod?.name || "Tanpa Modul";
      const key = moduleId ? `m-${moduleId}` : "none";
      if (!groups[key]) groups[key] = { moduleName, moduleId, permissions: [] };
      groups[key].permissions.push(perm);
    });
    return Object.values(groups).sort((a, b) => {
      if (a.moduleId === null) return 1;
      if (b.moduleId === null) return -1;
      return a.moduleName.localeCompare(b.moduleName);
    });
  }, [allPermissions]);

  const grouped = useMemo(() => {
    const groups: Record<string, GroupedPermissions> = {};
    visiblePermissions.forEach((perm) => {
      const mod = perm.app_module || perm.appModule;
      const moduleId = mod?.id ?? null;
      const moduleName = mod?.name || "Tanpa Modul";
      const key = moduleId ? `m-${moduleId}` : "none";
      if (!groups[key]) groups[key] = { moduleName, moduleId, permissions: [] };
      groups[key].permissions.push(perm);
    });
    return Object.values(groups).sort((a, b) => {
      if (a.moduleId === null) return 1;
      if (b.moduleId === null) return -1;
      return a.moduleName.localeCompare(b.moduleName);
    });
  }, [visiblePermissions]);

  // ── Aksi ─────────────────────────────────────────────────────────────────
  const toggleOne = (id: number) => {
    setDraft((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const setMany = (ids: number[], on: boolean) => {
    setDraft((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  };

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleSave = () => {
    if (!activeRoleId || !isDirty) return;
    mutateSync({ role_id: activeRoleId, permission_ids: [...draft] });
  };

  const handleReset = () => setDraft(new Set(assignedIds));

  const currentRole = roles.find((r) => r.id === activeRoleId);
  const totalPerms = allPermissions.length;
  const grantedCount = draft.size;
  const pct = totalPerms > 0 ? Math.round((grantedCount / totalPerms) * 100) : 0;
  const visibleIds = visiblePermissions.map((p) => p.id);

  return (
    <AdminLayout desc="Hak Akses">
      <div className="flex flex-col gap-5 w-full max-w-[1320px] mx-auto pb-4">
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Penugasan Hak Akses
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Nyalakan atau matikan hak akses, lalu simpan sekaligus.
              </p>
            </div>
          </div>

          <div className="w-full md:w-72 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Pilih Role Pengguna
            </span>
            <SearchableRoleSelect
              roles={roles}
              value={selectedRoleId}
              onChange={(v) => {
                setSelectedRoleId(v);
                setSearch("");
                setViewFilter("all");
              }}
              isLoading={isLoadingRoles}
            />
          </div>
        </div>

        {!selectedRoleId ? (
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center p-16">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              Pilih Role Terlebih Dahulu
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              Pilih salah satu role di dropdown kanan atas untuk mulai mengelola
              hak aksesnya.
            </p>
          </div>
        ) : isLoadingRolePerms || isLoadingAllPerms ? (
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-emerald-600 h-10 w-10" />
              <span className="text-sm font-medium text-gray-500">
                Memuat hak akses...
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* ── RINGKASAN ── */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="font-extrabold text-gray-900 capitalize">
                    {currentRole?.name || "Role"}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-700">
                  {grantedCount}
                  <span className="text-gray-400 font-medium">
                    {" "}
                    dari {totalPerms} hak akses aktif
                  </span>
                </span>
              </div>

              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <button
                onClick={() => setShowGraph((v) => !v)}
                aria-expanded={showGraph}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-700 transition-colors"
              >
                {showGraph ? <ChevronUp size={13} /> : <Network size={13} />}
                {showGraph ? "Sembunyikan visualisasi" : "Tampilkan visualisasi"}
              </button>
            </div>

            {/* ── VISUALISASI JARINGAN HAK AKSES ── */}
            {showGraph && allGrouped.length > 0 && (
              <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-extrabold text-gray-900">
                      Peta Hak Akses
                    </span>
                  </div>
                </div>

                <PermissionGraph
                  roleName={currentRole?.name || "Role"}
                  groups={allGrouped}
                  draft={draft}
                  assignedIds={assignedIds}
                  onToggle={toggleOne}
                />
              </div>
            )}

            {/* ── TOOLBAR ── */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari hak akses, contoh: users.create"
                  className="w-full pl-9 pr-8 h-10 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Bersihkan pencarian"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {(
                  [
                    ["all", "Semua"],
                    ["granted", "Aktif"],
                    ["revoked", "Belum"],
                  ] as [ViewFilter, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setViewFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewFilter === key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── AKSI MASSAL ATAS HASIL SAAT INI ── */}
            {visibleIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-1 -mt-2">
                <span className="text-xs font-medium text-gray-400">
                  {visibleIds.length} hak akses ditampilkan
                </span>
                <button
                  onClick={() => setMany(visibleIds, true)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
                >
                  Nyalakan semua
                </button>
                <span className="text-gray-300">·</span>
                <button
                  onClick={() => setMany(visibleIds, false)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-700 underline"
                >
                  Matikan semua
                </button>
              </div>
            )}

            {/* ── DAFTAR PER MODUL ── */}
            {grouped.length === 0 ? (
              <div className="bg-white rounded-[1.5rem] border border-gray-100 flex flex-col items-center justify-center text-center p-14">
                <div className="w-14 h-14 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-3">
                  <Layers className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  Tidak ada hak akses yang cocok dengan pencarian atau filter.
                </p>
              </div>
            ) : (
              /*
                Tiap modul = satu "tiket" dalam grid, mirip layar pesanan dapur.
                `items-start` penting: tanpa itu semua tiket diregangkan setinggi
                tiket tertinggi di barisnya, sehingga tiket pendek jadi kosong
                melompong di bawahnya.
              */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
              {grouped.map((group) => {
                const key = group.moduleId ? `m-${group.moduleId}` : "none";
                const ids = group.permissions.map((p) => p.id);
                const onCount = ids.filter((id) => draft.has(id)).length;
                const allOn = onCount === ids.length && ids.length > 0;
                const isCollapsed = collapsed.has(key);

                return (
                  <div
                    key={key}
                    className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col"
                  >
                    {/* Kepala tiket */}
                    <div className="bg-gray-50/80 border-b border-dashed border-gray-300 px-4 py-3 flex items-center gap-2">
                      <button
                        onClick={() => toggleCollapse(key)}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                        aria-label={isCollapsed ? "Buka" : "Tutup"}
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${
                            isCollapsed ? "-rotate-90" : ""
                          }`}
                        />
                      </button>

                      {group.moduleId ? (
                        <FolderOpen className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Layers className="h-4 w-4 text-gray-400 shrink-0" />
                      )}

                      <h2
                        className="text-[13px] font-extrabold text-gray-900 tracking-tight uppercase truncate flex-1"
                        title={group.moduleName}
                      >
                        {group.moduleName}
                      </h2>

                      <span
                        className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-lg border tabular-nums ${
                          onCount === 0
                            ? "bg-gray-100 text-gray-500 border-gray-200"
                            : allOn
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {onCount}/{ids.length}
                      </span>

                      <Switch
                        checked={allOn}
                        onCheckedChange={(on) => setMany(ids, on)}
                        aria-label={`Aktifkan semua hak akses modul ${group.moduleName}`}
                      />
                    </div>

                    {/*
                      Isi tiket: daftar item ringkas satu kolom. Kolom tiket
                      sempit, jadi grid kartu di dalamnya justru membuat teks
                      terpotong — bentuk daftar seperti struk lebih terbaca.
                    */}
                    {!isCollapsed && (
                      <div className="p-2 flex flex-col gap-1">
                        {group.permissions.map((perm) => {
                          const on = draft.has(perm.id);
                          const act = actionOf(perm.name);
                          const accent =
                            ACTION_ACCENT[act] || ACTION_ACCENT.default;
                          const wasOn = assignedIds.has(perm.id);
                          const changed = on !== wasOn;
                          const { prefix } = splitName(perm.name);

                          return (
                            <button
                              key={perm.id}
                              type="button"
                              onClick={() => toggleOne(perm.id)}
                              aria-pressed={on}
                              title={perm.name}
                              className={`group relative flex items-center gap-2.5 rounded-lg pl-2.5 pr-2 py-2 text-left transition-all
                                ${
                                  on
                                    ? "bg-white hover:bg-gray-50"
                                    : "bg-gray-50/60 hover:bg-white"
                                }
                                ${
                                  changed
                                    ? on
                                      ? "ring-1 ring-emerald-400"
                                      : "ring-1 ring-rose-300"
                                    : ""
                                }`}
                            >
                              {/* Garis warna aksi di tepi kiri item */}
                              <span
                                className={`absolute left-0 inset-y-1.5 w-1 rounded-full transition-colors ${
                                  on ? accent.bar : "bg-gray-200"
                                }`}
                              />

                              {/* Penanda aktif */}
                              <span
                                className={`shrink-0 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all ${
                                  on
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "bg-white border-gray-300 text-transparent group-hover:border-emerald-400"
                                }`}
                              >
                                <Check size={11} strokeWidth={4} />
                              </span>

                              {/* Nama resource */}
                              <span
                                className={`flex-1 font-mono text-[12px] leading-tight truncate ${
                                  on
                                    ? "text-gray-900 font-semibold"
                                    : "text-gray-400"
                                }`}
                              >
                                {prefix}
                              </span>

                              {/* Aksi */}
                              <span
                                className={`shrink-0 text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                                  on
                                    ? accent.badge
                                    : "bg-white text-gray-400 border-gray-200"
                                }`}
                              >
                                {act || "\u2014"}
                              </span>

                              {/* Penanda perubahan belum tersimpan */}
                              {changed && (
                                <span
                                  className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                                    on
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-rose-100 text-rose-700"
                                  }`}
                                  title={on ? "Akan ditambahkan" : "Akan dicabut"}
                                >
                                  {on ? <Plus size={9} /> : <Minus size={9} />}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            )}
          </>
        )}

        {/*
          Bilah simpan — sticky, BUKAN fixed.

          Kontainer yang menggulung di AdminLayout adalah <main>, bukan window.
          Dengan `fixed`, posisinya dihitung terhadap viewport sehingga bilah
          melebar sampai ke bawah sidebar. `sticky` menempel pada kontainer
          scroll induknya, jadi lebarnya otomatis mengikuti area konten tanpa
          perlu menebak lebar sidebar (yang juga berubah di layar kecil).
        */}
        {selectedRoleId && isDirty && (
          <div className="sticky bottom-4 z-40 mt-1">
            <div className="bg-white/95 backdrop-blur rounded-2xl border border-gray-200 shadow-[0_10px_34px_-10px_rgba(0,0,0,0.25)] px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
              {added.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Plus size={11} />
                  {added.length} ditambahkan
                </span>
              )}
              {removed.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  <Minus size={11} />
                  {removed.length} dicabut
                </span>
              )}
            </div>

            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
              Perubahan belum tersimpan
            </span>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isPendingSync}
                className="h-10 rounded-xl font-bold gap-2"
              >
                <RotateCcw size={14} />
                Batalkan
              </Button>
              <Button
                onClick={handleSave}
                disabled={isPendingSync}
                className="h-10 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-5"
              >
                {isPendingSync ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Simpan Perubahan
              </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
