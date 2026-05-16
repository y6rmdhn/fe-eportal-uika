import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Menu, UserCircle, LogOut, Home } from "lucide-react";
import AdminLayoutSidebar from "./AdminLayoutSidebar";
import { SIDEBAR_ADMIN } from "@/constants/AdminConstant";
import PageHead from "@/common/PageHead";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/Auth/useLogout";
import useAdminProfile from "@/hooks/Profile/useAdminProfile";

interface PropsType {
  title?: string;
  children: ReactNode;
  desc?: string;
}

const AdminLayout = (props: PropsType) => {
  const { title, desc, children } = props;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { handleLogout, isPendingLogout } = useLogout();
  const { adminProfile } = useAdminProfile();

  return (
    <>
      <PageHead title={title} />
      <div className="flex h-screen bg-[#fbfcfb] overflow-hidden font-sans">
        <AdminLayoutSidebar
          isOpen={open}
          onClose={() => setOpen(false)}
          sidebarItems={SIDEBAR_ADMIN}
        />

        <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
          <header className="flex-shrink-0 px-4 py-3 sm:px-8 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 sticky top-0">
            <div className="flex justify-between items-center h-12">
              {/* Kiri */}
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  onClick={() => setOpen(true)}
                >
                  <Menu size={22} />
                </Button>
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight truncate max-w-[200px] sm:max-w-none">
                    {desc || "Dashboard"}
                  </h1>
                </div>
              </div>

              {/* Kanan — Avatar + Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                    <div className="hidden sm:flex flex-col items-end">
                      <h3 className="text-sm font-bold text-gray-900">
                        {adminProfile?.name ?? "Administrator"}
                      </h3>
                      <p className="text-[11px] text-emerald-600 font-semibold tracking-wide uppercase capitalize">
                        {adminProfile?.role ?? "Admin"}
                      </p>
                    </div>
                    <Avatar className="w-10 h-10 rounded-xl">
                      <AvatarImage
                        src={adminProfile?.image ?? undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-xl bg-emerald-50 text-emerald-600 font-extrabold text-sm">
                        {adminProfile?.name?.charAt(0)?.toUpperCase() ?? "A"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-xl border-gray-100 shadow-lg"
                >
                  <DropdownMenuLabel className="flex flex-col gap-0.5 px-3 py-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {adminProfile?.name ?? "Administrator"}
                    </span>
                    <span className="text-xs text-gray-400 font-normal">
                      {adminProfile?.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/")}
                    className="gap-2 cursor-pointer rounded-lg mx-1 font-medium text-gray-700"
                  >
                    <Home size={15} />
                    Dashboard Utama
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/admin/profile")}
                    className="gap-2 cursor-pointer rounded-lg mx-1 font-medium text-gray-700"
                  >
                    <UserCircle size={15} />
                    Profile Saya
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isPendingLogout}
                    className="gap-2 cursor-pointer rounded-lg mx-1 mb-1 font-medium text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                  >
                    <LogOut size={15} />
                    {isPendingLogout ? "Keluar..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth relative">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50/50 to-transparent -z-10" />
            <div className="max-w-7xl mx-auto h-full">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
