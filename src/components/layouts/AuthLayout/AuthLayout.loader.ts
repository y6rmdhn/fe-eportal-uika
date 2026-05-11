import { queryClient } from "@/lib/QueryClient";
import auth from "@/services/api/auth";
import { redirect } from "react-router-dom";

// authLoader.ts — redirect kalau sudah login
export default async function authLoader() {
  try {
    await queryClient.ensureQueryData({
      queryKey: ["Profile"],
      queryFn: () => auth.getUser().then((r) => r.data.data),
    });
    return redirect("/"); // sudah login, jangan bisa buka /login lagi
  } catch {
    return null; // belum login, boleh lanjut ke halaman login
  }
}
