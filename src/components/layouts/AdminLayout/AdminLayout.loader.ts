import { queryClient } from "@/lib/QueryClient";
import auth from "@/services/api/auth";
import { redirect } from "react-router-dom";

export default async function adminLoader() {
  try {
    const dataProfile = await queryClient.ensureQueryData({
      queryKey: ["Profile"],
      queryFn: async () => {
        const result = await auth.getUser();
        return result.data.data;
      },
      staleTime: 5 * 60 * 1000, // cache 5 menit
    });

    const isAllowed = dataProfile.role?.toLowerCase() === "admin";
    if (!isAllowed) return redirect("/");

    return dataProfile;
  } catch {
    return redirect("/login");
  }
}
