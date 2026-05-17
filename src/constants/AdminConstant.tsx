import { LayoutDashboard, Users, ActivitySquare } from "lucide-react";

export const SIDEBAR_ADMIN = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard size={20} />,
  },
  {
    key: "users",
    label: "Manajemen User",
    href: "/admin/user-management",
    icon: <Users size={20} />,
  },
  {
    key: "log",
    label: "Aktivitas Log",
    href: "/admin/log",
    icon: <ActivitySquare size={20} />,
  },
];

export const HEADER_TABLE_USER = [
  "No",
  "Informasi User", // Gabungan Foto, Nama, dan Email
  "ID (NPM/NIP/NIDN)", // Menyesuaikan role-nya
  "Role",
  // "Status",
  "Tanggal Daftar",
  "Aksi",
];

export const HEADER_TABLE_LOGIN_LOG = [
  "No",
  "User",
  "IP Address",
  "Browser",
  "Platform",
  "Device",
  "Status",
  "Waktu",
  "Aksi",
];
