import { queryClient } from "@/lib/QueryClient";
import auth from "@/services/api/auth";
import { redirect } from "react-router-dom";

// dashboardLoader.ts — proteksi route "/"
export default async function mainLoader() {
  try {
    const dataProfile = await queryClient.ensureQueryData({
      queryKey: ["Profile"],
      queryFn: () => auth.getUser().then((r) => r.data.data),
    });
    return dataProfile;
  } catch {
    return redirect("/login");
  }
}
