import { createBrowserRouter, RouterProvider } from "react-router-dom";
import authLoader from "@/components/layouts/AuthLayout/AuthLayout.loader.ts";
import adminLoader from "./components/layouts/AdminLayout/AdminLayout.loader";
import mainLoader from "./components/layouts/MainLayout/MainLayout.loader";
import Login from "./components/pages/Auth/Login";

/**
 * Halaman dimuat lewat route-level `lazy` (React Router v7) supaya tiap
 * halaman jadi chunk terpisah. Hanya Login yang di-import statis karena
 * itu layar pertama yang dilihat hampir semua pengguna — memecahnya justru
 * menambah satu round-trip sebelum form login tampil.
 */
const page = (loader: () => Promise<{ default: React.ComponentType }>) => async () => {
  const { default: Component } = await loader();
  return { Component };
};

const router = createBrowserRouter(
  [
    {
      path: "/",
      loader: mainLoader,
      lazy: page(() => import("./components/pages/Dashboard")),
    },
    {
      path: "/profile",
      loader: mainLoader,
      lazy: page(() => import("./components/pages/Profile")),
    },
    {
      path: "/login",
      loader: authLoader,
      element: <Login />,
    },
    {
      path: "/auth/google/success",
      lazy: page(() => import("./components/pages/Auth/GoogleCallback")),
    },
    {
      path: "/register",
      lazy: page(() => import("./components/pages/Auth/Register")),
    },
    {
      path: "/reset-password",
      lazy: page(() => import("./components/pages/ResetPassword")),
    },
    {
      path: "/admin",
      loader: adminLoader,
      lazy: page(() => import("./components/pages/Admin/Admin")),
    },
    {
      path: "/admin/user-management",
      loader: adminLoader,
      lazy: page(() => import("./components/pages/Admin/UserManagement")),
    },
    {
      path: "/admin/app-modules",
      loader: adminLoader,
      lazy: page(() => import("./components/pages/Admin/AppModules")),
    },
    {
      path: "/admin/roles",
      loader: adminLoader,
      lazy: page(() => import("./components/pages/Admin/Roles")),
    },
    {
      path: "/admin/permissions",
      loader: adminLoader,
      lazy: page(() => import("./components/pages/Admin/Permissions")),
    },
    {
      path: "/admin/role-permissions",
      loader: adminLoader,
      lazy: page(() => import("./components/pages/Admin/RolePermissions")),
    },
    {
      path: "/admin/log",
      loader: adminLoader,
      lazy: page(() => import("./components/pages/Admin/LoginLog")),
    },
    {
      path: "/admin/sso-keys",
      loader: adminLoader,
      lazy: page(() => import("./components/pages/Admin/SsoKeys")),
    },
    {
      path: "/admin/units",
      loader: adminLoader,
      lazy: page(() => import("./components/pages/Admin/Units")),
    },
  ],
  {
    basename: "/",
  },
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
