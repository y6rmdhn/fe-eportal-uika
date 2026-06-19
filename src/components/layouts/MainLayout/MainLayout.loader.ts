import { queryClient } from "@/lib/QueryClient";
import auth from "@/services/api/auth";
import { redirect } from "react-router-dom";

// dashboardLoader.ts — proteksi route "/"
export default async function mainLoader() {
  try {
    const dataProfile = await queryClient.ensureQueryData({
      queryKey: ["Profile"],
      queryFn: () => auth.getUser().then((r) => r.data.data),
      staleTime: 5 * 60 * 1000, // cache 5 menit
    });
    return dataProfile;
  } catch {
    return redirect("/login");
  }
}
