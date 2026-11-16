import auth from "@/services/api/auth";
import session from "@/utils/session";
import { createContext, useContext, useState, type ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = async () => {
    setUser(null);

    // Tunggu logout server (back-channel ke UCL/SIAKAD/dll) maksimal 4 detik
    // SEBELUM pindah halaman. Sebelumnya request di-"fire and forget" lalu
    // langsung redirect, sehingga browser bisa membatalkan request dan aplikasi
    // lain tidak pernah tahu user sudah keluar (sesi/cache lama tertahan).
    try {
      await Promise.race([
        auth.logout().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
    } finally {
      session.clearSession();
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
};
