import { queryClient } from "@/lib/QueryClient";
import auth from "@/services/api/auth";
import { redirect } from "react-router-dom";

export default async function adminLoader() {
  try {
    const dataProfile = await queryClient.ensureQueryData({
      queryKey: ["Profile"],
      queryFn: async () => {
        const result = await auth.getUser(); // kalau 401, langsung ke catch
        return result.data.data;
      },
    });

    const isAllowed = dataProfile.role?.toLowerCase() === "admin";
    if (!isAllowed) return redirect("/");

    return dataProfile;
  } catch {
    return redirect("/login");
  }
}
