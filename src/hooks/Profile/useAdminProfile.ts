import { useQuery } from "@tanstack/react-query";
import user from "@/services/api/user";

const useAdminProfile = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const response = await user.getProfile();
      return response.data.data;
    },
  });

  return { adminProfile: data, isLoadingAdminProfile: isLoading };
};

export default useAdminProfile;
