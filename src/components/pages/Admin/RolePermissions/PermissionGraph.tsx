import { useMemo, useState } from "react";
import type { Permission } from "@/types/general.type";

/**
 * Diagram pohon Role -> Modul -> Hak Akses.
 *
 * Bentuknya kotak dengan penghubung siku (elbow), bukan simpul lingkaran:
 * nama permission cukup panjang sehingga hanya terbaca di dalam kotak, dan
 * garis siku lebih mudah diikuti mata daripada garis radial yang menyilang.
 *
 * SVG murni tanpa library diagram — tata letaknya deterministik (dua tingkat,
 * satu kolom per modul) sehingga posisinya bisa dihitung langsung.
 */

interface GraphGroup {
  moduleName: string;
  moduleId: number | null;
  permissions: Permission[];
}

const ACTION_COLOR: Record<string, string> = {
  view: "#38bdf8",
  create: "#34d399",
  edit: "#fbbf24",
  update: "#fbbf24",
  delete: "#fb7185",
  export: "#a78bfa",
  import: "#818cf8",
  manage: "#fb923c",
};

function actionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1);
}

// ── Ukuran tetap diagram ────────────────────────────────────────────────────
const PAD = 14;
const ROLE_W = 116;
const ROLE_H = 54;
const MOD_W = 158;
const MOD_H = 40;
const PERM_W = 208;
const PERM_H = 24;
const PERM_GAP = 5;
const BLOCK_GAP = 16;

const X_ROLE = PAD;
const X_MOD = 182;
const X_PERM = 404;
const W = X_PERM + PERM_W + PAD;

const TRUNK_ROLE = (X_ROLE + ROLE_W + X_MOD) / 2;
const TRUNK_MOD = (X_MOD + MOD_W + X_PERM) / 2;

