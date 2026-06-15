# Dokumentasi Modul Hak Akses & Role Permissions (Frontend)

Dokumen ini disusun sebagai panduan (knowledge base) bagi AI Agent mengenai implementasi modul Role, Permission, dan Hak Akses di dalam sistem frontend e-Portal UIKA.

## 1. Arsitektur & Teknologi

Modul ini diimplementasikan menggunakan:
- **React.js (TypeScript)**
- **Tailwind CSS** untuk styling (komponen antarmuka kustom bergaya glassmorphism dan premium)
- **React Query (@tanstack/react-query)** untuk state management asinkron (caching, fetching, mutation)
- **Axios** untuk HTTP client (dengan middleware interceptor token JWT)
- **Lucide React** untuk ikon

## 2. Struktur File (File Structure)

Berikut adalah hierarki struktur folder yang terkait dengan modul Hak Akses:

```text
src/
├── services/api/
│   └── admin.ts                  # Kumpulan API Service untuk CRUD App Modules, Roles, Permissions, dan Assign/Unassign Hak Akses
├── types/
│   └── general.type.ts           # Definisi interface TypeScript (Role, Permission, AppModule)
├── hooks/
│   ├── AppModules/
│   │   └── useAppModules.ts      # React Query hooks (useGetAppModules, useCreateAppModule, dll)
│   ├── Roles/
│   │   └── useRoles.ts           # React Query hooks (useGetRoles, useCreateRole, dll)
│   ├── Permissions/
│   │   └── usePermissions.ts     # React Query hooks (useGetPermissions, useCreatePermission, dll)
│   └── RolePermissions/
│       └── useRolePermissions.ts # React Query hooks (useGetRolePermissions, useAssignRolePermissions, useUnassignRolePermissions, useSyncRolePermissions)
├── constants/
│   └── AdminConstant.tsx         # Konfigurasi Sidebar Menu (termasuk item "Hak Akses") & Header Table
├── components/pages/Admin/
│   ├── AppModules/               # Halaman CRUD App Modules
│   ├── Roles/                    # Halaman CRUD Roles & Sinkronisasi Permissions
│   ├── Permissions/              # Halaman CRUD Permissions
│   └── RolePermissions/          # Halaman Penugasan (Assign/Unassign) Hak Akses Interaktif
│       ├── RolePermissions.tsx   # Komponen utama UI penugasan hak akses
│       └── index.ts
└── App.tsx                       # Pendaftaran routing (/admin/role-permissions, dll) dilindungi oleh adminLoader
```

## 3. Detail Implementasi Penting

### A. API Services (`admin.ts`)
Semua pemanggilan API ke backend (`/api/admins/...`) dikelola terpusat di `admin.ts`.
- Fungsi khusus Hak Akses:
  - `getRolePermissions(roleId)`: Mendapatkan list permission yang dimiliki oleh suatu role.
  - `assignRolePermissions(payload)`: Memberikan permissions baru ke role.
  - `unassignRolePermissions(payload)`: Mencabut permissions dari role.
  - `syncRolePermissions(payload)`: Menimpa ulang semua permissions untuk suatu role secara sinkron.

### B. React Query Hooks (`useRolePermissions.ts`)
Hooks ini mengekspos state `isLoading`, `data`, dan fungsi mutasi:
- Mutasi seperti `mutateAssign` memanggil fungsi di API Service, dan pada saat `onSuccess` akan melakukan invalidasi query cache menggunakan `queryClient.invalidateQueries({ queryKey: ["role-permissions", role_id] })` agar data di antarmuka langsung diperbarui tanpa me-refresh halaman.

### C. UI Penugasan Hak Akses (`RolePermissions.tsx`)
Halaman interaktif yang dirancang dengan:
- **State Management**:
  - `selectedRoleId`: Menyimpan ID role yang sedang dipilih dari dropdown.
  - `searchAvailable`, `searchAssigned`: Mengelola teks pencarian untuk kolom "Belum Ditugaskan" dan "Sudah Ditugaskan".
  - `selectedAvailableIds`, `selectedAssignedIds`: Array berisi ID permission yang sedang dicentang oleh user sebelum menekan tombol *Assign* atau *Unassign*.
- **Robust Null-Safety (Bug Fix)**:
  - Dalam filter pencarian `useMemo`, pencarian string menggunakan opsional chaining `p?.name?.toLowerCase()` dan fallback rendering `{perm.name || "Unnamed Permission"}`.
  - List mapping menggunakan `filter(p => p && p.id)` agar crash tidak terjadi jika API mengembalikan data permission berupa null/undefined.
- **Workflow**: 
  1. Pilih role.
  2. Data akan dipisah (diproses frontend menggunakan `Set`) antara permission yang *sudah ditugaskan* dan *semua permissions lainnya yang belum ditugaskan*.
  3. User mencentang permission -> Klik `Berikan Akses` atau `Cabut Akses`.

## 4. Instruksi untuk AI Agent Selanjutnya

Jika ada permintaan terkait perubahan fitur Hak Akses (Role Permissions), perhatikan hal berikut:
1. Jangan memodifikasi routing API di komponen secara langsung; gunakan hooks yang sudah tersedia di folder `src/hooks/`.
2. Jika ada perubahan payload (misalnya menambahkan flag ke table pivot database), maka **API Service (`admin.ts`)** dan **Hooks (`useRolePermissions.ts`)** harus diperbarui.
3. Selalu pertahankan pola `null-safety` untuk menghindari *uncaught type errors*. Gunakan safe operator (`?.`) saat merender atau memanipulasi string data dari API.
4. Gunakan `toast` dari `react-hot-toast` jika perlu menambahkan notifikasi baru.
