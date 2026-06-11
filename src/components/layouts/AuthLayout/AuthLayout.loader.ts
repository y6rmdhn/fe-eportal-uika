import { queryClient } from "@/lib/QueryClient";
import auth from "@/services/api/auth";
import { redirect } from "react-router-dom";

export default async function authLoader() {
  try {
    await queryClient.ensureQueryData({
      queryKey: ["Profile"],
      queryFn: () => auth.getUser().then((r) => r.data.data),
      staleTime: 5 * 60 * 1000,
    });
    return redirect("/");
  } catch {
    return null;
  }
}
