# 📚 Dokumentasi Sistem E-Portal UIKA

> Rangkuman lengkap arsitektur, modul, database, dan alur kerja sistem E-Portal Universitas Ibn Khaldun Bogor.

---

## 📋 Daftar Isi

1. [Gambaran Umum Sistem](#1-gambaran-umum-sistem)
2. [Arsitektur Teknologi](#2-arsitektur-teknologi)
3. [Backend — Laravel (e-portal-uika-main)](#3-backend--laravel-e-portal-uika-main)
4. [Frontend — React (fe-eportal-uika)](#4-frontend--react-fe-eportal-uika)
5. [Skema Database](#5-skema-database)
6. [API Endpoints](#6-api-endpoints)
7. [Sistem Autentikasi & SSO](#7-sistem-autentikasi--sso)
8. [Modul RBAC (Role, Permission, AppModule)](#8-modul-rbac-role-permission-appmodule)
9. [Logging & Monitoring](#9-logging--monitoring)
10. [Data Seeder (Default Data)](#10-data-seeder-default-data)
11. [Alur Kerja Utama (Flowchart)](#11-alur-kerja-utama)

---

## 1. Gambaran Umum Sistem

**E-Portal UIKA** adalah sistem portal terpusat berbasis **Single Sign-On (SSO)** untuk Universitas Ibn Khaldun Bogor. Sistem ini berfungsi sebagai:

- **Gerbang autentikasi tunggal** untuk seluruh aplikasi kampus (SIAKAD, E-Library, Portal Keuangan, dll.)
- **Manajemen pengguna** terpusat (admin, dosen, mahasiswa, user biasa)
- **Manajemen Role & Permission** berbasis Spatie Laravel Permission
- **Dashboard Admin** dengan analitik, monitoring keamanan, dan log aktivitas

---

## 2. Arsitektur Teknologi

### Stack Teknologi

| Komponen | Teknologi | Versi |
|---|---|---|
| **Backend** | Laravel Framework | ^10.0 |
| **Frontend** | React + Vite | React ^19, Vite ^8 |
| **Bahasa FE** | TypeScript | ~5.9.3 |
| **Auth** | JWT (tymon/jwt-auth) | ^2.1 |
| **Permission** | Spatie Laravel Permission | ^6.21 |
| **OAuth** | Laravel Socialite (Google) | ^5.16 |
| **HTTP Client FE** | Axios | ^1.14 |
| **State Query FE** | TanStack React Query | ^5.96 |
| **UI Library FE** | Shadcn UI + Radix UI | ^4 |
| **Styling FE** | TailwindCSS | ^4.2 |
| **Form FE** | React Hook Form + Zod | ^7.75 / ^4 |
| **Charts FE** | Recharts | ^3.8 |
| **Routing FE** | React Router DOM | ^7.13 |
| **Excel** | Maatwebsite Excel | ^3.1 |
| **PHP** | PHP | ^8.1 |

### Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER / CLIENT                    │
│                                                         │
│   ┌─────────────────────────────────────────────────┐  │
│   │         React SPA (fe-eportal-uika)             │  │
│   │         Vite + TypeScript + TailwindCSS         │  │
│   └──────────────────────┬──────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │ HTTP/REST API (Axios)
                           │ JWT via Cookie (uika_sso_token)
┌──────────────────────────▼──────────────────────────────┐
│           Laravel Backend (e-portal-uika-main)          │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │   Auth   │  │  Admin   │  │Permission│  │  SSO   │  │
│  │Controller│  │Controller│  │  RBAC    │  │Redirect│  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│                        │                               │
│  ┌─────────────────────▼────────────────────────────┐  │
│  │         MySQL Database                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │ SSO Token Redirect
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   [SIAKAD App]    [E-Library App]    [Portal Keuangan]
```

---

## 3. Backend — Laravel (e-portal-uika-main)

### Struktur Direktori Backend

```
e-portal-uika-main/
├── app/
│   ├── Console/            # Artisan commands
│   ├── Exceptions/         # Exception handler
│   ├── Exports/            # Excel exports
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/        # API Controllers (11 controller)
│   │   │   └── ...         # Web Controllers
│   │   ├── Helper/         # ResponseBuilder, dll.
│   │   ├── Middleware/     # JwtMiddleware, dll.
│   │   └── Requests/       # Form Request Validation
│   ├── Imports/            # Excel imports
│   ├── Mail/               # Mailable classes
│   ├── Models/             # 11 Eloquent Models
│   ├── Providers/          # Service Providers
│   ├── Repositories/       # Repository Pattern
│   ├── Services/           # Business Logic Services
│   └── Traits/             # Shared Traits
├── database/
│   ├── migrations/         # 9 migration files
│   └── seeders/            # 3 seeders
└── routes/
    ├── api.php             # REST API routes
    └── web.php             # Web routes
```

### Models (Eloquent)

| Model | Tabel | Deskripsi |
|---|---|---|
| `User` | `users` | Pengguna sistem, implements `JWTSubject`, `MustVerifyEmail`, uses `HasRoles` |
| `Role` | `roles` | Extends Spatie `SpatieRole` |
| `Permission` | `permissions` | Extends Spatie Permission, memiliki `appModule_id` |
| `AppModule` | `app_module` | Modul aplikasi dalam ekosistem SSO |
| `ModelHasRole` | `model_has_roles` | Pivot user ↔ role (Spatie) |
| `RoleHasPermission` | `role_has_permissions` | Pivot role ↔ permission (Spatie) |
| `TxUserModulPermission` | `tx_user_module_permission` | Transaksi user, modul, role, permission |
| `LoginLog` | `user_login_logs` | Log setiap percobaan login |
| `UserActivityLog` | `user_activity_logs` | Log aktivitas pengguna (login, logout, update, dll.) |
| `Unit` | `units` | Unit/Fakultas/Prodi |
| `LinkItems` | `link_items` | Item tautan/shortcut di dashboard |

### API Controllers

| Controller | Path | Tanggung Jawab |
|---|---|---|
| `AuthController` | `Api/AuthController.php` | Login, register, logout, refresh token, Google OAuth, SSO redirect, reset password |
| `UserController` | `Api/UserController.php` | CRUD user, export/import Excel, toggle active, reset password, activity logs |
| `DashboardController` | `Api/DashboardController.php` | Statistik, chart aktif user, pertumbuhan user, heatmap login, distribusi role |
| `RoleController` | `Api/RoleController.php` | CRUD roles, assign/unassign role ke user |
| `PermissionController` | `Api/PermissionController.php` | CRUD permissions, bulk create/update/delete |
| `RoleHasPermissionController` | `Api/RoleHasPermissionController.php` | Assign, unassign, sync permission ke role |
| `AppModuleController` | `Api/AppModuleController.php` | CRUD App Modules (modul SSO) |
| `ProfileController` | `Api/ProfileController.php` | Show, update profil, ganti password |
| `LoginLogController` | `Api/LoginLogController.php` | Daftar log login, suspicious IPs, rate-limit status, purge logs |
| `MyModuleController` | `Api/MyModuleController.php` | Daftar modul yang bisa diakses user saat ini |
| `TxUserModulPermissionController` | `Api/TxUserModulPermissionController.php` | Daftar transaksi permission user per modul |

### Services

| Service | Tanggung Jawab |
|---|---|
| `ActivityLogService` | Mencatat log aktivitas user (login, logout, update_profile, change_password, reset_password, app_access) |
| `LoginLogService` | Rate-limiting login per IP & email, mencatat log sukses/gagal login |
| `UserAdminService` | Logika bisnis manajemen user oleh admin |
| `UserStatisticsService` | Statistik user untuk dashboard admin |

### Repositories

| Repository | Tanggung Jawab |
|---|---|
| `UserRepository` | Query user dengan filter, pagination, search |
| `LoginLogRepository` | Query log login, suspicious IPs, rate limit |
| `UserStatisticsRepository` | Statistik user: growth, heatmap, distribusi role |

### Middleware

| Middleware | Alias | Fungsi |
|---|---|---|
| `JwtMiddleware` | `jwt.verify` | Validasi JWT token dari header Authorization atau cookie `uika_sso_token` |
| `Authenticate` | `auth` | Autentikasi standar Laravel |
| `RedirectIfAuthenticated` | `guest` | Redirect jika sudah login |
| `VerifyCsrfToken` | – | CSRF protection |

---

## 4. Frontend — React (fe-eportal-uika)

### Struktur Direktori Frontend

```
fe-eportal-uika/src/
├── App.tsx                 # Root router
├── main.tsx                # Entry point + QueryClientProvider
├── components/
│   ├── layouts/
│   │   ├── AuthLayout/     # Layout untuk halaman auth (loader: cek sudah login?)
│   │   ├── MainLayout/     # Layout user biasa
│   │   └── AdminLayout/    # Layout khusus admin (loader: cek role admin)
│   ├── pages/
│   │   ├── Auth/           # Login, GoogleCallback
│   │   ├── Dashboard/      # Halaman dashboard user
│   │   ├── Profile/        # Halaman profil user
│   │   ├── ResetPassword/  # Halaman reset password
│   │   └── Admin/
│   │       ├── Admin.tsx           # Dashboard admin
│   │       ├── UserManagement/     # Manajemen user
│   │       ├── AppModules/         # Manajemen app modules
│   │       ├── Roles/              # Manajemen roles
│   │       ├── Permissions/        # Manajemen permissions
│   │       ├── RolePermissions/    # Assign permission ke role
│   │       └── LoginLog/           # Log keamanan login
│   └── ui/                 # Komponen UI reusable (Shadcn)
├── hooks/
│   ├── Auth/               # useLogin
│   ├── AppModules/         # Hook untuk App Modules
│   ├── Debounce/           # useDebounce
│   ├── LoginLog/           # Hook untuk login log
│   ├── Permissions/        # Hook untuk permissions
│   ├── Profile/            # Hook untuk profil
│   ├── RolePermissions/    # Hook untuk role-permission
│   ├── Roles/              # Hook untuk roles
│   ├── Table/              # Hook untuk tabel (pagination, filter)
│   └── UserManagement/     # Hook untuk user management
├── services/api/
│   ├── auth.ts             # API: login, logout, register, reset password
│   ├── admin.ts            # API: user management, app modules, roles, permissions
│   ├── dashboard.ts        # API: statistik dashboard
│   ├── security.ts         # API: login logs, suspicious IPs
│   ├── user.ts             # API: profil user
│   └── sso.ts              # API: SSO redirect
├── contexts/
│   └── AuthContext.tsx     # Context: user state, setUser, logout
├── config/                 # Konfigurasi global (axios base URL, dll.)
├── constants/              # Konstanta aplikasi
├── types/
│   └── general.type.ts     # TypeScript interfaces/types global
├── utils/
│   ├── network.ts          # Axios instance + interceptor
│   └── session.ts          # Manajemen token (cookie/localStorage)
└── validations/
    └── authValidation.ts   # Zod schema untuk form login/register
```

### Halaman & Routes

| Route | Halaman | Loader | Akses |
|---|---|---|---|
| `/` | Dashboard | `mainLoader` | Login required |
| `/profile` | Profile | `mainLoader` | Login required |
| `/login` | Login | `authLoader` | Guest only |
| `//auth/google/success` | GoogleCallback | – | Public |
| `/reset-password` | ResetPassword | – | Public |
| `/admin` | Admin Dashboard | `adminLoader` | Admin only |
| `/admin/user-management` | UserManagement | `adminLoader` | Admin only |
| `/admin/app-modules` | AppModules | `adminLoader` | Admin only |
| `/admin/roles` | Roles | `adminLoader` | Admin only |
| `/admin/permissions` | Permissions | `adminLoader` | Admin only |
| `/admin/role-permissions` | RolePermissions | `adminLoader` | Admin only |
| `/admin/log` | LoginLog | `adminLoader` | Admin only |

### State Management

| Concern | Solusi |
|---|---|
| Server state (API data) | **TanStack React Query** — fetching, caching, invalidation |
| Auth state | **React Context** (`AuthContext`) — user object, setUser, logout |
| Form state | **React Hook Form** + **Zod** validation |
| Token storage | **Cookie** `uika_sso_token` via `js-cookie` |
| Notifications | **React Hot Toast** + **Sonner** |

---

## 5. Skema Database

### Tabel `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | Primary key internal |
| `public_id` | uuid UNIQUE | UUID publik (digunakan di URL/JWT) |
| `name` | string | Nama lengkap |
| `email` | string UNIQUE | Email (login) |
| `nip` | string nullable UNIQUE | Nomor Induk Pegawai |
| `nidn` | string nullable UNIQUE | Nomor Induk Dosen Nasional |
| `npm` | string nullable UNIQUE | Nomor Pokok Mahasiswa |
| `role_id` | FK → roles | Role utama user |
| `is_active` | boolean | Status aktif (default: false) |
| `password` | string | Password hash |
| `phone` | bigint nullable | Nomor telepon |
| `location` | string nullable | Lokasi |
| `about_me` | string nullable | Bio singkat |
| `image` | text nullable | Foto profil |
| `email_verified_at` | timestamp nullable | Waktu verifikasi email |
| `last_login_at` | timestamp nullable | Waktu login terakhir |
| `deleted_at` | timestamp nullable | Soft delete |
| `timestamps` | – | created_at, updated_at |

### Tabel `app_module`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | – |
| `name` | string UNIQUE | Nama modul (misal: SIAKAD, E-Library) |
| `url` | string nullable | URL aplikasi tujuan SSO |
| `deleted_at` | timestamp nullable | Soft delete |
| `timestamps` | – | – |

### Tabel `permissions` (Spatie)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | – |
| `name` | string | Nama permission (misal: `siakad.view`) |
| `appModule_id` | integer nullable | Referensi ke `app_module.id` |
| `guard_name` | string | Guard (default: `web`) |
| `deleted_at` | timestamp nullable | – |

### Tabel `roles` (Spatie)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | – |
| `name` | string | Nama role (admin, user, dosen, mahasiswa) |
| `guard_name` | string | Guard (default: `web`) |
| `deleted_at` | timestamp nullable | – |

### Tabel `tx_user_module_permission`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | – |
| `user_id` | integer | Referensi user |
| `appModule_id` | integer | Referensi app_module |
| `role_id` | integer | Referensi role |
| `permission_id` | integer | Referensi permission |
| `deleted_at` | timestamp nullable | Soft delete |

### Tabel `user_login_logs`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | – |
| `user_id` | FK nullable | User yang login (null jika gagal dan user tidak diketahui) |
| `ip_address` | string(45) | IP address |
| `user_agent` | text nullable | User agent string |
| `browser` | string(100) nullable | Nama browser |
| `browser_version` | string(50) nullable | Versi browser |
| `platform` | string(100) nullable | OS/platform |
| `device_type` | enum | `desktop`, `mobile`, `tablet` |
| `status` | enum | `success`, `failed` |
| `failure_reason` | string(100) nullable | Alasan gagal login |
| `created_at` | timestamp | – |

### Tabel `user_activity_logs`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | – |
| `user_id` | bigint nullable | User yang dikenai aksi |
| `actor_id` | bigint nullable | Yang melakukan aksi (bisa admin) |
| `type` | string | `login`, `logout`, `update_profile`, `change_password`, `reset_password`, `app_access` |
| `description` | string | Deskripsi singkat |
| `metadata` | json nullable | Data tambahan (IP, browser, nama app, dll.) |
| `created_at` | timestamp | – |

### Relasi Tabel (ERD Sederhana)

```
users ──────────────┬──── model_has_roles ──── roles
                    │                            │
                    │                            └── role_has_permissions ──── permissions
                    │                                                              │
                    └──── tx_user_module_permission                               └── app_module
                    │
                    ├──── user_login_logs
                    └──── user_activity_logs
```

---

## 6. API Endpoints

### Public Routes (Tanpa Auth)

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/auth/login` | Login dengan email & password |
| POST | `/api/auth/login/tias` | Login via sistem TIAS |
| POST | `/api/register` | Registrasi user baru |
| POST | `/api/password/email` | Kirim link reset password |
| POST | `/api/password/reset` | Reset password dengan token |
| GET | `/api/auth/google/redirect` | Redirect ke Google OAuth |
| GET | `/api/auth/google/callback` | Callback dari Google OAuth |
| GET | `/api/email/verify/{id}/{hash}` | Verifikasi email |

### Protected Routes (JWT Required — `jwt.verify`)

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/logout` | Logout (invalidate token) |
| GET | `/api/get_user` | Ambil data user + permissions |
| GET | `/api/refresh` | Refresh JWT token |
| GET | `/api/app_modul` | Daftar semua app modules |
| GET | `/api/my-modules` | Modul yang bisa diakses user ini |
| GET | `/api/sso/redirect` | SSO redirect ke aplikasi lain |
| GET | `/api/profile` | Lihat profil sendiri |
| POST | `/api/profile/update` | Update profil |
| POST | `/api/profile/change-password` | Ganti password |

### Admin Routes (`role:admin` + JWT)

#### User Management (`/api/admins/`)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/admins` | Daftar semua user |
| POST | `/api/admins` | Buat user baru |
| GET | `/api/admins/{id}` | Detail user |
| POST/PUT | `/api/admins/{id}` | Update user |
| DELETE | `/api/admins/{id}` | Hapus user |
| PATCH | `/api/admins/{id}/toggle-active` | Aktifkan/nonaktifkan user |
| POST | `/api/admins/{id}/reset-password` | Reset password user |
| GET | `/api/admins/{id}/activity-logs` | Log aktivitas user |
| GET | `/api/admins/export` | Export user ke Excel |
| POST | `/api/admins/import` | Import user dari Excel |

#### Dashboard (`/api/admins/dashboard/`)
| Endpoint | Data |
|---|---|
| `stats` | Statistik total user, aktif, dll. |
| `active-users` | Chart user aktif |
| `user-growth` | Chart pertumbuhan user |
| `recent-activity` | Aktivitas terbaru |
| `idle-users` | User idle |
| `role-distribution` | Distribusi role |
| `login-heatmap` | Heatmap waktu login |
| `clear-cache` | Clear cache (super-admin only) |

#### Security / Log
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/admins/security/logs` | Daftar log login |
| GET | `/api/admins/security/logs/user/{id}` | Log login per user |
| GET | `/api/admins/security/suspicious-ips` | Daftar IP mencurigakan |
| GET | `/api/admins/security/rate-limit-status` | Status rate limit |
| DELETE | `/api/admins/security/logs/purge` | Hapus log lama |

#### App Modules, Roles, Permissions
| Method | Endpoint | Fungsi |
|---|---|---|
| GET/POST | `/api/admins/app-modules` | CRUD app modules |
| GET/PUT/DELETE | `/api/admins/app-modules/{id}` | Detail / update / hapus |
| GET/POST | `/api/admins/roles` | CRUD roles |
| POST | `/api/admins/roles/assign` | Assign role ke user |
| POST | `/api/admins/roles/unassign` | Unassign role dari user |
| GET/POST | `/api/admins/permissions` | CRUD permissions |
| POST | `/api/admins/permissions/bulk` | Bulk create permissions |
| PUT | `/api/admins/permissions/bulk` | Bulk update permissions |
| DELETE | `/api/admins/permissions/bulk` | Bulk delete permissions |
| GET | `/api/admins/role-permissions` | Daftar permission per role |
| POST | `/api/admins/role-permissions/assign` | Assign permission ke role |
| POST | `/api/admins/role-permissions/unassign` | Unassign permission dari role |
| POST | `/api/admins/role-permissions/sync` | Sync permissions ke role |

---

## 7. Sistem Autentikasi & SSO

### Alur Login Standar

```
1. User masukkan email + password di FE
2. FE kirim POST /api/auth/login
3. BE cek:
   a. Rate limit IP & email (LoginLogService)
   b. Email sudah diverifikasi?
   c. Credentials valid (JWTAuth::attempt)
4. Jika sukses:
   a. Generate JWT token
   b. Set cookie HttpOnly "uika_sso_token" (SameSite: Lax)
   c. Catat login log (sukses)
   d. Catat activity log (TYPE_LOGIN)
   e. Return user data + token
5. FE simpan token di session + setUser di AuthContext
6. Navigate ke "/"
```

### Alur Google OAuth

```
1. User klik "Login dengan Google"
2. FE redirect ke GET /api/auth/google/redirect
3. BE redirect ke Google OAuth page
4. Google redirect ke GET /api/auth/google/callback
5. BE ambil data Google User
6. Cek apakah email sudah terdaftar di sistem
   - Jika tidak: redirect ke /register?social_data=...
   - Jika ya: generate JWT, set cookie, redirect ke /auth/google/success
7. FE di halaman GoogleCallback: ambil token dari cookie, set ke session
```

### Alur SSO Redirect ke Aplikasi Lain

```
1. User klik modul (misal SIAKAD) di dashboard
2. FE panggil GET /api/sso/redirect?target_url=...&role_id=...&appModule_id=...
3. BE validasi JWT token (dari cookie atau bearer)
4. BE generate redirect URL:
   target_url?token=JWT&role_id=...&appModule_id=...&unit_id=...
5. FE redirect browser ke URL tersebut
6. Aplikasi tujuan terima token, verifikasi ke /api/get_user
   (atau /api/call_user untuk data lengkap dengan permission)
```

### JWT Middleware (JwtMiddleware)

- Cek Authorization header, jika kosong → ambil dari cookie `uika_sso_token`
- Parse token → authenticate user
- Return 401 jika: Token Invalid, Token Expired, Token Not Found

---

## 8. Modul RBAC (Role, Permission, AppModule)

### Roles yang Tersedia

| Role | Deskripsi | Permissions Default |
|---|---|---|
| `admin` | Administrator sistem | Semua permissions |
| `dosen` | Tenaga pengajar | `siakad.view`, `siakad.input_nilai`, `elibrary.view` |
| `mahasiswa` | Mahasiswa | `siakad.view`, `elibrary.view`, `elibrary.pinjam`, `finance.view` |
| `user` | User umum | `siakad.view`, `elibrary.view` |

### App Modules Default

| Key | Nama Modul | URL |
|---|---|---|
| `users` | Manajemen User | `/admin/user-management` |
| `roles` | Roles | `/admin/roles` |
| `permissions` | Permissions | `/admin/permissions` |
| `siakad` | SIAKAD (Akademik) | `http://localhost:8081/sso/callback` |
| `elibrary` | E-Library UIKA | `http://localhost:8082/sso/callback` |
| `finance` | Portal Keuangan | `http://localhost:8083/sso/callback` |

### Format Nama Permission

Format: `{module_key}.{action}`

Contoh:
- `users.view`, `users.create`, `users.edit`, `users.delete`
- `siakad.view`, `siakad.input_nilai`
- `elibrary.view`, `elibrary.pinjam`
- `finance.view`, `finance.bayar`

### Response `/api/get_user` — Permission Data

```json
{
  "data": {
    "name": "...",
    "role": "admin",
    "permissions": ["users.view", "siakad.view", ...],
    "permissions_by_module": {
      "1": ["users.view", "users.create"],
      "4": ["siakad.view", "siakad.input_nilai"]
    },
    "module_permissions": ["siakad.view"] // jika ?appModule_id=4
  }
}
```

---

## 9. Logging & Monitoring

### Login Log (`user_login_logs`)

Dicatat **setiap percobaan login** (sukses maupun gagal) oleh `LoginLogService`:

| Event | Status | failure_reason |
|---|---|---|
| Login berhasil | `success` | – |
| Kredensial salah | `failed` | `invalid_credentials` |
| Email belum verifikasi | `failed` | `email_not_verified` |

**Rate Limiting:**
- Jika IP melakukan banyak gagal login → IP diblokir sementara
- Jika email terdeteksi brute force → Email diblokir sementara
- Endpoint: `GET /api/admins/security/rate-limit-status`

### Activity Log (`user_activity_logs`)

Dicatat oleh `ActivityLogService` untuk semua aksi penting:

| Type Constant | Nilai | Kapan Dicatat |
|---|---|---|
| `TYPE_LOGIN` | `login` | Saat login berhasil |
| `TYPE_LOGOUT` | `logout` | Saat logout |
| `TYPE_UPDATE_PROFILE` | `update_profile` | Update profil |
| `TYPE_CHANGE_PASSWORD` | `change_password` | Ganti password |
| `TYPE_RESET_PASSWORD` | `reset_password` | Reset password |
| `TYPE_APP_ACCESS` | `app_access` | Akses aplikasi via SSO |

**Metadata yang disimpan:** IP address, user agent, nama browser, nama aplikasi yang diakses.

**Auto-purge:** Log lebih dari 180 hari dihapus otomatis (`purgeOldLogs(180)`).

---

## 10. Data Seeder (Default Data)

### Jalankan Seeder

```bash
php artisan db:seed
```

### UserSeeder — Akun Default

| Email | Password | Role |
|---|---|---|
| `admin@gmail.com` | `password` | admin |
| `dosen@gmail.com` | `password` | dosen |
| `mahasiswa@gmail.com` | `password` | mahasiswa |
| `user@gmail.com` | `password` | user |

### RolePermissionSeeder

Membuat:
1. **App Modules** (6 modul: users, roles, permissions, siakad, elibrary, finance)
2. **Permissions** berdasarkan kombinasi module + action
3. **Roles** (admin, user, dosen, mahasiswa)
4. **Assign permissions ke role** sesuai hak akses masing-masing

---

## 11. Alur Kerja Utama

### Alur Login → Dashboard → Akses SSO

```
[User] → Buka /login
       → Isi email & password
       → Submit form (useLogin hook + React Hook Form + Zod)
       → POST /api/auth/login
         ├─ Rate limit check (IP & email)
         ├─ Email verification check
         └─ JWT::attempt(credentials)
             ├─ [GAGAL] → toast.error(message)
             └─ [SUKSES] → set cookie "uika_sso_token"
                         → return user data + token
                         → FE: session.setToken(), setUser(), navigate("/")
                         → [Dashboard]
                             → GET /api/my-modules → Tampilkan daftar modul
                             → Klik modul
                             → GET /api/sso/redirect?target_url=...
                             → Redirect ke aplikasi tujuan dengan token
```

### Alur Admin — Manajemen Permission

```
[Admin] → /admin/role-permissions
        → Pilih Role
        → GET /api/admins/role-permissions?role_id=X
        → Tampilkan matrix permission
        → Centang/hapus permission
        → POST /api/admins/role-permissions/sync
          { role_id: X, permission_ids: [...] }
        → Spatie syncPermissions(...)
        → Response sukses
```

---

## 🔑 Variabel Environment Penting

### Backend (`e-portal-uika-main/.env`)

```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_DATABASE=e_portal_uika

JWT_SECRET=...
JWT_TTL=1440

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

MAIL_MAILER=smtp
MAIL_HOST=...
```

### Frontend (`fe-eportal-uika/.env`)

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 Cara Menjalankan Sistem

### Backend

```bash
# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# Migrasi + Seeder
php artisan migrate --seed

# Jalankan server
php artisan serve
# → http://localhost:8000
```

### Frontend

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev
# → http://localhost:5173
```

---

*Dokumentasi ini dibuat secara otomatis dari analisis kode sumber pada: **24 Mei 2026***
