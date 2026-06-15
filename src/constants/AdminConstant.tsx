import {
  LayoutDashboard,
  Users,
  ActivitySquare,
  AppWindow,
  ShieldCheck,
  Key,
  Fingerprint,
  Code2,
} from "lucide-react";

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
    key: "app-modules",
    label: "App Modules",
    href: "/admin/app-modules",
    icon: <AppWindow size={20} />,
  },
  {
    key: "roles",
    label: "Roles",
    href: "/admin/roles",
    icon: <ShieldCheck size={20} />,
  },
  {
    key: "permissions",
    label: "Permissions",
    href: "/admin/permissions",
    icon: <Key size={20} />,
  },
  {
    key: "role-permissions",
    label: "Hak Akses",
    href: "/admin/role-permissions",
    icon: <Fingerprint size={20} />,
  },
  {
    key: "log",
    label: "Aktivitas Log",
    href: "/admin/log",
    icon: <ActivitySquare size={20} />,
  },
  {
    key: "sso-keys",
    label: "SSO Integration",
    href: "/admin/sso-keys",
    icon: <Code2 size={20} />,
  },
];

export const HEADER_TABLE_USER = [
  "No",
  "Informasi User", // Gabungan Foto, Nama, dan Email
  "ID (NPM/NIP/NIDN)", // Menyesuaikan role-nya
  "Role",
  // "Status",
  "Tangal Daftar",
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

export const HEADER_TABLE_APP_MODULE = [
  "No",
  "Nama Modul",
  "URL",
  "Client Credentials",
  "Aksi",
];

export const HEADER_TABLE_ROLE = ["No", "Nama Role", "Guard", "Aksi"];

export const HEADER_TABLE_PERMISSION = [
  "No",
  "Nama Permission",
  "Guard",
  "App Module",
  "Aksi",
];
