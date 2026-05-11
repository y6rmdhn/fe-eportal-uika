import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import type { JSX } from "react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/Auth/useLogout";

const LOGO = "/img/LOGO_UIKA_Terbaru2 (2).png";

interface SidebarItem {
  key: string;
  label: string;
  href: string;
  icon: JSX.Element;
}

interface PropsType {
  sidebarItems?: SidebarItem[];
  isOpen: boolean;
  onClose: () => void;
}

const AdminLayoutSidebar = (props: PropsType) => {
  const { isOpen, sidebarItems = [], onClose } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout, isPendingLogout } = useLogout();

  return (
    <>
      {/* --- Overlay Mobile --- */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-emerald-950/40 backdrop-blur-sm transition-all duration-300 lg:hidden",
          {
            "opacity-100 visible": isOpen,
            "opacity-0 invisible": !isOpen,
          },
        )}
        onClick={onClose}
      />

      {/* --- Sidebar Container --- */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-[280px] flex-col justify-between border-r border-gray-100 bg-white px-5 py-6 transition-transform duration-300 ease-in-out lg:static lg:w-[280px] lg:translate-x-0",
          {
            "translate-x-0 shadow-2xl shadow-emerald-900/10": isOpen,
            "-translate-x-full": !isOpen,
          },
        )}
      >
        {/* Header Sidebar */}
        <div className="w-full relative flex flex-col">
          {/* Tombol Close (Mobile Only) */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 -top-2 lg:hidden text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </Button>

          {/* Logo & Judul UIKA */}
          <div
            className="flex w-full items-center mb-8 gap-3 mt-2 lg:mt-0 cursor-pointer group px-2"
            onClick={() => {
              navigate("/");
              onClose();
            }}
          >
            <img
              src={LOGO}
              alt="Logo UIKA"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
            />
            <div className="flex flex-col">
              <p className="text-base font-extrabold text-gray-900 tracking-tight leading-none">
                E-PORTAL
              </p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Menu List */}
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-2">
              Menu Utama
            </p>
            {sidebarItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/admin" &&
                  location.pathname.startsWith(item.href));

              return (
                <Button
                  key={item.key}
                  variant="ghost"
                  className={cn(
                    "flex justify-start items-center w-full h-11 px-3.5 rounded-xl transition-all duration-300 group",
                    {
                      // Active State: Hijau Emerald dengan shadow lembut
                      "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:text-white":
                        isActive,
                      // Inactive State: Bersih, hover jadi abu/hijau super muda
                      "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700":
                        !isActive,
                    },
                  )}
                  onClick={() => {
                    navigate(item.href);
                    onClose();
                  }}
                >
                  <span
                    className={cn("mr-3 transition-colors duration-300", {
                      "text-white": isActive,
                      "text-gray-400 group-hover:text-emerald-600": !isActive,
                    })}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[14px] font-semibold tracking-wide">
                    {item.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Footer Sidebar (Logout) */}
        <div className="flex flex-col pt-6 border-t border-gray-100 mt-4">
          <Button
            variant="ghost"
            className="flex justify-start items-center w-full h-11 px-3.5 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
            onClick={handleLogout}
            disabled={isPendingLogout}
          >
            <LogOut size={20} className="mr-3" />
            <span className="text-[14px] font-semibold tracking-wide">
              {isPendingLogout ? "Keluar..." : "Logout"}
            </span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminLayoutSidebar;