export default function PermissionGraph({
  roleName,
  groups,
  draft,
  assignedIds,
  onToggle,
}: {
  roleName: string;
  groups: GraphGroup[];
  draft: Set<number>;
  assignedIds: Set<number>;
  onToggle: (id: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  /**
   * Tata letak hanya bergantung pada struktur modul, bukan pada draft —
   * menyalakan sakelar tidak boleh memicu perhitungan ulang posisi.
   */
  const { blocks, H } = useMemo(() => {
    let y = PAD;
    const out = groups.map((g) => {
      const k = g.permissions.length;
      const permsH = k * PERM_H + (k - 1) * PERM_GAP;
      const blockH = Math.max(MOD_H, permsH);
      const top = y;

      const perms = g.permissions.map((p, j) => ({
        perm: p,
        // Kolom permission diratakan tengah terhadap tinggi bloknya
        y: top + (blockH - permsH) / 2 + j * (PERM_H + PERM_GAP),
      }));

      const modY = top + blockH / 2 - MOD_H / 2;
      y += blockH + BLOCK_GAP;

      return { group: g, modY, modCenter: modY + MOD_H / 2, perms };
    });

    return { blocks: out, H: Math.max(y - BLOCK_GAP + PAD, ROLE_H + PAD * 2) };
  }, [groups]);

  if (blocks.length === 0) return null;

  const totalActive = groups.reduce(
    (a, g) => a + g.permissions.filter((p) => draft.has(p.id)).length,
    0,
  );
  const totalAll = groups.reduce((a, g) => a + g.permissions.length, 0);
  const roleCenter = H / 2;

  /** Penghubung siku: keluar mendatar, belok tegak, masuk mendatar. */
  const elbow = (
    x1: number,
    y1: number,
    trunk: number,
    x2: number,
    y2: number,
  ) => `M ${x1} ${y1} H ${trunk} V ${y2} H ${x2}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className="max-w-none"
      role="img"
      aria-label={`Diagram hak akses role ${roleName}: ${totalActive} dari ${totalAll} aktif`}
    >
      {blocks.map(({ group, modY, modCenter, perms }) => {
        const aktif = perms.filter((p) => draft.has(p.perm.id)).length;
        const modOn = aktif > 0;
        const semua = aktif === perms.length;

        return (
          <g key={group.moduleId ?? "none"}>
            {/* Role -> Modul */}
            <path
              d={elbow(X_ROLE + ROLE_W, roleCenter, TRUNK_ROLE, X_MOD, modCenter)}
              fill="none"
              stroke={modOn ? "#10b981" : "#e5e7eb"}
              strokeWidth={modOn ? 1.5 + (aktif / perms.length) * 1.5 : 1}
              strokeDasharray={modOn ? undefined : "4 4"}
              className="transition-all duration-300"
            />

            {/* Modul -> tiap hak akses */}
            {perms.map(({ perm, y }) => {
              const on = draft.has(perm.id);
              const c = ACTION_COLOR[actionOf(perm.name)] ?? "#cbd5e1";
              return (
                <path
                  key={`e-${perm.id}`}
                  d={elbow(
                    X_MOD + MOD_W,
                    modCenter,
                    TRUNK_MOD,
                    X_PERM,
                    y + PERM_H / 2,
                  )}
                  fill="none"
                  stroke={on ? c : "#eceff2"}
                  strokeWidth={on ? 1.5 : 1}
                  strokeDasharray={on ? undefined : "3 4"}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Kotak modul */}
            <rect
              x={X_MOD}
              y={modY}
              width={MOD_W}
              height={MOD_H}
              rx={9}
              fill={modOn ? "#ffffff" : "#fafafa"}
              stroke={modOn ? "#10b981" : "#e5e7eb"}
              strokeWidth={modOn ? 1.8 : 1.2}
              className="transition-all duration-300"
            />
            <rect
              x={X_MOD}
              y={modY + 8}
              width={3.5}
              height={MOD_H - 16}
              rx={2}
              fill={semua ? "#10b981" : modOn ? "#fbbf24" : "#e5e7eb"}
              className="transition-all duration-300"
            />
            <text
              x={X_MOD + 14}
              y={modY + 17}
              fontSize="10.5"
              fontWeight="800"
              fill={modOn ? "#111827" : "#9ca3af"}
            >
              {group.moduleName.length > 20
                ? group.moduleName.slice(0, 19) + "…"
                : group.moduleName}
            </text>
            <text
              x={X_MOD + 14}
              y={modY + 30}
              fontSize="9.5"
              fontWeight="700"
              fill={modOn ? "#10b981" : "#cbd5e1"}
            >
              {aktif}/{perms.length} aktif
            </text>

            {/* Kotak hak akses */}
            {perms.map(({ perm, y }) => {
              const on = draft.has(perm.id);
              const changed = on !== assignedIds.has(perm.id);
              const c = ACTION_COLOR[actionOf(perm.name)] ?? "#cbd5e1";
              const isHover = hovered === perm.id;

              return (
                <g
                  key={`b-${perm.id}`}
                  onMouseEnter={() => setHovered(perm.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onToggle(perm.id)}
                  className="cursor-pointer"
                >
                  <title>
                    {perm.name} — {on ? "aktif" : "nonaktif"}, klik untuk
                    mengubah
                  </title>
                  <rect
                    x={X_PERM}
                    y={y}
                    width={PERM_W}
                    height={PERM_H}
                    rx={6}
                    fill={on ? "#ffffff" : "#fafafa"}
                    stroke={
                      changed
                        ? on
                          ? "#10b981"
                          : "#f43f5e"
                        : isHover
                          ? "#94a3b8"
                          : on
                            ? "#e2e8f0"
                            : "#eef1f4"
                    }
                    strokeWidth={changed ? 1.8 : 1.2}
                    strokeDasharray={changed ? "3 2" : undefined}
                    className="transition-all duration-200"
                  />
                  <rect
                    x={X_PERM}
                    y={y + 4}
                    width={3.5}
                    height={PERM_H - 8}
                    rx={2}
                    fill={on ? c : "#e5e7eb"}
                    className="transition-all duration-300"
                  />
                  <text
                    x={X_PERM + 13}
                    y={y + 16}
                    fontSize="10"
                    fontFamily="ui-monospace, monospace"
                    fontWeight={on ? "600" : "400"}
                    fill={on ? "#111827" : "#b6bec9"}
                  >
                    {perm.name.length > 26
                      ? perm.name.slice(0, 25) + "…"
                      : perm.name}
                  </text>
                  <circle
                    cx={X_PERM + PERM_W - 12}
                    cy={y + PERM_H / 2}
                    r={on ? 4.5 : 3.5}
                    fill={on ? "#10b981" : "#ffffff"}
                    stroke={on ? "#10b981" : "#d7dce2"}
                    strokeWidth={1.4}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Kotak role */}
      <rect
        x={X_ROLE}
        y={roleCenter - ROLE_H / 2}
        width={ROLE_W}
        height={ROLE_H}
        rx={11}
        fill="#ecfdf5"
        stroke="#10b981"
        strokeWidth={2}
      />
      <text
        x={X_ROLE + ROLE_W / 2}
        y={roleCenter - 6}
        textAnchor="middle"
        fontSize="11.5"
        fontWeight="800"
        fill="#065f46"
        className="capitalize"
      >
        {roleName.length > 14 ? roleName.slice(0, 13) + "…" : roleName}
      </text>
      <text
        x={X_ROLE + ROLE_W / 2}
        y={roleCenter + 11}
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        fill="#10b981"
      >
        {totalActive}/{totalAll} aktif
      </text>
    </svg>
  );
}
