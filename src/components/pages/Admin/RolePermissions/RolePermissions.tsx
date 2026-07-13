import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { useGetRoles } from "@/hooks/Roles/useRoles";
import { useGetPermissions } from "@/hooks/Permissions/usePermissions";
import {
  useGetRolePermissions,
  useAssignRolePermissions,
  useUnassignRolePermissions,
} from "@/hooks/RolePermissions/useRolePermissions";
import type { Permission, Role } from "@/types/general.type";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Shield,
  Search,
  CheckSquare,
  Square,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FolderOpen,
  Layers,
  ChevronDown,
  X,
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

  const selectedRole = roles.find((r) => r.id.toString() === value);

  const filtered = useMemo(
    () =>
      roles.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
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
            selectedRole.name
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
                    <span className="capitalize">{role.name}</span>
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
export default function RolePermissions() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchAssigned, setSearchAssigned] = useState("");

  const [selectedAvailableIds, setSelectedAvailableIds] = useState<number[]>([]);
  const [selectedAssignedIds, setSelectedAssignedIds] = useState<number[]>([]);

  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoles();
  const roles: Role[] = useMemo(() => rolesData?.data || [], [rolesData]);

  const { data: allPermsData, isLoading: isLoadingAllPerms } = useGetPermissions();
  const allPermissions: Permission[] = useMemo(
    () => allPermsData?.data || [],
    [allPermsData],
  );

  const activeRoleId = selectedRoleId ? parseInt(selectedRoleId, 10) : null;
  const { data: rolePermsData, isLoading: isLoadingRolePerms } =
    useGetRolePermissions(activeRoleId);
  const assignedPermissions: Permission[] = useMemo(() => {
    const rawList = rolePermsData?.data || [];
    return rawList
      .map((item: { permission?: Permission }) => item.permission)
      .filter(
        (p: Permission | undefined): p is Permission =>
          p !== null && p !== undefined,
      );
  }, [rolePermsData]);

  const { mutateAssign, isPendingAssign } = useAssignRolePermissions();
  const { mutateUnassign, isPendingUnassign } = useUnassignRolePermissions();

  const assignedIdsSet = useMemo(
    () =>
      new Set(assignedPermissions.filter((p) => p && p.id).map((p) => p.id)),
    [assignedPermissions],
  );

  const availablePermissions = useMemo(
    () => allPermissions.filter((p) => p && p.id && !assignedIdsSet.has(p.id)),
    [allPermissions, assignedIdsSet],
  );

  const filteredAvailable = useMemo(
    () =>
      availablePermissions.filter((p) =>
        p?.name?.toLowerCase()?.includes(searchAvailable.toLowerCase()),
      ),
    [availablePermissions, searchAvailable],
  );

  const filteredAssigned = useMemo(
    () =>
      assignedPermissions.filter((p) =>
        p?.name?.toLowerCase()?.includes(searchAssigned.toLowerCase()),
      ),
    [assignedPermissions, searchAssigned],
  );

  const groupedAvailable = useMemo(() => {
    const groups: { [key: string]: GroupedPermissions } = {};
    filteredAvailable.forEach((perm) => {
      const module = perm.appModule || perm.app_module;
      const moduleId = module?.id || null;
      const moduleName = module?.name || "Tanpa Modul";
      const key = moduleId ? `module-${moduleId}` : "no-module";
      if (!groups[key]) {
        groups[key] = { moduleName, moduleId, permissions: [] };
      }
      groups[key].permissions.push(perm);
    });
    return Object.values(groups).sort((a, b) => {
      if (a.moduleId === null) return 1;
      if (b.moduleId === null) return -1;
      return a.moduleName.localeCompare(b.moduleName);
    });
  }, [filteredAvailable]);

  const groupedAssigned = useMemo(() => {
    const groups: { [key: string]: GroupedPermissions } = {};
    filteredAssigned.forEach((perm) => {
      const fullPerm = allPermissions.find((p) => p.id === perm.id) || perm;
      const module = fullPerm.appModule || fullPerm.app_module;
      const moduleId = module?.id || null;
      const moduleName = module?.name || "Tanpa Modul";
      const key = moduleId ? `module-${moduleId}` : "no-module";
      if (!groups[key]) {
        groups[key] = { moduleName, moduleId, permissions: [] };
      }
      groups[key].permissions.push(perm);
    });
    return Object.values(groups).sort((a, b) => {
      if (a.moduleId === null) return 1;
      if (b.moduleId === null) return -1;
      return a.moduleName.localeCompare(b.moduleName);
    });
  }, [filteredAssigned, allPermissions]);

  const toggleAllInGroupAvailable = (groupPermissions: Permission[]) => {
    const groupIds = groupPermissions.map((p) => p.id);
    const areAllSelected = groupIds.every((id) => selectedAvailableIds.includes(id));
    if (areAllSelected) {
      setSelectedAvailableIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedAvailableIds((prev) => [...new Set([...prev, ...groupIds])]);
    }
  };

  const toggleAllInGroupAssigned = (groupPermissions: Permission[]) => {
    const groupIds = groupPermissions.map((p) => p.id);
    const areAllSelected = groupIds.every((id) => selectedAssignedIds.includes(id));
    if (areAllSelected) {
      setSelectedAssignedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedAssignedIds((prev) => [...new Set([...prev, ...groupIds])]);
    }
  };

  const toggleAvailable = (id: number) => {
    setSelectedAvailableIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllAvailable = () => {
    const allFilteredIds = filteredAvailable.map((p) => p.id);
    const areAllSelected = allFilteredIds.every((id) => selectedAvailableIds.includes(id));
    if (areAllSelected) {
      setSelectedAvailableIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedAvailableIds((prev) => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  const toggleAssigned = (id: number) => {
    setSelectedAssignedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllAssigned = () => {
    const allFilteredIds = filteredAssigned.map((p) => p.id);
    const areAllSelected = allFilteredIds.every((id) => selectedAssignedIds.includes(id));
    if (areAllSelected) {
      setSelectedAssignedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedAssignedIds((prev) => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  const handleAssign = () => {
    if (!activeRoleId || selectedAvailableIds.length === 0) return;
    mutateAssign(
      { role_id: activeRoleId, permission_ids: selectedAvailableIds },
      { onSuccess: () => setSelectedAvailableIds([]) },
    );
  };

  const handleUnassign = () => {
    if (!activeRoleId || selectedAssignedIds.length === 0) return;
    mutateUnassign(
      { role_id: activeRoleId, permission_ids: selectedAssignedIds },
      { onSuccess: () => setSelectedAssignedIds([]) },
    );
  };

  const currentRole = roles.find((r) => r.id === activeRoleId);

  return (
    <AdminLayout desc="Hak Akses">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-12">
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
                Berikan (assign) atau cabut (unassign) permissions ke role pengguna.
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
                setSelectedAvailableIds([]);
                setSelectedAssignedIds([]);
              }}
              isLoading={isLoadingRoles}
            />
          </div>
        </div>

        {/* ── CONTENT ── */}
        {!selectedRoleId ? (
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center p-16">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Pilih Role Terlebih Dahulu</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              Silakan pilih salah satu role di dropdown kanan atas untuk mulai mengelola hak aksesnya.
            </p>
          </div>
        ) : isLoadingRolePerms || isLoadingAllPerms ? (
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-emerald-600 h-10 w-10" />
              <span className="text-sm font-medium text-gray-500">Memuat hak akses...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* ── AVAILABLE ── */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-[650px] overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-rose-500" />
                    Belum Ditugaskan
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Permissions yang belum dimiliki role{" "}
                    <span className="capitalize font-semibold text-emerald-600">
                      {currentRole?.name}
                    </span>.
                  </p>
                </div>
                <span className="inline-flex px-2.5 py-1 bg-gray-150 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">
                  {filteredAvailable.length} Item
                </span>
              </div>
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cari permission..."
                    value={searchAvailable}
                    onChange={(e) => setSearchAvailable(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                {filteredAvailable.length > 0 && (
                  <button
                    onClick={toggleAllAvailable}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200 rounded-xl transition-all"
                  >
                    {filteredAvailable.every((p) => selectedAvailableIds.includes(p.id)) ? (
                      <><CheckSquare className="h-4 w-4 text-emerald-600" /> Batal Pilih Semua</>
                    ) : (
                      <><Square className="h-4 w-4" /> Pilih Semua</>
                    )}
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {groupedAvailable.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <p className="text-sm font-medium text-gray-400">
                      {searchAvailable ? "Tidak ada permission yang cocok." : "Semua permission telah diberikan ke role ini."}
                    </p>
                  </div>
                ) : (
                  groupedAvailable.map((group) => (
                    <div key={group.moduleId ?? "no-module"} className="border border-gray-100 bg-gray-50/20 rounded-2xl p-3 space-y-3">
                      <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-100/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-extrabold text-emerald-950 tracking-wide uppercase">{group.moduleName}</span>
                          <span className="inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg">{group.permissions.length}</span>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); toggleAllInGroupAvailable(group.permissions); }} className="text-xs font-bold text-emerald-700 hover:text-emerald-950 bg-emerald-100/40 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg transition-all">
                          {group.permissions.every((p) => selectedAvailableIds.includes(p.id)) ? "Batal Semua" : "Pilih Semua"}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 pl-1">
                        {group.permissions.map((perm) => {
                          const isSelected = selectedAvailableIds.includes(perm.id);
                          return (
                            <div key={perm.id} onClick={() => toggleAvailable(perm.id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-emerald-400 bg-emerald-50/50 shadow-sm" : "border-gray-100 hover:border-gray-200 bg-white"}`}>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected ? "bg-emerald-600 text-white" : "border border-gray-300"}`}>
                                {isSelected && <span className="text-[10px] font-bold">✓</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${isSelected ? "text-emerald-800" : "text-gray-700"}`}>{perm.name || "Unnamed Permission"}</p>
                                <p className="text-[11px] font-medium text-gray-400 font-mono">{perm.guard_name || "web"}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
                <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/10 font-bold transition-all flex items-center justify-center gap-2" disabled={selectedAvailableIds.length === 0 || isPendingAssign} onClick={handleAssign}>
                  {isPendingAssign ? <Loader2 className="h-5 w-5 animate-spin" /> : <><span>Berikan Akses ({selectedAvailableIds.length})</span><ArrowRight className="h-4 w-4" /></>}
                </Button>
              </div>
            </div>

            {/* ── ASSIGNED ── */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-[650px] overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    Sudah Ditugaskan
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Permissions yang saat ini dimiliki role{" "}
                    <span className="capitalize font-semibold text-emerald-600">{currentRole?.name}</span>.
                  </p>
                </div>
                <span className="inline-flex px-2.5 py-1 bg-gray-150 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">
                  {filteredAssigned.length} Item
                </span>
              </div>
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cari permission..."
                    value={searchAssigned}
                    onChange={(e) => setSearchAssigned(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                {filteredAssigned.length > 0 && (
                  <button onClick={toggleAllAssigned} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 hover:text-rose-600 border border-gray-200 hover:border-rose-200 rounded-xl hover:bg-rose-50/50 transition-all">
                    {filteredAssigned.every((p) => selectedAssignedIds.includes(p.id)) ? (
                      <><CheckSquare className="h-4 w-4 text-rose-600" /> Batal Pilih Semua</>
                    ) : (
                      <><Square className="h-4 w-4" /> Pilih Semua</>
                    )}
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {groupedAssigned.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <p className="text-sm font-medium text-gray-400">
                      {searchAssigned ? "Tidak ada permission yang cocok." : "Role ini tidak memiliki permission apa pun saat ini."}
                    </p>
                  </div>
                ) : (
                  groupedAssigned.map((group) => (
                    <div key={group.moduleId ?? "no-module"} className="border border-gray-100 bg-gray-50/20 rounded-2xl p-3 space-y-3">
                      <div className="flex items-center justify-between px-3 py-2 bg-rose-50 border border-rose-100/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-rose-600" />
                          <span className="text-xs font-extrabold text-rose-950 tracking-wide uppercase">{group.moduleName}</span>
                          <span className="inline-flex px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-lg">{group.permissions.length}</span>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); toggleAllInGroupAssigned(group.permissions); }} className="text-xs font-bold text-rose-700 hover:text-rose-950 bg-rose-100/40 hover:bg-rose-100/80 px-2.5 py-1 rounded-lg transition-all">
                          {group.permissions.every((p) => selectedAssignedIds.includes(p.id)) ? "Batal Semua" : "Pilih Semua"}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 pl-1">
                        {group.permissions.map((perm) => {
                          const isSelected = selectedAssignedIds.includes(perm.id);
                          return (
                            <div key={perm.id} onClick={() => toggleAssigned(perm.id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-rose-400 bg-rose-50/55 shadow-sm" : "border-gray-100 hover:border-gray-200 bg-white"}`}>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected ? "bg-rose-600 text-white" : "border border-gray-300"}`}>
                                {isSelected && <span className="text-[10px] font-bold">✓</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold truncate ${isSelected ? "text-rose-800" : "text-gray-700"}`}>{perm.name || "Unnamed Permission"}</p>
                                <p className="text-[11px] font-medium text-gray-400 font-mono">{perm.guard_name || "web"}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
                <Button className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/10 font-bold transition-all flex items-center justify-center gap-2" disabled={selectedAssignedIds.length === 0 || isPendingUnassign} onClick={handleUnassign}>
                  {isPendingUnassign ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ArrowLeft className="h-4 w-4" /><span>Cabut Akses ({selectedAssignedIds.length})</span></>}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
