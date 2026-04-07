import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./components/pages/Dashboard";
import Register from "./components/pages/Auth/Register";
import Login from "./components/pages/Auth/Login";
import authLoader from "@/components/layouts/AuthLayout/AuthLayout.loader.ts";
import ResetPassword from "@/components/pages/ResetPassword";
import GoogleCallback from "@/components/pages/Auth/GoogleCallback";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
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
    {
      path: "/register",
      loader: authLoader,
      element: <Register />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
