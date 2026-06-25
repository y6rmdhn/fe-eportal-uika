import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./components/pages/Dashboard";
import Login from "./components/pages/Auth/Login";
import authLoader from "@/components/layouts/AuthLayout/AuthLayout.loader.ts";
import ResetPassword from "@/components/pages/ResetPassword";
import GoogleCallback from "@/components/pages/Auth/GoogleCallback";
import adminLoader from "./components/layouts/AdminLayout/AdminLayout.loader";
import AdminDashboard from "./components/pages/Admin/Admin";
import mainLoader from "./components/layouts/MainLayout/MainLayout.loader";
import UserManagement from "./components/pages/Admin/UserManagement";
import LoginLog from "./components/pages/Admin/LoginLog";
import Profile from "./components/pages/Profile";
import AppModules from "./components/pages/Admin/AppModules";
import Roles from "./components/pages/Admin/Roles";
import Permissions from "./components/pages/Admin/Permissions";
import RolePermissions from "./components/pages/Admin/RolePermissions";
import SsoKeys from "./components/pages/Admin/SsoKeys";
import Register from "./components/pages/Auth/Register";

function App() {
  const router = createBrowserRouter(
    [
      {
        path: "/",
        loader: mainLoader,
        element: <Dashboard />,
      },
      {
        path: "/profile",
        loader: mainLoader,
        element: <Profile />,
      },
      {
        path: "/login",
        loader: authLoader,
        element: <Login />,
      },
      {
        path: "/auth/google/success",
        element: <GoogleCallback />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/admin",
        loader: adminLoader,
        element: <AdminDashboard />,
      },
      {
        path: "/admin/user-management",
        loader: adminLoader,
        element: <UserManagement />,
      },
      {
        path: "/admin/app-modules",
        loader: adminLoader,
        element: <AppModules />,
      },
      {
        path: "/admin/roles",
        loader: adminLoader,
        element: <Roles />,
      },
      {
        path: "/admin/permissions",
        loader: adminLoader,
        element: <Permissions />,
      },
      {
        path: "/admin/role-permissions",
        loader: adminLoader,
        element: <RolePermissions />,
      },
      {
        path: "/admin/log",
        loader: adminLoader,
        element: <LoginLog />,
      },
      {
        path: "/admin/sso-keys",
        loader: adminLoader,
        element: <SsoKeys />,
      },
    ],
    {
      basename: "/eportal",
    },
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
