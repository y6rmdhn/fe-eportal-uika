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

  // Di AuthContext atau useLogout hook
  const logout = async () => {
    setUser(null); // hapus state dulu
    session.clearSession(); // hapus cookie FE dulu

    // Fire and forget — tidak perlu tunggu response
    auth.logout().catch(() => {});

    // Baru redirect — tidak lewat interceptor
    window.location.href = "/eportal/login";
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
