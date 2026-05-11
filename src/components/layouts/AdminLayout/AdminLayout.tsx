import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import AdminLayoutSidebar from "./AdminLayoutSidebar";
import { SIDEBAR_ADMIN } from "@/constants/AdminConstant";
import PageHead from "@/common/PageHead";

interface PropsType {
  title?: string;
  children: ReactNode;
  type?: string;
  desc?: string;
  userName?: string;
}

const AdminLayout = (props: PropsType) => {
  const { title, desc, children, userName = "Admin UIKA" } = props;
  const [open, setOpen] = useState(false);

  // Ambil inisial nama untuk Avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "A";

  return (
    <>
      <PageHead title={title} />

      {/* Background utama dibikin off-white/sangat bersih agar konten menonjol */}
      <div className="flex h-screen bg-[#fbfcfb] overflow-hidden font-sans">
        {/* Sidebar Component */}
        <AdminLayoutSidebar
          isOpen={open}
          onClose={() => setOpen(false)}
          sidebarItems={SIDEBAR_ADMIN}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
          {/* Header Dashboard (Desktop & Mobile) - Efek Glassmorphism */}
          <header className="flex-shrink-0 px-4 py-3 sm:px-8 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 sticky top-0">
            <div className="flex justify-between items-center h-12">
              {/* Bagian Kiri Header (Hamburger & Judul Halaman) */}
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

              {/* Bagian Kanan Header (Profile Info) */}
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="hidden sm:flex flex-col items-end">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {userName}
                  </h3>
                  <p className="text-[11px] text-emerald-600 font-semibold tracking-wide uppercase">
                    Administrator
                  </p>
                </div>

                {/* Avatar dengan nuansa modern */}
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold text-sm shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                  {userInitial}
                </div>
              </div>
            </div>
          </header>

          {/* Area Konten Utama (Scrollable) */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth relative">
            {/* Dekorasi halus di background konten (opsional, biar gak terlalu sepi) */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50/50 to-transparent -z-10" />

            <div className="max-w-7xl mx-auto h-full">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
