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

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      loader: mainLoader,
      element: <Dashboard />,
    },
    {
      path: "/login",
      loader: authLoader,
      element: <Login />,
    },
    {
      path: "//auth/google/success",
      element: <GoogleCallback />,
    },
    // {
    //   path: "/register",
    //   loader: authLoader,
    //   element: <Register />,
    // },
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
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
